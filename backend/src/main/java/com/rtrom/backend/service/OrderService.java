// File: com/rtrom/backend/service/OrderService.java
package com.rtrom.backend.service;

import com.rtrom.backend.dto.request.PlaceOrderRequest;
import com.rtrom.backend.dto.response.OrderResponse;
import com.rtrom.backend.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(Long userId, PlaceOrderRequest request);
    List<OrderResponse> getMyOrders(Long userId);
    OrderResponse getOrderById(Long userId, Long orderId);
    OrderResponse cancelOrder(Long userId, Long orderId);
    List<OrderResponse> getAllOrders();
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
}
