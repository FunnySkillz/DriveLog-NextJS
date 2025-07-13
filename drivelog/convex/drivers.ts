import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { QueryCtx, MutationCtx } from "./_generated/server";

async function getUserProfile(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("user_profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!profile) {
    throw new Error("User profile not found");
  }

  return { userId, profile };
}

export const listByCompany = query({
  args: {},
  handler: async (ctx) => {
    const { profile } = await getUserProfile(ctx);

    if (profile.role !== "admin" || !profile.companyId) {
      throw new Error("Not authorized");
    }

    const drivers = await ctx.db
      .query("user_profiles")
      .withIndex("by_company", (q) => q.eq("companyId", profile.companyId!))
      .collect();

    // Get vehicle assignments for each driver
    const driversWithAssignments = await Promise.all(
      drivers.map(async (driver) => {
        const assignments = await ctx.db
          .query("vehicle_assignments")
          .withIndex("by_user", (q) => q.eq("userId", driver.userId))
          .collect();

        const vehicles = await Promise.all(
          assignments.map(a => ctx.db.get(a.vehicleId))
        );

        return {
          ...driver,
          assignedVehicles: vehicles.filter(Boolean),
        };
      })
    );

    return driversWithAssignments;
  },
});

export const inviteDriver = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { profile } = await getUserProfile(ctx);

    if (profile.role !== "admin" || !profile.companyId) {
      throw new Error("Not authorized");
    }

    // Check if user already exists
    const existingProfile = await ctx.db
      .query("user_profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingProfile) {
      throw new Error("User with this email already exists");
    }

    // For now, we'll create a placeholder profile
    // In a real app, you'd send an invitation email
    return await ctx.db.insert("user_profiles", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: "pending" as any, // This would be set when they actually sign up
      companyId: profile.companyId,
      role: "driver",
      name: args.name,
      email: args.email,
    });
  },
});

export const removeDriver = mutation({
  args: { driverId: v.id("user_profiles") },
  handler: async (ctx, args) => {
    const { profile } = await getUserProfile(ctx);

    if (profile.role !== "admin") {
      throw new Error("Not authorized");
    }

    const driver = await ctx.db.get(args.driverId);
    if (!driver || driver.companyId !== profile.companyId) {
      throw new Error("Driver not found or not authorized");
    }

    // Remove all vehicle assignments
    const assignments = await ctx.db
      .query("vehicle_assignments")
      .withIndex("by_user", (q) => q.eq("userId", driver.userId))
      .collect();

    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    await ctx.db.delete(args.driverId);
  },
});
