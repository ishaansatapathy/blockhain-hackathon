import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import { SimpleLanguageProvider } from "@/contexts/SimpleLanguageContext";

const TopNav = lazy(() => import("@/components/layout/TopNav").then((m) => ({ default: m.TopNav })));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Vault = lazy(() => import("./pages/Vault"));
const Upload = lazy(() => import("./pages/Upload"));
const Voting = lazy(() => import("./pages/Voting"));
const Flagged = lazy(() => import("./pages/Flagged"));
const Checker = lazy(() => import("./pages/Checker"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Fallback = () => (
  <div className="min-h-screen bg-background text-foreground p-8">
    <h2 className="text-lg font-semibold">Loading app...</h2>
  </div>
);

const App = () => (
  <SimpleLanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col w-full">
            <ErrorBoundary>
              <Suspense fallback={<Fallback />}>
                <TopNav />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<Fallback />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/vault" element={<Vault />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/voting" element={<Voting />} />
                  <Route path="/flagged" element={<Flagged />} />
                  <Route path="/checker" element={<Checker />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SimpleLanguageProvider>
);

export default App;
