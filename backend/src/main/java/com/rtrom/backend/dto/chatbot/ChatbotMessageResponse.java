package com.rtrom.backend.dto.chatbot;

import java.util.List;

public record ChatbotMessageResponse(
    String reply,
    String sessionId,
    String intent,
    String status,
    List<ChatbotAction> actions,
    List<String> quickReplies
) {}
