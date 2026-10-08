/**
 * Button – primary / secondary / danger / ghost variants.
 * Press animation via motion. Respects disabled state.
 *
 * Usage:
 *   <Button variant="primary" onClick={…}>Submit</Button>
 *   <Button variant="danger" disabled>Delete</Button>
 */
import React from 'react';
import { motion } from 'motion/react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'pink' | 'pink-primary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:      'btn-primary',
  secondary:    'btn-secondary',
  danger:       'btn-primary',   // uses primary class but overrides colour inline
  ghost:        'btn-secondary',
  pink:         'btn-pink',
  'pink-primary': 'btn-pink-primary',
};

const dangerStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #6e121f, #991b1b)',
  boxShadow: '0 4px 12px rgba(110, 18, 31, 0.28)',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  fullWidth = false,
  disabled,
  style,
  className = '',
  ...rest
}) => {
  const cls = variantClass[variant];
  const extraStyle: React.CSSProperties = {
    ...(variant === 'danger' ? dangerStyle : {}),
    ...(fullWidth ? { width: '100%' } : {}),
    ...style,
  };

  return (
    <motion.button
      className={`${cls} ${className}`}
      style={extraStyle}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  );
};
