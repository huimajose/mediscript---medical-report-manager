
import { GoogleGenAI } from "@google/genai";

export const formalizeReport = async (rawNotes: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform the following medical notes into a professional, structured medical report in HTML format. Use standard medical terminology. 
    Notes: "${rawNotes}"
    Return ONLY the HTML content.`,
  });

  return response.text || rawNotes;
};

export const suggestDiagnosis = async (symptoms: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on these symptoms: "${symptoms}", suggest 3 potential differential diagnoses and 2 recommended next tests. Return as a short professional summary in HTML.`,
    });
  
    return response.text || "Unable to generate suggestions.";
  };
