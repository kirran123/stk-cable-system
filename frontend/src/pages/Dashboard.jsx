import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://stk-cable-system.onrender.com/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch customers', err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-light)', borderRadius: '50%', animation: 'rotateBg 1s linear infinite' }}></div>
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
      name: 'TCCL',
      Active: tcclStats.active,
      Deactive: tcclStats.deactive,
      Paid: tcclStats.paid,
      Unpaid: tcclStats.unpaid,
    },
    {
      name: 'GPTL',
      Active: gptlStats.active,
      Deactive: gptlStats.deactive,
      Paid: gptlStats.paid,
      Unpaid: gptlStats.unpaid,
    }
  ];

  const totalActive = tcclStats.active + gptlStats.active;
  const totalBoxes = customers.length;

  return (
    <div className="animate-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Dashboard Overview</h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Updated live</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel hover-effect stagger-1" style={{ padding: '1.5rem', borderLeft: '4px solid #818cf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Total Boxes</h4>
            <div style={{ padding: '0.4rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '8px', color: '#818cf8' }}><span className="icon-bounce">📦</span></div>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            {totalBoxes}
            <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>+</span>
          </h2>
        </div>
        
        <div className="glass-panel hover-effect stagger-2" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Total Active</h4>
            <div style={{ padding: '0.4rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', color: 'var(--accent)' }}><span className="icon-bounce">🟢</span></div>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0' }}>{totalActive}</h2>
        </div>
        
        <div className="glass-panel hover-effect stagger-3" style={{ padding: '1.5rem', borderLeft: '4px solid #34d399' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Total Paid</h4>
            <div style={{ padding: '0.4rem', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '8px', color: '#34d399' }}><span className="icon-bounce">💸</span></div>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0' }}>{tcclStats.paid + gptlStats.paid}</h2>
        </div>
        
        <div className="glass-panel hover-effect stagger-4" style={{ padding: '1.5rem', borderLeft: '4px solid #fb7185' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Total Unpaid</h4>
             <div style={{ padding: '0.4rem', background: 'rgba(251, 113, 133, 0.1)', borderRadius: '8px', color: '#fb7185' }}><span className="icon-bounce">⚠️</span></div>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0' }}>{tcclStats.unpaid + gptlStats.unpaid}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="glass-panel stagger-1 hover-effect" style={{ padding: '1.5rem', animationDelay: '0.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
             <h3 style={{ margin: 0 }}>Provider Statistics</h3>
          </div>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Active" fill="var(--primary-light)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Deactive" fill="var(--text-muted)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Unpaid" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
