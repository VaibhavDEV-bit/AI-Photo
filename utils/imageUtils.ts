// FIX: Replaced the unexported 'GenerativePart' type with the correct 'Part' type.
import type { Part } from '@google/genai';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the `data:mime/type;base64,` prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
}

// FIX: Replaced the unexported 'GenerativePart' type with the correct 'Part' type.
export async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedData = await fileToBase64(file);
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export function base64UrlToGenerativePart(base64Url: string): Part {
    const match = base64Url.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
      throw new Error('Invalid base64 URL format');
    }
    const mimeType = match[1];
    const data = match[2];
  
    return {
      inlineData: {
        data,
        mimeType,
      },
    };
  }