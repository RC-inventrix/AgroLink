package com.me.agrochat.controller;

import com.me.agrochat.model.ChatMessage;
import com.me.agrochat.repository.ChatMessageRepository;
import com.me.agrochat.services.ChatService;
import com.me.agrochat.util.EncryptionUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication; // CORRECT IMPORT
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController // Changed to RestController for better JSON handling
@RequestMapping("/api/chat")
@RequiredArgsConstructor // Automatically creates constructor for all final fields
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ChatController {

    private final EncryptionUtil encryptionUtil;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatService chatService; // Now properly included and final

    /**
     * Real-time WebSocket message handler
     * Encrypts data for DB storage but sends plain text to recipient
     */
    @MessageMapping("/chat.send")
    public void processMessage(@Payload ChatMessage chatMessage) {

        chatMessage.setIsRead(false);
        // 1. Preserve the plain text for the live push
        String plainText = chatMessage.getContent();

        // 2. Encrypt the content before saving to the database
        String encryptedContent = encryptionUtil.encrypt(plainText);
        chatMessage.setContent(encryptedContent);
        chatMessage.setTimestamp(LocalDateTime.now());

        chatMessageRepository.save(chatMessage); // DB Admin sees encrypted text

        // 3. Send the plain text to the recipient's private queue
        chatMessage.setContent(plainText);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessage.getRecipientId()), "/queue/messages", chatMessage);
    }

    /**
     * GET the sidebar list (All unique conversation partners)
     */
    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts(HttpServletRequest request, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();

        // Retrieve the ID we just put in the request attribute
        Object userIdObj = request.getAttribute("userId");

        if (userIdObj == null) {
            return ResponseEntity.status(400).body("User ID missing from token");
        }

        Long userId = Long.valueOf(userIdObj.toString());

        // Pass the numeric ID to your service for the database query
        return ResponseEntity.ok(chatService.getContactList(userId));
    }

    /**
     * GET the full history with a specific person
     */
    @GetMapping("/history/{recipientId}")
    public ResponseEntity<List<ChatMessage>> getHistory(
            HttpServletRequest request, // Add this to get the attribute
            Authentication auth,
            @PathVariable Long recipientId) {

        if (auth == null) return ResponseEntity.status(401).build();

        // 1. Get your numeric ID from the filter's attribute
        Long myId = (Long) request.getAttribute("userId");

        // 2. Fetch history using two numeric IDs
        return ResponseEntity.ok(chatService.getChatHistory(myId, recipientId));
    }

    @PutMapping("/read/{senderId}/{recipientId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long senderId,@PathVariable Long recipientId) {
        // In production, get currentUserId from the SecurityContext or Token
        chatService.markMessagesAsRead(senderId, recipientId);
        return ResponseEntity.ok().build();
    }

    // ChatController.java
    @GetMapping("/unread-count/{senderId}")
    public ResponseEntity<Long> getUnreadCount(HttpServletRequest request, @PathVariable Long senderId) {
        // Get currently logged-in user ID (the recipient)
        Long myId = (Long) request.getAttribute("userId");

        // Logic: Count messages sent BY senderId TO me that are unread
        long count = chatMessageRepository.countUnreadMessages(senderId, myId);
        return ResponseEntity.ok(count);
    }

}