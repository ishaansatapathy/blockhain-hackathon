import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Eye,
  Download,
  Flag,
  Copy,
  Check,
  GripVertical,
  Loader2,
  Fingerprint,
  ShieldCheck,
  LogIn,
  UploadCloud,
} from 'lucide-react';
import { mockDocuments } from '@/data/mockData';
import { Document } from '@/types';
import { cn, createDocumentId, createMockHash, computeFileHash, formatFileSize } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { loadVaultDocuments, saveVaultDocuments } from '@/lib/storage';

export default function Vault() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(() =>
    (() => {
      if (typeof window !== 'undefined') {
        const stored = loadVaultDocuments();
        if (stored.length) {
          return stored.map((doc) => ({
            ...doc,
            uploaded: doc.uploaded ?? true,
          }));
        }
      }
      return mockDocuments.map((doc) => ({
        ...doc,
        uploaded: doc.uploaded ?? false,
      }));
    })(),
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [uploadHoverId, setUploadHoverId] = useState<string | null>(null);
  const [proofStatus, setProofStatus] = useState<Record<string, 'idle' | 'generating' | 'ready'>>(() =>
    Object.fromEntries(mockDocuments.map((doc) => [doc.id, 'idle'])),
  );
  const [loginStatus, setLoginStatus] = useState<'idle' | 'generating' | 'verified'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveVaultDocuments(documents);
  }, [documents]);

  useEffect(() => {
    const handleNewDocument = (event: Event) => {
      const customEvent = event as CustomEvent<Document>;
      const doc = customEvent.detail;
      if (!doc) return;
      const ensuredId = doc.id ?? createDocumentId();
      setDocuments((prev) => {
        if (prev.some((item) => item.id === doc.id)) {
          return prev.map((item) => (item.id === doc.id ? { ...item, ...doc } : item));
        }
        return [
          ...prev,
          {
            ...doc,
            id: ensuredId,
            uploaded: doc.uploaded ?? true,
            uploadedAt: doc.uploadedAt ?? new Date().toISOString(),
          },
        ];
      });
      setProofStatus((prev) => ({
        ...prev,
        [ensuredId]: 'idle',
      }));
      toast({
        title: 'Document Added',
        description: `${doc.name ?? 'Document'} is now available in your vault.`,
      });
    };

    window.addEventListener('vault:new-document', handleNewDocument as EventListener);
    return () => {
      window.removeEventListener('vault:new-document', handleNewDocument as EventListener);
    };
  }, [toast]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, docId: string) => {
    setDraggingId(docId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', docId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, docId: string) => {
    event.preventDefault();
    if (dragOverId !== docId) {
      setDragOverId(docId);
    }
  };

  const handleDropOnCard = (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain') || draggingId;
    if (!sourceId || sourceId === targetId) return;

    setDocuments((prev) => {
      const updated = [...prev];
      const fromIndex = updated.findIndex((doc) => doc.id === sourceId);
      const toIndex = updated.findIndex((doc) => doc.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
    setDragOverId(null);
    setDraggingId(null);
  };

  const handleDropOnZone = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain') || draggingId;
    if (!sourceId) return;

    setDocuments((prev) => {
      const updated = [...prev];
      const fromIndex = updated.findIndex((doc) => doc.id === sourceId);
      if (fromIndex === -1 || fromIndex === updated.length - 1) {
        return prev;
      }
      const [moved] = updated.splice(fromIndex, 1);
      updated.push(moved);
      return updated;
    });
    setDragOverId(null);
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    setDraggingId(null);
  };

  const applyDocumentUpload = async (docId: string, file: File) => {
    try {
      let documentName = '';
      const uploadedAt = new Date().toISOString();
      const computedHash = await computeFileHash(file);
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id !== docId) return doc;
          documentName = doc.name;
          return {
            ...doc,
            uploaded: true,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt,
            hash: computedHash,
            txHash: createMockHash(),
          };
        }),
      );
      setProofStatus((prev) => ({
        ...prev,
        [docId]: 'idle',
      }));
      setLoginStatus((status) => (status === 'verified' ? 'idle' : status));

      toast({
        title: 'Document Linked',
        description: `${file.name} attached to ${documentName || 'document'} successfully.`,
      });
    } catch (error) {
      console.error('Document upload failed', error);
      toast({
        title: 'Upload Failed',
        description: 'We could not process this file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUploadDragOver = (event: React.DragEvent<HTMLDivElement>, docId: string) => {
    if (!event.dataTransfer.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setUploadHoverId(docId);
  };

  const handleUploadDragLeave = (event: React.DragEvent<HTMLDivElement>, docId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setUploadHoverId((prev) => (prev === docId ? null : prev));
  };

  const handleFileDrop = async (event: React.DragEvent<HTMLDivElement>, docId: string) => {
    if (!event.dataTransfer.types.includes('Files')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setUploadHoverId(null);
    setDraggingId(null);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await applyDocumentUpload(docId, file);
    }
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await applyDocumentUpload(docId, file);
    event.target.value = '';
  };

  const startProofGeneration = (docId: string) => {
    const doc = documents.find((item) => item.id === docId);
    if (!doc) return;
    if (!doc.uploaded) {
      toast({
        title: 'Upload Required',
        description: 'Please upload and register this document before generating a proof.',
        variant: 'destructive',
      });
      return;
    }
    setProofStatus((prev) => ({
      ...prev,
      [docId]: 'generating',
    }));
    setTimeout(() => {
      setProofStatus((prev) => ({
        ...prev,
        [docId]: 'ready',
      }));
      toast({
        title: 'ZKP Proof Ready',
        description: 'A reusable proof has been created. Share it securely without revealing the document.',
      });
    }, 2200);
  };

  const resetProof = (docId: string) => {
    setProofStatus((prev) => ({
      ...prev,
      [docId]: 'idle',
    }));
  };

  const handleCopyProof = (docId: string) => {
    const doc = documents.find((item) => item.id === docId);
    if (!doc) return;
    const proofState = proofStatus[docId];
    if (proofState !== 'ready') {
      toast({
        title: 'Proof Not Ready',
        description: 'Generate the zero-knowledge proof first, then copy the payload.',
        variant: 'destructive',
      });
      return;
    }
    navigator.clipboard.writeText(`zkp-proof::${doc.hash}::${doc.txHash ?? 'pending'}`);
    toast({
      title: 'Proof Payload Copied',
      description: `${doc.name} proof payload is ready to share securely.`,
    });
  };

  const handleZkpLogin = () => {
    if (loginStatus === 'generating') return;
    setLoginStatus('generating');
    setTimeout(() => {
      setLoginStatus('verified');
      toast({
        title: 'Login Proof Verified',
        description: 'You can now access protected areas without sharing raw credentials.',
      });
    }, 2600);
  };

  const selectedDocProof = selectedDoc ? proofStatus[selectedDoc.id] : 'idle';
  const canUseProofForLogin = useMemo(
    () => Object.values(proofStatus).some((status) => status === 'ready'),
    [proofStatus],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
            Document Vault
          </h1>
          <p className="text-muted-foreground">
            Your secure document locker • आपका सुरक्षित दस्तावेज़ लॉकर
          </p>
        </div>

        {documents.length === 0 ? (
          <Card className="border border-border bg-card p-12 text-center">
            <p className="text-lg font-heading font-semibold text-foreground">
              No documents in your vault yet
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload something to get started • पहले अपना दस्तावेज़ अपलोड करें
            </p>
            <Button className="mt-4" variant="outline" onClick={() => (window.location.href = '/upload')}>
              Go to Uploads
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {documents.map((doc) => {
                const isDragging = draggingId === doc.id;
                const isDragOver = dragOverId === doc.id;
                const proofState = proofStatus[doc.id];
                 const uploadInputId = `vault-upload-${doc.id}`;
                 const isUploadHover = uploadHoverId === doc.id;
                return (
                  <Card
                    key={doc.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, doc.id)}
                    onDragOver={(event) => handleDragOver(event, doc.id)}
                    onDrop={(event) => handleDropOnCard(event, doc.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'border border-border bg-card p-6 transition-all duration-150 ease-out',
                      'cursor-grab active:cursor-grabbing',
                      isDragging && 'ring-2 ring-primary/40 shadow-lg',
                      isDragOver && 'border-primary/60 bg-accent/50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          Drag to reorder • खींचें और क्रम बदलें
                        </div>
                        <div>
                          <p className="text-lg font-heading font-semibold text-foreground">
                            {doc.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{doc.issuer}</p>
                      {doc.fileName && (
                        <p className="text-xs text-muted-foreground">
                          {doc.fileName}
                          {doc.fileSize ? ` • ${formatFileSize(doc.fileSize)}` : ''}
                        </p>
                      )}
                      {doc.uploadedAt && (
                        <p className="text-[11px] text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleString()}
                        </p>
                      )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={doc.status} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="icon" onClick={() => setSelectedDoc(doc)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                        {!doc.flagged && (
                          <Button variant="outline" size="icon">
                            <Flag className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div
                      className={cn(
                        'mt-4 rounded-md border border-dashed p-4 transition-colors',
                        doc.uploaded
                          ? 'border-success/30 bg-success/5'
                          : 'border-border bg-muted/40',
                        isUploadHover && 'border-primary bg-primary/10',
                      )}
                      onDragOver={(event) => handleUploadDragOver(event, doc.id)}
                      onDragLeave={(event) => handleUploadDragLeave(event, doc.id)}
                      onDrop={(event) => handleFileDrop(event, doc.id)}
                    >
                      <input
                        type="file"
                        id={uploadInputId}
                        onChange={(event) => handleFileSelect(event, doc.id)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <UploadCloud className="h-4 w-4 text-primary" />
                        {doc.uploaded ? 'Document linked' : 'Upload document'}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {doc.uploaded
                          ? `Attached file: ${doc.fileName ?? 'On-chain record'}`
                          : 'Drag & drop a file here, or browse to attach the document.'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={(event) => {
                            event.preventDefault();
                            document.getElementById(uploadInputId)?.click();
                          }}
                        >
                          <UploadCloud className="h-4 w-4" />
                          {doc.uploaded ? 'Replace File' : 'Browse File'}
                        </Button>
                        {!doc.uploaded && (
                          <span className="text-xs text-muted-foreground">
                            Upload required before generating proof.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 rounded-md border border-dashed border-border bg-muted/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Fingerprint className="h-4 w-4 text-primary" />
                            Zero-Knowledge Proof
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Generate a reusable proof to demonstrate ownership without revealing the document.
                          </p>
                        </div>
                        <div className="text-xs font-semibold uppercase text-muted-foreground">
                          {proofState === 'ready'
                            ? 'Proof Ready'
                            : proofState === 'generating'
                            ? 'Generating...'
                            : 'Idle'}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {proofState === 'idle' && (
                          <Button size="sm" onClick={() => startProofGeneration(doc.id)} className="gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Generate Proof
                          </Button>
                        )}
                        {proofState === 'generating' && (
                          <Button size="sm" disabled className="gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </Button>
                        )}
                        {proofState === 'ready' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-2"
                              onClick={() => handleCopyProof(doc.id)}
                            >
                              <Copy className="h-4 w-4" />
                              Copy Proof Payload
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => resetProof(doc.id)}>
                              Reset Proof
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div
              className={cn(
                'mt-6 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center',
                draggingId && 'border-primary/60 bg-primary/5',
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverId(null);
              }}
              onDrop={handleDropOnZone}
            >
              <p className="text-sm font-medium text-foreground">
                Drop a card here to pin it to the bottom • कार्ड को नीचे स्थिर करने के लिए यहाँ छोड़ें
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Organise your vault visually and prepare proofs before sharing access.
              </p>
            </div>
          </>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground">
                  ZKP Session Login
                </h2>
                <p className="text-sm text-muted-foreground">
                  Reuse generated proofs to unlock your vault without exposing raw identifiers.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                className="gap-2"
                size="sm"
                disabled={!canUseProofForLogin || loginStatus === 'generating'}
                onClick={handleZkpLogin}
              >
                {loginStatus === 'generating' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying Proof...
                  </>
                ) : loginStatus === 'verified' ? (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Proof Accepted
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Verify & Login
                  </>
                )}
              </Button>
              {!canUseProofForLogin && (
                <span className="text-xs text-muted-foreground">
                  Generate at least one document proof to enable ZKP login flow.
                </span>
              )}
              {loginStatus === 'verified' && (
                <span className="text-xs font-semibold text-success">
                  Session unlocked securely • सत्र सुरक्षित रूप से अनलॉक हुआ
                </span>
              )}
            </div>
          </Card>
          <Card className="border border-border bg-card p-6">
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Drag & Drop Tips
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Arrange documents in review priority, prepare proofs, and share only the cryptographic
              evidence with verifiers.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Drag cards to group verified proofs together.</li>
              <li>• Generate a proof before exporting or sharing a record.</li>
              <li>• Use the login verifier once a proof is ready.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Document Preview Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{selectedDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Issuer</p>
                <p className="font-medium text-foreground">{selectedDoc?.issuer}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                {selectedDoc && <StatusBadge status={selectedDoc.status} />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="font-medium text-foreground">
                  {selectedDoc?.date && new Date(selectedDoc.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transaction</p>
                {selectedDoc?.txHash ? (
                  <p className="font-mono text-xs text-secondary truncate">
                    {selectedDoc.txHash}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">
                  Document Hash (Digital Fingerprint)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedDoc && copyHash(selectedDoc.hash)}
                >
                  {copiedHash ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  {copiedHash ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-mono text-xs text-foreground break-all">
                  {selectedDoc?.hash}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                यह आपकी फ़ाइल का डिजिटल फ़िंगरप्रिंट है। This fingerprint ensures your file can't be faked.
              </p>
            </div>

            {selectedDoc?.flagged && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm font-medium text-destructive mb-1">⚠️ Document Flagged</p>
                <p className="text-xs text-muted-foreground">{selectedDoc.flagReason}</p>
              </div>
            )}

            {selectedDoc && selectedDocProof === 'ready' && (
              <div className="rounded-md border border-success/30 bg-success/10 p-4">
                <p className="text-sm font-semibold text-success mb-1">Reusable Proof Available</p>
                <p className="text-xs text-muted-foreground">
                  Share this document via zero-knowledge proof. It can also be reused for passwordless
                  login within TrustVault.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
