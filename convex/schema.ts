import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    completed: v.boolean(),
    completedAt: v.optional(v.union(v.string(), v.null())),
    sectionId: v.union(v.id("sections"), v.null()),
    dueDate: v.union(v.string(), v.null()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_section", ["userId", "sectionId"]),

  sections: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),
});
