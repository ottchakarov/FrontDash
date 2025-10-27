package com.frontdash.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AuthRepository {
    private final JdbcTemplate jdbc;

    public AuthRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    /** returns 1 or 0 using verify_login_sha256(username, plain) */
    public int verifyLogin(String username, String plain) {
        Integer ok = jdbc.queryForObject(
            "SELECT verify_login_sha256(?,?) AS ok",
            Integer.class, username, plain
        );
        return ok != null ? ok : 0;
    }
}
