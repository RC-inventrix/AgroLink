package com.agrolink.orderpaymentservice.repository;

import com.agrolink.orderpaymentservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // findById is built-in, so no extra code needed here
}