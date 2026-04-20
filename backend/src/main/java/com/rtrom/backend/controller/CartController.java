// File: com/rtrom/backend/controller/CartController.java
package com.rtrom.backend.controller;

import com.rtrom.backend.dto.request.AddCartItemRequest;
import com.rtrom.backend.dto.request.UpdateCartItemQuantityRequest;
import com.rtrom.backend.dto.response.ApiResponse;
import com.rtrom.backend.dto.response.CartResponse;
import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.UserRepository;
import com.rtrom.backend.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@Tag(name = "Cart", description = "Cart management endpoints")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        User user = getAuthenticatedUser();
        CartResponse cartResponse = cartService.getCart(user.getId());
        return ResponseEntity.ok(ApiResponse.success(cartResponse, "Cart fetched successfully"));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(@Valid @RequestBody AddCartItemRequest request) {
        User user = getAuthenticatedUser();
        CartResponse cartResponse = cartService.addItem(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(cartResponse, "Item added to cart"));
    }

    @PutMapping("/items/{cartItemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemQuantityRequest request) {
        User user = getAuthenticatedUser();
        CartResponse cartResponse = cartService.updateItemQuantity(user.getId(), cartItemId, request);
        return ResponseEntity.ok(ApiResponse.success(cartResponse, "Cart item quantity updated"));
    }

    @DeleteMapping("/items/{cartItemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable Long cartItemId) {
        User user = getAuthenticatedUser();
        cartService.removeItem(user.getId(), cartItemId);
        return ResponseEntity.ok(ApiResponse.success(null, "Item removed from cart"));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        User user = getAuthenticatedUser();
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared successfully"));
    }
}
