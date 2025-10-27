package com.frontdash.backend.repository;

import com.frontdash.backend.entity.OrderSummary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class OrderRepository {
    private final JdbcTemplate jdbc;

    public OrderRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<OrderSummary> createOrder(String restId, String staffId,
                                          double subtotal, double tax, double fee,
                                          String street, String city, String state, String zip) {
        // sp_create_order SELECTs one row with basic info
        return jdbc.query("CALL sp_create_order(?,?,?,?,?,?,?,?,?)",
                ps -> {
                    ps.setString(1, restId);
                    ps.setString(2, staffId);
                    ps.setBigDecimal(3, java.math.BigDecimal.valueOf(subtotal));
                    ps.setBigDecimal(4, java.math.BigDecimal.valueOf(tax));
                    ps.setBigDecimal(5, java.math.BigDecimal.valueOf(fee));
                    ps.setString(6, street);
                    ps.setString(7, city);
                    ps.setString(8, state);
                    ps.setString(9, zip);
                },
                (ResultSet rs, int rowNum) -> mapSummary(rs)
        );
    }

    public List<OrderSummary> assignDriver(String orderId, String driverId) {
        return jdbc.query("CALL sp_assign_driver(?,?)",
                ps -> {
                    ps.setString(1, orderId);
                    ps.setString(2, driverId);
                },
                (rs, i) -> new OrderSummary(
                        rs.getString("order_id"),
                        null,
                        rs.getString("driver_id"),
                        rs.getString("status"),
                        0.0,
                        null,
                        null
                ));
    }

    public List<OrderSummary> markDelivered(String orderId, LocalDateTime deliveredAt) {
        return jdbc.query("CALL sp_update_delivery_time(?,?)",
                ps -> {
                    ps.setString(1, orderId);
                    ps.setTimestamp(2, Timestamp.valueOf(deliveredAt));
                },
                (rs, i) -> {
                    LocalDateTime d = rs.getTimestamp("delivered_at") != null
                            ? rs.getTimestamp("delivered_at").toLocalDateTime()
                            : null;
                    return new OrderSummary(
                            rs.getString("order_id"),
                            null,
                            null,
                            rs.getString("status"),
                            0.0, null, d
                    );
                });
    }

    private OrderSummary mapSummary(ResultSet rs) throws java.sql.SQLException {
        LocalDateTime placed = rs.getTimestamp("placed_at") != null ?
                rs.getTimestamp("placed_at").toLocalDateTime() : null;
        return new OrderSummary(
                rs.getString("order_id"),
                rs.getString("restaurant_id"),
                null,
                rs.getString("status"),
                rs.getBigDecimal("total").doubleValue(),
                placed,
                null
        );
    }
}
