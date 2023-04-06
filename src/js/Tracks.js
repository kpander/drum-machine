"use strict";
/*global Track, AudioContext*/

class Tracks {
  constructor(state) {
    this._state = state;

    this._interval_id;

    // List of objects who are subscribed to me. When my configuration changes,
    // I notify all of these objects about the new configuration values.
    // This is typically the UI.
    this.subscribed = [];
    this._audio = null;
  }

  init() {
    this.isPlaying = false;
    this.currentBeat = 0; // Which beat in the entire sequence is playing now.
    this.subscribers = {};
    this.tracks = [];

    // Create each of the defined tracks.
    for (let trackIndex = 0; trackIndex < this._state.MAX_TRACKS; trackIndex++) {
      const keyState = `t${trackIndex}state`;
      const beatStates = this._state.getValue(keyState);
      if (beatStates !== false) {
        const keySound = `t${trackIndex}sound`;
        const trackSound = this._state.getValue(keySound);
        this._add(trackIndex, trackSound, beatStates);
      }
    }
  }

  _add(trackIndex, trackSound, trackState) {
    const track = new Track(this._state, trackIndex, trackSound, trackState);
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
    if (this._audio === null) this._initialize_audio();

    if (this.isPlaying) {
      this.isPlaying = false; // Pause
      this._stop_interval();
    } else {
      this.isPlaying = true;  // Resume
      this._start_interval();
    }
  }

  /**
   * Now that the user has pressed the "play" button, initialize the browser's
   * audio API. Ask each track to preload its audio file.
   */
  async _initialize_audio() {
    this._audio = new AudioContext();
    for (const track of this.tracks) {
      await track.preloadAudio(this._audio);
    }
  }

  setSpeed(newSpeed) {
    this._state.setValue("bpm", newSpeed);
    if (this.isPlaying) {
      this._stop_interval();
      this._start_interval();
    }
  }

  setVolume(trackIndex, newVolume) {
    this.tracks[trackIndex].setVolume(newVolume);
  }

  _start_interval() {
    const bpm = this._state.getValue("bpm");
    const totalBeats = this._state.getValue("barbeats").reduce((a, b) => {
      return a + b;
    }, 0);
    const delay = 60000 / (bpm * 4);

    this._interval_id = setInterval(() => {
      this._broadcast("tick", { currentBeat: this.currentBeat });

      this.currentBeat++;
      if (this.currentBeat >= totalBeats) {
        this.currentBeat = 0;
      }
    }, delay);
  }

  _stop_interval() {
    clearInterval(this._interval_id);
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

