import { DefectResult } from "../types";

const BACKEND_URL = "/api/predict";
//const BACKEND_URL = "http://localhost:8000/predict";

export const analyzeDefectImage = async (
  base64Image: string,
  detector: "yolo" | "seg"
): Promise<DefectResult> => {

  const cleanBase64 = base64Image.replace(
    /^data:image\/(png|jpeg|jpg|webp);base64,/,
    ""
  );

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: cleanBase64,
      detector: detector
    }),
  });

  if (!response.ok) {
    throw new Error("Backend error");
  }

  const data = await response.json();

  return {
    subject: data.subject,
    description: data.description,
    category: data.category,
    severity: data.severity,
    confidence: data.confidence,
    remedySuggestion: data.remedySuggestion,
    image: data.image
  };
};