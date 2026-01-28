// Sound service for game audio effects

class SoundService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private bgMusic: HTMLAudioElement | null = null;
  private muted: boolean = false;
  private musicMuted: boolean = false;
  private musicVolume: number = 0.3;

  constructor() {
    this.preloadSounds();
    this.loadMuteState();
    this.initBackgroundMusic();
  }

  private preloadSounds() {
    const soundUrls: Record<string, string> = {
      click: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7f8a1bdc0c.mp3',
      coins: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8b8b2e1d41.mp3',
      fanfare: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3',
      correct: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_98a50f0bd4.mp3',
      wrong: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_fb1d1a3c8f.mp3',
      whoosh: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8d0b6d4e2.mp3',
      pop: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c5e5b8f7a8.mp3',
      magic: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0ef87d4d1.mp3',
      levelUp: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1e1c9.mp3',
      hint: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2e6f0d0e4d.mp3',
    };

    Object.entries(soundUrls).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.5;
      this.sounds.set(name, audio);
    });
  }

  private initBackgroundMusic() {
    // Indian classical inspired ambient music
    this.bgMusic = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.musicVolume;
    this.bgMusic.preload = 'auto';
  }

  private loadMuteState() {
    const soundMuted = localStorage.getItem('tenali_sound_muted');
    const musicMuted = localStorage.getItem('tenali_music_muted');
    this.muted = soundMuted === 'true';
    this.musicMuted = musicMuted === 'true';
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

  playBackgroundMusic() {
    if (this.musicMuted || !this.bgMusic) return;
    this.bgMusic.play().catch(() => {
      // Ignore autoplay errors - will play on first user interaction
    });
  }

  pauseBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('tenali_sound_muted', String(this.muted));
    return this.muted;
  }

  toggleMusicMute(): boolean {
    this.musicMuted = !this.musicMuted;
    localStorage.setItem('tenali_music_muted', String(this.musicMuted));
    
    if (this.musicMuted) {
      this.pauseBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    
    return this.musicMuted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  isMusicMuted(): boolean {
    return this.musicMuted;
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.musicVolume;
    }
  }
}

export const soundService = new SoundService();
