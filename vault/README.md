# TrustVault Bharat

## Face Verification Service

To enforce "one face, one vote" the frontend now expects a face verification
service. A reference implementation using Flask and the `face_recognition`
library is provided in `backend/face_verifier.py`.

### Running the reference Python server

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install flask face-recognition opencv-python numpy
python face_verifier.py
```

By default the service listens on `http://localhost:5001`. The server stores
face encodings inside `backend/face_registry/` and rejects duplicates.

### Frontend configuration

Create or update a `.env` file in the project root:

```
VITE_FACE_VERIFIER_URL=http://localhost:5001
```

Restart the Vite dev server after changing environment variables. During
verification the React app will call `POST /api/verify-face` on the configured
service. If the service is unavailable the app falls back to local hashing, but
this is meant only for development.

## TrustVault SafePay Browser Extension (optional)

A Chrome-compatible extension lives in the `browser-extension/` directory. It
analyses every page you visit and pops up an alert if the payment/login page
looks suspicious. It also intercepts fake "Pay" buttons and forces you to
confirm before continuing.

### Load the extension manually

1. Open **chrome://extensions** in Chrome/Edge and toggle **Developer mode**.
2. Click **Load unpacked** and select the `browser-extension/` folder.
3. Pin "TrustVault SafePay" for quick access. Use the popup to disable or
   re-enable protection, or manually rescan the current tab.

The extension uses the same heuristics as the Page Checker tool—HTTPS, domain
length, risky keywords/TLDs, and known merchant safelist—to decide whether to
warn or block.
