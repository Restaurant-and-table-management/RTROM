// File: com/rtrom/backend/repository/CartItemRepository.java
package com.rtrom.backend.repository;

import com.rtrom.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
