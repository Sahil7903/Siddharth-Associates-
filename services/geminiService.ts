
import { GoogleGenAI } from "@google/genai";

// This is a placeholder for the API key. In a real environment, this would be
// securely managed. For this example, we assume `process.env.API_KEY` is available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getAiInsight = async (prompt: string, data: any): Promise<string> => {
  if (!API_KEY) {
    return "AI Analyst is unavailable. Please configure your Gemini API key.";
  }
  
  try {
    const fullPrompt = `
      You are an expert Trade Data Analyst specializing in business intelligence for the household and kitchen products sector.
      Analyze the following data and answer the user's question. Provide a concise, insightful, and data-driven response.
      
      Data (JSON format):
      ${JSON.stringify(data, null, 2)}
      
      User's Question:
      "${prompt}"
      
      Your analysis:
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error while analyzing the data. Please try again.";
  }
};
