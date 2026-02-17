# Breakout
> Play, Design, and Share Breakout Levels

<p align='center'>
  <a href="https://enderandrew.com/breakout/">Click Here to Play</a>
</p>

Starting as a basic tutorial for programming games, [Jake Gordon](https://github.com/jakesgordon) made a basic breakout game in HTML5 as a teaching exercise. The Hacker Forums community expanded upon it. Enderandrew has since picked it up as a fun diversion.

<p align='center'>
  <img src='https://enderandrew.com/breakout/Promo/levels.gif' alt='HF Breakout'></img>
</p>

## Level Generator

<p align='center'>
  <a href="https://enderandrew.com/breakout/level-editor/">Click here to access the editor</a>
  
  <details> 
  <summary>Screenshot</summary>
  <img src='https://enderandrew.com/breakout/Promo/editor_demo.gif' alt='Level Generator'></img>
</details>
</p>

The level generator allows anyone to draw pixel art to create custom breakout levels. The code for this editor was inspired by [gelstudios/gitfiti](https://github.com/gelstudios/gitfiti), which allows users to create pixel art in their Github contribution history. To create levels, simply open the codepen project and get to drawing. When you are happy with your creation, don't forget to name your level, copy the contents of the Code and head on over to the breakout game. Click upload, paste the level code in the prompt window, and enjoy playing your level.

To add your level to the publicly available game, please submit levels via the release thread, Github issue/pull request, or contact me privately.


## Powerups
`Powers randomly drop upon destroying blocks`

* Big Paddle
    * Makes your paddle 2x longer
* Small Paddle
    * Shrinks your paddle in half
* Extra Life
    * `You probably guessed it.` Gives an extra life
* Fireball
    * Turns the ball into molten lava, melting every brick in its path
* Big Ball
    * Makes your ball 2x bigger
* Small Ball
    * Shrinks your ball in half
* Fast Ball
    * Your ball moves faster
* Slow Ball
    * Your ball moves slower
* Multiball
    * Multiplies your ball into 3 smaller balls
* Sticky Paddle 
    * Catches the ball on each paddle hit. Works with multiball. You can catch and launch multiple balls.
* Confused 
    * Look, I am easily confused. Directions temporarily reversed
* Chaos 
    * The ball has a mind of its own.
* Lasers
    * They aren't on sharks sadly.
* Split Paddle
    * Two paddles with a gap in between.
* Exploding Balls
    * The ball can explode up to 8 bricks around any brick it hits.
* Floor
    * A temporary floor appears preventing you from losing all balls / lives. (works with multiball!)
* Frozen Paddle
    * Your paddle is covered in ice and can't move for five seconds.
* Lights Out
    * Who is afraid of the dark?
* Ghost Paddle
    * If the paddle is idle, it becomes a ghost paddle that can't hit balls or pick-ups
* Magnet
    * Power-ups: Gotta Catch Em' All!
* Reset
    * Reset all active effcts
* Time-Extend
    * Add 7 seconds to all active effects
* Orbitals
	* Two small orbs circle the ball at a fixed radius. They can break bricks but also collide with bumpers/lasers (fun chain reactions).
* Lightning
	* Ball is electrically charged. When it hits a brick, a lightning bolt zaps out to both sides, damaging bricks.
* X-Factor
	* Destroys bricks in an X shape
* Power-Smash
	* Press space to jump / lunge with the paddle when you have this power-up. A well timed lunge will blast multiple bricks in a shotgun blast effect.

## Gameplay
* Power-ups are now falling objects you have to catch. Risk/reward aspect of gameplay.
* Mouse, keyboard and touch controls. I haven't tested it on a tablet yet.
* 5 THEMED BOSS BATTLES!
* GAMEPAD SUPPORT!
* Double-tap left or right to dash quickly to the side
* Dynamic court where walls can pop up and vents can open in the ceiling
* Put spin/english on the ball by moving the paddle as you hit it.
* End-game challenges when you get to the last 5 bricks in a level.
	* Shuffle mode. When there are 5 bricks left, the remainging bricks will run and hide. This is always in play with the last 5, in addition to one of the random modes below.
	* Bumpers. Sonic the Hedgehog was kind enough to lend us his spinball bumpers.
	* Laser Grid. Lasers turn on and off, which deflect the ball.
	* Sudden Death. Bricks keep lowering a row. Destroy them before they hit the bottom and you die!
	* Mirror World. The ball can teleport / mirror over to the other side.
	* Ghost Bricks. Bricks can't be broken when as they move in and out of ghost mode.
	* Spikes. Three spikes travel along the left/right walls and ceiling (sine eased). If the ball hits a spike, you lose a ball.
	* Ricochet. Wild bounces off objects - updated to be more random angles and different from Bumpers
	* Rotate. Don't get dizzy.
	* Fight Back. The remaining bricks fight back and shoot lasers at you.
	* Virus. Infected green bricks and can spawn new virus blocks
* The ball launches from a different spot and angle depending on the position of the paddle
* Portals. Don't tell Aperture Labs. I don't need Cave Johnson and GladOS coming after me.
* Black hole. Gravity well affects the ball. The effect is based on the current size of the ball.
* Study bricks have 2 or 3 hit points. Balls do different damage based on size and speed.
* Fireballs do 2 damage and lasers do 1.5 damage
* Combos! Get bonus points for racking up combos.
* Record local and global high scores stored online in a basic sqlite DB.
* Removed levels that were references to Hacker Forums and generated tons of new levels. Nothing against Hacker Forums, but I'm not a member and it seems weird to use their levels.
* Added new levels with my limited pixel art ability. Over 70 levels now!

## Combo Effects
* Demolition (Explosive vs. Bumpers): An Exploding Ball doesn't bounce off a Bumper; it detonates it, destroying the bumper and damaging any nearby bricks.
* Weed Whacking (Lasers/Explosives vs. Spikes): Spikes normally kill the ball. However, Lasers should cut them down, and Exploding Balls should blow them up, creating safe zones.
* Thermal Thaw (Fireball vs. Frozen): If your paddle is Frozen by the "Virus" or "Ice" effect, picking up a Fireball power-up should instantly melt the ice and free you.
* Magnetic Stabilizer (Magnet vs. Chaos): If "Chaos Mode" is making the ball wobble unpredictably, catching it with the Magnet/Sticky paddle should "stabilize" it, ending the Chaos effect immediately.

## Presentation
* New responsive display resizes the whole game based on display / screen size!
* Animated parallax backgrounds in 5 themes (synthwave, city, space, forest, circuit) that match the beat of the music
* Fun easter eggs in the themes. Can you find Bigfoot?
* Achievements! Can you unlock them all? One may require you to cheat.
* 5 royalty free but awesome songs for the 5 themes
* Added help menu
* Bezels for bricks and walls
* Optimzied shaders for bricks, ball and paddle
* Shiny chrome ball
* Sexy new paddle with shadow
* Better looking round pick-ups with glow effects. Good ones glow green and bad ones glow red.
* Tons more sound effects. A bit memey.
* Particle effect system
* New HUD area on the right that shows active effects
* Ball and paddle change color depending on effects in play.
* Fast, chaos, lightning, fire and power smash balls have a visual trail.
* Level Complete and Game Over overlays that display at relevant times. Two meme overlays on special levels.
* Ripples and thuds - trying to make it feel satisfying to break bricks
* Floating score numbers
* Directional debris
* Portal glow effects can show up on the walls
* Dramatically highlight last brick. Attempted a time dilation before you hit the last brick but it isn't working.
* Paddle recoil
* Improved screen shakes
* Time slows down as you're close to hitting the final brick. Will you hit it and win the level or narrowly miss and exclaim "Oh, come on!"
* CRT filter on retro circuit theme

## Minor Enhancements
* Bad jokes
* A few random easter eggs

## Known Bugs
* Hopefully got these all fixed now

## Release History
* 1.0.0 - 2/16/2026
    * First release of EnderAndrew's massive rewrite. Previous versions were from the original version I found on Github.
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

This project wouldn't be possible without the following people:

[Gel Studios](https://github.com/gelstudios): [Gitfiti Project](https://github.com/gelstudios/gitfiti)

[Jake Gordon](https://github.com/jakesgordon): [Breakout Project](https://github.com/jakesgordon/javascript-breakout)

The HF community for submitting levels, bug reports, and general game suggestions.
