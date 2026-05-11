# FastAPI + Ultralytics — Render / Railway / Fly.io (uses PORT).
# Repo layout: main.py, requirements.txt, yolo_burn_cls_v1.pt in Backend/

FROM python:3.11-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY yolo_burn_cls_v1.pt .

# Model sits next to main.py in container (matches GitHub Backend root layout)
ENV BURN_MODEL_PATH=/app/yolo_burn_cls_v1.pt
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
