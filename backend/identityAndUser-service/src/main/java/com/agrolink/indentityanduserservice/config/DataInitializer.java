package com.agrolink.indentityanduserservice.config;

import com.agrolink.indentityanduserservice.model.Admin;
import com.agrolink.indentityanduserservice.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(AdminRepository repo, PasswordEncoder encoder) {
        return args -> {
            if(repo.findByUsername("admin")==null){
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("admin123"));
                repo.save(admin);
            }
        };
    }
}
