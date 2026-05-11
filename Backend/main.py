from __future__ import annotations

import io
import os
import traceback
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
import uvicorn
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent
# Support repo layouts: model in Backend/ root (GitHub upload) or Backend/models/
_root_weights = BASE_DIR / "yolo_burn_cls_v1.pt"
_models_weights = BASE_DIR / "models" / "yolo_burn_cls_v1.pt"
DEFAULT_MODEL = _root_weights if _root_weights.is_file() else _models_weights
MODEL_PATH = Path(os.environ.get("BURN_MODEL_PATH", str(DEFAULT_MODEL)))

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = frozenset(
    {"image/jpeg", "image/png", "image/webp", "image/jpg", "image/pjpeg", "image/x-png"}
)

app = FastAPI(title="Burn classification API")

_cors_raw = os.environ.get("CORS_ORIGINS", "*").strip()
if not _cors_raw or _cors_raw == "*":
    _cors_origins = ["*"]
else:
    _cors_origins = [o.strip() for o in _cors_raw.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model: YOLO | None = None
model_load_error: str | None = None


def load_model() -> None:
    global model, model_load_error
    model = None
    model_load_error = None
    if not MODEL_PATH.is_file():
        model_load_error = f"Model file not found: {MODEL_PATH}"
        print(f"[ERROR] {model_load_error}")
        return
    try:
        model = YOLO(str(MODEL_PATH))
        print(f"[OK] Loaded YOLO model from {MODEL_PATH}")
    except Exception as e:  # noqa: BLE001
        model_load_error = f"{type(e).__name__}: {e}"
        print(f"[ERROR] Failed to load model: {model_load_error}")
        traceback.print_exc()


@app.on_event("startup")
def _startup() -> None:
    load_model()


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok" if model is not None else "degraded",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
        "error": model_load_error,
    }


@app.post("/predict")
async def predict(file: UploadFile | None = File(default=None)) -> dict:
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=model_load_error or "Model is not loaded",
        )

    if file is None:
        raise HTTPException(status_code=400, detail="No image file was uploaded")

    filename = file.filename or "upload"
    ct = (file.content_type or "").split(";")[0].strip().lower()
    if ct and ct not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {file.content_type!r}. Use JPEG or PNG.",
        )

    try:
        contents = await file.read()
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Could not read upload: {e}") from e

    if not contents:
        raise HTTPException(status_code=400, detail="No image uploaded or file is empty")

    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large (max {MAX_UPLOAD_BYTES // (1024 * 1024)} MB)",
        )

    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except UnidentifiedImageError as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file: could not decode as JPEG/PNG/WebP",
        ) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}") from e

    try:
        results = model.predict(img, imgsz=224, verbose=False)[0]
        pred_idx = results.probs.top1
        pred_class = results.names[pred_idx]
        confidence = float(results.probs.top1conf)
    except Exception as e:  # noqa: BLE001
        print(f"[ERROR] Prediction failed: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Model prediction failed: {e}",
        ) from e

    print(f"[RESULT] {filename!r} -> {pred_class} ({confidence * 100:.2f}%)")

    return {
        "predicted_class": pred_class,
        "confidence": confidence,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
