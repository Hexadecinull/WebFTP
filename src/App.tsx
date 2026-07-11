import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function EmailVerificationHandler() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=signup') && !hash.includes('error')) {
      toast({
        title: '✅ Email verified!',
        description: 'Your email has been successfully verified. You can now sign in.',
      });
      // Clean the hash from the URL without a page reload
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <EmailVerificationHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
