"""Simple Flask service for face verification.

This script demonstrates how you can enforce "one face, one vote" by storing
face encodings and rejecting duplicates. It expects the frontend to POST a JSON
payload `{ "image": "data:image/jpeg;base64,..." }` to `/api/verify-face`.

⚠️  Requirements
    pip install flask face-recognition numpy opencv-python
    (face-recognition requires dlib; follow the library docs for install steps)

The service stores face encodings as `.npy` files inside `face_registry/` so
encodings persist across runs. In a production deployment you should replace
this simple storage with a database or secure blob store.
"""
from __future__ import annotations

import base64
import hashlib
import io
import os
from pathlib import Path
from typing import List

import numpy as np
from flask import Flask, jsonify, request

try:
    import cv2  # type: ignore
    import face_recognition  # type: ignore
except ImportError as exc:  # pragma: no cover - dependency hint
    raise SystemExit(
        "face_verifier.py requires `opencv-python` and `face-recognition`.\n"
        "Install them with: pip install flask face-recognition opencv-python"
    ) from exc

REGISTRY_DIR = Path(__file__).resolve().parent / "face_registry"
REGISTRY_DIR.mkdir(parents=True, exist_ok=True)

MATCH_TOLERANCE = 0.52  # Smaller is stricter; adjust based on your requirements

app = Flask(__name__)


def _load_registry() -> List[np.ndarray]:
    encodings: List[np.ndarray] = []
    for file in REGISTRY_DIR.glob("*.npy"):
        try:
            encodings.append(np.load(file))
        except Exception:
            continue
    return encodings


def _decode_image(data_url: str) -> np.ndarray:
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    image_bytes = base64.b64decode(data_url)
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    return image


def _hash_image_bytes(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()


@app.post("/api/verify-face")
def verify_face():
    payload = request.get_json(silent=True)
    if not payload or "image" not in payload:
        return jsonify({"result": "error", "message": "Missing image"}), 400

    try:
        raw_image = payload["image"]
        if "," in raw_image:
            raw_bytes = base64.b64decode(raw_image.split(",", 1)[1])
        else:
            raw_bytes = base64.b64decode(raw_image)
    except Exception:
        return jsonify({"result": "error", "message": "Invalid base64 image"}), 400

    image = cv2.imdecode(np.frombuffer(raw_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        return jsonify({"result": "error", "message": "Unable to decode image"}), 400

    rgb_image = image[:, :, ::-1]
    encodings = face_recognition.face_encodings(rgb_image)

    if not encodings:
        return jsonify({"result": "error", "message": "No face detected"}), 422

    encoding = encodings[0]
    registry = _load_registry()

    if registry:
        matches = face_recognition.compare_faces(registry, encoding, tolerance=MATCH_TOLERANCE)
        if any(matches):
            return jsonify({"result": "duplicate", "message": "Face already registered"}), 200

    # store new encoding for future comparisons
    face_hash = _hash_image_bytes(raw_bytes)
    np.save(REGISTRY_DIR / f"{face_hash}.npy", encoding)

    return jsonify({"result": "verified", "faceHash": face_hash}), 200


if __name__ == "__main__":
    port = int(os.environ.get("FACE_SERVICE_PORT", "5001"))
    app.run(host="0.0.0.0", port=port)

