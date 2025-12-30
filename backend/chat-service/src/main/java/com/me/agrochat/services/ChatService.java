package com.me.agrochat.services;

import com.me.agrochat.model.ChatMessage;
import com.me.agrochat.repository.ChatMessageRepository;
import com.me.agrochat.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository repository;
    private final EncryptionUtil encryptionUtil;

    // Save message to DB
    public ChatMessage saveMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return repository.save(message);
    }

    /**
     * Fix 1: Updated to use the new 'findActiveChatHistory' query
     * which respects soft-delete (deletedBySender/deletedByRecipient).
     */
    public List<ChatMessage> getChatHistory(Long user1, Long user2) {
        // Use the new clean repository method
        List<ChatMessage> history = repository.findActiveChatHistory(user1, user2);

        // Loop through and decrypt each message content
        history.forEach(msg -> {
            try {
                String decrypted = encryptionUtil.decrypt(msg.getContent());
                msg.setContent(decrypted);
            } catch (Exception e) {
                // If a message isn't encrypted, keep original text
                System.err.println("Failed to decrypt message ID " + msg.getId() + ": " + e.getMessage());
            }
        });

        return history;
    }

    /**
     * Fix 2: Changed return type to List<Long> to match numeric IDs
     * and Repository return type.
     */
    public List<Long> getContactList(Long userId) {
        return repository.findDistinctConversationPartners(userId);
    }

    public void markMessagesAsRead(Long senderId, Long recipientId) {
        repository.markAsRead(senderId, recipientId);
    }

    /**
     * Fix 3: Updated to handle online status without the deleted
     * 'findFirstBySenderId' method. We now check the last message
     * timestamp generally.
     */
    public boolean isUserOnline(Long userId) {
        // We find the last message sent OR received by this user to check activity
        List<ChatMessage> activeHistory = repository.findDistinctConversationPartners(userId)
                .stream()
                .limit(1)
                .map(partnerId -> repository.findActiveChatHistory(userId, partnerId))
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(list.size() - 1))
                .toList();

        if (activeHistory.isEmpty()) return false;

        ChatMessage lastMsg = activeHistory.get(0);
        return lastMsg.getTimestamp().isAfter(LocalDateTime.now().minusMinutes(10));
    }
}