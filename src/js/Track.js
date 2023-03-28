"use strict";
/*global document, Audio*/

// revise to use: https://web.dev/webaudio-intro/

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

