package com.frontdash.backend.service;

import com.frontdash.backend.repository.AuthRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthRepository repo;

    public AuthService(AuthRepository repo) { this.repo = repo; }

    public boolean login(String username, String plain) {
        return repo.verifyLogin(username, plain) == 1;
    }
}
