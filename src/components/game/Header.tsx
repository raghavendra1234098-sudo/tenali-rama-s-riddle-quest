import { motion } from 'framer-motion';
import { Coins, Zap, Volume2, VolumeX, Music, Music2, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { soundService } from '@/lib/soundService';

interface HeaderProps {
  coins: number;
  energy: number;
  maxEnergy?: number;
  isPro?: boolean;
}

export const Header = ({ coins, energy, maxEnergy = 5, isPro = false }: HeaderProps) => {
  const [isMuted, setIsMuted] = useState(soundService.isMuted());
  const [isMusicMuted, setIsMusicMuted] = useState(soundService.isMusicMuted());

  useEffect(() => {
    // Try to start background music on component mount
    if (!soundService.isMusicMuted()) {
      soundService.playBackgroundMusic();
    }
  }, []);

  const toggleSound = () => {
    const newMuted = soundService.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      soundService.play('click');
    }
  };

  const toggleMusic = () => {
    soundService.play('click');
    const newMusicMuted = soundService.toggleMusicMute();
    setIsMusicMuted(newMusicMuted);
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
          {/* Pro Badge */}
          {isPro && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold to-amber-glow"
            >
              <Crown className="w-3 h-3 text-primary-foreground" />
              <span className="text-xs font-bold text-primary-foreground">PRO</span>
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="flex items-center gap-2 md:gap-4">
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

          {/* Music Toggle */}
          <motion.button
            onClick={toggleMusic}
            className="p-2 rounded-full bg-muted/50 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={isMusicMuted ? "Play Music" : "Pause Music"}
          >
            {isMusicMuted ? <Music className="w-5 h-5" /> : <Music2 className="w-5 h-5" />}
          </motion.button>

          {/* Sound Toggle */}
          <motion.button
            onClick={toggleSound}
            className="p-2 rounded-full bg-muted/50 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};
