package com.frontdash.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String foodName;
    private Integer quantity;
    private Double price;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    public OrderItem() {}

    public OrderItem(String name, Integer qty, Double price) {
        this.foodName = name; 
        this.quantity = qty; 
        this.price = price;
    }

    public Long getId() { return id; }
    public String getFoodName() { return foodName; }
    public Integer getQuantity() { return quantity; }
    public Double getPrice() { return price; }
    public Order getOrder() { return order; }
    public void setOrder(Order o) { this.order = o; }
}