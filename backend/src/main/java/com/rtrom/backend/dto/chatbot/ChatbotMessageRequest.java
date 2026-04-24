package com.rtrom.backend.dto.chatbot;

import jakarta.validation.constraints.NotBlank;

public record ChatbotMessageRequest(
    @NotBlank(message = "Message is required")
    String message,
    String sessionId
) {}
