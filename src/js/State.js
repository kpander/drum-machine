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
    // @todo add validation to check mins/max/valid chars/beat states is correct duration/etc.
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

}

