package com.frontdash.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public class StaffManagementRepository {
    private final JdbcTemplate jdbc;

    public StaffManagementRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<String, Object> createStaff(String userId,
                                           int roleId,
                                           String firstName,
                                           String lastName,
                                           String email,
                                           String phone,
                                           String username) {
        return jdbc.queryForMap(
                "CALL sp_create_staff(?,?,?,?,?,?,?)",
                userId, roleId, firstName, lastName, email, phone, username
        );
    }

    public Map<String, Object> inactivateStaff(String userId) {
        return jdbc.queryForMap("CALL sp_inactivate_staff(?)", userId);
    }
}
