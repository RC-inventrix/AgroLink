/* fileName: src/test/java/com/agrolink/auctionservice/service/AuctionServiceTest.java */
package com.agrolink.auctionservice;

import com.agrolink.auctionservice.client.UserServiceClient;
import com.agrolink.auctionservice.dto.BidResponse;
import com.agrolink.auctionservice.dto.PlaceBidRequest;
import com.agrolink.auctionservice.dto.UserResponseDto;
import com.agrolink.auctionservice.model.Auction;
import com.agrolink.auctionservice.model.AuctionStatus;
import com.agrolink.auctionservice.model.Bid;
import com.agrolink.auctionservice.model.DeliveryAddress;
import com.agrolink.auctionservice.repository.AuctionRepository;
import com.agrolink.auctionservice.repository.BidRepository;
import com.agrolink.auctionservice.service.AuctionService;
import com.agrolink.auctionservice.service.OrderIntegrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
        // Simulate Identity Service returning null (Unauthorized or unreachable)
        when(userServiceClient.getUserById(1L)).thenReturn(null);

        assertThatThrownBy(() -> auctionService.placeBid(10L, validBidRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Bid rejected: User verification failed (Identity Service unreachable or Unauthorized).");

        verify(auctionRepository, never()).findById(any());
        verify(bidRepository, never()).save(any());
    }

    @Test
    void placeBid_shouldSucceed_whenUserIsVerifiedAndBidIsHigher() {
        // 1. Mock valid user from Identity Service
        UserResponseDto mockUser = new UserResponseDto();
        mockUser.setId(1L);
        mockUser.setFullname("Verified Buyer");
        mockUser.setEmail("buyer@test.com");
        when(userServiceClient.getUserById(1L)).thenReturn(mockUser);

        // 2. Mock active auction
        when(auctionRepository.findById(10L)).thenReturn(Optional.of(activeAuction));

        // 3. Mock bid saving
        Bid savedBid = new Bid();
        savedBid.setId(100L);
        savedBid.setAuction(activeAuction);
        savedBid.setBidderId(1L);
        savedBid.setBidAmount(validBidRequest.getBidAmount());
        when(bidRepository.save(any(Bid.class))).thenReturn(savedBid);

        // Execute
        BidResponse response = auctionService.placeBid(10L, validBidRequest);

        // Verify
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

        // Make the new bid lower than current highest (4000.00)
        validBidRequest.setBidAmount(new BigDecimal("3000.00"));

        assertThatThrownBy(() -> auctionService.placeBid(10L, validBidRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Bid amount must be greater than current highest bid");
    }
}