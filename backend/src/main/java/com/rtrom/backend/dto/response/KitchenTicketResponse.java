package com.rtrom.backend.dto.response;

import com.rtrom.backend.domain.enums.KitchenTicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenTicketResponse {

    private Long ticketId;
    private Long orderId;
    private String tableNumber;
    private Long tableId;
    private KitchenTicketStatus kitchenStatus;
    private String assignedTo;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer estimatedMinutes;
    private String notes;
    private LocalDateTime createdAt;
    private List<KitchenOrderItemDetail> items;
    private String specialInstructions;
    private BigDecimal totalAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KitchenOrderItemDetail {
        private Long orderItemId;
        private String itemName;
        private Integer quantity;
        private String customizationNotes;
        private Boolean isVegetarian;
    }
}
