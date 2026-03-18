// File Icon component - renders language/type-specific icons

import { Folder } from 'lucide-react';

interface FileIconProps {
  filename: string;
  isDirectory: boolean;
  className?: string;
}

// Color palette for language icons
const langColors: Record<string, { bg: string; fg: string; label: string }> = {
  // JavaScript / TypeScript
  js:     { bg: '#F7DF1E', fg: '#000', label: 'JS' },
  jsx:    { bg: '#61DAFB', fg: '#000', label: 'JSX' },
  ts:     { bg: '#3178C6', fg: '#fff', label: 'TS' },
  tsx:    { bg: '#3178C6', fg: '#fff', label: 'TSX' },
  mjs:    { bg: '#F7DF1E', fg: '#000', label: 'MJS' },
  // Python
  py:     { bg: '#3776AB', fg: '#FFD43B', label: 'PY' },
  // Java
  java:   { bg: '#ED8B00', fg: '#fff', label: 'JV' },
  jar:    { bg: '#ED8B00', fg: '#fff', label: 'JAR' },
  // C / C++ / C#
  c:      { bg: '#A8B9CC', fg: '#000', label: 'C' },
  h:      { bg: '#A8B9CC', fg: '#000', label: 'H' },
  cpp:    { bg: '#00599C', fg: '#fff', label: 'C++' },
  hpp:    { bg: '#00599C', fg: '#fff', label: 'H++' },
  cs:     { bg: '#68217A', fg: '#fff', label: 'C#' },
  // Rust
  rs:     { bg: '#DEA584', fg: '#000', label: 'RS' },
  // Go
  go:     { bg: '#00ADD8', fg: '#fff', label: 'GO' },
  // Ruby
  rb:     { bg: '#CC342D', fg: '#fff', label: 'RB' },
  // PHP
  php:    { bg: '#777BB4', fg: '#fff', label: 'PHP' },
  // Swift
  swift:  { bg: '#FA7343', fg: '#fff', label: 'SW' },
  // Kotlin
  kt:     { bg: '#7F52FF', fg: '#fff', label: 'KT' },
  kts:    { bg: '#7F52FF', fg: '#fff', label: 'KTS' },
  // Scala
  scala:  { bg: '#DC322F', fg: '#fff', label: 'SC' },
  // Dart / Flutter
  dart:   { bg: '#0175C2', fg: '#fff', label: 'DT' },
  // Lua
  lua:    { bg: '#000080', fg: '#fff', label: 'LUA' },
  // R
  r:      { bg: '#276DC3', fg: '#fff', label: 'R' },
  // Perl
  pl:     { bg: '#39457E', fg: '#fff', label: 'PL' },
  pm:     { bg: '#39457E', fg: '#fff', label: 'PM' },
  // Shell
  sh:     { bg: '#4EAA25', fg: '#fff', label: '$_' },
  bash:   { bg: '#4EAA25', fg: '#fff', label: '$_' },
  zsh:    { bg: '#4EAA25', fg: '#fff', label: '$_' },
  fish:   { bg: '#4EAA25', fg: '#fff', label: '$_' },
  // PowerShell
  ps1:    { bg: '#012456', fg: '#fff', label: 'PS' },
  // SQL
  sql:    { bg: '#e38c00', fg: '#fff', label: 'SQL' },
  // Haskell
  hs:     { bg: '#5D4F85', fg: '#fff', label: 'HS' },
  // Elixir
  ex:     { bg: '#6e4a7e', fg: '#fff', label: 'EX' },
  exs:    { bg: '#6e4a7e', fg: '#fff', label: 'EXS' },
  // Erlang
  erl:    { bg: '#B83998', fg: '#fff', label: 'ERL' },
  // Clojure
  clj:    { bg: '#5881D8', fg: '#fff', label: 'CLJ' },
  // Zig
  zig:    { bg: '#F7A41D', fg: '#000', label: 'ZIG' },
  // Nim
  nim:    { bg: '#FFE953', fg: '#000', label: 'NIM' },
  // V
  v:      { bg: '#5D87BF', fg: '#fff', label: 'V' },
  // Vue
  vue:    { bg: '#4FC08D', fg: '#fff', label: 'VUE' },
  // Svelte
  svelte: { bg: '#FF3E00', fg: '#fff', label: 'SV' },
  // Astro
  astro:  { bg: '#FF5D01', fg: '#fff', label: 'AS' },
  // CSS variants
  css:    { bg: '#1572B6', fg: '#fff', label: 'CSS' },
  scss:   { bg: '#CD6799', fg: '#fff', label: 'SCSS' },
  sass:   { bg: '#CD6799', fg: '#fff', label: 'SASS' },
  less:   { bg: '#1D365D', fg: '#fff', label: 'LESS' },
  // HTML
  html:   { bg: '#E34F26', fg: '#fff', label: 'HTML' },
  htm:    { bg: '#E34F26', fg: '#fff', label: 'HTM' },
  // Markdown
  md:       { bg: '#083FA1', fg: '#fff', label: 'MD' },
  markdown: { bg: '#083FA1', fg: '#fff', label: 'MD' },
  mdx:      { bg: '#083FA1', fg: '#fff', label: 'MDX' },
};

