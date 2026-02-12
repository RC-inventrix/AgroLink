package com.agrolink.auctionservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Embeddable class for delivery address information.
 * Matches the address structure used in the identity service.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAddress {

    @Column(name = "delivery_street_address")
    private String streetAddress;

    @Column(name = "delivery_city")
    private String city;

    @Column(name = "delivery_district")
    private String district;

    @Column(name = "delivery_province")
    private String province;

    @Column(name = "delivery_zipcode")
    private String zipcode;

    @Column(name = "delivery_latitude")
    private Double latitude;

    @Column(name = "delivery_longitude")
    private Double longitude;
}
