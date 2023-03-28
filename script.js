"use strict";
/*global document, Audio*/

class Track {
  constructor(soundFile, totalBeats) {
    this.file = soundFile;
    this.name = this.file.split("/").pop().split(".")[0];

    // Keep track of each beat whether it's active (true) or not (false).
    // Active beats are played. Inactive beats are silent.
    this.state = Array(totalBeats).fill(false);
    this.audioPreload = new Audio(this.file); // @todo preload audio?

    // @todo ability to mute a track
    this.isMute = false;
  }

  get trackName() {
    return this.name;
  }

  toggle(beatIndex) {
    this.state[beatIndex] = !this.state[beatIndex];
  }

  _play(beatNum) {
    if (this.isMute) return;

    if (this.state[beatNum]) {
      const audio = new Audio(this.file);
      audio.play();
    }
  }

  onEvent(eventName, packet) {
    if (eventName === "tick") this._play(packet.currentBeat);
  }

}

class Tracks {
  constructor(config) {
    // @todo ability to define bars/beats, e.g., 7, then 5, then 7, then 8
    this.config = config;

    this.intervalId;

    // List of objects who are subscribed to me. When my configuration changes,
    // I notify all of these objects about the new configuration values.
    // This is typically the UI.
    this.subscribed = [];

  }

  init() {
    this.isPlaying = false;
    this.currentBeat = 0; // Which beat in the entire sequence is playing now.
    this.subscribers = {};
    this.tracks = [];

    this.config.soundFiles.forEach(soundFile => {
      this._add(soundFile);
    });
  }

  _add(soundFile) {
    const totalBeats = this.config.bars * this.config.beats;
    const track = new Track(soundFile, totalBeats);
    this.tracks.push(track);
    this.subscribe("tick", track);
  }

  get trackNames() {
    return this.tracks.map(track => {
      return track.trackName;
    });
  }

  /**
   * Toggle the active state of the given track and beat. We forward this
   * message to the affected track object.
   */
  toggleBeat(options = {}) {
    this.tracks[options.trackIndex].toggle(options.beatIndex);
  }

  play() {
    if (this.isPlaying) {
      // Pause the playback.
      this.isPlaying = false;
      this._stop_interval();
    } else {
      // Start/resume the playback.
      this.isPlaying = true;
      this._start_interval();
    }
  }

  _start_interval() {
    const delay = 60000 / (this.config.bpm * this.config.beats);
    this.intervalId = setInterval(() => {
      this._broadcast("tick", { currentBeat: this.currentBeat });

      this.currentBeat++;
      if (this.currentBeat >= (this.config.bars * this.config.beats)) {
        this.currentBeat = 0;
      }
    }, delay);
  }

  _stop_interval() {
    clearInterval(this.intervalId);
  }
  
  _broadcast(eventName, packet) {
    if (!this.subscribers[eventName]) return;

    this.subscribers[eventName].forEach(obj => {
      obj.onEvent(eventName, packet);
    });
  }

  subscribe(eventName, obj) {
    if (!this.subscribers[eventName]) this.subscribers[eventName] = [];

    if (!this.subscribers[eventName].includes(obj)) {
      this.subscribers[eventName].push(obj);
    }
  }

}

class UI {
  constructor(els, tracks) {
    this.els = els;
    this.tracks = tracks;
    this.config = tracks.config;
    this._bind_controls();
  }

  init() {
    this.tracks.subscribe("tick", this);
    this.draw();
  }

  /**
   * Add click events to the UI controls.
   */
  _bind_controls() {
    this.els.btnReset.addEventListener("click", this.onClickReset.bind(this), false);
    this.els.btnPlay.addEventListener("click", this.onClickPlay.bind(this), false);
    this.els.inpSpeed.addEventListener("change", this.onChangeSpeed);
  }

  onClickReset(event) {
    if (this.tracks.isPlaying) {
      this.onClickPlay(event);
    }
    this.tracks.init();
    this.init();
  }

  onClickPlay(event) {
    this.tracks.play();
    this.els.btnPlay.textContent = this.tracks.isPlaying ? "Pause" : "Play";
  }

  onChangeSpeed(event) {
    console.log("change speed");
  }

  draw() {
    this.els.root.replaceChildren();

    this.tracks.trackNames.forEach((name, i) => {
      this.els.root.appendChild(this._draw_track(name, i));
    });
  }

  _draw_track(name, trackIndex) {
    const elTrack = this._el("div", "track");
    const elTitle = this._el("div", "title");
    elTitle.textContent = name;
    elTrack.appendChild(elTitle);

    const count = this.config.bars * this.config.beats;
    const elBeatsContainer = this._el("div", "beats-container");
    elBeatsContainer.style.gridTemplateColumns = `repeat(${count}, 1fr)`;

    for (let i = 0; i < count; i++) {
      elBeatsContainer.appendChild(this._draw_beat(trackIndex, i));
    }

    elTrack.appendChild(elBeatsContainer);
    return elTrack;
  }

  _draw_beat(trackIndex, beatIndex) {
    const elBeat = this._el("div", "beat");
    if (beatIndex % this.config.bars === 0) elBeat.classList.add("bar-first");

    elBeat.dataset.trackIndex = trackIndex;
    elBeat.dataset.beatIndex = beatIndex;
    elBeat.addEventListener("click", this.onClickBeat.bind(this), false);

    return elBeat;
  }

  /**
   * Create a new DOM element and apply the given class name.
   */
  _el(type, className) {
    const el = document.createElement(type);
    el.classList.add(className);
    return el;
  }

  /**
   * User clicked a specific beat of a specific track. Toggle its value.
   *
   * @param object event - the clicked element from the event listener
   */
  onClickBeat(event) {
    const trackIndex = parseInt(event.target.dataset.trackIndex);
    const beatIndex = parseInt(event.target.dataset.beatIndex);

    this.tracks.toggleBeat({ trackIndex: trackIndex, beatIndex: beatIndex });

    event.target.classList.toggle("active");
  }

  onEvent(eventName, packet) {
    if (eventName === "tick") this._show_active_beat(packet.currentBeat);
  }

  _show_active_beat(currentBeat) {
    // Remove all current highlights.
    const elsCurrent = document.querySelectorAll(".beat.highlight");
    elsCurrent.forEach(el => {
      el.classList.remove("highlight");
    });

    // Add highlights to the current beat.
    const elsActive = document.querySelectorAll(`.beat[data-beat-index="${currentBeat}"]`);
    elsActive.forEach(el => {
      el.classList.add("highlight");
    });
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
