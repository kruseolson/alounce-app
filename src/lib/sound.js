let ctx = null;

function getCtx() {
  if (ctx) return ctx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  ctx = new Ctx();
  return ctx;
}

function playNote(frequency, startOffset, duration) {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") {
    audio.resume().catch(() => {});
  }
  const start = audio.currentTime + startOffset;
  const end = start + duration;

  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
  gain.gain.linearRampToValueAtTime(0, end);

  osc.connect(gain);
  gain.connect(audio.destination);

  osc.start(start);
  osc.stop(end + 0.02);
}

export function playBeep() {
  try {
    playNote(880, 0, 0.18);
    playNote(1175, 0.2, 0.22);
  } catch (_) {
    // ignore — browsers may block audio without a user gesture
  }
}
