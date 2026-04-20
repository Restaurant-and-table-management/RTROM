// File: com/rtrom/backend/controller/OrderController.java
package com.rtrom.backend.controller;

import com.rtrom.backend.dto.request.PlaceOrderRequest;
import com.rtrom.backend.dto.response.ApiResponse;
import com.rtrom.backend.dto.response.OrderResponse;
import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.enums.OrderStatus;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.UserRepository;
import com.rtrom.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @PostMapping
    @Operation(summary = "Place a new order from cart")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        User user = getAuthenticatedUser();
        OrderResponse response = orderService.placeOrder(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Order placed successfully"));
    }

    @GetMapping
    @Operation(summary = "Get my orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders() {
        User user = getAuthenticatedUser();
        List<OrderResponse> orders = orderService.getMyOrders(user.getId());
        return ResponseEntity.ok(ApiResponse.success(orders, "Orders fetched successfully"));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get a specific order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long orderId) {
        User user = getAuthenticatedUser();
        OrderResponse order = orderService.getOrderById(user.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Order fetched successfully"));
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel a pending order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long orderId) {
        User user = getAuthenticatedUser();
        OrderResponse order = orderService.cancelOrder(user.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Order cancelled successfully"));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders — admin only")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success(orders, "All orders fetched successfully"));
    }

    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status — admin only")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        OrderResponse order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Order status updated successfully"));
    }
}
