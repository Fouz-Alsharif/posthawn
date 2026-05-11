from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import uvicorn
import io
from PIL import Image
import os

app = FastAPI()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load your YOLO model ---
MODEL_PATH = "best.pt" 
model = YOLO(MODEL_PATH)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    print(f"\n[LOG] Received image: {file.filename}")

    try:
        # 1. Read the uploaded image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")

        # 2. Run YOLO prediction
        # imgsz=224 matches your training configuration
        results = model.predict(img, imgsz=224, verbose=False)[0]

        # 3. Extract class and confidence (Same logic as your code)
        pred_idx = results.probs.top1
        pred_class = results.names[pred_idx]
        confidence = float(results.probs.top1conf)

        print(f"[RESULT] Prediction: {pred_class} ({confidence * 100:.2f}%)")

        return {
            "result": pred_class,
            "confidence": confidence
        }

    except Exception as e:
        print(f"[ERROR] Prediction failed: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)