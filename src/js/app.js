"use strict";
/*global document, State, UI*/

const totalBeats = 4 * 4;
const defaults = {
  bars: [ 4, "int" ],
  beats: [ 4, "int" ],
  bpm: [ 120, "int" ],
  t1sound: [ "d", "string" ],
  t2sound: [ "c", "string" ],
  t3sound: [ "b", "string" ],
  t4sound: [ "a", "string" ],
  t1state: [ Array(totalBeats).fill(true), "array" ],
  t2state: [ Array(totalBeats).fill(false), "array" ],
  t3state: [ Array(totalBeats).fill(true), "array" ],
  t4state: [ Array(totalBeats).fill(false), "array" ],
};
const state = new State(document.URL, defaults);

const els = {
  root: document.querySelector(".container"),
  controls: document.querySelector(".inputs"),
};
const ui = new UI(state, els);
ui.init();
