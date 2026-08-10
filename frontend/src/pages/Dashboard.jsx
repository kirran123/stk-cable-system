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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
      Loading analytics...
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
    { name: 'TCCL', Active: tcclStats.active, Inactive: tcclStats.deactive, Paid: tcclStats.paid, Unpaid: tcclStats.unpaid },
    { name: 'GPTL', Active: gptlStats.active, Inactive: gptlStats.deactive, Paid: gptlStats.paid, Unpaid: gptlStats.unpaid }
  ];

  const totalActive = tcclStats.active + gptlStats.active;
  const totalBoxes = customers.length;
  const totalPaid = tcclStats.paid + gptlStats.paid;
  const totalUnpaid = tcclStats.unpaid + gptlStats.unpaid;

  return (
    <div className="dashboard-container">
      {/* 4 Compact Stat Cards */}
      <div className="stats-grid-compact">
        <div className="stat-card-compact stat-card-purple">
          <span className="stat-label-compact">Total Boxes</span>
          <div className="stat-val-compact text-gradient">{totalBoxes}</div>
          <span className="stat-sub-compact">Registered subscribers</span>
        </div>
        <div className="stat-card-compact stat-card-cyan">
          <span className="stat-label-compact">Active</span>
          <div className="stat-val-compact">{totalActive}</div>
          <span className="stat-sub-compact">{totalBoxes > 0 ? Math.round((totalActive / totalBoxes) * 100) : 0}% active rate</span>
        </div>
        <div className="stat-card-compact stat-card-green">
          <span className="stat-label-compact">Paid</span>
          <div className="stat-val-compact" style={{ color: '#34d399' }}>{totalPaid}</div>
          <span className="stat-sub-compact">Current month cleared</span>
        </div>
        <div className="stat-card-compact stat-card-pink">
          <span className="stat-label-compact">Unpaid</span>
          <div className="stat-val-compact" style={{ color: '#f87171' }}>{totalUnpaid}</div>
          <span className="stat-sub-compact">Pending collection</span>
        </div>
      </div>

      {/* Bottom Row Grid */}
      <div className="dashboard-bottom-grid">
        <div className="provider-section">
          {/* TCCL Box */}
          <div className="provider-box">
            <div className="provider-box-header">
              <span style={{ color: 'var(--primary-light)' }}>● TCCL Provider</span>
              <span className="badge badge-tccl">{tcclStats.active + tcclStats.deactive} Boxes</span>
            </div>
            <div className="provider-row"><span>Active</span><strong style={{ color: 'var(--primary-light)' }}>{tcclStats.active}</strong></div>
            <div className="provider-row"><span>Inactive</span><span>{tcclStats.deactive}</span></div>
            <div className="provider-row"><span>Paid</span><strong style={{ color: '#34d399' }}>{tcclStats.paid}</strong></div>
            <div className="provider-row"><span>Unpaid</span><strong style={{ color: '#f87171' }}>{tcclStats.unpaid}</strong></div>
          </div>

          {/* GPTL Box */}
          <div className="provider-box">
            <div className="provider-box-header">
              <span style={{ color: 'var(--accent)' }}>● GPTL Provider</span>
              <span className="badge badge-gptl">{gptlStats.active + gptlStats.deactive} Boxes</span>
            </div>
            <div className="provider-row"><span>Active</span><strong style={{ color: 'var(--accent)' }}>{gptlStats.active}</strong></div>
            <div className="provider-row"><span>Inactive</span><span>{gptlStats.deactive}</span></div>
            <div className="provider-row"><span>Paid</span><strong style={{ color: '#34d399' }}>{gptlStats.paid}</strong></div>
            <div className="provider-row"><span>Unpaid</span><strong style={{ color: '#f87171' }}>{gptlStats.unpaid}</strong></div>
          </div>
        </div>

        {/* Chart Box */}
        <div className="chart-box">
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            PROVIDER COMPARISON
          </div>
          <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#0e1424', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="Active" fill="var(--primary-light)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Inactive" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Unpaid" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
