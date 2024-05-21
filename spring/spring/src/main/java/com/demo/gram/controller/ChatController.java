package com.demo.gram.controller;

import com.demo.gram.dto.ChatMessageDTO;
import com.demo.gram.dto.MembersDTO;
import com.demo.gram.entity.ChatMessage;
import com.demo.gram.entity.ChatRoom;
import com.demo.gram.entity.ChatRoomResponse;
import com.demo.gram.entity.Members;
import com.demo.gram.repository.ChatMessageRepository;
import com.demo.gram.repository.ChatRoomRepository;
import com.demo.gram.repository.MembersRepository;
import com.demo.gram.security.util.JWTUtil;
import com.demo.gram.service.MembersService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Log4j2
public class ChatController {

  private final ChatRoomRepository chatRoomRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final MembersRepository membersRepository;
  private final MembersService membersService;
  private final JWTUtil jwtUtil;
  private final ObjectMapper objectMapper;

  @MessageMapping("/chat/{chatRoomId}/send")
  @SendTo("/topic/chat/{chatRoomId}")
  public ChatMessageDTO sendChatMessageViaWebSocket(@DestinationVariable Long chatRoomId, @Payload PayloadMessage payloadMessage) throws Exception {
    ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
        .orElseThrow(() -> new RuntimeException("Chat room not found"));
    String email = jwtUtil.validateAndExtract(payloadMessage.getToken());
    Members user = membersRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    ChatMessage chatMessage = new ChatMessage();
    chatMessage.setChatRoom(chatRoom);
    chatMessage.setUser(user);
    chatMessage.setMessage(payloadMessage.getMessage());
    chatMessage.setSentAt(LocalDateTime.now());
    chatMessageRepository.save(chatMessage);
    return chatMessage.toDTO();
  }

  @PostMapping("/{chatRoomId}/send")
  public ResponseEntity<ChatMessageDTO> sendChatMessageViaPost(@PathVariable Long chatRoomId, @RequestBody PayloadMessage payloadMessage) throws Exception {
    ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
        .orElseThrow(() -> new RuntimeException("ChatRoom not found"));
    String email = jwtUtil.validateAndExtract(payloadMessage.getToken());
    Members user = membersRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    ChatMessage chatMessage = new ChatMessage();
    chatMessage.setChatRoom(chatRoom);
    chatMessage.setUser(user);
    chatMessage.setMessage(payloadMessage.getMessage());
    chatMessage.setSentAt(LocalDateTime.now());
    chatMessageRepository.save(chatMessage);
    return ResponseEntity.ok(chatMessage.toDTO());
  }

  @GetMapping("/room/by-post/{postId}")
  public ResponseEntity<String> getChatRoomByPostId(@PathVariable Long postId) {
    ChatRoom chatRoom = chatRoomRepository.findByPostId(postId)
        .orElseThrow(() -> new RuntimeException("No chat room associated with the provided post ID"));
    ChatRoomResponse response = new ChatRoomResponse(chatRoom.getId(), postId);
    return ResponseEntity.ok(convertToJson(response));
  }

  @GetMapping("/chatroom/{chatRoomId}/user")
  public ResponseEntity<String> getChatRoomMembers(@PathVariable Long chatRoomId) {
    log.info("Getting members for chat room: " + chatRoomId);
    List<MembersDTO> members = membersService.getChatRoomMembers(chatRoomId);
    return new ResponseEntity<>(convertToJson(members), HttpStatus.OK);
  }

  @MessageMapping("/chat/{chatRoomId}/join")
  @SendTo("/topic/chat/{chatRoomId}/members")
  public List<MembersDTO> joinChatRoom(@DestinationVariable Long chatRoomId, @Payload PayloadMessage payloadMessage) {
    try {
      String email = jwtUtil.validateAndExtract(payloadMessage.getToken());
      membersService.joinChatRoom(email, chatRoomId);
    } catch (Exception e) {
      log.error("Token validation failed", e);
      throw new RuntimeException("Invalid token", e);
    }
    List<MembersDTO> members = membersService.getChatRoomMembers(chatRoomId);
    return members;
  }

  @GetMapping("/chatroom/{chatRoomId}/messages")
  public ResponseEntity<List<ChatMessageDTO>> getMessagesByChatRoomId(@PathVariable Long chatRoomId) {
    List<ChatMessageDTO> messages = chatMessageRepository.findByChatRoomId(chatRoomId)
        .stream()
        .map(ChatMessage::toDTO)
        .collect(Collectors.toList());
    return ResponseEntity.ok(messages);
  }

  private String convertToJson(Object object) {
    try {
      return objectMapper.writeValueAsString(object);
    } catch (Exception e) {
      throw new RuntimeException("Failed to convert object to JSON", e);
    }
  }

  @Data
  public static class PayloadMessage {
    private String message;
    private String token;

    // 기본 생성자가 필요함
    public PayloadMessage() {}

    public PayloadMessage(String message, String token) {
      this.message = message;
      this.token = token;
    }
  }
}
