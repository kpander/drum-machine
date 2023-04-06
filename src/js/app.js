"use strict";
/*global document, State, UI*/

const defaults = {
  barbeats: [ [ 4, 4, 4, 4 ], "array" ],
  bpm: [ 120, "int", { min: 40, max: 220 } ],
  t0sound: [ "a", "string", { options: [ "a", "b", "c", "d" ] } ],
  t1sound: [ "b", "string", { options: [ "a", "b", "c", "d" ] } ],
  t2sound: [ "c", "string", { options: [ "a", "b", "c", "d" ] } ],
  t3sound: [ "d", "string", { options: [ "a", "b", "c", "d" ] } ],
  t0state: [ [], "array" ],
  t1state: [ [], "array" ],
  t2state: [ [], "array" ],
  t3state: [ [], "array" ],
  t0vol: [ 1, "float", { min: -1, max: 2 } ],
  t1vol: [ 1, "float", { min: -1, max: 2 } ],
  t2vol: [ 1, "float", { min: -1, max: 2 } ],
  t3vol: [ 1, "float", { min: -1, max: 2 } ],
};
const state = new State(document.URL, defaults);

const els = {
  root: document.querySelector(".container"),
  controls: document.querySelector(".inputs"),
};
const ui = new UI(state, els);
ui.init();

/*

http://localhost:8080/?barbeats=4%2F4%2F3&bpm=120&t0sound=a&t1sound=b&t2sound=c&t3sound=d&t0state=10100000000&t1state=00000000101&t2state=00000000000&t3state=10001000100
http://localhost:8080/?barbeats=4%2F4%2F4%2F4&bpm=114&t0sound=a&t1sound=b&t2sound=c&t3sound=d&t0state=1011010000000110&t1state=0100101100001001&t2state=0000000010000000&t3state=1000100010011000

beelzebub
http://localhost:8080/?barbeats=9%2F9&bpm=120&t0sound=a&t1sound=b&t2sound=c&t3sound=d&t0state=100100010010010100&t1state=000010000000001000&t2state=000000000000000010&t3state=011001101101100000

*/
