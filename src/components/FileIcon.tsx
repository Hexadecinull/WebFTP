// File Icon component - renders language/type-specific SVG logo icons

import { Folder } from 'lucide-react';

interface FileIconProps {
  filename: string;
  isDirectory: boolean;
  className?: string;
}

// ── SVG Logo Icons ──────────────────────────────────────────────────────

const PythonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <defs>
      <linearGradient id="py1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5A9FD4" />
        <stop offset="100%" stopColor="#306998" />
      </linearGradient>
      <linearGradient id="py2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD43B" />
        <stop offset="100%" stopColor="#FFE873" />
      </linearGradient>
    </defs>
    <path d="M10 2C7.5 2 8 3 8 3v2h2.2v.8H6S3.5 5.5 3.5 10s1.8 4 1.8 4H7V11.5s-.1-2 2-2h3.5s1.8.05 1.8-1.7V4.2S14.6 2 10 2zM7.8 3.5a.7.7 0 110 1.4.7.7 0 010-1.4z" fill="url(#py1)" />
    <path d="M10 18c2.5 0 2-1 2-1v-2h-2.2v-.8H14s2.5.3 2.5-4.2-1.8-4-1.8-4H13v2.5s.1 2-2 2H7.5s-1.8-.05-1.8 1.7v3.6S5.4 18 10 18zm2.2-1.5a.7.7 0 110-1.4.7.7 0 010 1.4z" fill="url(#py2)" />
  </svg>
);

const TypeScriptIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#3178C6" />
    <path d="M5.5 10.5h6v1.3H9.3V16H7.7v-4.2H5.5V10.5z" fill="#fff" />
    <path d="M12.2 15.5c.3.2.8.4 1.3.4.6 0 .9-.2.9-.6 0-.4-.3-.6-1-.8-1.1-.4-1.7-.9-1.7-1.7 0-1 .8-1.7 2.1-1.7.6 0 1.1.1 1.4.3l-.3 1c-.2-.1-.6-.3-1.1-.3-.5 0-.8.2-.8.5 0 .4.4.5 1.1.8 1 .4 1.6.9 1.6 1.8 0 1-.8 1.8-2.2 1.8-.7 0-1.2-.1-1.6-.4l.3-1.1z" fill="#fff" />
  </svg>
);

const JavaScriptIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#F7DF1E" />
    <path d="M6.5 15.2c.3.5.6.8 1.2.8.5 0 .8-.25.8-.6 0-.4-.3-.6-.8-.8l-.4-.2c-.8-.3-1.3-.8-1.3-1.6 0-.8.6-1.5 1.6-1.5.7 0 1.2.2 1.5.8l-.8.5c-.2-.3-.3-.4-.7-.4-.3 0-.5.2-.5.4 0 .3.2.4.6.6l.4.2c.9.4 1.5.8 1.5 1.7 0 1-.8 1.5-1.8 1.5-.9 0-1.6-.5-1.9-1l.6-.4z" fill="#000" />
    <path d="M11.5 15.1c.3.5.5.8 1.1.8.5 0 .7-.2.7-.5 0-.4-.3-.6-.8-.8l-.3-.2c-.7-.3-1.2-.7-1.2-1.5 0-.8.6-1.4 1.5-1.4.6 0 1.1.2 1.4.8l-.7.5c-.2-.3-.3-.4-.6-.4-.3 0-.4.2-.4.4 0 .3.2.4.6.5l.3.2c.9.4 1.4.8 1.4 1.7 0 1-.8 1.5-1.8 1.5-1 0-1.5-.5-1.8-1l.6-.6z" fill="#000" />
  </svg>
);

const ReactIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#20232A" />
    <g transform="translate(10,10)" stroke="#61DAFB" strokeWidth="0.8" fill="none">
      <ellipse rx="7" ry="2.8" />
      <ellipse rx="7" ry="2.8" transform="rotate(60)" />
      <ellipse rx="7" ry="2.8" transform="rotate(120)" />
      <circle r="1.2" fill="#61DAFB" stroke="none" />
    </g>
  </svg>
);

const RustIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#000" />
    <text x="10" y="11" textAnchor="middle" dominantBaseline="central" fill="#DEA584" fontSize="7.5" fontWeight="900" fontFamily="serif">R</text>
    <circle cx="10" cy="10" r="5.5" stroke="#DEA584" strokeWidth="1" fill="none" />
    {[0, 60, 120, 180, 240, 300].map(a => (
      <circle key={a} cx={10 + 5.5 * Math.cos(a * Math.PI / 180)} cy={10 + 5.5 * Math.sin(a * Math.PI / 180)} r="0.8" fill="#DEA584" />
    ))}
  </svg>
);

const GoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#00ADD8" />
    <text x="10" y="11" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="8" fontWeight="800" fontFamily="sans-serif">Go</text>
  </svg>
);

const JavaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#ED8B00" />
    <path d="M8 5c0 0 1.5 2 0 3.5S6 12 8 14" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M11 5c0 0 1.5 2 0 3.5S9 12 11 14" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const CppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#00599C" />
    <text x="7" y="11.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="10" fontWeight="700" fontFamily="sans-serif">C</text>
    <g stroke="#fff" strokeWidth="1">
      <line x1="13" y1="8" x2="13" y2="13" />
      <line x1="10.5" y1="10.5" x2="15.5" y2="10.5" />
      <line x1="16" y1="8" x2="16" y2="13" />
      <line x1="13.5" y1="10.5" x2="18" y2="10.5" />
    </g>
  </svg>
);

const CIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#A8B9CC" />
    <text x="10" y="11.5" textAnchor="middle" dominantBaseline="central" fill="#000" fontSize="12" fontWeight="700" fontFamily="sans-serif">C</text>
  </svg>
);

const CSharpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#68217A" />
    <text x="7.5" y="11.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="10" fontWeight="700" fontFamily="sans-serif">C</text>
    <g stroke="#fff" strokeWidth="0.9">
      <line x1="13.5" y1="7.5" x2="13.5" y2="13.5" />
      <line x1="10.5" y1="10.5" x2="16.5" y2="10.5" />
      <line x1="15.5" y1="7.5" x2="15.5" y2="13.5" />
      <line x1="12" y1="9" x2="17" y2="9" />
    </g>
  </svg>
);

const RubyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#CC342D" />
    <polygon points="10,4 15,7 14,14 6,14 5,7" fill="#fff" fillOpacity="0.9" />
    <polygon points="10,4 15,7 14,14 6,14 5,7" fill="none" stroke="#A00" strokeWidth="0.5" />
  </svg>
);

const PhpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#777BB4" />
    <text x="10" y="11.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="6.5" fontWeight="700" fontFamily="sans-serif">PHP</text>
  </svg>
);

const SwiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="4" fill="#FA7343" />
    <path d="M14 5.5s-3 3-6 4.5c2 1 4 1 6 .5-1 2.5-3.5 4-6.5 4 3-1.5 5-4 5.5-5.5C11 10.5 8 12 5.5 11c3-1 5.5-3.5 7-5.5" fill="#fff" />
  </svg>
);

const KotlinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <defs>
      <linearGradient id="kt1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7F52FF" />
        <stop offset="100%" stopColor="#C811E2" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="18" height="18" rx="2" fill="url(#kt1)" />
    <polygon points="4,4 10,10 4,16" fill="#fff" />
    <polygon points="4,4 16,4 10,10 16,16 4,16 10,10" fill="#fff" fillOpacity="0.7" />
  </svg>
);

const HtmlIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#E34F26" />
    <text x="10" y="8" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="5.5" fontWeight="700" fontFamily="monospace">{'</'}</text>
    <text x="10" y="13.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="5.5" fontWeight="700" fontFamily="monospace">{'>'}</text>
  </svg>
);

const CssIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#1572B6" />
    <text x="10" y="8" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="4" fontWeight="700" fontFamily="monospace">{'{ }'}</text>
    <rect x="6" y="11" width="8" height="1.2" rx="0.5" fill="#fff" fillOpacity="0.7" />
    <rect x="7" y="13.5" width="6" height="1.2" rx="0.5" fill="#fff" fillOpacity="0.5" />
  </svg>
);

const ScssIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#CD6799" />
    <text x="10" y="11" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="9" fontWeight="700" fontFamily="sans-serif">S</text>
  </svg>
);

const MarkdownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#083FA1" />
    <path d="M4 14V6l3 4 3-4v8" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M14 10v4l2.5-2.5L14 10z" fill="#fff" />
    <line x1="14" y1="10" x2="14" y2="6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const ShellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#2D3436" />
    <path d="M5 7l3.5 3L5 13" stroke="#4EAA25" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="13" x2="15" y2="13" stroke="#4EAA25" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const LuaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#000080" />
    <circle cx="10" cy="11" r="4" stroke="#fff" strokeWidth="1.2" fill="none" />
    <circle cx="14" cy="6" r="1.5" fill="#fff" />
  </svg>
);

const RLangIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#276DC3" />
    <text x="10" y="11.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="11" fontWeight="700" fontFamily="serif" fontStyle="italic">R</text>
  </svg>
);

const SqlIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#E38C00" />
    <ellipse cx="10" cy="7" rx="5" ry="2" fill="none" stroke="#fff" strokeWidth="1" />
    <path d="M5 7v6c0 1.1 2.2 2 5 2s5-.9 5-2V7" stroke="#fff" strokeWidth="1" fill="none" />
    <ellipse cx="10" cy="10" rx="5" ry="2" fill="none" stroke="#fff" strokeWidth="0.6" strokeOpacity="0.5" />
  </svg>
);

const DartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#0175C2" />
    <polygon points="6,6 14,6 16,10 10,16 6,16" fill="#fff" fillOpacity="0.8" />
    <polygon points="6,6 10,6 10,10 6,10" fill="#fff" />
  </svg>
);

const ScalaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#DC322F" />
    <path d="M6 5h8c0 0 0 2-4 2.5S6 10 6 10h8c0 0 0 2-4 2.5S6 15 6 15" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const HaskellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#5D4F85" />
    <path d="M3 15l4-5-4-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 15l4-5-4-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="8.5" x2="17" y2="8.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="13" y1="11.5" x2="17" y2="11.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ElixirIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#6E4A7E" />
    <path d="M10 4c-2 3-4 5-4 8a4 4 0 008 0c0-3-2-5-4-8z" fill="#fff" fillOpacity="0.85" />
  </svg>
);

const ZigIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#F7A41D" />
    <polygon points="5,6 15,6 7,14 15,14" fill="none" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const VueIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#2C3E50" />
    <polygon points="5,5 10,14 15,5 12.5,5 10,9.5 7.5,5" fill="#4FC08D" />
    <polygon points="7.5,5 10,9.5 12.5,5" fill="#35495E" />
  </svg>
);

const SvelteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#FF3E00" />
    <path d="M13 5c-2-1.5-4.5-.5-5 1.5-.3 1 .2 2 1 2.5l3 2c.8.5 1.2 1.5 1 2.5-.5 2-3 3-5 1.5" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
);

const AstroIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#17191E" />
    <path d="M7 15l1-8h4l1 8-2-2h-2l-2 2z" fill="#FF5D01" />
    <circle cx="10" cy="11" r="1" fill="#17191E" />
  </svg>
);

const PowerShellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#012456" />
    <path d="M5 7l4.5 3L5 13" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="11" y1="13" x2="15" y2="13" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const PerlIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#39457E" />
    <text x="10" y="11.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="11" fontWeight="700" fontFamily="serif">🐪</text>
  </svg>
);

// ── Fallback icons ──────────────────────────────────────────────────────

const MarkupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="hsl(210 15% 30%)" />
    <text x="10" y="11" textAnchor="middle" dominantBaseline="central" fill="hsl(210 30% 80%)" fontSize="9" fontWeight="700" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{'<>'}</text>
  </svg>
);

