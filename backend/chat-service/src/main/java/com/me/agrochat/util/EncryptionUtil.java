package com.me.agrochat.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
public class EncryptionUtil {


    private final String algorithm = "AES";

    // DO NOT make this static. Spring won't inject the value if it's static.
    @Value("${encryption.secret.chat.key}")
    private String secretKey;

    public String encrypt(String value) {
        try {
            // Check if secretKey is null before proceeding to avoid the NPE
            if (secretKey == null) {
                throw new RuntimeException("Encryption key was not injected correctly!");
            }

            SecretKeySpec skeySpec = new SecretKeySpec(secretKey.getBytes(), algorithm);
            Cipher cipher = Cipher.getInstance(algorithm);
            cipher.init(Cipher.ENCRYPT_MODE, skeySpec);
            byte[] encrypted = cipher.doFinal(value.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception ex) {
            // This is where your current error is being caught and rethrown
            throw new RuntimeException("Encryption error: " + ex.getMessage(), ex);
        }
    }

    public String decrypt(String encrypted) {
        try {
            SecretKeySpec skeySpec = new SecretKeySpec(secretKey.getBytes(), algorithm);
            Cipher cipher = Cipher.getInstance(algorithm);
            cipher.init(Cipher.DECRYPT_MODE, skeySpec);
            byte[] original = cipher.doFinal(Base64.getDecoder().decode(encrypted));
            return new String(original);
        } catch (Exception ex) {
            throw new RuntimeException("Decryption error", ex);
        }
    }
}