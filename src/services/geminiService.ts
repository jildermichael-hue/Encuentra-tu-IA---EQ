import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export async function getAIRecommendations(task: string): Promise<AIAnalysisResponse> {
  const prompt = `Analiza la siguiente tarea e investiga qué herramientas de Inteligencia Artificial son las más adecuadas para ejecutarla: "${task}".
  
  Proporciona una recomendación principal (la mejor) y dos alternativas sólidas (segunda y tercera opción).
  Para cada IA, incluye:
  - Nombre
  - Descripción breve y directa (máximo 2 frases)
  - Capacidades principales
  - Si es Gratis, De Pago o Freemium
  - Para qué es mejor específicamente
  - Pros y Contras
  - URL oficial
  - logoUrl: Proporciona una URL de logo válida. Usa SIEMPRE este formato: https://logo.clearbit.com/[dominio_limpio_de_la_ia].com (ejemplo: https://logo.clearbit.com/openai.com para ChatGPT). Si no conoces el dominio, usa una URL de imagen representativa de alta calidad.
  
  También proporciona un razonamiento MUY BREVE y visual (máximo 150 caracteres) de por qué la recomendación principal es la mejor.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topRecommendation: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              capabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              pricing: { type: Type.STRING, enum: ["Gratis", "Pago", "Freemium"] },
              bestFor: { type: Type.STRING },
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              url: { type: Type.STRING },
              logoUrl: { type: Type.STRING }
            },
            required: ["name", "description", "capabilities", "pricing", "bestFor", "pros", "cons", "url", "logoUrl"]
          },
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                capabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                pricing: { type: Type.STRING, enum: ["Gratis", "Pago", "Freemium"] },
                bestFor: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                url: { type: Type.STRING },
                logoUrl: { type: Type.STRING }
              },
              required: ["name", "description", "capabilities", "pricing", "bestFor", "pros", "cons", "url", "logoUrl"]
            }
          },
          reasoning: { type: Type.STRING }
        },
        required: ["topRecommendation", "alternatives", "reasoning"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No se recibió respuesta de la IA.");
  }

  return JSON.parse(response.text) as AIAnalysisResponse;
}
