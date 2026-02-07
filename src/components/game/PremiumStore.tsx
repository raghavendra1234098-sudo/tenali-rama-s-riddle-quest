import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  X, ShieldCheck, Crown, Zap, Timer, Ban, 
  Sparkles, Check, RefreshCw, Star
} from 'lucide-react';
import { 
  PURCHASE_PLANS, 
  generatePurchaseLink, 
  activatePurchase, 
  restorePurchases,
  getPurchaseSummary,
  type PurchaseType,
  type PurchasePlan
} from '@/lib/purchaseService';
import { soundService } from '@/lib/soundService';

interface PremiumStoreProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

export const PremiumStore = ({ isOpen, onClose, onPurchaseComplete }: PremiumStoreProps) => {
  const [selectedTab, setSelectedTab] = useState<'removeAds' | 'proUpgrade'>('removeAds');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<{type: PurchaseType, plan: PurchasePlan} | null>(null);

  const summary = getPurchaseSummary();

  if (!isOpen) return null;

  const handlePurchaseClick = (purchaseType: PurchaseType, plan: PurchasePlan) => {
    soundService.play('click');
    setPendingPurchase({ type: purchaseType, plan });
    setShowConfirmation(true);
  };

  const handleConfirmPurchase = () => {
    if (!pendingPurchase) return;
    
    setIsProcessing(true);
    const upiLink = generatePurchaseLink(pendingPurchase.type, pendingPurchase.plan);
    
    // Open UPI payment app
    window.location.href = upiLink;
    
    // Simulate payment completion (in production, use a callback or deep link)
    setTimeout(() => {
      const transactionId = `TXN${Date.now()}`;
      activatePurchase(pendingPurchase.type, pendingPurchase.plan, transactionId);
      soundService.play('coin');
      setIsProcessing(false);
      setShowConfirmation(false);
      setPendingPurchase(null);
      onPurchaseComplete();
    }, 3000);
  };

  const handleRestorePurchases = () => {
    soundService.play('click');
    const restored = restorePurchases();
    if (restored) {
      soundService.play('correct');
      onPurchaseComplete();
    }
  };

  const removeAdsPlans = PURCHASE_PLANS.removeAds;
  const proPlans = PURCHASE_PLANS.proUpgrade;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-lg"
    >
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gold/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="gradient-card rounded-2xl border-ornate p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <Crown className="w-14 h-14 text-gold mx-auto mb-2" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gold text-shadow-gold">Premium Upgrades</h2>
          <p className="text-muted-foreground text-sm mt-1">Unlock the ultimate experience</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-xl">
          <button
            onClick={() => setSelectedTab('removeAds')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'removeAds'
                ? 'bg-gradient-to-r from-crimson to-crimson-dark text-white shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Ban className="w-4 h-4" />
            Remove Ads
          </button>
          <button
            onClick={() => setSelectedTab('proUpgrade')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'proUpgrade'
                ? 'bg-gradient-to-r from-gold to-amber-glow text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="w-4 h-4" />
            Pro Upgrade
          </button>
        </div>

        {/* Remove Ads Tab */}
        <AnimatePresence mode="wait">
          {selectedTab === 'removeAds' && (
            <motion.div
              key="removeAds"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Current Status */}
              {summary.adsRemoved && (
                <div className="p-4 rounded-xl bg-accent/20 border border-accent/40 flex items-center gap-3">
                  <Check className="w-6 h-6 text-accent" />
                  <div>
                    <p className="font-semibold text-accent">Ads Removed!</p>
                    <p className="text-sm text-muted-foreground">{summary.removeAdsExpiry}</p>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="p-4 rounded-xl bg-muted/30 border border-gold/20">
                <h3 className="font-semibold text-gold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Ad-Free Benefits
                </h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    No banner ads throughout the app
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    No interstitial ads between levels
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    Uninterrupted gameplay experience
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    Faster level transitions
                  </li>
                </ul>
              </div>

              {/* Pricing Cards */}
              <div className="grid gap-3">
                {/* Monthly */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl border-2 border-gold/30 bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{removeAdsPlans.monthly.name}</h4>
                      <p className="text-sm text-muted-foreground">{removeAdsPlans.monthly.description}</p>
                    </div>
                    <Button
                      variant="royal"
                      onClick={() => handlePurchaseClick('removeAds', 'monthly')}
                      disabled={summary.adsRemoved || isProcessing}
                    >
                      ₹{removeAdsPlans.monthly.price}/mo
                    </Button>
                  </div>
                </motion.div>

                {/* Lifetime - Best Value */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl border-2 border-gold bg-gold/10 relative"
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-primary-foreground text-xs font-bold">
                    BEST VALUE
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-semibold text-gold">{removeAdsPlans.lifetime.name}</h4>
                      <p className="text-sm text-muted-foreground">{removeAdsPlans.lifetime.description}</p>
                    </div>
                    <Button
                      variant="treasure"
                      onClick={() => handlePurchaseClick('removeAds', 'lifetime')}
                      disabled={summary.adsRemoved || isProcessing}
                    >
                      ₹{removeAdsPlans.lifetime.price}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Pro Upgrade Tab */}
          {selectedTab === 'proUpgrade' && (
            <motion.div
              key="proUpgrade"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Current Status */}
              {summary.isPro && (
                <div className="p-4 rounded-xl bg-gold/20 border border-gold/40 flex items-center gap-3">
                  <Star className="w-6 h-6 text-gold" />
                  <div>
                    <p className="font-semibold text-gold">Pro Member!</p>
                    <p className="text-sm text-muted-foreground">{summary.proExpiry}</p>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="p-4 rounded-xl bg-muted/30 border border-gold/20">
                <h3 className="font-semibold text-gold mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Pro Features
                </h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-amber-glow" />
                    Timer Challenges - Beat the clock!
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-glow" />
                    2x Coin Multiplier on all levels
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-glow" />
                    Exclusive Pro badge
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-glow" />
                    Priority support
                  </li>
                </ul>
              </div>

              {/* Pricing Cards */}
              <div className="grid gap-3">
                {/* Monthly */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl border-2 border-gold/30 bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{proPlans.monthly.name}</h4>
                      <p className="text-sm text-muted-foreground">{proPlans.monthly.description}</p>
                    </div>
                    <Button
                      variant="royal"
                      onClick={() => handlePurchaseClick('proUpgrade', 'monthly')}
                      disabled={summary.isPro || isProcessing}
                    >
                      ₹{proPlans.monthly.price}/mo
                    </Button>
                  </div>
                </motion.div>

                {/* Lifetime - Best Value */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl border-2 border-gold bg-gold/10 relative"
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-primary-foreground text-xs font-bold">
                    BEST VALUE
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-semibold text-gold">{proPlans.lifetime.name}</h4>
                      <p className="text-sm text-muted-foreground">{proPlans.lifetime.description}</p>
                    </div>
                    <Button
                      variant="treasure"
                      onClick={() => handlePurchaseClick('proUpgrade', 'lifetime')}
                      disabled={summary.isPro || isProcessing}
                    >
                      ₹{proPlans.lifetime.price}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Restore Purchases */}
        <div className="mt-6 pt-4 border-t border-gold/20">
          <button
            onClick={handleRestorePurchases}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors py-2"
          >
            <RefreshCw className="w-4 h-4" />
            Restore Previous Purchases
          </button>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>256-bit Encrypted • Secure UPI Payment</span>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && pendingPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="gradient-card rounded-xl border-ornate p-6 max-w-sm w-full text-center"
            >
              <Crown className="w-12 h-12 text-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gold mb-2">Confirm Purchase</h3>
              <p className="text-muted-foreground mb-4">
                {pendingPurchase.type === 'removeAds' 
                  ? PURCHASE_PLANS.removeAds[pendingPurchase.plan].name
                  : PURCHASE_PLANS.proUpgrade[pendingPurchase.plan].name
                }
              </p>
              <p className="text-2xl font-bold text-gold mb-6">
                ₹{pendingPurchase.type === 'removeAds' 
                  ? PURCHASE_PLANS.removeAds[pendingPurchase.plan].price
                  : PURCHASE_PLANS.proUpgrade[pendingPurchase.plan].price
                }
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="royalOutline"
                  className="flex-1"
                  onClick={() => {
                    setShowConfirmation(false);
                    setPendingPurchase(null);
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="treasure"
                  className="flex-1"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
