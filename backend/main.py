from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import predict_base64

app = FastAPI()

# ===== CORS FIX =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho demo. Production nên giới hạn domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageInput(BaseModel):
    image: str

@app.post("/predict")
def predict(data: ImageInput):
    label, conf = predict_base64(data.image)

    return {
        "subject": label,
        "description": f"Detected defect: {label}",
        "category": label,
        "severity": "Low",
        "confidence": conf,
        "remedySuggestion": "Inspection recommended."
    }

# Test endpoint
@app.get("/")
def root():
    return {"status": "API running"}
