package com.frontdash.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Repository
public class ApprovalRepository {
    private final JdbcTemplate jdbc;

    public ApprovalRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Map<String,Object> requestRegistration(String restaurantId) {
        return jdbc.queryForMap("CALL sp_request_registration(?)", restaurantId);
    }

    public Map<String,Object> decideRegistration(String restaurantId, String status, String adminId) {
        return jdbc.queryForMap("CALL sp_decide_registration(?,?,?)", restaurantId, status, adminId);
    }

    public List<Map<String, Object>> findPending() {
        try {
            return jdbc.queryForList("SELECT restaurant_id, approval_status, decided_at FROM approval WHERE approval_status = 'pending'");
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
