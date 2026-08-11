import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const list = await ctx.db.query("customers").collect();
    return list.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return 0;
    });
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
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    let orderVal = args.order;
    if (orderVal === undefined) {
      const all = await ctx.db.query("customers").collect();
      const maxOrder = all.reduce((max, c) => Math.max(max, c.order || 0), 0);
      orderVal = maxOrder + 1;
    }

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, order: orderVal, updatedAt: new Date().toISOString() });
      return existing._id;
    }
    return await ctx.db.insert("customers", { ...args, order: orderVal, updatedAt: new Date().toISOString() });
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
    order: v.optional(v.number()),
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

export const reorder = mutation({
  args: {
    orderedIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.orderedIds.length; i++) {
      const id = args.orderedIds[i];
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_custom_id", (q) => q.eq("id", id))
        .first();
      if (customer) {
        await ctx.db.patch(customer._id, {
          order: i + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return true;
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
