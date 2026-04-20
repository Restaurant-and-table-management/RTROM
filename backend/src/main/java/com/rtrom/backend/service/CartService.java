// File: com/rtrom/backend/service/CartService.java
package com.rtrom.backend.service;

import com.rtrom.backend.dto.request.AddCartItemRequest;
import com.rtrom.backend.dto.request.UpdateCartItemQuantityRequest;
import com.rtrom.backend.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(Long userId);
    CartResponse addItem(Long userId, AddCartItemRequest request);
    CartResponse updateItemQuantity(Long userId, Long cartItemId, UpdateCartItemQuantityRequest request);
    void removeItem(Long userId, Long cartItemId);
    void clearCart(Long userId);
}
