package com.rtrom.backend.dto.chatbot;

public record ChatbotAction(
    String type,
    String label,
    String target,
    String value
) {}
