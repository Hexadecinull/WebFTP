// CodeMirror language extensions — 25+ languages
// Fix: @codemirror/legacy-modes has no /mode/index — each mode is its own file

import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { go } from '@codemirror/legacy-modes/mode/go';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { r } from '@codemirror/legacy-modes/mode/r';
import { perl } from '@codemirror/legacy-modes/mode/perl';
import { diff } from '@codemirror/legacy-modes/mode/diff';
import { dockerfile } from '@codemirror/legacy-modes/mode/dockerfile';
import { nginx } from '@codemirror/legacy-modes/mode/nginx';
import { kotlin, dart, scala } from '@codemirror/legacy-modes/mode/clike';
import { powershell } from '@codemirror/legacy-modes/mode/powershell';

export function getLanguageExtension(filename: string) {
  const base = filename.split('/').pop() || filename;
  const ext = base.includes('.') ? base.split('.').pop()?.toLowerCase() || '' : '';

  // Special filenames
  if (base === 'Dockerfile' || base.startsWith('Dockerfile.')) return StreamLanguage.define(dockerfile);
  if (base === 'nginx.conf' || base.endsWith('.nginx')) return StreamLanguage.define(nginx);
  if (base === 'Makefile' || base === 'CMakeLists.txt') return null;

  switch (ext) {
    // JavaScript / TypeScript
    case 'js': case 'mjs': case 'cjs':
      return javascript({ jsx: false });
    case 'jsx':
      return javascript({ jsx: true });
    case 'ts':
      return javascript({ typescript: true });
    case 'tsx':
      return javascript({ jsx: true, typescript: true });

    // Web
    case 'html': case 'htm': case 'xhtml':
      return html();
    case 'css': case 'less': case 'scss': case 'sass':
      return css();

    // Data / config
    case 'json': case 'jsonc': case 'json5':
      return json();
    case 'xml': case 'svg': case 'rss': case 'atom':
      return xml();
    case 'yml': case 'yaml':
      return StreamLanguage.define(yaml);
    case 'toml':
      return StreamLanguage.define(toml);
    case 'sql': case 'ddl': case 'dml':
      return sql();
    case 'md': case 'markdown': case 'mdx':
      return markdown();

    // Python
    case 'py': case 'pyw': case 'pyx':
      return python();

    // Rust
    case 'rs':
      return rust();

    // C family
    case 'c': case 'h': case 'cpp': case 'cxx': case 'cc':
    case 'hpp': case 'hxx': case 'h++':
      return cpp();
    case 'cs':
      return cpp(); // C# — cpp is closest available

    // Java / JVM
    case 'java':
      return java();
    case 'kt': case 'kts':
      return StreamLanguage.define(kotlin);
    case 'scala': case 'sc':
      return StreamLanguage.define(scala);
    case 'dart':
      return StreamLanguage.define(dart);

    // PHP
    case 'php': case 'php3': case 'php4': case 'php5': case 'phtml':
      return php();

    // Ruby
    case 'rb': case 'rake': case 'gemspec': case 'erb':
      return StreamLanguage.define(ruby);

    // Go
    case 'go':
      return StreamLanguage.define(go);

    // Shell
    case 'sh': case 'bash': case 'zsh': case 'fish': case 'ksh':
      return StreamLanguage.define(shell);
    case 'ps1': case 'psm1': case 'psd1':
      return StreamLanguage.define(powershell);

    // R
    case 'r': case 'rmd':
      return StreamLanguage.define(r);

    // Lua
    case 'lua':
      return StreamLanguage.define(lua);

    // Perl
    case 'pl': case 'pm':
      return StreamLanguage.define(perl);

    // Diff
    case 'diff': case 'patch':
      return StreamLanguage.define(diff);

    default:
      return null;
  }
}
