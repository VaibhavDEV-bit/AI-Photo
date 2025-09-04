import { GoogleGenAI, Modality } from "@google/genai";
// FIX: Replaced the unexported 'GenerativePart' type with the correct 'Part' type.
import type { GenerateContentResponse, Part } from "@google/genai";

// FIX: Aligned with API key guidelines by initializing directly with process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface EditResult {
  image: string | null;
  mimeType: string | null;
  text: string | null;
}

export async function editImageWithCompanion(parts: Part[], prompt: string): Promise<EditResult> {
  // FIX: Removed manual check for process.env.API_KEY to align with guidelines.
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                ...parts,
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let newImageBase64: string | null = null;
    let newImageMimeType: string | null = null;
    let responseText: string | null = null;

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                newImageBase64 = part.inlineData.data;
                newImageMimeType = part.inlineData.mimeType;
            } else if (part.text) {
                responseText = part.text;
            }
        }
    }
    
    return { image: newImageBase64, mimeType: newImageMimeType, text: responseText };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while calling the Gemini API.");
  }
}