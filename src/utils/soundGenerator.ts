// Web Audio API를 사용하여 알람 사운드를 생성합니다
export class SoundGenerator {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // 긴급 알람 (사이렌 스타일)
  playUrgent(volume: number = 0.5): void {
    const ctx = this.getAudioContext();

    for (let i = 0; i < 4; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.25;

      // 주파수를 빠르게 올렸다 내림 (사이렌 효과)
      oscillator.frequency.setValueAtTime(700, startTime);
      oscillator.frequency.linearRampToValueAtTime(1400, startTime + 0.12);
      oscillator.frequency.linearRampToValueAtTime(700, startTime + 0.24);

      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(volume * 0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.24);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.25);
    }
  }

  // 명랑한 트리플 비프 (전자음)
  playCheerful(volume: number = 0.5): void {
    const ctx = this.getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (메이저 코드 + 옥타브)

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const startTime = ctx.currentTime + index * 0.1;

      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(volume * 0.5, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  }

  // 클래식 알람 (진동하는 벨 소리)
  playClassic(volume: number = 0.5): void {
    const ctx = this.getAudioContext();

    for (let i = 0; i < 6; i++) {
      // 두 개의 주파수를 약간 다르게 하여 진동 효과
      [880, 900].forEach((baseFreq) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const startTime = ctx.currentTime + i * 0.15;

        oscillator.frequency.value = baseFreq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume * 0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.14);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.15);
      });
    }
  }

  // 경기 시작 알림 (긴박한 트리플 팡파레)
  playGameStart(volume: number = 0.5): void {
    const ctx = this.getAudioContext();

    // 상승하는 3연속 팡파레 (긴박감 표현)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (메이저 코드)

    notes.forEach((freq, index) => {
      // 메인 톤
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const startTime = ctx.currentTime + index * 0.12;

      oscillator.frequency.value = freq;
      oscillator.type = 'square'; // 더 날카로운 소리

      gainNode.gain.setValueAtTime(volume * 0.6, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);

      // 배음 추가 (풍성한 소리)
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();

      harmonic.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);

      harmonic.frequency.value = freq * 2; // 옥타브 위
      harmonic.type = 'sine';

      harmonicGain.gain.setValueAtTime(volume * 0.3, startTime);
      harmonicGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

      harmonic.start(startTime);
      harmonic.stop(startTime + 0.12);
    });

    // 마지막에 강조음 추가
    const finalOsc = ctx.createOscillator();
    const finalGain = ctx.createGain();

    finalOsc.connect(finalGain);
    finalGain.connect(ctx.destination);

    const finalTime = ctx.currentTime + 0.4;
    finalOsc.frequency.value = 1046.50; // C6 (한 옥타브 높은 C)
    finalOsc.type = 'square';

    finalGain.gain.setValueAtTime(volume * 0.7, finalTime);
    finalGain.gain.exponentialRampToValueAtTime(0.01, finalTime + 0.25);

    finalOsc.start(finalTime);
    finalOsc.stop(finalTime + 0.25);
  }

  // 부드러운 종소리 (마림바 스타일)
  playGentle(volume: number = 0.5): void {
    const ctx = this.getAudioContext();
    // A메이저 펜타토닉 스케일로 평화로운 멜로디
    const melody = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    melody.forEach((freq, index) => {
      // 메인 톤
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const startTime = ctx.currentTime + index * 0.3;

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume * 0.6, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.2);

      oscillator.start(startTime);
      oscillator.stop(startTime + 1.2);

      // 배음 추가 (마림바 효과)
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();

      harmonic.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);

      harmonic.frequency.value = freq * 3;
      harmonic.type = 'sine';

      harmonicGain.gain.setValueAtTime(volume * 0.15, startTime);
      harmonicGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

      harmonic.start(startTime);
      harmonic.stop(startTime + 0.8);
    });
  }

  play(soundType: string, volume: number = 0.5): void {
    try {
      switch (soundType) {
        case 'urgent':
          this.playUrgent(volume);
          break;
        case 'cheerful':
          this.playCheerful(volume);
          break;
        case 'classic':
          this.playClassic(volume);
          break;
        case 'gentle':
          this.playGentle(volume);
          break;
        case 'gamestart':
          this.playGameStart(volume);
          break;
        default:
          this.playUrgent(volume);
          break;
      }
    } catch (error) {
      console.error('사운드 재생 실패:', error);
    }
  }
}

export const soundGenerator = new SoundGenerator();
