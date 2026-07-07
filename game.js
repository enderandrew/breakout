//=============================================================================
//
// We don't need ECMAScript 5 methods for old browses in 2026. Slowly rewriting everything to be ES6+
//
//  Function.bind:        https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
//  Object.create:        http://javascript.crockford.com/prototypal.html
//  Object.extend:        (defacto standard like jquery $.extend or prototype's Object.extend)
//
//  Object.construct:     our own wrapper around Object.create that ALSO calls
//                        an initialize constructor method if one exists
//
//=============================================================================

if (!Object.construct) {
  Object.construct = function(base) {
    let instance = Object.create(base);
    if (instance.initialize)
      instance.initialize.apply(instance, [].slice.call(arguments, 1));
    return instance;
  }
}

if (!Object.extend) {
  Object.extend = function(destination, source) {
    return Object.assign(destination, source);
  };
}

//=============================================================================
// Minimal DOM Library ($)
//=============================================================================

const Element = (() => {
  const instance = {
    _extended: true,
    showIf(on) {
      if (on) this.show();
      else this.hide();
    },
    show() {
      this.style.display = '';
    },
    hide() {
      this.style.display = 'none';
    },
    update(content) {
      this.innerHTML = content;
    },
    hasClassName(name) {
      return this.classList.contains(name);
    },
    addClassName(name) {
      this.toggleClassName(name, true);
    },
    removeClassName(name) {
      this.toggleClassName(name, false);
    },
    toggleClassName(name, on) {
      this.classList.toggle(name, on ?? !this.classList.contains(name));
    }
  };

  return (ele) => {
    if (typeof ele === 'string') ele = document.getElementById(ele);
    if (ele && !ele._extended) Object.assign(ele, instance);
    return ele;
  };
})();

const $ = Element;

//=============================================================================
// State Machine
//=============================================================================

class StateMachine {
  constructor(cfg) {
    const target = cfg.target || this;
    const events = cfg.events || [];
    const can = {};

    for (const event of events) {
      const name = event.name;
      can[name] = (can[name] || []).concat(event.from);
      target[name] = this.buildEvent(name, event.from, event.to, target, can);
    }

    target.current = 'none';
    target.is = (state) => target.current === state;
    target.can = (eventName) => can[eventName] && can[eventName].includes(target.current);
    target.cannot = (eventName) => !target.can(eventName);

    if (cfg.initial) {
      const initial = (typeof cfg.initial === 'string') ? {
        state: cfg.initial
      } : cfg.initial;
      const name = initial.event || 'startup';
      can[name] = ['none'];

      const initEvent = this.buildEvent(name, 'none', initial.state, target, can);
      if (initial.defer) {
        target[name] = initEvent;
      } else {
        initEvent.call(target);
      }
    }
    return target;
  }

  buildEvent(name, from, to, target, can) {
    return function(...args) {
      if (this.cannot(name)) {
        throw new Error(`Event "${name}" inappropriate in current state "${this.current}"`);
      }
      const beforeEvent = this[`onbefore${name}`];
      if (beforeEvent && (false === beforeEvent.apply(this, args))) return;

      if (this.current !== to) {
        const exitState = this[`onleave${this.current}`];
        if (exitState) exitState.apply(this, args);

        this.current = to;

        const enterState = this[`onenter${to}`] || this[`on${to}`];
        if (enterState) enterState.apply(this, args);
      }

      const afterEvent = this[`onafter${name}`] || this[`on${name}`];
      if (afterEvent) afterEvent.apply(this, args);
    };
  }
}

//=============================================================================
// GAME
//=============================================================================

