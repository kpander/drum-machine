"use strict";
/*global document, Audio*/

class Track {
  constructor(soundFile, totalBeats) {
    this.file = soundFile;
    this.name = this.file.split("/").pop().split(".")[0];

    // Keep track of each beat whether it's active (true) or not (false).
    // Active beats are played. Inactive beats are silent.
    this.state = Array(totalBeats).fill(false);
    this.audio = new Audio(soundFile); // @todo preload soundfile
  }

  get trackName() {
    return this.name;
  }

  toggle(beatIndex) {
    this.state[beatIndex] = !this.state[beatIndex];
  }

  play(beatNum) {
    if (this.state[beatNum]) {
      this.audio.play();
    }
  }
}

class Tracks {
  constructor(config, soundFiles = []) {
    this.config = config;

    this.tracks = [];
    soundFiles.forEach(soundFile => {
      this.add(soundFile);
    });

    this.pads = 0;
    this.activeSteps = 0;
    this.currentStep = 0;
    this.isPlaying = false;
    this.intervalId;

    // List of objects who are subscribed to me. When my configuration changes,
    // I notify all of these objects about the new configuration values.
    // This is typically the UI.
    this.subscribed = [];
  }

  add(soundFile) {
    const totalBeats = this.config.bars * this.config.beats;
    this.tracks.push(new Track(soundFile, totalBeats));
  }

  get trackNames() {
    return this.tracks.map(track => {
      return track.trackName;
    });
  }


  toggle(options = {}) {
    this.tracks[options.trackIndex].toggle(options.beatIndex);
  }

  subscribeToConfigChanges(obj) {
    this.subscribed.push(obj);
    return this.config;
  }
  notifyConfigChanged() {
    this.subscribed.forEach(obj => {
      obj.updateConfig(this.config);
    });
  }
}

class UI {
  constructor(elRoot, tracks) {
    this.elRoot = elRoot;
    this.tracks = tracks;
    this.config = this.tracks.subscribeToConfigChanges(this);
  }

  updateConfig(newConfig) {
    console.log("UI was told that config changed");
    // @todo should we update display?
    // - if bars is different, yes
    // - if beats is different, yes
    this.config = newConfig;
  }

  draw() {
    this.elRoot.replaceChildren();

    this.tracks.trackNames.forEach((name, i) => {
      console.log("add track", name);
      this.elRoot.appendChild(this._draw_track(name, i));
    });
  }

  _draw_track(name, trackIndex) {
    const elPad = this._el("div", "pad");
    const elTitle = this._el("div", "title");
    elTitle.textContent = name;
    elPad.appendChild(elTitle);

    const elStepsContainer = this._el("div", "steps-container");
    const count = this.config.bars * this.config.beats;
    elStepsContainer.style.gridTemplateColumns = `repeat(${count}, 1fr)`;

    for (let i = 0; i < count; i++) {
      const elStep = this._el("div", "step");
      if (i % this.config.bars === 0) elStep.classList.add("bar-first");

      elStep.dataset.trackIndex = trackIndex;
      elStep.dataset.beatIndex = i;
      elStep.addEventListener("click", this.onClickBeat.bind(this), false);
      elStepsContainer.appendChild(elStep);
    }

    elPad.appendChild(elStepsContainer);
    return elPad;
  }

  _el(type, className) {
    const el = document.createElement(type);
    el.classList.add(className);
    return el;
  }

  /**
   * A specific beat of a specific track was clicked. Toggle its on/off value.
   */
  onClickBeat(event) {
    const trackIndex = parseInt(event.target.dataset.trackIndex);
    const beatIndex = parseInt(event.target.dataset.beatIndex);

    this.tracks.toggle({ trackIndex: trackIndex, beatIndex: beatIndex });

    event.target.classList.toggle("active");
  }
}

const soundFiles = [
  "sounds/kick.mp3",
  "sounds/snare.mp3",
  "sounds/open-hat.mp3",
  "sounds/closed-hat.mp3",
];

const config = {
  bars: 4,
  beats: 4,
  bpm: 120,
};
const tracks = new Tracks(config, soundFiles);
const ui = new UI(document.querySelector(".container"), tracks);
ui.draw();


let numSteps;
let numBars;
let numSpeed;

let pads;
let activeSteps;
let currentStep = 0;
let isPlaying = false;
let intervalId;

function init(buttons) {
  numSteps = document.getElementById("numBeats").value;
  numBars = document.getElementById("numBars").value;
  numSpeed = buttons.speed.value;
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
}

function changeSpeed() {
  console.log("range changed");
  clearInterval(intervalId);
  restartInterval();
}


const bindButtons = function() {
  let buttons = {
    reset: document.getElementById("reset"),
    speed: document.getElementById("numSpeed"),
    playPause: document.getElementById("playPause"),
  };
  buttons.reset.addEventListener("click", reset);
  buttons.speed.addEventListener("change", changeSpeed);
  buttons.playPause.addEventListener("click", togglePlayPause);

  return buttons;
};

//init(bindButtons());