// Markup / data languages share <> icon style
const markupExts = new Set([
  'json', 'xml', 'yml', 'yaml', 'toml', 'ini', 'conf', 'cfg', 'properties', 'env',
]);

// Archive formats
const archiveColors: Record<string, { bg: string; fg: string; label: string }> = {
  zip:  { bg: '#E8A83C', fg: '#fff', label: 'ZIP' },
  tar:  { bg: '#D4782F', fg: '#fff', label: 'TAR' },
  gz:   { bg: '#D4782F', fg: '#fff', label: 'GZ' },
  bz2:  { bg: '#D4782F', fg: '#fff', label: 'BZ2' },
  xz:   { bg: '#D4782F', fg: '#fff', label: 'XZ' },
  rar:  { bg: '#6C2D82', fg: '#fff', label: 'RAR' },
  '7z': { bg: '#4A90D9', fg: '#fff', label: '7Z' },
};

// Special config files
const specialFiles: Record<string, { bg: string; fg: string; label: string }> = {
  '.gitignore':     { bg: '#F05032', fg: '#fff', label: 'GIT' },
  '.gitmodules':    { bg: '#F05032', fg: '#fff', label: 'GIT' },
  '.gitattributes': { bg: '#F05032', fg: '#fff', label: 'GIT' },
  '.gitkeep':       { bg: '#F05032', fg: '#fff', label: 'GIT' },
  '.htaccess':      { bg: '#009639', fg: '#fff', label: 'APE' },
  '.htpasswd':      { bg: '#009639', fg: '#fff', label: 'APE' },
  '.npmrc':         { bg: '#CB3837', fg: '#fff', label: 'NPM' },
  '.nvmrc':         { bg: '#4EAA25', fg: '#fff', label: 'NVM' },
  '.editorconfig':  { bg: '#FEFEFE', fg: '#000', label: 'EC' },
  '.prettierrc':    { bg: '#F7B93E', fg: '#000', label: 'FMT' },
  '.eslintrc':      { bg: '#4B32C3', fg: '#fff', label: 'ESL' },
  'Dockerfile':     { bg: '#2496ED', fg: '#fff', label: 'DKR' },
  'docker-compose.yml': { bg: '#2496ED', fg: '#fff', label: 'DKR' },
  'Makefile':       { bg: '#6D8086', fg: '#fff', label: 'MK' },
  'CMakeLists.txt': { bg: '#064F8C', fg: '#fff', label: 'CM' },
  'LICENSE':        { bg: '#333', fg: '#fff', label: 'LIC' },
  'README.md':      { bg: '#083FA1', fg: '#fff', label: 'MD' },
};

const IconBase = ({ bg, fg, label }: { bg: string; fg: string; label: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="0" width="18" height="20" rx="3" fill={bg} />
    <text
      x="10"
      y="10.5"
      textAnchor="middle"
      dominantBaseline="central"
      fill={fg}
      fontSize={label.length > 3 ? '5' : label.length > 2 ? '5.5' : '7'}
      fontWeight="700"
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
    >
      {label}
    </text>
  </svg>
);

const MarkupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="0" width="18" height="20" rx="3" fill="hsl(210 15% 30%)" />
    <text
      x="10"
      y="10.5"
      textAnchor="middle"
      dominantBaseline="central"
      fill="hsl(210 30% 80%)"
      fontSize="9"
      fontWeight="700"
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
    >
      {'<>'}
    </text>
  </svg>
);

const DefaultFileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
    <rect x="1" y="0" width="18" height="20" rx="3" fill="hsl(220 10% 50%)" />
    <rect x="5" y="5" width="10" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
    <rect x="5" y="8.5" width="8" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
    <rect x="5" y="12" width="10" height="1.5" rx="0.5" fill="hsl(220 10% 75%)" />
  </svg>
);

export const FileIcon = ({ filename, isDirectory }: FileIconProps) => {
  if (isDirectory) {
    return <Folder className="h-5 w-5 text-accent" />;
  }

  const baseName = filename.split('/').pop() || filename;

  // Check special files first
  const special = specialFiles[baseName];
  if (special) return <IconBase {...special} />;

  const ext = baseName.includes('.') ? baseName.split('.').pop()?.toLowerCase() || '' : '';

  // Check language-specific
  const lang = langColors[ext];
  if (lang) return <IconBase {...lang} />;

  // Check archives
  const archive = archiveColors[ext];
  if (archive) return <IconBase {...archive} />;

  // Check markup / data
  if (markupExts.has(ext)) return <MarkupIcon />;

  // Default
  return <DefaultFileIcon />;
};
