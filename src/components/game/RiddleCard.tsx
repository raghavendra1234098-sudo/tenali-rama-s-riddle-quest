import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Send, ArrowRight, Loader2 } from 'lucide-react';

interface RiddleCardProps {
  riddle: {
    telugu: string;
    english: string;
    hint?: string;
  };
  riddleImage?: string;
  onSubmitAnswer: (answer: string) => void;
  onRequestHint: () => void;
  showHint: boolean;
  isLoading: boolean;
  level: number;
}

export const RiddleCard = ({
  riddle,
  riddleImage,
  onSubmitAnswer,
  onRequestHint,
  showHint,
  isLoading,
  level,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="gradient-card rounded-2xl border-ornate p-6 md:p-8 max-w-2xl mx-auto"
    >
      {/* Level Badge */}
      <div className="text-center mb-4">
        <span className="inline-block px-4 py-1 rounded-full bg-crimson border border-gold text-gold text-sm font-semibold">
          Level {level}
        </span>
      </div>

      {/* Riddle Image */}
      {riddleImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-xl overflow-hidden border-2 border-gold/30"
        >
          <img 
            src={riddleImage} 
            alt="Riddle illustration" 
            className="w-full h-48 md:h-64 object-cover"
          />
        </motion.div>
      )}

      {/* Language Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-full bg-muted p-1 border border-gold/30">
          <button
            onClick={() => setShowTelugu(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              showTelugu ? 'gradient-gold text-primary-foreground' : 'text-muted-foreground hover:text-gold'
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setShowTelugu(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              !showTelugu ? 'gradient-gold text-primary-foreground' : 'text-muted-foreground hover:text-gold'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Riddle Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showTelugu ? 'telugu' : 'english'}
          initial={{ opacity: 0, x: showTelugu ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: showTelugu ? 20 : -20 }}
          className="text-center mb-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
              <span className="ml-3 text-gold">Generating riddle...</span>
            </div>
          ) : (
            <p className={`text-lg md:text-xl leading-relaxed ${showTelugu ? 'font-telugu' : 'font-royal'} text-foreground`}>
              {showTelugu ? riddle.telugu : riddle.english}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Hint Section */}
      <AnimatePresence>
        {showHint && riddle.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-lg bg-amber-glow/10 border border-amber-glow/30"
          >
            <p className="text-amber-glow text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="font-semibold">Hint:</span> {riddle.hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer... / మీ సమాధానం నమోదు చేయండి..."
            className="w-full px-4 py-3 rounded-lg bg-input border-2 border-gold/30 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all font-telugu"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3 justify-center">
          {!showHint && (
            <Button
              type="button"
              variant="royalOutline"
              onClick={onRequestHint}
              disabled={isLoading}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Hint (50 coins)
            </Button>
          )}
          <Button
            type="submit"
            variant="royal"
            disabled={!answer.trim() || isLoading}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
