import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(() => {
        fetch('https://stk-cable-system.onrender.com/api/customers')
          .then(res => res.json())
          .then(data => { setCustomers(data); setLoading(false); })
          .catch(err => { console.error('Failed to fetch customers', err); setLoading(false); });
      });
  }, []);

  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner"></div>
      <div className="spinner-text">Loading dashboard metrics...</div>
    </div>
  );

  // Process data
  const getStats = (provider) => {
    const pC = customers.filter(c => c.provider?.toLowerCase() === provider.toLowerCase());
    return {
      active: pC.filter(c => c.status === 'Active').length,
      deactive: pC.filter(c => c.status === 'Deactive' || c.status === 'Inactive').length,
      paid: pC.filter(c => c.paid === 'Paid').length,
      unpaid: pC.filter(c => c.paid === 'Not Paid' || !c.paid).length,
    };
  };

  const tcclStats = getStats('tccl');
  const gptlStats = getStats('gptl');

  const chartData = [
    {
      name: 'TCCL Provider',
      Active: tcclStats.active,
      Inactive: tcclStats.deactive,
      Paid: tcclStats.paid,
      Unpaid: tcclStats.unpaid,
    },
    {
      name: 'GPTL Provider',
      Active: gptlStats.active,
      Inactive: gptlStats.deactive,
      Paid: gptlStats.paid,
      Unpaid: gptlStats.unpaid,
    }
  ];

  const totalActive = tcclStats.active + gptlStats.active;
  const totalBoxes = customers.length;
  const totalPaid = tcclStats.paid + gptlStats.paid;
  const totalUnpaid = tcclStats.unpaid + gptlStats.unpaid;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Network Dashboard Overview</h2>
          <p>Real-time analytics across TCCL & GPTL cable subscribers</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-purple stagger-1">
          <div className="stat-header">
            <span className="stat-label">Total Connections</span>
            <div className="stat-icon stat-icon-purple">📦</div>
          </div>
          <div className="stat-value text-gradient">{totalBoxes}</div>
          <div className="stat-sub">
            <span>Total registered setup boxes</span>
          </div>
        </div>

        <div className="stat-card stat-card-cyan stagger-2">
          <div className="stat-header">
            <span className="stat-label">Active Subscribers</span>
            <div className="stat-icon stat-icon-cyan">⚡</div>
          </div>
          <div className="stat-value">{totalActive}</div>
          <div className="stat-sub">
            <span style={{ color: '#34d399' }}>{totalBoxes > 0 ? Math.round((totalActive / totalBoxes) * 100) : 0}%</span> of total network
          </div>
        </div>

        <div className="stat-card stat-card-green stagger-3">
          <div className="stat-header">
            <span className="stat-label">Paid Subscriptions</span>
            <div className="stat-icon stat-icon-green">✅</div>
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>{totalPaid}</div>
          <div className="stat-sub">
            <span>Current month cleared</span>
          </div>
        </div>

        <div className="stat-card stat-card-pink stagger-4">
          <div className="stat-header">
            <span className="stat-label">Pending Payments</span>
            <div className="stat-icon stat-icon-pink">⏳</div>
          </div>
          <div className="stat-value" style={{ color: '#f87171' }}>{totalUnpaid}</div>
          <div className="stat-sub">
            <span>Awaiting collection</span>
          </div>
        </div>
      </div>

      {/* Provider Breakdown Cards */}
      <div className="section-title stagger-5">
        <div className="section-title-bar"></div>
        <span>Provider Breakdown</span>
      </div>

      <div className="provider-grid stagger-5">
        {/* TCCL Card */}
        <div className="provider-card">
          <div className="provider-card-title">
            <span className="provider-dot" style={{ background: 'var(--primary-light)' }}></span>
            <span>TCCL Service Provider</span>
            <span className="tag" style={{ marginLeft: 'auto' }}>{tcclStats.active + tcclStats.deactive} Boxes</span>
          </div>

          <div className="provider-stat-row">
            <span className="text-dim">Active Connections</span>
            <span className="provider-stat-val" style={{ color: 'var(--primary-light)' }}>{tcclStats.active}</span>
          </div>
          <div className="provider-stat-row">
            <span className="text-dim">Inactive Connections</span>
            <span className="provider-stat-val text-muted">{tcclStats.deactive}</span>
          </div>
          <div className="provider-stat-row">
            <span className="text-dim">Paid Status</span>
            <span className="provider-stat-val" style={{ color: '#34d399' }}>{tcclStats.paid}</span>
          </div>
          <div className="provider-stat-row">
            <span className="text-dim">Unpaid Status</span>
            <span className="provider-stat-val" style={{ color: '#f87171' }}>{tcclStats.unpaid}</span>
          </div>
        </div>

        {/* GPTL Card */}
        <div className="provider-card">
          <div className="provider-card-title">
            <span className="provider-dot" style={{ background: 'var(--accent)' }}></span>
            <span>GPTL Service Provider</span>
            <span className="tag" style={{ marginLeft: 'auto' }}>{gptlStats.active + gptlStats.deactive} Boxes</span>
          </div>

          <div className="provider-stat-row">
            <span className="text-dim">Active Connections</span>
            <span className="provider-stat-val" style={{ color: 'var(--accent)' }}>{gptlStats.active}</span>
          </div>
          <div className="provider-stat-row">
            <span className="text-dim">Inactive Connections</span>
            <span className="provider-stat-val text-muted">{gptlStats.deactive}</span>
          </div>
          <div className="provider-stat-row">
            <span className="text-dim">Paid Status</span>
            <span className="provider-stat-val" style={{ color: '#34d399' }}>{gptlStats.paid}</span>
          </div>
          <div className="provider-stat-row">
            <span className="text-dim">Unpaid Status</span>
            <span className="provider-stat-val" style={{ color: '#f87171' }}>{gptlStats.unpaid}</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-card stagger-5">
        <div className="chart-title">Visual Analytics Comparison</div>
        <div className="chart-sub">Comparing Active vs Inactive & Paid vs Unpaid status per Provider</div>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '15px' }} />
              <Bar dataKey="Active" fill="var(--primary-light)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Inactive" fill="#475569" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Paid" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Unpaid" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
