
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_AI_API_KEY || "";

if (!API_KEY) {
    console.warn("GOOGLE_AI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Use gemini-1.5-pro for better reasoning and larger context window
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function generateText(prompt: string): Promise<string> {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating text with Gemini:", error);
        throw error;
    }
}

export async function generateJSON(prompt: string): Promise<any> {
    try {
        const jsonPrompt = `${prompt}
        
        IMPORTANT: Respond ONLY with valid JSON. Do not include markdown code blocks (like \`\`\`json ... \`\`\`). just the raw JSON string.`;

        const text = await generateText(jsonPrompt);

        // specific cleanup for common LLM JSON nuances
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error generating JSON with Gemini:", error);
        throw error;
    }
}
