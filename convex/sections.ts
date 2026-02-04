import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Default user ID for single-user mode (no authentication)
const DEFAULT_USER_ID = "default-user";

// Helper to get user ID (returns default for single-user mode)
function getUserId(): string {
  return DEFAULT_USER_ID;
}

// Get all sections for the user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = getUserId();
    return await ctx.db
      .query("sections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get a single section by ID
export const getById = query({
  args: { id: v.id("sections") },
  handler: async (ctx, args) => {
    const userId = getUserId();
    const section = await ctx.db.get(args.id);
    if (!section || section.userId !== userId) {
      return null;
    }
    return section;
  },
});

// Create a new section
export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = getUserId();
    return await ctx.db.insert("sections", {
      ...args,
      userId,
      createdAt: new Date().toISOString(),
    });
  },
});

// Update a section
export const update = mutation({
  args: {
    id: v.id("sections"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = getUserId();
    const section = await ctx.db.get(args.id);

    if (!section || section.userId !== userId) {
      throw new Error("Section not found");
    }

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete a section and unlink all tasks
export const remove = mutation({
  args: { id: v.id("sections") },
  handler: async (ctx, args) => {
    const userId = getUserId();
    const section = await ctx.db.get(args.id);

    if (!section || section.userId !== userId) {
      throw new Error("Section not found");
    }

    // Unlink all tasks from this section
    const tasksInSection = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_section", (q) =>
        q.eq("userId", userId).eq("sectionId", args.id)
      )
      .collect();

    for (const task of tasksInSection) {
      await ctx.db.patch(task._id, { sectionId: null });
    }

    return await ctx.db.delete(args.id);
  },
});
