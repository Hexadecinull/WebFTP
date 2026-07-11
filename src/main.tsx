import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Restore saved primary color before React renders to prevent color flash on reload
(function restoreThemeColor() {
  const custom = localStorage.getItem('customPrimaryColor');
  const namedThemes: Record<string, string> = {
    'Default Blue': '200 95% 45%', 'Purple': '262.1 83.3% 57.8%', 'Green': '142.1 76.2% 36.3%',
    'Red': '0 84% 60%', 'Orange': '24.6 95% 53.1%', 'Teal': '173.4 80.4% 40%',
    'Pink': '330.4 81.2% 60.4%', 'Cyan': '188.7 94.5% 42.7%', 'Indigo': '238.7 83.5% 66.7%',
    'Amber': '45.4 93.4% 47.5%', 'Emerald': '160 84% 39%', 'Rose': '350 89% 60%',
    'Violet': '258 90% 66%', 'Sky': '199 89% 48%', 'Fuchsia': '292 84% 61%',
  };
  const namedColor = localStorage.getItem('selectedThemeName');
  const hsl = custom || (namedColor && namedThemes[namedColor]) || null;
  if (hsl) {
    document.documentElement.style.setProperty('--primary', hsl);
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
