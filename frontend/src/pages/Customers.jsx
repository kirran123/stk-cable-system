import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  fetchCustomersData, 
  updateCustomerApi, 
  addCustomerApi, 
  deleteCustomerApi, 
  triggerMonthlyResetApi, 
  fetchCustomerHistoryApi 
} from '../apiConfig';

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

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await fetchCustomersData();
    if (data) {
      setCustomers(data);
    }
    setLoading(false);
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
      alert("Please select exactly 1 customer to edit");
      return;
    }
    const customer = customers.find(c => c.id === selectedIds[0]);
    setFormData({ ...customer, month: customer.month || 1 });
    setCurrentCustomer(customer);
    setSaveError('');
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} customer(s)?`)) {
      await Promise.all(selectedIds.map(id => deleteCustomerApi(id)));
      setSelectedIds([]);
      fetchCustomers();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentCustomer) {
        await updateCustomerApi(currentCustomer.id, formData);
      } else {
        await addCustomerApi(formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      setSaveError('Error saving subscriber details.');
    }
  };

  // Renamed button action: Download CSV
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

  const handleMonthChange = async (id, newMonthVal) => {
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
    await updateCustomerApi(id, { month: newMonth, totalAmount: calculatedTotal });
  };

  const handleToggle = async (id, field, currentValue) => {
    let newValue = field === 'status' 
      ? (currentValue === 'Active' ? 'Deactive' : 'Active')
      : (currentValue === 'Paid' ? 'Not Paid' : 'Paid');

    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: newValue } : c));
    await updateCustomerApi(id, { [field]: newValue });
  };

  const handleInlineChange = (id, field, value) => {
    setInlineEdits(prev => ({ ...prev, [`${id}-${field}`]: value }));
  };

  const saveInlineEdit = async (id, field) => {
    const valString = inlineEdits[`${id}-${field}`];
    if (valString === undefined) return;

    const numValue = parseFloat(valString) || 0;
    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: numValue } : c));

    await updateCustomerApi(id, { [field]: numValue });
    setInlineEdits(prev => {
      const next = { ...prev };
      delete next[`${id}-${field}`];
      return next;
    });
  };

  const fetchHistory = async (customer) => {
    setCurrentCustomer(customer);
    setCustomerHistory([]);
    const history = await fetchCustomerHistoryApi(customer.id);
    setCustomerHistory(history);
    setShowHistoryModal(true);
  };

  const triggerMonthlyReset = async () => {
    if (window.confirm("Trigger monthly reset for all customers?")) {
      setLoading(true);
      await triggerMonthlyResetApi();
      await fetchCustomers();
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
    <div>
      {/* Clean Toolbar */}
      <div className="toolbar-neat">
        <input
          type="text"
          className="input-neat"
          placeholder="🔍 Search subscribers..."
          style={{ width: '220px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select className="select-neat" value={searchCategory} onChange={e => setSearchCategory(e.target.value)}>
          <option value="all">Search in: All Fields</option>
          <option value="name">Name</option>
          <option value="place">Place</option>
          <option value="phone">Phone</option>
          <option value="boxNo">Box ID</option>
        </select>

        <select className="select-neat" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">Status: All</option>
          <option value="Active">🟢 Active Only</option>
          <option value="Deactive">🔴 Deactive Only</option>
        </select>

        <select className="select-neat" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="All">Payment: All</option>
          <option value="Paid">✅ Paid</option>
          <option value="Not Paid">⚠️ Not Paid</option>
        </select>

        <select className="select-neat" value={providerFilter} onChange={e => setProviderFilter(e.target.value)}>
          <option value="All">Provider: All</option>
          <option value="TCCL">TCCL</option>
          <option value="GPTL">GPTL</option>
        </select>

        {/* Action Buttons: Renamed CSV button to Download as requested */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {selectedIds.length > 0 && isAdmin && (
            <>
              {selectedIds.length === 1 && (
                <button className="btn btn-ghost" onClick={handleEdit}>✏️ Edit</button>
              )}
              <button className="btn btn-danger" onClick={handleDelete}>🗑️ Delete ({selectedIds.length})</button>
            </>
          )}
          <button className="btn btn-ghost" onClick={exportToExcel}>📥 Download</button>
          {isAdmin && <button className="btn btn-warning" onClick={triggerMonthlyReset}>🔄 Trigger Reset</button>}
          {isAdmin && <button className="btn btn-primary" onClick={handleAdd}>✨ Add Customer</button>}
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="table-panel-neat">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading subscriber directory...
          </div>
        ) : (
          <div className="table-wrapper-scrollable">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      No subscriber records found matching your filters.
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
                        <td style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>{customer.boxNumber}</td>
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
                            className="select-neat"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            value={customer.month || 1}
                            onChange={(e) => isAdmin && handleMonthChange(customer.id, e.target.value)}
                            disabled={!isAdmin}
                          >
                            {[1, 2, 3, 4, 5, 6].map(m => (
                              <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>₹</span>
                            <input
                              type="number"
                              className="input-neat"
                              style={{ width: '85px', padding: '0.3rem 0.5rem' }}
                              value={inlineEdits[`${customer.id}-totalAmount`] !== undefined ? inlineEdits[`${customer.id}-totalAmount`] : customer.totalAmount}
                              onChange={(e) => isAdmin && handleInlineChange(customer.id, 'totalAmount', e.target.value)}
                              disabled={!isAdmin}
                            />
                            {isAdmin && inlineEdits[`${customer.id}-totalAmount`] !== undefined && (
                              <button className="btn btn-success btn-sm" style={{ padding: '0.2rem 0.4rem' }} onClick={() => saveInlineEdit(customer.id, 'totalAmount')}>✓</button>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>₹</span>
                            <input
                              type="number"
                              className="input-neat"
                              style={{ width: '85px', padding: '0.3rem 0.5rem' }}
                              value={inlineEdits[`${customer.id}-monthlyPayment`] !== undefined ? inlineEdits[`${customer.id}-monthlyPayment`] : customer.monthlyPayment}
                              onChange={(e) => isAdmin && handleInlineChange(customer.id, 'monthlyPayment', e.target.value)}
                              disabled={!isAdmin}
                            />
                            {isAdmin && inlineEdits[`${customer.id}-monthlyPayment`] !== undefined && (
                              <button className="btn btn-success btn-sm" style={{ padding: '0.2rem 0.4rem' }} onClick={() => saveInlineEdit(customer.id, 'monthlyPayment')}>✓</button>
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
                          <button className="btn btn-ghost btn-sm" onClick={() => fetchHistory(customer)}>📜 History</button>
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
          <div className="modal-neat">
            <div className="modal-header">
              <h3 className="modal-title">{currentCustomer ? 'Edit Subscriber' : 'Add New Subscriber'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {saveError && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{saveError}</div>}
              
              <div className="form-group-item" style={{ marginBottom: '1rem' }}>
                <label className="form-group-label">Subscriber Name</label>
                <input className="input-neat" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" />
              </div>

              <div className="form-grid-2">
                <div className="form-group-item">
                  <label className="form-group-label">Place / Location</label>
                  <input className="input-neat" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} placeholder="Area / City" />
                </div>
                <div className="form-group-item">
                  <label className="form-group-label">Phone Contact</label>
                  <input className="input-neat" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-item">
                  <label className="form-group-label">Box MAC / ID</label>
                  <input className="input-neat" value={formData.boxNumber} onChange={e => setFormData({ ...formData, boxNumber: e.target.value })} placeholder="Box Number" />
                </div>
                <div className="form-group-item">
                  <label className="form-group-label">Cable Provider</label>
                  <select className="select-neat" value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value })}>
                    <option value="tccl">TCCL</option>
                    <option value="gptl">GPTL</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-item">
                  <label className="form-group-label">Status</label>
                  <select className="select-neat" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                  </select>
                </div>
                <div className="form-group-item">
                  <label className="form-group-label">Month Duration</label>
                  <select
                    className="select-neat"
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

              <div className="form-grid-2">
                <div className="form-group-item">
                  <label className="form-group-label">Total Amount (₹)</label>
                  <input className="input-neat" type="number" step="0.01" value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group-item">
                  <label className="form-group-label">Monthly Rate (₹)</label>
                  <input className="input-neat" type="number" step="0.01" value={formData.monthlyPayment} onChange={e => setFormData({ ...formData, monthlyPayment: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="form-group-item" style={{ marginBottom: '1.5rem' }}>
                <label className="form-group-label">Payment Status</label>
                <select className="select-neat" value={formData.paid} onChange={e => setFormData({ ...formData, paid: e.target.value })}>
                  <option value="Not Paid">Not Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentCustomer ? 'Save Changes' : 'Create Subscriber'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-neat" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">History: {currentCustomer?.name}</h3>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>
            {customerHistory.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {customerHistory.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>{new Date(h.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <strong style={{ color: '#34d399' }}>₹{h.amount}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>No historical payment records logged for this customer.</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
