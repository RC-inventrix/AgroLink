package com.me.agrochat.services;


import com.me.agrochat.model.ChatMessage;
import com.me.agrochat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository repository;

    // Save message to DB (Call this inside your @MessageMapping method)
    public ChatMessage saveMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return repository.save(message);
    }

    // Get the full conversation between two people
    public List<ChatMessage> getChatHistory(Long user1, Long user2) {
        return repository.findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
                user1, user2, user1, user2);
    }

    // Get list of unique users to show in the "All Messages" sidebar
    public List<String> getContactList(Long userId) {
        return repository.findDistinctConversationPartners(userId);
    }
}
