/*package com.frontdash.backend.test;

import com.frontdash.backend.FrontdashBackendApplication;
import com.frontdash.backend.entity.OrderSummary;
import com.frontdash.backend.entity.MenuItem;
import com.frontdash.backend.entity.RestaurantHours;
import com.frontdash.backend.service.*;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.LocalTime;
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
        StaffManagementService staffMgmt = ctx.getBean(StaffManagementService.class);
        MenuService menuService = ctx.getBean(MenuService.class);
        RestaurantService restaurantService = ctx.getBean(RestaurantService.class);
        WithdrawalService withdrawalService = ctx.getBean(WithdrawalService.class);

        // Summary tracking
        boolean loginPassed = false;
        boolean orderPassed = false;
        boolean assignPassed = false;
        boolean deliverPassed = false;
        boolean driverPassed = false;
        boolean approvalPassed = false;
        boolean staffPassed = false;
        boolean ownerOpsPassed = false;
        boolean withdrawalPassed = false;

        try {
            // 1) LOGIN
            System.out.println("[1] LOGIN TESTS");
            boolean ok = auth.login("smith02", "secret123");
            boolean bad = auth.login("smith02", "wrongpass");
            System.out.println(" - Login OK  (smith02 / secret123): " + ok);
            System.out.println(" - Login BAD (smith02 / wrongpass): " + bad);
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

            // 6) STAFF CRUD (via stored procedure)
            System.out.println("\n[6] STAFF CRUD");
            Map<String,Object> staffCreated = staffMgmt.createStaff(
                    "staff-auto-001",
                    0,
                    "Auto",
                    "Staffer",
                    "auto.staffer@frontdash.com",
                    "555-3030",
                    "staffer07"
            );
            System.out.println(" - Created staff: " + staffCreated);
            Map<String,Object> staffInactive = staffMgmt.inactivateStaff("staff-auto-001");
            System.out.println(" - Inactivated staff: " + staffInactive);
            staffPassed = true;

            // 7) OWNER OPS (menu + hours)
            System.out.println("\n[7] OWNER OPERATIONS");
            MenuItem before = menuService.getMenuItem("menu-001").orElseThrow();
            var updatedItem = menuService.updateMenuItem("menu-001", new MenuItem() {{
                setFoodName("Bruschetta Special");
                setPrice(BigDecimal.valueOf(9.25));
                setIsAvailable(Boolean.TRUE);
            }});
            System.out.println(" - Menu item update: " + updatedItem.getFoodName() + " $" + updatedItem.getPrice());

            RestaurantHours monday = restaurantService.getOperatingHours("rest-001").stream()
                    .filter(h -> h.getWeekday() == 1)
                    .findFirst()
                    .orElseThrow();
            monday.setOpensAt(java.sql.Time.valueOf(LocalTime.of(8, 0)));
            monday.setClosesAt(java.sql.Time.valueOf(LocalTime.of(22, 0)));
            restaurantService.saveOperatingHours("rest-001", monday);
            System.out.println(" - Updated Monday hours to 08:00 - 22:00");
            ownerOpsPassed = true;

            // 8) APPROVAL
            System.out.println("\n[8] APPROVAL FLOW");
            Map<String,Object> req = approval.request("rest-001");
            System.out.println(" - Requested: " + req);
            Map<String,Object> dec = approval.decide("rest-001", "approved", "staff-001");
            System.out.println(" - Decided: " + dec);
            approvalPassed = true;

            // 9) WITHDRAWAL FLOW
            System.out.println("\n[9] WITHDRAWAL FLOW");
            var withdrawRequest = withdrawalService.requestWithdrawal("rest-001", "Seasonal closure");
            System.out.println(" - Requested withdrawal: " + withdrawRequest.getWithdrawStatus());
            withdrawalService.approveWithdrawal("rest-001").ifPresent(result ->
                    System.out.println(" - Approved withdrawal at: " + result.getDecisionAt())
            );
            withdrawalPassed = true;

            // === SUMMARY ===
            System.out.println("\n-----------------------------------------");
            System.out.println("           SALVADOR'S TEST SUMMARY");
            System.out.println("-----------------------------------------");
            System.out.println(" Login:           " + (loginPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Create Order:    " + (orderPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Assign Driver:   " + (assignPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Delivery:        " + (deliverPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Driver CRUD:     " + (driverPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Staff CRUD:      " + (staffPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Owner Ops:       " + (ownerOpsPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Approval Flow:   " + (approvalPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println(" Withdrawal Flow: " + (withdrawalPassed ? "PASSED ✅" : "FAILED ❌"));
            System.out.println("------------------------------------");

            if (loginPassed && orderPassed && assignPassed && deliverPassed && driverPassed
                    && staffPassed && ownerOpsPassed && approvalPassed && withdrawalPassed) {
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
*/