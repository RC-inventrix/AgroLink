package com.me.agrochat.repository;

import com.me.agrochat.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 1. Fetch chat history between two users (ordered by time)
    List<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            String senderId, String recipientId, String recipientId2, String senderId2);

    // 2. Fetch unique users the current user has conversations with (for the sidebar)
    @Query("SELECT DISTINCT CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END " +
            "FROM ChatMessage m WHERE m.senderId = :userId OR m.recipientId = :userId")
    List<String> findDistinctConversationPartners(@Param("userId") String userId);

    // 3. Fetch the very last message for a preview in the sidebar
    ChatMessage findFirstBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampDesc(
            String s1, String r1, String s2, String r2);
}