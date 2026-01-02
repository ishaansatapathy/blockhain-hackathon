import { useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload as UploadIcon, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addVaultDocument } from '@/lib/storage';
import { cn, createDocumentId, createMockHash, computeFileHash } from '@/lib/utils';
import type { Document } from '@/types';

type Step = 1 | 2 | 3 | 4;

export default function Upload() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [documentTitle, setDocumentTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const selectedFileInfo = useMemo(() => {
    if (!selectedFile) return null;
    const sizeInMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
    return `${selectedFile.name} • ${sizeInMb} MB`;
  }, [selectedFile]);

  const resetFlow = () => {
    setCurrentStep(1);
    setDocumentTitle('');
    setIssuer('');
    setSelectedFile(null);
    setProcessing(false);
    setTxHash('');
    setFileError(null);
    setDocumentHash('');
  };

  const handleFileSelection = (file?: File) => {
    if (!file) {
      setFileError('No file detected. Please try again.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('File exceeds 10MB limit. Please choose a smaller file.');
      return;
    }

    setSelectedFile(file);
    setFileError(null);
    setCurrentStep(2);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileSelection(file);
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFileSelection(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(true);
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleMetadataSubmit = () => {
    if (!selectedFile) {
      toast({
        title: 'No File Attached',
        description: 'Please attach a document before continuing.',
        variant: 'destructive',
      });
      return;
    }

    if (!documentTitle || !issuer) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setCurrentStep(3);
    setTimeout(() => {
      setCurrentStep(4);
      simulateBlockchainRegistration();
    }, 2000);
  };

  const simulateBlockchainRegistration = () => {
    if (!selectedFile) return;
    setProcessing(true);
    const generatedTx = createMockHash();
    const file = selectedFile;
    setTimeout(async () => {
      const computedHash = await computeFileHash(file);
      setTxHash(generatedTx);
      setDocumentHash(computedHash);
      setProcessing(false);
      toast({
        title: 'Document Registered ✓',
        description: 'Your document is safely recorded on the blockchain.',
      });

      const issuedAt = new Date().toISOString();
      const newDocument: Document = {
        id: createDocumentId(),
        name: documentTitle || file.name,
        hash: computedHash,
        issuer,
        date: issuedAt,
        status: 'unverified',
        txHash: generatedTx,
        uploaded: true,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: issuedAt,
      };

      addVaultDocument(newDocument);
      window.dispatchEvent(new CustomEvent<Document>('vault:new-document', { detail: newDocument }));
    }, 3000);
  };

  const steps = [
    { num: 1, label: 'Choose File', labelHi: 'फ़ाइल चुनें' },
    { num: 2, label: 'Add Metadata', labelHi: 'विवरण जोड़ें' },
    { num: 3, label: 'Signature', labelHi: 'हस्ताक्षर' },
    { num: 4, label: 'Register', labelHi: 'रजिस्टर' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
            Upload Document
          </h1>
          <p className="text-muted-foreground">
            Register your document securely on blockchain • अपने दस्तावेज़ को सुरक्षित रूप से पंजीकृत करें
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors',
                      currentStep >= step.num
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {currentStep > step.num ? <CheckCircle className="h-5 w-5" /> : step.num}
                  </div>
                  <p className="mt-2 text-center text-xs font-medium">{step.label}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-1 flex-1 rounded transition-colors',
                      currentStep > step.num ? 'bg-primary' : 'bg-muted',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border border-border bg-card p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div
                className={cn(
                  'rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors',
                  'cursor-pointer hover:border-primary',
                  dragActive && 'border-primary bg-primary/5',
                )}
              >
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="block cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <UploadIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-lg font-medium text-foreground">Drag & drop your file here</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    or click to browse • या ब्राउज़ करने के लिए क्लिक करें
                  </p>
                </label>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4"
                >
                  Browse Files
                </Button>
                {fileError && <p className="mt-3 text-sm text-destructive">{fileError}</p>}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
            </div>
          )}

          {currentStep === 2 && selectedFile && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-md bg-accent p-4">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Selected File</p>
                  <p className="text-xs text-muted-foreground">{selectedFileInfo}</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => setCurrentStep(1)}>
                  Change File
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Driving License"
                    value={documentTitle}
                    onChange={(event) => setDocumentTitle(event.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="issuer">Issuer / Organization *</Label>
                  <Input
                    id="issuer"
                    placeholder="e.g., Ministry of Road Transport"
                    value={issuer}
                    onChange={(event) => setIssuer(event.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleMetadataSubmit}>
                  Continue to Signature
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
              <div>
                <p className="mb-2 text-lg font-medium text-foreground">Requesting Signature...</p>
                <p className="text-sm text-muted-foreground">Please sign the transaction in your wallet.</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              {processing ? (
                <>
                  <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                  <div>
                    <p className="mb-2 text-lg font-medium text-foreground">Registering on Blockchain...</p>
                    <p className="text-sm text-muted-foreground">This may take a few moments.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle className="h-10 w-10 text-success" />
                  </div>
                  <div>
                    <p className="mb-2 text-xl font-heading font-semibold text-foreground">
                      Document Registered Successfully!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your document is safely recorded on the blockchain using its unique fingerprint.
                    </p>
                  </div>
                  <div className="rounded-md bg-muted p-4 text-left">
                    <p className="mb-1 text-xs text-muted-foreground">Transaction Hash</p>
                    <p className="break-all font-mono text-sm text-foreground">{txHash}</p>
                  </div>
                  {documentHash && (
                    <div className="rounded-md bg-muted p-4 text-left">
                      <p className="mb-1 text-xs text-muted-foreground">Document Hash (SHA-256)</p>
                      <p className="break-all font-mono text-sm text-foreground">{documentHash}</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button className="flex-1" onClick={() => (window.location.href = '/vault')}>
                      View in Vault
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={resetFlow}>
                      Upload Another Document
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Next step: open the Vault page to generate a zero-knowledge proof for this document.
                  </p>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
