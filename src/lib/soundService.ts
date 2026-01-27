// Sound service for game audio effects

class SoundService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;

  constructor() {
    this.preloadSounds();
    this.loadMuteState();
  }

  private preloadSounds() {
    const soundUrls: Record<string, string> = {
      click: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7f8a1bdc0c.mp3',
      coins: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8b8b2e1d41.mp3',
      fanfare: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3',
      correct: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_98a50f0bd4.mp3',
      wrong: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_fb1d1a3c8f.mp3',
    };

    Object.entries(soundUrls).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.5;
      this.sounds.set(name, audio);
    });
  }

  private loadMuteState() {
    const stored = localStorage.getItem('tenali_sound_muted');
    this.muted = stored === 'true';
  }

  play(soundName: string) {
    if (this.muted) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('tenali_sound_muted', String(this.muted));
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }
}

export const soundService = new SoundService();
