package com.frontdash.backend.entity;

public class DeliverRequest {
    public String orderId;
    /** optional; if null we’ll use NOW() */
    public String deliveredAt; // ISO string or null
}
