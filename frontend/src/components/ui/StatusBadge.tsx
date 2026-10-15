interface StatusBadgeProps {
  status: 'online' | 'analyzing' | 'complete' | 'error' | 'warning' | 'idle';
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const configs = {
    online:    { dot: '#10B981', dotShadow: 'rgba(16,185,129,0.7)', text: '#34D399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  label: label || 'ONLINE',    pulse: true },
    analyzing: { dot: '#22D3EE', dotShadow: 'rgba(34,211,238,0.7)', text: '#22D3EE', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.2)',  label: label || 'ANALYZING', pulse: true },
    complete:  { dot: '#10B981', dotShadow: 'rgba(16,185,129,0.5)', text: '#34D399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  label: label || 'COMPLETE',  pulse: false },
    error:     { dot: '#EF4444', dotShadow: 'rgba(239,68,68,0.6)',  text: '#FC8181', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',   label: label || 'ERROR',     pulse: false },
    warning:   { dot: '#F59E0B', dotShadow: 'rgba(245,158,11,0.6)', text: '#FCD34D', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',  label: label || 'WARNING',   pulse: false },
    idle:      { dot: '#4A5E72', dotShadow: 'transparent',          text: '#7A90A8', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', label: label || 'IDLE',     pulse: false },
  };

  const c = configs[status];
  const textSize = size === 'sm' ? '10px' : '11px';
  const dotSize = size === 'sm' ? '5px' : '6px';

  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono font-medium"
      style={{
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        borderRadius: '999px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: textSize,
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: c.dot,
          boxShadow: `0 0 5px ${c.dotShadow}`,
          flexShrink: 0,
          animation: c.pulse ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
        }}
      />
      {c.label}
    </span>
  );
}
