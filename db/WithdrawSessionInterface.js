// src/db/WithdrawSessionInterface.js
// Session-only Withdraw request interface. Promise-based to make swapping for DB trivial later.

let _state = {
  // states: 'none' | 'pending' | 'approved' | 'denied'
  status: 'none',
  requestedAt: null,   // ISO string when requested
  decisionAt: null,    // ISO string when approved/denied
  reason: null,        // optional reason when denied
};

// Return the current withdraw status (copy)
function getWithdrawStatus() {
  return Promise.resolve(JSON.parse(JSON.stringify(_state)));
}

/**
 * Request withdrawal.
 * If already pending, returns the existing pending object.
 * In a real app this would send a request to server and return the server response.
 */
function requestWithdraw() {
  if (_state.status === 'pending') {
    return Promise.resolve(JSON.parse(JSON.stringify(_state)));
  }
  _state = {
    status: 'pending',
    requestedAt: new Date().toISOString(),
    decisionAt: null,
    reason: null,
  };
  return Promise.resolve(JSON.parse(JSON.stringify(_state)));
}

/**
 * Cancel a pending request (session-only convenience)
 */
function cancelWithdrawRequest() {
  if (_state.status !== 'pending') {
    return Promise.reject(new Error('No pending withdraw request to cancel'));
  }
  _state = {
    status: 'none',
    requestedAt: null,
    decisionAt: null,
    reason: null,
  };
  return Promise.resolve(JSON.parse(JSON.stringify(_state)));
}

/**
 * For testing / admin simulation only:
 * Mark the request approved/denied. In a real system these would be done by staff.
 * These functions exist so it's easy to mock server behaviour during dev.
 */
function markApproved() {
  if (_state.status !== 'pending') {
    return Promise.reject(new Error('No pending request to approve'));
  }
  _state.status = 'approved';
  _state.decisionAt = new Date().toISOString();
  return Promise.resolve(JSON.parse(JSON.stringify(_state)));
}

function markDenied(reason = 'Not specified') {
  if (_state.status !== 'pending') {
    return Promise.reject(new Error('No pending request to deny'));
  }
  _state.status = 'denied';
  _state.reason = String(reason);
  _state.decisionAt = new Date().toISOString();
  return Promise.resolve(JSON.parse(JSON.stringify(_state)));
}

export default {
  getWithdrawStatus,
  requestWithdraw,
  cancelWithdrawRequest,
  markApproved, // dev helper
  markDenied,   // dev helper
};
