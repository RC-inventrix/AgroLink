package com.agrolink.indentityanduserservice.services;

import com.agrolink.indentityanduserservice.dto.MailBody;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@NoArgsConstructor(force = true)
@Service
public class EmailService {


    @Value("${spring.mail.username}")
    private final String email;

    @Autowired
    private final JavaMailSender javaMailSender;

    public EmailService(String email, JavaMailSender javaMailSender) {
        this.email = email;
        this.javaMailSender = javaMailSender;
    }

    public void sendSimpleMessage(MailBody mailBody){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(mailBody.to());
        message.setFrom(email);
        message.setSubject(mailBody.subject());
        message.setText(mailBody.text());

        assert javaMailSender != null;
        javaMailSender.send(message);


    }
}
