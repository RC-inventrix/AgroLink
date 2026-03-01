package com.me.chatbotservice.controller;

import com.me.chatbotservice.dto.ChatRequest;
import com.me.chatbotservice.dto.ChatResponse;
import com.me.chatbotservice.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ChatbotController {

    private final GeminiService geminiService;

    /**
     * POST /api/chatbot/chat
     * Accepts a user message and returns an AI-generated response
     * grounded strictly in the AgroLink FAQ document.
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ChatResponse("Please provide a message."));
        }
        String reply = geminiService.chat(request.getMessage().trim());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
