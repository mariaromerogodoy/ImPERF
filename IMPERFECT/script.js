const soundEffects = {
  pREssMe: "sound/1.mp3",
  PRESSME: "sound/2.mp3",
  prESSSmE: "sound/3.mp3",
  pressme: "sound/4.mp3",
  PReSsMe: "sound/5.mp3",
};

const fxContext = new (window.AudioContext || window.webkitAudioContext)();

const fxState = {};

async function loadEffectBuffer(name) {
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

  if (fxContext.state === "suspended") {
    await fxContext.resume();
  }

  fxState[name] = fxState[name] || {
    buffer: null,
    source: null,
    isPlaying: false,
  };
  const state = fxState[name];

  if (state.isPlaying && state.source) {
    try {
      state.source.stop();
    } catch (e) {}
    state.source.disconnect();
    state.source = null;
    state.isPlaying = false;
    if (buttonEl) buttonEl.classList.remove("active");
    return;
  }

  const buffer = await loadEffectBuffer(name);
  if (!buffer) return;

  const source = fxContext.createBufferSource();
  source.buffer = buffer;
  source.connect(fxContext.destination);

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
