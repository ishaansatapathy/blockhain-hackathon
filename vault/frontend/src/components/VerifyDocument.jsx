import React, { useState } from 'react';
import { ethers } from 'ethers';

// Helper: compute keccak256 of file
async function computeFileHash(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return ethers.utils.keccak256(bytes);
}

// verify signature
function verifySignature(hash, signature, expectedIssuer) {
  try {
    const recovered = ethers.utils.verifyMessage(ethers.utils.arrayify(hash), signature);
    return recovered.toLowerCase() === expectedIssuer.toLowerCase();
  } catch (e) {
    return false;
  }
}

export default function VerifyDocument({ providerUrl = 'http://127.0.0.1:8545', issuerRegistryAddress, documentRegistryAddress }) {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const h = await computeFileHash(f);
    setHash(h);
  }

  async function checkOnChain() {
    if (!hash) return;
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(providerUrl);
      // ABI minimal for DocumentRegistry.getDocument
      const docAbi = [
        'function getDocument(bytes32) view returns (address owner, address issuer, uint256 timestamp, bool flagged, bytes signature, bytes32 merkleRoot)'
      ];
      const registry = new ethers.Contract(documentRegistryAddress, docAbi, provider);
      const d = await registry.getDocument(hash);

      if (!d || Number(d.timestamp) === 0) {
        setResult({ status: 'not_found', message: 'Not found on-chain / Not registered' });
        setLoading(false);
        return;
      }

      // check issuer trust
      const issuerAbi = ['function isTrusted(address) view returns (bool)', 'function nameOf(address) view returns (string)'];
      const issuerReg = new ethers.Contract(issuerRegistryAddress, issuerAbi, provider);
      const trusted = await issuerReg.isTrusted(d.issuer);
      const issuerName = trusted ? await issuerReg.nameOf(d.issuer).catch(() => '') : '';

      // verify signature if present
      let sigOk = null;
      if (d.signature && d.signature.length) {
        const sigHex = ethers.toBeHex(d.signature);
        const ok = verifySignature(hash, sigHex, d.issuer);
        sigOk = ok;
      }

      setResult({ status: 'found', doc: d, trusted, issuerName, sigOk, tx: d.txHash ?? null });
    } catch (err) {
      console.error(err);
      setResult({ status: 'error', message: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">Verify Certificate / Document</h2>
      <p className="text-sm text-muted-foreground mb-4">Upload a certificate (PDF/image). The app computes the hash client-side and queries the on-chain registry.</p>
      <input type="file" onChange={onFile} />
      {hash && (
        <div className="mt-3">
          <div className="mb-2">Hash: <code className="font-mono">{hash}</code></div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => navigator.clipboard.writeText(hash)}>Copy Hash</button>
            <button className="btn" onClick={checkOnChain} disabled={loading || !documentRegistryAddress}>Check on-chain</button>
          </div>
        </div>
      )}

      {loading && <p className="mt-2">Checking...</p>}

      {result && (
        <div className="mt-4 p-4 border rounded">
          {result.status === 'not_found' && <p>Not found on record — this document has not been anchored on-chain.</p>}
          {result.status === 'found' && (
            <div>
              <p className="font-medium">Issuer: {result.issuerName || result.doc.issuer} {result.trusted ? '(Trusted)' : '(Untrusted)'}</p>
              {result.sigOk === true && <p className="text-green-700">Genuine — signature verified against issuer.</p>}
              {result.sigOk === false && <p className="text-red-700">Fake — signature mismatch.</p>}
              {result.doc.flagged && <p className="text-orange-700">Flagged — suspicious.</p>}
              <p className="text-xs mt-2">Tx proof: <a href={`https://etherscan.io/tx/${result.tx}`} target="_blank" rel="noreferrer">{result.tx}</a></p>
            </div>
          )}
          {result.status === 'error' && <p className="text-red-700">Error: {result.message}</p>}
        </div>
      )}
    </div>
  );
}
