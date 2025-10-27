package com.frontdash.backend.controller;

import com.frontdash.backend.entity.CreateDriverRequest;
import com.frontdash.backend.entity.InactivateRequest;
import com.frontdash.backend.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin
public class DriverController {
    private final DriverService service;
    public DriverController(DriverService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateDriverRequest req) {
        return ResponseEntity.ok(service.create(req.firstName, req.lastName));
    }

    @PostMapping("/inactivate")
    public ResponseEntity<?> inactivate(@RequestBody InactivateRequest req) {
        return ResponseEntity.ok(service.inactivate(req.id));
    }
}
