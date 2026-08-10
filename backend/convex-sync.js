import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { existsSync } from "fs";
// Load .env first, then .env.local overrides it
dotenv.config();
if (existsSync('.env.local')) dotenv.config({ path: '.env.local', override: true });

// Use CONVEX_URL from env (set in .env or .env.local), fallback to known deployment
const convexUrl = process.env.CONVEX_URL || "https://calm-bird-425.convex.cloud";
let client = null;

try {
  client = new ConvexHttpClient(convexUrl);
  console.log("[ConvexSync] Initialized Convex client with URL:", convexUrl);
} catch (e) {
  console.error("[ConvexSync] Failed to initialize ConvexHttpClient:", e.message);
}

export const syncAddCustomer = async (customerData) => {
  if (!client) return null;
  try {
    const payload = {
      id: String(customerData.id),
      name: customerData.name || "",
      place: customerData.place || "",
      phone: customerData.phone || "",
      boxNumber: customerData.boxNumber || "",
      provider: customerData.provider || "tccl",
      status: customerData.status || "Active",
      month: Number(customerData.month || 1),
      totalAmount: Number(customerData.totalAmount || 0),
      monthlyPayment: Number(customerData.monthlyPayment || 0),
      paid: customerData.paid || "Not Paid",
    };
    return await client.mutation("customers:add", payload);
  } catch (err) {
    console.error("[ConvexSync] Error adding customer to Convex:", err.message);
    return null;
  }
};

export const syncUpdateCustomer = async (id, updateData) => {
  if (!client) return null;
  try {
    const payload = { id: String(id) };
    if (updateData.name !== undefined) payload.name = updateData.name;
    if (updateData.place !== undefined) payload.place = updateData.place;
    if (updateData.phone !== undefined) payload.phone = updateData.phone;
    if (updateData.boxNumber !== undefined) payload.boxNumber = updateData.boxNumber;
    if (updateData.provider !== undefined) payload.provider = updateData.provider;
    if (updateData.status !== undefined) payload.status = updateData.status;
    if (updateData.month !== undefined) payload.month = Number(updateData.month);
    if (updateData.totalAmount !== undefined) payload.totalAmount = Number(updateData.totalAmount);
    if (updateData.monthlyPayment !== undefined) payload.monthlyPayment = Number(updateData.monthlyPayment);
    if (updateData.paid !== undefined) payload.paid = updateData.paid;

    return await client.mutation("customers:update", payload);
  } catch (err) {
    console.error("[ConvexSync] Error updating customer in Convex:", err.message);
    return null;
  }
};

export const syncDeleteCustomer = async (id) => {
  if (!client) return null;
  try {
    return await client.mutation("customers:remove", { id: String(id) });
  } catch (err) {
    console.error("[ConvexSync] Error deleting customer in Convex:", err.message);
    return null;
  }
};

export const syncAddHistoryEntry = async (customerId, customerName, amount) => {
  if (!client) return null;
  try {
    const dateStr = new Date().toISOString().split("T")[0];
    return await client.mutation("history:addEntry", {
      customerId: String(customerId),
      customerName: customerName || "",
      date: dateStr,
      amount: Number(amount || 0),
    });
  } catch (err) {
    console.error("[ConvexSync] Error adding history entry in Convex:", err.message);
    return null;
  }
};

export const syncMonthlyReset = async () => {
  if (!client) return null;
  try {
    return await client.mutation("customers:resetMonthly", {});
  } catch (err) {
    console.error("[ConvexSync] Error running monthly reset in Convex:", err.message);
    return null;
  }
};

export const getConvexCustomers = async () => {
  if (!client) return null;
  try {
    return await client.query("customers:get");
  } catch (err) {
    console.error("[ConvexSync] Error fetching customers from Convex:", err.message);
    return null;
  }
};

export const getConvexCustomerHistory = async (customerId) => {
  if (!client) return null;
  try {
    return await client.query("history:getByCustomerId", { customerId: String(customerId) });
  } catch (err) {
    console.error("[ConvexSync] Error fetching history from Convex:", err.message);
    return null;
  }
};
