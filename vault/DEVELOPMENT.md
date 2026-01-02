# Development Guide - TrustVault Bharat

This guide covers the development setup, architecture, and best practices for the TrustVault Bharat project.

## 🏗️ Architecture Overview

### Frontend Architecture
```
App.tsx (Root)
├── SimpleLanguageProvider (i18n)
├── QueryClientProvider (Data fetching)
├── TooltipProvider (UI)
├── TopNav (Navigation)
└── Routes (Pages)
    ├── Dashboard
    ├── Vault
    ├── Upload
    ├── Voting
    ├── Flagged
    ├── Checker
    ├── Analytics
    └── Settings
```

### Backend Architecture
```
Flask Application
├── /api/verify-face (POST) - Facial verification
├── /api/health (GET) - Health check
└── Face Registry (Storage)
    └── face_registry/ (NPY files)
```

### Blockchain Architecture
```
Ethereum Network
├── DocumentRegistry Contract
│   ├── Documents mapping
│   ├── registerDocument()
│   └── getDocument()
└── IssuerRegistry Contract
    ├── Trusted issuers mapping
    ├── addIssuer()
    └── isTrusted()
```

## 📦 Dependencies

### Core Dependencies
- **react** (^18.x) - UI framework
- **react-router-dom** - Routing
- **@tanstack/react-query** - Server state management
- **react-hook-form** - Form handling
- **zod** - Schema validation

### UI Libraries
- **@radix-ui/** - Headless UI components
- **tailwindcss** - Styling
- **lucide-react** - Icons
- **sonner** - Toast notifications

### Blockchain
- **ethers.js** - Ethereum interaction
- **hardhat** - Development environment
- **@openzeppelin/contracts** - Smart contract libraries

### Backend (Python)
- **flask** - Web framework
- **face-recognition** - Facial recognition
- **opencv-python** - Computer vision
- **numpy** - Numerical computing

## 🔄 Data Flow

### Document Upload Flow
```
1. User uploads document (Upload.tsx)
2. Document hash calculated (utils.ts)
3. Signature request to issuer
4. DocumentRegistry.registerDocument() called
5. Document stored with metadata
6. User notified of success
```

### Face Verification Flow
```
1. User submits face image (VerifyDocument.jsx)
2. Base64 encoding of image
3. POST to /api/verify-face
4. face_verifier.py processes image
5. Face encoding extracted/compared
6. Response with verification status
7. Update voting eligibility
```

### Document Flagging Flow
```
1. Community votes document as suspicious (Voting.tsx)
2. Threshold reached
3. DocumentRegistry.flagDocument() called
4. Document moved to Flagged page
5. Analytics updated
```

## 🛠️ Development Workflow

### 1. Setting up your environment

```bash
# Navigate to vault directory
cd vault

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update environment variables
```

### 2. Running development server

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Flask backend
cd backend
python face_verifier.py

# Terminal 3: Start Hardhat node (optional)
npx hardhat node
```

### 3. Code organization best practices

**Components:**
```typescript
// components/MyComponent.tsx
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

**Custom Hooks:**
```typescript
// hooks/useMyData.ts
import { useQuery } from '@tanstack/react-query';

export const useMyData = () => {
  return useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
  });
};
```

**Services:**
```typescript
// services/api.ts
export const documentService = {
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },
};
```

## 🔗 API Integration

### Supabase Client
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

### Face Verification Service
```typescript
// src/services/face.ts
export const verifyFace = async (imageData: string) => {
  const response = await fetch(
    `${process.env.VITE_FACE_VERIFIER_URL}/api/verify-face`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData }),
    }
  );
  return response.json();
};
```

## 📱 Component Examples

### Using useQuery
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['documents'],
  queryFn: fetchDocuments,
});
```

### Using React Hook Form
```typescript
const { register, handleSubmit } = useForm({
  defaultValues: {
    documentName: '',
    issuer: '',
  },
});
```

### Using Context
```typescript
const { language, setLanguage } = useContext(SimpleLanguageContext);
```

## 🧪 Testing

### Component Testing
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Backend Testing
```bash
cd backend
python -m pytest
```

## 📊 Database Schema (Supabase)

Expected tables:
- `documents` - Document metadata
- `face_registrations` - Face encoding references
- `votes` - Community voting records
- `flags` - Flagged document records

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Smart Contracts**: Validate all inputs in contracts
3. **Face Data**: Handle facial data with GDPR compliance
4. **CORS**: Configure properly for production
5. **Authentication**: Use Supabase auth for user management

## 📝 Code Style

### TypeScript
- Use explicit types
- Prefer interfaces over types for objects
- Use `const` for variables
- Use arrow functions in callbacks

### React
- Use functional components
- Use hooks for state management
- Keep components focused and small
- Use descriptive component names

### CSS/Tailwind
- Use Tailwind utility classes
- Follow BEM methodology for custom CSS
- Avoid inline styles
- Use responsive prefixes (sm:, md:, lg:, etc.)

## 🚀 Building for Production

### Frontend Build
```bash
npm run build
# Output: dist/

npm run preview
# Test production build locally
```

### Smart Contract Deployment
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### Docker (Optional)
Create a `Dockerfile` for containerized deployment:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Debugging

### React DevTools
- Install React Developer Tools extension
- Inspect component props and state
- Profile performance

### Hardhat Debugging
```bash
npx hardhat node --fork <network>
```

### Flask Debugging
```python
app.run(debug=True, port=5001)
```

## 📚 Useful Commands

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit

# Clean build
rm -rf dist && npm run build

# Check bundle size
npm run build && npm run build-analyze
```

## 🤔 Common Issues

### Issue: Face verification service not connecting
**Solution**: Ensure Flask server is running on correct port
```bash
python backend/face_verifier.py
# Check http://localhost:5001/api/health
```

### Issue: Vite build failing
**Solution**: Clear cache and reinstall
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Smart contract deployment fails
**Solution**: Check Hardhat network configuration
```bash
npx hardhat accounts  # List available accounts
npx hardhat balance <address>  # Check balance
```

## 📖 References

- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Hardhat Docs](https://hardhat.org/docs)
- [Solidity Docs](https://docs.soliditylang.org/)

## 🎓 Next Steps

1. Familiarize yourself with the codebase structure
2. Read existing component implementations
3. Run the dev server and explore the UI
4. Study the smart contracts
5. Make small contributions to understand the flow
6. Submit PRs with improvements

---

Happy coding! 🚀
