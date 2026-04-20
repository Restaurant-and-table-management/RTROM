// File: com/rtrom/backend/service/impl/CartServiceImpl.java
package com.rtrom.backend.service.impl;

import com.rtrom.backend.dto.request.AddCartItemRequest;
import com.rtrom.backend.dto.request.UpdateCartItemQuantityRequest;
import com.rtrom.backend.dto.response.CartResponse;
import com.rtrom.backend.entity.Cart;
import com.rtrom.backend.entity.CartItem;
import com.rtrom.backend.domain.model.MenuItem;
import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.exception.AccessDeniedException;
import com.rtrom.backend.mapper.CartMapper;
import com.rtrom.backend.repository.CartItemRepository;
import com.rtrom.backend.repository.CartRepository;
import com.rtrom.backend.repository.MenuItemRepository;
import com.rtrom.backend.repository.UserRepository;
import com.rtrom.backend.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           MenuItemRepository menuItemRepository,
                           UserRepository userRepository,
                           CartMapper cartMapper) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
        this.cartMapper = cartMapper;
    }

    @Override
    public CartResponse getCart(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            CartResponse emptyResponse = new CartResponse();
            emptyResponse.setUserId(userId);
            emptyResponse.setItems(java.util.Collections.emptyList());
            emptyResponse.setTotalAmount(java.math.BigDecimal.ZERO);
            return emptyResponse;
        }
        return cartMapper.toCartResponse(cartOpt.get());
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, AddCartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getMenuItem().getId().equals(request.getMenuItemId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            // unitPrice is intentionally not updated here per standard cart rules,
            // or we could update it. The prompt says "increment quantity instead of inserting a duplicate row"
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setMenuItem(menuItem);
            newItem.setQuantity(request.getQuantity());
            newItem.setUnitPrice(menuItem.getPrice());
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return cartMapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long cartItemId, UpdateCartItemQuantityRequest request) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("This cart item does not belong to your cart");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return cartMapper.toCartResponse(cartItem.getCart());
    }

    @Override
    @Transactional
    public void removeItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new AccessDeniedException("This cart item does not belong to your cart");
        }

        Cart cart = cartItem.getCart();
        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
