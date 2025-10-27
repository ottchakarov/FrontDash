package com.frontdash.backend.service;

import com.frontdash.backend.entity.OrderSummary;
import com.frontdash.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository repo;

    public OrderService(OrderRepository repo) { this.repo = repo; }

    public List<OrderSummary> create(String restId, String staffId, double subtotal, double tax, double fee,
                                     String street, String city, String state, String zip) {
        return repo.createOrder(restId, staffId, subtotal, tax, fee, street, city, state, zip);
    }

    public List<OrderSummary> assignDriver(String orderId, String driverId) {
        return repo.assignDriver(orderId, driverId);
    }

    public List<OrderSummary> deliver(String orderId, LocalDateTime when) {
        return repo.markDelivered(orderId, when != null ? when : LocalDateTime.now());
    }
}
