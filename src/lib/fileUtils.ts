// Utility functions for file operations

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function getFileName(path: string): string {
  return path.split('/').filter(Boolean).pop() || path;
}

export function isEditableFile(filename: string): boolean {
  const editableExtensions = [
    'txt', 'md', 'json', 'xml', 'html', 'htm', 'css', 'js', 'ts', 'tsx', 'jsx',
    'py', 'java', 'cpp', 'c', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift',
    'kt', 'scala', 'sh', 'bash', 'yml', 'yaml', 'toml', 'ini', 'conf', 'cfg',
    'log', 'sql', 'env', 'gitignore', 'dockerfile', 'makefile', 'cmake', 'gradle',
    'properties', 'vue', 'svelte', 'astro', 'r', 'lua', 'pl', 'pm', 'tcl'
  ];
  
  const ext = getFileExtension(filename);
  return editableExtensions.includes(ext) || !ext.match(/^(exe|dll|so|dylib|bin|dat|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|tar|gz|rar|7z|png|jpg|jpeg|gif|bmp|ico|svg|mp3|mp4|avi|mov|wmv|flv|mkv|webm|ogg|wav|flac)$/i);
}

const ARCHIVE_EXTENSIONS = ['zip', 'tar', 'gz', 'tgz', 'rar', '7z', 'bz2', 'xz'];
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'ico', 'bmp'];
const VIDEO_EXTENSIONS = ['mp4', 'mkv', 'webm', 'mov', 'avi', 'm4v'];
const AUDIO_EXTENSIONS = ['mp3', 'ogg', 'wav', 'm4a', 'opus', 'flac', 'aac'];

export function isArchiveFile(filename: string): boolean {
  return ARCHIVE_EXTENSIONS.includes(getFileExtension(filename));
}

export function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.includes(getFileExtension(filename));
}

export function isVideoFile(filename: string): boolean {
  return VIDEO_EXTENSIONS.includes(getFileExtension(filename));
}

export function isAudioFile(filename: string): boolean {
  return AUDIO_EXTENSIONS.includes(getFileExtension(filename));
}

export function isMediaFile(filename: string): boolean {
  return isImageFile(filename) || isVideoFile(filename) || isAudioFile(filename);
}
