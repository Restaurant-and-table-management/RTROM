package com.rtrom.backend.service;

import com.rtrom.backend.dto.response.KitchenTicketResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KitchenEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcasts a kitchen ticket update to all subscribers of /topic/kitchen/tickets.
     * Used whenever a ticket is created, or its status changes.
     */
    public void publishTicketUpdate(KitchenTicketResponse ticket) {
        log.info("Publishing kitchen ticket update for ticketId={}, status={}",
                ticket.getTicketId(), ticket.getKitchenStatus());
        messagingTemplate.convertAndSend("/topic/kitchen/tickets", ticket);
    }

    /**
     * Broadcasts a ticket update to a table-specific topic.
     * Used so waiters and customers can receive updates for a specific table.
     */
    public void publishTableOrderUpdate(Long tableId, KitchenTicketResponse ticket) {
        log.info("Publishing table order update for tableId={}", tableId);
        messagingTemplate.convertAndSend("/topic/table/" + tableId + "/orders", ticket);
    }
}
