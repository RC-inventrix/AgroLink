/* fileName: indentityanduserservice/config/DataInitializer.java */
package com.agrolink.indentityanduserservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    // Initialization logic removed to prevent schema conflicts and rogue data insertion.
    // The database schema will now be strictly managed by Hibernate based on the Entity models.

    @Bean
    CommandLineRunner init() {
        return args -> {
            System.out.println("DataInitializer bypassed: Let Hibernate manage the schema.");
        };
    }
}