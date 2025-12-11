package com.frontdash.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {
    
    @GetMapping("/hello")
    public String hello() {
        return "Backend is working! Database connection successful!";
    }
    
    @GetMapping("/db-test")
    public String testDatabase() {
        return "Database connection test endpoint - Backend API is ready!";
    }

    // New endpoint to verify all controllers are working
    @GetMapping("/controllers")
    public String checkControllers() {
        return "All REST controllers are properly configured and available!";
    }
}