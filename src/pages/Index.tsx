import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/game/Header';
import { HomeScreen } from '@/components/game/HomeScreen';
import { LevelMap } from '@/components/game/LevelMap';
import { GameScreen } from '@/components/game/GameScreen';
import { Store } from '@/components/game/Store';
import { loadGameState, useEnergy, addCoins, type GameState } from '@/lib/gameState';
import { soundService } from '@/lib/soundService';

type Screen = 'home' | 'levels' | 'game' | 'store';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [showStore, setShowStore] = useState(false);

  const refreshGameState = useCallback(() => {
    setGameState(loadGameState());
  }, []);

  useEffect(() => {
    // Refresh state when returning to app
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshGameState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshGameState]);

  const handleStartGame = () => {
    if (useEnergy()) {
      soundService.play('click');
      refreshGameState();
      setScreen('game');
    } else {
      setShowStore(true);
    }
  };

  const handleLevelSelect = (level: number) => {
    if (gameState.unlockedLevels.includes(level)) {
      if (useEnergy()) {
        soundService.play('click');
        setGameState(prev => ({ ...prev, currentLevel: level }));
        setScreen('game');
      } else {
        setShowStore(true);
      }
    }
  };

  const handlePurchase = (packageType: 'small' | 'large') => {
    // In production, verify payment before adding coins
    // For now, this is just tracking the attempt
    console.log(`Purchase attempted: ${packageType}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Always visible */}
      <Header 
        coins={gameState.totalCoins} 
        energy={gameState.energy} 
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeScreen
              onStartGame={handleStartGame}
              onOpenStore={() => setShowStore(true)}
              onOpenLevels={() => {
                soundService.play('click');
                setScreen('levels');
              }}
              currentLevel={gameState.currentLevel}
              completedLevels={gameState.completedLevels.length}
            />
          </motion.div>
        )}

        {screen === 'levels' && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen gradient-royal pt-24 pb-8 px-4"
          >
            <LevelMap
              currentLevel={gameState.currentLevel}
              unlockedLevels={gameState.unlockedLevels}
              completedLevels={gameState.completedLevels}
              onLevelSelect={handleLevelSelect}
            />
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  soundService.play('click');
                  setScreen('home');
                }}
                className="text-gold hover:text-gold-light underline"
              >
                ← Back to Home
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GameScreen
              level={gameState.currentLevel}
              energy={gameState.energy}
              onBack={() => {
                soundService.play('click');
                refreshGameState();
                setScreen('home');
              }}
              onGameStateChange={refreshGameState}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Store Modal */}
      <Store
        isOpen={showStore}
        onClose={() => setShowStore(false)}
        onPurchase={handlePurchase}
      />
    </div>
  );
};

export default Index;
