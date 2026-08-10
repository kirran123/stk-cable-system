// Central API Service with Environment Detection and Fallback Support

const RENDER_API = 'https://stk-cable-system.onrender.com/api';
const LOCAL_API = 'http://localhost:5000/api';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      return RENDER_API;
    }
  }
  return LOCAL_API;
};

// Robust fetch helper with timeout and fallback
export const fetchCustomersData = async () => {
  const primaryUrl = getApiBaseUrl();
  const secondaryUrl = primaryUrl === RENDER_API ? LOCAL_API : RENDER_API;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${primaryUrl}/customers`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn(`[API] Primary fetch from ${primaryUrl} failed/timed out, trying secondary...`);
  }

  // Try secondary URL if primary failed
  try {
    const res = await fetch(`${secondaryUrl}/customers`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn(`[API] Secondary fetch failed.`);
  }

  return null;
};
