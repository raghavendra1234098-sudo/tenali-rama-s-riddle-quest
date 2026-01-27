import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface OrnateFrameProps {
  children: ReactNode;
  className?: string;
  showCorners?: boolean;
}

export const OrnateFrame = ({ children, className = '', showCorners = true }: OrnateFrameProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Corner Ornaments */}
      {showCorners && (
        <>
          {/* Top Left */}
          <div className="absolute -top-2 -left-2 w-8 h-8">
            <svg viewBox="0 0 32 32" className="w-full h-full text-gold">
              <path
                d="M0 16 Q0 0 16 0 L16 4 Q4 4 4 16 Z"
                fill="currentColor"
              />
              <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          
          {/* Top Right */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rotate-90">
            <svg viewBox="0 0 32 32" className="w-full h-full text-gold">
              <path
                d="M0 16 Q0 0 16 0 L16 4 Q4 4 4 16 Z"
                fill="currentColor"
              />
              <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          
          {/* Bottom Left */}
          <div className="absolute -bottom-2 -left-2 w-8 h-8 -rotate-90">
            <svg viewBox="0 0 32 32" className="w-full h-full text-gold">
              <path
                d="M0 16 Q0 0 16 0 L16 4 Q4 4 4 16 Z"
                fill="currentColor"
              />
              <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          
          {/* Bottom Right */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rotate-180">
            <svg viewBox="0 0 32 32" className="w-full h-full text-gold">
              <path
                d="M0 16 Q0 0 16 0 L16 4 Q4 4 4 16 Z"
                fill="currentColor"
              />
              <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
        </>
      )}
      
      {children}
    </div>
  );
};

// Decorative divider component
export const RoyalDivider = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`}>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-gold" />
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="w-3 h-3 rounded-full bg-gold/30 border border-gold"
    />
    <div className="h-px flex-1 bg-gradient-to-r from-gold via-gold/50 to-transparent" />
  </div>
);

// Floating decorative elements
export const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-gold/20"
        style={{
          left: `${20 + i * 15}%`,
          top: `${10 + (i % 3) * 30}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.3,
        }}
      />
    ))}
  </div>
);
