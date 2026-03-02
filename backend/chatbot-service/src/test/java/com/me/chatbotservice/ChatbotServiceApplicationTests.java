package com.me.chatbotservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "gemini.api.key=test-key",
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false"
})
class ChatbotServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
