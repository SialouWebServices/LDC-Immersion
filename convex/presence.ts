import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const update = mutation({
  args: { user: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("user", args.user))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: now });
    } else {
      await ctx.db.insert("presence", { user: args.user, updatedAt: now });
    }
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const timeout = 10000; // 10 seconds
    const threshold = Date.now() - timeout;
    return await ctx.db
      .query("presence")
      .filter((q) => q.gt(q.field("updatedAt"), threshold))
      .collect();
  },
});
