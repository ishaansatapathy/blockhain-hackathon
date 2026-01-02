# Blockchain-based Certificate Verification (Hackathon MVP)

This README describes a minimal end-to-end demo to anchor document hashes on Ethereum (local Hardhat), register issuers, and verify documents client-side.

Files added:
- `contracts/IssuerRegistry.sol`
- `contracts/DocumentRegistry.sol`
- `scripts/deploy.js`
- `scripts/register_sample.js`
- `backend/index.js` (mock API)
- `frontend/src/components/VerifyDocument.jsx` (React verifier)

Prerequisites
- Node.js >= 18
- npm
- Hardhat and OpenZeppelin (installed via package.json in this repo)

Quick demo steps

1. Install dependencies

```powershell
cd trustvault-bharat
npm install
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle @openzeppelin/contracts ethers
```

2. Start a Hardhat node

```powershell
npx hardhat node
```

3. Deploy contracts (in a new shell)

```powershell
npx hardhat run --network localhost scripts/deploy.js
```

Note the printed contract addresses — add them to your frontend environment (or edit `frontend/src/components/VerifyDocument.jsx` props).

4. Run the sample registration script to create an issuer and register a sample document

```powershell
npx hardhat run --network localhost scripts/register_sample.js
```

This prints a sample doc hash and transaction hash. Use the printed hash as a test input in the verifier.

5. Start the mock backend (optional)

```powershell
node backend/index.js
```

6. Start the frontend

Integrate `frontend/src/components/VerifyDocument.jsx` into your app and provide `providerUrl` (Hardhat RPC), `issuerRegistryAddress` and `documentRegistryAddress`.

Demo cases
- Genuine: Upload the exact file that was registered by `register_sample.js` — verifier should show Genuine.
- Fake: Modify the file (even a single byte) and upload — hash will change and signature will not match.
- Not found: Upload a file that was never registered — report Not found.

Security and caveats
- Do not store PII on-chain.
- Signatures anchor issuer intent, but private-key compromise can invalidate trust.
- Merkle proofs: the verifier includes merkle root storage; proofs should be fetched from a backend and verified client-side to support batch anchoring.

TODOs
- Add contract ABIs and simple UI wiring for contract address config.
- Replace mock backend with on-chain indexer or The Graph for production.
