import torch
import timm
from torchvision import transforms, datasets
from PIL import Image
import io
import base64
import os

DEVICE = "cpu"
IMG_SIZE = 224
MODEL_PATH = "../model_v0.pth"

# Load class names
train_ds = datasets.ImageFolder("../data/train")
CLASS_NAMES = train_ds.classes
NUM_CLASSES = len(CLASS_NAMES)

# Load model once
model = timm.create_model(
    "mobilenetv3_small_100",
    pretrained=False,
    num_classes=NUM_CLASSES
)

model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

def predict_base64(base64_str):
    image_data = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    image = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probs, 1)

    return CLASS_NAMES[predicted.item()], float(confidence.item())
