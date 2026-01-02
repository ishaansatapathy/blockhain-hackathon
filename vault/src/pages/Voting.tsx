import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Lock,
  Camera,
  Ban,
  CheckCircle,
  Hash,
  Clock,
  Users,
  Vote as VoteIcon,
} from 'lucide-react';
import { mockDocuments, mockVotes } from '@/data/mockData';
import { Document, Vote } from '@/types';
import { cn, createDocumentId, createMockHash, computeFileHash, formatFileSize } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { loadVaultDocuments, saveVaultDocuments } from '@/lib/storage';
import { verifyFaceImage } from '@/services/face';

const createInitialPolls = () => {
  const uncast = mockVotes.find((p) => !p.cast);
  const poll = uncast ?? mockVotes[0];
  return [{ ...poll }];
};

export default function Voting() {
  const [polls, setPolls] = useState<Vote[]>(() => createInitialPolls());
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [proofState, setProofState] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedProofDoc, setSelectedProofDoc] = useState<Document | null>(null);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'streaming' | 'matching' | 'verified' | 'blocked'>('idle');
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [currentFaceHash, setCurrentFaceHash] = useState<string | null>(null);
  const [faceVerificationSource, setFaceVerificationSource] = useState<'backend' | 'fallback' | null>(null);
  const [faceProofHash, setFaceProofHash] = useState<string | null>(null);
  const [faceVerificationScore, setFaceVerificationScore] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const selectedPoll = useMemo(
    () => (selectedPollId ? polls.find((poll) => poll.id === selectedPollId) ?? null : null),
    [selectedPollId, polls],
  );

  const proofDocuments = useMemo(() => {
    const stored = loadVaultDocuments();
    const merged = new Map<string, Document>();
    [...mockDocuments, ...stored].forEach((doc) => {
      merged.set(doc.id, { ...doc });
    });
    return Array.from(merged.values());
  }, [proofModalOpen, selectedProofDoc]);

  const electionReady = isAuthenticated && proofState === "ready" && faceStatus === "verified";

  const handlePinSubmit = () => {
    if (pin.trim() === "123456") {
      setIsAuthenticated(true);
      setPin("");
      setPinError(null);
      toast({
        title: "DEPIN Verified",
        description: "Polling console unlocked successfully.",
      });
    } else {
      setPinError("Invalid DEPIN. Please enter 123456 to proceed.");
    }
  };

  const startProofGeneration = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Authenticate with your DEPIN before generating a proof.",
        variant: "destructive",
      });
      return;
    }
    setProofModalOpen(true);
  };

  const resetProof = () => {
    setProofState("idle");
    setSelectedProofDoc(null);
  };

  const handleProofSelection = (doc: Document) => {
    if (doc.status !== "verified") {
      toast({
        title: "Document Not Verified",
        description: "Select a verified document from your vault to generate the proof.",
        variant: "destructive",
      });
      return;
    }
    setSelectedProofDoc(doc);
    setProofModalOpen(false);
    setProofState("generating");
    toast({
      title: "Generating Proof",
      description: `Creating zero-knowledge proof using ${doc.name}.`,
    });
    setTimeout(() => {
      setProofState("ready");
      toast({
        title: "Proof Ready",
        description: `${doc.name} proof sealed and ready for casting your vote.`,
      });
    }, 1600);
  };

  const stopCameraStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const resetForNextVoter = () => {
    stopCameraStream();
    setPolls(createInitialPolls());
    setIsAuthenticated(false);
    setPin("");
    setPinError(null);
    resetProof();
    setFaceStatus("idle");
    setFacePreview(null);
    setCurrentFaceHash(null);
    setFaceVerificationSource(null);
    setFaceProofHash(null);
    setFaceVerificationScore(null);
    setSelectedPollId(null);
    toast({
      title: "Ready for Next Voter",
      description: "Verification flow has been reset. The next voter may begin.",
    });
  };

  useEffect(() => {
    if (!faceModalOpen) {
      stopCameraStream();
      if (faceStatus === "streaming") {
        setFaceStatus("idle");
      }
      return;
    }

    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setFaceStatus("streaming");
      } catch (error) {
        console.error("Camera access denied", error);
        toast({
          title: "Camera Access Required",
          description: "We couldn't access your camera. Please allow permission and try again.",
          variant: "destructive",
        });
        setFaceModalOpen(false);
        setFaceStatus("idle");
      }
    };

    void enableCamera();

    return () => {
      stopCameraStream();
    };
  }, [faceModalOpen, toast, faceStatus]);

  const beginFaceVerification = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Authenticate with your DEPIN before starting face verification.',
        variant: 'destructive',
      });
      return;
    }
    if (proofState !== 'ready') {
      toast({
        title: 'Proof Required',
        description: 'Generate a zero-knowledge proof from your vault selection first.',
        variant: 'destructive',
      });
      return;
    }
    setFacePreview(null);
    setCurrentFaceHash(null);
    setFaceVerificationSource(null);
    setFaceProofHash(null);
    setFaceVerificationScore(null);
    setFaceStatus('streaming');
    setFaceModalOpen(true);
  };

  const captureSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setFacePreview(dataUrl);
    stopCameraStream();
    setFaceStatus('matching');

    const result = await verifyFaceImage(dataUrl);
    setCurrentFaceHash(result.faceHash ?? null);
    setFaceVerificationSource(result.from ?? null);

    if (result.status === 'duplicate') {
      setFaceStatus('blocked');
      setFaceModalOpen(false);
      setFaceProofHash(null);
      setFaceVerificationScore(null);
      toast({
        title: 'Duplicate Voter Detected',
        description: result.message ?? 'This face has already cast a vote.',
        variant: 'destructive',
      });
      return;
    }

    if (result.status === 'error') {
      setFaceStatus('idle');
      setFaceModalOpen(false);
      setFaceProofHash(null);
      setFaceVerificationScore(null);
      toast({
        title: 'Verification Error',
        description: result.message ?? 'Unable to verify face. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setFaceProofHash(result.faceHash ?? createMockHash());
    setFaceVerificationScore(result.from === 'backend' ? Math.floor(92 + Math.random() * 6) : Math.floor(84 + Math.random() * 8));

    setTimeout(() => {
      setFaceStatus('verified');
      setFaceModalOpen(false);
      toast({
        title: 'Face Verified',
        description:
          result.from === 'fallback'
            ? 'Face confirmed using local fallback cache.'
            : 'Biometric verification complete via backend.',
      });
    }, 600);
  };

  const openPoll = (poll: Vote) => {
    if (poll.cast) {
      toast({
        title: "Vote Already Cast",
        description: "A vote for this poll already exists on-chain for your identity.",
        variant: "destructive",
      });
      return;
    }
    setSelectedPollId(poll.id);
  };

  const handleVote = (option: string) => {
    if (!selectedPoll) return;
    if (!electionReady) {
      toast({
        title: "Verification Required",
        description: "Please complete DEPIN login, generate proof and verify biometrics before casting your vote.",
        variant: "destructive",
      });
      return;
    }
    setVoting(true);
    setTimeout(() => {
      setVoting(false);
      setSelectedPollId(null);
      setPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== selectedPoll.id) return poll;
          return {
            ...poll,
            cast: true,
            txHash: createMockHash(),
            blockHash: createMockHash(),
          };
        }),
      );
      toast({
        title: "Vote Recorded ✓",
        description: "Ballot sealed with a unique block hash.",
      });
      setTimeout(() => {
        resetForNextVoter();
      }, 2000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl font-heading font-semibold text-foreground">Assembly Election Booth</h1>
          <p className="text-muted-foreground">
            Complete verification to cast your vote for the next Assembly representative • विधानसभा चुनाव के लिए अपना मत दें
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-border bg-card p-6 space-y-4 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground">DEPIN Login</h2>
                <p className="text-xs text-muted-foreground">Enter your secure polling PIN.</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="depin">6-digit DEPIN</Label>
              <Input
                id="depin"
                placeholder="Enter 123456"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                maxLength={6}
                disabled={isAuthenticated}
              />
              {pinError && <p className="text-xs text-destructive">{pinError}</p>}
              <Button onClick={handlePinSubmit} disabled={isAuthenticated} className="w-full">
                {isAuthenticated ? "Authenticated" : "Unlock Booth"}
              </Button>
            </div>
            {isAuthenticated && (
              <p className="text-xs text-success flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                You are logged in with DEPIN credentials.
              </p>
            )}
          </Card>

          {isAuthenticated ? (
            <>
              <Card className="border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-heading font-semibold text-foreground">ZKP Proof</h2>
                    <p className="text-xs text-muted-foreground">Generate proof of eligibility.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button onClick={startProofGeneration} disabled={proofState === "generating"} className="w-full">
                    {proofState === "generating" ? "Generating Proof..." : "Generate Proof"}
                  </Button>
                  <Button onClick={resetProof} variant="outline" className="w-full" disabled={proofState !== "ready"}>
                    Reset Proof
                  </Button>
                  <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                    <p>
                      Status: {proofState === "ready"
                        ? `Proof ready with ${selectedProofDoc?.name ?? "selected document"}`
                        : proofState === "generating"
                        ? "Generating..."
                        : "Awaiting proof"}
                    </p>
                    {selectedProofDoc && (
                      <p className="text-[11px] text-muted-foreground/80">
                        Document: {selectedProofDoc.name} • {selectedProofDoc.issuer}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-heading font-semibold text-foreground">Face Verification</h2>
                    <p className="text-xs text-muted-foreground">Confirm you are the registered voter.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={beginFaceVerification}
                    disabled={faceStatus === "matching" || faceStatus === "verified" || faceStatus === "streaming"}
                  >
                    {faceStatus === "streaming"
                      ? "Processing..."
                      : faceStatus === "matching"
                      ? "Processing..."
                      : faceStatus === "verified"
                      ? "Verified"
                      : faceStatus === "blocked"
                      ? "Verification Blocked"
                      : "Start Face Verification"}
                  </Button>
                  <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    Status: {faceStatus === "verified"
                      ? faceVerificationSource === "backend"
                        ? "Face matched by verification server"
                        : "Face verified via fallback cache"
                      : faceStatus === "matching"
                      ? "Matching selfie with records"
                      : faceStatus === "blocked"
                      ? "Duplicate voter detected"
                      : faceStatus === "streaming"
                      ? "Camera active — capture a selfie"
                      : "Awaiting verification"}
                  </div>
                  {faceStatus === "blocked" && (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                      <Ban className="h-3.5 w-3.5" />
                      This face has already cast a vote in this booth.
                    </div>
                  )}
                  {facePreview && faceStatus !== "blocked" && (
                    <div className="rounded-md border border-border bg-muted p-2 text-center space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Captured selfie</p>
                        <img src={facePreview} alt="Face preview" className="mx-auto h-24 w-24 rounded-md object-cover" />
                      </div>
                      {faceProofHash && (
                        <div className="rounded-md border border-border bg-card p-3 text-left text-[11px] text-muted-foreground">
                          <p className="font-semibold text-foreground text-xs mb-1">Biometric Proof</p>
                          <p className="font-mono break-all">{faceProofHash}</p>
                          {faceVerificationScore && (
                            <p className="mt-2 text-[11px] text-success">
                              Confidentiality score: <span className="font-semibold">{faceVerificationScore}%</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="md:col-span-2 border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Unlock the booth with your DEPIN PIN to generate proofs and start face verification.
            </Card>
          )}
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-semibold text-foreground">Ballot Paper</h2>
            <div className="text-xs text-muted-foreground">
              {electionReady
                ? "Verification complete — cast your assembly vote."
                : isAuthenticated
                ? "Complete proof and face verification to unlock the ballot."
                : "Unlock the booth to begin verification."}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {polls.map((poll) => (
              <Card key={poll.id} className="p-6 border border-border bg-card">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Assembly Election</h3>
                    <p className="text-sm text-muted-foreground">{poll.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{poll.timeLeft}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{poll.totalVotes.toLocaleString()} voters participated</span>
                    </div>
                  </div>

                  {poll.cast ? (
                    <div className="rounded-md border border-success/20 bg-success/10 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <p className="text-sm font-medium text-success">Your assembly vote is sealed</p>
                      </div>
                      {poll.txHash && (
                        <p className="text-xs font-mono text-muted-foreground truncate">Tx: {poll.txHash}</p>
                      )}
                      {poll.blockHash && (
                        <p className="text-xs font-mono text-muted-foreground truncate flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Block: {poll.blockHash}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button onClick={() => openPoll(poll)} className="w-full">
                      <VoteIcon className="w-4 h-4 mr-2" />
                      Vote Now
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={!!selectedPoll && !voting} onOpenChange={() => setSelectedPollId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">{selectedPoll?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">Pick one candidate to represent you in the Assembly.</p>
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground mb-1">Ballot Integrity</p>
              <p className="text-xs text-muted-foreground">
                Once your vote is confirmed, a transaction hash and block hash will be shown. Duplicate votes are prevented automatically.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Choose your candidate:</p>
              {selectedPoll?.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleVote(option)}
                  variant="outline"
                  className="w-full h-auto py-4 text-base hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={voting} onOpenChange={() => {}}>
        <DialogContent className="text-center">
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-lg font-medium text-foreground mb-2">Recording Your Vote...</p>
              <p className="text-sm text-muted-foreground">
                Minting ballot proof & assigning a unique block hash
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={faceModalOpen} onOpenChange={setFaceModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Live Face Scan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Align your face within the frame and click capture. We only store the snapshot temporarily for verification.
            </p>
            <div className="rounded-lg border border-border bg-black/80 p-2">
              <video ref={videoRef} className="mx-auto max-h-64 rounded-md" playsInline muted />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={captureSnapshot} className="flex-1" disabled={faceStatus === "matching"}>
                Capture & Verify
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setFaceModalOpen(false);
                  setFaceStatus("idle");
                }}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Camera status: {faceStatus === "streaming"
                ? "Ready for capture"
                : faceStatus === "matching"
                ? "Matching selfie"
                : faceStatus === "verified"
                ? faceVerificationSource === "backend"
                  ? "Verification complete (server)"
                  : "Verification complete (fallback)"
                : faceStatus === "blocked"
                ? "Duplicate attempt"
                : "Starting..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Select Document for Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a verified document from your vault to generate a zero-knowledge proof. Only verified documents can be used for election eligibility.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {proofDocuments.map((doc) => {
                const disabled = doc.status !== "verified";
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleProofSelection(doc)}
                    disabled={disabled}
                    className={`rounded-lg border p-4 text-left transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      disabled
                        ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{doc.issuer}</p>
                    <div className="text-xs">
                      <p className="font-mono text-muted-foreground/80 truncate">Hash: {doc.hash}</p>
                      <p
                        className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          doc.status === "verified"
                            ? "bg-success/10 text-success"
                            : doc.status === "flagged"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {doc.status.toUpperCase()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {proofDocuments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No documents available. Upload and verify documents in the vault first.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
