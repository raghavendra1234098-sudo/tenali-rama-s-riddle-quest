import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Send, ArrowRight, Loader2, Sparkles, Crown, Stars, Scroll } from 'lucide-react';
import { OrnateFrame, RoyalDivider, FloatingOrbs } from './OrnateFrame';
import { soundService } from '@/lib/soundService';

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

// Floating sparkle particles component
const SparkleParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-gold rounded-full"
        initial={{ 
          x: Math.random() * 100 + '%', 
          y: '100%',
          opacity: 0,
          scale: 0
        }}
        animate={{ 
          y: '-20%',
          opacity: [0, 1, 1, 0],
          scale: [0, 1.5, 1, 0]
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: 'easeOut'
        }}
      />
    ))}
  </div>
);

// Decorative corner flourishes
const CornerFlourish = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const rotations = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90'
  };
  
  const positions = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  };

  return (
    <div className={`absolute ${positions[position]} w-16 h-16 ${rotations[position]} pointer-events-none`}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-gold/40">
        <path
          d="M0,0 Q50,0 50,50 Q50,0 100,0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="50" cy="50" r="4" fill="currentColor" />
        <path
          d="M10,10 L30,10 M10,10 L10,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

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
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      soundService.play('whoosh');
      onSubmitAnswer(answer.trim());
      setAnswer('');
    }
  };

  const handleLanguageToggle = (telugu: boolean) => {
    soundService.play('pop');
    setShowTelugu(telugu);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 100);
    }
  };

  const handleHintClick = () => {
    soundService.play('hint');
    onRequestHint();
  };

  const handleAdHintClick = () => {
    soundService.play('click');
    onWatchAdForHint();
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
        <SparkleParticles />
        
        {/* Corner Flourishes */}
        <CornerFlourish position="top-left" />
        <CornerFlourish position="top-right" />
        <CornerFlourish position="bottom-left" />
        <CornerFlourish position="bottom-right" />
        
        {/* Decorative Top Pattern */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gold/10 via-gold/5 to-transparent pointer-events-none" />
        
        {/* Animated Border Glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent, rgba(212, 175, 55, 0.1), transparent)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Level Badge with Crown */}
        <motion.div 
          className="text-center mb-6 relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <div className="inline-flex flex-col items-center">
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                rotateZ: [-5, 5, -5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Crown className="w-8 h-8 text-gold mb-1" />
            </motion.div>
            <motion.span 
              className="inline-block px-8 py-2.5 rounded-full bg-gradient-to-r from-crimson via-crimson-dark to-crimson border-2 border-gold text-gold text-sm font-bold tracking-wider shadow-gold"
              whileHover={{ scale: 1.05 }}
            >
              <Stars className="inline w-4 h-4 mr-1" />
              LEVEL {level}
              <Stars className="inline w-4 h-4 ml-1" />
            </motion.span>
          </div>
        </motion.div>

        {/* Scroll Icon Decoration */}
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Scroll className="w-6 h-6 text-gold/50" />
          </motion.div>
        </div>

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
          <motion.div 
            className="inline-flex rounded-full bg-gradient-to-r from-muted via-muted to-muted p-1.5 border-2 border-gold/30 shadow-lg"
            whileHover={{ boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' }}
          >
            <motion.button
              onClick={() => handleLanguageToggle(true)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
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
              <span className="relative z-10 font-telugu text-base">తెలుగు</span>
            </motion.button>
            <motion.button
              onClick={() => handleLanguageToggle(false)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
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
          </motion.div>
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
              <motion.div 
                className="relative p-8 rounded-2xl bg-gradient-to-b from-gold/10 via-gold/5 to-transparent border-2 border-gold/30 shadow-inner"
                whileHover={{ borderColor: 'rgba(212, 175, 55, 0.5)' }}
              >
                {/* Quotation marks decoration */}
                <span className="absolute -top-2 left-6 text-5xl text-gold/40 font-serif">"</span>
                <span className="absolute -bottom-4 right-6 text-5xl text-gold/40 font-serif">"</span>
                
                {/* Decorative lines */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                
                <motion.p 
                  className={`text-xl md:text-2xl leading-relaxed ${showTelugu ? 'font-telugu' : 'font-royal'} text-foreground px-4`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {showTelugu ? riddle.telugu : riddle.english}
                </motion.p>
              </motion.div>
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
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-glow/15 via-amber-glow/10 to-amber-glow/15 border-2 border-amber-glow/50 shadow-lg backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="p-3 rounded-full bg-amber-glow/30 border-2 border-amber-glow/50"
                    animate={{ 
                      boxShadow: ['0 0 10px rgba(251, 191, 36, 0.3)', '0 0 20px rgba(251, 191, 36, 0.5)', '0 0 10px rgba(251, 191, 36, 0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Lightbulb className="w-6 h-6 text-amber-glow" />
                  </motion.div>
                  <div>
                    <span className="text-amber-glow font-bold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Royal Hint
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <p className="text-foreground mt-2 text-lg">{riddle.hint}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <RoyalDivider className="mb-6" />

        {/* Answer Form - Enhanced */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="relative group">
            {/* Animated glow background */}
            <motion.div 
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold/20 via-amber-glow/20 to-gold/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative">
              <input
                type="text"
                value={answer}
                onChange={handleInputChange}
                placeholder="🤔 మీ సమాధానం... / Your answer..."
                className="relative w-full px-6 py-5 rounded-2xl bg-gradient-to-b from-input to-input/80 border-2 border-gold/40 text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/30 transition-all font-telugu text-lg shadow-lg"
                disabled={isLoading}
              />
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {!showHint && (
              <>
                {hasCoinsForHint ? (
                  <Button
                    type="button"
                    variant="royalOutline"
                    onClick={handleHintClick}
                    disabled={isLoading}
                    className="min-w-[150px] group"
                  >
                    <Lightbulb className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Hint (50 💰)
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="crimson"
                    onClick={handleAdHintClick}
                    disabled={isLoading}
                    className="min-w-[150px] group"
                  >
                    <Lightbulb className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Free Hint 🎬
                  </Button>
                )}
              </>
            )}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                variant="royal"
                size="lg"
                disabled={!answer.trim() || isLoading}
                className="min-w-[180px] relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </OrnateFrame>
  );
};
