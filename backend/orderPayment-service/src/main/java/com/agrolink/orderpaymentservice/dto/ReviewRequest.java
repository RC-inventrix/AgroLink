package com.agrolink.orderpaymentservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {
    private Integer rating;
    private String comment;
}
