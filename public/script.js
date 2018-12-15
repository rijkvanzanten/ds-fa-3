const socket = new WebSocket("ws://localhost:3000");
const outputEl = document.querySelector("#output");

const calibrationSize = 20;
let calibrationCounter = 0;
let median = 0;
let state = "CALIBRATING";

// This is a 50ms loop
socket.onmessage = function(event) {
  const rawZ = Number(event.data);
  if (rawZ < 1500 || rawZ > 2500) return;

  if (state === "CALIBRATING") {
    if (calibrationCounter < calibrationSize) {
      median += rawZ;
      calibrationCounter++;
    } else if (calibrationCounter === calibrationSize) {
      median = Math.floor(median / calibrationSize);
      state = "RUNNING";
    }
  }

  if (state === "RUNNING") {
    const diff = rawZ - median;
    outputEl.innerText = diff;
  }
};

document.querySelector("#calibrate").addEventListener("click", () => {
  median = 0;
  calibrationCounter = 0;
  state = "CALIBRATING";
});
