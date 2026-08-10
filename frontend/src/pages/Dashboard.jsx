import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/customers')
      .then(res => res.json())
      .then(data => { setCustomers(data); setLoading(false); })
      .catch(() => {
        fetch('https://stk-cable-system.onrender.com/api/customers')
          .then(res => res.json())
          .then(data => { setCustomers(data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
      Loading analytics data...
    </div>
  );

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
    { name: 'TCCL Provider', Active: tcclStats.active, Inactive: tcclStats.deactive, Paid: tcclStats.paid, Unpaid: tcclStats.unpaid },
    { name: 'GPTL Provider', Active: gptlStats.active, Inactive: gptlStats.deactive, Paid: gptlStats.paid, Unpaid: gptlStats.unpaid }
  ];

  const totalActive = tcclStats.active + gptlStats.active;
  const totalBoxes = customers.length;
  const totalPaid = tcclStats.paid + gptlStats.paid;
  const totalUnpaid = tcclStats.unpaid + gptlStats.unpaid;

  return (
    <div>
      {/* 4 Stat Cards */}
      <div className="stats-grid-dashboard">
        <div className="stat-card-neat stat-card-purple">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Connections</span>
            <div className="stat-card-icon icon-purple">📦</div>
          </div>
          <div className="stat-card-val text-gradient">{totalBoxes}</div>
          <div className="stat-card-sub">Registered setup box accounts</div>
        </div>

        <div className="stat-card-neat stat-card-cyan">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Subscribers</span>
            <div className="stat-card-icon icon-cyan">⚡</div>
          </div>
          <div className="stat-card-val">{totalActive}</div>
          <div className="stat-card-sub"><span style={{ color: '#34d399', fontWeight: 600 }}>{totalBoxes > 0 ? Math.round((totalActive / totalBoxes) * 100) : 0}%</span> network active rate</div>
        </div>

        <div className="stat-card-neat stat-card-green">
          <div className="stat-card-header">
            <span className="stat-card-title">Paid Accounts</span>
            <div className="stat-card-icon icon-green">✅</div>
          </div>
          <div className="stat-card-val" style={{ color: '#34d399' }}>{totalPaid}</div>
          <div className="stat-card-sub">Current month cleared</div>
        </div>

        <div className="stat-card-neat stat-card-pink">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Unpaid</span>
            <div className="stat-card-icon icon-pink">⏳</div>
          </div>
          <div className="stat-card-val" style={{ color: '#f87171' }}>{totalUnpaid}</div>
          <div className="stat-card-sub">Awaiting fee collection</div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-grid-two">
        {/* Provider Breakdown Box */}
        <div className="card-panel">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Service Providers</h3>
          
          {/* TCCL */}
          <div className="provider-box-item">
            <div className="provider-header">
              <span style={{ color: 'var(--primary-light)' }}>● TCCL Provider</span>
              <span className="badge badge-tccl">{tcclStats.active + tcclStats.deactive} Boxes</span>
            </div>
            <div className="provider-stat-line"><span>Active Connections</span><strong style={{ color: 'var(--primary-light)' }}>{tcclStats.active}</strong></div>
            <div className="provider-stat-line"><span>Inactive Connections</span><span>{tcclStats.deactive}</span></div>
            <div className="provider-stat-line"><span>Paid Status</span><strong style={{ color: '#34d399' }}>{tcclStats.paid}</strong></div>
            <div className="provider-stat-line"><span>Unpaid Status</span><strong style={{ color: '#f87171' }}>{tcclStats.unpaid}</strong></div>
          </div>

          {/* GPTL */}
          <div className="provider-box-item">
            <div className="provider-header">
              <span style={{ color: 'var(--accent)' }}>● GPTL Provider</span>
              <span className="badge badge-gptl">{gptlStats.active + gptlStats.deactive} Boxes</span>
            </div>
            <div className="provider-stat-line"><span>Active Connections</span><strong style={{ color: 'var(--accent)' }}>{gptlStats.active}</strong></div>
            <div className="provider-stat-line"><span>Inactive Connections</span><span>{gptlStats.deactive}</span></div>
            <div className="provider-stat-line"><span>Paid Status</span><strong style={{ color: '#34d399' }}>{gptlStats.paid}</strong></div>
            <div className="provider-stat-line"><span>Unpaid Status</span><strong style={{ color: '#f87171' }}>{gptlStats.unpaid}</strong></div>
          </div>
        </div>

        {/* Analytics Chart Panel */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Visual Analytics Comparison</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Distribution of active, inactive, paid and unpaid statuses per provider</p>
          
          <div style={{ width: '100%', height: 320, flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#131a2b', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Active" fill="var(--primary-light)" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Inactive" fill="#475569" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Paid" fill="#10b981" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Unpaid" fill="#ef4444" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
