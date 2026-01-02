import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, SendHorizontal, Lightbulb, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KnowledgeItem, zkpKnowledgeBase } from "@/data/zkpKnowledgeBase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
  related?: KnowledgeItem[];
}

const popularPrompts = [
  "How do zero-knowledge proofs keep my Aadhaar safe?",
  "Explain the Assembly Election verification steps.",
  "What does the confidential score mean in voting?",
  "How can I share proofs without sharing documents?",
  "How do zk-rollups reduce blockchain fees?",
  "What tools can I use to build ZKP circuits?",
];

const tokenize = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const scoreKnowledgeItem = (queryTokens: string[], item: KnowledgeItem) => {
  const question = item.question.toLowerCase();
  const answer = item.answer.toLowerCase();

  let score = 0;

  if (queryTokens.length === 0) {
    return 0;
  }

  for (const token of queryTokens) {
    if (item.keywords.includes(token)) score += 6;
    if (question.includes(token)) score += 4;
    if (answer.includes(token)) score += 1.5;
    if (item.category === token) score += 2;
  }

  const queryText = queryTokens.join(" ");
  if (question === queryText) score += 12;
  if (question.startsWith(queryText)) score += 6;
  if (item.keywords.some((keyword) => queryText.includes(keyword))) score += 3;

  return score;
};

const findBestMatches = (query: string, limit = 3) => {
  const tokens = tokenize(query);
  const scored = zkpKnowledgeBase
    .map((item) => ({
      item,
      score: scoreKnowledgeItem(tokens, item),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length) {
    return scored.map(({ item }) => item);
  }

  // Provide a gentle fallback using category heuristics
  const category = tokens.find((token) =>
    ["basics", "blockchain", "voting", "documents", "identity", "security", "analytics"].includes(token),
  );

  if (category) {
    return zkpKnowledgeBase.filter((item) => item.category === category).slice(0, limit);
  }

  return zkpKnowledgeBase.slice(0, limit);
};

export const ZkpAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "नमस्ते! I am the TrustVault AI mentor. Ask me anything about zero-knowledge proofs, blockchain identity, voting security, or analytics—I'll respond instantly from our curated playbook.",
    },
  ]);
  const conversationRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(() => zkpKnowledgeBase.slice(0, 8), []);

  const pushMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;

    pushMessage({ role: "user", content: question });

    const matches = findBestMatches(question);
    const primary = matches[0];

    if (primary) {
      pushMessage({
        role: "assistant",
        content: primary.answer,
        related: matches.slice(1),
      });
    } else {
      pushMessage({
        role: "assistant",
        content:
          "I do not have that exact question yet. Try rephrasing with keywords like proof, voting, Aadhaar, or compliance.",
      });
    }

    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl gap-6">
        <DialogHeader className="space-y-3">
          <DialogTitle>
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-gradient-to-r from-primary/15 via-background to-emerald-50 p-4 dark:from-primary/10 dark:via-background dark:to-primary/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold tracking-tight text-foreground">
                    TrustVault Knowledge Assistant
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Curated answers for ZKP, blockchain identity, compliance, and TrustVault workflows—no external API required.
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full border border-primary/30 bg-primary/10 text-primary">
                On-device
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ask in English or Hindi. Mention keywords like proof, Aadhaar, rollup, voting, compliance, or analytics for precise matches.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-1 shadow-inner">
            <ScrollArea className="h-80 rounded-[18px] bg-background">
              <div className="space-y-4 p-4" ref={conversationRef}>
              {messages.map((message, index) => (
                <div
                  key={`message-${index}`}
                  className={cn("flex w-full gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <Avatar className="h-8 w-8 border border-border bg-background shadow-sm">
                    <AvatarFallback className="text-xs font-semibold">
                      {message.role === "assistant" ? "AI" : "You"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[80%] space-y-2 rounded-2xl px-4 py-3 text-sm shadow-sm ring-1",
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary/80 to-primary text-primary-foreground ring-primary/60"
                        : "bg-background text-foreground ring-border/70",
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                      <span>{message.role === "assistant" ? "Assistant" : "You"}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                      <span>
                        {message.role === "assistant" ? "Curated response" : "Query"}
                      </span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed text-sm">{message.content}</p>
                    {message.related && message.related.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <Separator className="my-2 bg-border/60" />
                        <p className="flex items-center gap-1 font-medium text-muted-foreground">
                          <Lightbulb className="h-3 w-3" />
                          Related guidance
                        </p>
                        <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                          {message.related.map((item) => (
                            <li key={item.id}>
                              <span className="font-medium text-foreground">{item.question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </ScrollArea>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-background/80 p-4 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ask a question
            </label>
            <Textarea
              rows={3}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Example: Explain the Assembly Election verification steps."
              className="resize-none rounded-xl border-border/70 bg-muted/20 text-sm focus-visible:ring-primary/40"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                I match keywords automatically—add context like Aadhaar, rollup, governance, or compliance to refine results.
              </p>
              <Button type="submit" size="sm" className="gap-2 rounded-full px-4">
                <SendHorizontal className="h-4 w-4" />
                Ask
              </Button>
            </div>
          </form>

          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <BookOpenCheck className="h-3.5 w-3.5" />
              Popular prompts
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="rounded-full border border-primary/30 bg-background/60 text-xs text-primary hover:border-primary"
                  onClick={() => handlePromptClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            <Separator className="my-3 bg-primary/20" />
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="cursor-pointer rounded-full border-primary/30 bg-background px-3 py-1 text-[11px] font-semibold tracking-wide text-primary/80 hover:bg-primary/10"
                  onClick={() => handlePromptClick(item.question)}
                >
                  {item.category.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


