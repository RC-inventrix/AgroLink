package com.me.agrochat.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private Long recipientId;
    private String content;

    // Automatically set the time the message was created
    private LocalDateTime timestamp;
    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }

    // Update your getters and setters to use Boolean
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false,name = "deleted_by_sender")
    private Boolean deletedBySender = false;

    @Column(nullable = false,name = "deleted_by_recipient")
    private Boolean deletedByRecipient = false;
}
