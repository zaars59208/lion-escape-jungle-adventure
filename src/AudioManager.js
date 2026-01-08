export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        this.gainNode.gain.value = 0.3; // Master volume

        this.musicPlaying = false;

        // NEW: Load background music asset
        this.bgMusic = new Audio('/assets/bg-music.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.5;

        // Parrot sounds
        this.parrotSounds = [
            new Audio('/assets/parrot-1.mp3'),
            new Audio('/assets/parrot-2.mp3')
        ];
        this.parrotSounds.forEach(s => s.volume = 0.3);
    }

    startMusic() {
        if (this.musicPlaying) return;
        this.musicPlaying = true;

        this.bgMusic.play().catch(e => {
            console.warn("Music play failed - likely needs interaction:", e);
        });
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
        this.musicPlaying = false;
    }

    playTone(freq, type, duration, volume, time) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, time || this.ctx.currentTime);

        g.gain.setValueAtTime(volume, time || this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, (time || this.ctx.currentTime) + duration);

        osc.connect(g);
        g.connect(this.gainNode);

        osc.start(time || this.ctx.currentTime);
        osc.stop((time || this.ctx.currentTime) + duration);
    }

    playNoise(duration, volume, filterFreq, time) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(volume, time || this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, (time || this.ctx.currentTime) + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, time || this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(g);
        g.connect(this.gainNode);

        noise.start(time || this.ctx.currentTime);
    }

    // SFX Methods
    playJump() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);

        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc.connect(g);
        g.connect(this.gainNode);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playEat() {
        // Quick "pop" sound
        this.playTone(800, 'triangle', 0.1, 0.3);
        setTimeout(() => this.playTone(400, 'triangle', 0.1, 0.2), 50);
    }

    playHitArrow() {
        // Metallic thwack
        this.playNoise(0.2, 0.4, 3000);
        this.playTone(200, 'sawtooth', 0.1, 0.2);
    }

    playDrown() {
        // Bubbling gurgle
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.playTone(100 + Math.random() * 200, 'sine', 0.2, 0.1), i * 100);
        }
    }

    playCaught() {
        // Rustling leaves
        this.playNoise(0.5, 0.3, 1000);
    }

    playRockThud() {
        // Heavy thud
        this.playTone(60, 'sine', 0.3, 0.5);
    }

    playSplash() {
        // Water splash sound
        const now = this.ctx.currentTime;
        this.playNoise(0.4, 0.4, 1500); // Main splash noise

        // Low bubbling sine wave
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(g);
        g.connect(this.gainNode);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    playParrot() {
        const sound = this.parrotSounds[Math.floor(Math.random() * this.parrotSounds.length)];
        sound.currentTime = 0;
        sound.play().catch(e => console.warn("Parrot sound failed:", e));
    }
}
