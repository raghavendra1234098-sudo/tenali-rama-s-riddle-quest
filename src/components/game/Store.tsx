import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coins, Zap, Crown, ShieldCheck, X, Ban, Star, Timer, Lock, Check, Lightbulb } from 'lucide-react';
import {
  COIN_BUNDLES,
  UNLOCK_REQUIREMENTS,
  redeemCoinBundle,
  hasRemovedAds,
  hasProUpgrade,
  getUnlockProgress,
  type BundleId,
} from '@/lib/purchaseService';
import { loadGameState } from '@/lib/gameState';
import { soundService } from '@/lib/soundService';
import { AdRewardModal } from './AdRewardModal';
import { addCoins, addEnergy, addFreeHints } from '@/lib/gameState';
import type { AdType } from '@/lib/adService';

interface StoreProps {
  isOpen: boolean;
  onClose: () => void;
  onGameStateChange?: () => void;
  onOpenTimerChallenge?: () => void;
}

export const Store = ({ isOpen, onClose, onGameStateChange, onOpenTimerChallenge }: StoreProps) => {
  const [activeTab, setActiveTab] = useState<'coins' | 'premium'>('coins');
  const [message, setMessage] = useState<string | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adType, setAdType] = useState<AdType>('energy');

  const adsRemoved = hasRemovedAds();
  const isPro = hasProUpgrade();
  const coins = loadGameState().totalCoins;

  if (!isOpen) return null;

  const bundles = [
    { ...COIN_BUNDLES.goldPouch, icon: Coins, popular: false },
    { ...COIN_BUNDLES.royalTreasury, icon: Crown, popular: true },
  ];

  const handleRedeem = (bundleId: BundleId) => {
    const result = redeemCoinBundle(bundleId);
    soundService.play(result.success ? 'coin' : 'wrong');
    setMessage(result.message);
    setTimeout(() => setMessage(null), 3000);
    onGameStateChange?.();
  };

  const openAd = (type: AdType) => {
    soundService.play('click');
    setAdType(type);
    setAdModalOpen(true);
  };

  const handleAdReward = (reward: { coins?: number; energy?: number; hints?: number }) => {
    if (reward.coins) addCoins(reward.coins);
    if (reward.energy) addEnergy(reward.energy);
    if (reward.hints) addFreeHints(reward.hints);
    soundService.play('coin');
    setMessage('Reward claimed!');
    setTimeout(() => setMessage(null), 3000);
    onGameStateChange?.();
  };

  const premiumCards = [
    {
      key: 'removeAds' as const,
      title: 'Remove Ads',
      description: adsRemoved ? 'Enjoying ad-free gameplay!' : 'Enjoy uninterrupted gameplay',
      unlocked: adsRemoved,
      icon: Ban,
      level: UNLOCK_REQUIREMENTS.removeAds,
      accent: 'crimson',
    },
    {
      key: 'proUpgrade' as const,
      title: 'Pro Upgrade',
      description: isPro ? 'Timer Challenge & 2x coins active!' : 'Timer Challenges + 2x Coins',
      unlocked: isPro,
      icon: Star,
      level: UNLOCK_REQUIREMENTS.proUpgrade,
      accent: 'gold',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="gradient-card rounded-2xl border-ornate p-6 md:p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <Crown className="w-12 h-12 text-gold mx-auto mb-2 animate-float" />
          <h2 className="text-2xl font-bold text-gold text-shadow-gold">Royal Store</h2>
          <p className="text-muted-foreground text-sm mt-1">Spend your earned coins & unlock rewards</p>
          <p className="text-gold text-sm mt-2 font-semibold">{coins.toLocaleString()} coins available</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-xl">
          <button
            onClick={() => setActiveTab('coins')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'coins'
                ? 'bg-gradient-to-r from-gold to-amber-glow text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="w-4 h-4" />
            Coins
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'premium'
                ? 'bg-gradient-to-r from-crimson to-crimson-dark text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Crown className="w-4 h-4" />
            Premium
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-gold/10 border border-gold/30 text-sm text-gold text-center">
            {message}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Coins Tab */}
          {activeTab === 'coins' && (
            <motion.div
              key="coins"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Coin Bundles */}
              <div className="grid gap-4 mb-6">
                {bundles.map((bundle) => {
                  const affordable = coins >= bundle.cost;
                  return (
                    <motion.div
                      key={bundle.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-4 rounded-xl border-2 ${
                        bundle.popular ? 'border-gold bg-gold/10' : 'border-gold/30 bg-muted/50'
                      }`}
                    >
                      {bundle.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-primary-foreground text-xs font-semibold">
                          BEST VALUE
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${bundle.popular ? 'gradient-gold' : 'bg-gold/20'}`}>
                            <bundle.icon className={`w-6 h-6 ${bundle.popular ? 'text-primary-foreground' : 'text-gold'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{bundle.name}</h3>
                            <p className="text-gold text-sm">{bundle.rewardText}</p>
                          </div>
                        </div>

                        <Button
                          variant={bundle.popular ? 'treasure' : 'royal'}
                          disabled={!affordable}
                          onClick={() => handleRedeem(bundle.id)}
                          className="shrink-0"
                        >
                          <Coins className="w-4 h-4 mr-1" />
                          {bundle.cost.toLocaleString()}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Rewarded Ads */}
              <div className="pt-4 border-t border-gold/20 space-y-3">
                <h4 className="text-sm font-semibold text-gold">Free Rewards — Watch an Ad</h4>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-glow" />
                    <span className="text-sm text-foreground">Refill Energy</span>
                  </div>
                  <Button variant="royalOutline" size="sm" onClick={() => openAd('energy')}>
                    Watch Ad
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-glow" />
                    <span className="text-sm text-foreground">Get One Hint</span>
                  </div>
                  <Button variant="royalOutline" size="sm" onClick={() => openAd('hint')}>
                    Watch Ad
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-gold" />
                    <span className="text-sm text-foreground">Earn 50 Coins</span>
                  </div>
                  <Button variant="royalOutline" size="sm" onClick={() => openAd('coins')}>
                    Watch Ad
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Premium Tab */}
          {activeTab === 'premium' && (
            <motion.div
              key="premium"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground text-center">
                Premium features are earned through gameplay — never bought.
              </p>

              {premiumCards.map((card) => (
                <motion.div
                  key={card.key}
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    card.unlocked
                      ? 'border-accent/50 bg-accent/10'
                      : 'border-gold/30 bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${card.unlocked ? 'bg-accent/20' : 'bg-muted'}`}>
                      <card.icon className={`w-6 h-6 ${card.unlocked ? 'text-accent' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    </div>
                    {card.unlocked ? (
                      <span className="flex items-center gap-1 text-accent text-sm font-semibold whitespace-nowrap">
                        <Check className="w-4 h-4" /> Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground text-sm font-semibold whitespace-nowrap">
                        <Lock className="w-4 h-4" /> Unlock at Level {card.level}
                      </span>
                    )}
                  </div>

                  {!card.unlocked && (
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-gold"
                        style={{ width: `${getUnlockProgress(card.key)}%` }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Timer Challenge Quick Access */}
              {isPro && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl border-2 border-amber-glow/50 bg-amber-glow/10 cursor-pointer"
                  onClick={onOpenTimerChallenge}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-glow/20">
                      <Timer className="w-6 h-6 text-amber-glow" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Timer Challenge</h3>
                      <p className="text-sm text-muted-foreground">Answer riddles against the clock!</p>
                    </div>
                    <Button variant="treasure" size="sm">
                      Play
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Virtual coins only • No real-money purchases</span>
        </div>
      </motion.div>

      <AdRewardModal
        isOpen={adModalOpen}
        adType={adType}
        onClose={() => setAdModalOpen(false)}
        onRewardEarned={handleAdReward}
      />
    </motion.div>
  );
};
