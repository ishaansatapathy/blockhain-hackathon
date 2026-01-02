# Backend Services Documentation - TrustVault Bharat

Complete documentation for the Python Flask backend services that power the face verification system.

## 📋 Overview

The TrustVault Bharat backend provides:
- **Face Verification Service** - Facial recognition and identity verification
- **Face Registry** - Persistent storage of facial encodings
- **REST API** - HTTP endpoints for frontend integration
- **One-Face-One-Vote Enforcement** - Duplicate detection system

## 📁 File Structure

```
backend/
├── face_verifier.py          # Main Flask application
├── face_registry/            # Persistent face storage
│   └── *.npy                 # Facial encoding files
├── requirements.txt          # Python dependencies
└── README.md                 # This documentation
```

## 🔧 Dependencies

### Required Packages
```
flask==2.3.2
flask-cors==4.0.0
face-recognition==1.3.5
opencv-python==4.8.0
numpy==1.24.3
Werkzeug==2.3.6
```

### System Requirements
- Python 3.8+
- CMake (for dlib)
- C++ compiler

## 🏃 Getting Started

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd vault/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the service:**
   ```bash
   python face_verifier.py
   ```

   Output:
   ```
   Running on http://127.0.0.1:5001
   Press CTRL+C to quit
   ```

### Configuration

Environment variables (optional):
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
export FLASK_PORT=5001
```

## 🎯 API Endpoints

### POST /api/verify-face
Verify a user's face against the registry.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Parameters:**
- `image` (string, required) - Base64 encoded image data

**Response Success (200):**
```json
{
  "verified": true,
  "face_id": "face_abc123",
  "confidence": 0.95,
  "timestamp": "2024-01-02T10:30:45Z",
  "message": "Face verified successfully"
}
```

**Response - New Face (201):**
```json
{
  "verified": false,
  "face_id": "face_new456",
  "new_face": true,
  "message": "New face registered"
}
```

**Response - Duplicate (409):**
```json
{
  "verified": false,
  "duplicate": true,
  "existing_face_id": "face_abc123",
  "message": "This face is already registered"
}
```

**Response Error (400):**
```json
{
  "error": true,
  "message": "Invalid image data or no face detected"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/verify-face \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

**JavaScript Example:**
```javascript
async function verifyFace(imageBase64) {
  const response = await fetch('http://localhost:5001/api/verify-face', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 })
  });
  return response.json();
}
```

### GET /api/health
Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "TrustVault Face Verification",
  "version": "1.0.0"
}
```

### GET /api/stats
Get service statistics.

**Response (200):**
```json
{
  "total_faces_registered": 42,
  "total_verifications": 150,
  "success_rate": 0.98,
  "avg_processing_time_ms": 250
}
```

### POST /api/debug/register-face
(Development only) Manually register a face.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "name": "John Doe"
}
```

## 🧠 Face Recognition Algorithm

### Process Flow

```
1. Input Image
   ↓
2. Image Decoding
   ├─ Base64 decode
   ├─ Convert to OpenCV format
   └─ Validate image
   ↓
3. Face Detection
   ├─ Detect faces using dlib
   ├─ Extract face regions
   └─ Check for multiple faces
   ↓
4. Face Encoding
   ├─ Generate 128-D face embedding
   ├─ Extract facial features
   └─ Create unique encoding
   ↓
5. Comparison
   ├─ Load existing encodings
   ├─ Calculate distances
   └─ Apply tolerance threshold
   ↓
6. Decision
   ├─ Match found → Return existing ID
   ├─ No match → Register new
   └─ Multiple matches → Reject
   ↓
7. Response
```

### Key Parameters

```python
MATCH_TOLERANCE = 0.52  # Euclidean distance threshold
# Lower = stricter matching (0.4 = very strict)
# Higher = more lenient (0.6 = lenient)

MODEL = "hog"  # or "cnn" for GPU
# "hog" - Faster but less accurate
# "cnn" - Slower but more accurate
```

### Encoding Details

