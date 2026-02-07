import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, ShoppingCart, Trophy, Sparkles, Timer, Crown } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

interface HomeScreenProps {
  onStartGame: () => void;
  onOpenStore: () => void;
  onOpenLevels: () => void;
  onOpenTimerChallenge?: () => void;
  currentLevel: number;
  completedLevels: number;
  isPro?: boolean;
}

export const HomeScreen = ({
  onStartGame,
  onOpenStore,
  onOpenLevels,
  onOpenTimerChallenge,
  currentLevel,
  completedLevels,
  isPro = false,
}: HomeScreenProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-12 h-12 text-gold mx-auto mb-4" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gold text-shadow-gold mb-2 font-royal">
            తెనాలి రామ
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gold-light mb-4 font-royal">
            Royal Riddler 1000
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto font-telugu">
            మీ బుద్ధిని పరీక్షించండి • Test Your Wit
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="gradient-card border-ornate rounded-2xl p-6 mb-8 text-center"
        >
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-gold">{currentLevel}</p>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>
            <div className="w-px bg-gold/30" />
            <div>
              <p className="text-3xl font-bold text-gold">{completedLevels}</p>
              <p className="text-sm text-muted-foreground">Conquered</p>
            </div>
            <div className="w-px bg-gold/30" />
            <div>
              <p className="text-3xl font-bold text-gold">1000</p>
              <p className="text-sm text-muted-foreground">Total Levels</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <Button
            variant="treasure"
            size="xl"
            onClick={onStartGame}
            className="w-full"
          >
            <Play className="w-6 h-6 mr-2" />
            Play Now
          </Button>

          {/* Timer Challenge - Pro Feature */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Button
              variant={isPro ? "royal" : "royalOutline"}
              size="lg"
              onClick={onOpenTimerChallenge}
              className="w-full"
            >
              <Timer className="w-5 h-5 mr-2" />
              Timer Challenge
              {isPro && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs">
                  2x
                </span>
              )}
            </Button>
            {!isPro && (
              <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold to-amber-glow text-primary-foreground text-xs font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                PRO
              </div>
            )}
          </motion.div>

          <Button
            variant="royal"
            size="lg"
            onClick={onOpenLevels}
            className="w-full"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Empire Map
          </Button>

          <Button
            variant="royalOutline"
            size="lg"
            onClick={onOpenStore}
            className="w-full"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Royal Store
          </Button>
        </motion.div>

        {/* Jackpot Teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Conquer all 1000 levels to claim
          </p>
          <motion.p
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-bold text-gold text-shadow-gold"
          >
            ₹1,00,000 Virtual Jackpot!
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};
