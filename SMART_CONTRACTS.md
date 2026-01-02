# Smart Contracts Documentation - TrustVault Bharat

This document provides detailed information about the smart contracts used in the TrustVault Bharat project.

## 📋 Table of Contents

- [Overview](#overview)
- [DocumentRegistry Contract](#documentregistry-contract)
- [IssuerRegistry Contract](#issuerregistry-contract)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Gas Optimization](#gas-optimization)

## 🎯 Overview

The TrustVault Bharat project uses two main smart contracts:

1. **DocumentRegistry** - Stores immutable records of document hashes and metadata
2. **IssuerRegistry** - Maintains a list of trusted issuers

These contracts work together to create a decentralized document verification system.

## 📄 DocumentRegistry Contract

### Purpose
Anchors document hashes on the blockchain with issuer information, signatures, and optional merkle roots for batch operations.

### File Location
`vault/contracts/DocumentRegistry.sol`

### Solidity Version
```solidity
pragma solidity ^0.8.17;
```

### Data Structures

#### Document Struct
```solidity
struct Document {
    address owner;           // Document owner/uploader
    address issuer;          // Issuer who signed the document
    uint256 timestamp;       // Registration timestamp
    bool flagged;            // Fraud status flag
    bytes signature;         // Issuer's signature over doc hash
    bytes32 merkleRoot;      // Optional merkle root for batches
}
```

### State Variables

```solidity
mapping(bytes32 => Document) private _docs;
```

Stores documents mapped by their keccak256 hash.

### Events

#### DocumentRegistered
```solidity
event DocumentRegistered(
    bytes32 indexed docHash,
    address owner,
    address issuer,
    uint256 timestamp
);
```

Emitted when a document is registered.

#### DocumentFlagged
```solidity
event DocumentFlagged(bytes32 indexed docHash);
```

Emitted when a document is flagged as suspicious.

### Functions

#### registerDocument()
```solidity
function registerDocument(
    bytes32 docHash,
    address issuer,
    bytes calldata signature,
    bytes32 merkleRoot
) external
```

**Purpose**: Register a new document or update an existing one.

**Parameters:**
- `docHash` - keccak256 hash of the document content
- `issuer` - Address of the issuer who signed the document
- `signature` - Signature bytes from issuer (ECDSA over docHash)
- `merkleRoot` - Optional merkle root for batch processing

**Requirements:**
- `docHash` cannot be zero
- Only original owner or issuer can re-register
- `msg.sender` becomes the document owner

**Gas Estimate**: ~50,000 gas

**Example Usage:**
```javascript
const docHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("document content"));
const issuer = "0x...";
const signature = "0x..."; // ECDSA signature

await documentRegistry.registerDocument(
    docHash,
    issuer,
    signature,
    "0x0000000000000000000000000000000000000000000000000000000000000000"
);
```

#### getDocument()
```solidity
function getDocument(bytes32 docHash)
    external
    view
    returns (Document memory)
```

**Purpose**: Retrieve document information.

**Parameters:**
- `docHash` - The document hash to query

**Returns**: Complete Document struct or empty struct if not found

**Gas Estimate**: ~1,000 gas (read-only)

**Example Usage:**
```javascript
const doc = await documentRegistry.getDocument(docHash);
console.log({
    owner: doc.owner,
    issuer: doc.issuer,
    timestamp: doc.timestamp,
    flagged: doc.flagged,
    signature: doc.signature,
    merkleRoot: doc.merkleRoot
});
```

#### flagDocument()
```solidity
function flagDocument(bytes32 docHash) external onlyOwner
```

**Purpose**: Mark a document as fraudulent/suspicious.

**Parameters:**
- `docHash` - The document to flag

**Requirements:**
- Only contract owner can call
- Document must exist

**Gas Estimate**: ~20,000 gas

**Example Usage:**
```javascript
await documentRegistry.flagDocument(docHash);
```

#### isFlagged()
```solidity
function isFlagged(bytes32 docHash)
    external
    view
    returns (bool)
```

**Purpose**: Check if a document is flagged.

**Parameters:**
- `docHash` - The document to check

**Returns**: `true` if flagged, `false` otherwise

**Gas Estimate**: ~2,000 gas (read-only)

**Example Usage:**
```javascript
const isSuspicious = await documentRegistry.isFlagged(docHash);
if (isSuspicious) {
    console.log("Document is flagged as suspicious");
}
```

## 👥 IssuerRegistry Contract

### Purpose
Maintains a registry of trusted issuers that can sign and issue documents.

### File Location
`vault/contracts/IssuerRegistry.sol`

### Solidity Version
```solidity
pragma solidity ^0.8.17;
```

### Data Structures

```solidity
mapping(address => bool) private _trusted;      // Issuer trust status
mapping(address => string) private _names;      // Issuer names
```

### Events

#### IssuerAdded
```solidity
event IssuerAdded(address indexed issuer, string name);
```

Emitted when a new issuer is added.

#### IssuerRevoked
```solidity
event IssuerRevoked(address indexed issuer);
```

Emitted when an issuer is revoked.

### Functions

#### addIssuer()
```solidity
function addIssuer(address issuer, string calldata name) external onlyOwner
```

**Purpose**: Register a new trusted issuer.

**Parameters:**
- `issuer` - Address of the issuer
- `name` - Human-readable name of the issuer

**Requirements:**
- Only contract owner can call
- `issuer` cannot be zero address

**Gas Estimate**: ~60,000 gas

**Example Usage:**
```javascript
await issuerRegistry.addIssuer(
    "0x742d35Cc6634C0532925a3b844Bc9e7595f14e1d",
    "Ministry of Education"
);
```

#### revokeIssuer()
```solidity
function revokeIssuer(address issuer) external onlyOwner
```

**Purpose**: Remove an issuer from the trusted list.

**Parameters:**
- `issuer` - Address of the issuer to revoke

**Requirements:**
- Only contract owner can call
- Issuer must be currently trusted

**Gas Estimate**: ~20,000 gas

**Example Usage:**
```javascript
await issuerRegistry.revokeIssuer(issuerAddress);
```

#### isTrusted()
```solidity
function isTrusted(address issuer) external view returns (bool)
```

**Purpose**: Verify if an address is a trusted issuer.

**Parameters:**
- `issuer` - Address to check

**Returns**: `true` if trusted, `false` otherwise

**Gas Estimate**: ~500 gas (read-only)

**Example Usage:**
```javascript
const isValid = await issuerRegistry.isTrusted(issuerAddress);
if (isValid) {
    console.log("Issuer is trusted");
}
```

#### getName()
```solidity
function getName(address issuer) external view returns (string memory)
```

**Purpose**: Get the name of an issuer.

**Parameters:**
- `issuer` - Address of the issuer

**Returns**: The issuer's registered name

**Gas Estimate**: ~2,000 gas (read-only)

**Example Usage:**
```javascript
const issuerName = await issuerRegistry.getName(issuerAddress);
console.log(`Issuer: ${issuerName}`);
```

## 🚀 Deployment

### Prerequisites
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
npm install --save-dev @openzeppelin/contracts
```

### Deployment Script
See `vault/scripts/deploy.js` for full deployment script.

**Basic deployment:**
```javascript
const documentRegistry = await DocumentRegistry.deploy();
await documentRegistry.deployed();

const issuerRegistry = await IssuerRegistry.deploy();
await issuerRegistry.deployed();

console.log("DocumentRegistry deployed to:", documentRegistry.address);
console.log("IssuerRegistry deployed to:", issuerRegistry.address);
```

### Deployment Networks

**Local (Hardhat):**
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

**Sepolia Testnet:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Mainnet:**
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### Environment Setup

Create `.env` file:
```env
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
SEPOLIA_RPC=your_rpc_url
MAINNET_RPC=your_rpc_url
```

Update `hardhat.config.js`:
```javascript
const privateKey = process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [privateKey]
    },
    mainnet: {
      url: process.env.MAINNET_RPC,
      accounts: [privateKey]
    }
  }
};
```

## 🔐 Security Considerations

### 1. Input Validation
- Document hash cannot be zero
- Issuer address cannot be zero
- Proper access control with `onlyOwner`

### 2. Authorization
- Only original owner or issuer can update documents
- Only contract owner can flag documents or manage issuers

### 3. Signature Verification
- Use ECDSA for signature validation (recommended in frontend)
- Verify issuer is trusted before accepting signatures

### 4. Reentrancy
- No external calls that could trigger reentrancy
- State changes occur before any external calls

### 5. Overflow/Underflow
- Uses Solidity 0.8.17 with built-in overflow checking
- No arithmetic operations that could overflow

### 6. Best Practices
- Use events for important state changes
- Immutable storage of document hashes
- Clear separation of concerns between contracts

## 💾 Gas Optimization

### Current Optimizations

1. **Struct Packing**: Document struct is reasonably packed
2. **Mapping Usage**: Direct mapping for O(1) lookups
3. **View Functions**: No state changes in read functions
4. **Minimal Storage**: Only essential data stored

### Potential Improvements

1. **Batch Operations**: Implement batch registration for multiple documents
2. **Merkle Tree**: Use merkle roots for proofs
3. **Proxy Pattern**: Use UUPS proxies for upgradeable contracts

### Gas Cost Estimates

| Operation | Gas Cost |
|-----------|----------|
| registerDocument() | 50,000 |
| getDocument() | 1,000 |
| flagDocument() | 20,000 |
| isFlagged() | 2,000 |
| addIssuer() | 60,000 |
| revokeIssuer() | 20,000 |
| isTrusted() | 500 |

## 📚 Integration with Frontend

### Reading Document Data
```typescript
const document = await documentRegistry.getDocument(docHash);
```

### Registering Documents
```typescript
const tx = await documentRegistry.registerDocument(
    docHash,
    issuerAddress,
    signature,
    merkleRoot
);
await tx.wait();
```

### Listening to Events
```typescript
documentRegistry.on("DocumentRegistered", (docHash, owner, issuer) => {
    console.log(`Document ${docHash} registered by ${owner}`);
});
```

## 🔗 Contract Interactions

### Complete Flow
```
1. User uploads document
2. Frontend calculates hash: docHash = keccak256(content)
3. Frontend requests issuer signature
4. Frontend calls registerDocument() with:
   - docHash
   - issuer address
   - signature
   - merkleRoot (optional)
5. Contract stores document
6. Contract emits DocumentRegistered event
7. Frontend listens to event and updates UI
8. Community can flag suspicious documents
9. Contract owner can call flagDocument()
10. Other users check isFlagged() before trusting
```

## 📝 Contract Verification

### Verify on Etherscan
```bash
npx hardhat verify --network sepolia \
    <CONTRACT_ADDRESS> \
    "<CONSTRUCTOR_ARGS>"
```

### View on Etherscan
```
https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>
```

---

For more information, refer to:
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [Hardhat Docs](https://hardhat.org/docs)
