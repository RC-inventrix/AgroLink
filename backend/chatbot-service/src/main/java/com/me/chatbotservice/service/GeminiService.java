package com.me.chatbotservice.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final WebClient geminiWebClient;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private String faqContent;

    private static final String SYSTEM_PROMPT_TEMPLATE =
            "You are a helpful and friendly customer support assistant for the AgroLink platform. " +
            "Your ONLY knowledge source is the FAQ document provided below. " +
            "Answer questions STRICTLY based on the content in this document. " +
            "If a question cannot be answered from this document, politely say: " +
            "\"I'm sorry, I can only assist with AgroLink platform navigation and support topics. " +
            "Please contact our support team for further help.\" " +
            "Do NOT perform calculations (e.g., delivery fees, totals, discounts). " +
            "Do NOT answer questions unrelated to AgroLink platform usage. " +
            "Be concise, friendly, and helpful.\n\n" +
            "=== AgroLink FAQ Document ===\n%s\n=== End of FAQ Document ===";

    @PostConstruct
    public void loadFaq() {
        try {
            ClassPathResource resource = new ClassPathResource("docs/FAQ.md");
            faqContent = resource.getContentAsString(StandardCharsets.UTF_8);
            log.info("FAQ document loaded successfully ({} characters)", faqContent.length());
        } catch (IOException e) {
            log.error("Failed to load FAQ.md from classpath. Chatbot will use a fallback message.", e);
            faqContent = "No FAQ content available. Please contact support.";
        }
    }

    public String chat(String userMessage) {
        String systemInstruction = String.format(SYSTEM_PROMPT_TEMPLATE, faqContent);

        Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemInstruction))
                ),
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", userMessage))
                        )
                )
        );

        Map<?, ?> response = geminiWebClient.post()
                .uri("/v1beta/models/gemini-1.5-flash:generateContent?key={key}", geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        return extractReply(response);
    }

    @SuppressWarnings("unchecked")
    private String extractReply(Map<?, ?> response) {
        try {
            List<?> candidates = (List<?>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "I'm sorry, I couldn't generate a response. Please try again.";
            }
            Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) candidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> part = (Map<?, ?>) parts.get(0);
            return (String) part.get("text");
        } catch (Exception e) {
            log.error("Failed to parse Gemini API response", e);
            return "I'm sorry, an error occurred while processing your request. Please try again.";
        }
    }
}
