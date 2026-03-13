import os
import uuid
import traceback
from dotenv import load_dotenv
from supabase import create_client


# =========================
# LOAD ENV
# =========================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET")

print("SUPABASE_URL:", SUPABASE_URL)
print("BUCKET:", BUCKET)


# =========================
# INIT CLIENT
# =========================

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Connected to Supabase")


# =========================
# TEST IMAGE
# =========================

TEST_IMAGE = "test.jpg"

if not os.path.exists(TEST_IMAGE):
    print("Put a test.jpg file next to this script")
    exit()


# =========================
# TEST STORAGE UPLOAD
# =========================

try:

    file_id = str(uuid.uuid4())
    storage_path = f"test/{file_id}.jpg"

    print("Uploading image...")

    with open(TEST_IMAGE, "rb") as f:

        supabase.storage.from_(BUCKET).upload(
            path=storage_path,
            file=f.read(),
            file_options={"content-type": "image/jpeg"}
        )

    print("Upload success")

    url = supabase.storage.from_(BUCKET).get_public_url(storage_path)

    print("Public URL:", url)

except Exception as e:

    print("UPLOAD ERROR")
    traceback.print_exc()
    exit()


# =========================
# TEST DATABASE INSERT
# =========================

try:

    print("Inserting database row...")

    res = supabase.table("training_samples").insert({
        "image_url": url,
        "bbox": [],
        "confidence": 0.9
    }).execute()

    print("Insert success")
    print(res)

except Exception as e:

    print("DATABASE ERROR")
    traceback.print_exc()