const Game = {
  // Canvas check is all that remains; modern browsers fully support ES6 baseline
  compatible() {
    return !!document.createElement('canvas').getContext;
  },

  start(id, game, cfg) {
    if (this.compatible()) {
      return this.current = new Game.Runner(id, game, cfg).game;
    }
  },

  ua: (() => {
    const ua = navigator.userAgent.toLowerCase();
    let key = ((ua.indexOf("opera") > -1) ? "opera" : null);
    key = key || ((ua.indexOf("firefox") > -1) ? "firefox" : null);
    key = key || ((ua.indexOf("chrome") > -1) ? "chrome" : null);
    key = key || ((ua.indexOf("safari") > -1) ? "safari" : null);
    key = key || ((ua.indexOf("msie") > -1) ? "ie" : null);

    try {
      const re = (key === "ie") ? "msie (\\d)" : key + "\\/(\\d\\.\\d)";
      const matches = ua.match(new RegExp(re, "i"));
      var version = matches ? parseFloat(matches[1]) : null;
    } catch (e) {}

    return {
      full: ua,
      name: key + (version ? " " + version.toString() : ""),
      version: version,
      isFirefox: (key === "firefox"),
      isChrome: (key === "chrome"),
      isSafari: (key === "safari"),
      isOpera: (key === "opera"),
      isIE: (key === "ie"),
      hasCanvas: !!document.createElement('canvas').getContext,
      hasAudio: (typeof Audio !== 'undefined'),
      hasTouch: ('ontouchstart' in window)
    };
  })(),

  addEvent(obj, type, fn) {
    $(obj).addEventListener(type, fn, false);
  },

  removeEvent(obj, type, fn) {
    $(obj).removeEventListener(type, fn, false);
  },

  windowWidth() {
    return window.innerWidth || document.documentElement.offsetWidth;
  },
  windowHeight() {
    return window.innerHeight || document.documentElement.offsetHeight;
  },

  ready(fn) {
    if (this.compatible()) this.addEvent(document, 'DOMContentLoaded', fn);
  },

  renderToCanvas(width, height, render, canvas) {
    const targetCanvas = canvas || document.createElement('canvas');

    targetCanvas.width = width;
    targetCanvas.height = height;
    render(targetCanvas.getContext('2d'));
    return targetCanvas;
  },

  loadScript(src, cb) {
    const head = document.getElementsByTagName('head')[0];
    const s = document.createElement('script');
    head.appendChild(s);
    s.onload = (e) => cb(e.currentTarget);
    s.type = 'text/javascript';
    s.src = src;
  },

  loadImages(sources, callback) {
    const images = {};
    let count = sources ? sources.length : 0;
    if (count === 0) { callback(images); return; }
    for (const source of sources) {
      const image = document.createElement('img');
      images[source] = image;
      this.addEvent(image, 'load', () => {
        if (--count === 0) callback(images);
      });
      image.src = source;
    }
  },

  loadSounds(cfg = {}) {
    if (typeof soundManager === 'undefined') {
      const path = cfg.path || 'sound/soundmanager2-nodebug-jsmin.js';
      const swf = cfg.swf || 'sound/swf';
      window.SM2_DEFER = true;
      this.loadScript(path, () => {
        window.soundManager = new SoundManager();
        soundManager.useHighPerformance = true;
        soundManager.useFastPolling = true;
        soundManager.url = swf;
        soundManager.defaultOptions.volume = 50;
        soundManager.onready(() => this.loadSounds(cfg));
        soundManager.beginDelayedInit();
      });
    } else {
      const sounds = [];
      for (const [id, url] of Object.entries(cfg.sounds || {})) {
        sounds.push(soundManager.createSound({
          id,
          url
        }));
      }
      if (cfg.onload) cfg.onload(sounds);
    }
  },

  random(min, max) {
    return (min + (Math.random() * (max - min)));
  },
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randomChoice(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
  },
  randomBool() {
    return this.randomChoice([true, false]);
  },

  timestamp() {
    return performance.now();
  },

  THREESIXTY: Math.PI * 2,

  KEY: {
    BACKSPACE: 8,
    TAB: 9,
    RETURN: 13,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    HOME: 36,
    END: 35,
    PAGEUP: 33,
    PAGEDOWN: 34,
    INSERT: 45,
    ZERO: 48,
    ONE: 49,
    TWO: 50,
    A: 65,
    D: 68,
    W: 87,
    S: 83,
    L: 76,
    P: 80,
    Q: 81,
    TILDA: 192
  },

  //=============================================================================
  // Upgraded GPU Vector Mathematics Engine
  //=============================================================================
  Math: {
    bound(box) {
      if (box.radius) {
        box.w = 2 * box.radius;
        box.h = 2 * box.radius;
        box.left = box.x - box.radius;
        box.right = box.x + box.radius;
        box.top = box.y - box.radius;
        box.bottom = box.y + box.radius;
      } else {
        box.left = box.x;
        box.right = box.x + box.w;
        box.top = box.y;
        box.bottom = box.y + box.h;
      }
      return box;
    },

    overlap(box1, box2, returnOverlap) {
      if ((box1.right < box2.left) || (box1.left > box2.right) || (box1.top > box2.bottom) || (box1.bottom < box2.top)) {
        return false;
      }
      if (returnOverlap) {
        const left = Math.max(box1.left, box2.left);
        const right = Math.min(box1.right, box2.right);
        const top = Math.max(box1.top, box2.top);
        const bottom = Math.min(box1.bottom, box2.bottom);
        return {
          x: left,
          y: top,
          w: right - left,
          h: bottom - top,
          left,
          right,
          top,
          bottom
        };
      }
      return true;
    },

    // Modern Parameter Defaults handle fallbacks cleanly
    normalize(vec, m = 1) {
      vec.m = this.magnitude(vec.x, vec.y);
      if (vec.m === 0) {
        vec.x = vec.y = vec.m = 0;
      } else {
        vec.m = vec.m / m;
        vec.x /= vec.m;
        vec.y /= vec.m;
        vec.m = m;
      }
      return vec;
    },

    magnitude(x, y) {
      return Math.hypot(x, y);
    },

    move(x, y, dx, dy, dt) {
      const nx = dx * dt;
      const ny = dy * dt;
      return {
        x: x + nx,
        y: y + ny,
        dx,
        dy,
        nx,
        ny
      };
    },

    accelerate(x, y, dx, dy, accel, dt) {
      const x2 = x + (dt * dx) + (accel * dt * dt * 0.5);
      const y2 = y + (dt * dy) + (accel * dt * dt * 0.5);
      const dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
      const dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
      return {
        nx: (x2 - x),
        ny: (y2 - y),
        x: x2,
        y: y2,
        dx: dx2,
        dy: dy2
      };
    },

    intercept(x1, y1, x2, y2, x3, y3, x4, y4, d) {
      const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
      if (denom !== 0) {
        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        if ((ua >= 0) && (ua <= 1)) {
          const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
          if ((ub >= 0) && (ub <= 1)) {
            return {
              x: x1 + (ua * (x2 - x1)),
              y: y1 + (ua * (y2 - y1)),
              d
            };
          }
        }
      }
      return null;
    },

    ballIntercept(ball, rect, nx, ny) {
      let pt;
      if (nx < 0) {
        pt = this.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, rect.right + ball.radius, rect.top - ball.radius, rect.right + ball.radius, rect.bottom + ball.radius, "right");
      } else if (nx > 0) {
        pt = this.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, rect.left - ball.radius, rect.top - ball.radius, rect.left - ball.radius, rect.bottom + ball.radius, "left");
      }
      if (!pt) {
        if (ny < 0) {
          pt = this.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, rect.left - ball.radius, rect.bottom + ball.radius, rect.right + ball.radius, rect.bottom + ball.radius, "bottom");
        } else if (ny > 0) {
          pt = this.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, rect.left - ball.radius, rect.top - ball.radius, rect.right + ball.radius, rect.top - ball.radius, "top");
        }
      }
      return pt;
    }
  },

  //=============================================================================
  // Game Loop Core Engine
  //=============================================================================
  Runner: class {
    constructor(id, gameClass, cfg) {
      this.cfg = {
        ...(gameClass.Defaults || {}),
        ...(cfg || {})
      };
      this.fps = this.cfg.fps || 60;
      this.interval = 1000.0 / this.fps;
      this.canvas = $(id);
      this.resize();
      this.front = this.canvas;
      this.front2d = this.front.getContext('2d');
      this.resetStats();

      this._loopBound = (time) => this.loop(time);

      // Dynamic structural fallback helper: Safely accepts either old ES5 objects or new ES6 classes
      if (typeof gameClass === 'function') {
        this.game = new gameClass(this, this.cfg);
      } else {
        // Legacy construction fallback while breakout.js continues its progressive refactor
        this.game = Object.create(gameClass);
        if (this.game.initialize) this.game.initialize(this, this.cfg);
      }

      if (this.cfg.state) {
        new StateMachine({
          target: this.game,
          ...this.cfg.state
        });
      }

      // Instantiate our modern centralized Input Manager directly to the running instance
      this.input = new Game.InputManager(this.game, this);
      this.game.input = this.input; // Overwrites the broken legacy factory reference

      this.initCanvas();
	  this.addEvents();
    }

    start() {
      this.running = true;
      this.lastFrame = Game.timestamp();
      this._reqFrame = requestAnimationFrame(this._loopBound);
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this._reqFrame);
    }

    loop(time) {
      if (!this.running) return;
      this._reqFrame = requestAnimationFrame(this._loopBound);
      const frameStart = time ?? Game.timestamp();

      let dt = (frameStart - this.lastFrame) / 1000.0;
      if (dt > 0.25) dt = 0.25;

      this.input?.update?.();
      this.update(dt);
      const midTimelineAnchor = Game.timestamp(); // Captures the exact boundary dividing update from draw
      this.draw();
      const frameEnd = Game.timestamp();
      this.updateStats(midTimelineAnchor - frameStart, frameEnd - midTimelineAnchor);
      this.lastFrame = frameStart;
      this.input?.clearJustPressed?.();
    }

    initCanvas() {
      if (this.game?.initCanvas) this.game.initCanvas(this.front2d);
    }
    update(dt) {
      this.game.update(dt);
    }
    draw() {
      this.game.draw(this.front2d);
      this.drawStats(this.front2d);
    }

    resetStats() {
      this.stats = {
        count: 0,
        fps: 0,
        update: 0,
        draw: 0,
        frame: 0
      };
    }

    updateStats(update, draw) {
      if (this.cfg.stats) {
        this.stats.update = Math.max(1, update);
        this.stats.draw = Math.max(1, draw);
        this.stats.frame = this.stats.update + this.stats.draw;
        this.stats.count = this.stats.count === this.fps ? 0 : this.stats.count + 1;
        this.stats.fps = Math.min(this.fps, 1000 / this.stats.frame);
      }
    }

    strings = {
      frame: "frame: ",
      fps: "fps: ",
      update: "update: ",
      draw: "draw: ",
      ms: "ms"
    };

    drawStats(ctx) {
      if (this.cfg.stats) {
        ctx.fillText(this.strings.frame + Math.round(this.stats.count), this.width - 100, this.height - 60);
        ctx.fillText(this.strings.fps + Math.round(this.stats.fps), this.width - 100, this.height - 50);
        ctx.fillText(this.strings.update + Math.round(this.stats.update) + this.strings.ms, this.width - 100, this.height - 40);
        ctx.fillText(this.strings.draw + Math.round(this.stats.draw) + this.strings.ms, this.width - 100, this.height - 30);
      }
    }

    addEvents() {
      window.addEventListener('resize', () => this.onresize());
    }

    onresize() {
      this.stop();
      if (this.onresizeTimer) clearTimeout(this.onresizeTimer);
      this.onresizeTimer = setTimeout(() => {
        this.resize();
        this.start();
      }, 50);
    }

    resize() {
      const box = this.canvas.getBoundingClientRect();
      const w = Math.floor(box.width);
      const h = Math.floor(box.height);
      const ratio = window.devicePixelRatio || 1;
      const physW = Math.floor(w * ratio);
      const physH = Math.floor(h * ratio);
    
      this.bounds = box;              // ← always refresh position
    
      if (this.width !== physW || this.height !== physH) {
        this.width = physW;
        this.height = physH;
        this.canvas.width = physW;
        this.canvas.height = physH;
        if (this.game?.onresize) this.game.onresize(this.width, this.height);
        this.initCanvas();
      }
    }

    onkeydown(ev) {
      if (this.game.onkeydown) return this.game.onkeydown(ev.keyCode);
      else if (this.cfg.keys) return this.onkey(ev.keyCode, 'down');
    }

    onkeyup(ev) {
      if (this.game.onkeyup) return this.game.onkeyup(ev.keyCode);
      else if (this.cfg.keys) return this.onkey(ev.keyCode, 'up');
    }

    onkey(keyCode, mode) {
      const state = this.game.current;
      for (const k of this.cfg.keys) {
        const targetMode = k.mode || 'up';
        if (k.key === keyCode || (k.keys && k.keys.includes(keyCode))) {
          if (!k.state || k.state === state) {
            if (targetMode === mode) {
              k.action.call(this.game);
            }
          }
        }
      }
    }

    storage() {
      try {
        return window.localStorage || {};
      } catch (e) {
        return {};
      }
    }

    alert(msg) {
      this.stop();
      window.alert(msg); // FIXED: Removed undeclared assignment
      this.start();
    }

    confirm(msg) {
      this.stop();
      const result = window.confirm(msg); // FIXED: Scoped cleanly with const for strict mode
      this.start();
      return result;
    }
  } // Runner
}; // Game

