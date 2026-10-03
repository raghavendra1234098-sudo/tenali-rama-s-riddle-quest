import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, AlertTriangle, ArrowRight, Sparkles, Scroll, Coins, X } from 'lucide-react';
import { soundService } from '@/lib/soundService';

interface RevealAnswerModalProps {
  isOpen: boolean;
  level: number;
  riddle: {
    telugu?: string | { question: string; answer?: string; acceptedAnswers?: string[] };
    english?: string | { question: string; answer?: string; acceptedAnswers?: string[] };
    hindi?: string | { question: string; answer?: string; acceptedAnswers?: string[] };
    canonicalAnswer?: { en: string; te: string; hi?: string };
    answer?: string[];
    acceptedAnswers?: string[];
    explanation?: { en: string; te: string; hi?: string };
    hint?: string | { te: string; en: string; hi: string };
  };
  language?: 'te' | 'en' | 'hi';
  onClose: () => void;
  onRevealed: () => void;
  onContinue: () => void;
}

export const RevealAnswerModal = ({
  isOpen,
  level,
  riddle,
  language = 'te',
  onClose,
  onRevealed,
  onContinue,
}: RevealAnswerModalProps) => {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Reset confirmation state when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setHasConfirmed(false);
    }
  }, [isOpen]);

  const handleConfirmReveal = () => {
    soundService.play('hint');
    setHasConfirmed(true);
    onRevealed();
  };

  // Determine canonical answers across 3 languages
  const teluguAnswer =
    riddle.canonicalAnswer?.te ||
    (typeof riddle.telugu === 'object' ? riddle.telugu?.answer : undefined) ||
    riddle.acceptedAnswers?.find(a => /[\u0C00-\u0C7F]/.test(a)) ||
    'తెలియదు';

  const englishAnswer =
    riddle.canonicalAnswer?.en ||
    (typeof riddle.english === 'object' ? riddle.english?.answer : undefined) ||
    riddle.acceptedAnswers?.find(a => !/[\u0C00-\u0C7F\u0900-\u097F]/.test(a)) ||
    'Unknown';

  const hindiAnswer =
    riddle.canonicalAnswer?.hi ||
    (typeof riddle.hindi === 'object' ? riddle.hindi?.answer : undefined) ||
    riddle.acceptedAnswers?.find(a => /[\u0900-\u097F]/.test(a)) ||
    'अज्ञात';

  // Get explanation for active language
  const getExplanation = (): string => {
    if (!riddle.explanation) return '';
    if (language === 'hi') return riddle.explanation.hi || riddle.explanation.en;
    if (language === 'en') return riddle.explanation.en;
    return riddle.explanation.te || riddle.explanation.en;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="gradient-card rounded-2xl border-ornate p-6 md:p-8 max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
        >
          {/* Close button in top-right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-gold transition-colors p-1 rounded-full z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative Sparkles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-glow/10 rounded-full blur-2xl" />
          </div>

          {!hasConfirmed ? (
            /* STEP 1: SAFETY CONFIRMATION DIALOG */
            <motion.div
              key="confirm-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 space-y-5"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="w-16 h-16 mx-auto rounded-full bg-amber-glow/20 border-2 border-amber-glow/50 flex items-center justify-center"
              >
                <AlertTriangle className="w-8 h-8 text-amber-glow" />
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold text-gold text-shadow-gold">
                  {language === 'te'
                    ? 'జవాబు చూడాలనుకుంటున్నారా?'
                    : language === 'hi'
                    ? 'क्या आप उत्तर देखना चाहते हैं?'
                    : 'Reveal the Answer?'}
                </h3>
                {language !== 'te' && (
                  <p className="text-base font-telugu text-amber-glow/90 mt-1">
                    జవాబు చూడాలనుకుంటున్నారా?
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-background/60 border border-gold/20 text-muted-foreground text-sm space-y-2">
                <p>
                  {language === 'te'
                    ? 'మీరు ఖచ్చితంగా జవాబు చూడాలనుకుంటున్నారా?'
                    : language === 'hi'
                    ? 'क्या आप वाकई उत्तर देखना चाहते हैं?'
                    : 'Are you sure you want to reveal the answer?'}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-amber-300 font-semibold">
                  <Coins className="w-4 h-4 text-amber-300" />
                  <span>
                    {language === 'te'
                      ? 'ఈ స్థాయికి మీకు నాణేలు లభించవు (0 నాణేలు).'
                      : language === 'hi'
                      ? 'इस स्तर के लिए आपको कोई सिक्का नहीं मिलेगा (0 सिक्के)।'
                      : 'You will earn 0 coins for this level.'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/80">
                  {language === 'te'
                    ? 'తర్వాతి స్థాయి అన్‌లాక్ అవుతుంది.'
                    : language === 'hi'
                    ? 'लेकिन अगला स्तर अनलॉक हो जाएगा।'
                    : 'The next level will still be unlocked.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  type="button"
                  variant="royalOutline"
                  onClick={onClose}
                  className="flex-1"
                >
                  {language === 'te'
                    ? 'ప్రయత్నిస్తాను'
                    : language === 'hi'
                    ? 'प्रयास जारी रखें'
                    : 'Keep Trying'}
                </Button>
                <Button
                  type="button"
                  variant="royal"
                  onClick={handleConfirmReveal}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {language === 'te'
                    ? 'జవాబు చూపించు'
                    : language === 'hi'
                    ? 'उत्तर देखें'
                    : 'Reveal Answer'}
                </Button>
              </div>
            </motion.div>
          ) : (
            /* STEP 2: REVEALED ANSWER & EXPLANATION */
            <motion.div
              key="revealed-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 space-y-5"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-gold/20 border-2 border-gold/60 flex items-center justify-center">
                <Scroll className="w-7 h-7 text-gold" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-gold/80 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Level {level} Revealed
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {language === 'te' ? 'జవాబు:' : language === 'hi' ? 'उत्तर:' : 'ANSWER:'}
                </h3>
              </div>

              {/* Prominent Language-Aware Answer Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-gold/20 via-gold/10 to-transparent border-2 border-gold/50 shadow-inner">
                <span className="text-xs uppercase text-gold font-semibold tracking-wider">
                  {language === 'te'
                    ? 'సరైన సమాధానం'
                    : language === 'hi'
                    ? 'सही उत्तर'
                    : 'Correct Answer'}
                </span>
                <div className="mt-2 space-y-1">
                  {language === 'te' && (
                    <>
                      <p className="text-3xl md:text-4xl font-extrabold text-gold text-shadow-gold font-telugu">
                        {teluguAnswer}
                      </p>
                      <p className="text-sm md:text-base font-medium text-foreground/80">
                        {englishAnswer} • {hindiAnswer}
                      </p>
                    </>
                  )}
                  {language === 'hi' && (
                    <>
                      <p className="text-3xl md:text-4xl font-extrabold text-gold text-shadow-gold font-sans">
                        {hindiAnswer}
                      </p>
                      <p className="text-sm md:text-base font-medium text-foreground/80">
                        {englishAnswer} • {teluguAnswer}
                      </p>
                    </>
                  )}
                  {language === 'en' && (
                    <>
                      <p className="text-3xl md:text-4xl font-extrabold text-gold text-shadow-gold font-royal">
                        {englishAnswer}
                      </p>
                      <p className="text-sm md:text-base font-medium text-foreground/80 font-telugu">
                        {teluguAnswer} • {hindiAnswer}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Short Riddle Explanation */}
              {getExplanation() && (
                <div className="p-4 rounded-xl bg-background/60 border border-gold/20 text-left space-y-2">
                  <span className="text-xs text-gold/90 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    {language === 'te'
                      ? 'వివరణ'
                      : language === 'hi'
                      ? 'विवरण'
                      : 'Explanation'}
                  </span>
                  <p className={`text-sm ${language === 'te' ? 'font-telugu' : ''} text-foreground/90 leading-relaxed`}>
                    {getExplanation()}
                  </p>
                </div>
              )}

              {/* Zero Reward Notice */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-muted text-xs text-muted-foreground">
                <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {language === 'te'
                    ? '0 నాణేలు (జవాబు చూపబడింది)'
                    : language === 'hi'
                    ? '0 सिक्के (उत्तर दिखाया गया)'
                    : 'Earned 0 Coins (Answer Revealed)'}
                </span>
              </div>

              {/* Continue to Next Level Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="royal"
                  size="lg"
                  onClick={onContinue}
                  className="w-full text-base font-bold shadow-gold"
                >
                  <span>
                    {language === 'te'
                      ? 'తర్వాతి ప్రయాణం'
                      : language === 'hi'
                      ? 'आगे बढ़ें'
                      : 'Continue Journey'}
                  </span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
