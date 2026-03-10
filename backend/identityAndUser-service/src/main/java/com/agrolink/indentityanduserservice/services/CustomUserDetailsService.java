package com.agrolink.indentityanduserservice.services;

import com.agrolink.indentityanduserservice.model.Admin;
import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.repository.AdminRepository;
import com.agrolink.indentityanduserservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // 1. First, try to fetch from the regular Users table by email
        Optional<User> user = userRepository.findByEmail(identifier);
        if (user.isPresent()) {
            User u = user.get();
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + u.getRole().name());
            return new org.springframework.security.core.userdetails.User(
                    u.getEmail(),
                    u.getPassword(),
                    Collections.singletonList(authority)
            );
        }

        // 2. If not found, try to fetch from the Admins table by username
        Optional<Admin> admin = adminRepository.findByUsername(identifier);
        if (admin.isPresent()) {
            Admin a = admin.get();
            // Admins usually have the "ROLE_ADMIN" authority
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_ADMIN");
            return new org.springframework.security.core.userdetails.User(
                    a.getUsername(),
                    a.getPassword(),
                    Collections.singletonList(authority)
            );
        }

        // 3. If neither exists, throw the exception
        throw new UsernameNotFoundException("User/Admin not found with identifier: " + identifier);
    }

//    @Override
//    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
//        // 1. Fetch the user from the DB
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
//
//        // 2. Map your "Role" to a Spring Security "Authority"
//        // Assuming your Role enum is simple (FARMER, BUYER, ADMIN)
//        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
//
//        // 3. Return a Spring Security User object
//        return new org.springframework.security.core.userdetails.User(
//                user.getEmail(),
//                user.getPassword(), // This MUST be the encrypted password from your DB
//                Collections.singletonList(authority)
//        );
//    }
}
