/* fileName: indentityanduserservice/dto/UserUpdateDTO.java */
package com.agrolink.indentityanduserservice.dto;

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
    private String AvatarUrl;
}