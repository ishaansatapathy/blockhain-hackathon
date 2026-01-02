import { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { AlertTriangle } from 'lucide-react';
import { mockDocuments } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { createMockHash } from '@/lib/utils';
import { loadFlaggedSubmissions, saveFlaggedSubmissions, addFlaggedSubmission } from '@/lib/storage';

export default function Flagged() {
  const flaggedDocs = mockDocuments.filter(d => d.status === 'flagged');
  const { toast } = useToast();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [submittedDocs, setSubmittedDocs] = useState<typeof mockDocuments>([]);
  const [lastResult, setLastResult] = useState<{
    verdict: 'genuine' | 'fake' | 'not_found' | 'error';
    tx: string;
    block: string;
    name: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setDragActive(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // load persisted submissions on first render
  useState(() => {
    try {
      const persisted = loadFlaggedSubmissions();
      if (persisted && persisted.length) {
        setSubmittedDocs(persisted as any);
      }
    } catch (e) {
      // ignore
    }
  });

  const handleFileSelection = (file?: File) => {
    if (!file) return;
    setUploadedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    // compute file hash and analyze automatically
    computeAndAnalyze(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileSelection(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelection(file);
  };

  const markVerdict = (verdict: 'real' | 'fake') => {
    if (!uploadedFile) {
      toast({ title: 'No file', description: 'Please upload a file first', variant: 'destructive' });
      return;
    }
    // simulate writing verdict to blockchain by creating transaction and block hashes
    const tx = createMockHash();
    const block = createMockHash();
    const newDoc = {
      id: `uploaded-${Date.now()}`,
      name: uploadedFile.name,
      hash: '0x' + Math.random().toString(16).slice(2, 10),
      issuer: 'User Submission',
      date: new Date().toISOString(),
      status: verdict === 'real' ? 'verified' : 'flagged',
      uploaded: true,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      uploadedAt: new Date().toISOString(),
      txHash: tx,
      blockHash: block,
      verdictOnChain: verdict === 'real' ? 'genuine' : 'fake',
    } as any;

    setSubmittedDocs((s) => [newDoc, ...s]);
    try {
      // persist to localStorage
      addFlaggedSubmission(newDoc as any);
      // also save the full list snapshot
      saveFlaggedSubmissions([newDoc, ...submittedDocs] as any);
    } catch (e) {
      // ignore
    }
    toast({
      title: verdict === 'real' ? 'Document recorded as genuine' : 'Document recorded as fake',
      description: `On-chain tx: ${tx}`,
    });
    // show immediate result panel so user sees authoritative verdict and tx details
    setLastResult({ verdict: newDoc.verdictOnChain, tx, block, name: newDoc.name });
    resetUpload();
  };

  // compute SHA-256 hash of file and return hex string prefixed with 0x
  async function computeFileHash(file: File) {
    const buf = await file.arrayBuffer();
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const arr = Array.from(new Uint8Array(hashBuf));
    const hex = arr.map(b => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hex;
  }

  async function registerDocumentAsGenuine(file: File) {
    try {
      const fileHash = await computeFileHash(file);
      const tx = createMockHash();
      const block = createMockHash();
      
      const registeredDoc = {
        id: `registered-${Date.now()}`,
        name: file.name,
        hash: fileHash,
        issuer: 'User Verified',
        date: new Date().toISOString(),
        status: 'verified' as const,
        uploaded: true,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        txHash: tx,
        blockHash: block,
        verdictOnChain: 'genuine' as const,
      } as any;
      
      addFlaggedSubmission(registeredDoc);
      setSubmittedDocs(s => [registeredDoc, ...s]);
      
      toast({
        title: 'Document Registered',
        description: `"${file.name}" is now anchored as genuine. Future uploads will be recognized.`,
      });
      
      setLastResult({ verdict: 'genuine', tx, block, name: file.name } as any);
    } catch (err) {
      console.error('Registration failed', err);
      toast({
        title: 'Registration failed',
        description: 'Could not register document',
        variant: 'destructive',
      });
    }
  }

  async function computeAndAnalyze(file: File) {
    setLastResult(null);
    try {
      const fileHash = await computeFileHash(file);
      const fileName = file.name.toLowerCase();
      const fileNameNoExt = fileName.split('.')[0];
      
      // First, check persisted submissions — PRIORITY: exact fileName match (most reliable)
      const persisted = loadFlaggedSubmissions();
      let found = persisted.find(d => d.fileName?.toLowerCase() === fileName);
      
      // Fallback: check by hash if filename match not found
      if (!found) {
        found = persisted.find(d => d.hash === fileHash);
      }
      
      if (found) {
        const verdict = found.verdictOnChain ?? (found.status === 'verified' ? 'genuine' : 'fake');
        setLastResult({ 
          verdict, 
          tx: found.txHash ?? '', 
          block: found.blockHash ?? '', 
          name: found.name,
          source: 'persisted'
        } as any);
        return;
      }

      // Second, check bundled mockDocuments — PRIORITY: exact fileName match
      const sample = mockDocuments.find(d => d.fileName?.toLowerCase() === fileName);
      
      if (sample && sample.status === 'verified') {
        setLastResult({ 
          verdict: 'genuine', 
          tx: sample.txHash ?? '', 
          block: '', 
          name: sample.name,
          source: 'bundled'
        } as any);
        return;
      }

      // Third, fallback: call mock backend if available
      try {
        const resp = await fetch(`/api/document/${encodeURIComponent(fileHash)}`);
        if (resp.ok) {
          const json = await resp.json();
          if (json.found) {
            const verdict = json.verdictOnChain ?? (json.flagged ? 'fake' : 'genuine');
            setLastResult({ 
              verdict, 
              tx: json.txHash ?? '', 
              block: json.blockHash ?? '', 
              name: file.name,
              source: 'backend'
            } as any);
            return;
          }
        }
      } catch (e) {
        // ignore network/backend failures
        console.debug('backend fetch failed', e);
      }

      // Default: not found on any record (do NOT assume fake)
      setLastResult({ 
        verdict: 'not_found', 
        tx: '', 
        block: '', 
        name: file.name,
        source: 'none'
      } as any);
    } catch (err) {
      console.error('analyze failed', err);
      setLastResult({ 
        verdict: 'error', 
        tx: '', 
        block: '', 
        name: file.name,
        source: 'error'
      } as any);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
            Flagged Documents
          </h1>
          <p className="text-muted-foreground">
            Documents marked for verification • सत्यापन के लिए चिह्नित दस्तावेज़
          </p>
        </div>

        <Card className="p-6 border border-border bg-card">
          <h2 className="text-lg font-medium text-foreground mb-2">Upload Document for Verification</h2>
          <p className="text-sm text-muted-foreground mb-4">Drop a file or browse to upload and mark it as real or fake.</p>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            className={`rounded-lg border-2 border-dashed p-8 text-center ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}`}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInputChange} />
            <p className="mb-2 text-sm text-muted-foreground">Drag & drop a file here, or</p>
            <Button onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
                {uploadedFile && (
              <div className="mt-4 text-left">
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                {previewUrl && <img src={previewUrl} alt="preview" className="mt-2 max-h-40" />}
                <div className="mt-3 flex gap-2 items-center">
                  <div className="text-sm text-muted-foreground">Analysis: automatic — no manual action required</div>
                  <div className="flex-1" />
                  <Button variant="outline" onClick={resetUpload}>Clear</Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {lastResult && (
          <Card className="p-6 border border-border bg-card mt-6">
            <h3 className="text-lg font-medium mb-2">Verification Result</h3>
            <p className="mb-4 text-sm text-muted-foreground">Analysis performed by TrustVault document verification system.</p>
            
            {lastResult.verdict === 'genuine' && (
              <div className="border-l-4 border-green-600 bg-green-50 p-4 rounded mb-3">
                <p className="font-semibold text-green-800 text-lg mb-1">✓ GENUINE DOCUMENT</p>
                <p className="text-green-700 text-sm mb-2">This document has been verified as authentic.</p>
                {lastResult.tx && <p className="text-xs font-mono text-muted-foreground">Tx: {lastResult.tx}</p>}
                {lastResult.block && <p className="text-xs font-mono text-muted-foreground">Block: {lastResult.block}</p>}
              </div>
            )}
            
            {lastResult.verdict === 'fake' && (
              <div className="border-l-4 border-red-600 bg-red-50 p-4 rounded mb-3">
                <p className="font-semibold text-red-800 text-lg mb-1">✗ FAKE DOCUMENT</p>
                <p className="text-red-700 text-sm mb-2">This document has been flagged as fraudulent or inauthentic.</p>
                {lastResult.tx && <p className="text-xs font-mono text-muted-foreground">Tx: {lastResult.tx}</p>}
              </div>
            )}
            
            {lastResult.verdict === 'not_found' && (
              <div className="border-l-4 border-orange-600 bg-orange-50 p-4 rounded mb-3">
                <p className="font-semibold text-orange-800 text-lg mb-1">⚠ NOT FOUND ON RECORD</p>
                <p className="text-orange-700 text-sm mb-3">This document has not been registered or verified in our system.</p>
                <p className="text-orange-700 text-xs mb-3 italic">If you believe this is a genuine document, you can register it as verified. This will anchor it in the system.</p>
              </div>
            )}
            
            {lastResult.verdict === 'error' && (
              <div className="border-l-4 border-red-600 bg-red-50 p-4 rounded mb-3">
                <p className="font-semibold text-red-800">Error during analysis</p>
                <p className="text-red-700 text-sm">Could not complete verification. Please try again.</p>
              </div>
            )}
            
            <div className="flex gap-2">
              {lastResult.tx && <Button onClick={() => { navigator.clipboard.writeText(`tx:${lastResult.tx} block:${lastResult.block}`); toast({ title: 'Copied', description: 'Proof copied to clipboard' }); }}>Copy Proof</Button>}
              {lastResult.verdict === 'not_found' && uploadedFile && (
                <Button 
                  onClick={() => registerDocumentAsGenuine(uploadedFile)} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Register as Genuine
                </Button>
              )}
              <Button variant="outline" onClick={() => setLastResult(null)}>Dismiss</Button>
            </div>
          </Card>
        )}

        {submittedDocs.length === 0 && flaggedDocs.length === 0 ? (
          <Card className="p-12 border border-border bg-card text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No Flagged Documents</p>
            <p className="text-sm text-muted-foreground">All your documents are verified</p>
          </Card>
        ) : (
          <Card className="border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...submittedDocs, ...flaggedDocs].map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.issuer}</p>
                          {doc.txHash && (
                            <p className="text-xs font-mono text-muted-foreground mt-2">Tx: {doc.txHash}</p>
                          )}
                          {doc.blockHash && (
                            <p className="text-xs font-mono text-muted-foreground">Block: {doc.blockHash}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 text-warning border border-warning/20 rounded-md text-xs font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          {doc.flagReason ?? (doc.status === 'flagged' ? 'User reported as fake' : 'User submission')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(doc.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={doc.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm" className="text-success hover:bg-success/10">Mark Resolved</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