const ArchiveIcon = ({ bg, label }: { bg: string; label: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill={bg} />
    <rect x="6" y="4" width="8" height="4" rx="1" fill="#fff" fillOpacity="0.3" />
    <rect x="8" y="5.5" width="4" height="1.5" rx="0.5" fill="#fff" fillOpacity="0.6" />
    <path d="M6 8v7a1 1 0 001 1h6a1 1 0 001-1V8" fill="#fff" fillOpacity="0.15" />
    <text x="10" y="13.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="4" fontWeight="700" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{label}</text>
  </svg>
);

const GitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#F05032" />
    <circle cx="8" cy="8" r="1.5" fill="#fff" />
    <circle cx="12" cy="12" r="1.5" fill="#fff" />
    <line x1="8" y1="9.5" x2="8" y2="12" stroke="#fff" strokeWidth="1" />
    <line x1="8" y1="12" x2="12" y2="12" stroke="#fff" strokeWidth="1" />
  </svg>
);

const DockerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#2496ED" />
    <g fill="#fff">
      <rect x="4" y="9" width="2.2" height="2" rx="0.3" />
      <rect x="6.8" y="9" width="2.2" height="2" rx="0.3" />
      <rect x="9.6" y="9" width="2.2" height="2" rx="0.3" />
      <rect x="6.8" y="6.5" width="2.2" height="2" rx="0.3" />
      <rect x="9.6" y="6.5" width="2.2" height="2" rx="0.3" />
      <rect x="9.6" y="4" width="2.2" height="2" rx="0.3" />
    </g>
    <path d="M3 12c0 0 1 4 7 4s7-3 7-3" stroke="#fff" strokeWidth="0.8" fill="none" />
  </svg>
);

const NpmIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#CB3837" />
    <rect x="4" y="6" width="12" height="8" fill="#fff" />
    <rect x="6" y="8" width="3" height="4" fill="#CB3837" />
    <rect x="10" y="6" width="2" height="6" fill="#CB3837" />
  </svg>
);

const ConfigIcon = ({ bg, label }: { bg: string; label: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill={bg} />
    <circle cx="10" cy="10" r="3.5" stroke="#fff" strokeWidth="1.2" fill="none" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
      <line key={a} x1={10 + 3.2 * Math.cos(a * Math.PI / 180)} y1={10 + 3.2 * Math.sin(a * Math.PI / 180)} x2={10 + 5 * Math.cos(a * Math.PI / 180)} y2={10 + 5 * Math.sin(a * Math.PI / 180)} stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    ))}
    <text x="10" y="17.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="3" fontWeight="700" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{label}</text>
  </svg>
);

const LicenseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#333" />
    <rect x="5" y="4" width="10" height="12" rx="1" fill="#fff" fillOpacity="0.2" />
    <text x="10" y="10.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="5.5" fontWeight="700" fontFamily="sans-serif">§</text>
  </svg>
);

const MakeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#6D8086" />
    <text x="10" y="11" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="7" fontWeight="700" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">MK</text>
  </svg>
);

const DefaultFileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="hsl(220 10% 50%)" />
    <rect x="5" y="5" width="10" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
    <rect x="5" y="8.5" width="8" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
    <rect x="5" y="12" width="10" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
  </svg>
);

// ── Extension → Icon mapping ────────────────────────────────────────────

