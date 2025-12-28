
import { GoogleGenAI, Type, GenerateContentResponse, VideoGenerationReferenceType } from "@google/genai";
import { Asset } from "../types";

export class GeminiService {
  // Fresh GoogleGenAI instance is created inside each method to ensure the latest API key is used
  // following the guidelines for dynamic key selection (e.g. for Veo models).

  // Fix: Changed history parameter type and implementation to correctly handle chat history
  async chat(message: string, history: {role: string, content: string}[], systemInstruction: string) {
    // Always initialize a new instance to pick up potential API key changes
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        // Map history to the format expected by the Gemini API: { role, parts: [{ text }] }
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
      },
    });
    return response.text;
  }

  async analyzeFile(fileBase64: string, mimeType: string, prompt: string, language: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: fileBase64, mimeType } },
          { text: `${prompt} (Explain in ${language === 'ar' ? 'Arabic' : 'English'})` }
        ]
      }
    });
    return response.text;
  }

  async generateVideoLecture(assets: Asset[], language: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // 1. Convert assets to Gemini parts for analysis
    const parts = assets.map(a => ({
      inlineData: { data: a.data, mimeType: a.type }
    }));

    // 2. Analyze all assets to create a unified lecture script
    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          ...parts,
          { text: "Act as a world-class university professor. Analyze these uploaded materials (images of boards, notebooks, or PDF documents) and create a comprehensive educational lecture script. Then, output a single highly descriptive visual prompt (in English) that describes a high-end educational video explaining these specific topics with 3D animations and a professional setting." }
        ]
      }
    });
    
    const fullText = analysisResponse.text || "";
    const visualPrompt = fullText.split('\n').pop() || "A professional university lecture explanation video.";

    // 3. Prepare reference images for Veo (max 3)
    const referenceImages = assets
      .filter(a => a.type.startsWith('image/'))
      .slice(0, 3)
      .map(a => ({
        image: {
          imageBytes: a.data,
          mimeType: a.type,
        },
        referenceType: VideoGenerationReferenceType.ASSET,
      }));

    // 4. Start Veo Video Generation
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: visualPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
        referenceImages: referenceImages.length > 0 ? referenceImages : undefined
      }
    });

    return { operation, analysis: fullText };
  }

  async checkVideoOperation(operation: any) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    return await ai.operations.getVideosOperation({ operation });
  }

  async fetchVideo(downloadLink: string) {
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    return await response.blob();
  }
}
