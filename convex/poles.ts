import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("poles").collect();
  },
});

export const toggleVisit = mutation({
  args: { id: v.string(), user: v.string(), value: v.boolean() },
  handler: async (ctx, args) => {
    const field = args.user === "Rodrigue" ? "visited_rodrigue" : "visited_henriette";
    const existing = await ctx.db
      .query("poles")
      .withIndex("by_poleId", (q) => q.eq("id", args.id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { [field]: args.value });
    } else {
      // Initialize if not exists (though they should be pre-populated)
      await ctx.db.insert("poles", {
        id: args.id,
        visited_rodrigue: args.user === "Rodrigue" ? args.value : false,
        visited_henriette: args.user === "Henriette" ? args.value : false,
        notes_rodrigue: "",
        notes_henriette: "",
        questions: [],
      });
    }
  },
});

export const updateNote = mutation({
  args: { id: v.string(), user: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const field = args.user === "Rodrigue" ? "notes_rodrigue" : "notes_henriette";
    const existing = await ctx.db
      .query("poles")
      .withIndex("by_poleId", (q) => q.eq("id", args.id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { [field]: args.value });
    }
  },
});

export const addQuestion = mutation({
  args: { id: v.string(), text: v.string(), by: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("poles")
      .withIndex("by_poleId", (q) => q.eq("id", args.id))
      .unique();

    if (existing) {
      const questions = [...existing.questions, { text: args.text, by: args.by }];
      await ctx.db.patch(existing._id, { questions });
    }
  },
});

export const deleteQuestion = mutation({
  args: { id: v.string(), index: v.number() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("poles")
      .withIndex("by_poleId", (q) => q.eq("id", args.id))
      .unique();

    if (existing) {
      const questions = existing.questions.filter((_, i) => i !== args.index);
      await ctx.db.patch(existing._id, { questions });
    }
  },
});

export const seed = mutation({
  args: { 
    poles: v.array(v.object({ 
      id: v.string(), 
      name: v.string() 
    })) 
  },
  handler: async (ctx, args) => {
    for (const p of args.poles) {
      const existing = await ctx.db
        .query("poles")
        .withIndex("by_poleId", (q) => q.eq("id", p.id))
        .unique();
      if (!existing) {
        await ctx.db.insert("poles", {
          id: p.id,
          visited_rodrigue: false,
          visited_henriette: false,
          notes_rodrigue: "",
          notes_henriette: "",
          questions: []
        });
      }
    }
  },
});
