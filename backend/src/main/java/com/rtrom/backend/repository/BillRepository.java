package com.rtrom.backend.repository;

import com.rtrom.backend.domain.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    java.util.Optional<Bill> findByTableIdAndStatus(Long tableId, String status);
}
