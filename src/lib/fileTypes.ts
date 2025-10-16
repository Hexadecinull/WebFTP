// File type detection utility

export function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    // Programming
    'js': 'JavaScript File',
    'jsx': 'JavaScript React File',
    'ts': 'TypeScript File',
    'tsx': 'TypeScript React File',
    'py': 'Python File',
    'java': 'Java Source File',
    'cpp': 'C++ Source File',
    'c': 'C Source File',
    'h': 'C Header File',
    'hpp': 'C++ Header File',
    'cs': 'C# Source File',
    'php': 'PHP File',
    'rb': 'Ruby File',
    'go': 'Go Source File',
    'rs': 'Rust Source File',
    'swift': 'Swift Source File',
    'kt': 'Kotlin File',
    'scala': 'Scala File',
    'sh': 'Shell Script',
    'bash': 'Bash Script',
    'r': 'R Script',
    'lua': 'Lua Script',
    'pl': 'Perl Script',
    'pm': 'Perl Module',
    'tcl': 'TCL Script',
    
    // Web
    'html': 'HTML Document',
    'htm': 'HTML Document',
    'css': 'CSS Source File',
    'scss': 'SCSS File',
    'sass': 'SASS File',
    'less': 'LESS File',
    'vue': 'Vue Component',
    'svelte': 'Svelte Component',
    'astro': 'Astro Component',
    
    // Data/Config
    'json': 'JSON File',
    'xml': 'XML File',
    'yml': 'YAML File',
    'yaml': 'YAML File',
    'toml': 'TOML File',
    'ini': 'INI Configuration',
    'conf': 'Configuration File',
    'cfg': 'Configuration File',
    'env': 'Environment Variables',
    'sql': 'SQL File',
    'properties': 'Properties File',
    
    // Documents
    'md': 'Markdown Document',
    'txt': 'Text Document',
    'log': 'Log File',
    'csv': 'CSV File',
    'pdf': 'PDF Document',
    'doc': 'Word Document',
    'docx': 'Word Document',
    'xls': 'Excel Spreadsheet',
    'xlsx': 'Excel Spreadsheet',
    'ppt': 'PowerPoint Presentation',
    'pptx': 'PowerPoint Presentation',
    
    // Build/Project
    'gitignore': 'Git Ignore File',
    'dockerfile': 'Docker File',
    'makefile': 'Make File',
    'cmake': 'CMake File',
    'gradle': 'Gradle Build File',
    
    // Images
    'png': 'PNG Image',
    'jpg': 'JPEG Image',
    'jpeg': 'JPEG Image',
    'gif': 'GIF Image',
    'bmp': 'Bitmap Image',
    'ico': 'Icon File',
    'svg': 'SVG Vector Image',
    'webp': 'WebP Image',
    
    // Archives
    'zip': 'ZIP Archive',
    'tar': 'TAR Archive',
    'gz': 'GZIP Archive',
    'rar': 'RAR Archive',
    '7z': '7-Zip Archive',
    
    // Binaries
    'exe': 'Executable File',
    'dll': 'Dynamic Link Library',
    'so': 'Shared Object',
    'dylib': 'Dynamic Library',
    'bin': 'Binary File',
    'dat': 'Data File',
    
    // Media
    'mp3': 'MP3 Audio',
    'mp4': 'MP4 Video',
    'avi': 'AVI Video',
    'mov': 'QuickTime Video',
    'wmv': 'Windows Media Video',
    'flv': 'Flash Video',
    'mkv': 'Matroska Video',
    'webm': 'WebM Video',
    'ogg': 'OGG Media',
    'wav': 'Wave Audio',
    'flac': 'FLAC Audio',
  };
  
  return typeMap[ext || ''] || 'File';
}
