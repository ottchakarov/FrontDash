package com.frontdash.backend.test;

import com.frontdash.backend.FrontdashBackendApplication;
import com.frontdash.backend.entity.OrderSummary;
import com.frontdash.backend.service.ApprovalService;
import com.frontdash.backend.service.AuthService;
import com.frontdash.backend.service.DriverService;
import com.frontdash.backend.service.OrderService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class SalvadorDatabaseTestRunner {

    public static void main(String[] args) {
        System.out.println("\n=== FRONTDASH: SALVADOR TEST RUNNER (AUTO DEMO) ===\n");

        ConfigurableApplicationContext ctx =
                SpringApplication.run(FrontdashBackendApplication.class, args);

        AuthService auth = ctx.getBean(AuthService.class);
        OrderService orders = ctx.getBean(OrderService.class);
        DriverService drivers = ctx.getBean(DriverService.class);
        ApprovalService approval = ctx.getBean(ApprovalService.class);

        // Summary tracking
        boolean loginPassed = false;
        boolean orderPassed = false;
        boolean assignPassed = false;
        boolean deliverPassed = false;
        boolean driverPassed = false;
        boolean approvalPassed = false;

        try {
            // 1) LOGIN
            System.out.println("[1] LOGIN TESTS");
            boolean ok = auth.login("staff.jane", "secret123");
            boolean bad = auth.login("staff.jane", "wrongpass");
            System.out.println(" - Login OK  (staff.jane / secret123): " + ok);
            System.out.println(" - Login BAD (staff.jane / wrongpass): " + bad);
            loginPassed = ok && !bad;

            // 2) CREATE ORDER
            System.out.println("\n[2] CREATE ORDER");
            List<OrderSummary> created = orders.create(
                    "rest-001", "staff-002",
                    25.00, 2.06, 3.00,
                    "123 Main", "Dallas", "TX", "75205"
            );
            OrderSummary order = created.get(0);
            System.out.printf(" - Created: id=%s | total=%.2f | status=%s%n",
                    order.getOrderId(), order.getTotal(), order.getStatus());
            orderPassed = true;

            // 3) ASSIGN DRIVER
            System.out.println("\n[3] ASSIGN DRIVER");
            List<OrderSummary> afterAssign = orders.assignDriver(order.getOrderId(), "drv-001");
            OrderSummary assigned = afterAssign.get(0);
            System.out.printf(" - After assign: order=%s | driver=%s | status=%s%n",
                    assigned.getOrderId(), assigned.getDriverId(), assigned.getStatus());
            assignPassed = true;

            // 4) DELIVER ORDER
            System.out.println("\n[4] DELIVER ORDER");
            List<OrderSummary> afterDeliver = orders.deliver(order.getOrderId(), LocalDateTime.now());
            OrderSummary delivered = afterDeliver.get(0);
            System.out.printf(" - After deliver: order=%s | status=%s | deliveredAt=%s%n",
                    delivered.getOrderId(), delivered.getStatus(), delivered.getDeliveredAt());
            deliverPassed = true;

            // 5) DRIVER CRUD
            System.out.println("\n[5] DRIVER CRUD");
            Map<String,Object> newDriver = drivers.create("Sam", "Lopez");
            String newDriverId = String.valueOf(newDriver.get("driver_id"));
            System.out.println(" - Created driver: " + newDriverId);
            Map<String,Object> inactive = drivers.inactivate(newDriverId);
            System.out.println(" - Inactivated driver: " + inactive);
            driverPassed = true;

            // 6) APPROVAL
            System.out.println("\n[6] APPROVAL FLOW");
            Map<String,Object> req = approval.request("rest-001");
            System.out.println(" - Requested: " + req);
            Map<String,Object> dec = approval.decide("rest-001", "approved", "staff-001");
            System.out.println(" - Decided: " + dec);
            approvalPassed = true;

            // === SUMMARY ===
            System.out.println("\n-----------------------------------------");
            System.out.println("           SALVADOR'S TEST SUMMARY");
            System.out.println("-----------------------------------------");
            System.out.println(" Login:           " + (loginPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Create Order:    " + (orderPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Assign Driver:   " + (assignPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Delivery:        " + (deliverPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Driver CRUD:     " + (driverPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Approval Flow:   " + (approvalPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println("------------------------------------");

            if (loginPassed && orderPassed && assignPassed && deliverPassed && driverPassed && approvalPassed) {
                System.out.println(" ALL TESTS PASSED ✅");
            } else {
                System.out.println(" SOME TESTS FAILED ❌");
            }

            System.out.println("------------------------------------");
            System.out.println("\n=== DEMO COMPLETE ✅ ===\n");

        } catch (Exception e) {
            System.err.println("\n=== DEMO FAILED ❌ ===");
            e.printStackTrace(System.err);
        } finally {
            ctx.close();
        }
    }
}
