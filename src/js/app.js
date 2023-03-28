"use strict";
/*global document, Audio*/

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
  soundFiles: soundFiles,
};
const tracks = new Tracks(config);
tracks.init();

const els = {
  root: document.querySelector(".container"),
  btnReset: document.getElementById("reset"),
  btnPlay: document.getElementById("playPause"),
  inpBars: document.getElementById("numBars"),
  inpBeats: document.getElementById("numBeats"),
  inpSpeed: document.getElementById("numSpeed"),
};
const ui = new UI(els, tracks);
ui.init();
