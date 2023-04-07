"use strict";
/*global document, Tracks, Clipboard, location, alert*/

/**
 * @file
 * UI.js
 *
 * Yes, this is a messy mashup of all the UI things in one ugly file instead
 * of a nice component-based organization. That's ok, it's a toy demo and we
 * don't want to introduce unnecessary complexity (React, Vue, etc.) for the
 * purpose of this.
 *
 * If it gets more complex or interesting, then maybe...
 */

class Component {
  constructor() {}

  /**
   * Create an HTML element of type config.type.
   *
   * config = {
   *   type: "input",
   *   label: "Name:",
   *   attrs: {
   *     id: "firstname", class: "form input name"
   *   }
   * }
   *
   * If config.label has a string value, the element will be wrapped in a
   * <label> element, with textContent = the value.
   *
   * If config.textContent has a string value, we will set the element's
   * textContent = the value.
   */
  static create(config) {
    const hasLabel = typeof config.label === "string";
    const el = document.createElement(config.type);

    Object.keys(config.attrs).forEach(key => {
      if (key === "class") {
        config.attrs[key].split(" ").forEach(className => {
          el.classList.add(className);
        });
      } else {
        el.setAttribute(key, config.attrs[key]);
      }
    });

    if (typeof config.textContent === "string") {
      el.textContent = config.textContent;
    }

    if (hasLabel) {
      let label = document.createElement("label");
      label.textContent = config.label;
      label.appendChild(el);
      return label;
    } else {
      return el;
    }
  }
}

class UI {
  constructor(state, els) {
    this._state = state;
    this._els = els;

    this.tracks = new Tracks(this._state);

    this._build_controls();
  }

  get _controls() {
    const barBeats = this._state.getValue("barbeats").join("/");
    const speed = this._state.getValue("bpm");

    return {
      btnReset: { type: "button", textContent: "Reset",
        attrs: { id: "reset" },
        event: { action: "click", fn: this.onClickReset.bind(this) }
      },
      inpBarBeats: { type: "input", label: "Beats per bar:",
        attrs: { id: "numBeats", type: "text", value: barBeats },
      },
      btnBarBeats: { type: "button", textContent: "Apply",
        attrs: { id: "barBeats", class: "bar-beats-button" },
        event: { action: "click", fn: this.onClickBarBeats.bind(this) }
      },
      inpSpeed: { type: "input", label: "Speed:",
        attrs: { id: "numSpeed", type: "range", value: speed, min: "40", max: "220" },
        event: { action: "change", fn: this.onChangeSpeed.bind(this) }
      },
      btnPlay: { type: "button", textContent: "Play",
        attrs: { id: "playPause", class: "play-pause-button" },
        event: { action: "click", fn: this.onClickPlay.bind(this) }
      },
      btnCopy: { type: "button", textContent: "Copy URL",
        attrs: { id: "copyUrl", class: "copy-url" },
        event: { action: "click", fn: this.onClickCopy.bind(this) }
      }
    };
  }

  _build_controls() {
    Object.keys(this._controls).forEach(key => {
      const control = this._controls[key];
      const el = Component.create(control);
      this._els.controls.appendChild(el);

      this._els[key] = document.getElementById(control.attrs.id);

      if (control.event) {
        this._els[key].addEventListener(
          control.event.action,
          control.event.fn,
          false
        );
      }
    });
  }

  onClickReset(/*event*/) {
    if (this.tracks.isPlaying) {
      this.onClickPlay();
    }
    this.init();
  }

  onClickPlay(/*event*/) {
    this.tracks.play();
    this._els.btnPlay.textContent = this.tracks.isPlaying ? "Pause" : "Play";
  }

  onClickCopy(/*event*/) {
    const url = this._state.encodeToUrl(location.href);
    Clipboard.copy(url);
    alert("Copied URL to system clipboard");
  }

  onChangeSpeed(/*event*/) {
    this.tracks.setSpeed(this._els.inpSpeed.value);
  }

