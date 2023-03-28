"use strict";
/*global document, Audio*/

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

  setSpeed(newSpeed) {
    this.config.bpm = newSpeed;
    if (this.isPlaying) {
      this._stop_interval();
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

