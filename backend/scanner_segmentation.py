import torch
import cv2
import numpy as np
import segmentation_models_pytorch as smp

DEVICE = "cpu"

MODEL_PATH = "../model/deeplabv3_crack_best_v2.pth"

print("Loading segmentation model...")

model = smp.DeepLabV3Plus(
    encoder_name="resnet50",
    encoder_weights=None,
    in_channels=3,
    classes=1
)

model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

print("Segmentation model ready")


def preprocess(image):

    img = cv2.resize(image, (512, 512))

    img = img.astype(np.float32) / 255.0

    img = np.transpose(img, (2, 0, 1))

    tensor = torch.tensor(img).unsqueeze(0)

    return tensor


def segment_crack(image):

    input_tensor = preprocess(image)

    with torch.no_grad():

        pred = model(input_tensor)

        pred = torch.sigmoid(pred)[0, 0].cpu().numpy()

    mask = (pred > 0.4).astype(np.uint8)

    mask_resized = cv2.resize(
        mask,
        (image.shape[1], image.shape[0])
    )

    vis = image.copy()

    vis[mask_resized == 1] = [0, 0, 255]

    return mask_resized.tolist(), vis