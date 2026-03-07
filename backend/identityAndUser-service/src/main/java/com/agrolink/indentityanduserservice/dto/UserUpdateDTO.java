package com.agrolink.indentityanduserservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateDTO {

    private String fullname;
    private String phone;
    private String address;
    private String businessName;
    private String district;
    private String zipcode;

    @JsonProperty("avatar_url")
    private String AvatarUrl;


}
