from ultralytics import YOLO
import cv2

print("Loading YOLO crack detector...")

model = YOLO("../model/best.pt")


def detect(image):

    vis = image.copy()

    results = model(image, conf=0.15)

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

    return vis, len(bbox_data), bbox_data