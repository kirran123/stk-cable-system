// Central high-speed API Service connecting directly to Convex Cloud DB & Google Sheets Backend

const CONVEX_URL = 'https://fearless-dalmatian-99.convex.cloud';

const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000/api';
  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:5000/api`;
};

const sendToBackend = async (endpoint, method = 'POST', body = null) => {
  const urls = Array.from(new Set([getBackendUrl(), 'http://localhost:5000/api', 'http://127.0.0.1:5000/api']));
  for (const baseUrl of urls) {
    try {
      const options = { method, headers: { 'Content-Type': 'application/json' } };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(`${baseUrl}${endpoint}`, options);
      if (res.ok) {
        console.log(`[API] Google Sheets sync successful via ${baseUrl}${endpoint}`);
        return res;
      }
    } catch (e) {
      // Silently try next URL if unavailable
    }
  }
  return null;
};

// Helper to sort customers according to stored custom row order
const applyStoredOrder = (customers) => {
  if (!Array.isArray(customers) || customers.length === 0) return customers;
  try {
    const storedOrderRaw = localStorage.getItem('stk_customer_order');
    if (storedOrderRaw) {
      const storedOrder = JSON.parse(storedOrderRaw);
      if (Array.isArray(storedOrder) && storedOrder.length > 0) {
        const orderMap = new Map();
        storedOrder.forEach((id, idx) => orderMap.set(String(id), idx));

        return [...customers].sort((a, b) => {
          const posA = orderMap.has(String(a.id)) ? orderMap.get(String(a.id)) : (a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER);
          const posB = orderMap.has(String(b.id)) ? orderMap.get(String(b.id)) : (b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER);
          return posA - posB;
        });
      }
    }
  } catch (e) {
    console.warn('[API] Failed to apply stored order:', e);
  }
  return customers;
};

// 1. Fetch all 70+ customers in real-time
export const fetchCustomersData = async () => {
  let list = [];

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
        list = data.value;
      }
    }
  } catch (err) {
    console.warn('[API] Convex query failed, trying backend fallback...', err);
  }

  // Secondary: Backend fallback
  if (list.length === 0) {
    try {
      const res = await sendToBackend('/customers', 'GET');
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) list = data;
      }
    } catch (e) {
      console.warn('[API] Backend fetch failed.', e);
    }
  }

  return applyStoredOrder(list);
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
    if (res.ok) await res.json();
  } catch (e) {
    console.error('[API] Convex update failed:', e);
  }

  await sendToBackend(`/customers/${id}`, 'PUT', updateFields);
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
    if (res.ok) await res.json();
  } catch (e) {
    console.error('[API] Convex add failed:', e);
  }

  await sendToBackend('/customers', 'POST', payload);
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

  await sendToBackend(`/customers/${id}`, 'DELETE');
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

  await sendToBackend('/trigger-monthly-reset', 'POST');
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

  try {
    const res = await sendToBackend(`/customers/${customerId}/history`, 'GET');
    if (res && res.ok) return await res.json();
  } catch (e) {}

  return [];
};

// 7. Reorder customers
export const reorderCustomersApi = async (orderedIds) => {
  const ids = orderedIds.map(String);

  // 1. Persist new row order locally in browser
  try {
    localStorage.setItem('stk_customer_order', JSON.stringify(ids));
  } catch (e) {}

  // 2. Try Convex Cloud DB
  try {
    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'customers:reorder',
        args: { orderedIds: ids }
      })
    });
  } catch (e) {
    console.error('[API] Convex reorder failed:', e);
  }

  // 3. Dual sync to Node Backend to immediately reorder physical rows in Google Sheets
  await sendToBackend('/customers/reorder', 'POST', { orderedIds: ids });
};
