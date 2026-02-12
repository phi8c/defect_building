import { DefectResult } from "../types";

//const BACKEND_URL = "http://localhost:8000/predict";

const BACKEND_URL = "/api/predict";


export const analyzeDefectImage = async (
  base64Image: string
): Promise<DefectResult> => {
  try {
    // Remove header if present (data:image/jpeg;base64,...)
    const cleanBase64 = base64Image.replace(
      /^data:image\/(png|jpeg|jpg|webp);base64,/,
      ""
    );

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: cleanBase64 }),
    });

    if (!response.ok) {
      throw new Error("Backend returned error");
    }

    const data = await response.json();

    return {
      subject: data.subject,
      description: data.description,
      category: data.category,
      severity: data.severity,
      confidence: data.confidence,
      remedySuggestion: data.remedySuggestion,
    };
  } catch (error) {
    console.error("Local Model Error:", error);
    throw new Error("Failed to analyze image via local model.");
  }
};
