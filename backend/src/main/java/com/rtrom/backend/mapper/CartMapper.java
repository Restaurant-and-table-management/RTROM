// File: com/rtrom/backend/mapper/CartMapper.java
package com.rtrom.backend.mapper;

import com.rtrom.backend.dto.response.CartItemResponse;
import com.rtrom.backend.dto.response.CartResponse;
import com.rtrom.backend.entity.Cart;
import com.rtrom.backend.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartItemResponse toCartItemResponse(CartItem item) {
        if (item == null) {
            return null;
        }

        CartItemResponse response = new CartItemResponse();
        response.setId(item.getId());
        response.setMenuItemId(item.getMenuItem().getId());
        response.setMenuItemName(item.getMenuItem().getName());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        
        BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        response.setSubtotal(subtotal);
        
        return response;
    }

    public CartResponse toCartResponse(Cart cart) {
        if (cart == null) {
            return null;
        }

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUser().getId());

        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());
        response.setItems(items);

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalAmount(totalAmount);

        return response;
    }
}
