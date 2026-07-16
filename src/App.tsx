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

function ThemeColorRestorer() {
  useEffect(() => {
    const namedThemes: Record<string, string> = {
      'Default Blue': '200 95% 45%', 'Purple': '262.1 83.3% 57.8%', 'Green': '142.1 76.2% 36.3%',
      'Red': '0 84% 60%', 'Orange': '24.6 95% 53.1%', 'Teal': '173.4 80.4% 40%',
      'Pink': '330.4 81.2% 60.4%', 'Cyan': '188.7 94.5% 42.7%', 'Indigo': '238.7 83.5% 66.7%',
      'Amber': '45.4 93.4% 47.5%', 'Emerald': '160 84% 39%', 'Rose': '350 89% 60%',
      'Violet': '258 90% 66%', 'Sky': '199 89% 48%', 'Fuchsia': '292 84% 61%',
    };
    const id = setTimeout(() => {
      const custom = localStorage.getItem('customPrimaryColor');
      const named = localStorage.getItem('selectedThemeName');
      const hsl = custom || (named && namedThemes[named]) || null;
      if (hsl) document.documentElement.style.setProperty('--primary', hsl);
    }, 0);
    return () => clearTimeout(id);
  }, []);
  return null;
}

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
        <ThemeColorRestorer />
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
