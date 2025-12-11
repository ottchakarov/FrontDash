package com.frontdash.backend.service;

import com.frontdash.backend.entity.Withdraw;
import com.frontdash.backend.entity.Restaurant;
import com.frontdash.backend.repository.WithdrawRepository;
import com.frontdash.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WithdrawalService {

    @Autowired
    private WithdrawRepository withdrawRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    // Withdrawal request operations
    public List<Withdraw> getAllWithdrawalRequests() {
        return withdrawRepository.findAll();
    }

    public List<Withdraw> getWithdrawalRequestsByStatus(String status) {
        return withdrawRepository.findByWithdrawStatusOrderByRequestedAtAsc(status);
    }

    public Optional<Withdraw> getWithdrawalRequest(String restaurantId) {
        return withdrawRepository.findByRestaurantId(restaurantId);
    }

    public Withdraw requestWithdrawal(String restaurantId, String description) {
        // Check if there's already a pending request
        if (withdrawRepository.existsByRestaurantIdAndWithdrawStatus(restaurantId, "pending")) {
            throw new RuntimeException("A withdrawal request is already pending for this restaurant");
        }

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));

        Withdraw withdrawRequest = new Withdraw(restaurant);
        withdrawRequest.setWithdrawDescription(description);
        withdrawRequest.setWithdrawStatus("pending");
        withdrawRequest.setRequestedAt(LocalDateTime.now());

        return withdrawRepository.save(withdrawRequest);
    }

    public Optional<Withdraw> cancelWithdrawalRequest(String restaurantId) {
        return withdrawRepository.findByRestaurantId(restaurantId).map(withdraw -> {
            if ("pending".equals(withdraw.getWithdrawStatus())) {
                withdrawRepository.delete(withdraw);
                return withdraw;
            } else {
                throw new RuntimeException("Cannot cancel a request that is not pending");
            }
        });
    }

    // Admin operations
    public Optional<Withdraw> approveWithdrawal(String restaurantId) {
        return withdrawRepository.findByRestaurantId(restaurantId).map(withdraw -> {
            if ("pending".equals(withdraw.getWithdrawStatus())) {
                withdraw.setWithdrawStatus("approved");
                withdraw.setDecisionAt(LocalDateTime.now());
                return withdrawRepository.save(withdraw);
            } else {
                throw new RuntimeException("Can only approve pending requests");
            }
        });
    }

    public Optional<Withdraw> denyWithdrawal(String restaurantId, String reason) {
        return withdrawRepository.findByRestaurantId(restaurantId).map(withdraw -> {
            if ("pending".equals(withdraw.getWithdrawStatus())) {
                withdraw.setWithdrawStatus("denied");
                withdraw.setDenyReason(reason);
                withdraw.setDecisionAt(LocalDateTime.now());
                return withdrawRepository.save(withdraw);
            } else {
                throw new RuntimeException("Can only deny pending requests");
            }
        });
    }

    // Status checking
    public boolean hasPendingRequest(String restaurantId) {
        return withdrawRepository.existsByRestaurantIdAndWithdrawStatus(restaurantId, "pending");
    }

    public String getWithdrawalStatus(String restaurantId) {
        return withdrawRepository.findByRestaurantId(restaurantId)
            .map(Withdraw::getWithdrawStatus)
            .orElse("none");
    }

    // Statistics
    public long getPendingRequestCount() {
        return withdrawRepository.countByWithdrawStatus("pending");
    }

    public long getApprovedRequestCount() {
        return withdrawRepository.countByWithdrawStatus("approved");
    }

    public long getDeniedRequestCount() {
        return withdrawRepository.countByWithdrawStatus("denied");
    }
}