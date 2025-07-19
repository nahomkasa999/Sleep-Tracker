
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { SleepEntryReceivingSchemaDBType, WellbeingEntryReceivingSchemaDBType } from "./insight";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
console.log(process.env.GEMINI_API_KEY)

const InsightSchema = z.object({
  insight: z.string(),
});
function cleanAndParseJsonString(jsonString: string) {
  let cleanedString = jsonString.trim();
  if (cleanedString.startsWith("'") && cleanedString.endsWith("'")) {
    cleanedString = cleanedString.substring(1, cleanedString.length - 1);
  }

  const startDelimiter = '```json\\n';
  const endDelimiter = '```';

  if (cleanedString.startsWith(startDelimiter)) {
    cleanedString = cleanedString.substring(startDelimiter.length);
  }
  if (cleanedString.endsWith(endDelimiter)) {
    cleanedString = cleanedString.substring(0, cleanedString.length - endDelimiter.length);
  }

  cleanedString = cleanedString.trim();
  console.log(cleanedString)

  try {
    const parsedObject = JSON.parse(cleanedString);
    return parsedObject;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

async function generateAndValidateInsight(
  prompt: string,
  model: string = "gemini-2.5-flash"
) {
  const generativeModel = genAI.getGenerativeModel({ model });
  const result = await generativeModel.generateContent(prompt);
  const response = await result.response;
  const jsonfile = response.candidates![0].content.parts[0].text
  if(jsonfile !== undefined){
  const parsed = cleanAndParseJsonString(jsonfile);
  console.log(parsed)
  try {
    const validated = InsightSchema.parse(parsed);
    return validated.insight;
  } catch (error) {
    console.error("Gemini API response validation failed:", error);
    throw new Error("Invalid response from AI service.");
  }

  }
  
}

export async function getCorrelationInsight(
  sleepEntries: SleepEntryReceivingSchemaDBType,
  wellbeingEntries: WellbeingEntryReceivingSchemaDBType
) {
  const prompt = `
    Analyze the following sleep and well-being data to find a correlation.
    Sleep Entries: ${JSON.stringify(sleepEntries)}
    Well-being Entries: ${JSON.stringify(wellbeingEntries)}
    Provide the analysis as a JSON object with a single key "insight" containing a concise, one-sentence analysis of the correlation between sleep duration and day rating.
    For example: {"insight": "There appears to be a positive correlation between sleep duration and day rating, as longer sleep durations generally coincide with higher day ratings. However, the limited dataset shows inconsistencies, suggesting other factors besides sleep duration significantly influence the day's rating."}
  `;

  return generateAndValidateInsight(prompt);
}

export async function getOverviewInsight(
  sleepEntries: SleepEntryReceivingSchemaDBType,
  wellbeingEntries: WellbeingEntryReceivingSchemaDBType
) {
  const prompt = `
    Analyze the following sleep and well-being data to provide an overview of the user's recent patterns.
    Sleep Entries: ${JSON.stringify(sleepEntries)}
    Well-being Entries: ${JSON.stringify(wellbeingEntries)}
    Provide the analysis as a JSON object with a single key "insight" containing a concise, one-sentence overview of the user's recent sleep patterns, mood, and day ratings.
    For example: {"insight": "you have recently experienced variable sleep patterns with a tendency towards shorter sleep durations, and primarily negative moods. However, the most recent entry shows improved mood and day rating, coinciding with a longer sleep duration the night before."}
  `;

  return generateAndValidateInsight(prompt);
}
