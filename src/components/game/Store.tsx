import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coins, Zap, Crown, ShieldCheck, X, Ban, Star, Timer, ArrowRight } from 'lucide-react';
import { hasRemovedAds, hasProUpgrade } from '@/lib/purchaseService';

interface StoreProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (packageType: 'small' | 'large') => void;
  onOpenPremiumStore?: () => void;
  onOpenTimerChallenge?: () => void;
}

const MERCHANT_UPI_ID = "8639470264@ybl";
const MERCHANT_NAME = "Tenali Rama: Wisdom & Wit";

export const Store = ({ isOpen, onClose, onPurchase, onOpenPremiumStore, onOpenTimerChallenge }: StoreProps) => {
  const [activeTab, setActiveTab] = useState<'coins' | 'premium'>('coins');
  
  const adsRemoved = hasRemovedAds();
  const isPro = hasProUpgrade();

  if (!isOpen) return null;

  const packages = [
    {
      id: 'small',
      name: 'Gold Pouch',
      price: 49,
      coins: 500,
      bonus: '+50 bonus',
      icon: Coins,
      popular: false,
    },
    {
      id: 'large',
      name: 'Royal Treasury',
      price: 199,
      coins: 2500,
      bonus: '+500 bonus',
      icon: Crown,
      popular: true,
    },
  ];

  const handlePurchase = (pkg: typeof packages[0]) => {
    // Generate UPI payment link
    const upiLink = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${pkg.price}&cu=INR&tn=${encodeURIComponent(`${pkg.name} - Tenali Rama`)}`;
    
    // Open UPI app
    window.location.href = upiLink;
    
    // Track purchase attempt
    onPurchase(pkg.id as 'small' | 'large');
  };

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
          <p className="text-muted-foreground text-sm mt-1">Purchase gold & premium upgrades</p>
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

        <AnimatePresence mode="wait">
          {/* Coins Tab */}
          {activeTab === 'coins' && (
            <motion.div
              key="coins"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Coin Packages */}
              <div className="grid gap-4 mb-6">
                {packages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-4 rounded-xl border-2 ${
                      pkg.popular 
                        ? 'border-gold bg-gold/10' 
                        : 'border-gold/30 bg-muted/50'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-primary-foreground text-xs font-semibold">
                        BEST VALUE
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${pkg.popular ? 'gradient-gold' : 'bg-gold/20'}`}>
                          <pkg.icon className={`w-6 h-6 ${pkg.popular ? 'text-primary-foreground' : 'text-gold'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                          <p className="text-gold text-sm">
                            {pkg.coins.toLocaleString()} coins 
                            <span className="text-amber-glow ml-1">{pkg.bonus}</span>
                          </p>
                        </div>
                      </div>

                      <Button
                        variant={pkg.popular ? "treasure" : "royal"}
                        onClick={() => handlePurchase(pkg)}
                      >
                        ₹{pkg.price}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Energy Refill Option */}
              <div className="pt-4 border-t border-gold/20">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-glow" />
                    <span className="text-sm text-foreground">Refill Energy</span>
                  </div>
                  <Button variant="royalOutline" size="sm">
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
              {/* Remove Ads Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  adsRemoved 
                    ? 'border-accent/50 bg-accent/10' 
                    : 'border-crimson/50 bg-crimson/10 hover:border-crimson'
                }`}
                onClick={() => !adsRemoved && onOpenPremiumStore?.()}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${adsRemoved ? 'bg-accent/20' : 'bg-crimson/20'}`}>
                    <Ban className={`w-6 h-6 ${adsRemoved ? 'text-accent' : 'text-crimson'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      Remove Ads
                      {adsRemoved && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">ACTIVE</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {adsRemoved ? 'Enjoying ad-free experience!' : 'Enjoy uninterrupted gameplay'}
                    </p>
                  </div>
                  {!adsRemoved && (
                    <div className="flex items-center gap-1 text-crimson">
                      <span className="font-bold">₹49</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Pro Upgrade Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isPro 
                    ? 'border-gold/50 bg-gold/10' 
                    : 'border-gold/50 bg-gold/5 hover:border-gold'
                }`}
                onClick={() => !isPro && onOpenPremiumStore?.()}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${isPro ? 'gradient-gold' : 'bg-gold/20'}`}>
                    <Star className={`w-6 h-6 ${isPro ? 'text-primary-foreground' : 'text-gold'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      Pro Upgrade
                      {isPro && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">PRO</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isPro ? 'All Pro features unlocked!' : 'Timer Challenges + 2x Coins'}
                    </p>
                  </div>
                  {!isPro && (
                    <div className="flex items-center gap-1 text-gold">
                      <span className="font-bold">₹99</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.div>

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

              {/* View All Premium Options */}
              <Button
                variant="royal"
                className="w-full mt-4"
                onClick={onOpenPremiumStore}
              >
                <Crown className="w-4 h-4 mr-2" />
                View All Premium Options
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>256-bit Encrypted • Secure UPI Payment</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
