package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByTableIdAndStatusNot(Long tableId, com.rtrom.backend.domain.model.OrderStatus status);
}
