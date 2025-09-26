"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  // Ensure industry exists in IndustryInsight
  let industryInsight = await db.industryInsight.findUnique({
    where: { industry: data.industry },
  });

  if (!industryInsight) {
    const aiInsights = await generateAIInsights(data.industry);
    industryInsight = await db.industryInsight.create({
      data: {
        industry: data.industry,
        ...aiInsights,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const updatedUser = await db.user.update({
    where: { clerkUserId: userId },
    data: {
      industry: data.industry, // Must be a string
      experience: data.experience,
      bio: data.bio,
      skills: data.skills,
    },
  });

  revalidatePath("/");

  return updatedUser;
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true },
  });

  return { isOnboarded: !!user?.industry };
}
