package com.me.agrochat.repository;

import com.me.agrochat.model.ChatMessage;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 1. Fetch chat history between two users (ordered by time)
    List<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            Long senderId, Long recipientId, Long recipientId2, Long senderId2);

    // 2. Fetch unique users the current user has conversations with (for the sidebar)
    @Query("SELECT DISTINCT CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END " +
            "FROM ChatMessage m WHERE m.senderId = :userId OR m.recipientId = :userId")
    List<String> findDistinctConversationPartners(@Param("userId") Long userId);

    // 3. Fetch the very last message for a preview in the sidebar
    ChatMessage findFirstBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampDesc(
            Long s1, Long r1, Long s2, Long r2);

    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.senderId = :senderId AND m.recipientId = :recipientId AND m.isRead = false")
    void markAsRead(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId);


    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.senderId = :senderId AND m.recipientId = :recipientId AND m.isRead = false")
    long countUnreadMessages(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId);

    // ChatMessageRepository.java
    ChatMessage findFirstBySenderIdOrderByTimestampDesc(Long senderId);


    //
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.recipientId = :recipientId AND m.isRead = false")
    long countAllUnreadForRecipient(@Param("recipientId") Long recipientId);
}



