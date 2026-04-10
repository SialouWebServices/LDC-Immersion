import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("programs")
      .withIndex("by_day")
      .collect();
  },
});

export const upsert = mutation({
  args: {
    day: v.number(),
    date: v.string(),
    items: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("programs")
      .withIndex("by_day", (q) => q.eq("day", args.day))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { date: args.date, items: args.items });
    } else {
      await ctx.db.insert("programs", args);
    }
  },
});
