
import { generateText, generateJSON } from "@/lib/ai/gemini";

export interface ResearchData {
    title: string;
    subject: string;
    targetAudience: string;
    keyConcepts: string[];
    outline: {
        chapterTitle: string;
        chapterDescription: string;
        keyPoints: string[];
    }[];
    references: string[];
    tone: string;
}

export class ResearchAgent {
    static async conductResearch(title: string, subject: string, targetAudience: string): Promise<ResearchData> {
        const prompt = `
      You are an expert non-fiction book researcher and architect.
      I need you to conduct deep research and structural planning for a new book.
      
      Book Title: "${title}"
      Subject: "${subject}"
      Target Audience: "${targetAudience}"
      
      Please provide a comprehensive research document in JSON format containing:
      1. A list of 5-10 key concepts that must be covered.
      2. A detailed chapter outline (min 5, max 12 chapters). For each chapter provide a title, a brief description, and 3-5 key points to cover.
      3. A list of 3-5 potential references or case studies (real or hypothetical examples that fit the theme).
      4. A suggested tone for the book (e.g., "Professional yet accessible", "Academic", "Conversational").
      
      The output structure must match the following TypeScript interface:
      {
        "title": string,
        "subject": string,
        "targetAudience": string,
        "keyConcepts": string[],
        "outline": [
            { "chapterTitle": string, "chapterDescription": string, "keyPoints": string[] }
        ],
        "references": string[],
        "tone": string
      }
    `;

        return await generateJSON(prompt);
    }
}

export class WritingAgent {
    static async writeChapter(
        bookTitle: string,
        chapterTitle: string,
        chapterDescription: string,
        keyPoints: string[],
        tone: string,
        context: string
    ): Promise<string> {
        const prompt = `
            You are a professional non-fiction book writer.
            Write the content for a chapter of the book "${bookTitle}".
            
            Chapter Title: "${chapterTitle}"
            Description: "${chapterDescription}"
            Tone: "${tone}"
            
            Key points to cover in this chapter:
            ${keyPoints.map(p => `- ${p}`).join('\n')}
            
            Context/Background Info:
            ${context}
            
            Write the full chapter content in Markdown format. 
            Use appropriate headers (##, ###), paragraphs, and bullet points.
            Do not include the main project title as a header, start with the Chapter Title.
            Make it engaging, informative, and substantial (aim for 1500-2500 words).
        `;

        return await generateText(prompt);
    }
}
