// File: com/rtrom/backend/dto/request/UpdateCartItemQuantityRequest.java
package com.rtrom.backend.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCartItemQuantityRequest {

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}
