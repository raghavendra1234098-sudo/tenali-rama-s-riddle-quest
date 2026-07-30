import { motion } from 'framer-motion';
import { LevelCard } from './LevelCard';
import { Trophy, MapPin } from 'lucide-react';

interface LevelMapProps {
  currentLevel: number;
  unlockedLevels: number[];
  completedLevels: number[];
  onLevelSelect: (level: number) => void;
}

export const LevelMap = ({ currentLevel, unlockedLevels, completedLevels, onLevelSelect }: LevelMapProps) => {
  const totalLevels = 1000;
  const levels = Array.from({ length: totalLevels }, (_, i) => i + 1);
  const progress = (completedLevels.length / totalLevels) * 100;

  const handleLevelClick = (level: number) => {
    onLevelSelect(level);
  };

  return (
    <div className="relative">
      {/* Progress Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gold text-shadow-gold mb-2 flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6" />
          Empire Map
          <MapPin className="w-6 h-6" />
        </h2>
        <p className="text-muted-foreground mb-4">
          Conquer all 1000 levels to claim the Royal Jackpot!
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gold mb-1">
            <span>{completedLevels.length} / {totalLevels} Conquered</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden border border-gold/30">
            <motion.div 
              className="h-full gradient-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Level Grid */}
      <div className="max-h-[50vh] overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-transparent">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
          {levels.map((level) => (
            <LevelCard
              key={level}
              level={level}
              isUnlocked={unlockedLevels.includes(level)}
              isCompleted={completedLevels.includes(level)}
              isCurrent={level === currentLevel}
              onClick={() => handleLevelClick(level)}
            />
          ))}
        </div>
      </div>

      {/* Jackpot Indicator */}
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-ornate">
          <Trophy className="w-6 h-6 text-gold animate-float" />
          <span className="text-gold font-bold">
            Level 1000 Jackpot: 1,00,000 Virtual Coins!
          </span>
          <Trophy className="w-6 h-6 text-gold animate-float" />
        </div>
      </motion.div>
    </div>
  );
};
