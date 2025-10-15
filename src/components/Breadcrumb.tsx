// View Layer - Breadcrumb Navigation Component

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export const Breadcrumb = ({ path, onNavigate }: BreadcrumbProps) => {
  const segments = path.split('/').filter(Boolean);

  const buildPath = (index: number): string => {
    if (index === -1) return '/';
    return '/' + segments.slice(0, index + 1).join('/');
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={() => onNavigate('/')}
      >
        <Home className="h-3.5 w-3.5" />
      </Button>

      {segments.map((segment, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 font-mono"
            onClick={() => onNavigate(buildPath(index))}
          >
            {segment}
          </Button>
        </div>
      ))}
    </div>
  );
};
