import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Default user ID for single-user mode (no authentication)
const DEFAULT_USER_ID = "default-user";

// Helper to get user ID (returns default for single-user mode)
function getUserId(): string {
  return DEFAULT_USER_ID;
}

// Get all tasks for the user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = getUserId();
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get a single task by ID
export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = getUserId();
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      return null;
    }
    return task;
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    sectionId: v.union(v.id("sections"), v.null()),
    dueDate: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = getUserId();

    // Validate section exists if sectionId is provided
    if (args.sectionId) {
      const section = await ctx.db.get(args.sectionId);
      if (!section || section.userId !== userId) {
        throw new Error("Invalid section");
      }
    }

    return await ctx.db.insert("tasks", {
      ...args,
      userId,
      completed: false,
      createdAt: new Date().toISOString(),
    });
  },
});

// Update a task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    sectionId: v.optional(v.union(v.id("sections"), v.null())),
    dueDate: v.optional(v.union(v.string(), v.null())),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = getUserId();
    const task = await ctx.db.get(args.id);

    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    // Validate section exists if changing section
    if (args.sectionId !== undefined && args.sectionId !== null) {
      const section = await ctx.db.get(args.sectionId);
      if (!section || section.userId !== userId) {
        throw new Error("Invalid section");
      }
    }

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Toggle task completion
export const toggleComplete = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = getUserId();
    const task = await ctx.db.get(args.id);

    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    const newCompleted = !task.completed;
    return await ctx.db.patch(args.id, {
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : null,
    });
  },
});

// Delete a task
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = getUserId();
    const task = await ctx.db.get(args.id);

    if (!task || task.userId !== userId) {
      throw new Error("Task not found");
    }

    return await ctx.db.delete(args.id);
  },
});
