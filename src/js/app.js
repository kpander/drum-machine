"use strict";
/*global document, State, UI*/

const defaults = {
  bars: [ 4, "int", { min: 1, max: 6 } ],
  beats: [ 4, "int", { min: 1, max: 12 } ],
  bpm: [ 120, "int" , { min: 40, max: 220 } ],
  t1sound: [ "d", "string", { options: [ "a", "b", "c", "d" ] } ],
  t2sound: [ "c", "string", { options: [ "a", "b", "c", "d" ] } ],
  t3sound: [ "b", "string", { options: [ "a", "b", "c", "d" ] } ],
  t4sound: [ "a", "string", { options: [ "a", "b", "c", "d" ] } ],
  t1state: [ [], "array" ],
  t2state: [ [], "array" ],
  t3state: [ [], "array" ],
  t4state: [ [], "array" ],
};
const state = new State(document.URL, defaults);

const els = {
  root: document.querySelector(".container"),
  controls: document.querySelector(".inputs"),
};
const ui = new UI(state, els);
ui.init();

/*

http://localhost:8080/?bars=4&beats=3&bpm=120&t1sound=d&t2sound=c&t3sound=b&t4sound=a&t1state=100010001000&t2state=000000000100&t3state=010000010100&t4state=001001100001

*/
