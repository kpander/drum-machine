# drum-machine

started 2:20pm


# Context

Let's see if ChatGPT (as of Mar 26 2023) can build this for us.



# Notes

Many times, ChatGPT would show an updated file. I'd have to ask to display the entire contents of the file. It might/might not. It'd randomly stop, cutting off in the middle of a line or function.
- Happens with js and html.

After an hour...
- it's frustrating
- it adds some functionality, but in the process removes something that it already had
- so I'm constantly reminding it to add back something, which removes/breaks something else
- it has a very short memory it seems

It does provide solutions for very specific things, but it seems like it's really up to me to keep it all together.

It also will add functionality to one area (say html, or css, or js) but forget to add it to another file. Or, it'll remove functionality from js or html, and forget to remove it from the other file.

By 4pm, I have a working version. I had to tweak a tiny bit of CSS. I haven't had to write any HTML or Javascript yet.

## Summary

I actually spent a few hours yesterday trying to see how far I could get ChatGPT to write code for an application (a music track sequencer).

I fought with it for an hour and it was frustrating because it seemed like it would make progress, but as it fixed one problem, it forgot about a previous piece of code, or introduced a solution that didn't fit with other assumptions already solved for.

There were basic things like, "assume the code will be in a file named scripts.js" -- it would work with that. But then randomly it would change the name in the associated html to script.js (singular, no longer plural).

Or, it would introduce css rules for elements that didn't exist. When asked why and to fix it, it would, but it would also then break something in javascript.

Also, when asked to provide source code, it would very often halt half way through a function or even a line. I'd have to repeatedly tell it that it didn't show me everything and it would try again. Eventually it would work, but sometimes it took multiple tries.

After an hour I was going to give up, and then prompted it a different way. Basically, throw out everything and start over. After another half an hour, I actually had a working (very raw) prototype of something using html, css and javascript.

After all that, I had a working mess. I spent another 2 hours trying to clean up the mess and apply actual structure to it so I can evolve this to something maintainable that I could grow.

I'm still not done.

So... would it have been easier to plan it out and write the code myself from the beginning? Probably.

It's an interesting exercise but I'm still really on the fence as to how useful it will be for inexperienced people. I fear a lot of unmaintainable crap might be coming our way...

I will say that the value I saw was in seeing different approaches to solutions to different parts of the problem. Now, that's also what you get with Google, but this felt a little more focused.

(Even if it was actually broken half the time, it did prompt different ideas.)

I also had to correct it many, many times. ("Why are you adding keybindings for the number keys?" "Why are you adding this unused function?" "Why are you referencing properties that aren't defined anywhere?")


# Reference

- Drum sound effects from
  - https://www.fesliyanstudios.com/royalty-free-sound-effects-download/hi-hat-277



