import torch
import cv2
import numpy as np
import segmentation_models_pytorch as smp

DEVICE = "cpu"

print("Loading segmentation crack detector...")

model = smp.DeepLabV3Plus(
    encoder_name="resnet50",
    encoder_weights=None,
    in_channels=3,
    classes=1
)

model.load_state_dict(
    torch.load("../model/deeplabv3_crack_best_v2.pth", map_location=DEVICE)
)

model.eval()


def preprocess(image):

    img = cv2.resize(image, (512, 512))

    img = img.astype(np.float32) / 255.0

    img = np.transpose(img, (2, 0, 1))

    return torch.tensor(img).unsqueeze(0)


def detect(image):

    vis = image.copy()

    input_tensor = preprocess(image)

    with torch.no_grad():

        pred = model(input_tensor)

        pred = torch.sigmoid(pred)[0, 0].cpu().numpy()

    mask = (pred > 0.4).astype(np.uint8)

    mask = cv2.resize(mask, (image.shape[1], image.shape[0]))

    vis[mask == 1] = [0, 0, 255]

    crack_pixels = int(mask.sum())

    crack_count = 1 if crack_pixels > 0 else 0

    return vis, crack_count, []