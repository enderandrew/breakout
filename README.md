# HF Breakout
> Play, Design, and Share Breakout Levels

Starting as a basic tutorial for programming games, [https://github.com/jakesgordon](Jake Gordon) created this game to teach about game physics and utilizing HTML5 canvas to build fun and creative games. I've built on his work by adding a custom level generator, game powerups, additional levels, level names, online user counter, and more.

![](https://github.com/xadamxk/hf-breakout/blob/master/Promo/levels.gif?raw=true)

## Level Generator

A few motivating and useful examples of how your product can be used. Spice this up with code blocks and potentially more screenshots.

_For more examples and usage, please refer to the [Wiki][wiki]._

## Powerups
`Powers have a 1 in 40 (2.5%) drop rate upon destroying blocks`

![](https://github.com/xadamxk/hf-breakout/blob/master/Promo/editor_demo.gif?raw=true)

* Big Paddle
    * Makes your paddle 2x longer
* Small Paddle
    * CHANGE: Shrinks your paddle in half
* Extra Life
    * `You probably guessed it...` Gives an extra life
* Fireball
    * Turns the ball into molten lava, melting every brick in its path
* Multiball `(Work in Progress)`
    * Multiplies your ball into 3 smaller balls
* Sticky Paddle `(Work in Progress)`
    * Catches the ball on each paddle hit

## Release History
* 0.3.1 - 1/21/2019
    * Added users online script to show many users are currently playing
    * Bugfix: Now encode generated levels in base64 to prevent whitespace errors caused by `window.prompt()`
* 0.3.0 - 1/20/2019
    * Added level upload functionality to game
    * Added name field to level generator
    * Changed how levels were parsed when generated via editor to be compatible with upload feature
* 0.2.2 - 1/19/2019
    * Added 2 new powerups (Fireball & Small Paddle)
    * Powerups now stack rather than override eachother
    * Bugfix: Fixed error caused by using white as an eraser in the editor
* 0.2.1 - 1/17/2019
    * Bugfix: Powerups now reset on ball loss and level completion
    * Bugfix: Balls no longer mysterically slide through the paddle's edge when against walls
    * Bugfix: Added more community made levels - now 17 total
* 0.2.0 - 1/15/2019
    * Implemented powerups (Big Paddle & Extra Life)
* 0.1.1 - 1/13/2019
    * Bugfix: Fixed level index glitch on page refresh
    * Bugfix: Now gives a life rather than taking one on level completion
* 0.1.0 - 1/12/2019
    * Added custom levels
    * Implemented level names
* 0.0.1 - 1/12/2019
    * Initial Release

## Meta

Your Name – [@YourTwitter](https://twitter.com/dbader_org) – YourEmail@example.com

Distributed under the XYZ license. See ``LICENSE`` for more information.

[https://github.com/yourname/github-link](https://github.com/dbader/)




Breakout
========

Another HTML5 experiment to implement BREAKOUT in a `<canvas>`

 * You can find the [game here](http://codeincomplete.com/posts/2011/6/11/javascript_breakout/demo.html)
 * You can find out [how it works](http://codeincomplete.com/posts/2011/6/11/javascript_breakout/index.html)
   * [Managing Game State](http://codeincomplete.com/posts/2011/6/12/game_state_in_breakout/)
   * [Rendering Performance](http://codeincomplete.com/posts/2011/6/12/rendering_breakout/)
   * [Collision Detection](http://codeincomplete.com/posts/2011/6/12/collision_detection_in_breakout/)
   * [Gameplay Balance](http://codeincomplete.com/posts/2011/6/13/gameplay_in_breakout/)
   * [Adding Sound](http://codeincomplete.com/posts/2011/6/16/adding_sound_to_breakout/)
   * [Touch Events](http://codeincomplete.com/posts/2011/6/24/adding_touch_to_breakout/)
