# TrustVault Bharat - Blockchain Hackathon Project

A comprehensive document verification and anti-fraud platform combining blockchain technology, zero-knowledge proofs, facial recognition, and machine learning to create a trustworthy document management system with anti-counterfeiting mechanisms.

## 🎯 Project Overview

TrustVault Bharat is a multi-component platform built for the blockchain hackathon that addresses document fraud and verification challenges through:

- **Document Registry Smart Contracts** - Immutable anchoring of document hashes on the blockchain
- **Face Verification Service** - "One face, one vote" enforcement using facial recognition
- **React Frontend Application** - Multi-page dashboard with document upload, verification, voting, and analytics
- **Browser Extension** - Real-time detection of suspicious payment/login pages
- **Backend Services** - Python Flask-based facial recognition and verification

## 📁 Project Structure

```
blockchain-hackathon/
├── browser-extension/          # Chrome-compatible security extension
│   ├── content.js             # Content script for page analysis
│   ├── manifest.json          # Extension configuration
│   ├── popup.html             # Popup UI
│   └── popup.js               # Popup logic
│
├── vault/                      # Main application directory
│   ├── backend/               # Python backend services
│   │   ├── face_verifier.py   # Facial recognition service
│   │   └── index.js           # Backend entry point
│   │
│   ├── contracts/             # Smart contracts
│   │   ├── DocumentRegistry.sol  # Document anchoring
│   │   └── IssuerRegistry.sol    # Trusted issuer management
│   │
│   ├── frontend/              # Secondary frontend
│   │   └── src/components/
│   │       └── VerifyDocument.jsx
│   │
│   ├── src/                   # Main React application
│   │   ├── components/        # React components
│   │   │   ├── assistant/     # ZKP Assistant AI component
│   │   │   ├── layout/        # Layout components (TopNav, etc)
│   │   │   └── ui/            # Shadcn UI components
│   │   ├── contexts/          # React contexts
│   │   ├── data/              # Mock data and knowledge bases
│   │   ├── hooks/             # Custom React hooks
│   │   ├── integrations/      # Supabase integration
│   │   ├── lib/               # Utility libraries
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   │
│   ├── scripts/               # Deployment scripts
│   │   ├── deploy.js          # Smart contract deployment
│   │   └── register_sample.js # Sample data registration
│   │
│   ├── supabase/              # Supabase configuration
│   ├── vite.config.ts         # Vite build configuration
│   ├── tailwind.config.ts     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   ├── hardhat.config.js      # Hardhat configuration
│   ├── package.json           # Dependencies and scripts
│   └── index.html             # HTML template
│
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ / Bun
- Python 3.8+
- Git
- Chrome/Edge browser (for extension)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ishaansatapathy/blockhain-hackathon.git
   cd blockchain-hackathon
   ```

2. **Set up the main application**
   ```bash
   cd vault
   npm install  # or bun install
   ```

3. **Set up the Python backend**
   ```bash
   cd vault/backend
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install flask face-recognition opencv-python numpy
   ```

4. **Configure environment variables**
   ```bash
   # Create .env in vault/ directory
   VITE_FACE_VERIFIER_URL=http://localhost:5001
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

## 🏃 Running the Application

### Start the Face Verification Service
```bash
cd vault/backend
python face_verifier.py
# Server will listen on http://localhost:5001
```

### Start the Vite Development Server
```bash
cd vault
npm run dev
# Open http://localhost:5173
```

### Deploy Smart Contracts
```bash
cd vault
npx hardhat run scripts/deploy.js --network localhost
```

### Register Sample Data
```bash
npx hardhat run scripts/register_sample.js --network localhost
```

## 🧩 Key Features

### 📄 Document Management
- Upload and store documents securely
- Anchor document hashes on blockchain
- Track document ownership and issuers
- Flag suspicious documents

### 👤 Face Verification
- One-face-one-vote enforcement
- Facial recognition based verification
- Duplicate face detection
- Persistent face encoding storage

### 🏛️ Smart Contracts
- **DocumentRegistry**: Immutable document anchor storage
- **IssuerRegistry**: Trusted issuer management
- Zero-knowledge proof compatible architecture

### 🎨 Dashboard Features
- Dashboard with analytics
- Vault for document storage
- Document upload interface
- Voting and flagging mechanisms
- Settings and language preferences
- Real-time analytics

### 🔒 Browser Extension
- Real-time page analysis
- Suspicious page detection
- Payment/login page verification
- Fake button interception
- Domain analysis (HTTPS, length, keywords)
- Merchant safelist support

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **React Router** - Routing
- **React Hook Form** - Form management
- **TanStack Query** - Data fetching

### Backend
- **Flask** - Python web framework
- **face_recognition** - Facial recognition library
- **OpenCV** - Computer vision
- **NumPy** - Numerical computing

### Blockchain
- **Hardhat** - Ethereum development
- **Solidity 0.8.17** - Smart contracts
- **OpenZeppelin** - Contract libraries

### Infrastructure
- **Supabase** - Database and auth
- **Vite** - Build and dev server
- **ESLint** - Code linting

## 📖 Pages and Components

| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/` | Main overview and analytics |
| Vault | `/vault` | Document storage |
| Upload | `/upload` | Document upload interface |
| Voting | `/voting` | Community voting mechanism |
| Flagged | `/flagged` | Suspicious document listing |
| Checker | `/checker` | Page verification tool |
| Analytics | `/analytics` | Detailed statistics |
| Settings | `/settings` | User preferences |

## 🔐 Smart Contract Functions

### DocumentRegistry
- `registerDocument()` - Register a new document
- `getDocument()` - Retrieve document info
- `flagDocument()` - Mark document as suspicious
- `isFlagged()` - Check document status

### IssuerRegistry
- `addIssuer()` - Register trusted issuer
- `revokeIssuer()` - Remove issuer
- `isTrusted()` - Verify issuer status

## 🎯 API Endpoints

### Face Verification Service
- `POST /api/verify-face` - Verify facial identity
- `GET /api/health` - Service health check

## 📋 Scripts

### Available npm scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run build:dev  # Build with dev mode
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## 🔧 Configuration

### Hardhat Configuration
- Network: localhost (http://127.0.0.1:8545)
- Solidity: 0.8.17
- Environment variables: `.env`

### Vite Configuration
- Port: 5173
- Root: `vault/`
- Build output: `dist/`

## 🌐 Browser Extension Installation

1. Open `chrome://extensions`
2. Toggle **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the `browser-extension/` folder
5. Pin extension for quick access

## 🔑 Environment Variables

```env
VITE_FACE_VERIFIER_URL=http://localhost:5001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
HARDHAT_RPC=http://127.0.0.1:8545
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [face_recognition Library](https://github.com/ageitgey/face_recognition)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Ishaan Satapathy** - Project Lead

## 🙏 Acknowledgments

- OpenZeppelin for contract libraries
- Face Recognition community
- Shadcn UI for component library
- Blockchain hackathon organizers
