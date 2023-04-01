"use strict";
/*global Audio*/

// revise to use: https://web.dev/webaudio-intro/

class Track {
  /**
   * @param object state
   *   the singleton State class instance
   * @param int trackIndex
   *   which track number we are, used to identify our key in the State object
   * @param string trackSound
   *   character, index to the sound file for this track
   * @param array beatStates
   *   array of booleans, 1 for each beat in the track.
   *   true=on (plays the sound), false=off (silent)
   */
  constructor(state, trackIndex, trackSound, beatStates) {
    this._state = state;
    this._trackIndex = trackIndex;
    this._file = this._get_soundfile(trackSound);
    this.beatStates = beatStates;

    this.name = this._file.split("/").pop().split(".")[0];
    this._audio_preload = new Audio(this._file); // @todo preload audio?
  }

  _get_soundfile(key) {
    const soundFiles = {
      "a": "sounds/kick.mp3",
      "b": "sounds/snare.mp3",
      "c": "sounds/open-hat.mp3",
      "d": "sounds/closed-hat.mp3",
    };

    return soundFiles[key] || false;
  }

  get trackName() {
    return this.name;
  }

  toggle(beatIndex) {
    this.beatStates[beatIndex] = !this.beatStates[beatIndex];

    const key = `t${this._trackIndex}state`;
    this._state.setValue(key, this.beatStates);
  }

  _play(beatNum) {
    if (this.beatStates[beatNum] === true) {
      const audio = new Audio(this._file);
      audio.play();
    }
  }

  onEvent(eventName, packet) {
    if (eventName === "tick") this._play(packet.currentBeat);
  }

}

