import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Vote, Shield, Upload, Flag, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockDocuments, mockVotes } from '@/data/mockData';

export default function Dashboard() {
  // debug
  // eslint-disable-next-line no-console
  console.log('Dashboard render');
  const verifiedDocs = mockDocuments.filter(d => d.status === 'verified').length;
  const totalVotes = mockVotes.reduce((acc, v) => acc + v.totalVotes, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Secure document management and blockchain-powered verification
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Documents Stored</p>
                <p className="text-3xl font-heading font-semibold text-foreground">
                  {mockDocuments.length}
                </p>
                <p className="text-xs text-success mt-1">{verifiedDocs} verified</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Proofs Generated</p>
                <p className="text-3xl font-heading font-semibold text-foreground">
                  {verifiedDocs}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ZKP verified</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Votes Cast</p>
                <p className="text-3xl font-heading font-semibold text-foreground">
                  {totalVotes.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Across {mockVotes.length} polls</p>
              </div>
              <div className="p-3 bg-accent rounded-lg">
                <Vote className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/upload">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:border-primary hover:bg-accent">
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
                <span className="text-xs text-muted-foreground">दस्तावेज़ अपलोड करें</span>
              </Button>
            </Link>

            <Link to="/voting">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:border-primary hover:bg-accent">
                <Vote className="w-5 h-5" />
                <span>Cast Vote</span>
                <span className="text-xs text-muted-foreground">मतदान करें</span>
              </Button>
            </Link>

            <Link to="/checker">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:border-primary hover:bg-accent">
                <Shield className="w-5 h-5" />
                <span>Scan Payment Page</span>
                <span className="text-xs text-muted-foreground">पेज स्कैन करें</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <Card className="p-6 border border-border bg-card">
            <div className="space-y-4">
              {mockDocuments.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      doc.status === 'verified' ? 'bg-success/10' : 
                      doc.status === 'flagged' ? 'bg-destructive/10' : 'bg-muted'
                    }`}>
                      {doc.status === 'flagged' ? (
                        <Flag className="w-4 h-4 text-destructive" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.issuer} • {doc.date}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${
                    doc.status === 'verified' ? 'text-success' : 
                    doc.status === 'flagged' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {doc.status === 'verified' ? 'Verified' : 
                     doc.status === 'flagged' ? 'Flagged' : 'Unverified'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
