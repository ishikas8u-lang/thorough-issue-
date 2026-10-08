/**
 * Card – glass-morphic surface with optional hover-lift.
 *
 * Usage:
 *   <Card>…</Card>
 *   <Card glass hover className="my-extra-class">…</Card>
 */
import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  glass?: boolean;
  hover?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = false,
  hover = true,
  className = '',
  style,
  onClick,
}) => {
  const baseClass = glass ? 'glass-card' : 'service-card';

  return (
    <motion.div
      className={`${baseClass} ${className}`}
      style={style}
      onClick={onClick}
      whileHover={hover ? { y: -5, boxShadow: 'var(--shadow-lg)' } : undefined}
      whileTap={hover ? { scale: 0.985 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      {children}
    </motion.div>
  );
};
