"use strict";
/*global document, Tracks, Clipboard, location, alert*/

class UI {
  constructor(state, els) {
    this._state = state;
    this._els = els;

    this.tracks = new Tracks(this._state);

    this._build_controls();
    this._bind_controls();
  }

  get _ids() {
    return {
      btnReset: "reset",
      inpBarBeats: "numBeats",
      btnBarBeats: "barBeats",
      inpSpeed: "numSpeed",
      btnPlay: "playPause",
      btnCopy: "copyUrl",
    };
  }

  get _controls() {
    return [
      { type: "button", label: "Reset", props: 
        { id: this._ids.btnReset } 
      },
      { type: "input", label: "Beats per bar:", props: 
        { id: this._ids.inpBarBeats, type: "text", value: this._state.getValue("barbeats").join("/") } 
      },
      { type: "button", label: "Apply", props: 
        { id: this._ids.btnBarBeats, class: "bar-beats-button" } 
      },
      { type: "input", label: "Speed:", props: 
        { id: this._ids.inpSpeed, type: "range", value: this._state.getValue("bpm"), min: "40", max: "220" }
      },
      { type: "button", label: "Play", props: 
        { id: this._ids.btnPlay, class: "play-pause-button" } 
      },
      { type: "button", label: "Copy URL", props: 
        { id: this._ids.btnCopy, class: "copy-url" } 
      },
    ];
  }

  _build_controls() {
    this._controls.forEach(control => {
      this._els.controls.appendChild(this._build_control(control));
    });
    Object.keys(this._ids).forEach(key => {
      const id = this._ids[key];
      this._els[key] = document.getElementById(id);
    });
  }

  _build_control(control) {
    const el = this._el_control(control);
    let label;

    switch (control.type) {
      case "button":
        el.textContent = control.label;
        return el;
      case "input":
        // <input> gets wrapped in a <label>.
        label = this._el("label");
        label.textContent = control.label;
        label.appendChild(el);
        return label;
    }
  }

  /**
   * Add click events to the UI controls.
   */
  _bind_controls() {
    this._els.btnReset.addEventListener("click", this.onClickReset.bind(this), false);
    this._els.btnPlay.addEventListener("click", this.onClickPlay.bind(this), false);
    this._els.btnCopy.addEventListener("click", this.onClickCopy.bind(this), false);
    this._els.btnBarBeats.addEventListener("click", this.onClickBarBeats.bind(this), false);
    this._els.inpSpeed.addEventListener("change", this.onChangeSpeed.bind(this), false);
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
    const elTrack = this._el("div", "track");
    const elTitle = this._el("div", "title");
    elTitle.textContent = name;
    elTrack.appendChild(elTitle);

    const totalBeats = this._state.getValue("barbeats").reduce((a, b) => {
      return a + b;
    }, 0);
    const elBeatsContainer = this._el("div", "beats-container");
    elBeatsContainer.style.gridTemplateColumns = `repeat(${totalBeats}, 1fr)`;

    beatStates.forEach((beatState, beatIndex) => {
      elBeatsContainer.appendChild(this._draw_beat(trackIndex, beatIndex, beatState));
    });

    elTrack.appendChild(elBeatsContainer);
    return elTrack;
  }

  _draw_beat(trackIndex, beatIndex, beatState) {
    const elBeat = this._el("div", "beat");
    if (beatState === true) {
      elBeat.classList.add("active");
    }

    const barStarts = this._get_bar_starts();
    if (barStarts.includes(beatIndex)) elBeat.classList.add("bar-first");

    elBeat.dataset.trackIndex = trackIndex;
    elBeat.dataset.beatIndex = beatIndex;
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
   * Create a new DOM element and apply the given class name.
   */
  _el(type, className=null) {
    const el = document.createElement(type);
    if (className) el.classList.add(className);
    return el;
  }

  _el_control(control={}) {
    let el = this._el(control.type);

    Object.keys(control.props).forEach(key => {
      el.setAttribute(key, control.props[key]);
    });

    return el;
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

