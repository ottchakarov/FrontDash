package com.frontdash.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @Column(name = "order_id")
    private String orderId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "status")
    private String orderStatus;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "total_amount")
    private Double totalAmount;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    @JsonIgnore
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {}

    // Getters and Setters
    public String getOrderId() { return orderId; }
    public void setOrderId(String id) { this.orderId = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String n) { this.customerName = n; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String a) { this.deliveryAddress = a; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String s) { this.orderStatus = s; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime d) { this.orderDate = d; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double t) { this.totalAmount = t; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant r) { this.restaurant = r; }
    public Driver getDriver() { return driver; }
    public void setDriver(Driver d) { this.driver = d; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> i) { this.items = i; }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
