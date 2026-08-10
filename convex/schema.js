import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  customers: defineTable({
    id: v.string(),
    name: v.string(),
    place: v.string(),
    phone: v.string(),
    boxNumber: v.string(),
    provider: v.string(),
    status: v.string(),
    month: v.number(),
    totalAmount: v.number(),
    monthlyPayment: v.number(),
    paid: v.string(),
    updatedAt: v.optional(v.string()),
  }).index("by_custom_id", ["id"]),

  history: defineTable({
    customerId: v.string(),
    customerName: v.string(),
    date: v.string(),
    amount: v.number(),
  }).index("by_customer_id", ["customerId"]),
});
