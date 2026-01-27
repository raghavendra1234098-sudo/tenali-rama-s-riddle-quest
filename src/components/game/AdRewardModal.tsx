import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Play, Gift, Zap, Lightbulb, SkipForward, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adService, type AdType } from '@/lib/adService';

interface AdRewardModalProps {
  isOpen: boolean;
  adType: AdType;
  onClose: () => void;
  onRewardEarned: (reward: { coins?: number; energy?: number; levelSkip?: boolean }) => void;
}

const AD_CONFIG = {
  hint: {
    icon: Lightbulb,
    title: 'Free Hint',
    description: 'Watch a short video to unlock a hint without spending coins!',
    gradient: 'from-amber-500 to-yellow-600',
  },
  energy: {
    icon: Zap,
    title: 'Energy Refill',
    description: 'Watch a short video to refill your energy and keep playing!',
    gradient: 'from-blue-500 to-cyan-500',
  },
  levelSkip: {
    icon: SkipForward,
    title: 'Skip Level',
    description: 'Watch a short video to skip this difficult level!',
    gradient: 'from-purple-500 to-pink-500',
  },
};

export const AdRewardModal = ({ isOpen, adType, onClose, onRewardEarned }: AdRewardModalProps) => {
  const [isWatching, setIsWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReward, setShowReward] = useState(false);

  const config = AD_CONFIG[adType];
  const Icon = config.icon;

  useEffect(() => {
    if (!isWatching) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3.33; // ~3 seconds to complete
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isWatching]);

  const handleWatchAd = async () => {
    setIsWatching(true);
    
    const success = await adService.showRewardAd(adType, {
      onAdLoaded: () => console.log('Ad loaded'),
      onAdRewarded: () => {
        setShowReward(true);
        const reward = adService.getRewardAmount(adType);
        setTimeout(() => {
          onRewardEarned(reward);
          setIsWatching(false);
          setShowReward(false);
          onClose();
        }, 1500);
      },
      onAdFailed: () => {
        setIsWatching(false);
        setProgress(0);
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-sm gradient-card border-ornate rounded-2xl overflow-hidden"
          >
            {/* Close Button */}
            {!isWatching && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-gold transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Decorative Header */}
            <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />

            <div className="p-6 text-center">
              {/* Icon */}
              <motion.div
                animate={isWatching ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: isWatching ? Infinity : 0, ease: 'linear' }}
                className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {showReward ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="space-y-2"
                >
                  <Gift className="w-16 h-16 text-gold mx-auto animate-bounce" />
                  <h3 className="text-2xl font-bold text-gold">Reward Earned!</h3>
                </motion.div>
              ) : isWatching ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gold">Watching Ad...</h3>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${config.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {/* Simulated Ad Content */}
                  <div className="aspect-video bg-gradient-to-br from-muted to-background rounded-lg flex items-center justify-center border border-gold/20">
                    <div className="text-center space-y-2">
                      <Loader2 className="w-8 h-8 text-gold mx-auto animate-spin" />
                      <p className="text-sm text-muted-foreground">Ad Playing...</p>
                      <p className="text-xs text-gold">{Math.round(progress)}% Complete</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gold mb-2">{config.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{config.description}</p>

                  {/* Reward Preview */}
                  <div className="mb-6 p-3 rounded-lg bg-gold/10 border border-gold/30">
                    <p className="text-gold text-sm font-medium">
                      🎁 Reward: {adType === 'hint' ? 'Free Hint' : adType === 'energy' ? '+3 Energy' : 'Skip Level + 25 Coins'}
                    </p>
                  </div>

                  <Button variant="royal" size="lg" onClick={handleWatchAd} className="w-full">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Ad
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
