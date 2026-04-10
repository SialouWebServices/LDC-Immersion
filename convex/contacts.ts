import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contacts")
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    role: v.optional(v.string()),
    memo: v.optional(v.string()),
    added_by: v.string(),
    created_at: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contacts", args);
  },
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
