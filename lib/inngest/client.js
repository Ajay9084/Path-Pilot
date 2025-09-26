import { gemini, Inngest } from "inngest";

export const inngest = new Inngest({
     id: "PathPilot", 
     name: "PathPilot",
    credentials: {
        gemini: {
            apikey: process.env.GEMINI_API_KEY,
        },
    },
    });