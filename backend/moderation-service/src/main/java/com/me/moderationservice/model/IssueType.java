package com.me.moderationservice.model;

import lombok.Getter;

@Getter
public enum IssueType {
    FAKE_OR_MISLEADING_PRODUCE(UserReport.RiskLevel.LOW),
    INCORRECT_WEIGHT_OR_QUANTITY(UserReport.RiskLevel.LOW),
    UNFAIR_PRICE_MANIPULATION(UserReport.RiskLevel.MEDIUM),
    UNSAFE_CHEMICAL_USE(UserReport.RiskLevel.HIGH),
    NON_DELIVERY_AFTER_PAYMENT(UserReport.RiskLevel.HIGH),
    OTHER(UserReport.RiskLevel.LOW);

    private final UserReport.RiskLevel riskLevel;

    IssueType(UserReport.RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }
}