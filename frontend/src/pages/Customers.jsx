import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Customers() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === 'admin';
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & History state
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [inlineEdits, setInlineEdits] = useState({});
  const [saveError, setSaveError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');

  // Form Data
  const [formData, setFormData] = useState({
    name: '', place: '', phone: '', boxNumber: '', provider: 'tccl',
    status: 'Active', month: 1, totalAmount: 0, monthlyPayment: 0, paid: 'Not Paid'
  });

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/customers`)
      .then(res => res.json())
      .then(data => { setCustomers(data); setLoading(false); })
      .catch(() => {
        fetch('https://stk-cable-system.onrender.com/api/customers')
          .then(r => r.json())
          .then(data => { setCustomers(data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCheckbox = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '', place: '', phone: '', boxNumber: '', provider: 'tccl',
      status: 'Active', month: 1, totalAmount: 0, monthlyPayment: 0, paid: 'Not Paid'
    });
    setCurrentCustomer(null);
    setSaveError('');
    setShowModal(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) {
      alert("Select exactly 1 customer to edit");
      return;
    }
    const customer = customers.find(c => c.id === selectedIds[0]);
    setFormData({ ...customer, month: customer.month || 1 });
    setCurrentCustomer(customer);
    setSaveError('');
    setShowModal(true);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected customer(s)?`)) {
      Promise.all(selectedIds.map(id =>
        fetch(`${API_BASE_URL}/customers/${id}`, { method: 'DELETE' })
          .catch(() => fetch(`https://stk-cable-system.onrender.com/api/customers/${id}`, { method: 'DELETE' }))
      )).then(() => {
        setSelectedIds([]);
        fetchCustomers();
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const method = currentCustomer ? 'PUT' : 'POST';
    const endpoint = currentCustomer ? `/customers/${currentCustomer.id}` : '/customers';

    fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Save failed');
        return res.json();
      })
      .then(() => { setShowModal(false); fetchCustomers(); })
      .catch(() => setSaveError('Error saving to server.'));
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,NAME,PLACE,PHONE,BOX_NUMBER,PROVIDER,STATUS,MONTH,TOTAL_AMOUNT,MONTHLY_PAYMENT,PAID\n";
    customers.forEach(row => {
      csvContent += `"${row.id}","${row.name}","${row.place}","${row.phone}","${row.boxNumber}","${(row.provider || '').toUpperCase()}","${row.status}",${row.month || 1},${row.totalAmount},${row.monthlyPayment},"${row.paid}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `STK_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMonthChange = (id, newMonthVal) => {
    const newMonth = parseInt(newMonthVal, 10);
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    const oldMonth = customer.month || 1;
    const currentTotal = inlineEdits[`${id}-totalAmount`] !== undefined 
      ? parseFloat(inlineEdits[`${id}-totalAmount`]) 
      : (customer.totalAmount || 0);

    const baseRate = oldMonth > 0 ? (currentTotal / oldMonth) : currentTotal;
    const calculatedTotal = Math.round(baseRate * newMonth);

    setCustomers(customers.map(c => c.id === id ? { ...c, month: newMonth, totalAmount: calculatedTotal } : c));

    fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: newMonth, totalAmount: calculatedTotal })
    }).catch(() => fetchCustomers());
  };

  const handleToggle = (id, field, currentValue) => {
    let newValue = field === 'status' 
      ? (currentValue === 'Active' ? 'Deactive' : 'Active')
      : (currentValue === 'Paid' ? 'Not Paid' : 'Paid');

    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: newValue } : c));

    fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newValue })
    }).catch(() => fetchCustomers());
  };

  const handleInlineChange = (id, field, value) => {
    setInlineEdits(prev => ({ ...prev, [`${id}-${field}`]: value }));
  };

  const saveInlineEdit = (id, field) => {
    const valString = inlineEdits[`${id}-${field}`];
    if (valString === undefined) return;

    const numValue = parseFloat(valString) || 0;
    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: numValue } : c));

    fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: numValue })
    }).then(() => {
      setInlineEdits(prev => {
        const next = { ...prev };
        delete next[`${id}-${field}`];
        return next;
      });
    }).catch(() => fetchCustomers());
  };

  const fetchHistory = (customer) => {
    setCurrentCustomer(customer);
    setCustomerHistory([]);
    fetch(`${API_BASE_URL}/customers/${customer.id}/history`)
      .then(r => r.json())
      .then(data => { setCustomerHistory(data); setShowHistoryModal(true); })
      .catch(() => alert("Failed to fetch history"));
  };

  const triggerMonthlyReset = () => {
    if (window.confirm("Trigger monthly reset for all customers?")) {
      setLoading(true);
      fetch(`${API_BASE_URL}/trigger-monthly-reset`, { method: 'POST' })
        .then(() => fetchCustomers())
        .catch(() => setLoading(false));
    }
  };

  const filteredCustomers = customers.filter(c => {
    let matchesSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (searchCategory === 'name') matchesSearch = c.name?.toLowerCase().includes(q);
      else if (searchCategory === 'place') matchesSearch = c.place?.toLowerCase().includes(q);
      else if (searchCategory === 'phone') matchesSearch = c.phone?.includes(q);
      else if (searchCategory === 'boxNo') matchesSearch = c.boxNumber?.toString().includes(q);
      else matchesSearch = c.name?.toLowerCase().includes(q) || c.place?.toLowerCase().includes(q) || c.phone?.includes(q) || c.boxNumber?.toString().includes(q);
    }
    const matchesStatus = statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'All' || c.paid?.toLowerCase() === paymentFilter.toLowerCase();
    const matchesProvider = providerFilter === 'All' || c.provider?.toLowerCase() === providerFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPayment && matchesProvider;
  });

  return (
    <div className="customers-container">
      {/* Compact Top Toolbar */}
      <div className="toolbar-compact">
        <input
          type="text"
          className="input-compact"
          placeholder="🔍 Search subscribers..."
          style={{ width: '190px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select className="select-compact" value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
          <option value="all">Field: All</option>
          <option value="name">Name</option>
          <option value="place">Place</option>
          <option value="phone">Phone</option>
          <option value="boxNo">Box ID</option>
        </select>

        <select className="select-compact" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">Status: All</option>
          <option value="Active">Active</option>
          <option value="Deactive">Deactive</option>
        </select>

        <select className="select-compact" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="All">Payment: All</option>
          <option value="Paid">Paid</option>
          <option value="Not Paid">Not Paid</option>
        </select>

        <select className="select-compact" value={providerFilter} onChange={e => setProviderFilter(e.target.value)}>
          <option value="All">Provider: All</option>
          <option value="TCCL">TCCL</option>
          <option value="GPTL">GPTL</option>
        </select>

        {/* Action Buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          {selectedIds.length > 0 && isAdmin && (
            <>
              {selectedIds.length === 1 && (
                <button className="btn btn-ghost btn-sm" onClick={handleEdit}>✏️ Edit</button>
              )}
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ ({selectedIds.length})</button>
            </>
          )}
          <button className="btn btn-ghost btn-sm" onClick={exportToExcel}>📥 CSV</button>
          {isAdmin && <button className="btn btn-warning btn-sm" onClick={triggerMonthlyReset}>🔄 Reset</button>}
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={handleAdd}>+ Add</button>}
        </div>
      </div>

      {/* Main Table Card (Fills height) */}
      <div className="table-card-fill">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Loading records...
          </div>
        ) : (
          <div className="table-scroll-area">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '32px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredCustomers.map(c => c.id));
                        else setSelectedIds([]);
                      }} 
                      checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0} 
                      disabled={!isAdmin} 
                    />
                  </th>
                  <th>Subscriber Name</th>
                  <th>Place</th>
                  <th>Phone Number</th>
                  <th>Box MAC / ID</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Month</th>
                  <th>Total Amount</th>
                  <th>Monthly Rate</th>
                  <th>Payment</th>
                  <th style={{ textAlign: 'right' }}>History</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No subscriber records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => {
                    const isSelected = selectedIds.includes(customer.id);
                    return (
                      <tr key={customer.id} className={isSelected ? 'selected-row' : ''}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => isAdmin && handleCheckbox(customer.id)}
                            disabled={!isAdmin}
                          />
                        </td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{customer.name}</td>
                        <td>{customer.place || '—'}</td>
                        <td>{customer.phone || '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{customer.boxNumber}</td>
                        <td>
                          <span className={`badge ${customer.provider?.toLowerCase() === 'tccl' ? 'badge-tccl' : 'badge-gptl'}`}>
                            {(customer.provider || 'tccl').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`badge ${customer.status?.toLowerCase() === 'active' ? 'badge-active' : 'badge-inactive'}`}
                            style={{ cursor: isAdmin ? 'pointer' : 'default', border: 'none' }}
                            onClick={() => isAdmin && handleToggle(customer.id, 'status', customer.status)}
                            disabled={!isAdmin}
                          >
                            {customer.status}
                          </button>
                        </td>
                        <td>
                          <select
                            className="select-compact"
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                            value={customer.month || 1}
                            onChange={(e) => isAdmin && handleMonthChange(customer.id, e.target.value)}
                            disabled={!isAdmin}
                          >
                            {[1, 2, 3, 4, 5, 6].map(m => (
                              <option key={m} value={m}>{m} M</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <span>₹</span>
                            <input
                              type="number"
                              className="input-compact"
                              style={{ width: '70px', padding: '0.2rem 0.4rem' }}
                              value={inlineEdits[`${customer.id}-totalAmount`] !== undefined ? inlineEdits[`${customer.id}-totalAmount`] : customer.totalAmount}
                              onChange={(e) => isAdmin && handleInlineChange(customer.id, 'totalAmount', e.target.value)}
                              disabled={!isAdmin}
                            />
                            {isAdmin && inlineEdits[`${customer.id}-totalAmount`] !== undefined && (
                              <button className="btn btn-success btn-sm" style={{ padding: '0.15rem 0.35rem' }} onClick={() => saveInlineEdit(customer.id, 'totalAmount')}>✓</button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <span>₹</span>
                            <input
                              type="number"
                              className="input-compact"
                              style={{ width: '70px', padding: '0.2rem 0.4rem' }}
                              value={inlineEdits[`${customer.id}-monthlyPayment`] !== undefined ? inlineEdits[`${customer.id}-monthlyPayment`] : customer.monthlyPayment}
                              onChange={(e) => isAdmin && handleInlineChange(customer.id, 'monthlyPayment', e.target.value)}
                              disabled={!isAdmin}
                            />
                            {isAdmin && inlineEdits[`${customer.id}-monthlyPayment`] !== undefined && (
                              <button className="btn btn-success btn-sm" style={{ padding: '0.15rem 0.35rem' }} onClick={() => saveInlineEdit(customer.id, 'monthlyPayment')}>✓</button>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            className={`badge ${customer.paid?.toLowerCase() === 'paid' ? 'badge-paid' : 'badge-unpaid'}`}
                            style={{ cursor: isAdmin ? 'pointer' : 'default', border: 'none' }}
                            onClick={() => isAdmin && handleToggle(customer.id, 'paid', customer.paid)}
                            disabled={!isAdmin}
                          >
                            {customer.paid}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => fetchHistory(customer)}>📜 View</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem' }}>{currentCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {saveError && <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{saveError}</div>}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Subscriber Name</label>
                <input className="input-compact" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Place</label>
                  <input className="input-compact" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="input-compact" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Box MAC / Number</label>
                  <input className="input-compact" value={formData.boxNumber} onChange={e => setFormData({ ...formData, boxNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Provider</label>
                  <select className="select-compact" value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value })}>
                    <option value="tccl">TCCL</option>
                    <option value="gptl">GPTL</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="select-compact" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Month (1 - 6)</label>
                  <select
                    className="select-compact"
                    value={formData.month || 1}
                    onChange={e => {
                      const m = parseInt(e.target.value, 10);
                      const oldM = formData.month || 1;
                      const currentTotal = formData.totalAmount || 0;
                      const baseRate = oldM > 0 ? (currentTotal / oldM) : currentTotal;
                      const calculatedTotal = Math.round(baseRate * m);
                      setFormData({ ...formData, month: m, totalAmount: calculatedTotal });
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map(m => (
                      <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Amount (₹)</label>
                  <input className="input-compact" type="number" step="0.01" value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Rate (₹)</label>
                  <input className="input-compact" type="number" step="0.01" value={formData.monthlyPayment} onChange={e => setFormData({ ...formData, monthlyPayment: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Payment Status</label>
                <select className="select-compact" value={formData.paid} onChange={e => setFormData({ ...formData, paid: e.target.value })}>
                  <option value="Not Paid">Not Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentCustomer ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem' }}>History: {currentCustomer?.name}</h3>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>
            {customerHistory.length > 0 ? (
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {customerHistory.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                    <span>{new Date(h.date).toLocaleDateString()}</span>
                    <strong style={{ color: '#34d399' }}>₹{h.amount}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No payment history recorded.</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
