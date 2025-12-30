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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ChatController {

    private final EncryptionUtil encryptionUtil;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatService chatService;

    /**
     * Real-time WebSocket message handler
     */
    @MessageMapping("/chat.send")
    public void processMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setIsRead(false);

        // Ensure soft-delete flags are false for new messages
        chatMessage.setDeletedBySender(false);
        chatMessage.setDeletedByRecipient(false);

        String plainText = chatMessage.getContent();

        // Encrypt for DB storage
        String encryptedContent = encryptionUtil.encrypt(plainText);
        chatMessage.setContent(encryptedContent);
        chatMessage.setTimestamp(LocalDateTime.now());

        chatMessageRepository.save(chatMessage);

        // Send plain text to recipient
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
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ResponseEntity.status(400).body("User ID missing");

        return ResponseEntity.ok(chatService.getContactList(userId));
    }

    /**
     * GET the full history with a specific person (Respects Soft Delete)
     */
    @GetMapping("/history/{recipientId}")
    public ResponseEntity<List<ChatMessage>> getHistory(HttpServletRequest request, @PathVariable Long recipientId) {
        Long myId = (Long) request.getAttribute("userId");

        // Use the new repository method that checks 'deletedBySender/Recipient' flags
        List<ChatMessage> history = chatMessageRepository.findActiveChatHistory(myId, recipientId);

        // Decrypt messages for the UI
        history.forEach(m -> {
            try {
                m.setContent(encryptionUtil.decrypt(m.getContent()));
            } catch (Exception e) {
                m.setContent("[Decryption Error]");
            }
        });

        return ResponseEntity.ok(history);
    }

    /**
     * DELETE (Soft Delete): Hide conversation for the current user only
     */
    @DeleteMapping("/conversation/{contactId}")
    public ResponseEntity<Void> deleteForMe(HttpServletRequest request, @PathVariable Long contactId) {
        Long myId = (Long) request.getAttribute("userId");

        // 1. Messages I SENT: Set deletedBySender = true
        chatMessageRepository.markAsDeletedBySender(myId, contactId);

        // 2. Messages I RECEIVED: Set deletedByRecipient = true
        chatMessageRepository.markAsDeletedByRecipient(myId, contactId);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read/{senderId}/{recipientId}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long senderId, @PathVariable Long recipientId) {
        chatService.markMessagesAsRead(senderId, recipientId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count/{senderId}")
    public ResponseEntity<Long> getUnreadCount(HttpServletRequest request, @PathVariable Long senderId) {
        Long myId = (Long) request.getAttribute("userId");
        long count = chatMessageRepository.countUnreadMessages(senderId, myId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/total-unread")
    public ResponseEntity<Long> getTotalUnreadCount(HttpServletRequest request) {
        Long myId = (Long) request.getAttribute("userId");
        long total = chatMessageRepository.countAllUnreadForRecipient(myId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<Boolean> getUserStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.isUserOnline(userId));
    }
}