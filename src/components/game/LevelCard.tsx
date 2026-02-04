import { motion } from 'framer-motion';
import { Lock, CheckCircle, Crown, Star, Sparkles } from 'lucide-react';

interface LevelCardProps {
  level: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  isPremiumLevel?: boolean;
  isPremiumUser?: boolean;
  onClick: () => void;
}

export const LevelCard = ({ level, isUnlocked, isCompleted, isCurrent, isPremiumLevel = false, isPremiumUser = false, onClick }: LevelCardProps) => {
  const isMilestone = level % 50 === 0;
  const isMinorMilestone = level % 10 === 0 && !isMilestone;
  const isLocked = isPremiumLevel && !isPremiumUser;

  return (
    <motion.button
      onClick={onClick}
      disabled={!isUnlocked && !isLocked}
      whileHover={(isUnlocked || isLocked) ? { scale: 1.1, y: -5 } : {}}
      whileTap={(isUnlocked || isLocked) ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (level % 20) * 0.02 }}
      className={`
        relative w-14 h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center
        font-royal font-bold text-sm md:text-base transition-all duration-300
        ${isLocked
          ? 'bg-purple-900/50 border border-purple-500/50 text-purple-300 cursor-pointer hover:border-purple-400'
          : isCompleted 
            ? 'gradient-gold text-primary-foreground shadow-gold' 
            : isCurrent 
              ? 'bg-crimson border-2 border-gold text-gold animate-pulse-gold' 
              : isUnlocked 
                ? 'bg-muted border border-gold/50 text-gold hover:border-gold hover:shadow-gold' 
                : 'bg-muted/50 border border-muted-foreground/20 text-muted-foreground cursor-not-allowed'
        }
        ${isMilestone ? 'ring-2 ring-gold ring-offset-2 ring-offset-background' : ''}
      `}
    >
      {/* Level Number or Icon */}
      {isLocked ? (
        <Lock className="w-5 h-5 text-purple-400" />
      ) : isCompleted ? (
        <CheckCircle className="w-6 h-6" />
      ) : !isUnlocked ? (
        <Lock className="w-5 h-5" />
      ) : (
        <span>{level}</span>
      )}

      {/* Premium Genius Badge */}
      {isLocked && (
        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-purple-400" />
      )}

      {/* Milestone Crown */}
      {isMilestone && !isLocked && (
        <Crown className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-gold" />
      )}

      {/* Minor Milestone Star */}
      {isMinorMilestone && (
        <Star className="absolute -top-1 -right-1 w-3 h-3 text-gold fill-gold" />
      )}

      {/* Current Level Indicator */}
      {isCurrent && isUnlocked && !isCompleted && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}
    </motion.button>
  );
};
