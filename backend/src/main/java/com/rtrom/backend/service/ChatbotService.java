package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.MenuItem;
import com.rtrom.backend.domain.model.Order;
import com.rtrom.backend.dto.chatbot.ChatbotAction;
import com.rtrom.backend.dto.chatbot.ChatbotMessageRequest;
import com.rtrom.backend.dto.chatbot.ChatbotMessageResponse;
import com.rtrom.backend.dto.reservation.ReservationResponse;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.MenuItemRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatbotService {

    private static final List<String> DEFAULT_QUICK_REPLIES = List.of("Book Table", "View Menu", "Track Order");
    private static final int MAX_HISTORY = 12;

    private final ReservationService reservationService;
    private final OrderService orderService;
    private final MenuItemRepository menuItemRepository;
    private final HttpClient httpClient;
    private final Map<String, ConversationState> conversations = new ConcurrentHashMap<>();

    @Value("${app.chatbot.restaurant-name:RTROM Restaurant}")
    private String restaurantName;

    @Value("${app.chatbot.location:MG Road, Bengaluru}")
    private String location;

    @Value("${app.chatbot.contact:+91 98765 43210}")
    private String contact;

    @Value("${app.chatbot.timings:Mon-Sun, 11:00 AM - 11:00 PM}")
    private String timings;

    @Value("${OPENAI_API_KEY:}")
    private String openAiApiKey;

    public ChatbotService(
        ReservationService reservationService,
        OrderService orderService,
        MenuItemRepository menuItemRepository
    ) {
        this.reservationService = reservationService;
        this.orderService = orderService;
        this.menuItemRepository = menuItemRepository;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    @Transactional(readOnly = true)
    public ChatbotMessageResponse processMessage(ChatbotMessageRequest request, String userEmail) {
        String sessionId = normalizeSessionId(request.sessionId(), userEmail);
        ConversationState state = conversations.computeIfAbsent(sessionId, key -> new ConversationState());
        String message = request.message().trim();

        remember(state, "user", message);

        ChatbotMessageResponse response = openAiApiKey.isBlank()
            ? buildIntentResponse(message, userEmail, sessionId, state)
            : buildOpenAiResponse(message, userEmail, sessionId, state);

        remember(state, "assistant", response.reply());
        trimHistory(state);
        return response;
    }

    private ChatbotMessageResponse buildIntentResponse(
        String message,
        String userEmail,
        String sessionId,
        ConversationState state
    ) {
        String normalized = message.toLowerCase(Locale.ENGLISH);

        if (state.awaitingOrderId() && containsDigits(message)) {
            return trackOrder(message, userEmail, sessionId, state);
        }

        if (normalized.contains("book") && normalized.contains("table")) {
            state.setAwaitingOrderId(false);
            return respond(
                sessionId,
                "BOOK_TABLE",
                "success",
                "I can help with that. Opening the reservation page so you can choose date, time, and guests.",
                List.of(new ChatbotAction("navigate", "Book a Table", "/customer", null))
            );
        }

        if (normalized.contains("menu") || normalized.contains("show menu") || normalized.contains("view menu")) {
            state.setAwaitingOrderId(false);
            return respond(
                sessionId,
                "VIEW_MENU",
                "success",
                "Here’s the menu page. I can also suggest popular items if you want.",
                List.of(new ChatbotAction("navigate", "View Menu", "/customer/menu", null))
            );
        }

        if (normalized.contains("track") && normalized.contains("order")) {
            state.setAwaitingOrderId(true);
            return respond(
                sessionId,
                "TRACK_ORDER",
                "awaiting_input",
                "Sure, send me your order ID and I’ll check the latest status for you.",
                List.of(new ChatbotAction("focus_input", "Enter Order ID", null, "order-id"))
            );
        }

        if (normalized.contains("cancel") && normalized.contains("reservation")) {
            return cancelReservation(message, userEmail, sessionId, state);
        }

        if (normalized.contains("timing") || normalized.contains("hours") || normalized.contains("open")) {
            return respond(sessionId, "FAQ_TIMINGS", "success", "We’re open " + timings + ".", List.of());
        }

        if (normalized.contains("location") || normalized.contains("where")) {
            return respond(sessionId, "FAQ_LOCATION", "success", "You can find us at " + location + ".", List.of());
        }

        if (normalized.contains("contact") || normalized.contains("phone") || normalized.contains("call")) {
            return respond(sessionId, "FAQ_CONTACT", "success", "You can reach us at " + contact + ".", List.of());
        }

        if (normalized.contains("faq") || normalized.contains("help") || normalized.contains("what can you do")) {
            return respond(
                sessionId,
                "HELP",
                "success",
                "I can help you book a table, open the menu, track an order, cancel a reservation, or answer questions about timings, location, and contact details.",
                List.of()
            );
        }

        if (normalized.contains("popular") || normalized.contains("recommend")) {
            return respond(sessionId, "MENU_RECOMMENDATION", "success", buildPopularItemsReply(), List.of());
        }

        return respond(
            sessionId,
            "FALLBACK",
            "success",
            "I can help with reservations, menu browsing, order tracking, and restaurant FAQs. Try “book table”, “show menu”, or “track order”.",
            List.of()
        );
    }

    private ChatbotMessageResponse buildOpenAiResponse(
        String message,
        String userEmail,
        String sessionId,
        ConversationState state
    ) {
        try {
            String aiReply = fetchOpenAiReply(message, userEmail, state);
            List<ChatbotAction> actions = inferActions(message);

            if (containsIntent(message, "track", "order") && !containsDigits(message)) {
                state.setAwaitingOrderId(true);
            }

            if (state.awaitingOrderId() && containsDigits(message)) {
                return trackOrder(message, userEmail, sessionId, state);
            }

            if (containsIntent(message, "cancel", "reservation")) {
                return cancelReservation(message, userEmail, sessionId, state);
            }

            return respond(sessionId, "AI_ASSIST", "success", aiReply, actions);
        } catch (Exception exception) {
            return buildIntentResponse(message, userEmail, sessionId, state);
        }
    }

    private String fetchOpenAiReply(String message, String userEmail, ConversationState state)
        throws IOException, InterruptedException {
        String prompt = """
            You are a concise restaurant website assistant for %s.
            You help users with menu, timings, location, contact, table reservations, order tracking, and reservation cancellation.
            If the user wants to book a table, view the menu, track an order, or cancel a reservation, mention that the website can open the correct page.
            Keep responses short and practical.
            User authenticated email: %s
            Conversation history:
            %s
            User message: %s
            """.formatted(
            restaurantName,
            userEmail == null ? "guest" : userEmail,
            String.join("\n", state.history()),
            message
        );

        String payload = """
            {
              "model": "gpt-4o-mini",
              "input": %s
            }
            """.formatted(toJsonString(prompt));

        HttpRequest httpRequest = HttpRequest.newBuilder()
            .uri(URI.create("https://api.openai.com/v1/responses"))
            .timeout(Duration.ofSeconds(20))
            .header("Authorization", "Bearer " + openAiApiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(payload))
            .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new IOException("OpenAI request failed with status " + response.statusCode());
        }

        return extractOutputText(response.body());
    }

    private ChatbotMessageResponse cancelReservation(
        String message,
        String userEmail,
        String sessionId,
        ConversationState state
    ) {
        if (userEmail == null || userEmail.isBlank()) {
            return respond(
                sessionId,
                "CANCEL_RESERVATION",
                "auth_required",
                "Please sign in first so I can verify and cancel your reservation safely.",
                List.of(new ChatbotAction("navigate", "Go to Login", "/login", null))
            );
        }

        Long reservationId = extractFirstNumber(message);
        if (reservationId == null) {
            List<ReservationResponse> reservations = reservationService.getMyReservations(userEmail).stream()
                .filter(reservation -> "PENDING".equals(reservation.status()) || "CONFIRMED".equals(reservation.status()))
                .limit(3)
                .toList();

            if (reservations.isEmpty()) {
                return respond(
                    sessionId,
                    "CANCEL_RESERVATION",
                    "success",
                    "You don’t have any active reservations to cancel right now.",
                    List.of(new ChatbotAction("navigate", "View Reservations", "/customer/reservations", null))
                );
            }

            StringBuilder reply = new StringBuilder("Tell me which reservation ID you want to cancel. Active bookings: ");
            for (int index = 0; index < reservations.size(); index++) {
                ReservationResponse reservation = reservations.get(index);
                if (index > 0) {
                    reply.append(" | ");
                }
                reply.append("#")
                    .append(reservation.id())
                    .append(" on ")
                    .append(reservation.reservationDate())
                    .append(" at ")
                    .append(reservation.startTime().toString(), 0, 5);
            }

            return respond(sessionId, "CANCEL_RESERVATION", "awaiting_input", reply.toString(), List.of());
        }

        ReservationResponse cancelled = reservationService.cancelReservation(reservationId, userEmail, false);
        state.setAwaitingOrderId(false);
        return respond(
            sessionId,
            "CANCEL_RESERVATION",
            "success",
            "Reservation #" + cancelled.id() + " has been cancelled.",
            List.of(new ChatbotAction("navigate", "View Reservations", "/customer/reservations", null))
        );
    }

    private ChatbotMessageResponse trackOrder(
        String message,
        String userEmail,
        String sessionId,
        ConversationState state
    ) {
        Long orderId = extractFirstNumber(message);
        if (orderId == null) {
            state.setAwaitingOrderId(true);
            return respond(
                sessionId,
                "TRACK_ORDER",
                "awaiting_input",
                "Please share the order ID so I can track it for you.",
                List.of()
            );
        }

        try {
            Order order = orderService.getTrackableOrder(orderId, userEmail);
            state.setAwaitingOrderId(false);
            return respond(
                sessionId,
                "TRACK_ORDER",
                "success",
                "Order #" + order.getId() + " is currently " + order.getStatus()
                    + ". Total: " + formatCurrency(order.getTotalAmount())
                    + ". Last updated: " + order.getUpdatedAt().toLocalTime().toString().substring(0, 5) + ".",
                List.of()
            );
        } catch (ResourceNotFoundException exception) {
            state.setAwaitingOrderId(true);
            return respond(
                sessionId,
                "TRACK_ORDER",
                "error",
                "I couldn’t find that order. Please double-check the order ID and try again.",
                List.of()
            );
        }
    }

    private String buildPopularItemsReply() {
        List<MenuItem> items = menuItemRepository.findAll().stream()
            .sorted(Comparator.comparing(MenuItem::getPrice).reversed())
            .limit(3)
            .toList();

        if (items.isEmpty()) {
            return "Our menu is being updated right now. You can still open the menu page to browse available items.";
        }

        String summary = items.stream()
            .map(item -> item.getName() + " (" + formatCurrency(item.getPrice()) + ")")
            .reduce((first, second) -> first + ", " + second)
            .orElse("Chef specials");

        return "Popular picks right now: " + summary + ".";
    }

    private List<ChatbotAction> inferActions(String message) {
        List<ChatbotAction> actions = new ArrayList<>();
        String normalized = message.toLowerCase(Locale.ENGLISH);

        if (normalized.contains("book") && normalized.contains("table")) {
            actions.add(new ChatbotAction("navigate", "Book a Table", "/customer", null));
        }
        if (normalized.contains("menu")) {
            actions.add(new ChatbotAction("navigate", "View Menu", "/customer/menu", null));
        }
        if (normalized.contains("reservation")) {
            actions.add(new ChatbotAction("navigate", "My Reservations", "/customer/reservations", null));
        }
        return actions;
    }

    private ChatbotMessageResponse respond(
        String sessionId,
        String intent,
        String status,
        String reply,
        List<ChatbotAction> actions
    ) {
        return new ChatbotMessageResponse(reply, sessionId, intent, status, actions, DEFAULT_QUICK_REPLIES);
    }

    private void remember(ConversationState state, String role, String message) {
        state.history().add(role + ": " + message);
    }

    private void trimHistory(ConversationState state) {
        while (state.history().size() > MAX_HISTORY) {
            state.history().remove(0);
        }
    }

    private String normalizeSessionId(String providedSessionId, String userEmail) {
        if (providedSessionId != null && !providedSessionId.isBlank()) {
            return providedSessionId;
        }
        if (userEmail != null && !userEmail.isBlank()) {
            return "user:" + userEmail.toLowerCase(Locale.ENGLISH);
        }
        return "guest:" + UUID.randomUUID();
    }

    private boolean containsDigits(String message) {
        return message.chars().anyMatch(Character::isDigit);
    }

    private Long extractFirstNumber(String message) {
        String digits = message.replaceAll("[^0-9]", " ").trim();
        if (digits.isBlank()) {
            return null;
        }
        String first = digits.split("\\s+")[0];
        return Long.parseLong(first);
    }

    private boolean containsIntent(String message, String first, String second) {
        String normalized = message.toLowerCase(Locale.ENGLISH);
        return normalized.contains(first) && normalized.contains(second);
    }

    private String formatCurrency(BigDecimal amount) {
        return "Rs. " + amount.stripTrailingZeros().toPlainString();
    }

    private String toJsonString(String value) {
        return "\"" + value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "") + "\"";
    }

    private String extractOutputText(String json) {
        String marker = "\"output_text\":\"";
        int start = json.indexOf(marker);
        if (start < 0) {
            return "I’m here to help with bookings, menu questions, and order tracking.";
        }

        int index = start + marker.length();
        StringBuilder builder = new StringBuilder();
        boolean escaped = false;

        while (index < json.length()) {
            char current = json.charAt(index++);
            if (escaped) {
                switch (current) {
                    case 'n' -> builder.append('\n');
                    case '"' -> builder.append('"');
                    case '\\' -> builder.append('\\');
                    default -> builder.append(current);
                }
                escaped = false;
                continue;
            }
            if (current == '\\') {
                escaped = true;
                continue;
            }
            if (current == '"') {
                break;
            }
            builder.append(current);
        }

        return builder.toString().isBlank()
            ? "I’m here to help with bookings, menu questions, and order tracking."
            : builder.toString();
    }

    private static final class ConversationState {
        private final List<String> history = new ArrayList<>();
        private boolean awaitingOrderId;

        public List<String> history() {
            return history;
        }

        public boolean awaitingOrderId() {
            return awaitingOrderId;
        }

        public void setAwaitingOrderId(boolean awaitingOrderId) {
            this.awaitingOrderId = awaitingOrderId;
        }
    }
}
