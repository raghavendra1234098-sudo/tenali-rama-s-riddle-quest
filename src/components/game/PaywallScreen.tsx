import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Brain, Lock, Check, Sparkles, RefreshCw, X } from 'lucide-react';
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

export const PaywallScreen = ({ isOpen, onClose, onSubscriptionActivated }: PaywallScreenProps) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  const benefits = [
    { icon: Brain, text: '600 Genius-Level Riddles', color: 'text-purple-400' },
    { icon: Star, text: 'Exclusive Telugu Wisdom', color: 'text-gold' },
    { icon: Zap, text: 'No Ads on Premium Levels', color: 'text-blue-400' },
    { icon: Crown, text: 'Expert & Genius Challenges', color: 'text-amber-400' },
  ];

  const handlePurchase = () => {
    soundService.play('click');
    setShowPaymentConfirm(true);
  };

  const handleOpenUPI = () => {
    const upiLink = generateUPIPaymentLink(selectedPlan);
    
    // Open UPI app
    window.location.href = upiLink;
    
    setIsProcessing(true);
    
    // Show confirmation dialog after a delay
    setTimeout(() => {
      setIsProcessing(false);
      handlePaymentConfirmation();
    }, 3000);
  };

  const handlePaymentConfirmation = () => {
    // In production, verify payment with backend
    // For now, activate on confirmation
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md gradient-card border-ornate p-0 overflow-hidden">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-purple-900/80 via-crimson-dark to-purple-900/80 p-6 text-center">
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 20% 20%, hsl(45 85% 55% / 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 80%, hsl(45 85% 55% / 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 20%, hsl(45 85% 55% / 0.3) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center shadow-gold">
              <Crown className="w-10 h-10 text-primary-foreground" />
            </div>
          </motion.div>
          
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gold text-shadow-gold">
              Unlock Genius Content
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-gold-light/80 text-sm mt-2">
            Access 600 Premium Telugu Riddles
          </p>
          
          <Badge className="mt-3 bg-gold/20 text-gold border-gold/50">
            <Lock className="w-3 h-3 mr-1" />
            Levels 401-1000
          </Badge>
        </div>

        <div className="p-6 space-y-5">
          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
                </div>
                <span className="text-foreground text-sm">{benefit.text}</span>
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              </motion.div>
            ))}
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-2 gap-3">
            {/* Monthly Plan */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedPlan('monthly');
                soundService.play('click');
              }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-gold bg-gold/10'
                  : 'border-muted-foreground/30 bg-muted/30'
              }`}
            >
              <div className="text-sm text-muted-foreground mb-1">Monthly</div>
              <div className="text-xl font-bold text-gold">₹{SUBSCRIPTION_PLANS.monthly.price}</div>
              <div className="text-xs text-muted-foreground">per month</div>
            </motion.button>

            {/* Yearly Plan */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedPlan('yearly');
                soundService.play('click');
              }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selectedPlan === 'yearly'
                  ? 'border-gold bg-gold/10'
                  : 'border-muted-foreground/30 bg-muted/30'
              }`}
            >
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs">
                BEST VALUE
              </Badge>
              <div className="text-sm text-muted-foreground mb-1">Yearly</div>
              <div className="text-xl font-bold text-gold">₹{SUBSCRIPTION_PLANS.yearly.price}</div>
              <div className="text-xs text-green-500">{SUBSCRIPTION_PLANS.yearly.savings}</div>
            </motion.button>
          </div>

          {/* Purchase Button */}
          <Button
            variant="royal"
            size="lg"
            className="w-full text-lg py-6"
            onClick={handlePurchase}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Subscribe Now - ₹{SUBSCRIPTION_PLANS[selectedPlan].price}
              </>
            )}
          </Button>

          {/* Restore Purchase */}
          <button
            onClick={handleRestore}
            className="w-full text-center text-sm text-gold/70 hover:text-gold underline"
          >
            Restore Previous Purchase
          </button>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center">
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
              className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center p-6 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full gradient-gold flex items-center justify-center">
                  <Crown className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <h3 className="text-xl font-bold text-gold">Complete Payment</h3>
                
                <p className="text-muted-foreground text-sm">
                  Click the button below to open your UPI app and complete the payment of ₹{SUBSCRIPTION_PLANS[selectedPlan].price}
                </p>

                <Button
                  variant="royal"
                  size="lg"
                  className="w-full"
                  onClick={handleOpenUPI}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Opening UPI App...
                    </>
                  ) : (
                    <>
                      Pay ₹{SUBSCRIPTION_PLANS[selectedPlan].price} via UPI
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowPaymentConfirm(false)}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>

                {/* Manual confirmation for testing */}
                <button
                  onClick={handlePaymentConfirmation}
                  className="text-xs text-gold/50 hover:text-gold underline mt-4"
                >
                  I've completed the payment
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
