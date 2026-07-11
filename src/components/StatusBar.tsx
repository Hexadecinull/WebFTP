// View Layer - Status Bar Component

interface StatusBarProps {
  totalItems: number;
  selectedCount: number;
  currentPath: string;
}

export const StatusBar = ({ totalItems, selectedCount, currentPath }: StatusBarProps) => {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-card text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-muted rounded-full">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
        <span className="text-muted-foreground/50">•</span>
        <span className="px-2 py-0.5 bg-muted rounded-full">
          {selectedCount} selected
        </span>
      </div>
      <span className="px-2 py-0.5 bg-muted rounded-full font-mono truncate max-w-xs" title={currentPath}>
        {currentPath}
      </span>
    </div>
  );
};
