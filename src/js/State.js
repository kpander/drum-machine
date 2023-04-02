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
    this.MAX_TRACKS = 4;

    this.data = {};
    this.init(urlString);
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
    
    // Clone arrays so we don't accidentally change them externally.
    if (Array.isArray(this.data[key])) return [...this.data[key] ];

    return this.data[key];
  }

  setValue(key, value) {
    if (key === "barbeats" && typeof key === "string") {
      value = value.split("/").map(count => {
        return parseInt(count, 10);
      });
    }
    this.data[key] = value;
    this._validate();
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

      if (key === "barbeats") {
        value = this.getValue(key).join("/");
      } else if (this._defaults[key][1] === "array") {
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
        } else if (key === "barbeats") {
          this.data[key] = this.data[key].split("/").map(count => {
            return parseInt(count, 10);
          });
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
   */
  _validate() {
    this._validate_bpm();
    this._validate_barbeats();
    this._validate_tracks();
  }

  _validate_bpm() {
    // Confirm the state values that are numbers and enforce min/max values.
    [ /*"bars", "beats",*/ "bpm" ].forEach(key => {
      if (isNaN(this.data[key])) this.data[key] = this._defaults[key][0];

      if (this.data[key] < this._defaults[key][2].min) {
        this.data[key] = this._defaults[key][2].min;
      } else if (this.data[key] > this._defaults[key][2].max) {
        this.data[key] = this._defaults[key][2].max;
      }
    });
  }

  _validate_barbeats() {
    // Confirm we provided integers for each bar. If the value was invalid,
    // too low or too high, fix it. Min 1 beat. Max 16 beats.
    this.data.barbeats.forEach((count, index) => {
      if (isNaN(count)) this.data.barbeats[index] = 1;
      if (this.data.barbeats[index] < 1) this.data.barbeats[index] = 1;
      if (this.data.barbeats[index] > 16) this.data.barbeats[index] = 16;
    });
  }

  _validate_tracks() {
    const totalBeats = this.data.barbeats.reduce((a, b) => {
      return a + b;
    }, 0);

    for (let i = 0; i < this.MAX_TRACKS; i++) {
      const keySound = `t${i}sound`;
      const keyState = `t${i}state`;

      // We didn't have a track sound defined. Use the default for this index.
      if (!this.getValue(keySound)) {
        this.setValue(keySound, this._defaults[keySound][2].options[i]);
      }

      // We didn't have beats defined. Define an empty track.
      if (!this.getValue(keyState)) {
        this.setValue(keyState, Array(totalBeats).fill(false));
      }

      // If the track beats are more or less than expected, fix it.
      if (this.getValue(keyState).length > totalBeats) {
        const newValue = this.getValue(keyState).slice(0, totalBeats);
        this.setValue(keyState, newValue);
      } else if (this.getValue(keyState).length < totalBeats) {
        while (this.getValue(keyState).length < totalBeats) {
          let newValue = this.getValue(keyState);
          newValue.push(false);
          this.setValue(keyState, newValue);
        }
      }
    }
  }
}

