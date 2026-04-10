import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  poles: defineTable({
    id: v.string(), // slug like 'planning', 'conception', etc.
    visited_rodrigue: v.boolean(),
    visited_henriette: v.boolean(),
    notes_rodrigue: v.string(),
    notes_henriette: v.string(),
    questions: v.array(v.object({
      text: v.string(),
      by: v.string(),
    })),
  }).index("by_poleId", ["id"]),

  contacts: defineTable({
    name: v.string(),
    role: v.optional(v.string()),
    memo: v.optional(v.string()),
    added_by: v.string(),
    created_at: v.string(),
  }),

  notes: defineTable({
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    author: v.string(),
    media_type: v.optional(v.string()), // 'image', 'video', 'audio'
    media_url: v.optional(v.string()),
    pole_id: v.optional(v.string()), // linked to pole slug
    created_at: v.string(),
  }).index("by_pole", ["pole_id"]),

  programs: defineTable({
    day: v.number(),
    date: v.string(),
    items: v.array(v.string()),
  }).index("by_day", ["day"]),

  presence: defineTable({
    user: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["user"]),
});
