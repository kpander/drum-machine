# drum-machine

# Overview

This is a simple toy implementation of a drum machine sequencer.

A live demo can be seen here: [https://kpander.github.io/drum-machine](https://kpander.github.io/drum-machine/index.html)


# Build

There is currently no build step.

To run the app, point the browser to the repo root `/` folder and load `index.html` in the browser.


# History

This project started as an excuse to test one idea:

> Can ChatGPT (as of Mar 26 2023) build this (HTML, CSS, Javascript) for us?

Because the idea of a drum machine/sequencer is fairly straightforward, but includes some complexity (the HTML, CSS and Javascript files all have properties that need to be in sync with each other), it seemed like a good test case to evaluate what ChatGPT can do at this point in time.

## tldr;

Yes, we did get a minimally working version via ChatGPT. But, it was tedious, painful, and definitely required the ability to read the code that was produced and point out flaws. And ultimately, that code was a highly unmaintainable block of spaghetti.

## Details

Here's the sordid history about what I went through trying to coax ChatGPT into building this for me. Also note that all code generated from ChatGPT exists in the [second commit](https://github.com/kpander/drum-machine/commit/44be69e8a983833cbd57fa26e1c750be5d1629f3). Commits after that refactor the code for clarity and maintenance, and add new features.

I fought with ChatGPT for an hour. It was frustrating because it seemed like it would make progress, but as it fixed one problem, it forgot about a previous piece of code, or introduced a solution that didn't fit with other assumptions already solved for.

There were basic things like, "assume the code will be in a file named scripts.js" -- it would work with that. But then randomly it would change the name in the associated html to script.js (singular, no longer plural).

Or, it would introduce css rules for elements that didn't exist. When asked why and to fix it, it would, but it would also then break something in javascript.

When asked to provide source code, it would very often halt half way through a function or even a line. I'd have to repeatedly tell it that it didn't show me everything and it would try again. Eventually it would work, but sometimes it took multiple tries.

After an hour I was going to give up, and then prompted it a different way. Basically, throw out everything and start over. After another half an hour, I managed to get a working (very raw) prototype of something using html, css and javascript.

After all that, I had a working mess. I spent another 2 hours trying to clean up the mess and apply actual structure to it so I can evolve this to something maintainable that I could grow.

Yes... it would have been easier to plan it out and write the code myself from the beginning. But that wasn't the point of this exercise.


# Reference

- Drum sound effects from
  - https://www.fesliyanstudios.com/royalty-free-sound-effects-download/hi-hat-277
