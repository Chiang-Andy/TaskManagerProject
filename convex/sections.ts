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



// Get a single section by ID (with ownership check)
export const getById = query({
  args: { id: v.id("sections") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
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
    const userId = await getUserId(ctx);
    return await ctx.db.insert("sections", {
      ...args,
      userId,
      createdAt: new Date().toISOString(),
    });
  },
});

// Update a section (with ownership check)
export const update = mutation({
  args: {
    id: v.id("sections"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const section = await ctx.db.get(args.id);

    if (!section || section.userId !== userId) {
      throw new Error("Section not found or access denied");
    }

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete a section and unlink all tasks (with ownership check)
export const remove = mutation({
  args: { id: v.id("sections") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const section = await ctx.db.get(args.id);

    if (!section || section.userId !== userId) {
      throw new Error("Section not found or access denied");
    }

    // Unlink all tasks from this section (only user's own tasks)
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
