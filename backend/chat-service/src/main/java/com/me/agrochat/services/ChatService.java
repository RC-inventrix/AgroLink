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

    // Save message to DB (Call this inside your @MessageMapping method)
    public ChatMessage saveMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return repository.save(message);
    }

    // Get the full conversation between two people
    public List<ChatMessage> getChatHistory(Long user1, Long user2) {
        List<ChatMessage> history = repository.findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
                user1, user2, user2, user1);

        // 3. Loop through and decrypt each message content
        history.forEach(msg -> {
            try {
                String decrypted = encryptionUtil.decrypt(msg.getContent());
                msg.setContent(decrypted);
            } catch (Exception e) {
                // If a message isn't encrypted (e.g. old test data), keep original
                System.err.println("Failed to decrypt message ID " + msg.getId() + ": " + e.getMessage());
            }
        });

        return history;
    }

    // Get list of unique users to show in the "All Messages" sidebar
    public List<String> getContactList(Long userId) {
        return repository.findDistinctConversationPartners(userId);
    }

    public void markMessagesAsRead(Long senderId, Long recipientId) {
        // Use the instance variable 'repository', not the Interface name
        repository.markAsRead(senderId, recipientId);
    }
}
