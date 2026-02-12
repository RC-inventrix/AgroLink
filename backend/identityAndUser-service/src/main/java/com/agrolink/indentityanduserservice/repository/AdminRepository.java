package com.agrolink.indentityanduserservice.repository;

import com.agrolink.indentityanduserservice.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    // Find admin by username to check login credentials
    Optional<Admin> findByUsername(String username);
}