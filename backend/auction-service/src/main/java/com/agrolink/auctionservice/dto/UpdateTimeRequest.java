package com.agrolink.auctionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTimeRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}