//=============================================================================
// Synchronized Unified Input Manager Class
//=============================================================================
Game.InputManager = class {
  constructor(game, runner) {
    this.game = game;
    this.runner = runner;

    this.actions = {
      smash: false,
      launch: false,
      escape: false,
      dashLeft: false,
      dashRight: false
    };
    this.justPressed = {
      smash: false,
      launch: false,
      escape: false,
      dashLeft: false,
      dashRight: false
    };

    this.axisX = 0;
    this.pointerX = null;

    this._lastRawMouseX = null;
    this._lastRawMouseY = null;

    this._keyLeft = false;
    this._keyRight = false;
    this._prevGpSmash = false;
    this._prevGpDashL = false;
    this._prevGpDashR = false;

    this.bindEvents();
  }

  bindEvents() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      // Anti-Scroll: Prevent Spacebar & Arrow keys from hijacking browser viewport
      if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }
      this.handleKeyboard(e.keyCode, true);
      this.triggerAudioUnlock();
    });
    window.addEventListener('keyup', (e) => this.handleKeyboard(e.keyCode, false));

    window.addEventListener('mousemove', (e) => {
      if (!this.runner.bounds) return;

      if (this._lastRawMouseX === null || this._lastRawMouseY === null) {
        this._lastRawMouseX = e.clientX;
        this._lastRawMouseY = e.clientY;
        return;
      }

      const deltaX = Math.abs(e.clientX - this._lastRawMouseX);
      const deltaY = Math.abs(e.clientY - this._lastRawMouseY);

      if (deltaX < 3 && deltaY < 3) {
        return;
      }

      this._lastRawMouseX = e.clientX;
      this._lastRawMouseY = e.clientY;

      const scale = this.runner.width / this.runner.bounds.width;
      this.pointerX = (e.clientX - this.runner.bounds.left) * scale;
    });

    window.addEventListener('mousedown', () => {
      this.justPressed.smash = true;
      this.actions.smash = true;
      this.triggerAudioUnlock();
    });
    window.addEventListener('mouseup', () => this.actions.smash = false);

    window.addEventListener('touchstart', (e) => {
      this.triggerAudioUnlock();
      if (e.targetTouches.length !== 1) return;
      this.justPressed.smash = true;
      this.actions.smash = true;
      this.updateTouchPosition(e.targetTouches[0]);
    }, {
      passive: true
    });

    window.addEventListener('touchmove', (e) => {
      if (e.targetTouches.length !== 1) return;
      this.updateTouchPosition(e.targetTouches[0]);
    }, {
      passive: true
    });

    window.addEventListener('touchend', () => {
      this.actions.smash = false;
      this.pointerX = null;
    });
  }

  updateTouchPosition(touch) {
    if (!this.runner.bounds) return;
    const scale = this.runner.width / this.runner.bounds.width;
    this.pointerX = (touch.pageX - this.runner.bounds.left) * scale;
  }

  handleKeyboard(keyCode, isPressed) {
        const K = Game.KEY;
        const currentState = this.game.current;
        const mode = isPressed ? 'down' : 'up';

        if (isPressed) {
            this._lastRawMouseX = null;
            this._lastRawMouseY = null;
        }

        if (currentState === 'game') {
            if (keyCode === K.SPACE || keyCode === K.UP || keyCode === K.W) {
                if (isPressed) this.justPressed.smash = true; 
                this.actions.smash = isPressed;
            }
            if (keyCode === K.LEFT || keyCode === K.A) this._keyLeft = isPressed;
            if (keyCode === K.RIGHT || keyCode === K.D) this._keyRight = isPressed;
            if (keyCode === K.ESC) {
                if (isPressed) this.justPressed.escape = true;
                this.actions.escape = isPressed;
            }
        }

        if (this.runner?.cfg?.keys) {
            for (const k of this.runner.cfg.keys) {
                const targetMode = k.mode || 'up';
                
                // Route action to execute if it matches the global execution scope
                if (!k.state || k.state === currentState) {
                    if (k.key === keyCode || (k.keys && k.keys.includes(keyCode))) {
                        if (targetMode === mode) {
                            k.action.call(this.game);
                        }
                    }
                }
            }
        }
    }

  isButtonPressed(gp, index) {
    return !!(gp && gp.buttons[index] && gp.buttons[index].pressed);
  }

  update() {
    // FIXED: Cache the native lookup exactly once per frame update
    const gp = navigator.getGamepads?.()[0] || null;

    // Evaluate edge-triggers using the optimized local state reference pass
    const gpSmash = this.isButtonPressed(gp, 0);
    const gpDashL = this.isButtonPressed(gp, 4);
    const gpDashR = this.isButtonPressed(gp, 5);

    if (gpSmash && !this._prevGpSmash) this.justPressed.smash = true;
    if (gpDashL && !this._prevGpDashL) this.justPressed.dashLeft = true;
    if (gpDashR && !this._prevGpDashR) this.justPressed.dashRight = true;

    this._prevGpSmash = gpSmash;
    this._prevGpDashL = gpDashL;
    this._prevGpDashR = gpDashR;

    this.axisX = 0;
    if (this._keyLeft) this.axisX -= 1.0;
    if (this._keyRight) this.axisX += 1.0;

    // FIXED: Reuse the cached reference instead of invoking getGamepads() a 4th time for the stick axis
    if (gp) {
      if (Math.abs(gp.axes[0]) > 0.15) this.axisX = gp.axes[0];
      if (gp.buttons[14] && gp.buttons[14].pressed) this.axisX = -1.0;
      if (gp.buttons[15] && gp.buttons[15].pressed) this.axisX = 1.0;
    }
  }

  wasActionJustPressed(actionName) {
    return !!this.justPressed[actionName];
  }

  clearJustPressed() {
    for (const key in this.justPressed) {
      this.justPressed[key] = false;
    }
  }

  triggerAudioUnlock() {
    if (this.game && this.game.userAudioUnlocked === false) {
      this.game.userAudioUnlocked = true;
      try {
        if (this.game.tryStartBGM) this.game.tryStartBGM();
      } catch (e) {}
    }
  }
};