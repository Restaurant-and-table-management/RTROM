package com.rtrom.backend.domain.model;

import com.rtrom.backend.domain.enums.KitchenTicketStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kitchen_order_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KitchenOrderTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KitchenTicketStatus kitchenStatus;

    private String assignedTo;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Integer estimatedMinutes;

    private String notes;

    @Column(length = 500)
    private String specialInstructions;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (kitchenStatus == null) {
            kitchenStatus = KitchenTicketStatus.RECEIVED;
        }
    }
}