  onChangeTrackVolume(event) {
    const trackIndex = event.target.getAttribute("trackIndex");
    const newVolume = Number(event.target.value);
    this.tracks.setVolume(trackIndex, newVolume);
  }

  onClickBarBeats(/*event*/) {
    this._state.setValue("barbeats", this._els.inpBarBeats.value);
    this.onClickReset();
  }

  init() {
    this.tracks.init();
    this.tracks.subscribe("tick", this);
    this.draw();
  }

  draw() {
    this._els.root.replaceChildren();

    this.tracks.tracks.forEach((track, trackIndex) => {
      const name = track.name;
      const beatStates = track.beatStates;
      this._els.root.appendChild(this._draw_track(name, trackIndex, beatStates));
    });
  }

  _draw_track(name, trackIndex, beatStates) {
    const elTrack = Component.create({ type: "div", attrs: { class: "track" } });
    
    const elTrackHead = Component.create({ type: "div", attrs: { class: "track-head" } });
    elTrackHead.appendChild(this._draw_track_title(name));
    elTrackHead.appendChild(this._draw_track_volume(trackIndex));

    elTrack.appendChild(elTrackHead);

    const totalBeats = this._state.getValue("barbeats").reduce((a, b) => {
      return a + b;
    }, 0);
    const elBeatsContainer = Component.create({ type: "div", attrs: { class: "beats-container" } });
    elBeatsContainer.style.gridTemplateColumns = `repeat(${totalBeats}, 1fr)`;

    beatStates.forEach((beatState, beatIndex) => {
      elBeatsContainer.appendChild(this._draw_beat(trackIndex, beatIndex, beatState));
    });

    elTrack.appendChild(elBeatsContainer);
    return elTrack;
  }

  _draw_track_title(name) {
    return Component.create({ type: "div", textContent: name, attrs: { class: "title" } });
  }

  /**
   * Create a volume slider for a track.
   */
  _draw_track_volume(trackIndex) {
    const attrs = {
      id: `volumeTrack${trackIndex}`,
      type: "range",
      value: this._state.getValue(`t${trackIndex}vol`),
      class: "volume-slider",
      min: -1,
      max: 2,
      step: 0.1,
      trackIndex: trackIndex,
    };
    const el = Component.create({ type: "input", attrs: attrs });
    el.addEventListener("change", this.onChangeTrackVolume.bind(this), false);

    return el;
  }

  _draw_beat(trackIndex, beatIndex, beatState) {
    const barStarts = this._get_bar_starts();
    const attrs = {
      class: "beat",
      "data-track-index": trackIndex,
      "data-beat-index": beatIndex,
    };
    if (beatState === true) attrs.class += " active";
    if (barStarts.includes(beatIndex)) attrs.class += " bar-first";

    const elBeat = Component.create({ type: "div", attrs: attrs });
    elBeat.addEventListener("click", this.onClickBeat.bind(this), false);

    return elBeat;
  }

  /**
   * Construct an array of numbers. Each number represents the starting
   * beat number of a different bar. If our beat configuration was 3/5/4
   * (a bar of 3 beats, then 5 beats, then 4 beats), our bar starts array
   * would be:
   *   [ 0, 3, 8 ]
   *   - 0 = the first beat (0-indexed, the beginning of the 3 beat bar)
   *   - 3 = the 4th beat (the beginning of the 5 beat bar)
   *   - 8 = the 9th beat (the beginning of the 4 beat bar)
   */
  _get_bar_starts() {
    let barbeats = this._state.getValue("barbeats");

    let starts = [];
    let count = 0;

    starts.push(count);
    while (barbeats.length) {
      count += barbeats.shift();
      starts.push(count);
    }

    return starts;
  }

  /**
   * User clicked a specific beat of a specific track. Toggle its value.
   *
   * @param object event - the clicked element from the event listener
   */
  onClickBeat(event) {
    const trackIndex = parseInt(event.target.dataset.trackIndex, 10);
    const beatIndex = parseInt(event.target.dataset.beatIndex, 10);

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

