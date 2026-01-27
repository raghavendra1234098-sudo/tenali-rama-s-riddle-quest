import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Send, ArrowRight, Loader2, Sparkles, Crown } from 'lucide-react';
import { OrnateFrame, RoyalDivider, FloatingOrbs } from './OrnateFrame';

interface RiddleCardProps {
  riddle: {
    telugu: string;
    english: string;
    hint?: string;
  };
  riddleImage?: string;
  onSubmitAnswer: (answer: string) => void;
  onRequestHint: () => void;
  onWatchAdForHint: () => void;
  showHint: boolean;
  isLoading: boolean;
  level: number;
  hasCoinsForHint: boolean;
}

export const RiddleCard = ({
  riddle,
  riddleImage,
  onSubmitAnswer,
  onRequestHint,
  onWatchAdForHint,
  showHint,
  isLoading,
  level,
  hasCoinsForHint,
}: RiddleCardProps) => {
  const [answer, setAnswer] = useState('');
  const [showTelugu, setShowTelugu] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmitAnswer(answer.trim());
      setAnswer('');
    }
  };

  return (
    <OrnateFrame className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative gradient-card rounded-2xl border-ornate p-6 md:p-8 overflow-hidden"
      >
        {/* Background Decorations */}
        <FloatingOrbs />
        
        {/* Decorative Top Pattern */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
        
        {/* Level Badge with Crown */}
        <motion.div 
          className="text-center mb-6 relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div className="inline-flex flex-col items-center">
            <Crown className="w-6 h-6 text-gold mb-1 animate-pulse-gold" />
            <span className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-crimson via-crimson-dark to-crimson border-2 border-gold text-gold text-sm font-bold tracking-wider shadow-gold">
              ✦ LEVEL {level} ✦
            </span>
          </div>
        </motion.div>

        {/* Riddle Image with Ornate Border */}
        {riddleImage && (
          <OrnateFrame showCorners className="mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl overflow-hidden border-2 border-gold/40 shadow-gold"
            >
              <img 
                src={riddleImage} 
                alt="Riddle illustration" 
                className="w-full h-48 md:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-crimson-dark/50 to-transparent pointer-events-none" />
            </motion.div>
          </OrnateFrame>
        )}

        <RoyalDivider className="mb-6" />

        {/* Language Toggle - Enhanced */}
        <div className="flex justify-center mb-6 relative z-10">
          <div className="inline-flex rounded-full bg-gradient-to-r from-muted via-muted to-muted p-1.5 border-2 border-gold/30 shadow-lg">
            <motion.button
              onClick={() => setShowTelugu(true)}
              className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                showTelugu ? 'text-primary-foreground' : 'text-muted-foreground hover:text-gold'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showTelugu && (
                <motion.div
                  layoutId="langToggle"
                  className="absolute inset-0 gradient-gold rounded-full shadow-gold"
                />
              )}
              <span className="relative z-10 font-telugu">తెలుగు</span>
            </motion.button>
            <motion.button
              onClick={() => setShowTelugu(false)}
              className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                !showTelugu ? 'text-primary-foreground' : 'text-muted-foreground hover:text-gold'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {!showTelugu && (
                <motion.div
                  layoutId="langToggle"
                  className="absolute inset-0 gradient-gold rounded-full shadow-gold"
                />
              )}
              <span className="relative z-10">English</span>
            </motion.button>
          </div>
        </div>

        {/* Riddle Text - Enhanced Typography */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showTelugu ? 'telugu' : 'english'}
            initial={{ opacity: 0, x: showTelugu ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: showTelugu ? 20 : -20 }}
            className="text-center mb-8 relative z-10"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-gold animate-spin" />
                  <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-glow animate-pulse" />
                </div>
                <span className="mt-4 text-gold font-medium">Summoning ancient wisdom...</span>
              </div>
            ) : (
              <div className="relative p-6 rounded-xl bg-gradient-to-b from-gold/5 to-transparent border border-gold/20">
                {/* Quotation marks decoration */}
                <span className="absolute -top-3 left-4 text-4xl text-gold/30 font-serif">"</span>
                <span className="absolute -bottom-6 right-4 text-4xl text-gold/30 font-serif">"</span>
                
                <p className={`text-xl md:text-2xl leading-relaxed ${showTelugu ? 'font-telugu' : 'font-royal'} text-foreground`}>
                  {showTelugu ? riddle.telugu : riddle.english}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Hint Section - Enhanced */}
        <AnimatePresence>
          {showHint && riddle.hint && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-6 relative z-10"
            >
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-glow/10 via-amber-glow/5 to-amber-glow/10 border-2 border-amber-glow/40 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-amber-glow/20 border border-amber-glow/40">
                    <Lightbulb className="w-5 h-5 text-amber-glow" />
                  </div>
                  <div>
                    <span className="text-amber-glow font-bold text-sm">💡 Royal Hint</span>
                    <p className="text-foreground mt-1">{riddle.hint}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <RoyalDivider className="mb-6" />

        {/* Answer Form - Enhanced */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gold/10 blur-xl" />
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="🤔 మీ సమాధానం... / Your answer..."
              className="relative w-full px-5 py-4 rounded-xl bg-input border-2 border-gold/40 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/20 transition-all font-telugu text-lg shadow-lg"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {!showHint && (
              <>
                {hasCoinsForHint ? (
                  <Button
                    type="button"
                    variant="royalOutline"
                    onClick={onRequestHint}
                    disabled={isLoading}
                    className="min-w-[140px]"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint (50 💰)
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="crimson"
                    onClick={onWatchAdForHint}
                    disabled={isLoading}
                    className="min-w-[140px]"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Free Hint 🎬
                  </Button>
                )}
              </>
            )}
            <Button
              type="submit"
              variant="royal"
              size="lg"
              disabled={!answer.trim() || isLoading}
              className="min-w-[160px]"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </motion.div>
    </OrnateFrame>
  );
};
