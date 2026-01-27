import { motion } from 'framer-motion';
import { Coins, Zap, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { soundService } from '@/lib/soundService';

interface HeaderProps {
  coins: number;
  energy: number;
  maxEnergy?: number;
}

export const Header = ({ coins, energy, maxEnergy = 5 }: HeaderProps) => {
  const [isMuted, setIsMuted] = useState(soundService.isMuted());

  const toggleSound = () => {
    const newMuted = soundService.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      soundService.play('click');
    }
  };

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 gradient-card border-b-2 border-gold/30 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-xl md:text-2xl font-bold text-gold text-shadow-gold tracking-wider">
            తెనాలి రామ
          </span>
        </motion.div>

        {/* Stats */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Coins */}
          <motion.div 
            className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-gold/30"
            whileHover={{ scale: 1.05 }}
          >
            <Coins className="w-5 h-5 text-gold animate-pulse-gold" />
            <span className="text-gold font-semibold text-sm md:text-base">
              {coins.toLocaleString()}
            </span>
          </motion.div>

          {/* Energy */}
          <motion.div 
            className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-gold/30"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-5 h-5 text-amber-glow" />
            <div className="flex gap-0.5">
              {Array.from({ length: maxEnergy }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-4 rounded-sm ${
                    i < energy ? 'bg-amber-glow' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Sound Toggle */}
          <motion.button
            onClick={toggleSound}
            className="p-2 rounded-full bg-muted/50 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};
