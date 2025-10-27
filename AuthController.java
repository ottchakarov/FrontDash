package com.frontdash.backend.controller;

import com.frontdash.backend.entity.LoginRequest;
import com.frontdash.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) { this.service = service; }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        boolean ok = service.login(req.getUsername(), req.getPassword());
        return ResponseEntity.ok().body(java.util.Map.of("ok", ok));
    }
}
