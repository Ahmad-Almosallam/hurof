let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx || ctx.state === 'closed') ctx = new AudioContext();
  return ctx;
}

export async function unlockAudio() {
  const audioCtx = getContext();
  if (audioCtx.state === 'suspended') await audioCtx.resume();
}

export async function playWinSound() {
  const audioCtx = getContext();
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  // Victory fanfare — ascending major arpeggio with a final chord
  const sequence: { freq: number; start: number; duration: number; gain: number }[] = [
    { freq: 523.25, start: 0.0,  duration: 0.25, gain: 0.4 }, // C5
    { freq: 659.25, start: 0.18, duration: 0.25, gain: 0.4 }, // E5
    { freq: 783.99, start: 0.36, duration: 0.25, gain: 0.4 }, // G5
    { freq: 1046.50, start: 0.54, duration: 0.6, gain: 0.5 }, // C6 (hold)
    { freq: 783.99,  start: 0.54, duration: 0.6, gain: 0.3 }, // G5 (chord)
    { freq: 659.25,  start: 0.54, duration: 0.6, gain: 0.2 }, // E5 (chord)
  ];

  sequence.forEach(({ freq, start, duration, gain }) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'triangle';
    const t = audioCtx.currentTime + start;
    osc.frequency.setValueAtTime(freq, t);
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(gain, t + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  });
}

export async function playTimerEnd() {
  const audioCtx = getContext();
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  // Three short descending beeps — urgent alert
  const beeps: { freq: number; start: number }[] = [
    { freq: 880, start: 0.0 },
    { freq: 660, start: 0.18 },
    { freq: 440, start: 0.36 },
  ];

  beeps.forEach(({ freq, start }) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = 'square';
    const t = audioCtx.currentTime + start;
    osc.frequency.setValueAtTime(freq, t);
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.4, t + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.start(t);
    osc.stop(t + 0.14);
  });
}

export async function playBuzzer() {
  const audioCtx = getContext();

  if (audioCtx.state === 'suspended') await audioCtx.resume();

  const partials: { ratio: number; gain: number; decay: number }[] = [
    { ratio: 1.000, gain: 0.6,  decay: 2.5 },
    { ratio: 2.756, gain: 0.35, decay: 1.8 },
    { ratio: 5.404, gain: 0.2,  decay: 1.2 },
    { ratio: 8.933, gain: 0.1,  decay: 0.8 },
  ];

  const fundamental = 520;

  partials.forEach(({ ratio, gain, decay }) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamental * ratio, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + decay);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + decay);
  });
}
