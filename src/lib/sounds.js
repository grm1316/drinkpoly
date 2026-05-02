function getCtx() {
  return new (window.AudioContext || window.webkitAudioContext)()
}

export function playRollSound() {
  try {
    const ctx = getCtx()
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * 0.4
        const src = ctx.createBufferSource()
        const gain = ctx.createGain()
        src.buffer = buf
        src.connect(gain)
        gain.connect(ctx.destination)
        gain.gain.setValueAtTime(0.25, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06)
        src.start()
      }, i * 140)
    }
  } catch {}
}

export function playLandSound() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch {}
}