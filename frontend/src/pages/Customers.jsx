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

  // Inline Editing State
  const [inlineEdits, setInlineEdits] = useState({});

  // Error States
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
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch from local server, trying remote...', err);
        fetch('https://stk-cable-system.onrender.com/api/customers')
          .then(r => r.json())
          .then(data => { setCustomers(data); setLoading(false); })
          .catch(e => { console.error(e); setLoading(false); });
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
      alert("Please select exactly one customer to edit");
      return;
    }
    const customer = customers.find(c => c.id === selectedIds[0]);
    setFormData({
      ...customer,
      month: customer.month || 1
    });
    setCurrentCustomer(customer);
    setSaveError('');
    setShowModal(true);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} customer(s)?`)) {
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
        if (!res.ok) throw new Error('Failed to save to database.');
        return res.json();
      })
      .then(() => {
        setShowModal(false);
        fetchCustomers();
      })
      .catch(err => {
        console.error('Error saving customer locally, trying Render backend...', err);
        fetch(`https://stk-cable-system.onrender.com/api${endpoint}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
          .then(() => { setShowModal(false); fetchCustomers(); })
          .catch(() => setSaveError('Failed to connect to the backend server.'));
      });
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "STK CABLE SYSTEM - CUSTOMER REPORT\n\n";
    csvContent += "CUSTOMER ID,REQUIRED NAME,PLACE,PHONE NUMBER,BOX NUMBER (MAC),PROVIDER,ACCOUNT STATUS,MONTH,TOTAL AMOUNT (INR),MONTHLY PAYMENT (INR),PAYMENT STATUS\n";

    customers.forEach(row => {
      const dataString = `"${row.id}","${row.name}","${row.place}","${row.phone}","${row.boxNumber}","${(row.provider || '').toUpperCase()}","${row.status}",${row.month || 1},${row.totalAmount},${row.monthlyPayment},"${row.paid}"`;
      csvContent += dataString + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `STK_Customers_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportHistory = () => {
    if (!currentCustomer || customerHistory.length === 0) {
      alert("No history to export");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `STK CABLE SYSTEM - PAYMENT HISTORY\n`;
    csvContent += `CUSTOMER: ${currentCustomer.name} (${currentCustomer.boxNumber})\n\n`;
    csvContent += "DATE RECORDED,AMOUNT SAVED (INR)\n";

    customerHistory.forEach(row => {
      const dbDate = new Date(row.date);
      const formattedDate = dbDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const dataString = `"${formattedDate}",${row.amount}`;
      csvContent += dataString + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payment_History_${currentCustomer.name.replace(/\s+/g, '_')}.csv`);
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
    }).catch(err => {
      console.error('Failed to update month', err);
      fetchCustomers();
    });
  };

  const handleToggle = (id, field, currentValue) => {
    let newValue;
    if (field === 'status') {
      newValue = currentValue === 'Active' ? 'Deactive' : 'Active';
    } else if (field === 'paid') {
      newValue = currentValue === 'Paid' ? 'Not Paid' : 'Paid';
    }

    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: newValue } : c));

    fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newValue })
    }).catch(err => {
      console.error('Failed to toggle', err);
      fetchCustomers();
    });
  };

  const handleInlineChange = (id, field, value) => {
    setInlineEdits(prev => ({
      ...prev,
      [`${id}-${field}`]: value
    }));
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
    }).catch(err => {
      console.error('Failed to update inline edit', err);
      fetchCustomers();
    });
  };

  const fetchHistory = (customer) => {
    setCurrentCustomer(customer);
    setCustomerHistory([]);
    setLoading(true);
    fetch(`${API_BASE_URL}/customers/${customer.id}/history`)
      .then(r => r.json())
      .then(data => {
        setCustomerHistory(data);
        setLoading(false);
        setShowHistoryModal(true);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
        alert("Failed to load history");
      });
  };

  const triggerMonthlyReset = () => {
    if (window.confirm("Are you sure you want to trigger the monthly reset? This will decrement multi-month subscriptions and log paid amounts into history.")) {
      setLoading(true);
      fetch(`${API_BASE_URL}/trigger-monthly-reset`, {
        method: 'POST'
      }).then(() => {
        fetchCustomers();
      }).catch(err => {
        console.error('Failed to trigger reset', err);
        setLoading(false);
      });
    }
  };

  // Filtered Data
  const filteredCustomers = customers.filter(c => {
    let matchesSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (searchCategory === 'name') matchesSearch = c.name?.toLowerCase().includes(q);
      else if (searchCategory === 'place') matchesSearch = c.place?.toLowerCase().includes(q);
      else if (searchCategory === 'phone') matchesSearch = c.phone?.includes(q);
      else if (searchCategory === 'boxNo') matchesSearch = c.boxNumber?.toString().includes(q);
      else if (searchCategory === 'amount') matchesSearch = c.totalAmount?.toString().includes(q) || c.monthlyPayment?.toString().includes(q);
      else if (searchCategory === 'all') {
         matchesSearch = c.name?.toLowerCase().includes(q) || c.place?.toLowerCase().includes(q) || c.phone?.includes(q) || c.boxNumber?.toString().includes(q) || c.totalAmount?.toString().includes(q);
      }
    }

    const matchesStatus = statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'All' || c.paid?.toLowerCase() === paymentFilter.toLowerCase();
    const matchesProvider = providerFilter === 'All' || c.provider?.toLowerCase() === providerFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPayment && matchesProvider;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Customer Directory</h2>
          <p>Manage setup box accounts, monthly billing rates & payment statuses</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-ghost" onClick={exportToExcel}>
            📥 Export CSV
          </button>
          {isAdmin && (
            <button className="btn btn-warning" onClick={triggerMonthlyReset}>
              🔄 Trigger Reset
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleAdd}>
              ✨ Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Toolbar / Search & Filter Controls */}
      <div className="table-container stagger-1" style={{ marginBottom: '1.5rem' }}>
        <div className="toolbar">
          <div className="search-bar" style={{ minWidth: '260px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search subscribers, boxes, places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="select-wrap">
            <select className="select-field" value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
              <option value="all">Search in: All Fields</option>
              <option value="name">Name</option>
              <option value="place">Place</option>
              <option value="phone">Phone</option>
              <option value="boxNo">Box MAC / ID</option>
              <option value="amount">Amount</option>
            </select>
          </div>

          <div className="select-wrap">
            <select className="select-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">Status: All</option>
              <option value="Active">🟢 Active Only</option>
              <option value="Deactive">🔴 Deactive Only</option>
            </select>
          </div>

          <div className="select-wrap">
            <select className="select-field" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
              <option value="All">Payment: All</option>
              <option value="Paid">✅ Paid</option>
              <option value="Not Paid">⚠️ Not Paid</option>
            </select>
          </div>

          <div className="select-wrap">
            <select className="select-field" value={providerFilter} onChange={e => setProviderFilter(e.target.value)}>
              <option value="All">Provider: All</option>
              <option value="TCCL">TCCL</option>
              <option value="GPTL">GPTL</option>
            </select>
          </div>

          {selectedIds.length > 0 && isAdmin && (
            <div className="toolbar-actions" style={{ marginLeft: 'auto' }}>
              {selectedIds.length === 1 && (
                <button className="btn btn-ghost btn-sm" onClick={handleEdit}>
                  ✏️ Edit
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                🗑️ Delete ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="spinner-wrap">
            <div className="spinner"></div>
            <div className="spinner-text">Fetching live records from Convex & Google Sheets...</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      className="row-checkbox"
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="12">
                      <div className="table-empty">
                        <div className="table-empty-icon">📁</div>
                        <div className="table-empty-text">No subscriber records found</div>
                        <div className="table-empty-sub">Try broadening your search query or clear filter settings.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => {
                    const isSelected = selectedIds.includes(customer.id);
                    return (
                      <tr 
                        key={customer.id} 
                        className={isSelected ? 'selected-row' : ''} 
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            className="row-checkbox"
                            checked={isSelected}
                            onChange={() => isAdmin && handleCheckbox(customer.id)}
                            disabled={!isAdmin}
                          />
                        </td>
                        <td style={{ fontWeight: '600', color: '#fff' }}>{customer.name}</td>
                        <td style={{ color: 'var(--text-dim)' }}>{customer.place || '—'}</td>
                        <td style={{ color: 'var(--text-dim)' }}>{customer.phone || '—'}</td>
                        <td style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{customer.boxNumber}</td>
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
                            className="cell-select"
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>₹</span>
                            <input
                              type="number"
                              className="cell-input"
                              value={inlineEdits[`${customer.id}-totalAmount`] !== undefined ? inlineEdits[`${customer.id}-totalAmount`] : customer.totalAmount}
                              onChange={(e) => isAdmin && handleInlineChange(customer.id, 'totalAmount', e.target.value)}
                              disabled={!isAdmin}
                            />
                            {isAdmin && inlineEdits[`${customer.id}-totalAmount`] !== undefined && (
                              <button
                                className="btn btn-success btn-sm"
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                                onClick={() => saveInlineEdit(customer.id, 'totalAmount')}
                              >
                                ✓
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>₹</span>
                            <input
                              type="number"
                              className="cell-input"
                              value={inlineEdits[`${customer.id}-monthlyPayment`] !== undefined ? inlineEdits[`${customer.id}-monthlyPayment`] : customer.monthlyPayment}
                              onChange={(e) => isAdmin && handleInlineChange(customer.id, 'monthlyPayment', e.target.value)}
                              disabled={!isAdmin}
                            />
                            {isAdmin && inlineEdits[`${customer.id}-monthlyPayment`] !== undefined && (
                              <button
                                className="btn btn-success btn-sm"
                                style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                                onClick={() => saveInlineEdit(customer.id, 'monthlyPayment')}
                              >
                                ✓
                              </button>
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
                          <button 
                            className="btn btn-ghost btn-sm" 
                            onClick={() => fetchHistory(customer)}
                          >
                            📜 History
                          </button>
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

      {/* Customer Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{currentCustomer ? 'Edit Customer Information' : 'Add New Subscriber'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {saveError && (
                  <div className="error-box">
                    <span>⚠️</span>
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Subscriber Full Name</label>
                  <input 
                    className="input-field" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. T Selvan" 
                  />
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Location / Area</label>
                    <input 
                      className="input-field" 
                      value={formData.place} 
                      onChange={e => setFormData({ ...formData, place: e.target.value })} 
                      placeholder="e.g. Sivan Kovil" 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Phone Contact</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.phone} 
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                      placeholder="Phone number" 
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Box MAC / Number</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.boxNumber} 
                      onChange={e => setFormData({ ...formData, boxNumber: e.target.value })} 
                      placeholder="e.g. 3381676912" 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Cable Provider</label>
                    <div className="select-wrap">
                      <select 
                        className="select-field" 
                        value={formData.provider} 
                        onChange={e => setFormData({ ...formData, provider: e.target.value })}
                      >
                        <option value="tccl">TCCL Provider</option>
                        <option value="gptl">GPTL Provider</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Subscription Status</label>
                    <div className="select-wrap">
                      <select 
                        className="select-field" 
                        value={formData.status} 
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Deactive">Deactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Duration (Months)</label>
                    <div className="select-wrap">
                      <select
                        className="select-field"
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
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Total Amount (₹)</label>
                    <input 
                      className="input-field" 
                      type="number" 
                      step="0.01" 
                      value={formData.totalAmount} 
                      onChange={e => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Monthly Rate (₹)</label>
                    <input 
                      className="input-field" 
                      type="number" 
                      step="0.01" 
                      value={formData.monthlyPayment} 
                      onChange={e => setFormData({ ...formData, monthlyPayment: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Current Payment Status</label>
                  <div className="select-wrap">
                    <select 
                      className="select-field" 
                      value={formData.paid} 
                      onChange={e => setFormData({ ...formData, paid: e.target.value })}
                    >
                      <option value="Not Paid">Not Paid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentCustomer ? 'Update Subscriber' : 'Create Subscriber'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Payment History: <span className="text-gradient">{currentCustomer?.name}</span></h3>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {customerHistory.length > 0 ? (
                <div>
                  {customerHistory.map((h, i) => (
                    <div key={i} className="history-entry">
                      <div className="history-dot"></div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Payment Recorded</div>
                        <div className="history-date">
                          {new Date(h.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="history-amount">₹{h.amount}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>📜</div>
                  <p style={{ color: 'var(--text-muted)' }}>No historical payment records found for this subscriber.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {customerHistory.length > 0 && (
                <button className="btn btn-ghost" onClick={exportHistory}>📥 Export CSV</button>
              )}
              <button className="btn btn-primary" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
