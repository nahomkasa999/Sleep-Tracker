import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { SleepEntryReceivingSchemaDBType } from "@/app/lib/insight"; // Corrected import path

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);



async function generateAndValidateInsight(
  prompt: string,
  model: string = "gemini-2.5-flash"
) {
  const generativeModel = genAI.getGenerativeModel({ model });
  const result = await generativeModel.generateContent(prompt);
  const response = await result.response;
  const rawText = response.candidates![0].content.parts[0].text;



  if (rawText !== undefined) {
    return rawText.trim(); 
  } else {
    throw new Error("Invalid response from AI service: No text content.");
  }
}

export async function getCorrelationInsight(
  sleepEntries: SleepEntryReceivingSchemaDBType
) {
  const prompt = `
    Analyze the following sleep and day rating data to find a correlation.
    Data Entries: ${JSON.stringify(sleepEntries)}
    Provide a concise, two-sentence analysis of the correlation between sleep duration and day rating.
    For example: "There appears to be a positive correlation between sleep duration and day rating, as longer sleep durations generally coincide with higher day ratings. However, the limited dataset shows inconsistencies, suggesting other factors besides sleep duration significantly influence the day's rating."
  `;

  return generateAndValidateInsight(prompt);
}

export async function getOverviewInsight(
  sleepEntries: SleepEntryReceivingSchemaDBType
) {
  const prompt = `
    Analyze the following sleep and day rating data to provide an overview of the user's recent patterns.
    Data Entries: ${JSON.stringify(sleepEntries)}
    Provide a concise, two-sentence overview of the user's recent sleep patterns, mood, and day ratings.
    For example: "You have recently experienced variable sleep patterns with a tendency towards shorter sleep durations, and primarily negative moods. However, the most recent entry shows improved mood and day rating, coinciding with a longer sleep duration the night before."
  `;

  return generateAndValidateInsight(prompt);
}
