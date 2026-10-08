/**
 * Reveal – fade-up-on-scroll wrapper using motion IntersectionObserver.
 * Automatically disables heavy animation when prefers-reduced-motion is set.
 *
 * Usage:
 *   <Reveal>
 *     <SomeContent />
 *   </Reveal>
 *   <Reveal delay={0.15} y={30}>…</Reveal>
 */
import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  /** Vertical travel distance in px (default 24) */
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  y = 24,
  className,
  style,
}) => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? {} : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: reduced ? 0 : 0.55,
        delay: reduced ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};
