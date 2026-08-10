import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByCustomerId = query({
  args: { customerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("history")
      .withIndex("by_customer_id", (q) => q.eq("customerId", args.customerId))
      .collect();
  },
});

export const addEntry = mutation({
  args: {
    customerId: v.string(),
    customerName: v.string(),
    date: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("history", args);
  },
});
