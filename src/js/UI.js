"use strict";
/*global document, Audio*/

class UI {
  constructor(els, tracks) {
    this.els = els;
    this.tracks = tracks;
    this.config = tracks.config;
    this._bind_controls();
  }

  init() {
    this.tracks.init();
    this.tracks.subscribe("tick", this);
    this.draw();
  }

  /**
   * Add click events to the UI controls.
   */
  _bind_controls() {
    this.els.btnReset.addEventListener("click", this.onClickReset.bind(this), false);
    this.els.btnPlay.addEventListener("click", this.onClickPlay.bind(this), false);
    this.els.inpSpeed.addEventListener("change", this.onChangeSpeed.bind(this), false);
  }

  onClickReset(event) {
    if (this.tracks.isPlaying) {
      this.onClickPlay(event);
    }
    this.init();
  }

  onClickPlay(event) {
    this.tracks.play();
    this.els.btnPlay.textContent = this.tracks.isPlaying ? "Pause" : "Play";
  }

  onChangeSpeed(event) {
    this.tracks.setSpeed(this.els.inpSpeed.value);
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

