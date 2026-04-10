import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db
      .query("notes")
      .order("desc")
      .collect();
    
    return await Promise.all(
      notes.map(async (n) => ({
        ...n,
        media_url: n.media_url ? await ctx.storage.getUrl(n.media_url) : null,
      }))
    );
  },
});

export const add = mutation({
  args: {
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    author: v.string(),
    media_type: v.optional(v.string()),
    media_url: v.optional(v.string()),
    pole_id: v.optional(v.string()),
    created_at: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", args);
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// For storage
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
