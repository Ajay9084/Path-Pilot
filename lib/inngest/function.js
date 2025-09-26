import { db } from "../prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper: safely call AI with retries
async function safeGenerateContent(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await model.generateContent(prompt);
      return res;
    } catch (err) {
      if (err.status === 429) {
        const delay = parseFloat(err.errorDetails?.[0]?.retryDelay || 5);
        console.warn(`Rate limit hit. Retrying in ${delay}s...`);
        await new Promise(r => setTimeout(r, delay * 1000));
      } else {
        console.error("AI request failed:", err);
        throw err;
      }
    }
  }
  throw new Error("Failed to generate content after multiple retries");
}

// Main Inngest function
export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Every Sunday at midnight
  async ({ event, step }) => {
    // Fetch industries from DB
    const industriesData = await step.run("Fetch industries", async () => {
      return db.industryInsight.findMany({ select: { industry: true } });
    });

    for (const { industry } of industriesData) {
      const prompt = `
        Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
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
        IMPORTANT: Return ONLY the JSON. No extra text or markdown.
        Include at least 5 roles, 5 skills, 5 trends.
        Growth rate should be a percentage.
      `;

      // Call AI safely
      const res = await step.ai.wrap("gemini", (p) => safeGenerateContent(p), prompt);

      // Safely parse AI output
      let insights = {};
      try {
        const text = res.response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        insights = JSON.parse(cleanedText);
      } catch (err) {
        console.error(`Failed to parse AI output for ${industry}:`, err);
        insights = {}; // fallback empty object
      }

      // Ensure minimum items
      insights.salaryRanges = insights.salaryRanges?.slice(0, 5) || [];
      insights.topSkills = insights.topSkills?.slice(0, 5) || [];
      insights.keyTrends = insights.keyTrends?.slice(0, 5) || [];
      insights.recommendedSkills = insights.recommendedSkills?.slice(0, 5) || [];

      // Update DB
      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });

      console.log(`✅ Updated insights for ${industry}`);
    }
  }
);
