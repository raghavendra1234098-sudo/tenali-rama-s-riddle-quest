import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Brain, Lock, Check, Sparkles, RefreshCw, X, Gem, Shield } from 'lucide-react';
import { 
  SUBSCRIPTION_PLANS, 
  generateUPIPaymentLink, 
  activateSubscription,
  restorePurchase,
  type SubscriptionPlan 
} from '@/lib/subscriptionService';
import { soundService } from '@/lib/soundService';

interface PaywallScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionActivated: () => void;
}

// Floating particle component for background effects
const FloatingParticle = ({ delay, duration, size }: { delay: number; duration: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-gold/20"
    style={{ width: size, height: size }}
    initial={{ 
      x: Math.random() * 300 - 150, 
      y: 300,
      opacity: 0 
    }}
    animate={{ 
      y: -100,
      opacity: [0, 0.8, 0],
      scale: [0.5, 1, 0.5]
    }}
    transition={{ 
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
  />
);

// Sparkle effect component
const SparkleEffect = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <FloatingParticle 
        key={i} 
        delay={i * 0.4} 
        duration={3 + Math.random() * 2}
        size={4 + Math.random() * 6}
      />
    ))}
  </div>
);

export const PaywallScreen = ({ isOpen, onClose, onSubscriptionActivated }: PaywallScreenProps) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Pulsing glow effect
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isOpen]);

  const benefits = [
    { icon: Brain, text: '600 Genius-Level Riddles', color: 'text-purple-400', gradient: 'from-purple-500 to-purple-700' },
    { icon: Star, text: 'Exclusive Telugu Wisdom', color: 'text-gold', gradient: 'from-amber-400 to-amber-600' },
    { icon: Zap, text: 'No Ads on Premium Levels', color: 'text-blue-400', gradient: 'from-blue-400 to-blue-600' },
    { icon: Crown, text: 'Expert & Genius Challenges', color: 'text-amber-400', gradient: 'from-yellow-400 to-orange-500' },
    { icon: Gem, text: 'Rare Cultural Treasures', color: 'text-emerald-400', gradient: 'from-emerald-400 to-emerald-600' },
    { icon: Shield, text: 'Lifetime Progress Saved', color: 'text-rose-400', gradient: 'from-rose-400 to-rose-600' },
  ];

  const handlePurchase = () => {
    soundService.play('click');
    setShowPaymentConfirm(true);
  };

  const handleOpenUPI = () => {
    const upiLink = generateUPIPaymentLink(selectedPlan);
    window.location.href = upiLink;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      handlePaymentConfirmation();
    }, 3000);
  };

  const handlePaymentConfirmation = () => {
    const transactionId = `TXN${Date.now()}`;
    activateSubscription(selectedPlan, transactionId);
    soundService.play('coin');
    onSubscriptionActivated();
    setShowPaymentConfirm(false);
    onClose();
  };

  const handleRestore = () => {
    soundService.play('click');
    const restored = restorePurchase();
    if (restored) {
      soundService.play('coin');
      onSubscriptionActivated();
      onClose();
    }
  };

  const glowOpacity = 0.3 + (Math.sin(glowIntensity * 0.1) * 0.2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            boxShadow: `0 0 60px hsl(45 85% 55% / ${glowOpacity}), 0 0 120px hsl(45 85% 55% / ${glowOpacity * 0.5}), inset 0 1px 0 hsl(45 85% 70% / 0.3)`
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 z-0"
            animate={{
              background: [
                'linear-gradient(135deg, hsl(280 50% 15%) 0%, hsl(0 60% 12%) 50%, hsl(280 50% 15%) 100%)',
                'linear-gradient(135deg, hsl(0 60% 12%) 0%, hsl(280 50% 15%) 50%, hsl(0 60% 12%) 100%)',
                'linear-gradient(135deg, hsl(280 50% 15%) 0%, hsl(0 60% 12%) 50%, hsl(280 50% 15%) 100%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          {/* Sparkle effects */}
          <SparkleEffect />

          {/* Premium Header with enhanced effects */}
          <div className="relative z-10 bg-gradient-to-br from-purple-900/60 via-crimson-dark/80 to-purple-900/60 p-6 text-center">
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(ellipse at 0% 0%, hsl(45 85% 55% / 0.4) 0%, transparent 50%)',
                  'radial-gradient(ellipse at 100% 100%, hsl(45 85% 55% / 0.4) 0%, transparent 50%)',
                  'radial-gradient(ellipse at 0% 0%, hsl(45 85% 55% / 0.4) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            {/* Crown icon with glow */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2, damping: 15 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px hsl(45 85% 55% / 0.5), 0 0 40px hsl(45 85% 55% / 0.3)',
                    '0 0 40px hsl(45 85% 55% / 0.8), 0 0 80px hsl(45 85% 55% / 0.5)',
                    '0 0 20px hsl(45 85% 55% / 0.5), 0 0 40px hsl(45 85% 55% / 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gold text-shadow-gold mb-2"
            >
              Unlock Genius Content
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gold-light/80 text-sm"
            >
              Access 600 Premium Telugu Riddles
            </motion.p>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <Badge className="mt-3 bg-gradient-to-r from-gold/30 to-amber-600/30 text-gold border-gold/50 px-4 py-1">
                <Lock className="w-3 h-3 mr-1" />
                Levels 401-1000
              </Badge>
            </motion.div>
          </div>

          <div className="relative z-10 p-6 space-y-5 bg-gradient-to-b from-card/95 to-card">
            {/* Benefits with staggered animation */}
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index + 0.5 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-default"
                >
                  <motion.div 
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <benefit.icon className="w-4 h-4 text-white" />
                  </motion.div>
                  <span className="text-foreground text-sm font-medium flex-1">{benefit.text}</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 * index + 0.7 }}
                  >
                    <Check className="w-5 h-5 text-green-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Plan Selection with enhanced styling */}
            <div className="grid grid-cols-2 gap-3">
              {/* Monthly Plan */}
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedPlan('monthly');
                  soundService.play('click');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all overflow-hidden ${
                  selectedPlan === 'monthly'
                    ? 'border-gold bg-gradient-to-br from-gold/20 to-amber-600/10 shadow-gold'
                    : 'border-muted-foreground/30 bg-muted/20 hover:border-gold/50'
                }`}
              >
                {selectedPlan === 'monthly' && (
                  <motion.div
                    layoutId="planSelector"
                    className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"
                  />
                )}
                <div className="relative z-10">
                  <div className="text-sm text-muted-foreground mb-1">Monthly</div>
                  <div className="text-2xl font-bold text-gold">₹{SUBSCRIPTION_PLANS.monthly.price}</div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
              </motion.button>

              {/* Yearly Plan */}
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedPlan('yearly');
                  soundService.play('click');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all overflow-hidden ${
                  selectedPlan === 'yearly'
                    ? 'border-gold bg-gradient-to-br from-gold/20 to-amber-600/10 shadow-gold'
                    : 'border-muted-foreground/30 bg-muted/20 hover:border-gold/50'
                }`}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs border-0 shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    BEST VALUE
                  </Badge>
                </motion.div>
                {selectedPlan === 'yearly' && (
                  <motion.div
                    layoutId="planSelector"
                    className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"
                  />
                )}
                <div className="relative z-10 pt-2">
                  <div className="text-sm text-muted-foreground mb-1">Yearly</div>
                  <div className="text-2xl font-bold text-gold">₹{SUBSCRIPTION_PLANS.yearly.price}</div>
                  <div className="text-xs text-green-500 font-medium">{SUBSCRIPTION_PLANS.yearly.savings}</div>
                </div>
              </motion.button>
            </div>

            {/* Enhanced Purchase Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="royal"
                size="xl"
                className="w-full text-lg py-7 relative overflow-hidden group"
                onClick={handlePurchase}
                disabled={isProcessing}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                    Subscribe Now - ₹{SUBSCRIPTION_PLANS[selectedPlan].price}
                  </>
                )}
              </Button>
            </motion.div>

            {/* Restore Purchase */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleRestore}
              className="w-full text-center text-sm text-gold/70 hover:text-gold underline underline-offset-4 transition-colors"
            >
              Restore Previous Purchase
            </motion.button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center opacity-70">
              Subscription unlocks Levels 401-1000. Access persists until expiry.
            </p>
          </div>

          {/* Payment Confirmation Modal */}
          <AnimatePresence>
            {showPaymentConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/98 flex flex-col items-center justify-center p-6 z-50"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 30 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 30 }}
                  className="text-center space-y-5"
                >
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 30px hsl(45 85% 55% / 0.5)',
                        '0 0 60px hsl(45 85% 55% / 0.8)',
                        '0 0 30px hsl(45 85% 55% / 0.5)',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-20 h-20 mx-auto rounded-full gradient-gold flex items-center justify-center"
                  >
                    <Crown className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gold">Complete Payment</h3>
                  
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Click below to open your UPI app and complete the payment of 
                    <span className="text-gold font-bold"> ₹{SUBSCRIPTION_PLANS[selectedPlan].price}</span>
                  </p>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="royal"
                      size="lg"
                      className="w-full relative overflow-hidden"
                      onClick={handleOpenUPI}
                      disabled={isProcessing}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Opening UPI App...
                        </>
                      ) : (
                        <>Pay ₹{SUBSCRIPTION_PLANS[selectedPlan].price} via UPI</>
                      )}
                    </Button>
                  </motion.div>

                  <Button
                    variant="ghost"
                    onClick={() => setShowPaymentConfirm(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>

                  <button
                    onClick={handlePaymentConfirmation}
                    className="text-xs text-gold/50 hover:text-gold underline mt-4 block mx-auto"
                  >
                    I've completed the payment
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