const extToIcon: Record<string, () => JSX.Element> = {
  // JavaScript / TypeScript
  js: JavaScriptIcon,
  mjs: JavaScriptIcon,
  jsx: ReactIcon,
  ts: TypeScriptIcon,
  tsx: ReactIcon,
  // Python
  py: PythonIcon,
  // Java
  java: JavaIcon,
  jar: JavaIcon,
  // C family
  c: CIcon,
  h: CIcon,
  cpp: CppIcon,
  hpp: CppIcon,
  cc: CppIcon,
  cxx: CppIcon,
  cs: CSharpIcon,
  // Rust
  rs: RustIcon,
  // Go
  go: GoIcon,
  // Ruby
  rb: RubyIcon,
  // PHP
  php: PhpIcon,
  // Swift
  swift: SwiftIcon,
  // Kotlin
  kt: KotlinIcon,
  kts: KotlinIcon,
  // Scala
  scala: ScalaIcon,
  // Dart
  dart: DartIcon,
  // Lua
  lua: LuaIcon,
  // R
  r: RLangIcon,
  // Perl
  pl: PerlIcon,
  pm: PerlIcon,
  // Shell
  sh: ShellIcon,
  bash: ShellIcon,
  zsh: ShellIcon,
  fish: ShellIcon,
  // PowerShell
  ps1: PowerShellIcon,
  // SQL
  sql: SqlIcon,
  // Haskell
  hs: HaskellIcon,
  // Elixir / Erlang
  ex: ElixirIcon,
  exs: ElixirIcon,
  erl: ElixirIcon,
  // Zig
  zig: ZigIcon,
  // Vue
  vue: VueIcon,
  // Svelte
  svelte: SvelteIcon,
  // Astro
  astro: AstroIcon,
  // CSS variants
  css: CssIcon,
  scss: ScssIcon,
  sass: ScssIcon,
  less: CssIcon,
  // HTML
  html: HtmlIcon,
  htm: HtmlIcon,
  // Markdown
  md: MarkdownIcon,
  markdown: MarkdownIcon,
  mdx: MarkdownIcon,
};

// Markup / data files share <> icon
const markupExts = new Set([
  'json', 'xml', 'yml', 'yaml', 'toml', 'ini', 'conf', 'cfg', 'properties', 'env',
]);

// Archive formats
const archiveStyles: Record<string, { bg: string; label: string }> = {
  zip: { bg: '#E8A83C', label: 'ZIP' },
  tar: { bg: '#D4782F', label: 'TAR' },
  gz: { bg: '#D4782F', label: 'GZ' },
  bz2: { bg: '#D4782F', label: 'BZ2' },
  xz: { bg: '#D4782F', label: 'XZ' },
  rar: { bg: '#6C2D82', label: 'RAR' },
  '7z': { bg: '#4A90D9', label: '7Z' },
};

// Special config files
const specialFileMap: Record<string, () => JSX.Element> = {
  '.gitignore': GitIcon,
  '.gitmodules': GitIcon,
  '.gitattributes': GitIcon,
  '.gitkeep': GitIcon,
  Dockerfile: DockerIcon,
  'docker-compose.yml': DockerIcon,
  'docker-compose.yaml': DockerIcon,
  '.npmrc': NpmIcon,
  LICENSE: LicenseIcon,
  Makefile: MakeIcon,
  'CMakeLists.txt': MakeIcon,
};

const configFileMap: Record<string, { bg: string; label: string }> = {
  '.htaccess': { bg: '#009639', label: 'APE' },
  '.htpasswd': { bg: '#009639', label: 'APE' },
  '.nvmrc': { bg: '#4EAA25', label: 'NVM' },
  '.editorconfig': { bg: '#888', label: 'EC' },
  '.prettierrc': { bg: '#F7B93E', label: 'FMT' },
  '.eslintrc': { bg: '#4B32C3', label: 'ESL' },
};

export const FileIcon = ({ filename, isDirectory }: FileIconProps) => {
  if (isDirectory) {
    return <Folder className="h-5 w-5 text-accent" />;
  }

  const baseName = filename.split('/').pop() || filename;

  // Check special component icons
  const SpecialComp = specialFileMap[baseName];
  if (SpecialComp) return <SpecialComp />;

  // Check special config icons
  const configStyle = configFileMap[baseName];
  if (configStyle) return <ConfigIcon {...configStyle} />;

  const ext = baseName.includes('.') ? baseName.split('.').pop()?.toLowerCase() || '' : '';

  // Language logo icons
  const IconComp = extToIcon[ext];
  if (IconComp) return <IconComp />;

  // Archives
  const archStyle = archiveStyles[ext];
  if (archStyle) return <ArchiveIcon {...archStyle} />;

  // Markup / data
  if (markupExts.has(ext)) return <MarkupIcon />;

  return <DefaultFileIcon />;
};
