package com.me.agrochat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Direct connection on port 8083: http://localhost:8083/ws
        registry.addEndpoint("/ws").setAllowedOrigins("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app"); // prefix for sending messages
        registry.enableSimpleBroker("/topic", "/queue");   // prefixes for receiving messages
        registry.setUserDestinationPrefix("/user");         // for 1-to-1 private chat
    }
}
