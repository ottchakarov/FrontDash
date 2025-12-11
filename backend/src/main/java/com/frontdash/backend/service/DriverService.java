package com.frontdash.backend.service;

import com.frontdash.backend.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DriverService {
    private final DriverRepository repo;
    public DriverService(DriverRepository repo) { this.repo = repo; }

    public Map<String,Object> create(String first, String last) {
        return repo.createDriver(first, last);
    }
    public Map<String,Object> inactivate(String driverId) {
        return repo.inactivateDriver(driverId);
    }
}
