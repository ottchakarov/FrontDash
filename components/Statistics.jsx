import React from 'react';

/**
 * Simple statistics visualization:
 * - Top items as horizontal bars (pure CSS)
 * - KPIs for mean order size, mean order cost, total orders, revenue
 *
 * This component expects a `data` object shaped like:
 * {
 *   topItems: [{ name, count }, ...],
 *   meanOrderSize: 2.3,
 *   meanOrderCost: 18.45,
 *   totalOrders: 123,
 *   totalRevenue: 2265.50
 * }
 *
 */
export default function Statistics({ data }) {
  const { topItems, meanOrderSize, meanOrderCost, totalOrders, totalRevenue } = data;

  const maxCount = Math.max(...topItems.map(it => it.count), 1);

  return (
    <div className="statistics-root">
      <h2 className="statistics-title">Restaurant Performance Statistics</h2>

      <section className="kpi-grid" aria-label="Key performance indicators">
        <div className="kpi">
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-value">{totalOrders}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Items / Order</div>
          <div className="kpi-value">{meanOrderSize.toFixed(2)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Order ($)</div>
          <div className="kpi-value">${meanOrderCost.toFixed(2)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">${totalRevenue.toFixed(2)}</div>
        </div>
      </section>

      <section className="top-items" aria-label="Top selling items">
        <h3>Top Items</h3>
        <div className="bars">
          {topItems.map((it) => {
            const pct = Math.round((it.count / maxCount) * 100);
            return (
              <div className="bar-row" key={it.name}>
                <div className="bar-label">{it.name}</div>
                <div className="bar-wrap">
                  <div className="bar-fill" style={{ width: `${pct}%` }}>
                    <span className="bar-count">{it.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
