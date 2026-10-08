/**
 * Skeleton – shimmer placeholder for loading states.
 *
 * Usage:
 *   <Skeleton width="100%" height="1.2rem" />
 *   <Skeleton circle size={48} />
 */
import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  circle = false,
  size,
  className = '',
  style,
}) => {
  const computedStyle: React.CSSProperties = circle && size
    ? { width: size, height: size, borderRadius: '50%', ...style }
    : { width, height, ...style };

  return (
    <div
      className={`skeleton ${className}`}
      style={computedStyle}
      aria-hidden="true"
    />
  );
};

/** Convenience: a multi-line text skeleton block */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 ? '65%' : '100%'}
        height="0.9rem"
      />
    ))}
  </div>
);
