import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiddleCard } from './RiddleCard';
import { VictoryModal } from './VictoryModal';
import { AdRewardModal } from './AdRewardModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, AlertCircle, Play, SkipForward, CheckCircle } from 'lucide-react';
import { soundService } from '@/lib/soundService';
import { useHint, useEnergy, completeLevel, addEnergy, addCoins, loadGameState } from '@/lib/gameState';
import { adService, type AdType } from '@/lib/adService';
import { getRiddle } from '@/lib/riddlesDatabase';

interface GameScreenProps {
  level: number;
  energy: number;
  onBack: () => void;
  onGameStateChange: () => void;
}

export const GameScreen = ({ level, energy, onBack, onGameStateChange }: GameScreenProps) => {
  const [showHint, setShowHint] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  
  // Ad modal states
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [currentAdType, setCurrentAdType] = useState<AdType>('hint');

  // Get current game state for coin check
  const gameState = loadGameState();
  const hasCoinsForHint = gameState.totalCoins >= 50;

  // Get the unique riddle for this level from database
  const levelRiddle = getRiddle(level);
  const currentRiddle = {
    telugu: levelRiddle.telugu,
    english: levelRiddle.english,
    answer: levelRiddle.answer,
    hint: levelRiddle.hint,
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const handleRequestHint = useCallback(() => {
    if (useHint()) {
      setShowHint(true);
      soundService.play('click');
      onGameStateChange();
    } else {
      showErrorMessage("Not enough coins for hint!");
    }
  }, [onGameStateChange]);

  const handleWatchAdForHint = useCallback(() => {
    setCurrentAdType('hint');
    setAdModalOpen(true);
  }, []);

  const handleWatchAdForEnergy = useCallback(() => {
    setCurrentAdType('energy');
    setAdModalOpen(true);
  }, []);

  const handleWatchAdForSkip = useCallback(() => {
    setCurrentAdType('levelSkip');
    setAdModalOpen(true);
  }, []);

  const handleAdReward = useCallback((reward: { coins?: number; energy?: number; levelSkip?: boolean }) => {
    soundService.play('coin');
    
    if (reward.coins) {
      addCoins(reward.coins);
    }
    
    if (reward.energy) {
      addEnergy(reward.energy);
      showSuccessMessage(`+${reward.energy} Energy Refilled!`);
    }
    
    if (reward.levelSkip) {
      // Skip to next level with bonus coins
      const earned = 50 + (level * 5);
      setCoinsEarned(earned);
      completeLevel(level, earned);
      setShowVictory(true);
    }
    
    if (currentAdType === 'hint') {
      setShowHint(true);
      showSuccessMessage("Free hint unlocked!");
    }
    
    onGameStateChange();
  }, [currentAdType, level, onGameStateChange]);

  const handleSubmitAnswer = useCallback((answer: string) => {
    const normalizedAnswer = answer.toLowerCase().trim();
    const isCorrect = currentRiddle.answer.some(
      (correct) => normalizedAnswer.includes(correct.toLowerCase())
    );

    if (isCorrect) {
      soundService.play('correct');
      const earned = 100 + (level * 10); // More coins for higher levels
      setCoinsEarned(earned);
      completeLevel(level, earned);
      setShowVictory(true);
      onGameStateChange();
    } else {
      soundService.play('wrong');
      showErrorMessage("Incorrect! Try again or use a hint.");
    }
  }, [currentRiddle, level, onGameStateChange]);

  const handleContinue = () => {
    setShowVictory(false);
    setShowHint(false);
    onGameStateChange();
  };

  if (energy <= 0) {
    return (
      <div className="min-h-screen gradient-royal flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gradient-card border-ornate rounded-2xl p-8 text-center max-w-md"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <Zap className="w-10 h-10 text-muted-foreground" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gold mb-2">Out of Energy!</h2>
          <p className="text-muted-foreground mb-6">
            Watch an ad to refill your energy and continue your quest!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="royal" onClick={handleWatchAdForEnergy} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Watch Ad (+3 ⚡)
            </Button>
            <Button variant="royalOutline" onClick={onBack} className="flex-1">
              Go Back
            </Button>
          </div>
        </motion.div>

        {/* Ad Modal */}
        <AdRewardModal
          isOpen={adModalOpen}
          adType={currentAdType}
          onClose={() => setAdModalOpen(false)}
          onRewardEarned={handleAdReward}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-royal pt-20 pb-8 px-4">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-crimson/10 rounded-full blur-3xl" />
      </div>

      {/* Back Button & Level Skip */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6 flex items-center justify-between max-w-2xl mx-auto"
      >
        <Button variant="ghost" onClick={onBack} className="text-gold hover:text-gold-light">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        
        <Button 
          variant="royalOutline" 
          onClick={handleWatchAdForSkip}
          className="text-sm"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip Level 🎬
        </Button>
      </motion.div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-destructive text-destructive-foreground flex items-center gap-2 shadow-lg"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-accent text-accent-foreground flex items-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Riddle Card */}
      <RiddleCard
        riddle={currentRiddle}
        onSubmitAnswer={handleSubmitAnswer}
        onRequestHint={handleRequestHint}
        onWatchAdForHint={handleWatchAdForHint}
        showHint={showHint}
        isLoading={isLoading}
        level={level}
        hasCoinsForHint={hasCoinsForHint}
      />

      {/* Victory Modal */}
      <VictoryModal
        isOpen={showVictory}
        level={level}
        coinsEarned={coinsEarned}
        onContinue={handleContinue}
      />

      {/* Ad Reward Modal */}
      <AdRewardModal
        isOpen={adModalOpen}
        adType={currentAdType}
        onClose={() => setAdModalOpen(false)}
        onRewardEarned={handleAdReward}
      />
    </div>
  );
};
