import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("customers").collect();
  },
});

export const add = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: new Date().toISOString() });
      return existing._id;
    }
    return await ctx.db.insert("customers", { ...args, updatedAt: new Date().toISOString() });
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    place: v.optional(v.string()),
    phone: v.optional(v.string()),
    boxNumber: v.optional(v.string()),
    provider: v.optional(v.string()),
    status: v.optional(v.string()),
    month: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    monthlyPayment: v.optional(v.number()),
    paid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_custom_id", (q) => q.eq("id", id))
      .first();

    if (customer) {
      await ctx.db.patch(customer._id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return customer._id;
    }
    return null;
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (customer) {
      await ctx.db.delete(customer._id);
      return true;
    }
    return false;
  },
});

export const resetMonthly = mutation({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    const dateStr = new Date().toISOString().split("T")[0];

    for (const c of customers) {
      const monthVal = c.month || 1;
      if (monthVal > 1) {
        await ctx.db.patch(c._id, { month: monthVal - 1, updatedAt: new Date().toISOString() });
      } else {
        if (c.monthlyPayment > 0 || c.paid === "Paid") {
          if (c.monthlyPayment > 0) {
            await ctx.db.insert("history", {
              customerId: c.id,
              customerName: c.name,
              date: dateStr,
              amount: c.monthlyPayment,
            });
          }
          await ctx.db.patch(c._id, {
            monthlyPayment: 0,
            paid: "Not Paid",
            month: 1,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  },
});
