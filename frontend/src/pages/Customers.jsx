import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

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
  const [searchCategory, setSearchCategory] = useState('name');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');

  // Form Data
  const [formData, setFormData] = useState({
    name: '', place: '', phone: '', boxNumber: '', provider: 'tccl',
    status: 'Active', totalAmount: 0, monthlyPayment: 0, paid: 'Not Paid'
  });

  const fetchCustomers = () => {
    setLoading(true);
    fetch('https://stk-cable-system.onrender.com/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch', err);
        setLoading(false);
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
      status: 'Active', totalAmount: 0, monthlyPayment: 0, paid: 'Not Paid'
    });
    setCurrentCustomer(null);
    setSaveError(''); // clear any previous errors
    setShowModal(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one customer to edit");
      return;
    }
    const customer = customers.find(c => c.id === selectedIds[0]);
    setFormData(customer);
    setCurrentCustomer(customer);
    setSaveError(''); // clear any previous errors
    setShowModal(true);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} customer(s)?`)) {
      Promise.all(selectedIds.map(id =>
        fetch(`https://stk-cable-system.onrender.com/api/customers/${id}`, { method: 'DELETE' })
      )).then(() => {
        setSelectedIds([]);
        fetchCustomers();
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const method = currentCustomer ? 'PUT' : 'POST';
    const url = currentCustomer
      ? `https://stk-cable-system.onrender.com/api/customers/${currentCustomer.id}`
      : 'https://stk-cable-system.onrender.com/api/customers';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save to database. Is the backend running?');
        return res.json();
      })
      .then(() => {
        setShowModal(false);
        fetchCustomers();
      })
      .catch(err => {
        console.error('Error saving customer:', err);
        setSaveError('Failed to connect to the backend server. Please verify it is running on Render.');
      });
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Title row
    csvContent += "STK CABLE SYSTEM - CUSTOMER REPORT\n\n";
    // Headers
    csvContent += "CUSTOMER ID,REQUIRED NAME,PLACE,PHONE NUMBER,BOX NUMBER (MAC),PROVIDER,ACCOUNT STATUS,TOTAL AMOUNT (INR),MONTHLY PAYMENT (INR),PAYMENT STATUS\n";

    customers.forEach(row => {
      const dataString = `"${row.id}","${row.name}","${row.place}","${row.phone}","${row.boxNumber}","${(row.provider || '').toUpperCase()}","${row.status}",${row.totalAmount},${row.monthlyPayment},"${row.paid}"`;
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
    // Title row
    csvContent += `STK CABLE SYSTEM - PAYMENT HISTORY\n`;
    csvContent += `CUSTOMER: ${currentCustomer.name} (${currentCustomer.boxNumber})\n\n`;

    // Header
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

  const handleToggle = (id, field, currentValue) => {
    let newValue;
    if (field === 'status') {
      newValue = currentValue === 'Active' ? 'Deactive' : 'Active';
    } else if (field === 'paid') {
      newValue = currentValue === 'Paid' ? 'Not Paid' : 'Paid';
    }

    // Optimistically update UI
    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: newValue } : c));

    fetch(`https://stk-cable-system.onrender.com/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newValue })
    }).catch(err => {
      console.error('Failed to toggle', err);
      fetchCustomers(); // Revert on failure
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
    if (valString === undefined) return; // Unchanged

    const numValue = parseFloat(valString) || 0;
    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: numValue } : c));

    fetch(`https://stk-cable-system.onrender.com/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: numValue })
    }).then(() => {
      // Clear edit state for this field once saved successfully
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
    setCustomerHistory([]); // Clear past
    setLoading(true);
    fetch(`https://stk-cable-system.onrender.com/api/customers/${customer.id}/history`)
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
    if (window.confirm("Are you sure you want to trigger the monthly reset? This will set all monthly payments to 0 and move current amounts to history.")) {
      setLoading(true);
      fetch('https://stk-cable-system.onrender.com/api/trigger-monthly-reset', {
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
    <div className="animate-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Customers Management</h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{filteredCustomers.length} results found</span>
      </div>

      <div className="glass-panel stagger-1" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <button className="btn btn-primary" onClick={handleAdd}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add New
              </button>
              <button className="btn btn-outline" onClick={handleEdit}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete
              </button>
            </>
          )}
          <button className="btn btn-outline" onClick={exportToExcel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Excel
          </button>
          {isAdmin && (
            <button className="btn btn-success" onClick={triggerMonthlyReset}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              Monthly Reset
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
           <select className="input-field" style={{ width: '130px', fontWeight: 500 }} value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
             <option value="all">Search All</option>
             <option value="name">Name</option>
             <option value="place">Place</option>
             <option value="phone">Phone</option>
             <option value="boxNo">Box No</option>
             <option value="amount">Amount</option>
           </select>
           <div style={{ position: 'relative' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '10px', left: '12px', zIndex: 1 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             <input
               type="text"
               placeholder={`Search ${searchCategory === 'all' ? 'anything' : searchCategory}...`}
               className="input-field"
               style={{ width: '280px', paddingLeft: '40px' }}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="glass-panel stagger-2" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <select className="input-field" style={{ flex: '1', minWidth: '150px', fontWeight: 500 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">⚪ All Statuses</option>
            <option value="Active">🟢 Active</option>
            <option value="Deactive">🔴 Deactive</option>
          </select>
          <select className="input-field" style={{ flex: '1', minWidth: '150px', fontWeight: 500 }} value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
             <option value="All">⚪ All Payments</option>
            <option value="Paid">💸 Paid</option>
            <option value="Not Paid">⚠️ Not Paid</option>
          </select>
          <select className="input-field" style={{ flex: '1', minWidth: '150px', fontWeight: 500 }} value={providerFilter} onChange={e => setProviderFilter(e.target.value)}>
             <option value="All">🌐 All Providers</option>
             <option value="TCCL">📡 TCCL</option>
             <option value="GPTL">📺 GPTL</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-light)', borderRadius: '50%', animation: 'rotateBg 1s linear infinite' }}></div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={(e) => {
                    if (e.target.checked) setSelectedIds(filteredCustomers.map(c => c.id));
                    else setSelectedIds([]);
                  }} checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0} disabled={!isAdmin} /></th>
                  <th>Name</th>
                  <th>Place</th>
                  <th>Phone</th>
                  <th>Box No</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Monthly</th>
                  <th>Paid</th>
                  <th>History</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No customers found matching your criteria.
                    </td>
                  </tr>
                ) : filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(customer.id)}
                        onChange={() => isAdmin && handleCheckbox(customer.id)}
                        disabled={!isAdmin}
                      />
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--primary-light)' }}>{customer.name}</td>
                    <td>{customer.place}</td>
                    <td>{customer.phone}</td>
                    <td style={{ fontFamily: 'monospace' }}>{customer.boxNumber}</td>
                    <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{customer.provider}</td>
                    <td>
                      <button
                        className={`badge ${customer.status?.toLowerCase() === 'active' ? 'badge-active' : 'badge-inactive'} `}
                        style={{ cursor: isAdmin ? 'pointer' : 'default', opacity: isAdmin ? 1 : 0.8 }}
                        onClick={() => isAdmin && handleToggle(customer.id, 'status', customer.status)}
                        disabled={!isAdmin}
                      >
                        {customer.status}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>₹</span>
                        <input
                          type="number"
                          className="input-field"
                          style={{ width: '80px', padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.2)' }}
                          value={inlineEdits[`${customer.id}-totalAmount`] !== undefined ? inlineEdits[`${customer.id}-totalAmount`] : customer.totalAmount}
                          onChange={(e) => isAdmin && handleInlineChange(customer.id, 'totalAmount', e.target.value)}
                          disabled={!isAdmin}
                        />
                        {isAdmin && inlineEdits[`${customer.id}-totalAmount`] !== undefined && (
                          <button
                            className="btn btn-success"
                            style={{ padding: '0.25rem', fontSize: '1rem', minWidth: '32px' }}
                            onClick={() => saveInlineEdit(customer.id, 'totalAmount')}
                            title="Save"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>₹</span>
                        <input
                          type="number"
                          className="input-field"
                          style={{ width: '80px', padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.2)' }}
                          value={inlineEdits[`${customer.id}-monthlyPayment`] !== undefined ? inlineEdits[`${customer.id}-monthlyPayment`] : customer.monthlyPayment}
                          onChange={(e) => isAdmin && handleInlineChange(customer.id, 'monthlyPayment', e.target.value)}
                          disabled={!isAdmin}
                        />
                        {isAdmin && inlineEdits[`${customer.id}-monthlyPayment`] !== undefined && (
                          <button
                            className="btn btn-success"
                            style={{ padding: '0.25rem', fontSize: '1rem', minWidth: '32px' }}
                            onClick={() => saveInlineEdit(customer.id, 'monthlyPayment')}
                            title="Save"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className={`badge ${customer.paid?.toLowerCase() === 'paid' ? 'badge-active' : 'badge-inactive'} `}
                        style={{ cursor: isAdmin ? 'pointer' : 'default', opacity: isAdmin ? 1 : 0.8 }}
                        onClick={() => isAdmin && handleToggle(customer.id, 'paid', customer.paid)}
                        disabled={!isAdmin}
                      >
                        {customer.paid}
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => fetchHistory(customer)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{currentCustomer ? 'Edit Customer Info' : 'Add New Customer'}</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {saveError && (
                <div className="animate-enter" style={{ background: 'rgba(225, 29, 72, 0.2)', color: '#fb7185', border: '1px solid rgba(225, 29, 72, 0.5)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  ⚠️ {saveError}
                </div>
              )}
              <div className="input-group">
                <label className="input-label">Customer Name</label>
                <input className="input-field" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter full name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Place / Address</label>
                  <input className="input-field" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} placeholder="City or Area" />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Box Number MAC/ID</label>
                  <input className="input-field" value={formData.boxNumber} onChange={e => setFormData({ ...formData, boxNumber: e.target.value })} placeholder="BOX-XXXX" />
                </div>
                <div className="input-group">
                  <label className="input-label">Service Provider</label>
                  <select className="input-field" value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value })}>
                    <option value="tccl">TCCL</option>
                    <option value="gptl">GPTL</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Account Status</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Payment Status</label>
                  <select className="input-field" value={formData.paid} onChange={e => setFormData({ ...formData, paid: e.target.value })}>
                    <option value="Not Paid">Not Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Total Amount (₹)</label>
                  <input className="input-field" type="number" step="0.01" value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Monthly Payment (₹)</label>
                  <input className="input-field" type="number" step="0.01" value={formData.monthlyPayment} onChange={e => setFormData({ ...formData, monthlyPayment: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentCustomer ? 'Save Changes' : 'Create Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>History: <span className="text-gradient">{currentCustomer?.name}</span></h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={exportHistory}>Download CSV</button>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', paddingLeft: '0.5rem' }} onClick={() => setShowHistoryModal(false)}>✕</button>
              </div>
            </div>
            {customerHistory.length > 0 ? (
              <div className="table-wrapper">
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerHistory.map((h, i) => (
                      <tr key={i}>
                        <td>{new Date(h.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ color: '#34d399', fontWeight: 'bold' }}>₹{h.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>🕰️</div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No payment history available for this customer yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
