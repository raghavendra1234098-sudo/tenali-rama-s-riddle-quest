import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, ArrowRight, Star } from 'lucide-react';
import { useEffect } from 'react';
import { soundService } from '@/lib/soundService';

interface VictoryModalProps {
  isOpen: boolean;
  level: number;
  coinsEarned: number;
  onContinue: () => void;
}

export const VictoryModal = ({ isOpen, level, coinsEarned, onContinue }: VictoryModalProps) => {
  useEffect(() => {
    if (isOpen) {
      soundService.play('fanfare');
      soundService.play('coins');
    }
  }, [isOpen]);

  const isMilestone = level % 50 === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            className="gradient-card rounded-2xl border-ornate p-8 max-w-md w-full text-center relative overflow-hidden"
          >
            {/* Sparkle Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gold rounded-full"
                  initial={{ 
                    x: Math.random() * 100 + '%', 
                    y: '100%',
                    opacity: 0 
                  }}
                  animate={{ 
                    y: '-20%',
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

            {/* Trophy Icon */}
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-4"
            >
              <Trophy className={`w-20 h-20 mx-auto ${isMilestone ? 'text-gold' : 'text-gold-light'} drop-shadow-lg`} />
            </motion.div>

            {/* Victory Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gold text-shadow-gold mb-2"
            >
              {isMilestone ? '🎉 MILESTONE! 🎉' : 'Victory!'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-6"
            >
              Level {level} Conquered!
            </motion.p>

            {/* Stars */}
            <motion.div 
              className="flex justify-center gap-2 mb-6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[1, 2, 3].map((star) => (
                <motion.div
                  key={star}
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.5 + star * 0.1 }}
                >
                  <Star className="w-8 h-8 text-gold fill-gold" />
                </motion.div>
              ))}
            </motion.div>

            {/* Coins Earned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-gold mb-6"
            >
              <Coins className="w-6 h-6 text-primary-foreground" />
              <span className="text-xl font-bold text-primary-foreground">
                +{coinsEarned} Coins
              </span>
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                variant="treasure"
                size="xl"
                onClick={onContinue}
                className="w-full"
              >
                Continue Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
