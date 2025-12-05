const soundEffects = {
  pREssMe: "sound/1.mp3",
  PRESSME: "sound/2.mp3",
  prESSSmE: "sound/3.mp3",
  pressme: "sound/4.mp3",
  PReSsMe: "sound/5.mp3",
};

// One shared audio context for FX
const fxContext = new (window.AudioContext || window.webkitAudioContext)();

// Keep track of state per effect
// fxState[name] = { buffer, source, isPlaying }
const fxState = {};

async function loadEffectBuffer(name) {
  // if already loaded, reuse it
  if (fxState[name] && fxState[name].buffer) return fxState[name].buffer;

  const url = soundEffects[name];
  if (!url) return null;

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await fxContext.decodeAudioData(arrayBuffer);

  fxState[name] = fxState[name] || {};
  fxState[name].buffer = buffer;
  return buffer;
}

async function toggleEffect(name, buttonEl) {
  if (!soundEffects[name]) return;

  // ensure context is running (some browsers need this)
  if (fxContext.state === "suspended") {
    await fxContext.resume();
  }

  fxState[name] = fxState[name] || {
    buffer: null,
    source: null,
    isPlaying: false,
  };
  const state = fxState[name];

  // If it's currently playing → stop it
  if (state.isPlaying && state.source) {
    try {
      state.source.stop();
    } catch (e) {
      // ignore
    }
    state.source.disconnect();
    state.source = null;
    state.isPlaying = false;
    if (buttonEl) buttonEl.classList.remove("active");
    return;
  }

  // Otherwise, (re)load buffer if needed and start playing
  const buffer = await loadEffectBuffer(name);
  if (!buffer) return;

  const source = fxContext.createBufferSource();
  source.buffer = buffer;
  source.connect(fxContext.destination);

  // When it finishes, reset state
  source.onended = () => {
    state.isPlaying = false;
    state.source = null;
    if (buttonEl) buttonEl.classList.remove("active");
  };

  state.source = source;
  state.isPlaying = true;
  if (buttonEl) buttonEl.classList.add("active");

  source.start(0);
}

// Wire up the buttons
document.querySelectorAll(".fx-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.sound;
    toggleEffect(name, btn);
  });
});

document.querySelectorAll(".fx-btn1").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.sound;
    toggleEffect(name, btn);
  });
});
