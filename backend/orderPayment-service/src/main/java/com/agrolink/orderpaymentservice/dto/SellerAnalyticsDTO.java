package com.agrolink.orderpaymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerAnalyticsDTO {
    private Long totalCompletedIncome;
    private long totalPendingOrders;
    private long totalCompletedOrders;
}
