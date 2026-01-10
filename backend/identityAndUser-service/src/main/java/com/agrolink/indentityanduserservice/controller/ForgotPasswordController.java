package com.agrolink.indentityanduserservice.controller;

import com.agrolink.indentityanduserservice.dto.MailBody;
import com.agrolink.indentityanduserservice.model.ForgotPassword;
import com.agrolink.indentityanduserservice.model.User;
import com.agrolink.indentityanduserservice.repository.ForgotPasswordRepository;
import com.agrolink.indentityanduserservice.repository.UserRepository;
import com.agrolink.indentityanduserservice.services.EmailService;
import com.agrolink.indentityanduserservice.utils.ChangePassword;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Date;
import java.util.Objects;
import java.util.Random;

@RestController
@RequestMapping("/forgotPassword")
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ForgotPasswordRepository forgotPasswordRepository;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordController(UserRepository userRepository, EmailService emailService,
                                    ForgotPasswordRepository forgotPasswordRepository,
                                    PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.forgotPasswordRepository = forgotPasswordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/verifyMail/{email}")
    public ResponseEntity<String> verifyEmail(@PathVariable String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

            // Clear old OTPs to prevent duplicate key errors
            forgotPasswordRepository.deleteByUser(user);

            int otp = otpGenerator();
            MailBody mailBody = MailBody.builder()
                    .to(email)
                    .text("This is the OTP for password reset : " + otp)
                    .subject("Otp for password reset")
                    .build();

            ForgotPassword fp = ForgotPassword.builder()
                    .otp(otp)
                    // Increased expiration to 5 minutes (300s) for better usability
                    .expirationTime(new Date(System.currentTimeMillis() + 300 * 1000))
                    .user(user)
                    .build();

            emailService.sendSimpleMessage(mailBody);
            forgotPasswordRepository.save(fp);

            return ResponseEntity.ok("Email sent for verification");
        } catch (UsernameNotFoundException e) {
            // Returns a clean string error instead of raw JSON
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while sending email.");
        }
    }

    @PostMapping("/verifyOtp/{otp}/{email}")
    public ResponseEntity<String> verifyOtp(@PathVariable Integer otp, @PathVariable String email) {
        try {
            // Check if user exists
            userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

            // Check if OTP matches the user email
            ForgotPassword fp = forgotPasswordRepository.findByOtpAndUser(otp, email)
                    .orElseThrow(() -> new RuntimeException("Invalid OTP for email: " + email));

            // Check if OTP has expired
            if (fp.getExpirationTime().before(Date.from(Instant.now()))) {
                forgotPasswordRepository.deleteById(fp.getFpid());
                return new ResponseEntity<>("OTP expired", HttpStatus.EXPECTATION_FAILED);
            }

            return ResponseEntity.ok("OTP verified successfully");
        } catch (Exception e) {
            // Returns clean error message for the frontend red alert box
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/changePassword/{email}")
    public ResponseEntity<String> changePasswordHandler(@RequestBody ChangePassword changePassword,
                                                        @PathVariable String email) {
        if (!Objects.equals(changePassword.password(), changePassword.repeatPassword())) {
            return new ResponseEntity<>("Passwords do not match", HttpStatus.EXPECTATION_FAILED);
        }

        String encodedPassword = passwordEncoder.encode(changePassword.password());

        // Update the password in the database
        userRepository.updatePassword(email, encodedPassword);

        return ResponseEntity.ok("Password changed successfully");
    }

    private Integer otpGenerator() {
        Random random = new Random();
        return random.nextInt(100_000, 999_999);
    }
}