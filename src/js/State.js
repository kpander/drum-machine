"use strict";

/**
 * @file
 * State.js
 *
 * Manage application state.
 *
 * We're not a generic state object. We understand details about the different
 * pieces of state, for this particular drum sequencer application.
 */

class State {
  constructor(urlString = "", defaults = {}) {
    this._placeholder_url = "https://domain.com";
    this._defaults = defaults;
    this.MAX_TRACKS = 8;

    this.data = {};
    this.init(urlString);
    console.log("state config with obj:", this.data);
  }

  init(urlString = "") {
    // Define our data object as the default values.
    Object.keys(this._defaults).forEach(key => {
      this.data[key] = this._defaults[key][0];
    });
    this.decodeFromUrl(urlString);
    this._validate();
  }

  getValue(key) {
    if (!this.data.hasOwnProperty(key)) return false;
    return this.data[key];
  }

  setValue(key, value) {
    this.data[key] = value;
  }

  /**
   * @param string baseUrl e.g., "https://www.domain.com/path/to/page"
   *
   * @return string url e.g., "https://www.domain.com/path/to/page?s=124&..."
   */
  encodeToUrl(baseUrl) {
    let url = new URL(baseUrl);
    let params = url.searchParams;

    Object.keys(this._defaults).forEach(key => {
      let value = this.getValue(key);

      if (this._defaults[key][1] === "array") {
        // The 'state' keys have an array of booleans. When converting to a
        // URL, encode it as a string of 1s and 0s.
        value = value.reduce((acc, cur) => {
          return acc + (cur === true ? "1" : "0");
        }, "");
      }

      params.set(key, value);
    });

    return url.href;
  }

  decodeFromUrl(urlString) {
    if (urlString === "") urlString = this._placeholder_url;

    let url = new URL(urlString);
    let params = url.searchParams;

    Object.keys(this._defaults).forEach(key => {
      const value = params.get(key);
      if (value !== null) {
        this.data[key] = value;

        if (this._defaults[key][1] === "int") {
          // This value should be an integer.
          this.data[key] = parseInt(this.data[key], 10);
        } else if (this._defaults[key][1] === "array") {
          // This string should be split into an array of booleans.
          this.data[key] = this.data[key].split("").map(char => {
            return char === "0" ? false : true;
          });
        }
      }
    });
  }

  /**
   * Validate the current state. Replace any invalid values with the defaults.
   *
   * @todo consider whether validation should be so strict? e.g., if the number
   * of beats is less or more than expected, should we pad/trim as needed
   * rather than just throwing away the entire track?
   */
  _validate() {
    // Confirm the bars/beats/bpm key values are numbers.
    // Enforce min/max values.
    [ "bars", "beats", "bpm" ].forEach(key => {
      if (isNaN(this.data[key])) this.data[key] = this._defaults[key][0];

      if (this.data[key] < this._defaults[key][2].min) {
        this.data[key] = this._defaults[key][2].min;
      } else if (this.data[key] > this._defaults[key][2].max) {
        this.data[key] = this._defaults[key][2].max;
      }
    });
    const totalBeats = this.data.bars * this.data.beats;

    const keys = Object.keys(this._defaults);
    for (let i = 0; i <= this.MAX_TRACKS; i++) {
      const keySound = `t${i}sound`;
      const keyState = `t${i}state`;
      let isValidTrack = true;

      if (keys.includes(keySound) && keys.includes(keyState)) {
        if (!this._defaults[keySound][2].options.includes(this.data[keySound])) {
          // The given sound for this track was invalid. Ignore the track
          // entirely.
          isValidTrack = false;
        } else if (this.data[keyState].length === 0) {
          this.data[keyState] = Array(totalBeats).fill(false);
        } else if (this.data[keyState].length !== totalBeats) {
          // We found an unexpected number of beats in this track. Ignore the
          // track entirely.
          isValidTrack = false;
        }
      } else {
        // We're missing either the sound or the state. So ignore the track
        // entirely.
        isValidTrack = false;
      }

      if (!isValidTrack) {
        delete this.data[keySound];
        delete this.data[keyState];
      }
    }
  }
}

