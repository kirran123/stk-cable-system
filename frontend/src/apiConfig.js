// Central high-speed API Service connecting directly to Convex Cloud DB
// Ensures instant, 100% data visibility on Mobile and Laptop without relying on suspended Render backend.

const CONVEX_URL = 'https://fearless-dalmatian-99.convex.cloud';
const LOCAL_API = 'http://localhost:5000/api';

const isLocalHost = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

// 1. Fetch all 70+ customers in real-time
export const fetchCustomersData = async () => {
  // Primary: High-speed Convex Query
  try {
    const res = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'customers:get', args: {} })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && Array.isArray(data.value) && data.value.length > 0) {
        return data.value;
      }
    }
  } catch (err) {
    console.warn('[API] Convex query failed, trying localhost fallback...', err);
  }

  // Secondary: Localhost fallback if running locally
  if (isLocalHost()) {
    try {
      const res = await fetch(`${LOCAL_API}/customers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('[API] Localhost fetch failed.', e);
    }
  }

  return [];
};

// 2. Save / Update customer fields
export const updateCustomerApi = async (id, updateFields) => {
  try {
    const res = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'customers:update',
        args: { id: String(id), ...updateFields }
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('[API] Convex update failed:', e);
  }

  if (isLocalHost()) {
    try {
      await fetch(`${LOCAL_API}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateFields)
      });
    } catch (e) {}
  }
};

// 3. Add customer
export const addCustomerApi = async (customerData) => {
  const newId = customerData.id ? String(customerData.id) : String(Date.now());
  const payload = {
    id: newId,
    name: customerData.name || '',
    place: customerData.place || '',
    phone: customerData.phone || '',
    boxNumber: customerData.boxNumber || '',
    provider: customerData.provider || 'tccl',
    status: customerData.status || 'Active',
    month: Number(customerData.month || 1),
    totalAmount: Number(customerData.totalAmount || 0),
    monthlyPayment: Number(customerData.monthlyPayment || 0),
    paid: customerData.paid || 'Not Paid'
  };

  try {
    const res = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'customers:add', args: payload })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('[API] Convex add failed:', e);
  }

  if (isLocalHost()) {
    try {
      await fetch(`${LOCAL_API}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
  }
};

// 4. Delete customer
export const deleteCustomerApi = async (id) => {
  try {
    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'customers:remove', args: { id: String(id) } })
    });
  } catch (e) {
    console.error('[API] Convex delete failed:', e);
  }

  if (isLocalHost()) {
    try {
      await fetch(`${LOCAL_API}/customers/${id}`, { method: 'DELETE' });
    } catch (e) {}
  }
};

// 5. Trigger Monthly Reset
export const triggerMonthlyResetApi = async () => {
  try {
    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'customers:resetMonthly', args: {} })
    });
  } catch (e) {
    console.error('[API] Convex monthly reset failed:', e);
  }

  if (isLocalHost()) {
    try {
      await fetch(`${LOCAL_API}/trigger-monthly-reset`, { method: 'POST' });
    } catch (e) {}
  }
};

// 6. Fetch Customer History
export const fetchCustomerHistoryApi = async (customerId) => {
  try {
    const res = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'history:getByCustomerId', args: { customerId: String(customerId) } })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && Array.isArray(data.value)) {
        return data.value;
      }
    }
  } catch (e) {
    console.error('[API] Convex history fetch failed:', e);
  }

  if (isLocalHost()) {
    try {
      const res = await fetch(`${LOCAL_API}/customers/${customerId}/history`);
      if (res.ok) return await res.json();
    } catch (e) {}
  }

  return [];
};
