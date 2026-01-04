package com.me.agrochat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ConversationResponse {
    private String otherUserId;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    // Note: You will later fetch the Name and Avatar from your Identity Servic


}
