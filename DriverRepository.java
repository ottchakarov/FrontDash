package com.frontdash.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public class DriverRepository {
    private final JdbcTemplate jdbc;

    public DriverRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Map<String,Object> createDriver(String first, String last) {
        return jdbc.queryForMap("CALL sp_create_driver(?,?)", first, last);
    }

    public Map<String,Object> inactivateDriver(String driverId) {
        return jdbc.queryForMap("CALL sp_inactivate_driver(?)", driverId);
    }
}
