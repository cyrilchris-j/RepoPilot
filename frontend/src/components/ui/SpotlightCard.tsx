import React, { useRef, useState } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(59, 130, 246, 0.15)',
  borderColor = 'rgba(255, 255, 255, 0.12)',
  style,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setOpacity(1);
  };

  const handleBlur = () => {
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-[28px] overflow-hidden transition-all duration-300 ${className}`}
      style={{
        background: 'rgba(12, 14, 20, 0.72)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        ...style,
      }}
      {...props}
    >
      {/* Specular spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(550px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 45%)`,
        }}
      />
      {/* Subtle border highlight follow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-[28px]"
        style={{
          opacity,
          border: `1px solid ${borderColor}`,
          maskImage: `radial-gradient(240px circle at ${position.x}px ${position.y}px, black 30%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(240px circle at ${position.x}px ${position.y}px, black 30%, transparent 80%)`,
        }}
      />
      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
