import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import splashImage from '@/assets/splash-screen.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      {/* Splash Image */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full h-full flex items-center justify-center p-4"
      >
        <img
          src={splashImage}
          alt="Tenali Rama: Wisdom & Wit"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        />
      </motion.div>

      {/* Loading Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64"
      >
        <div className="h-2 bg-muted rounded-full overflow-hidden border border-gold/30">
          <motion.div
            className="h-full bg-gradient-to-r from-gold via-amber-glow to-gold"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <p className="text-center text-gold text-sm mt-2 font-medium">
          Loading... {progress}%
        </p>
      </motion.div>
    </motion.div>
  );
};
