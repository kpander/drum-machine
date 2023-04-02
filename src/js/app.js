"use strict";
/*global document, State, UI*/

const defaults = {
  barbeats: [ [ 4, 3, 5, 4 ], "array" ],
  bpm: [ 120, "int" , { min: 40, max: 220 } ],
  t0sound: [ "a", "string", { options: [ "a", "b", "c", "d" ] } ],
  t1sound: [ "b", "string", { options: [ "a", "b", "c", "d" ] } ],
  t2sound: [ "c", "string", { options: [ "a", "b", "c", "d" ] } ],
  t3sound: [ "d", "string", { options: [ "a", "b", "c", "d" ] } ],
  t0state: [ [], "array" ],
  t1state: [ [], "array" ],
  t2state: [ [], "array" ],
  t3state: [ [], "array" ],
};
const state = new State(document.URL, defaults);

const els = {
  root: document.querySelector(".container"),
  controls: document.querySelector(".inputs"),
};
const ui = new UI(state, els);
ui.init();

/*


*/
