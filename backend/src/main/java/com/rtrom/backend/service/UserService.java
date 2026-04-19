package com.rtrom.backend.service;

import com.rtrom.backend.domain.model.User;
import com.rtrom.backend.dto.user.UpdateRoleRequest;
import com.rtrom.backend.dto.user.UserResponse;
import com.rtrom.backend.exception.BadRequestException;
import com.rtrom.backend.exception.ResourceNotFoundException;
import com.rtrom.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse updateUserRole(Long userId, UpdateRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setRole(request.role());
        return UserResponse.from(userRepository.save(user));
    }

    public void deleteUser(Long userId, String currentUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getEmail().equals(currentUsername)) {
            throw new BadRequestException("You cannot delete your own account.");
        }

        try {
            logger.info("Attempting to delete user: {} (ID: {})", user.getEmail(), userId);
            userRepository.delete(user);
            userRepository.flush();
            logger.info("Successfully deleted user: {}", user.getEmail());
        } catch (DataIntegrityViolationException ex) {
            logger.warn("Failed to delete user {} due to integrity violation: {}", user.getEmail(), ex.getMessage());
            throw new BadRequestException("User cannot be deleted because they have associated reservations or orders.");
        } catch (Exception ex) {
            logger.error("Unexpected error deleting user {}: ", user.getEmail(), ex);
            throw ex;
        }
    }
}
