import base64
import cv2
import numpy as np
import torch
from PIL import Image

from ultralytics import YOLO
import segmentation_models_pytorch as smp

from transformers import AutoProcessor, Qwen2VLForConditionalGeneration

from supabase_logging import save_training_sample


DEVICE = "cpu"


# =================================
# LOAD MODELS (ONCE AT START)
# =================================

print("Loading YOLO crack detection model...")
yolo_model = YOLO("../model/best.pt")

print("Loading segmentation model...")

seg_model = smp.DeepLabV3Plus(
    encoder_name="resnet50",
    encoder_weights=None,
    in_channels=3,
    classes=1
)

seg_model.load_state_dict(
    torch.load("../model/deeplabv3_crack_best_v2.pth", map_location=DEVICE)
)

seg_model.eval()


print("Loading Qwen2-VL model...")

vlm_processor = AutoProcessor.from_pretrained(
    "Qwen/Qwen2-VL-2B-Instruct"
)

vlm_model = Qwen2VLForConditionalGeneration.from_pretrained(
    "Qwen/Qwen2-VL-2B-Instruct",
    torch_dtype=torch.float32,
    device_map="cpu"
).eval()

print("All models loaded")


# =================================
# IMAGE UTILS
# =================================

def decode_base64(base64_str):

    image_data = base64.b64decode(base64_str)

    np_arr = np.frombuffer(image_data, np.uint8)

    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)


def encode_base64(image):

    _, buffer = cv2.imencode(".jpg", image)

    return base64.b64encode(buffer).decode("utf-8")


# =================================
# VECTOR EMBEDDING
# =================================

def extract_embedding(image):

    resized = cv2.resize(image, (32, 16))

    vec = resized.flatten().astype(np.float32)

    vec = vec / 255.0

    if len(vec) < 512:
        vec = np.pad(vec, (0, 512 - len(vec)))
    else:
        vec = vec[:512]

    embedding = vec.tolist()

    print("Embedding length:", len(embedding))

    return embedding


# =================================
# YOLO DETECTION
# =================================

def detect_yolo(image):

    vis = image.copy()

    results = yolo_model(image, conf=0.15)

    bbox_data = []

    for r in results:

        if r.boxes is None:
            continue

        for box in r.boxes:

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            bbox_data.append({
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2
            })

            cv2.rectangle(
                vis,
                (x1, y1),
                (x2, y2),
                (0, 0, 255),
                2
            )

    crack_count = len(bbox_data)

    return vis, crack_count, bbox_data


# =================================
# SEGMENTATION DETECTION
# =================================

def detect_segmentation(image):

    vis = image.copy()

    img = cv2.resize(image, (512, 512))

    img = img.astype(np.float32) / 255.0

    img = np.transpose(img, (2, 0, 1))

    input_tensor = torch.tensor(img).unsqueeze(0)

    with torch.no_grad():

        pred = seg_model(input_tensor)

        pred = torch.sigmoid(pred)[0, 0].cpu().numpy()

    mask = (pred > 0.4).astype(np.uint8)

    mask = cv2.resize(mask, (image.shape[1], image.shape[0]))

    vis[mask == 1] = [0, 0, 255]

    crack_pixels = int(mask.sum())

    crack_count = 1 if crack_pixels > 0 else 0

    bbox_data = {
        "type": "mask",
        "mask": mask.tolist()
    }

    return vis, crack_count, bbox_data


# =================================
# VLM DESCRIPTION
# =================================

def generate_description(image, crack_count, detector_type):

    if detector_type == "yolo":

        prompt = """
You are a construction inspection AI.

Cracks are marked with red bounding boxes.

Describe the crack inside the red boxes.

Mention:
- surface (wall, floor, ceiling)
- position (upper, middle, lower)
- crack orientation (horizontal or vertical)

Write one short inspection sentence.
"""

    else:

        prompt = """
You are a crack detection assistant in construction.

Look at the image with the crack marked in red. Observe the crack's location relative to the background in the image and write a descriptive sentence.
The description should mention the crack's location, whether it's a horizontal or vertical crack, and its proximity to architectural elements such as doors, windows, etc.
"""

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": prompt}
            ],
        }
    ]

    text = vlm_processor.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    inputs = vlm_processor(
        text=[text],
        images=[image],
        return_tensors="pt"
    )

    print("Running VLM inference...")

    with torch.no_grad():

        outputs = vlm_model.generate(
            **inputs,
            max_new_tokens=40
        )

    result = vlm_processor.batch_decode(
        outputs,
        skip_special_tokens=True
    )[0]

    if "assistant" in result:
        result = result.split("assistant")[-1].strip()

    return f"{result} ({crack_count} cracks detected)"


# =================================
# MAIN PIPELINE
# =================================

def run_pipeline(base64_img, detector_type):

    image = decode_base64(base64_img)

    # =========================
    # DETECTION
    # =========================

    if detector_type == "yolo":

        vis, crack_count, bbox_data = detect_yolo(image)

    else:

        vis, crack_count, bbox_data = detect_segmentation(image)

    # =========================
    # VLM DESCRIPTION
    # =========================

    if crack_count > 0:

        print("Generating AI description...")

        vis_small = cv2.resize(vis, (768, 768))

        vis_rgb = cv2.cvtColor(vis_small, cv2.COLOR_BGR2RGB)

        pil_image = Image.fromarray(vis_rgb)

        description = generate_description(
            pil_image,
            crack_count,
            detector_type
        )

    else:

        description = "Không phát hiện vết nứt."

    encoded_image = encode_base64(vis)

    # =============================
    # SAVE DATASET TO SUPABASE
    # =============================

    print("Crack count:", crack_count)

    if crack_count > 0:

        embedding = extract_embedding(image)

        _, buffer_original = cv2.imencode(".jpg", image)
        _, buffer_detected = cv2.imencode(".jpg", vis)

        try:

            save_training_sample(
                buffer_original.tobytes(),
                buffer_detected.tobytes(),
                bbox_data,
                embedding,
                0.9
            )

        except Exception as e:

            print("Supabase error:", e)

    return {
        "description": description,
        "image": encoded_image,
        "confidence": 0.9,
        "crack_count": crack_count
    }