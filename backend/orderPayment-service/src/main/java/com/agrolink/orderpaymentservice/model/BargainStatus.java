package com.agrolink.orderpaymentservice.model;

public enum BargainStatus {
    PENDING,    // Request sent by buyer, waiting for seller
    ACCEPTED,   // Seller agreed to the price
    REJECTED    // Seller declined the price
}