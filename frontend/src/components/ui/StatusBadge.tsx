interface StatusBadgeProps {
  status: 'online' | 'analyzing' | 'complete' | 'error' | 'warning' | 'idle';
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const configs = {
    online:    { dot: 'bg-success animate-pulse', text: 'text-success',      bg: 'bg-success/10',     label: label || 'ONLINE' },
    analyzing: { dot: 'bg-accent-cyan animate-pulse', text: 'text-accent-cyan', bg: 'bg-accent-cyan/10', label: label || 'ANALYZING' },
    complete:  { dot: 'bg-success',              text: 'text-success',      bg: 'bg-success/10',     label: label || 'COMPLETE' },
    error:     { dot: 'bg-error',                text: 'text-error',        bg: 'bg-error/10',       label: label || 'ERROR' },
    warning:   { dot: 'bg-warning',              text: 'text-warning',      bg: 'bg-warning/10',     label: label || 'WARNING' },
    idle:      { dot: 'bg-text-secondary',       text: 'text-text-secondary', bg: 'bg-elevated',     label: label || 'IDLE' },
  };

  const c = configs[status];
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const dotSize = size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${c.bg} ${textSize} font-mono font-medium ${c.text}`}>
      <span className={`${dotSize} rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
