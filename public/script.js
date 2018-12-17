const socket = new WebSocket("ws://localhost:3000");
const outputEl = document.querySelector("#output");
const svg = document.querySelector("svg");

const synth = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext)();
const osc = synth.createOscillator();
const gain = synth.createGain();
let freq = 440;

const svgWidth = window.innerWidth * 2;
const xs = [];
const sinePath = document.querySelector("path");

for (let i = 0; i <= svgWidth; i++) {
  xs.push(i);
}

function drawSine() {
  const points = xs.map(x => {
    const factor = convertRange(freq, [0, 800], [70, 5]);
    const y = 125 + Math.sin(x / factor) * 100;
    return [x, y];
  });

  const path = "M" + points.map(p => {
    return p[0] + "," + p[1];
  }).join(" L");

  sinePath.setAttribute("d", path);
}

drawSine();

osc.connect(gain);
osc.frequency.value = 440;
gain.gain.value = 100;

const calibrationSize = 1;
let calibrationCounter = 0;
let median = 0;
let state = "CALIBRATING";

// This is a 50ms loop
socket.onmessage = function(event) {
  const rawY = Number(event.data);

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
    let diff = rawY - median;
    diff = Math.round(diff / 10) * 10;
    outputEl.innerText = diff;

    const oldFreq = freq;
    freq = 440 - diff;

    if (oldFreq !== freq) {
      drawSine();
    }

    osc.frequency.value = freq;
  }
};

document.querySelector("#calibrate").addEventListener("click", () => {
  median = 0;
  calibrationCounter = 0;
  state = "CALIBRATING";
});

document.querySelector("#start").addEventListener("click", () => {
  gain.connect(synth.destination);
  svg.classList.add("active");
  try {
    osc.start();
  } catch(e) {
    // we don't care that it already started
  }
});

document.querySelector("#stop").addEventListener("click", () => {
  svg.classList.remove("active");
  gain.disconnect(synth.destination);
});

function convertRange(value, oldRange, newRange) {
  if (Array.isArray(oldRange) && Array.isArray(newRange)) {
    return ((value - oldRange[0]) * (newRange[1] - newRange[0])) / (oldRange[1] - oldRange[0]) + newRange[0];
  }
  return ((value - oldRange.min) * (newRange.max - newRange.min)) / (oldRange.max - oldRange.min) + newRange.min;
}
