const socket = new WebSocket("ws://localhost:3000");
const outputEl = document.querySelector("#output");

const synth = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext)();
const osc = synth.createOscillator();
const gain = synth.createGain();

osc.connect(gain);
osc.frequency.value = 500;
gain.gain.value = 100;

const calibrationSize = 20;
let calibrationCounter = 0;
let median = 0;
let state = "CALIBRATING";

// This is a 50ms loop
socket.onmessage = function(event) {
  const rawY = Number(event.data);
  if (rawY < 1500 || rawY > 2500) return;

  if (state === "CALIBRATING") {
    if (calibrationCounter < calibrationSize) {
      median += rawY;
      calibrationCounter++;
    } else if (calibrationCounter === calibrationSize) {
      median = Math.floor(median / calibrationSize);
      state = "RUNNING";
    }
  }

  if (state === "RUNNING") {
    const diff = rawY - median;
    outputEl.innerText = diff;
    osc.frequency.value = 500 - diff;
  }
};

document.querySelector("#calibrate").addEventListener("click", () => {
  median = 0;
  calibrationCounter = 0;
  state = "CALIBRATING";
});

document.querySelector("#start").addEventListener("click", () => {
  gain.connect(synth.destination);
  try {
    osc.start();
  } catch(e) {
    // we don't care that it already started
  }
});

document.querySelector("#stop").addEventListener("click", () => {
  gain.disconnect(synth.destination);
});
