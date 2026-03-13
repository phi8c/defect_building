import uuid
import os
from dotenv import load_dotenv
from supabase import create_client
import traceback

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def save_training_sample(original_bytes, detected_bytes, bbox, embedding, confidence):

    try:

        file_id = str(uuid.uuid4())

        original_path = f"original/{file_id}.jpg"
        detected_path = f"detected/{file_id}.jpg"

        print("Uploading original image...")

        supabase.storage.from_(BUCKET).upload(
            path=original_path,
            file=original_bytes,
            file_options={"content-type": "image/jpeg"}
        )

        print("Uploading detected image...")

        supabase.storage.from_(BUCKET).upload(
            path=detected_path,
            file=detected_bytes,
            file_options={"content-type": "image/jpeg"}
        )

        original_url = supabase.storage.from_(BUCKET).get_public_url(original_path)
        detected_url = supabase.storage.from_(BUCKET).get_public_url(detected_path)

        print("Inserting database row...")

        res = supabase.table("training_samples").insert({
            "image_url": original_url,
            "detected_image_url": detected_url,
            "bbox": bbox,
            "confidence": confidence,
            "embedding": embedding
        }).execute()

        print("Saved training sample")
        print(res)

    except Exception:
        print("Supabase error:")
        traceback.print_exc()