package com.demo.gram.dto;

import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;

@Data
public class ChatMessageDTO {
  // Getters and setters
  private Long id;
  private String message;
  private LocalDateTime sentAt;
  private String senderName;

  public ChatMessageDTO(Long id, String message, LocalDateTime sentAt, String senderName) {
    this.id = id;
    this.message = message;
    this.sentAt = sentAt;
    this.senderName = senderName;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public void setSentAt(LocalDateTime sentAt) {
    this.sentAt = sentAt;
  }

  public void setSenderName(String senderName) {
    this.senderName = senderName;
  }
}
