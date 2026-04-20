// File: com/rtrom/backend/repository/OrderItemRepository.java
package com.rtrom.backend.repository;

import com.rtrom.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
