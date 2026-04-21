package com.rtrom.backend.repository;

import com.rtrom.backend.domain.enums.KitchenTicketStatus;
import com.rtrom.backend.domain.model.KitchenOrderTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KitchenOrderTicketRepository extends JpaRepository<KitchenOrderTicket, Long> {

    List<KitchenOrderTicket> findByKitchenStatusOrderByCreatedAtAsc(KitchenTicketStatus status);

    List<KitchenOrderTicket> findAllByOrderByCreatedAtAsc();

    Optional<KitchenOrderTicket> findByOrderId(Long orderId);

    @Query("SELECT k FROM KitchenOrderTicket k WHERE k.order.table.id = :tableId AND k.kitchenStatus != 'SERVED'")
    List<KitchenOrderTicket> findActiveTicketsByTableId(@Param("tableId") Long tableId);

    boolean existsByOrderIdAndKitchenStatusNot(Long orderId, KitchenTicketStatus status);
}
