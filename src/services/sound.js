// Sound effects using Web Audio API
class SoundService {
  constructor() {
    this.context = null
    this.enabled = JSON.parse(localStorage.getItem('sound_enabled') ?? 'true')
    this.volume = parseFloat(localStorage.getItem('sound_volume') ?? '0.5')
  }

  getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this.context
  }

  // Generate a tone
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return
    
    try {
      const ctx = this.getContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * this.volume, ctx.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (e) {
      console.warn('Sound play failed:', e)
    }
  }

  // Message received sound - pleasant notification
  playMessageReceived() {
    if (!this.enabled) return
    this.playTone(880, 0.12, 'sine', 0.25)
    setTimeout(() => this.playTone(1100, 0.1, 'sine', 0.2), 80)
  }

  // Message sent sound - subtle click
  playMessageSent() {
    if (!this.enabled) return
    this.playTone(440, 0.08, 'sine', 0.15)
  }

  // Notification sound - louder
  playNotification() {
    if (!this.enabled) return
    this.playTone(660, 0.15, 'sine', 0.3)
    setTimeout(() => this.playTone(880, 0.15, 'sine', 0.3), 120)
    setTimeout(() => this.playTone(1100, 0.2, 'sine', 0.25), 240)
  }

  // User joined sound
  playJoin() {
    if (!this.enabled) return
    this.playTone(600, 0.1, 'sine', 0.2)
    setTimeout(() => this.playTone(800, 0.15, 'sine', 0.2), 100)
  }

  // Error sound
  playError() {
    if (!this.enabled) return
    this.playTone(200, 0.2, 'sawtooth', 0.15)
  }

  toggle() {
    this.enabled = !this.enabled
    localStorage.setItem('sound_enabled', JSON.stringify(this.enabled))
    return this.enabled
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol))
    localStorage.setItem('sound_volume', this.volume.toString())
  }

  isEnabled() {
    return this.enabled
  }
}

export const soundService = new SoundService()
export default soundService
