package com.demo.gram.controller;

import com.demo.gram.dto.ChatMessageDTO;
import com.demo.gram.entity.ChatMessage;
import com.demo.gram.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat/messages")
@RequiredArgsConstructor
public class ChatMessageController {
  private final ChatMessageRepository chatMessageRepository;

  @GetMapping("/{chatRoomId}")
  public ResponseEntity<List<ChatMessageDTO>> getMessagesByChatRoomId(@PathVariable Long chatRoomId) {
    List<ChatMessageDTO> messages = chatMessageRepository.findByChatRoomId(chatRoomId)
        .stream()
        .map(ChatMessage::toDTO)
        .collect(Collectors.toList());
    return ResponseEntity.ok(messages);
  }
}
