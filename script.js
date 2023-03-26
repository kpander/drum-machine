const soundFiles = [
  "sounds/kick.mp3",
  "sounds/snare.mp3",
  "sounds/open-hat.mp3",
  "sounds/closed-hat.mp3",
];

const resetButton = document.getElementById("reset");
const speedButton = document.getElementById("numSpeed");
let numSteps;
let numBars;
let numSpeed;

let pads;
let activeSteps;
let currentStep = 0;
let isPlaying = false;
let intervalId;

function init() {
  numSteps = document.getElementById("numBeats").value;
  numBars = document.getElementById("numBars").value;
  numSpeed = speedButton.value;
  pads = [];
  activeSteps = [];
  currentStep = 0;

  const container = document.querySelector(".container");
  container.replaceChildren();

  // Create the pads
  for (let i = 0; i < soundFiles.length; i++) {
    const pad = document.createElement("div");
    pad.classList.add("pad");

    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = soundFiles[i].split("/").pop().split(".")[0];
    pad.appendChild(title);

    const stepsContainer = document.createElement("div");
    stepsContainer.classList.add("steps-container");

    const count = numSteps * numBars;
    stepsContainer.style.gridTemplateColumns = `repeat(${count}, 1fr)`;

    for (let j = 0; j < numSteps * numBars; j++) {
      const step = document.createElement("div");
      step.classList.add("step");
      if (j % numSteps === 0) step.classList.add("bar-first");

      step.dataset.soundIndex = i;
      step.dataset.stepIndex = j;
      step.addEventListener("click", toggleStep);
      stepsContainer.appendChild(step);
    }

    pad.appendChild(stepsContainer);
    container.appendChild(pad);

    pads.push(pad);
    activeSteps.push(Array(numSteps * numBars).fill(false));
  }

  // Create the play/pause button
  const playPauseButton = document.createElement("button");
  playPauseButton.classList.add("play-pause-button");
  playPauseButton.textContent = "Play";
  playPauseButton.addEventListener("click", togglePlayPause);
  container.appendChild(playPauseButton);
}

function toggleStep(event) {
  const soundIndex = parseInt(event.target.dataset.soundIndex);
  const stepIndex = parseInt(event.target.dataset.stepIndex);
  activeSteps[soundIndex][stepIndex] = !activeSteps[soundIndex][stepIndex];
  event.target.classList.toggle("active");
}

function reset() {
  stop();
  init();
}

function stop() {
  clearInterval(intervalId);
  isPlaying = false;
  this.textContext = "Play";
}

function togglePlayPause() {
  if (isPlaying) {
    stop();
  } else {
    currentStep = 0;
    restartInterval();
    isPlaying = true;
    this.textContent = "Pause";
  }
}

function restartInterval() {
  numSpeed = document.getElementById("numSpeed").value;
  intervalId = setInterval(() => {
    // Play active pads for the current step
    for (let i = 0; i < pads.length; i++) {
      if (activeSteps[i][currentStep]) {
        const audio = new Audio(soundFiles[i]);
        audio.play();
      }
    }

    // Update the step highlight
    for (let i = 0; i < pads.length; i++) {
      const steps = pads[i].querySelectorAll(".step");
      steps[currentStep].classList.add("highlight");
      if (currentStep === 0) {
        steps[steps.length - 1].classList.remove("highlight");
      } else {
        steps[currentStep - 1].classList.remove("highlight");
      }
    }

    // Increment the step
    currentStep++;
    if (currentStep === numSteps * numBars) {
      currentStep = 0;
    }

  }, 60000 / (numSpeed * numSteps));
};

function changeSpeed() {
  console.log("range changed");
  clearInterval(intervalId);
  restartInterval();
}

resetButton.addEventListener("click", reset);
speedButton.addEventListener("change", changeSpeed);
init();

