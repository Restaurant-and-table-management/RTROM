// File: com/rtrom/backend/dto/response/OrderItemResponse.java
package com.rtrom.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemResponse {
    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private int quantity;
    private BigDecimal priceAtOrder;
    private BigDecimal subtotal;
}
