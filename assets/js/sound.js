/**
 * Audio Engine
 * Copyright (c) 2025 imsabbar
 */

class SoundManager {
  constructor() {
    this.enabled = false;
    this.context = null;
    this.oscillator = null;
    this.gainNode = null;
  }

  init() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.enabled = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  toggle() {
    if (!this.context) this.init();
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playClick() {
    if (!this.enabled || !this.context) return;
    
    // Create a short, high-pitched click sound
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    // Mechanical switch sound simulation
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.context.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  playError() {
    if (!this.enabled || !this.context) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.context.currentTime);
    
    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }
}

window.SoundManager = SoundManager;
