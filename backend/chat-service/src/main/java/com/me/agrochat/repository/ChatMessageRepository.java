package com.me.agrochat.repository;

import com.me.agrochat.model.ChatMessage;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 1. UPDATED: Fetch active chat history (Excludes soft-deleted messages)
    @Query("SELECT m FROM ChatMessage m WHERE " +
            "(m.senderId = :id1 AND m.recipientId = :id2 AND m.deletedBySender = false) OR " +
            "(m.senderId = :id2 AND m.recipientId = :id1 AND m.deletedByRecipient = false) " +
            "ORDER BY m.timestamp ASC")
    List<ChatMessage> findActiveChatHistory(@Param("id1") Long id1, @Param("id2") Long id2);

    // 2. Fetch unique users the current user has conversations with
    @Query("SELECT DISTINCT CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END " +
            "FROM ChatMessage m WHERE m.senderId = :userId OR m.recipientId = :userId")
    List<Long> findDistinctConversationPartners(@Param("userId") Long userId);

    // 3. Mark messages as read
    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.senderId = :senderId AND m.recipientId = :recipientId AND m.isRead = false")
    void markAsRead(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId);

    // 4. Count unread messages from a specific sender
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.senderId = :senderId AND m.recipientId = :recipientId AND m.isRead = false")
    long countUnreadMessages(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId);

    // 5. Global unread count for Sidebar/Header
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.recipientId = :recipientId AND m.isRead = false")
    long countAllUnreadForRecipient(@Param("recipientId") Long recipientId);

    // 6. SOFT DELETE LOGIC: Mark messages I SENT as hidden for me
    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.deletedBySender = true WHERE m.senderId = :myId AND m.recipientId = :contactId")
    void markAsDeletedBySender(@Param("myId") Long myId, @Param("contactId") Long contactId);

    // 7. SOFT DELETE LOGIC: Mark messages I RECEIVED as hidden for me
    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.deletedByRecipient = true WHERE m.recipientId = :myId AND m.senderId = :contactId")
    void markAsDeletedByRecipient(@Param("myId") Long myId, @Param("contactId") Long contactId);
}