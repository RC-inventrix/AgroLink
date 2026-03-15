/* fileName: src/test/java/com/agrolink/auctionservice/controller/AuctionControllerTest.java */
package com.agrolink.auctionservice;

import com.agrolink.auctionservice.controller.AuctionController;
import com.agrolink.auctionservice.dto.BuyerAuctionActivity;
import com.agrolink.auctionservice.service.AuctionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuctionControllerTest {

    @Mock
    private AuctionService auctionService;

    @InjectMocks
    private AuctionController auctionController;

    private List<BuyerAuctionActivity> mockActivityList;

    @BeforeEach
    void setUp() {
        BuyerAuctionActivity activity = BuyerAuctionActivity.builder()
                .auctionId(1L)
                .productName("Test Veg")
                .build();
        mockActivityList = Collections.singletonList(activity);
    }

    @Test
    void getBuyerActivity_shouldReturnActivityList() {
        Long buyerId = 3L;
        when(auctionService.getBuyerAuctionActivity(buyerId)).thenReturn(mockActivityList);

        // Since the controller uses an array of paths {@GetMapping({"/buyer/{buyerId}", "/buyer/{buyerId}/activity"})}
        // Calling the method directly simulates a hit on either of those mapped routes.
        ResponseEntity<List<BuyerAuctionActivity>> response = auctionController.getBuyerActivity(buyerId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getProductName()).isEqualTo("Test Veg");

        verify(auctionService).getBuyerAuctionActivity(buyerId);
    }
}