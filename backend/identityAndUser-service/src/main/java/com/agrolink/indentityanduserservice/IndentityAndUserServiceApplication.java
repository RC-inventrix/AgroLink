package com.agrolink.indentityanduserservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class IndentityAndUserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IndentityAndUserServiceApplication.class, args);
    }

}
