import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import DatabaseInterface from '../../db/DatabaseInterface'; // existing in your app
import WithdrawSessionInterface from '../../db/WithdrawSessionInterface';
import './Withdraw.css';

export default function Withdraw() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [status, setStatus] = useState(null); // {status, requestedAt, decisionAt, reason}
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // local spinner while request goes through

  useEffect(() => {
    // load restaurant meta and withdraw status
    DatabaseInterface.getRestaurantInfo().then((info) => setRestaurantInfo(info)).catch(() => {});
    loadStatus();
  }, []);

  function loadStatus() {
    setLoading(true);
    WithdrawSessionInterface.getWithdrawStatus()
      .then((s) => setStatus(s))
      .finally(() => setLoading(false));
  }

  async function handleWithdrawClick() {
    // final confirm
    const ok = window.confirm(
      'You are requesting to withdraw your restaurant from FrontDash. This request must be reviewed by FrontDash staff and is not immediate. Do you want to continue?'
    );
    if (!ok) return;
    setProcessing(true);
    try {
      const updated = await WithdrawSessionInterface.requestWithdraw();
      setStatus(updated);
      // Note: in a real setup you might await server response and show success/failure.
    } catch (err) {
      console.error(err);
      alert('Failed to request withdrawal. Try again later.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleCancelPending() {
    if (!status || status.status !== 'pending') return;
    const ok = window.confirm('Cancel your pending withdrawal request?');
    if (!ok) return;
    try {
      await WithdrawSessionInterface.cancelWithdrawRequest();
      await loadStatus();
      alert('Withdraw request cancelled (session-only).');
    } catch (err) {
      console.error(err);
      alert('Could not cancel withdraw request.');
    }
  }

  // Convenience display helpers
  function niceDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  // Status message block that appears beneath the button (per spec)
  function renderStatusMessage() {
    if (!status || status.status === 'none') return null;

    if (status.status === 'pending') {
      return (
        <div className="status-block status-pending" role="status" aria-live="polite">
          <h3>Your withdrawal request is being processed</h3>
          <p>
            FrontDash employees are reviewing your request. We'll notify you when a decision is reached.
            Requested at: <strong>{niceDate(status.requestedAt)}</strong>
          </p>
          <div className="status-actions">
            <button className="control-btn small" onClick={handleCancelPending}>Cancel Request</button>
          </div>
        </div>
      );
    }

    if (status.status === 'approved') {
      return (
        <div className="status-block status-approved" role="status" aria-live="polite">
          <h3>Your withdrawal has been approved</h3>
          <p>Your restaurant listing has been removed from FrontDash. Decision at: <strong>{niceDate(status.decisionAt)}</strong></p>
        </div>
      );
    }

    if (status.status === 'denied') {
      return (
        <div className="status-block status-denied" role="status" aria-live="polite">
          <h3>Your withdrawal request was denied</h3>
          <p>
            Reason: <strong>{status.reason ?? 'Not specified'}</strong>
          </p>
          <p>Decision at: <strong>{niceDate(status.decisionAt)}</strong></p>
          <p>If you believe this is incorrect, please contact FrontDash support.</p>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="app-root withdraw-root">
      <h1 className="page-title">
        {restaurantInfo?.name ? `Welcome to Your Account Page for ${restaurantInfo.name}!` : 'Welcome To Your Account Page!'}
      </h1>

      <div className="content">
        <Sidebar restaurantName={restaurantInfo?.name ?? 'Loading...'} status={restaurantInfo?.status} />

        <main className="main-panel" aria-live="polite">
          <div className="panel-inner withdraw-panel">
            <div className="page-subtitle">Withdrawing From FrontDash</div>

            <div className="withdraw-container">
              <div className="withdraw-blurb">
                <p>
                  If you withdraw from FrontDash, your restaurant will be removed from public listings after review.
                  The withdrawal must be approved by FrontDash staff — this process may take some time.
                </p>
                <p>
                  Please make sure you review our withdrawal rules (refunds, outstanding orders, etc.) before requesting withdrawal.
                </p>
              </div>

              <div className="withdraw-action">
                <button
                  className="withdraw-btn"
                  onClick={handleWithdrawClick}
                  disabled={processing || (status && status.status === 'pending')}
                  aria-disabled={processing || (status && status.status === 'pending')}
                >
                  {processing ? 'Processing...' : 'WITHDRAW'}
                </button>
              </div>

              {/* big status text below the button */}
              <div className="withdraw-status-area">
                {loading ? <div className="loading">Loading status...</div> : renderStatusMessage()}
              </div>

              {/* placeholder/hook for DB integration */}
              <div className="integration-note">
                <small>
                  Note: this interface is session-only now. Replace <code>WithdrawSessionInterface</code> with your server-side API to persist requests and to display real approval/denial updates.
                </small>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
