"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Generate AI insights for a given industry
export async function generateAIInsights(industry) {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
      "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
    }
    IMPORTANT: Return ONLY the JSON, no extra text.
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.candidates[0].content.parts[0].text || "";
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleanedText);
}

// Get or generate industry insights for a user

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Fetch user
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  let industry = user.industry;

  // If no industry assigned, pick a default or random
  if (!industry) {
    industry = "tech-software-development"; // or pick random from your list

    // Make sure the IndustryInsight exists
    let insight = await db.industryInsight.findUnique({
      where: { industry },
    });

    if (!insight) {
      // Generate AI insights
      const aiInsights = await generateAIInsights(industry);

      // Create the IndustryInsight first
      insight = await db.industryInsight.create({
        data: {
          industry,
          ...aiInsights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Now update the user safely
    await db.user.update({
      where: { clerkUserId: userId },
      data: { industry },
    });
  }

  // Fetch and return the final industry insight
  const finalInsight = await db.industryInsight.findUnique({
    where: { industry },
  });

  return finalInsight;
}
