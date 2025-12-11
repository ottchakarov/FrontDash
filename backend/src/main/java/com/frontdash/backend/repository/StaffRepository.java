package com.frontdash.backend.repository;

import com.frontdash.backend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, String> {
    
    // Find staff by email
    Optional<Staff> findByEmail(String email);

    // Find staff by their userId (primary key)
    Optional<Staff> findByUserId(String userId);
    
    // Check if staff exists by email
    boolean existsByEmail(String email);
    
    // Find staff by role
    java.util.List<Staff> findByRoleId(Integer roleId);
}
