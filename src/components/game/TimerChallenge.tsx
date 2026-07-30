import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Timer, Zap, Trophy, AlertCircle, Clock, Star } from 'lucide-react';
import { soundService } from '@/lib/soundService';
import { hasProUpgrade } from '@/lib/purchaseService';
import { getRiddle } from '@/lib/riddlesDatabase';
import { addCoins, loadGameState } from '@/lib/gameState';

interface TimerChallengeProps {
  isOpen: boolean;
  onClose: () => void;
  onGameStateChange: () => void;
}

const CHALLENGE_DURATION = 60; // 60 seconds per challenge
const BONUS_MULTIPLIER = 2; // 2x coins for Pro users

export const TimerChallenge = ({ isOpen, onClose, onGameStateChange }: TimerChallengeProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_DURATION);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const isPro = hasProUpgrade();

  // Get random riddles for the challenge
  const getRandomLevel = useCallback(() => {
    return Math.floor(Math.random() * 400) + 1; // Random from first 400 levels
  }, []);

  const [currentRiddle, setCurrentRiddle] = useState(() => getRiddle(getRandomLevel()));

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          setChallengeComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Play warning sound at 10 seconds
  useEffect(() => {
    if (isPlaying && timeLeft === 10) {
      soundService.play('wrong');
    }
  }, [isPlaying, timeLeft]);

  const startChallenge = () => {
    if (!isPro) return;
    
    soundService.play('click');
    setIsPlaying(true);
    setTimeLeft(CHALLENGE_DURATION);
    setScore(0);
    setQuestionsAnswered(0);
    setCurrentQuestion(0);
    setCurrentRiddle(getRiddle(getRandomLevel()));
    setChallengeComplete(false);
  };

  const handleSubmit = () => {
    const normalizedAnswer = answer.toLowerCase().trim();
    const correct = currentRiddle.answer.some(
      ans => normalizedAnswer.includes(ans.toLowerCase())
    );

    setIsCorrect(correct);
    setShowResult(true);
    setQuestionsAnswered(prev => prev + 1);

    if (correct) {
      soundService.play('correct');
      const points = isPro ? 100 * BONUS_MULTIPLIER : 100;
      setScore(prev => prev + points);
    } else {
      soundService.play('wrong');
    }

    // Move to next question after short delay
    setTimeout(() => {
      setShowResult(false);
      setAnswer('');
      setCurrentRiddle(getRiddle(getRandomLevel()));
      setCurrentQuestion(prev => prev + 1);
    }, 1000);
  };

  const claimReward = () => {
    soundService.play('coin');
    addCoins(score);
    onGameStateChange();
    onClose();
  };

  if (!isOpen) return null;

  // Pro Gate Screen
  if (!isPro) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-lg"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="gradient-card rounded-2xl border-ornate p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center"
          >
            <Timer className="w-10 h-10 text-gold" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gold mb-2">Timer Challenges</h2>
          <p className="text-muted-foreground mb-6">
            🔒 Unlock at Level 250 — complete Level 250 to permanently unlock Timer Challenges and 2x coins.
          </p>

          <Button variant="royalOutline" onClick={onClose} className="w-full">
            Back
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Challenge Complete Screen
  if (challengeComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-lg"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="gradient-card rounded-2xl border-ornate p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-gold" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gold mb-2">Challenge Complete!</h2>
          <p className="text-muted-foreground mb-4">
            You answered {questionsAnswered} questions
          </p>
          
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">Total Score</p>
            <p className="text-4xl font-bold text-gold">{score}</p>
            <p className="text-sm text-amber-glow">coins earned (2x Pro Bonus!)</p>
          </div>
          
          <Button variant="treasure" className="w-full" onClick={claimReward}>
            <Zap className="w-4 h-4 mr-2" />
            Claim Coins
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Not Started Screen
  if (!isPlaying) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-lg"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="gradient-card rounded-2xl border-ornate p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold to-amber-glow flex items-center justify-center"
          >
            <Timer className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gold mb-2">Timer Challenge</h2>
          <p className="text-muted-foreground mb-6">
            Answer as many riddles as you can in 60 seconds! As a Pro member, you earn 2x coins!
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/50 rounded-xl p-3">
              <Clock className="w-6 h-6 text-gold mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Time Limit</p>
              <p className="font-bold text-gold">60 sec</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <Zap className="w-6 h-6 text-amber-glow mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">Pro Bonus</p>
              <p className="font-bold text-amber-glow">2x Coins</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="royalOutline" onClick={onClose} className="flex-1">
              Back
            </Button>
            <Button variant="treasure" onClick={startChallenge} className="flex-1">
              <Zap className="w-4 h-4 mr-2" />
              Start!
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Playing Screen
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col p-4 bg-background/98 backdrop-blur-lg"
    >
      {/* Timer Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-gold'}`} />
            <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-destructive' : 'text-gold'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-glow" />
            <span className="font-bold text-amber-glow">{score}</span>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${timeLeft <= 10 ? 'bg-destructive' : 'bg-gradient-to-r from-gold to-amber-glow'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / CHALLENGE_DURATION) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col">
        <div className="gradient-card rounded-2xl border-ornate p-6 flex-1 flex flex-col">
          {/* Result Overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`absolute inset-0 z-10 flex items-center justify-center rounded-2xl ${
                  isCorrect ? 'bg-accent/90' : 'bg-destructive/90'
                }`}
              >
                <div className="text-center text-white">
                  {isCorrect ? (
                    <>
                      <Trophy className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-2xl font-bold">+{isPro ? 200 : 100} coins!</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-xl font-bold">Wrong!</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-lg text-center text-foreground leading-relaxed mb-4">
              {currentRiddle.telugu}
            </p>
            <p className="text-sm text-center text-muted-foreground italic">
              {currentRiddle.english}
            </p>
          </div>

          {/* Answer Input */}
          <div className="mt-4">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && answer.trim() && handleSubmit()}
              placeholder="Type your answer..."
              className="w-full p-4 rounded-xl bg-muted border-2 border-gold/30 focus:border-gold outline-none text-center text-lg"
              autoFocus
            />
            <Button
              variant="treasure"
              className="w-full mt-3"
              onClick={handleSubmit}
              disabled={!answer.trim()}
            >
              Submit Answer
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
