package com.me.agrochat.model;

import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class ChatMessage {
    private String senderId;
    private String recipientId;
    private String content;
    private MessageType type;

    public enum MessageType { CHAT, JOIN, LEAVE }
}
