import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiddleCard } from './RiddleCard';
import { VictoryModal } from './VictoryModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, AlertCircle } from 'lucide-react';
import { soundService } from '@/lib/soundService';
import { useHint, useEnergy, completeLevel } from '@/lib/gameState';

interface GameScreenProps {
  level: number;
  energy: number;
  onBack: () => void;
  onGameStateChange: () => void;
}

// Sample riddles - in production, these would come from AI
const SAMPLE_RIDDLES = [
  {
    telugu: "రోజూ పుట్టి, రోజూ చనిపోతుంది. అది ఏమిటి?",
    english: "It is born every day and dies every day. What is it?",
    answer: ["sun", "సూర్యుడు", "daylight", "day"],
    hint: "Look to the sky in the morning",
  },
  {
    telugu: "నోరు లేకుండా మాట్లాడుతుంది, చెవులు లేకుండా వింటుంది. అది ఏమిటి?",
    english: "It speaks without a mouth, hears without ears. What is it?",
    answer: ["echo", "ప్రతిధ్వని", "pratidhwani"],
    hint: "Try shouting in a mountain valley",
  },
  {
    telugu: "ఎంత తీసుకున్నా తగ్గదు. అది ఏమిటి?",
    english: "No matter how much you take from it, it never gets smaller. What is it?",
    answer: ["knowledge", "జ్ఞానం", "wisdom", "విద్య"],
    hint: "The more you learn, the more there is",
  },
];

export const GameScreen = ({ level, energy, onBack, onGameStateChange }: GameScreenProps) => {
  const [showHint, setShowHint] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Get a riddle based on level (cycling through samples for demo)
  const currentRiddle = SAMPLE_RIDDLES[(level - 1) % SAMPLE_RIDDLES.length];

  const handleRequestHint = useCallback(() => {
    if (useHint()) {
      setShowHint(true);
      soundService.play('click');
      onGameStateChange();
    } else {
      setError("Not enough coins for hint!");
      setTimeout(() => setError(null), 3000);
    }
  }, [onGameStateChange]);

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
      setError("Incorrect! Try again or use a hint.");
      setTimeout(() => setError(null), 3000);
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
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gold mb-2">Out of Energy!</h2>
          <p className="text-muted-foreground mb-6">
            Watch an ad or wait for your energy to refill.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="royal" onClick={() => {/* Watch ad logic */}}>
              Watch Ad
            </Button>
            <Button variant="royalOutline" onClick={onBack}>
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-royal pt-20 pb-8 px-4">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button variant="ghost" onClick={onBack} className="text-gold hover:text-gold-light">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Map
        </Button>
      </motion.div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Riddle Card */}
      <RiddleCard
        riddle={currentRiddle}
        onSubmitAnswer={handleSubmitAnswer}
        onRequestHint={handleRequestHint}
        showHint={showHint}
        isLoading={isLoading}
        level={level}
      />

      {/* Victory Modal */}
      <VictoryModal
        isOpen={showVictory}
        level={level}
        coinsEarned={coinsEarned}
        onContinue={handleContinue}
      />
    </div>
  );
};
