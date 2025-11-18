import { GoogleGenAI } from "@google/genai";
import { SearchResult, Source } from '../types';

// Initialize the Gemini API client
// The API key is obtained from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Searches for content using Gemini with Google Search Grounding.
 * This allows finding up-to-date books, news, and articles.
 */
export const searchContent = async (query: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find detailed information about books, news, or articles related to: "${query}". 
      Provide a comprehensive summary of the top findings. 
      If it's a book, include author and plot summary. 
      If it's news, include the latest updates.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No results found.";
    
    // Extract sources from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((source: any): source is Source => source !== null);

    // De-duplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map((s) => [s.uri, s])).values()) as Source[];

    return {
      text,
      sources: uniqueSources,
    };
  } catch (error) {
    console.error("Error searching content:", error);
    throw error;
  }
};

/**
 * Generates a structured reading item from a search result or raw text.
 * Used to "Add" a found item to the library with better metadata.
 */
export const generateReadingItem = async (rawText: string, sourceUrl?: string): Promise<{ title: string; author: string; description: string; content: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following text and extract/generate metadata for a reading library item.
      
      Text: ${rawText.substring(0, 5000)}...

      Return ONLY a JSON object with these keys:
      - title: A suitable title
      - author: The author or source name
      - description: A short 2-sentence description
      - content: The full text formatted nicely in Markdown. If the input was short, expand it slightly to be readable (approx 300-500 words) so it looks like a proper article/chapter.
      `,
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No JSON response");
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating item:", error);
    return {
        title: "New Item",
        author: "Unknown",
        description: "Imported from search",
        content: rawText
    };
  }
};

/**
 * Generates a cover image for the content using Imagen.
 */
export const generateCoverImage = async (title: string, description: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A high quality, artistic, digital art cover image for an article titled "${title}". Context: ${description}. Minimalist, modern, clean style, cinematic lighting, 4k resolution.`,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    });

    const b64 = response.generatedImages?.[0]?.image?.imageBytes;
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

/**
 * AI Assistant for the Reader view to explain or summarize selected text.
 */
export const explainText = async (text: string, context: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
            Context: User is reading an article.
            Selected Text: "${text}"
            
            Task: Briefly explain this text or define difficult terms within it. Keep it concise (under 100 words).
            `
        });
        return response.text || "Could not generate explanation.";
    } catch (e) {
        console.error(e);
        return "Error generating explanation.";
    }
}