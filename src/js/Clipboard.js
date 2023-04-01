"use strict";
/*global document*/

/**
 * @file
 * Clipboard.js
 *
 * Moves a given string into the system clipboard.
 *
 * usage:
 *   Clipboard.copy("string to put into clipboard");
 */

class Clipboard {
  constructor() {}

  /**
   * Source: https://www.30secondsofcode.org/js/s/copy-to-clipboard/
   */
  static copy(str="") {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selected =
      document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
  }
}

