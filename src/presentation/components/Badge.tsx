/**
 * Badge – semantic status pill.
 *
 * Usage:
 *   <Badge status="resolved">Resolved</Badge>
 *   <Badge variant="demo">DEMO</Badge>
 */
import React from 'react';

type BadgeStatus = 'received' | 'review' | 'progress' | 'resolved' | 'duplicate' | 'rejected' | 'demo' | 'pink';

interface BadgeProps {
  status?: BadgeStatus;
  children: React.ReactNode;
  className?: string;
}

const statusClass: Record<BadgeStatus, string> = {
  received:  'badge badge-received',
  review:    'badge badge-review',
  progress:  'badge badge-progress',
  resolved:  'badge badge-resolved',
  duplicate: 'badge badge-duplicate',
  rejected:  'badge badge-rejected',
  demo:      'badge badge-duplicate',
  pink:      'badge badge-pastel-pink',
};

export const Badge: React.FC<BadgeProps> = ({
  status = 'received',
  children,
  className = '',
}) => (
  <span className={`${statusClass[status]} ${className}`}>
    {children}
  </span>
);
