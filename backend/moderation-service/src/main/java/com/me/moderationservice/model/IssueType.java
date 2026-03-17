package com.me.moderationservice.model;

import lombok.Getter;

@Getter
public enum IssueType {
    // --- Buyer Reporting Farmer (Produce/Quality Issues) ---
    FAKE_OR_MISLEADING_PRODUCE(UserReport.RiskLevel.LOW),
    INCORRECT_WEIGHT_OR_QUANTITY(UserReport.RiskLevel.LOW),
    UNFAIR_PRICE_MANIPULATION(UserReport.RiskLevel.MEDIUM),
    UNAVAILABLE_ON_PICKUP(UserReport.RiskLevel.HIGH),
    NON_DELIVERY_AFTER_PAYMENT(UserReport.RiskLevel.HIGH),

    // --- Farmer Reporting Buyer (Commercial/Behavioral Issues) ---
    PAYMENT_DELAY_OR_DEFAULT(UserReport.RiskLevel.HIGH),
    UNFAIR_BARGAINING_AFTER_DELIVERY(UserReport.RiskLevel.MEDIUM),
    GHOSTING_NON_COLLECTION(UserReport.RiskLevel.MEDIUM),
    UNAVAILABLE_ON_DELIVERY(UserReport.RiskLevel.HIGH),
    FRAUDULENT_ORDER(UserReport.RiskLevel.HIGH),

    // --- General ---
    OTHER(UserReport.RiskLevel.LOW);

    private final UserReport.RiskLevel riskLevel;

    IssueType(UserReport.RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }
}