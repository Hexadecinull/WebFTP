// File Icon component — uses real language logos from /logos/ where available,
// falls back to custom SVG icons for everything else.

import { Folder } from 'lucide-react';

interface FileIconProps {
  filename: string;
  isDirectory: boolean;
  className?: string;
}

// Real logo images served from public/logos/
const LOGO_MAP: Record<string, string> = {
  // Bash / Shell
  sh: '/logos/Bash.svg', bash: '/logos/Bash.svg', zsh: '/logos/Bash.svg',
  fish: '/logos/Bash.svg', ksh: '/logos/Bash.svg',
  // C family
  c: '/logos/C.svg', h: '/logos/C.svg',
  cpp: '/logos/cpp.svg', cxx: '/logos/cpp.svg', cc: '/logos/cpp.svg',
  hpp: '/logos/cpp.svg', hxx: '/logos/cpp.svg',
  cs: '/logos/csharp.svg',
  // CMake
  cmake: '/logos/CMake.svg',
  // CSS
  css: '/logos/CSS3.svg', scss: '/logos/CSS3.svg',
  sass: '/logos/CSS3.svg', less: '/logos/CSS3.svg',
  // Dart
  dart: '/logos/Dart.svg',
  // Go
  go: '/logos/Go.svg',
  // HTML
  html: '/logos/HTML5.svg', htm: '/logos/HTML5.svg', xhtml: '/logos/HTML5.svg',
  // Java
  java: '/logos/Java.svg', jar: '/logos/Java.svg',
  // JavaScript
  js: '/logos/JavaScript.svg', mjs: '/logos/JavaScript.svg',
  cjs: '/logos/JavaScript.svg', jsx: '/logos/JavaScript.svg',
  // Lua
  lua: '/logos/Lua.svg',
  // Markdown
  md: '/logos/Markdown.svg', markdown: '/logos/Markdown.svg', mdx: '/logos/Markdown.svg',
  // PHP
  php: '/logos/PHP.svg', phtml: '/logos/PHP.svg',
  // Python
  py: '/logos/Python.svg', pyw: '/logos/Python.svg', pyx: '/logos/Python.svg',
  // Rust
  rs: '/logos/Rust.svg',
  // SQL
  sql: '/logos/SQL.svg', ddl: '/logos/SQL.svg', dml: '/logos/SQL.svg',
  // Svelte
  svelte: '/logos/Svelte.svg',
  // TypeScript
  ts: '/logos/Typescript.svg', tsx: '/logos/Typescript.svg',
  // Vue
  vue: '/logos/Vue.svg',
  // WebAssembly
  wasm: '/logos/WebAssembly.svg', wat: '/logos/WebAssembly.svg',
};

// Special full filenames that map to logos
const SPECIAL_LOGO_MAP: Record<string, string> = {
  'Dockerfile': '/logos/Dockerfile.svg',
  '.gitignore': '/logos/Git.svg',
  '.gitattributes': '/logos/Git.svg',
  '.gitmodules': '/logos/Git.svg',
  '.gitkeep': '/logos/Git.svg',
  'CMakeLists.txt': '/logos/CMake.svg',
};

// ── Fallback SVG icons for types without logos ──────────────────────────

const ReactIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#20232A" />
    <g transform="translate(10,10)" stroke="#61DAFB" strokeWidth="0.8" fill="none">
      <ellipse rx="7" ry="2.8" />
      <ellipse rx="7" ry="2.8" transform="rotate(60)" />
      <ellipse rx="7" ry="2.8" transform="rotate(120)" />
      <circle r="1.2" fill="#61DAFB" stroke="none" />
    </g>
  </svg>
);

const KotlinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
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

const SwiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="4" fill="#FA7343" />
    <path d="M14 5.5s-3 3-6 4.5c2 1 4 1 6 .5-1 2.5-3.5 4-6.5 4 3-1.5 5-4 5.5-5.5C11 10.5 8 12 5.5 11c3-1 5.5-3.5 7-5.5" fill="#fff" />
  </svg>
);

const ScalaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#DC322F" />
    <path d="M6 5h8c0 0 0 2-4 2.5S6 10 6 10h8c0 0 0 2-4 2.5S6 15 6 15" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const RubyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#CC342D" />
    <polygon points="10,4 15,7 14,14 6,14 5,7" fill="#fff" fillOpacity="0.9" />
  </svg>
);

const ShellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#2D3436" />
    <path d="M5 7l3.5 3L5 13" stroke="#4EAA25" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="13" x2="15" y2="13" stroke="#4EAA25" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const RLangIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#276DC3" />
    <text x="10" y="11.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="11" fontWeight="700" fontFamily="serif" fontStyle="italic">R</text>
  </svg>
);

const HaskellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#5D4F85" />
    <path d="M3 15l4-5-4-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 15l4-5-4-5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="8.5" x2="17" y2="8.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="13" y1="11.5" x2="17" y2="11.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ElixirIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#6E4A7E" />
    <path d="M10 4c-2 3-4 5-4 8a4 4 0 008 0c0-3-2-5-4-8z" fill="#fff" fillOpacity="0.85" />
  </svg>
);

const ZigIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#F7A41D" />
    <polygon points="5,6 15,6 7,14 15,14" fill="none" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const AstroIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#17191E" />
    <path d="M7 15l1-8h4l1 8-2-2h-2l-2 2z" fill="#FF5D01" />
    <circle cx="10" cy="11" r="1" fill="#17191E" />
  </svg>
);

const PowerShellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#012456" />
    <path d="M5 7l4.5 3L5 13" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="11" y1="13" x2="15" y2="13" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const PerlIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#39457E" />
    <text x="10" y="11.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="9" fontWeight="700" fontFamily="sans-serif">Perl</text>
  </svg>
);

const MarkupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="hsl(210 15% 30%)" />
    <text x="10" y="11" textAnchor="middle" dominantBaseline="central" fill="hsl(210 30% 80%)" fontSize="9" fontWeight="700" fontFamily="ui-monospace, monospace">{'<>'}</text>
  </svg>
);

const ArchiveIcon = ({ bg, label }: { bg: string; label: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill={bg} />
    <rect x="6" y="4" width="8" height="4" rx="1" fill="#fff" fillOpacity="0.3" />
    <rect x="8" y="5.5" width="4" height="1.5" rx="0.5" fill="#fff" fillOpacity="0.6" />
    <path d="M6 8v7a1 1 0 001 1h6a1 1 0 001-1V8" fill="#fff" fillOpacity="0.15" />
    <text x="10" y="13.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="4" fontWeight="700" fontFamily="ui-monospace, monospace">{label}</text>
  </svg>
);

const DockerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#2496ED" />
    <g fill="#fff">
      <rect x="4" y="9" width="2.2" height="2" rx="0.3" />
      <rect x="6.8" y="9" width="2.2" height="2" rx="0.3" />
      <rect x="9.6" y="9" width="2.2" height="2" rx="0.3" />
      <rect x="6.8" y="6.5" width="2.2" height="2" rx="0.3" />
      <rect x="9.6" y="6.5" width="2.2" height="2" rx="0.3" />
      <rect x="9.6" y="4" width="2.2" height="2" rx="0.3" />
    </g>
  </svg>
);

const NpmIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#CB3837" />
    <rect x="4" y="6" width="12" height="8" fill="#fff" />
    <rect x="6" y="8" width="3" height="4" fill="#CB3837" />
    <rect x="10" y="6" width="2" height="6" fill="#CB3837" />
  </svg>
);

const LicenseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="#333" />
    <text x="10" y="10.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="5.5" fontWeight="700" fontFamily="sans-serif">§</text>
  </svg>
);

const DefaultFileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="2" fill="hsl(220 10% 50%)" />
    <rect x="5" y="5" width="10" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
    <rect x="5" y="8.5" width="8" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
    <rect x="5" y="12" width="10" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
  </svg>
);

const archiveStyles: Record<string, { bg: string; label: string }> = {
  zip: { bg: '#E8A83C', label: 'ZIP' },
  tar: { bg: '#D4782F', label: 'TAR' },
  gz: { bg: '#D4782F', label: 'GZ' },
  bz2: { bg: '#D4782F', label: 'BZ2' },
  xz: { bg: '#D4782F', label: 'XZ' },
  rar: { bg: '#6C2D82', label: 'RAR' },
  '7z': { bg: '#4A90D9', label: '7Z' },
  tgz: { bg: '#D4782F', label: 'TGZ' },
};

const markupExts = new Set(['json','jsonc','xml','svg','yml','yaml','toml','ini','conf','cfg','properties','env']);

const specialFallbackMap: Record<string, () => JSX.Element> = {
  'docker-compose.yml': DockerIcon,
  'docker-compose.yaml': DockerIcon,
  '.npmrc': NpmIcon,
  'package.json': NpmIcon,
  'package-lock.json': NpmIcon,
  LICENSE: LicenseIcon,
  'LICENSE.md': LicenseIcon,
  'LICENSE.txt': LicenseIcon,
};

const extFallbackMap: Record<string, () => JSX.Element> = {
  jsx: ReactIcon, tsx: ReactIcon,
  kt: KotlinIcon, kts: KotlinIcon,
  swift: SwiftIcon,
  scala: ScalaIcon, sc: ScalaIcon,
  rb: RubyIcon, rake: RubyIcon, gemspec: RubyIcon, erb: RubyIcon,
  r: RLangIcon, rmd: RLangIcon,
  hs: HaskellIcon, lhs: HaskellIcon,
  ex: ElixirIcon, exs: ElixirIcon, erl: ElixirIcon,
  zig: ZigIcon,
  astro: AstroIcon,
  ps1: PowerShellIcon, psm1: PowerShellIcon, psd1: PowerShellIcon,
  pl: PerlIcon, pm: PerlIcon,
};

export const FileIcon = ({ filename, isDirectory }: FileIconProps) => {
  if (isDirectory) return <Folder className="h-5 w-5 text-accent" />;

  const baseName = filename.split('/').pop() || filename;
  const ext = baseName.includes('.') ? baseName.split('.').pop()?.toLowerCase() || '' : '';

  // Real logo image
  const logoPath = SPECIAL_LOGO_MAP[baseName] || LOGO_MAP[ext];
  if (logoPath) {
    return <img src={logoPath} alt={ext} className="h-5 w-5 object-contain" />;
  }

  // Fallback SVG components for files without real logos
  const SpecialComp = specialFallbackMap[baseName];
  if (SpecialComp) return <SpecialComp />;

  const FallbackComp = extFallbackMap[ext];
  if (FallbackComp) return <FallbackComp />;

  // Archives
  const archStyle = archiveStyles[ext];
  if (archStyle) return <ArchiveIcon {...archStyle} />;

  // Markup / data
  if (markupExts.has(ext)) return <MarkupIcon />;

  return <DefaultFileIcon />;
};