```python
def get_face_encoding(image):
    """
    Generate 128-dimensional face encoding.
    
    Returns:
        numpy array of shape (128,) containing facial features
    """
    faces = face_recognition.face_locations(image)
    if not faces:
        return None
    
    encodings = face_recognition.face_encodings(image, faces)
    return encodings[0] if encodings else None
```

## 💾 Face Registry Storage

### Directory Structure
```
backend/
└── face_registry/
    ├── face_001.npy
    ├── face_002.npy
    ├── face_003.npy
    └── face_manifest.json
```

### Storage Format

**NPY Files:**
- NumPy binary format
- Contains 128-D encoding array
- Efficient storage (1 KB per face)

**Manifest File:**
```json
{
  "faces": {
    "face_001": {
      "timestamp": "2024-01-02T10:30:45Z",
      "verified": true,
      "match_count": 5
    },
    "face_002": {
      "timestamp": "2024-01-02T11:15:30Z",
      "verified": true,
      "match_count": 3
    }
  },
  "total_faces": 2,
  "last_updated": "2024-01-02T11:16:00Z"
}
```

### Loading Encodings

```python
def load_face_encoding(face_id):
    """Load encoding from disk."""
    path = REGISTRY_DIR / f"{face_id}.npy"
    return np.load(path)

def load_all_encodings():
    """Load all stored encodings."""
    encodings = {}
    for npy_file in REGISTRY_DIR.glob("*.npy"):
        face_id = npy_file.stem
        encodings[face_id] = np.load(npy_file)
    return encodings
```

## 🔍 Matching Algorithm

### Distance Calculation

```python
def find_match(target_encoding, threshold=0.52):
    """
    Find matching face in registry.
    
    Returns:
        (matched_face_id, distance) or (None, None)
    """
    encodings = load_all_encodings()
    
    distances = {}
    for face_id, encoding in encodings.items():
        # Euclidean distance
        distance = np.linalg.norm(target_encoding - encoding)
        distances[face_id] = distance
    
    if not distances:
        return None, None
    
    min_face_id = min(distances, key=distances.get)
    min_distance = distances[min_face_id]
    
    if min_distance <= threshold:
        return min_face_id, min_distance
    
    return None, None
```

### Confidence Score

```python
def calculate_confidence(distance):
    """
    Convert distance to confidence (0-1).
    Lower distance = higher confidence
    """
    if distance >= 0.52:
        return 0.0
    
    # Normalize: 0.0 = 100% confidence, 0.52 = 0% confidence
    confidence = 1.0 - (distance / 0.52)
    return max(0.0, min(1.0, confidence))
```

## ⚙️ Flask Application Structure

### Main Application

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
from pathlib import Path

app = Flask(__name__)
CORS(app)

REGISTRY_DIR = Path(__file__).parent / "face_registry"
REGISTRY_DIR.mkdir(exist_ok=True)
MATCH_TOLERANCE = 0.52

