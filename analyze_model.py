import os
import torch
import timm
import numpy as np
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# ================= CONFIG =================
DATA_DIR = "data"
MODEL_PATH = "best_model.pth"

BATCH_SIZE = 4
IMG_SIZE = 224

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", device)

# ================= TRANSFORM =================
val_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

# ================= LOAD DATA =================
val_ds = datasets.ImageFolder(os.path.join(DATA_DIR, "val"), transform=val_tf)
val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE)

class_names = val_ds.classes
num_classes = len(class_names)

print("Classes:", class_names)

# ================= LOAD MODEL =================
model = timm.create_model(
    "mobilenetv3_small_100",
    pretrained=False,
    num_classes=num_classes
)

model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

# ================= CONFUSION MATRIX =================
conf_matrix = np.zeros((num_classes, num_classes), dtype=int)

misclassified = []

with torch.no_grad():
    for imgs, labels in val_loader:
        imgs = imgs.to(device)
        labels = labels.to(device)

        outputs = model(imgs)
        _, preds = outputs.max(1)

        for i in range(len(labels)):
            true_label = labels[i].item()
            pred_label = preds[i].item()

            conf_matrix[true_label][pred_label] += 1

            if true_label != pred_label:
                img_path = val_ds.samples[len(misclassified)][0]
                misclassified.append(
                    (img_path, class_names[true_label], class_names[pred_label])
                )

# ================= PRINT RESULTS =================
print("\n=== CONFUSION MATRIX ===")
print("Rows = True class, Columns = Predicted class\n")

print("     ", end="")
for name in class_names:
    print(f"{name[:12]:>15}", end="")
print()

for i, row in enumerate(conf_matrix):
    print(f"{class_names[i][:12]:<12}", end="")
    for val in row:
        print(f"{val:>15}", end="")
    print()

# ================= PER CLASS ACC =================
print("\n=== PER CLASS ACCURACY ===")
for i in range(num_classes):
    correct = conf_matrix[i][i]
    total = conf_matrix[i].sum()
    acc = 100 * correct / total if total > 0 else 0
    print(f"{class_names[i]}: {acc:.2f}%")

# ================= MISCLASSIFIED =================
print("\n=== MISCLASSIFIED IMAGES ===")
for item in misclassified[:10]:
    print(f"File: {item[0]}")
    print(f"True: {item[1]}  |  Pred: {item[2]}")
    print("-" * 40)
