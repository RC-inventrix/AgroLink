package com.agrolink.indentityanduserservice.services;

import com.agrolink.indentityanduserservice.dto.MailBody;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {



    private final String email;


    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    public EmailService(@Value("${spring.mail.username}") String email, JavaMailSender javaMailSender , TemplateEngine templateEngine) {
        this.email = email;
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }



    public void sendHtmlOtpMessage(String to, String subject, int otp) throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        // 1. Prepare Thymeleaf Context
        Context context = new Context();
        context.setVariable("otp", otp);

        // 2. Process HTML Template
        String htmlContent = templateEngine.process("otp-template", context);

        // 3. Set Mail Properties
        helper.setFrom(email);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // 'true' means this is HTML

        javaMailSender.send(mimeMessage);
    }
}
