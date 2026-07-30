import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/game/Header';
import { HomeScreen } from '@/components/game/HomeScreen';
import { LevelMap } from '@/components/game/LevelMap';
import { GameScreen } from '@/components/game/GameScreen';
import { Store } from '@/components/game/Store';
import { TimerChallenge } from '@/components/game/TimerChallenge';
import { SplashScreen } from '@/components/game/SplashScreen';
import { loadGameState, useEnergy, addCoins, type GameState } from '@/lib/gameState';
import { soundService } from '@/lib/soundService';
import { adService } from '@/lib/adService';
import { hasProUpgrade, hasRemovedAds } from '@/lib/purchaseService';

type Screen = 'splash' | 'home' | 'levels' | 'game' | 'store';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [showStore, setShowStore] = useState(false);
  const [showTimerChallenge, setShowTimerChallenge] = useState(false);

  // Initialize AdMob on app start
  useEffect(() => {
    adService.initialize();
  }, []);

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

  const handleSplashComplete = useCallback(() => {
    setScreen('home');
    soundService.playBackgroundMusic();
  }, []);

  const handleOpenTimerChallenge = () => {
    setShowStore(false);
    setShowTimerChallenge(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Splash Screen */}
      <AnimatePresence>
        {screen === 'splash' && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* Header - Visible after splash */}
      {screen !== 'splash' && (
        <Header 
          coins={gameState.totalCoins} 
          energy={gameState.energy}
          isPro={hasProUpgrade()}
        />
      )}

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
              onOpenTimerChallenge={() => {
                soundService.play('click');
                setShowTimerChallenge(true);
              }}
              currentLevel={gameState.currentLevel}
              completedLevels={gameState.completedLevels.length}
              isPro={hasProUpgrade()}
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
                // Show interstitial ad when leaving game (if not premium)
                adService.showInterstitialAd();
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
        onGameStateChange={refreshGameState}
        onOpenTimerChallenge={handleOpenTimerChallenge}
      />

      {/* Timer Challenge Modal */}
      <AnimatePresence>
        {showTimerChallenge && (
          <TimerChallenge
            isOpen={showTimerChallenge}
            onClose={() => setShowTimerChallenge(false)}
            onGameStateChange={refreshGameState}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
