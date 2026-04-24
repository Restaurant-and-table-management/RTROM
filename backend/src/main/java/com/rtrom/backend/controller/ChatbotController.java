package com.rtrom.backend.controller;

import com.rtrom.backend.dto.chatbot.ChatbotMessageRequest;
import com.rtrom.backend.dto.chatbot.ChatbotMessageResponse;
import com.rtrom.backend.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatbotMessageResponse> sendMessage(
        @Valid @RequestBody ChatbotMessageRequest request,
        Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(chatbotService.processMessage(request, userEmail));
    }
}
