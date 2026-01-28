import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coins, Zap, Crown, ShieldCheck, X } from 'lucide-react';

interface StoreProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (packageType: 'small' | 'large') => void;
}

const MERCHANT_UPI_ID = "8328372587@fam";
const MERCHANT_NAME = "Tenali Rama: Wisdom & Wit";

export const Store = ({ isOpen, onClose, onPurchase }: StoreProps) => {
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
        className="gradient-card rounded-2xl border-ornate p-6 md:p-8 max-w-lg w-full relative"
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
          <p className="text-muted-foreground text-sm mt-1">Purchase gold to unlock hints & skip levels</p>
        </div>

        {/* Packages */}
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

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>256-bit Encrypted • Secure UPI Payment</span>
        </div>

        {/* Energy Refill Option */}
        <div className="mt-4 pt-4 border-t border-gold/20">
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
    </motion.div>
  );
};
