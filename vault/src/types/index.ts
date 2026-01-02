export interface Document {
  id: string;
  name: string;
  hash: string;
  issuer: string;
  date: string;
  status: 'verified' | 'unverified' | 'flagged';
  txHash?: string;
  blockHash?: string;
  verdictOnChain?: 'genuine' | 'fake';
  flagged?: boolean;
  flagReason?: string;
  uploaded?: boolean;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
}

export interface Vote {
  id: string;
  title: string;
  description: string;
  options: string[];
  timeLeft: string;
  totalVotes: number;
  cast?: boolean;
  txHash?: string;
  blockHash?: string;
}

export interface SiteCheck {
  url: string;
  verdict: 'secure' | 'warning' | 'unsafe';
  score: number;
  reasons: string[];
}

export type Language = 'en' | 'hi';
