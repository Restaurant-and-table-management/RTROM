package com.rtrom.backend.controller;

public record AuthResponse(
    String token,
    String role,
    String firstName,
    String lastName,
    String email
) {
}