@app.route('/api/verify-face', methods=['POST'])
def verify_face():
    """Verify face endpoint."""
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Process image
        image = decode_image(image_data)
        encoding = get_face_encoding(image)
        
        if encoding is None:
            return jsonify({'error': 'No face detected'}), 400
        
        # Find match
        match_id, distance = find_match(encoding)
        
        if match_id:
            return jsonify({
                'verified': True,
                'face_id': match_id,
                'confidence': calculate_confidence(distance)
            }), 200
        
        # Register new face
        new_id = register_new_face(encoding)
        return jsonify({
            'verified': False,
            'face_id': new_id,
            'new_face': True
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check."""
    return jsonify({
        'status': 'healthy',
        'service': 'TrustVault Face Verification'
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)
```

## 🔐 Security Considerations

### Input Validation

```python
def validate_image_data(image_str):
    """Validate base64 image data."""
    if not isinstance(image_str, str):
        raise ValueError("Image must be base64 string")
    
    if not image_str.startswith("data:image/"):
        raise ValueError("Invalid image format")
    
    if len(image_str) > 5_000_000:  # 5MB limit
        raise ValueError("Image too large")
    
    return True
```

### Face Validation

```python
def validate_face_quality(image):
    """Ensure face is suitable for registration."""
    faces = face_recognition.face_locations(image)
    
    if len(faces) == 0:
        raise ValueError("No face detected")
    
    if len(faces) > 1:
        raise ValueError("Multiple faces detected")
    
    # Check face size (must be large enough)
    top, right, bottom, left = faces[0]
    face_width = right - left
    face_height = bottom - top
    
    if face_width < 50 or face_height < 50:
        raise ValueError("Face too small")
    
    return True
```

### CORS Configuration

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["POST", "GET"],
        "allow_headers": ["Content-Type"]
    }
})
```

## 🚀 Performance Optimization

### Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def cached_load_encodings():
    """Cache loaded encodings for performance."""
    return load_all_encodings()
```

### Batch Processing

```python
def verify_faces_batch(images):
    """Process multiple faces efficiently."""
    encodings = [get_face_encoding(img) for img in images]
    results = []
    
    for encoding in encodings:
        match_id, distance = find_match(encoding)
        results.append({
            'matched': match_id is not None,
            'face_id': match_id
        })
    
    return results
```

### Model Selection

```python
# For production (faster)
model = "hog"  # Uses HOG features
encodings = face_recognition.face_encodings(
    image,
    face_locations,
    model='hog',
    num_jitters=1  # 1 = fast, 10 = accurate
)

# For high accuracy (slower)
model = "cnn"  # Uses deep learning
encodings = face_recognition.face_encodings(
    image,
    face_locations,
    model='cnn',
    num_jitters=10
)
```

## 🐛 Troubleshooting

### Issue: "No face detected"
**Cause**: Image quality or lighting issues
**Solution**: 
- Use better lighting
- Ensure face is clearly visible
- Check image resolution (min 100x100)

### Issue: "Multiple faces detected"
**Cause**: Image contains more than one person
**Solution**:
- Capture single person only
- Remove other people from frame
- Use cropped image

### Issue: Slow performance
**Cause**: Large registry or slow hardware
**Solution**:
- Use HOG model instead of CNN
- Implement face indexing
- Use GPU acceleration
- Archive old encodings

### Issue: False positives (different people matching)
**Cause**: Tolerance too high
**Solution**:
```python
# Reduce tolerance (stricter)
MATCH_TOLERANCE = 0.45  # Default 0.52
```

### Issue: False negatives (same person not matching)
**Cause**: Tolerance too low or poor image
**Solution**:
```python
# Increase tolerance (more lenient)
MATCH_TOLERANCE = 0.60  # Default 0.52
```

## 📊 Monitoring & Logging

### Request Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.before_request
def log_request():
    logger.info(f"Request: {request.method} {request.path}")

@app.after_request
def log_response(response):
    logger.info(f"Response: {response.status_code}")
    return response
```

### Performance Metrics

```python
import time

def track_timing(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        logger.info(f"{func.__name__}: {elapsed:.3f}s")
        return result
    return wrapper

@track_timing
def get_face_encoding(image):
    # ... implementation
    pass
```

## 🔗 Integration with Frontend

### React Hook

```typescript
// hooks/useFaceVerification.ts
import { useState } from 'react';

export const useFaceVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (imageBase64: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.VITE_FACE_VERIFIER_URL}/api/verify-face`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageBase64 })
        }
      );

      if (!response.ok) {
        throw new Error('Face verification failed');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { verify, isLoading, error };
};
```

## 📚 Resources

- [face_recognition Documentation](https://face-recognition.readthedocs.io/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenCV Docs](https://docs.opencv.org/)
- [NumPy Reference](https://numpy.org/doc/)
- [dlib Documentation](http://dlib.net/)

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Can register new face
- [ ] Can verify registered face
- [ ] Rejects duplicate faces
- [ ] Handles invalid images
- [ ] CORS properly configured
- [ ] Error messages are helpful
- [ ] Performance is acceptable
- [ ] Encodings persist across restarts
- [ ] Concurrent requests handled
- [ ] Logging works correctly

## 🤝 Contributing

When modifying the backend:
1. Test with various face images
2. Benchmark performance
3. Document any algorithm changes
4. Update this documentation
5. Test CORS with frontend

---

For issues or questions, refer to the main README or contact the development team.
