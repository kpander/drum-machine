const soundFiles = [
  "sounds/kick.mp3",
  "sounds/snare.mp3",
  "sounds/open-hat.mp3",
  "sounds/closed-hat.mp3",
];

const numSteps = 4;
const numBars = 4;

let pads = [];
let activeSteps = [];
let currentStep = 0;
let isPlaying = false;
let intervalId;

function init() {
  const container = document.querySelector(".container");

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

    for (let j = 0; j < numSteps * numBars; j++) {
      const step = document.createElement("div");
      step.classList.add("step");
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

function togglePlayPause() {
  if (isPlaying) {
    clearInterval(intervalId);
    isPlaying = false;
    this.textContent = "Play";
  } else {
    let currentStep = 0;
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
        steps[currentStep].classList.add("active");
        if (currentStep === 0) {
          steps[steps.length - 1].classList.remove("active");
        } else {
          steps[currentStep - 1].classList.remove("active");
        }
      }

      // Increment the step
      currentStep++;
      if (currentStep === numSteps * numBars) {
        currentStep = 0;
      }
    }, 60000 / (120 * numSteps));

    isPlaying = true;
    this.textContent = "Pause";
  }
}

init();

