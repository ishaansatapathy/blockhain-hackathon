import { Card } from "@/components/ui/card";
import { mockDocuments, mockVotes } from "@/data/mockData";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const totalDocuments = mockDocuments.length;
const verifiedDocuments = mockDocuments.filter((doc) => doc.status === "verified").length;
const flaggedDocuments = mockDocuments.filter((doc) => doc.status === "flagged").length;

const totalVotesCast = mockVotes.reduce((acc, poll) => acc + poll.totalVotes, 0);
const pollsWithUserVote = mockVotes.filter((poll) => poll.cast).length;

const documentStatusData = [
  { name: "Verified", value: verifiedDocuments, fill: "#138808" },
  { name: "Pending", value: totalDocuments - verifiedDocuments - flaggedDocuments, fill: "#FF9933" },
  { name: "Flagged", value: flaggedDocuments, fill: "#d14343" },
];

const voterParticipationData = mockVotes.map((poll) => ({
  name: poll.title.replace("Assembly Election – ", ""),
  votes: poll.totalVotes,
}));

const computeTurnoutTrajectory = () => {
  let cumulative = 0;
  return mockVotes.map((poll) => {
    cumulative += poll.totalVotes;
    return {
      name: poll.title.split("–")[1]?.trim() ?? poll.title,
      cumulative,
    };
  });
};

const pollsWithHash = mockVotes.filter((poll) => poll.blockHash).length;
const pollsWithoutHash = mockVotes.length - pollsWithHash;

const integrityData = [
  { name: "Block Hash Issued", value: pollsWithHash, fill: "#0A3D91" },
  { name: "Pending", value: pollsWithoutHash, fill: "#B0D0FF" },
];

// Extract candidates from the active voting poll and calculate vote shares with realistic distribution
const getTickerItems = () => {
  // Get the first active poll to extract candidates
  const activePoll = mockVotes[0];
  if (!activePoll) return [];
  
  // Realistic vote distribution (percentages): simulate actual election results
  const votePercentages = [0.35, 0.28, 0.22, 0.15]; // 35%, 28%, 22%, 15%
  const colors = ["#0A3D91", "#138808", "#FF9933", "#d14343"];
  
  return activePoll.options.map((candidate, idx) => ({
    party: candidate,
    votes: Math.round(activePoll.totalVotes * votePercentages[idx % votePercentages.length]),
    colour: colors[idx % colors.length],
  }));
};

const tickerItems = getTickerItems();

export default function Analytics() {
  const turnoutTrajectory = computeTurnoutTrajectory();
  const summaryItems = [
    {
      title: "Total Ballots",
      value: 120,
      description: "Live assembly ballots across Bharat",
    },
    {
      title: "Total Votes Recorded",
      value: totalVotesCast.toLocaleString(),
      description: "Aggregate votes synced from district nodes",
    },
    {
      title: "ZKP Proofs Sealed",
      value: (pollsWithHash * 12_500).toLocaleString(),
      description: "Zero-knowledge ballots notarised on-chain",
    },
    {
      title: "Verified Documents",
      value: `${verifiedDocuments}/${totalDocuments}`,
      description: "Citizen identity proofs validated for voting",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">Analytics</h1>
              <p className="text-muted-foreground">
                Document and voting statistics • दस्तावेज़ और मतदान आंकड़े
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="ticker-track items-center gap-6 whitespace-nowrap px-4 py-2 text-sm">
              {tickerItems.concat(tickerItems).map((item, index) => (
                <span key={`${item.party}-${index}`} className="inline-flex items-center gap-2 mr-6">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.colour }}
                  />
                  <span className="font-medium text-foreground">{item.party}</span>
                  <span className="text-xs text-muted-foreground">{item.votes} votes projected</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <Card key={item.title} className="border border-border bg-card p-6 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.title}</p>
              <p className="text-2xl font-heading font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border border-border bg-card p-6 lg:col-span-2 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-heading font-semibold text-foreground">Voter Participation</h2>
              <p className="text-xs text-muted-foreground">Turnout by constituency • मतदान सहभागिता</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={voterParticipationData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} angle={-12} textAnchor="end" height={70} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted)/40)" }} />
                  <Legend />
                  <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-heading font-semibold text-foreground">Document Verification Mix</h2>
              <p className="text-xs text-muted-foreground">Status distribution of vault documents</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                  <Pie data={documentStatusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4} label />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-heading font-semibold text-foreground">Turnout Trajectory</h2>
              <p className="text-xs text-muted-foreground">Cumulative votes recorded over time</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={turnoutTrajectory}>
                  <defs>
                    <linearGradient id="colorTurnout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" fill="url(#colorTurnout)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-border bg-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">Key Insights</h2>
              <p className="text-xs text-muted-foreground">Automated summarised metrics</p>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>• {pollsWithUserVote} constituenc{pollsWithUserVote === 1 ? "y has" : "ies have"} sealed ballots with block hashes already on-chain.</li>
              <li>• Verified documents represent {(verifiedDocuments / totalDocuments * 100).toFixed(0)}% of vault submissions; flagged records stand at {flaggedDocuments}.</li>
              <li>• Network throughput is trending upward with cumulative turnout reaching {totalVotesCast.toLocaleString()} votes.</li>
              <li>• Projected vote share currently places {tickerItems[0]?.party} ahead with {tickerItems[0]?.votes.toLocaleString()} votes.</li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
