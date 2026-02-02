package com.agrolink.orderpaymentservice.model;

public enum OrderStatus {
    CREATED,        // Initial state
    PAID,           // Paid online
    COD_CONFIRMED,  // Cash on Delivery confirmed
    PROCESSING,     // Seller accepted the order
    COMPLETED,       // Seller fulfilled the order
    CANCELLED       // Order has been cancelled
}