// File: com/rtrom/backend/dto/request/PlaceOrderRequest.java
package com.rtrom.backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceOrderRequest {

    private Integer tableNumber;

    @Size(max = 500)
    private String notes;
}
