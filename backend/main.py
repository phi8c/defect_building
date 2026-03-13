from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File


import numpy as np
import cv2
import base64

from pipeline import run_pipeline
from scanner_segmentation import segment_crack

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageInput(BaseModel):
    image: str
    detector: str


@app.post("/predict")
def predict(data: ImageInput):

    result = run_pipeline(data.image, data.detector)

    return {
        "subject": "Wall Crack",
        "description": result["description"],
        "category": "Structural Defect",
        "severity": "Medium",
        "confidence": result["confidence"],
        "image": result["image"],
        "remedySuggestion": "Inspection recommended."
    }
    
@app.post("/scanner/segment")
async def scanner_segment(file: UploadFile = File(...)):

    contents = await file.read()

    nparr = np.frombuffer(contents, np.uint8)

    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    mask, vis = segment_crack(image)

    _, buffer = cv2.imencode(".jpg", vis)

    encoded_image = base64.b64encode(buffer).decode("utf-8")

    return {
        "mask": mask,
        "image": encoded_image
    }


@app.get("/")
def root():
    return {"status": "API running"}