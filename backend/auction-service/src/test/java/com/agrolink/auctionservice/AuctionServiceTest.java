/* fileName: src/test/java/com/agrolink/auctionservice/service/AuctionServiceTest.java */
package com.agrolink.auctionservice.service;

import com.agrolink.auctionservice.client.UserServiceClient;
import com.agrolink.auctionservice.dto.AuctionResponse;
import com.agrolink.auctionservice.dto.BidResponse;
import com.agrolink.auctionservice.dto.PlaceBidRequest;
import com.agrolink.auctionservice.dto.UserResponseDto;
import com.agrolink.auctionservice.model.Auction;
import com.agrolink.auctionservice.model.AuctionStatus;
import com.agrolink.auctionservice.model.Bid;
import com.agrolink.auctionservice.model.DeliveryAddress;
import com.agrolink.auctionservice.repository.AuctionRepository;
import com.agrolink.auctionservice.repository.BidRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuctionServiceTest {

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private BidRepository bidRepository;

    @Mock
    private OrderIntegrationService orderIntegrationService;

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private AuctionService auctionService;

    private PlaceBidRequest validBidRequest;
    private Auction activeAuction;

    @BeforeEach
    void setUp() {
        validBidRequest = new PlaceBidRequest();
        validBidRequest.setBidderId(1L);
        validBidRequest.setBidAmount(new BigDecimal("5000.00"));
        validBidRequest.setDeliveryAddress(new DeliveryAddress());

        activeAuction = new Auction();
        activeAuction.setId(10L);
        activeAuction.setStatus(AuctionStatus.ACTIVE);
        activeAuction.setEndTime(LocalDateTime.now().plusDays(1));
        activeAuction.setStartingPrice(new BigDecimal("1000.00"));
        activeAuction.setCurrentHighestBidAmount(new BigDecimal("4000.00"));
    }

    @Test
    void placeBid_shouldThrowException_whenIdentityServiceFails() {
        when(userServiceClient.getUserById(1L)).thenReturn(null);

        assertThatThrownBy(() -> auctionService.placeBid(10L, validBidRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Bid rejected: User verification failed (Identity Service unreachable or Unauthorized).");

        verify(auctionRepository, never()).findById(any());
        verify(bidRepository, never()).save(any());
    }

    @Test
    void placeBid_shouldSucceed_whenUserIsVerifiedAndBidIsHigher() {
        UserResponseDto mockUser = new UserResponseDto();
        mockUser.setId(1L);
        mockUser.setFullname("Verified Buyer");
        mockUser.setEmail("buyer@test.com");
        when(userServiceClient.getUserById(1L)).thenReturn(mockUser);

        when(auctionRepository.findById(10L)).thenReturn(Optional.of(activeAuction));

        Bid savedBid = new Bid();
        savedBid.setId(100L);
        savedBid.setAuction(activeAuction);
        savedBid.setBidderId(1L);
        savedBid.setBidAmount(validBidRequest.getBidAmount());
        when(bidRepository.save(any(Bid.class))).thenReturn(savedBid);

        BidResponse response = auctionService.placeBid(10L, validBidRequest);

        assertThat(response).isNotNull();
        assertThat(response.getBidAmount()).isEqualTo(new BigDecimal("5000.00"));
        assertThat(activeAuction.getCurrentHighestBidAmount()).isEqualTo(new BigDecimal("5000.00"));

        verify(auctionRepository).save(activeAuction);
        verify(bidRepository).save(any(Bid.class));
    }

    @Test
    void placeBid_shouldThrowException_whenBidIsTooLow() {
        UserResponseDto mockUser = new UserResponseDto();
        mockUser.setId(1L);
        when(userServiceClient.getUserById(1L)).thenReturn(mockUser);

        when(auctionRepository.findById(10L)).thenReturn(Optional.of(activeAuction));

        validBidRequest.setBidAmount(new BigDecimal("3000.00"));

        assertThatThrownBy(() -> auctionService.placeBid(10L, validBidRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Bid amount must be greater than current highest bid");
    }

    @Test
    void getAuctionById_shouldReturnAuctionWithTopBids() {
        when(auctionRepository.findById(10L)).thenReturn(Optional.of(activeAuction));

        Bid highestBid = new Bid();
        highestBid.setId(101L);
        highestBid.setAuction(activeAuction);
        highestBid.setBidderName("Top Bidder");
        highestBid.setBidAmount(new BigDecimal("4000.00"));

        Bid secondBid = new Bid();
        secondBid.setId(100L);
        secondBid.setAuction(activeAuction);
        secondBid.setBidderName("Second Bidder");
        secondBid.setBidAmount(new BigDecimal("3500.00"));

        List<Bid> mockTopBids = Arrays.asList(highestBid, secondBid);

        when(bidRepository.findTopBidsByAuctionId(10L)).thenReturn(mockTopBids);
        when(bidRepository.countByAuctionId(10L)).thenReturn(2L);

        AuctionResponse response = auctionService.getAuctionById(10L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getTotalBidCount()).isEqualTo(2);

        assertThat(response.getTopBids()).hasSize(2);
        assertThat(response.getTopBids().get(0).getBidAmount()).isEqualTo(new BigDecimal("4000.00"));
        assertThat(response.getTopBids().get(0).getBidderName()).isEqualTo("Top Bidder");

        verify(bidRepository).findTopBidsByAuctionId(10L);
        verify(bidRepository).countByAuctionId(10L);
    }

    @Test
    void getAuctionById_shouldThrowException_whenAuctionNotFound() {
        when(auctionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> auctionService.getAuctionById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Auction not found with id: 99");

        verify(bidRepository, never()).findTopBidsByAuctionId(anyLong());
    }
}