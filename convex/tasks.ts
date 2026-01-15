import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to get authenticated user ID
async function getUserId(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }
  return identity.subject;
}

// Get all tasks for the authenticated user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get a single task by ID (with ownership check)
export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
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
    const userId = await getUserId(ctx);

    // Validate section ownership if sectionId is provided
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

// Update a task (with ownership check)
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
    const userId = await getUserId(ctx);
    const task = await ctx.db.get(args.id);

    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }

    // Validate section ownership if changing section
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

// Toggle task completion (with ownership check)
export const toggleComplete = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const task = await ctx.db.get(args.id);

    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }

    return await ctx.db.patch(args.id, { completed: !task.completed });
  },
});

// Delete a task (with ownership check)
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const task = await ctx.db.get(args.id);

    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }

    return await ctx.db.delete(args.id);
  },
});
