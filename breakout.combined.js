//=============================================================================
//
// We need some ECMAScript 5 methods but we need to implement them ourselves
// for older browsers (compatibility: http://kangax.github.com/es5-compat-table/)
//
//  Function.bind:        https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
//  Object.create:        http://javascript.crockford.com/prototypal.html
//  Object.extend:        (defacto standard like jquery $.extend or prototype's Object.extend)
//
//  Object.construct:     our own wrapper around Object.create that ALSO calls
//                        an initialize constructor method if one exists
//
//=============================================================================

if (!Function.prototype.bind) {
	Function.prototype.bind = function (obj) {
		let slice = [].slice
			, args = slice.call(arguments, 1)
			, self = this
			, nop = function () {}
			, bound = function () {
				return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
			};
		nop.prototype = self.prototype;
		bound.prototype = new nop();
		return bound;
	};
}

if (!Object.create) {
	Object.create = function (base) {
		function F() {};
		F.prototype = base;
		return new F();
	}
}

if (!Object.construct) {
	Object.construct = function (base) {
		let instance = Object.create(base);
		if (instance.initialize)
			instance.initialize.apply(instance, [].slice.call(arguments, 1));
		return instance;
	}
}

if (!Object.extend) {
	Object.extend = function (destination, source) {
		for (let property in source) {
			if (source.hasOwnProperty(property))
				destination[property] = source[property];
		}
		return destination;
	};
}

if (!window.requestAnimationFrame) { // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback, element) {
			window.setTimeout(callback, 1000 / 60);
		}
}


//=============================================================================
// Minimal DOM Library ($)
//=============================================================================

Element = function () {

	let instance = {

		_extended: true,

		showIf: function (on) {
			if (on) this.show();
			else this.hide();
		}
		, show: function () {
			this.style.display = '';
		}
		, hide: function () {
			this.style.display = 'none';
		}
		, update: function (content) {
			this.innerHTML = content;
		},

		hasClassName: function (name) {
			return (new RegExp("(^|\s*)" + name + "(\s*|$)")).test(this.className)
		}
		, addClassName: function (name) {
			this.toggleClassName(name, true);
		}
		, removeClassName: function (name) {
			this.toggleClassName(name, false);
		}
		, toggleClassName: function (name, on) {
			let classes = this.className.split(' ');
			let n = classes.indexOf(name);
			on = (typeof on == 'undefined') ? (n < 0) : on;
			if (on && (n < 0))
				classes.push(name);
			else if (!on && (n >= 0))
				classes.splice(n, 1);
			this.className = classes.join(' ');
		}
	};

	let get = function (ele) {
		if (typeof ele == 'string')
			ele = document.getElementById(ele);
		if (!ele._extended)
			Object.extend(ele, instance);
		return ele;
	};

	return get;

}();

$ = Element;

//=============================================================================
// State Machine
//=============================================================================

StateMachine = {

	//---------------------------------------------------------------------------

	create: function (cfg) {

		let target = cfg.target || {};
		let events = cfg.events;

		let n, event, name, can = {};
		for (n = 0; n < events.length; n++) {
			event = events[n];
			name = event.name;
			can[name] = (can[name] || []).concat(event.from);
			target[name] = this.buildEvent(name, event.from, event.to, target);
		}

		target.current = 'none';
		target.is = function (state) {
			return this.current == state;
		};
		target.can = function (event) {
			return can[event].indexOf(this.current) >= 0;
		};
		target.cannot = function (event) {
			return !this.can(event);
		};

		if (cfg.initial) { // see "initial" qunit tests for examples
			let initial = (typeof cfg.initial == 'string') ? {
				state: cfg.initial
			} : cfg.initial; // allow single string to represent initial state, or complex object to configure { state: 'first', event: 'init', defer: true|false }
			name = initial.event || 'startup';
			can[name] = ['none'];
			event = this.buildEvent(name, 'none', initial.state, target);
			if (initial.defer)
				target[name] = event; // allow caller to trigger initial transition event
			else
				event.call(target);
		}

		return target;
	},

	//---------------------------------------------------------------------------

	buildEvent: function (name, from, to, target) {

		return function () {

			if (this.cannot(name))
				throw "event " + name + " innapropriate in current state " + this.current;

			let beforeEvent = this['onbefore' + name];
			if (beforeEvent && (false === beforeEvent.apply(this, arguments)))
				return;

			if (this.current != to) {

				let exitState = this['onleave' + this.current];
				if (exitState)
					exitState.apply(this, arguments);

				this.current = to;

				let enterState = this['onenter' + to] || this['on' + to];
				if (enterState)
					enterState.apply(this, arguments);
			}

			let afterEvent = this['onafter' + name] || this['on' + name];
			if (afterEvent)
				afterEvent.apply(this, arguments);
		}

	}

	//---------------------------------------------------------------------------

};

//=============================================================================
// GAME
//=============================================================================

Game = {

	compatible: function () {
		return Object.create &&
			Object.extend &&
			Function.bind &&
			document.addEventListener && // HTML5 standard, all modern browsers that support canvas should also support add/removeEventListener
			Game.ua.hasCanvas
	},

	start: function (id, game, cfg) {
		if (Game.compatible())
			return Game.current = Object.construct(Game.Runner, id, game, cfg).game; // return the game instance, not the runner (caller can always get at the runner via game.runner)
	},

	ua: function () { // should avoid user agent sniffing... but sometimes you just gotta do what you gotta do
		let ua = navigator.userAgent.toLowerCase();
		let key = ((ua.indexOf("opera") > -1) ? "opera" : null);
		key = key || ((ua.indexOf("firefox") > -1) ? "firefox" : null);
		key = key || ((ua.indexOf("chrome") > -1) ? "chrome" : null);
		key = key || ((ua.indexOf("safari") > -1) ? "safari" : null);
		key = key || ((ua.indexOf("msie") > -1) ? "ie" : null);

		try {
			let re = (key == "ie") ? "msie (\\d)" : key + "\\/(\\d\\.\\d)"
			let matches = ua.match(new RegExp(re, "i"));
			var version = matches ? parseFloat(matches[1]) : null;
		} catch (e) {}

		return {
			full: ua
			, name: key + (version ? " " + version.toString() : "")
			, version: version
			, isFirefox: (key == "firefox")
			, isChrome: (key == "chrome")
			, isSafari: (key == "safari")
			, isOpera: (key == "opera")
			, isIE: (key == "ie")
			, hasCanvas: (document.createElement('canvas').getContext)
			, hasAudio: (typeof (Audio) != 'undefined')
			, hasTouch: ('ontouchstart' in window)
		}
	}(),

	addEvent: function (obj, type, fn) {
		$(obj).addEventListener(type, fn, false);
	}
	, removeEvent: function (obj, type, fn) {
		$(obj).removeEventListener(type, fn, false);
	},

	windowWidth: function () {
		return window.innerWidth || /* ie */ document.documentElement.offsetWidth;
	}
	, windowHeight: function () {
		return window.innerHeight || /* ie */ document.documentElement.offsetHeight;
	},

	ready: function (fn) {
		if (Game.compatible())
			Game.addEvent(document, 'DOMContentLoaded', fn);
	},

	renderToCanvas: function (width, height, render, canvas) { // http://kaioa.com/node/103
		canvas = canvas || document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		render(canvas.getContext('2d'));
		return canvas;
	},

	loadScript: function (src, cb) {
		let head = document.getElementsByTagName('head')[0];
		let s = document.createElement('script');
		head.appendChild(s);
		if (Game.ua.isIE) {
			s.onreadystatechange = function (e) {
				if (e.currentTarget.readyState == 'loaded')
					cb(e.currentTarget);
			}
		} else {
			s.onload = function (e) {
				cb(e.currentTarget);
			}
		}
		s.type = 'text/javascript';
		s.src = src;
	},

	loadImages: function (sources, callback) {
		/* load multiple images and callback when ALL have finished loading */
		let images = {};
		let count = sources ? sources.length : 0;
		if (count == 0) {
			callback(images);
		} else {
			for (let n = 0; n < sources.length; n++) {
				let source = sources[n];
				let image = document.createElement('img');
				images[source] = image;
				Game.addEvent(image, 'load', function () {
					if (--count == 0) callback(images);
				});
				image.src = source;
			}
		}
	},

	loadSounds: function (cfg) {
		cfg = cfg || {};
		if (typeof soundManager == 'undefined') {
			let path = cfg.path || 'sound/soundmanager2-nodebug-jsmin.js';
			let swf = cfg.swf || 'sound/swf';
			window.SM2_DEFER = true;
			Game.loadScript(path, function () {
				window.soundManager = new SoundManager();
				soundManager.useHighPerformance = true;
				soundManager.useFastPolling = true;
				soundManager.url = swf;
				soundManager.defaultOptions.volume = 50; // shhh!
				soundManager.onready(function () {
					Game.loadSounds(cfg);
				});
				soundManager.beginDelayedInit();
			});
		} else {
			let sounds = [];
			for (let id in cfg.sounds) {
				sounds.push(soundManager.createSound({
					id: id
					, url: cfg.sounds[id]
				}));
			}
			if (cfg.onload)
				cfg.onload(sounds);
		}
	},

	random: function (min, max) {
		return (min + (Math.random() * (max - min)));
	},

	randomInt: function (min, max) {
		return Math.floor(Math.random() * max) + min;
	},

	randomChoice: function (choices) {
		return choices[Math.round(Game.random(0, choices.length - 1))];
	},

	randomBool: function () {
		return Game.randomChoice([true, false]);
	},

	timestamp: function () {
		return new Date().getTime();
	},

	THREESIXTY: Math.PI * 2,

	KEY: {
		BACKSPACE: 8
		, TAB: 9
		, RETURN: 13
		, ESC: 27
		, SPACE: 32
		, LEFT: 37
		, UP: 38
		, RIGHT: 39
		, DOWN: 40
		, DELETE: 46
		, HOME: 36
		, END: 35
		, PAGEUP: 33
		, PAGEDOWN: 34
		, INSERT: 45
		, ZERO: 48
		, ONE: 49
		, TWO: 50
		, A: 65
		, D: 68
		, L: 76
		, P: 80
		, Q: 81
		, TILDA: 192
	},

	//-----------------------------------------------------------------------------

	Math: {

		bound: function (box) {
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

		overlap: function (box1, box2, returnOverlap) {
			if ((box1.right < box2.left) ||
				(box1.left > box2.right) ||
				(box1.top > box2.bottom) ||
				(box1.bottom < box2.top)) {
				return false;
			} else {
				if (returnOverlap) {
					let left = Math.max(box1.left, box2.left);
					let right = Math.min(box1.right, box2.right);
					let top = Math.max(box1.top, box2.top);
					let bottom = Math.min(box1.bottom, box2.bottom);
					return {
						x: left
						, y: top
						, w: right - left
						, h: bottom - top
						, left: left
						, right: right
						, top: top
						, bottom: bottom
					};
				} else {
					return true;
				}
			}
		},

		normalize: function (vec, m) {
			vec.m = this.magnitude(vec.x, vec.y);
			if (vec.m == 0) {
				vec.x = vec.y = vec.m = 0;
			} else {
				vec.m = vec.m / (m || 1);
				vec.x = vec.x / vec.m;
				vec.y = vec.y / vec.m;
				vec.m = vec.m / vec.m;
			}
			return vec;
		},

		magnitude: function (x, y) {
			return Math.sqrt(x * x + y * y);
		},

		move: function (x, y, dx, dy, dt) {
			let nx = dx * dt;
			let ny = dy * dt;
			return {
				x: x + nx
				, y: y + ny
				, dx: dx
				, dy: dy
				, nx: nx
				, ny: ny
			};
		},

		accelerate: function (x, y, dx, dy, accel, dt) {
			let x2 = x + (dt * dx) + (accel * dt * dt * 0.5);
			let y2 = y + (dt * dy) + (accel * dt * dt * 0.5);
			let dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
			let dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
			return {
				nx: (x2 - x)
				, ny: (y2 - y)
				, x: x2
				, y: y2
				, dx: dx2
				, dy: dy2
			};
		},

		intercept: function (x1, y1, x2, y2, x3, y3, x4, y4, d) {
			let denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
			if (denom != 0) {
				let ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
				if ((ua >= 0) && (ua <= 1)) {
					let ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
					if ((ub >= 0) && (ub <= 1)) {
						let x = x1 + (ua * (x2 - x1));
						let y = y1 + (ua * (y2 - y1));
						return {
							x: x
							, y: y
							, d: d
						};
					}
				}
			}
			return null;
		},

		ballIntercept: function (ball, rect, nx, ny) {
			let pt;
			if (nx < 0) {
				pt = Game.Math.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny
					, rect.right + ball.radius
					, rect.top - ball.radius
					, rect.right + ball.radius
					, rect.bottom + ball.radius
					, "right");
			} else if (nx > 0) {
				pt = Game.Math.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny
					, rect.left - ball.radius
					, rect.top - ball.radius
					, rect.left - ball.radius
					, rect.bottom + ball.radius
					, "left");
			}
			if (!pt) {
				if (ny < 0) {
					pt = Game.Math.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny
						, rect.left - ball.radius
						, rect.bottom + ball.radius
						, rect.right + ball.radius
						, rect.bottom + ball.radius
						, "bottom");
				} else if (ny > 0) {
					pt = Game.Math.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny
						, rect.left - ball.radius
						, rect.top - ball.radius
						, rect.right + ball.radius
						, rect.top - ball.radius
						, "top");
				}
			}
			return pt;
		}

	},

	//-----------------------------------------------------------------------------

	Runner: {

		initialize: function (id, game, cfg) {
			this.cfg = Object.extend(game.Defaults || {}, cfg || {});
			this.fps = this.cfg.fps || 60;
			this.interval = 1000.0 / this.fps;
			this.canvas = $(id);

			// FIX: Calculate initial size and DPI scale immediately
			this.resize();

			this.front = this.canvas;
			this.front2d = this.front.getContext('2d');
			this.addEvents();
			this.resetStats();

			this.game = Object.construct(game, this, this.cfg);

			if (this.cfg.state)
				StateMachine.create(Object.extend({
					target: this.game
				}, this.cfg.state));

			this.initCanvas();
		},

		start: function () {
			this.lastFrame = Game.timestamp();
			this.timer = setInterval(this.loop.bind(this), this.interval);
		},

		stop: function () {
			clearInterval(this.timer);
		},

		loop: function () {
			this._start = Game.timestamp();
			this.update((this._start - this.lastFrame) / 1000.0);
			this._middle = Game.timestamp();
			this.draw();
			this._end = Game.timestamp();
			this.updateStats(this._middle - this._start, this._end - this._middle);
			this.lastFrame = this._start;
		},

		initCanvas: function () {
			if (this.game && this.game.initCanvas)
				this.game.initCanvas(this.front2d);
		},

		update: function (dt) {
			this.game.update(dt);
		},

		draw: function () {
			this.game.draw(this.front2d);
			this.drawStats(this.front2d);
		},

		resetStats: function () {
			this.stats = {
				count: 0
				, fps: 0
				, update: 0
				, draw: 0
				, frame: 0
			};
		},

		updateStats: function (update, draw) {
			if (this.cfg.stats) {
				this.stats.update = Math.max(1, update);
				this.stats.draw = Math.max(1, draw);
				this.stats.frame = this.stats.update + this.stats.draw;
				this.stats.count = this.stats.count == this.fps ? 0 : this.stats.count + 1;
				this.stats.fps = Math.min(this.fps, 1000 / this.stats.frame);
			}
		},

		strings: {
			frame: "frame: "
			, fps: "fps: "
			, update: "update: "
			, draw: "draw: "
			, ms: "ms"
		},

		drawStats: function (ctx) {
			if (this.cfg.stats) {
				ctx.fillText(this.strings.frame + Math.round(this.stats.count), this.width - 100, this.height - 60);
				ctx.fillText(this.strings.fps + Math.round(this.stats.fps), this.width - 100, this.height - 50);
				ctx.fillText(this.strings.update + Math.round(this.stats.update) + this.strings.ms, this.width - 100, this.height - 40);
				ctx.fillText(this.strings.draw + Math.round(this.stats.draw) + this.strings.ms, this.width - 100, this.height - 30);
			}
		},

		addEvents: function () {
			Game.addEvent(document, 'keydown', this.onkeydown.bind(this));
			Game.addEvent(document, 'keyup', this.onkeyup.bind(this));
			Game.addEvent(window, 'resize', this.onresize.bind(this));
		},

		onresize: function () {
			this.stop();
			if (this.onresizeTimer) clearTimeout(this.onresizeTimer);
			this.onresizeTimer = setTimeout(this.onresizeend.bind(this), 50);
		},

		onresizeend: function () {
			this.resize();
			this.start();
		},

		resize: function () {
			// FIX: Dynamic resizing with High DPI support
			let box = this.canvas.getBoundingClientRect();
			let w = Math.floor(box.width);
			let h = Math.floor(box.height);

			// Handle Retina / High DPI screens
			let ratio = window.devicePixelRatio || 1;
			let physW = Math.floor(w * ratio);
			let physH = Math.floor(h * ratio);

			// Only resize if dimensions actually changed
			if (this.width !== physW || this.height !== physH) {
				this.width = physW;
				this.height = physH;
				this.canvas.width = physW;
				this.canvas.height = physH;
				this.bounds = box; // Store logical bounds for mouse mapping

				if (this.game && this.game.onresize)
					this.game.onresize(this.width, this.height);

				this.initCanvas();
			}
		},

		onkeydown: function (ev) {
			if (this.game.onkeydown) return this.game.onkeydown(ev.keyCode);
			else if (this.cfg.keys) return this.onkey(ev.keyCode, 'down');
		},

		onkeyup: function (ev) {
			if (this.game.onkeyup) return this.game.onkeyup(ev.keyCode);
			else if (this.cfg.keys) return this.onkey(ev.keyCode, 'up');
		},

		onkey: function (keyCode, mode) {
			let n, k, i, state = this.game.current;
			for (n = 0; n < this.cfg.keys.length; n++) {
				k = this.cfg.keys[n];
				k.mode = k.mode || 'up';
				if ((k.key == keyCode) || (k.keys && (k.keys.indexOf(keyCode) >= 0))) {
					if (!k.state || (k.state == state)) {
						if (k.mode == mode) {
							k.action.call(this.game);
						}
					}
				}
			}
		},

		storage: function () {
			try {
				return this.localStorage = this.localStorage || window.localStorage || {};
			} catch (e) {
				return this.localStorage = {};
			}
		},

		alert: function (msg) {
			this.stop();
			result = window.alert(msg);
			this.start();
			return result;
		},

		confirm: function (msg) {
			this.stop();
			result = window.confirm(msg);
			this.start();
			return result;
		}
	} // Runner
} // Game//=============================================================================
// Breakout in HTML5 / Javascript with powerups and a level creator.
// 
//=============================================================================
window.Breakout = {
  ServerConfig: {
    url: './api/api.php',
    secret: 'ChangeMeToSomethingRandomAndLong12345'
  },
  Floaters: {
    items: [],
    spawn: function (x, y, text, color) {
      this.items.push({
        x: x,
        y: y,
        text: text,
        color: color || '#fff',
        life: 1.0, // 1 second duration
        vy: -20 - Math.random() * 20 // Drift up
      });
    },
    update: function (dt) {
      for (var i = this.items.length - 1; i >= 0; i--) {
        var f = this.items[i];
        f.life -= dt;
        f.y += f.vy * dt;
        if (f.life <= 0) this.items.splice(i, 1);
      }
    },
    draw: function (ctx) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "bold 16px 'Mr Dafoe', cursive;";
      for (var i = 0; i < this.items.length; i++) {
        var f = this.items[i];
        ctx.globalAlpha = Math.max(0, f.life); // Fade out

        // Draw Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(f.text, f.x + 1, f.y + 1);

        // Draw Text
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.restore();
    }
  },
  HighScores: {
    KEY: 'breakout_highscores_v1',
    profanity: null,
    loaded: false,

    init: function () {
      if (this.loaded) return;
      this.loaded = true;
      this.loadProfanity();
      this.seedIfEmpty();
    },

    // Load profanity list from words.json (same folder)
    loadProfanity: function () {
      const self = this;
      try {
        fetch('./words.json', {
            cache: 'no-cache'
          })
          .then(function (r) {
            if (!r.ok) throw new Error('words.json fetch failed');
            return r.json();
          })
          .then(function (list) {
            if (Array.isArray(list)) self.profanity = list.map(function (w) {
              return String(w || '').toLowerCase();
            });
            else self.profanity = [];
          })
          .catch(function () {
            self.profanity = [];
          });
      } catch (e) {
        self.profanity = [];
      }
    },

    isProfane: function (name) {
      if (!name) return false;
      var s = String(name).toLowerCase().trim();
      if (!this.profanity || !this.profanity.length) return false;
      for (let i = 0; i < this.profanity.length; i++) {
        var w = this.profanity[i];
        if (!w) continue;
        if (s === w) return true;
        if (s.indexOf(w) !== -1) return true;
      }
      return false;
    },

    _load: function () {
      var raw = null;
      try {
        raw = window.localStorage.getItem(this.KEY);
      } catch (e) {}
      if (!raw) return [];
      try {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      } catch (e) {}
      return [];
    },

    _save: function (rows) {
      rows = Array.isArray(rows) ? rows : [];
      // keep only top 20, sort desc
      rows.sort(function (a, b) {
        return (Number(b.score) || 0) - (Number(a.score) || 0);
      });
      rows = rows.slice(0, 20);
      try {
        window.localStorage.setItem(this.KEY, JSON.stringify(rows));
      } catch (e) {}
      return rows;
    },

    seedIfEmpty: function () {
      // Optional seed for blank storage so the leaderboard UI has content
      var rows = this._load();
      if (rows && rows.length) return;
      var seed = [];
      for (let i = 0; i < 10; i++) {
        seed.push({
          name: 'AAA',
          score: 1000 - i * 100,
          ts: Date.now() - (i * 3600 * 1000)
        });
      }
      this._save(seed);
      try {
        console.log('[HS] seeded local leaderboard with', seed.length, 'rows');
      } catch (e) {}
    },

    top: function (limit) {
      limit = limit || 20;
      var rows = this._load();
      rows.sort(function (a, b) {
        return (Number(b.score) || 0) - (Number(a.score) || 0);
      });
      return Promise.resolve(rows.slice(0, limit));
    },

    submit: function (entry) {
      var rows = this._load();
      rows.push({
        name: String(entry.name || '').slice(0, 20),
        score: Number(entry.score) || 0,
        ts: Date.now()
      });
      this._save(rows);
      try {
        console.log('[HS] saved:', entry);
      } catch (e) {}
      return Promise.resolve({
        ok: true
      });
    },
    checkAndSubmit: function (score, limit) {
      const self = this;
      self.init();
      return new Promise(function (resolve) {
        try {
          console.log('[HS] checkAndSubmit() score=', score);
        } catch (e) {}
        if (!score || !(score > 0)) {
          try {
            console.log('[HS] not a positive score; skipping');
          } catch (e) {}
          return resolve(false);
        }

        self.top(limit || 20).then(function (rows) {
          var min = 0;
          if (Array.isArray(rows) && rows.length >= (limit || 20)) {
            for (let i = 0; i < rows.length; i++) {
              var s = Number(rows[i] && rows[i].score);
              if (!isFinite(s)) continue;
              if (min === 0 || s < min) min = s;
            }
          }
          var qualifies = (!rows || rows.length < (limit || 20) || score > min);
          try {
            console.log('[HS] qualifies=', qualifies, 'min=', min, 'rows=', rows && rows.length);
          } catch (e) {}

          if (!qualifies) return resolve(false);

          // Prompt user for a name
          setTimeout(function () {
            var name = window.prompt('New High Score! Enter your name (max 20 chars):', '');
            if (name == null) {
              try {
                console.log('[HS] prompt cancelled');
              } catch (e) {}
              return resolve(false);
            }
            name = String(name).trim().slice(0, 20);
            if (!name) {
              try {
                console.log('[HS] empty name; not saving');
              } catch (e) {}
              return resolve(false);
            }
            if (self.isProfane(name)) {
              try {
                console.warn('[HS] rejected profane name');
                alert('Name not allowed.');
              } catch (e) {}
              return resolve(false);
            }
            self.submit({
              name: name,
              score: score
            }).then(function () {
              return resolve(true);
            }).catch(function (e) {
              try {
                console.warn('[HS] submit error', e);
              } catch (_e) {}
              return resolve(false);
            });
          }, 50);
        }).catch(function (e) {
          try {
            console.warn('[HS] top error', e);
          } catch (_e) {}
          resolve(false);
        });
      });
    },
    loadProfanity: function () {
      const self = this;
      try {
        fetch('./words.json', {
          cache: 'no-cache'
        }).then(function (r) {
          if (!r.ok) throw new Error('words.json fetch failed');
          return r.json();
        }).then(function (list) {
          if (Array.isArray(list)) {
            self.profanity = list.map(function (w) {
              return String(w || '').toLowerCase();
            });
          } else {
            self.profanity = [];
          }
        }).catch(function () {
          self.profanity = [];
        });
      } catch (e) {
        self.profanity = [];
      }
    },
    isProfane: function (name) {
      if (!name) return false;
      var s = String(name).toLowerCase().trim();
      if (!this.profanity || !this.profanity.length) return false;
      for (let i = 0; i < this.profanity.length; i++) {
        var w = this.profanity[i];
        if (!w) continue;
        if (s === w) return true;
        if (s.indexOf(w) !== -1) return true;
      }
      return false;
    },
    top: function (limit) {
      limit = limit || 20;
      return fetch(this.API_BASE + '/top?limit=' + encodeURIComponent(limit), {
          credentials: 'same-origin'
        })
        .then(function (r) {
          if (!r.ok) throw new Error('highscores top failed');
          return r.json();
        });
    },
    submit: function (entry) {
      return fetch(this.API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry),
        credentials: 'same-origin'
      }).then(function (r) {
        if (!r.ok) throw new Error('highscores submit failed');
        return r.json();
      });
    },
    checkAndSubmit: function (score, limit) {
      const self = this;
      if (!score || !(score > 0)) return;
      self.init();
      self.top(limit || 20).then(function (rows) {
        var min = 0;
        if (Array.isArray(rows) && rows.length >= (limit || 20)) {
          for (let i = 0; i < rows.length; i++) {
            var s = Number(rows[i] && rows[i].score);
            if (!isFinite(s)) continue;
            if (min === 0 || s < min) min = s;
          }
        }
        if (!rows || rows.length < (limit || 20) || score > min) {
          setTimeout(function () {
            var name = window.prompt('New High Score! Enter your name (max 20 chars):', '');
            if (name == null) return;
            name = String(name).trim().slice(0, 20);
            if (!name) return;
            if (self.isProfane(name)) {
              alert('Name not allowed.');
              return;
            }
            self.submit({
                name: name,
                score: score,
                ts: Date.now()
              })
              .catch(function (e) {
                console && console.warn && console.warn(e);
              });
          }, 50);
        }
      }).catch(function (e) {
        console && console.warn && console.warn(e);
      });
    }
  },
  GlobalScores: {
    cache: null,
    lastFetch: 0,

    top: function (limit) {
      const self = this;
      return new Promise(function (resolve, reject) {
        // Cache for 10 seconds to prevent spamming the server
        if (self.cache && (Date.now() - self.lastFetch < 10000)) {
          resolve(self.cache);
          return;
        }

        fetch(Breakout.ServerConfig.url)
          .then(r => r.json())
          .then(data => {
            self.cache = data;
            self.lastFetch = Date.now();
            resolve(data);
          })
          .catch(err => {
            console.error("Global HS Error:", err);
            resolve([]); // Return empty on error so game doesn't crash
          });
      });
    },

    add: function (name, score) {
      // 1. Simple Security Hash
      // Note: In a real production game, hashing should be more complex, 
      // but this prevents casual tampering.
      var secret = Breakout.ServerConfig.secret;
      var hash = "";

      // Simple MD5 implementation or use a library. 
      // Since standard JS doesn't have md5 built-in, we will skip the hash 
      // generation here for the EXAMPLE, but you should include an MD5 lib
      // or use a simple string match if you don't have one.
      // For this example, let's assume you include a tiny MD5 function or 
      // just rely on the server validation if you can implement the hash here.

      // NOTE: For now, we will send data. You must add an MD5 library 
      // (like spark-md5) to index.html to generate the hash, 
      // OR remove the hash check in PHP for testing.

      // Let's assume an external md5() function exists:
      if (typeof md5 === 'function') {
        hash = md5(name + score + secret);
      }

      return fetch(Breakout.ServerConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          score: score,
          hash: hash
        })
      });
    }
  },
  ensureBallSpeed: function (b) {
    if (!b) return;
    var def = (Breakout.Defaults && Breakout.Defaults.ball && (Breakout.Defaults.ball.defaultSpeed || Breakout.Defaults.ball.speed)) || 15;
    var fmin = (Breakout.Defaults && Breakout.Defaults.ball && Breakout.Defaults.ball.minSpeedFactor) || 0.5;
    var fmax = (Breakout.Defaults && Breakout.Defaults.ball && Breakout.Defaults.ball.maxSpeedFactor) || 0; // 0 = no cap
    var minS = def * fmin;
    var maxS = fmax > 0 ? def * fmax : 0;
    var vx = Number(b.vx);
    if (!isFinite(vx)) vx = 0;
    var vy = Number(b.vy);
    if (!isFinite(vy)) vy = 0;
    var s = Math.hypot(vx, vy);
    if (!isFinite(s) || s <= 0) {
      b.vx = 0;
      b.vy = -minS;
      return;
    }
    var target = s;
    if (s < minS) target = minS;
    else if (maxS && s > maxS) target = maxS;
    if (target !== s) {
      var k = target / s;
      b.vx *= k;
      b.vy *= k;
    }
  },
  // --- Audio unlock & BGM control (autoplay-safe) ---
  installAudioUnlock: function () {
    if (this._audioUnlockInstalled) return;
    this._audioUnlockInstalled = true;
    const self = this;

    function unlockOnce() {
      self.userAudioUnlocked = true;
      try {
        self.tryStartBGM();
      } catch (e) {}
      document.removeEventListener('pointerdown', unlockOnce);
      document.removeEventListener('keydown', unlockOnce);
      document.removeEventListener('touchstart', unlockOnce);
      document.removeEventListener('mousedown', unlockOnce);
      document.removeEventListener('click', unlockOnce);
    }
    document.addEventListener('pointerdown', unlockOnce);
    document.addEventListener('keydown', unlockOnce);
    document.addEventListener('touchstart', unlockOnce, {
      passive: true
    });
    document.addEventListener('mousedown', unlockOnce);
    document.addEventListener('click', unlockOnce);
  },
  // 1. Robust Music Player (Handles looping + Theme Switching)
  playThemeMusic: function (themeName) {
    if (!this.userAudioUnlocked) return;
    if (typeof soundManager === 'undefined' || !soundManager.ok()) return;

    var info = this.themeAudioFor(themeName || this.theme);
    var bgm = soundManager.getSoundById('bgm');

    // If we have a BGM track but it's the WRONG theme, destroy it.
    if (bgm && bgm.url !== info.url) {
      bgm.stop();
      soundManager.destroySound('bgm');
      bgm = null; // Force recreation below
    }

    // Create if missing (or destroyed above)
    if (!bgm) {
      bgm = soundManager.createSound({
        id: 'bgm',
        url: info.url,
        volume: 55,
        // FIX: Reliable Loop Callback
        onfinish: function () {
          this.play();
        }
      });
    }

    // Play if not already playing
    if (bgm.playState !== 1) {
      // Ensure we catch autoplay blocks
      try {
        var p = bgm.play();
        // Modern SM2/Browsers return promises sometimes; catch rejection
        if (p && p.catch) p.catch(function (e) {
          console.log("Autoplay blocked", e);
        });
      } catch (e) {}
    }

    this._bgmState = 'playing';
  },

  // 2. Updated Helper to determine URL (Yours was good, keeping it here for context)
  themeAudioFor: function (theme) {
    var t = (theme || this.theme || 'synthwave').toLowerCase();
    // Fallback if theme is undefined
    if (t === 'undefined') t = 'synthwave';

    var mp3 = './sound/breakout/bgm-' + t + '.mp3';
    var beats = './sound/breakout/bgm-' + t + '.beats.json';
    return {
      url: mp3,
      beats: beats
    };
  },

  // 3. Update tryStartBGM to use the new logic
  tryStartBGM: function () {
    if (this.is && !this.is('game')) return;
    // Simply delegate to the robust function using current theme
    this.playThemeMusic(this.theme);
  },

  // 4. Stop Helper
  stopBGM: function () {
    try {
      var bgm = soundManager.getSoundById('bgm');
      if (bgm) bgm.stop();
    } catch (e) {}
    this._bgmState = 'idle';
  },

  // Map visual themes to BGM tracks and beatmaps
  themeAudioFor: function (theme) {
    var t = (theme || this.theme || 'synthwave').toLowerCase();
    var mp3 = './sound/breakout/bgm-' + t + '.mp3';
    var beats = './sound/breakout/bgm-' + t + '.beats.json';
    return {
      url: mp3,
      beats: beats
    };
  },

  //---------------------------------------------------------------------------
  // Defaults
  //---------------------------------------------------------------------------
  Defaults: {
    level: {
      name: "",
      theme: "synthwave"
    },
    fps: 60,
    stats: false,
    score: {
      lives: {
        initial: 3,
        max: 5
      }
    },
    court: {
      xchunks: 30,
      ychunks: 25
    },
    ball: {
      minSpeedFactor: 0.55,
      maxSpeedFactor: 0,
      radius: 0.3,
      defaultRadius: 0.3,
      speed: 17.5, // was 15 but trying to speed up the game and add challenge
      defaultSpeed: 17.5,
      labels: {
        3: {
          text: 'Ready...',
          fill: '#FF2121',
          stroke: 'black',
          font: 'bold 40pt "Mr Dafoe", cursive'
        },
        2: {
          text: 'Set..',
          fill: 'white',
          stroke: 'black',
          font: 'bold 50pt "Mr Dafoe", cursive'
        },
        1: {
          text: 'Let\'s Go!',
          fill: 'green',
          stroke: 'black',
          font: 'bold 60pt "Mr Dafoe", cursive'
        }
      }
    },
    paddle: {
      width: 6,
      defaultWidth: 6,
      height: 1,
      speed: 20,
      recoil: 0,
    },
    color: {
      background: 'rgba(200, 200, 200, 0.5)',
      foreground: 'white',
      border: '#222',
      wall: '#333',
      ball: 'white',
      paddle: '#4d2f5d',
      score: "#EFD279",
      highscore: "#EFD279"
    },
    state: {
      initial: 'menu',
      events: [{
        name: 'play',
        from: 'menu',
        to: 'game'
      }, {
        name: 'abandon',
        from: 'game',
        to: 'menu'
      }, {
        name: 'lose',
        from: 'game',
        to: 'menu'
      }]
    },
    powerup: {
      droprate: {
        low: 0,
        high: 2.5,
        goal: 0
      }
    },
    keys: [{
      keys: [Game.KEY.LEFT, Game.KEY.A],
      mode: 'down',
      state: 'game',
      action: function () {
        this.paddle.moveLeft();
      }
    }, {
      keys: [Game.KEY.RIGHT, Game.KEY.D],
      mode: 'down',
      state: 'game',
      action: function () {
        this.paddle.moveRight();
      }
    }, {
      keys: [Game.KEY.LEFT, Game.KEY.A],
      state: 'game',
      action: function () {
        this.paddle.stopMovingLeft();
      }
    }, {
      keys: [Game.KEY.RIGHT, Game.KEY.D],
      state: 'game',
      action: function () {
        this.paddle.stopMovingRight();
      }
    }, {
      keys: [Game.KEY.SPACE, Game.KEY.RETURN],
      state: 'menu',
      action: function () {
        this.play();
      }
    }, {
      keys: [Game.KEY.SPACE, Game.KEY.RETURN],
      state: 'game',
      action: function () {
        // 1. Release Sticky Ball?
        if (this.ball.releaseSticky && this.ball.releaseSticky()) return;
        // 2. Launch Parked Ball?
        if (this.ball.hasParkedBall && this.ball.hasParkedBall()) {
          this.ball.launchNow();
          return;
        }
        // 3. Power Smash? (NEW)
        if (this.paddle && this.paddle.triggerSmash) {
          this.paddle.triggerSmash();
        }
      }
    }, {
      key: Game.KEY.ESC,
      state: 'game',
      action: function () {
        this.abandon();
      }
    }, {
      key: Game.KEY.UP,
      state: 'menu',
      action: function () {
        this.nextLevel();
      }
    }, {
      key: Game.KEY.DOWN,
      state: 'menu',
      action: function () {
        this.prevLevel();
      }
    }],
    sounds: {
      amongus: './sound/breakout/amongus.mp3',
      breaker: './sound/breakout/combobreaker.mp3',
      bumper: './sound/breakout/bumper.mp3',
      comeon: './sound/breakout/come-on.mp3',
      confuse: './sound/breakout/confused.mp3',
      doge: './sound/breakout/doge.mp3',
      explosion: './sound/breakout/explosion.mp3',
      finish: './sound/breakout/finish.mp3',
      ghost: './sound/breakout/ghost.mp3',
      jump: './sound/breakout/jump.mp3',
      king: './sound/breakout/kingcombo.mp3',
      lasers: './sound/breakout/lasers.mp3',
      lastchance: './sound/breakout/lastchance.mp3',
      lightning: './sound/breakout/lightning.mp3',
      menu_select: './sound/breakout/menu_select.mp3',
      brick: './sound/breakout/brick.mp3',
      damage: './sound/breakout/damage.mp3',
      gameover: './sound/breakout/gameover.mp3',
      go: './sound/breakout/go.mp3',
      levelup: './sound/breakout/levelup.mp3',
      loselife: './sound/breakout/loselife.mp3',
      paddle: './sound/breakout/paddle.mp3',
      portal: './sound/breakout/portal.mp3',
      powerup: './sound/breakout/powerup.mp3',
      suddendeath: './sound/breakout/suddendeath.mp3',
      trickshot: './sound/breakout/trickshot.mp3',
      thaw: './sound/breakout/thaw.mp3',
    },
  },
  //---------------------------------------------------------------------------
  initialize: function (runner, cfg) {
    // End-game extra states
    this.audio.init();
    this.mirror = this.mirror || {
      next: 3.0 + Math.random(),
      ripple: 0
    };
    this.ghosts = this.ghosts || {
      t: 0,
      phase: 0,
      solid: true
    };
    this.suddenDeath = false; // on/off
    this.laserGrid = this.laserGrid || {
      lines: [],
      t: 0,
      on: true
    };
    this.endGame = this.endGame || {
      chosen: false,
      mode: null
    };
    this.bumpers = this.bumpers || [];
    this.spikes = null;
    this.floaters = Object.create(Breakout.Floaters);
    this.floaters.items = [];

    // UI rects for menu & leaderboard overlay
    this._ui = this._ui || {
      menu: {},
      lb: {}
    };
    this.helpOverlay = {
      show: false,
      alpha: 0
    };
    this._ui.help = this._ui.help || {
      btn: {},
      close: {}
    };
    // Leaderboard overlay state
    this.leaderboardOverlay = this.leaderboardOverlay || {
      show: false,
      alpha: 0,
      t: 0,
      rows: []
    };
    // Ensure leaderboard overlay renderer is available
    if (typeof this.drawLeaderboardOverlay !== 'function' && Breakout.Defaults && typeof Breakout.Defaults.drawLeaderboardOverlay === 'function') {
      this.drawLeaderboardOverlay = function (ctx) {
        return Breakout.Defaults.drawLeaderboardOverlay.call(this, ctx);
      };
    }
    this.beatConductor = Object.create(Breakout.BeatConductor);
    this.beatConductor.init(this);

    if (typeof document !== 'undefined') {
      setTimeout(function () {
        var levelsDiv = document.getElementById('levels');
        var nextBtn = document.getElementById('next'); // Up Arrow
        var prevBtn = document.getElementById('prev'); // Down Arrow
        var levelSpan = document.getElementById('level');

        if (levelsDiv && nextBtn && prevBtn && levelSpan) {
          // Remove from current position
          if (levelSpan.parentNode) levelSpan.parentNode.removeChild(levelSpan);
          // Insert after Next (Up) and before Prev (Down)
          levelsDiv.insertBefore(levelSpan, prevBtn);
          // Ensure visibility styles
          levelSpan.style.display = "block";
          levelSpan.style.textAlign = "center";
          levelSpan.style.margin = "4px 0";
        }
      }, 100);
    }

    // Ensure sound default ON unless explicitly saved OFF
    if (!this.storage) this.storage = (this.runner && this.runner.storage) ? this.runner.storage() : {
      sound: "true"
    };
    if (typeof this.storage.sound === 'undefined') this.storage.sound = "true";
    this.sound = (this.storage.sound === true || this.storage.sound === "true");
    this.userAudioUnlocked = false;
    if (this.installAudioUnlock) this.installAudioUnlock();
    // beat clock for bg pulse// init parallax backgroundif (this.bg.setBeatClock) this.bg.setBeatClock(this.beat);
    this.cfg = cfg;
    this.runner = runner;
    this.width = runner.width;
    this.height = runner.height;
    this.level = 0;
    this.storage = runner.storage();
    this.theme = this.determineLevelTheme(); // FIX: Set initial theme
    this.color = cfg.color;
    this.sound = (this.storage.sound == "true");
    if (typeof this.storage.sound === 'undefined') {
      this.storage.sound = this.sound = true;
    }
    this.court = Object.construct(Breakout.Court, this, cfg.court);
    this.paddle = Object.construct(Breakout.Paddle, this, cfg.paddle);
    this.ball = Object.construct(Breakout.Ball, this, cfg.ball);
    this.score = Object.construct(Breakout.Score, this, cfg.score);
    this.powerup = Object.construct(Breakout.Powerups, this, cfg, this.ball, this.paddle, this.score);
    this.particles = Object.construct(Breakout.Particles, this, {});
    this.bg = Object.construct(Breakout.BG, this, {
      game: this // <-- ensure BG can reach the game instance
    });
    this.bg.init();
    if (this.setBeatClock) this.setBeatClock({
      t: 0,
      last: 0,
      interval: 0.5
    }); // optional beat clock the BG can read
    this.lasers = [];
    this.laserCooldown = 0;
    Game.loadSounds({
      sounds: cfg.sounds
    });
    // Portals state
    this.portals = [];
    this.portalsUntil = 0;
    this.portalsSpawned = false;
    this.portalSpin = 0;
    // config-ish constants
    this.PORTAL_DURATION_MS = 20000; // 20s lifetime
    this.PORTAL_ENABLED_GLOBAL = true; // set false to limit to “Portal by Adam” only
    this.portalWhooshes = [];
    // micro screen-shake state
    this.shake = {
      x: 0,
      y: 0,
      t: 0,
      dur: 0,
      mag: 0
    };
    this.ripple = {
      t: 0,
      dur: 0,
      cx: 0,
      cy: 0,
      r: 0,
      max: 0,
      colorA: 'rgba(255,255,255,0.07)',
      colorB: 'rgba(156,39,176,0.12)'
    };
    // Gravity Well state
    this.gravityWell = null;
    this.gravityPulse = 0;
    // Game over overlay setup
    this.gameoverOverlay = {
      img: new Image(),
      alpha: 0,
      t: 0,
      show: false
    };
    this.gameoverOverlay.img.src = './images/gameover.png';
    // Level completed overlay setup
    this.levelOverlay = {
      img: new Image(),
      alpha: 0,
      t: 0,
      show: false
    };
    this.levelOverlay.img.src = './images/level-completed.png';
    this.amongUsOverlay = {
      img: new Image(),
      show: false
    };
    this.amongUsOverlay.img.src = './images/emergency-meeting.png';
    this._nextPending = false;
    if (!this.combo) this.combo = {
      count: 0,
      best: 0
    };
  },
  openLeaderboard: function (mode) { // Add 'mode' argument
    const self = this;

    // Default to 'local' if not specified
    this.leaderboardOverlay.mode = mode || this.leaderboardOverlay.mode || 'local';

    // 1. Hide UI (Instructions + Title)
    var instructions = document.getElementById('instructions');
    if (instructions) instructions.style.display = 'none';
    var labelDiv = document.getElementById('labelDiv');
    if (labelDiv) labelDiv.style.opacity = 0;

    this.leaderboardOverlay.show = true;
    this.leaderboardOverlay.alpha = 1;
    this.leaderboardOverlay.t = 0;

    // 2. Select Source based on Mode
    var source = (this.leaderboardOverlay.mode === 'global') ?
      Breakout.GlobalScores :
      Breakout.HighScores;

    this.leaderboardOverlay.rows = []; // Clear pending load

    source.top(20).then(function (rows) {
      self.leaderboardOverlay.rows = Array.isArray(rows) ? rows : [];
    });
  },

  closeLeaderboard: function () {
    this.leaderboardOverlay.show = false;
    this.leaderboardOverlay.alpha = 0;
    this.leaderboardOverlay.rows = [];

    // 2. Restore Menu UI (if we are in the menu)
    if (this.is('menu')) {
      var instructions = document.getElementById('instructions');
      if (instructions) instructions.style.display = 'block';

      var labelDiv = document.getElementById('labelDiv');
      if (labelDiv) labelDiv.style.opacity = 1; // Show Level Title
    }
  },
  resetLeaderboard: function () {
    var ok = true;
    try {
      ok = window.confirm('Reset all leaderboard entries?');
    } catch (e) {}
    if (!ok) return;
    try {
      localStorage.removeItem('breakout_highscores_v1');
    } catch (e) {}
    const self = this;
    // reload list into overlay
    if (Breakout.HighScores && Breakout.HighScores.top) {
      Breakout.HighScores.top(20).then(function (rows) {
        self.leaderboardOverlay.rows = Array.isArray(rows) ? rows : [];
      }).catch(function () {
        self.leaderboardOverlay.rows = [];
      });
    } else {
      self.leaderboardOverlay.rows = [];
    }
  },
  reset: function (startLevel) {
    this.endGame = {};
    this.current = 'start';
    this.theme = this.determineLevelTheme(); // FIX: Determine theme on reset
    this.bg.setTheme(this.theme); // FIX: Apply theme on reset
    if (this.bg && this.bg.buildLayers) this.bg.buildLayers();
    this.resetStats(startLevel);
    this.messages.reset();
    this.powerups.resetPowerups();
    this.paddle.smoothResizeTo(this.paddleBaseW || 96, 180);
    this.startLevel();
  },
  resetStats: function (startLevel) {
    this.stats.score = 0;
    this.stats.balls = Breakout.Defaults.stats.balls;
    this.stats.level = startLevel || 0;
  },
  startLevel: function () {
    // reset end-game variants0
    this.suddenDeath = false;
    this.laserGrid = {
      lines: [],
      t: 0,
      on: true
    };
    if (this.court) this.court.shuffleActive = false;
    this.shuffleActive = false;
    this.endGame = {
      chosen: false,
      mode: null
    };
    if (this.rotate) {
      this.rotate.angleDeg = 0;
      this.rotate.ramp = 0;
    }
    this.bumpers = [];
    this.mirror = {
      next: 3.0 + Math.random(),
      ripple: 0
    };
    this.ghosts = {
      t: 0,
      phase: 0,
      solid: true
    };
    this.bricks = [];
    this.theme = this.determineLevelTheme(); // FIX: Determine theme before loading bricks
    this.bg.setTheme(this.theme); // FIX: Apply theme before loading bricks
    if (this.bg && this.bg.buildLayers) this.bg.buildLayers();

    if (Breakout.Levels[this.level]) {
      this.loadBricks(Breakout.Levels[this.level]);
      this.powerups.resetLevel();
      this.resetBalls();
      this.messages.add("Level " + (this.level + 1), 2);
    } else {
      this.win();
    }
  },

  //-----------------------------------------------------------------------------
  // Portals
  //-----------------------------------------------------------------------------
  spawnPortals: function () {
    const c = this.court;

    function spot() {
      for (let attempt = 0; attempt < 40; attempt++) {
        var rowMin = Math.max(0, c.rowsMin || 0),
          rowMax = Math.min(c.cfg.ychunks - 1, c.rowsMax || c.cfg.ychunks - 1);
        var col = Math.floor(Math.random() * c.cfg.xchunks);
        var row = rowMin + Math.floor(Math.random() * (rowMax - rowMin + 1));
        let x = c.left + col * c.chunk + c.chunk / 2;
        var y = c.top + row * c.chunk + c.chunk / 2;
        var r = Math.max(12, Math.floor(c.chunk * 1.10)); // bigger portals
        // reject if overlaps a live brick or walls
        var ok = (x - r >= c.left && x + r <= c.right && y - r >= c.top && y + r <= c.bottom);
        for (let i = 0; ok && i < c.bricks.length; i++) {
          var B = c.bricks[i];
          if (B.hit) continue;
          if (x - r < B.right && x + r > B.left && y - r < B.bottom && y + r > B.top) ok = false;
        }
        if (ok) return {
          x: x,
          y: y,
          r: r
        };
      }
      return null;
    }
    var a = spot(),
      b = spot();
    if (!a || !b) return false;
    // keep them apart a bit
    var dx = a.x - b.x,
      dy = a.y - b.y;
    if (Math.sqrt(dx * dx + dy * dy) < c.chunk * 3) return false;
    this.portals = [{
        x: a.x,
        y: a.y,
        r: a.r,
        color: '#29b6f6',
        spin: 0
      }, // blue
      {
        x: b.x,
        y: b.y,
        r: b.r,
        color: '#ff9800',
        spin: 0
      } // orange
    ];
    this.portalsUntil = Date.now() + this.PORTAL_DURATION_MS;
    this.portalSpin = 0;
    if (this.playSound) this.playSound('portal'); // ./sound/breakout/portal.mp3
    return true;
  },
  clearPortals: function () {
    if (this.portals && this.portals.length) {
      if (this.playSound) this.playSound('portal');
    }
    this.portals = [];
    this.portalsUntil = 0;
  },
  getActivePortals: function () {
    if (this.portalsUntil > Date.now() && this.portals.length === 2) return this.portals;
    return null;
  },
  // ellipse hit-test: is point (x,y) inside portal p?
  insidePortal: function (p, x, y) {
    var a = p.a || p.r * 1.6;
    var b = p.b || p.r * 1.0;
    var dx = x - p.x,
      dy = y - p.y;
    return (dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1;
  },
  updatePortals: function (dt) {
    // allow on “Portal by Adam” OR globally if flag is true
    var lvl = (window.Breakout && Breakout.Levels && Breakout.Levels[this.level]) ? Breakout.Levels[this.level] : null;
    if (lvl) {
      var themeName = lvl.theme;
    }
    var isPortalLevel = !!(lvl && /portal/i.test(lvl.name || ''));
    var allowPortals = isPortalLevel || this.PORTAL_ENABLED_GLOBAL;
    // spawn once after half the bricks are cleared
    if (allowPortals && !this.portalsSpawned) {
      if (this.court.numhits >= Math.floor(this.court.numbricks / 2)) {
        if (this.spawnPortals()) this.portalsSpawned = true;
      }
    }
    // spin + expire
    if (this.portalsUntil && Date.now() >= this.portalsUntil) {
      this.clearPortals();
    } else if (this.portals && this.portals.length === 2) {
      this.portalSpin += dt * 4;
      this.portals[0].spin += dt * 4;
      this.portals[1].spin -= dt * 4;
    }
    // whoosh lifetimes
    if (this.portalWhooshes && this.portalWhooshes.length) {
      for (let wi = this.portalWhooshes.length - 1; wi >= 0; wi--) {
        var w = this.portalWhooshes[wi];
        w.t += dt;
        if (w.t >= w.dur) this.portalWhooshes.splice(wi, 1);
      }
    }
  },
  drawPortals: function (ctx) {
    var P = this.getActivePortals && this.getActivePortals();
    if (!P) return;
    ctx.save();
    for (let i = 0; i < P.length; i++) {
      var p = P[i];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin || 0);
      var sx = (p.a && p.a > 0) ? (p.a / p.r) : 1.6;
      var sy = (p.b && p.b > 0) ? (p.b / p.r) : 1.0;
      ctx.scale(sx, sy);
      var grd = ctx.createRadialGradient(0, 0, Math.max(2, p.r * 0.05), 0, 0, p.r);
      grd.addColorStop(0, 'rgba(255,255,255,0.75)');
      grd.addColorStop(1, p.color || '#29b6f6');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, p.r * 0.78, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.lineWidth = Math.max(2, Math.floor(p.r * 0.15));
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    // rim lights on walls + whooshes
    this.drawPortalWallGlow(ctx);
    this.drawPortalWhooshes(ctx);
  },
  //-----------------------------------------------------------------------------
  // Portal FX: rim light on walls + teleport whoosh lines
  //-----------------------------------------------------------------------------
  addPortalWhoosh: function (x, y, dirx, diry, color) {
    if (!this.portalWhooshes) this.portalWhooshes = [];
    var len = this.court.chunk * 3.5;
    const w = Math.max(2, Math.floor(this.court.chunk * 0.18));
    var t = 0,
      dur = 0.25; // 250ms
    var dnorm = Math.sqrt((dirx || 0) * (dirx || 0) + (diry || 0) * (diry || 0)) || 1;
    var dx = (dirx || 0) / dnorm,
      dy = (diry || 0) / dnorm;
    this.portalWhooshes.push({
      x: x,
      y: y,
      dx: dx,
      dy: dy,
      len: len,
      w: w,
      t: t,
      dur: dur,
      color: color || '#ffffff'
    });
  },
  drawPortalWallGlow: function (ctx) {
    var P = this.getActivePortals && this.getActivePortals();
    if (!P) return;
    const c = this.court;
    var thr = this.court.chunk * 3; // influence distance
    function clamp(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < P.length; i++) {
      var p = P[i];
      var a = p.a || p.r * 1.6,
        b = p.b || p.r;
      // top wall glow
      var dTop = p.y - c.wall.top.bottom;
      if (dTop > 0 && dTop < thr) {
        var alpha = (1 - dTop / thr) * 0.30; // subtle
        var gx = clamp(p.x - a * 1.1, c.wall.top.left, c.wall.top.right);
        var gw = clamp(a * 2.2, 0, c.wall.top.right - c.wall.top.left);
        var gy = c.wall.top.top,
          gh = Math.max(2, Math.floor(c.wall.size * 0.6));
        var gradT = ctx.createLinearGradient(0, gy, 0, gy + gh);
        gradT.addColorStop(0, p.color);
        gradT.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = alpha;
        ctx.fillStyle = gradT;
        ctx.fillRect(gx, gy, gw, gh);
      }
      // left wall glow
      var dLeft = p.x - c.wall.left.right;
      if (dLeft > 0 && dLeft < thr) {
        var alphaL = (1 - dLeft / thr) * 0.28;
        var gy2 = clamp(p.y - b * 1.1, c.wall.left.top, c.wall.left.bottom);
        var gh2 = clamp(b * 2.2, 0, c.wall.left.bottom - c.wall.left.top);
        var gx2 = c.wall.left.left,
          gw2 = Math.max(2, Math.floor(c.wall.size * 0.6));
        var gradL = ctx.createLinearGradient(gx2, 0, gx2 + gw2, 0);
        gradL.addColorStop(0, p.color);
        gradL.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = alphaL;
        ctx.fillStyle = gradL;
        ctx.fillRect(gx2, gy2, gw2, gh2);
      }
      // right wall glow
      var dRight = c.wall.right.left - p.x;
      if (dRight > 0 && dRight < thr) {
        var alphaR = (1 - dRight / thr) * 0.28;
        var gy3 = clamp(p.y - b * 1.1, c.wall.right.top, c.wall.right.bottom);
        var gh3 = clamp(b * 2.2, 0, c.wall.right.bottom - c.wall.right.top);
        var gx3 = c.wall.right.left - Math.max(2, Math.floor(c.wall.size * 0.6));
        var gw3 = Math.max(2, Math.floor(c.wall.size * 0.6));
        var gradR = ctx.createLinearGradient(gx3 + gw3, 0, gx3, 0);
        gradR.addColorStop(0, p.color);
        gradR.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = alphaR;
        ctx.fillStyle = gradR;
        ctx.fillRect(gx3, gy3, gw3, gh3);
      }
    }
    ctx.restore();
  },
  drawPortalWhooshes: function (ctx) {
    if (!this.portalWhooshes || !this.portalWhooshes.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this.portalWhooshes.length; i++) {
      var w = this.portalWhooshes[i];
      var u = Math.min(1, w.t / w.dur);
      var lenNow = w.len * (1 - u * u); // ease out
      var ax = w.x,
        ay = w.y;
      var bx = w.x + w.dx * lenNow,
        by = w.y + w.dy * lenNow;
      ctx.lineWidth = Math.max(1, w.w * (1 - u));
      ctx.strokeStyle = w.color;
      ctx.globalAlpha = 0.35 * (1 - u);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.restore();
  },
  //-----------------------------------------------------------------------------
  // Gravity Well (late-game, during Shuffle when <=5 bricks remain)
  //-----------------------------------------------------------------------------
  getGravityWell: function () {
    return this.gravityWell;
  },
  spawnGravityWell: function () {
    const c = this.court;
    // try to pick a spot near the center but away from live bricks & walls
    function okSpot(x, y, r) {
      if (x - r < c.left || x + r > c.right || y - r < c.top || y + r > c.bottom) return false;
      for (let i = 0; i < c.bricks.length; i++) {
        var B = c.bricks[i];
        if (!B || B.hit) continue;
        if (x - r < B.right && x + r > B.left && y - r < B.bottom && y + r > B.top) return false;
      }
      return true;
    }
    var r = Math.max(10, Math.floor(c.chunk * 1.0));
    const cx = c.left + c.width * 0.5;
    var cy = c.top + c.height * 0.45;
    var spot = null;
    // try a few jitters around the center
    for (let tries = 0; tries < 40; tries++) {
      var jx = cx + (Math.random() * 2 - 1) * c.chunk * 4;
      var jy = cy + (Math.random() * 2 - 1) * c.chunk * 3;
      if (okSpot(jx, jy, r)) {
        spot = {
          x: jx,
          y: jy,
          r: r
        };
        break;
      }
    }
    if (!spot) {
      if (okSpot(cx, cy, r)) spot = {
        x: cx,
        y: cy,
        r: r
      };
      else return false;
    }
    this.gravityWell = {
      x: spot.x,
      y: spot.y,
      r: spot.r,
      str: this.court.chunk * 300,
      color: '#7e57c2'
    }; // purple tone
    var el = $('powerups');
    if (el) el.innerHTML = 'Black Hole'
    return true;
  },
  clearGravityWell: function () {
    this.gravityWell = null;
    this.gravityPulse = 0;
    var el = $('powerups');
    if (el && el.innerHTML === 'Black Hole') el.innerHTML = '';
  },
  updateGravityWell: function (dt) {
    // active only when shuffle is active (<=5 bricks remaining)
    var remaining = this.court.numbricks - this.court.numhits;
    if (remaining <= 5 && remaining > 0 && this.court.shuffleActive) {
      if (!this.gravityWell) this.spawnGravityWell();
      this.gravityPulse += dt * 2.2;
    } else {
      if (this.gravityWell) this.clearGravityWell();
    }
  },
  drawGravityWell: function (ctx) {
    if (!this.gravityWell) return;
    var gw = this.gravityWell;
    const c = this.court;
    // 1) Dark core
    (function (ctx) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, Math.max(4, gw.r * 0.8), 0, Math.PI * 2, false);
      ctx.fill();
      ctx.restore();
    })(ctx);
    // 2) Pulsing glow (purple)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    let pulses = 3;
    for (let i = 0; i < pulses; i++) {
      var t = (this.gravityPulse + i * 0.6);
      var u = (t % 1);
      var alpha = 0.22 * Math.max(0, 1 - u);
      var radius = gw.r * (1 + u * 1.25);
      var g = ctx.createRadialGradient(gw.x, gw.y, Math.max(2, gw.r * 0.18), gw.x, gw.y, radius);
      g.addColorStop(0, 'rgba(126,87,194,' + (alpha * 0.8).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(gw.x, gw.y, radius, 0, Math.PI * 2, false);
      ctx.fill();
    }
    ctx.restore();
    // 3) Rim rings (gold, elliptical)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(gw.x, gw.y);
    // make the accretion ring slightly elliptical (wider than tall)
    var sx = 1.35,
      sy = 0.75;
    ctx.scale(sx, sy);
    var baseR = gw.r * 1.05;
    for (let ri = 0; ri < 3; ri++) {
      var alpha = 0.55 - ri * 0.18;
      ctx.globalAlpha = Math.max(0.12, alpha);
      ctx.strokeStyle = '#FFD54F'; // warm gold
      ctx.lineWidth = Math.max(1.5, gw.r * (0.10 - ri * 0.02));
      ctx.beginPath();
      ctx.arc(0, 0, baseR + ri * (gw.r * 0.12), 0, Math.PI * 2, false);
      ctx.stroke();
    }
    ctx.restore();
  },
  //-----------------------------------------------------------------------------
  // Effects HUD - stacked indicators next to the right wall
  //-----------------------------------------------------------------------------
  drawEffectsHUD: function (ctx) {
    const c = this.court;
    if (!c) return;

    // 1. Collect all active effects with metadata (label + type)
    var items = [];

    // Helper to add items easily
    // type: 1 = Good (Green), 2 = Bad/Challenge (Red), 0 = Neutral (White)
    function add(label, type) {
      items.push({
        text: label,
        type: type || 1
      });
    }

    // --- Ball Mods ---
    if (this.ball && this.ball.temp) {
      if (this.ball.temp.size > 1) add('Big Strong Ball', 1);
      else if (this.ball.temp.size < 1) add('Small Puny Ball', 2);

      if (this.ball.temp.speed > 1) add('Fast Mighty Ball', 1);
      else if (this.ball.temp.speed < 1) add('Slow Weak Ball', 2);
    }

    // --- Paddle Mods ---
    if (Breakout.Defaults.paddle.width > Breakout.Defaults.paddle.defaultWidth) {
      add('Big Paddle', 1);
    }
    if (Breakout.Defaults.paddle.width < Breakout.Defaults.paddle.defaultWidth) {
      add('Small Paddle', 2);
    }

    // --- Power-ups ---
    var p = this.powerup;
    if (p) {
      if (p.isFireActive && p.isFireActive()) add('🔥 Fireball', 1);
      if (p.isStickyActive && p.isStickyActive()) add('🍯 Sticky', 1);
      if (p.isConfusedActive && p.isConfusedActive()) add('꩜ Confused', 2);
      if (p.isLasersActive && p.isLasersActive()) add('🔫 Lasers', 1);
      if (p.isSplitActive && p.isSplitActive()) add('2 Split Paddle', 1);
      if (p.isChaosActive && p.isChaosActive()) add('✴ Chaos!', 2);
      if (p.isExplodingActive && p.isExplodingActive()) add('💣 Exploding Balls', 1);
      if (p.isLightsActive && p.isLightsActive()) add('💡 Lights Out', 2);
      if (p.isFloorActive && p.isFloorActive()) add('❑ Floor', 1);
      if (p.isFrozenActive && p.isFrozenActive()) add('🧊 Frozen Paddle', 2);
      if (p.isGhostActive && p.isGhostActive()) add('👻 Ghostly Paddle', 2);
      if (p.isMagnetActive && p.isMagnetActive()) add('🧲 Magnet', 1);
      if (p.isOrbitalsActive && p.isOrbitalsActive()) add('🛰️ Orbitals', 2);
      if (p.isLightningActive && p.isLightningActive()) add('🌩️ Lightning', 2);
      if (p.isXFactorActive && p.isXFactorActive()) add('⛌ X-Factor', 2);
      if (p.isTrickShotActive && p.isTrickShotActive()) add('🖱️ Trick Shot', 2);
      if (p.isPowerSmashActive && p.isPowerSmashActive()) add('💥 Power Smash', 2);
    }

    // --- Global / Environmental ---
    if (this.ball && this.ball.balls && this.ball.balls.length > 1) add('3 Multiball', 1);
    if (this.getActivePortals && this.getActivePortals()) add('🌌 Portals', 0);
    if (this.gravityWell) add('🕳️ Black Hole', 2);

    // --- End Game Challenges ---
    var e = this.endGame;
    if (e) {
      if (e.mode === 'shuffle') add('🔀 Shuffle', 2);
      if (e.mode === 'bumpers') add('◎ Bumpers', 2);
      if (e.mode === 'sudden') add('☠ Sudden Death!', 2);
      if (e.mode === 'lasers') add('║ Laser Grid', 2);
      if (e.mode === 'mirror') add('⇄ Mirror World', 2);
      if (e.mode === 'ghosts') add('░ Ghost Bricks', 2);
      if (e.mode === 'spikes') add('▼ Spikes', 2);
      if (e.mode === 'timedilation') add('⏳ Time Dilation', 2);
      if (e.mode === 'ricochet') add('⚡ Ricochet', 2);
      if (e.mode === 'rotate') add('🌀 Rotate', 2);
      if (e.mode === 'fightback') add('🔫 Fight Back', 2);
      if (e.mode === 'virus') add('☣ Virus Outbreak', 2);
    }

    if (!items.length) return;

    // 2. Setup Layout
    // FIX: Push down 3.5 chunks to clear Help button
    var y = c.top + c.chunk * 1.5;

    // FIX: Right align against the screen edge with a small margin
    let x = this.width - 6;

    // FIX: Smaller font to fit long text
    var fontSize = Math.max(11, Math.floor(c.chunk * 0.45));
    var rowH = Math.floor(fontSize * 1.5);

    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold ' + fontSize + 'px Orbitron, sans-serif';

    // 3. Draw Items
    for (let i = 0; i < items.length; i++) {
      var item = items[i];

      // Determine color
      var color = '#fff'; // Default Neutral
      if (item.type === 1) color = '#66ff66'; // Good (Green)
      if (item.type === 2) color = '#ff6666'; // Bad (Red)

      // Draw Shadow (Stroke) for readability against any background
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.strokeText(item.text, x, y);

      // Draw Text
      ctx.fillStyle = color;
      ctx.fillText(item.text, x, y);

      y += rowH;
    }
    ctx.restore();
  },
  // --- Combo system --------------------------------------------------------
  comboReset: function () {
    if (!this.combo) this.combo = {
      count: 0,
      best: 0
    };
    if (this.playSound && this.combo.count > 9) this.playSound('breaker');
    this.combo.count = 0;
  },
  comboOnBrick: function (baseScore) {
    if (!this.combo) this.combo = {
      count: 0,
      best: 0
    };
    this.combo.count = (this.combo.count || 0) + 1;
    if (this.playSound && this.combo.count == 20) this.playSound('king');
    if (this.combo.count > (this.combo.best || 0)) this.combo.best = this.combo.count;
    var bonus = Math.round((Number(baseScore) || 0) * 0.10 * this.combo.count);
    if (bonus > 0 && this.score && this.score.increase) this.score.increase(bonus);
    try {
      if (bonus > 0 && this.messages && this.messages.add) {
        this.messages.add('Combo x' + this.combo.count + '  (+' + bonus + ')', 0.8);
      }
    } catch (_e) {}
  },
  drawComboHUD: function (ctx) {
    if (!this.combo || this.combo.count <= 0) return;
    const c = this.court;
    if (!c) return;
    ctx.save();
    var label = 'COMBO x' + this.combo.count + '  (+' + (this.combo.count * 10) + '%)';
    ctx.font = 'bold ' + Math.max(14, Math.floor(c.chunk * 0.9)) + 'px "Mr Dafoe", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    let x = (c.left + c.right) / 2;
    var y = c.bottom + Math.max(0, Math.floor(c.chunk * 0.6));
    var tw = ctx.measureText(label).width;
    var pad = 8,
      h = Math.max(18, Math.floor(c.chunk * 1.0));
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#000';
    ctx.fillRect(x - tw / 2 - pad, y, tw + pad * 2, h);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#FFD54A';
    ctx.fillText(label, x, y + 2);
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = 10;
    //ctx.filter = 'hue-rotate(${this.combo.count})';
    ctx.restore();
  },

  // Micro screen-shake: request a brief shake (mag px, dur seconds). Clamped to court margins.
  requestShake: function (mag, dur) {
    if (!this.shake) this.shake = {
      x: 0,
      y: 0,
      t: 0,
      dur: 0,
      mag: 0
    };
    this.shake.mag = Math.max(this.shake.mag || 0, (mag || 6));
    this.shake.t = Math.max(this.shake.t || 0, (dur || 0.08));
    this.shake.dur = Math.max(this.shake.dur || 0, (dur || 0.08));
  },
  // Radial ripple pass on the court
  requestRipple: function (cx, cy, mag, dur, opts) {
    if (!this.ripple) this.ripple = {
      t: 0,
      dur: 0,
      cx: 0,
      cy: 0,
      r: 0,
      max: 0
    };
    var C = this.court;
    const w = C.right - C.left,
      h = C.bottom - C.top;
    this.ripple.cx = (typeof cx === 'number') ? cx : (C.left + w / 2);
    this.ripple.cy = (typeof cy === 'number') ? cy : (C.top + h / 2);
    this.ripple.dur = (typeof dur === 'number') ? dur : 0.14;
    this.ripple.t = this.ripple.dur;
    var diag = Math.sqrt(w * w + h * h);
    var base = (typeof mag === 'number') ? mag : 0.18;
    this.ripple.max = Math.max(24, base * diag);
    this.ripple.r = 0;
    // optional directional bias & color mode
    opts = opts || null;
    if (opts && opts.dir && (opts.dir.dx || opts.dir.dy)) {
      var dx = opts.dir.dx || 0,
        dy = opts.dir.dy || 0;
      var m = Math.sqrt(dx * dx + dy * dy) || 1;
      this.ripple.dir = {
        ux: dx / m,
        uy: dy / m
      };
    } else {
      this.ripple.dir = null;
    }
    this.ripple.mode = (opts && (opts.mode || opts.color)) || null;
  },
  drawRipple: function (ctx) {
    if (!this.ripple || this.ripple.t <= 0) return;
    var C = this.court,
      R = this.ripple;
    var u = 1 - Math.max(0, R.t / Math.max(0.0001, R.dur)); // 0..1
    var r = R.max * u;
    var a = Math.max(0, 1 - u); // fade out
    const cx = R.cx,
      cy = R.cy;
    // Colors: default purple/white; gold on level clear
    var isGold = (R.mode === 'gold');
    var cA = isGold ? null : (R.colorA || null);
    var cB = isGold ? null : (R.colorB || null);
    var strokeA = isGold ? 'rgba(255,215,0,' + (0.12 * a) + ')' // gold
      :
      (cA || ('rgba(255,255,255,' + (0.10 * a) + ')'));
    var strokeB = isGold ? 'rgba(255,140,0,' + (0.24 * a) + ')' // orange-gold inner
      :
      (cB || ('rgba(156,39,176,' + (0.22 * a) + ')'));
    // Directional bias: draw ellipse oriented along the last ball vector, if provided
    var hasDir = !!(R.dir && (R.dir.ux || R.dir.uy));
    var ang = hasDir ? Math.atan2(R.dir.uy || 0, R.dir.ux || 0) : 0;
    var rx = r,
      ry = hasDir ? r * 0.72 : r; // squash along the perpendicular for bias
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    // Outer ring
    ctx.lineWidth = Math.max(6, r * 0.06);
    ctx.strokeStyle = strokeA;
    if (ctx.ellipse) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, ang, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Fallback: use transform to emulate ellipse
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.scale(1, hasDir ? 0.72 : 1);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    }
    // Inner ring
    ctx.lineWidth = Math.max(3, r * 0.03);
    ctx.strokeStyle = strokeB;
    var rx2 = rx * 0.88,
      ry2 = (hasDir ? ry * 0.88 : ry);
    if (ctx.ellipse) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx2, ry2, ang, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.scale(1, hasDir ? 0.72 : 1);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.restore();
  },
  onstartup: function () {
    this.addEvents();
    this.runner.start();
  },
  addEvents: function () {
    this._helpKeyBound = true;
    var self = this;
    Game.addEvent('prev', 'click', this.prevLevel.bind(this, false));
    Game.addEvent('next', 'click', this.nextLevel.bind(this, false));
    // Click/tap the instructions to start:
    Game.addEvent('instructions', 'click', this.play.bind(this));
    Game.addEvent('instructions', 'touchstart', this.play.bind(this));
    Game.addEvent(this.runner.canvas, 'touchstart', this.ontouchstart.bind(this));
    Game.addEvent(this.runner.canvas, 'touchmove', this.ontouchmove.bind(this));
    Game.addEvent(this.runner.canvas, 'touchend', this.ontouchend.bind(this));
    Game.addEvent(this.runner.canvas, 'mousemove', this.onmousemove.bind(this));
    Game.addEvent(document.body, 'touchmove', function (event) {
      event.preventDefault();
    });
    Game.addEvent('upload', 'click', this.load.bind(this, true));

    // Keyboard start only when in menu:
    Game.addEvent(document, 'keydown', (e) => {
      if (!this.is || !this.is('menu')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.play();
      }
    });
    // View leaderboard in menu with 'L'
    Game.addEvent(document, 'keydown', (e) => {
      if (!this.is || !this.is('menu')) return;
      if (e.key && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        this.openLeaderboard();
      }
    });
    Game.addEvent(document, 'keydown', (e) => {
      if (!this.is || !this.is('menu')) return;
      if (e.key && (e.key === 'h' || e.key === 'H' || e.key === '?')) {
        this.toggleHelp();
        if (self.game && self.game.playSound) self.game.playSound('menu_select');
        e.preventDefault();
      }
    });
    // Close help or leaderboard via ESC
    Game.addEvent(document, 'keydown', (e) => {
      if (this.leaderboardOverlay && (this.leaderboardOverlay.show || self.helpOverlay.show) && e.key === 'Escape') {
        e.preventDefault();
        if (self.game && self.game.playSound) self.game.playSound('menu_select');
        this.toggleHelp(false);
        this.closeLeaderboard();
      }
    });

    /* UNIFIED MOUSE CLICK HANDLER */
    Game.addEvent(this.runner.canvas, 'click', (e) => {
      // 1. Setup coordinates
      // Because we now handle DPI in game.js, 'rect' is logical CSS pixels,
      // but 'this.width/height' are physical pixels.
      // e.clientX is logical. We need to map logical -> physical.
      var rect = this.runner.canvas.getBoundingClientRect();
      var scaleX = this.width / rect.width;
      var scaleY = this.height / rect.height;

      var mx = (e.clientX - rect.left) * scaleX;
      var my = (e.clientY - rect.top) * scaleY;

      // 2. Check Help Overlay Close Button (High priority)
      if (this.helpOverlay && this.helpOverlay.show) {
        var c = this._ui && this._ui.help && this._ui.help.close;
        if (c && mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) {
          e.preventDefault();
          if (self.game && self.game.playSound) self.game.playSound('menu_select');
          this.toggleHelp(false);
        }
        return; // Block other clicks when overlay is open
      }

      // 3. Leaderboard Overlay Clicks
      if (this.leaderboardOverlay && this.leaderboardOverlay.show) {
        // FIX: Define 'lb' immediately so the rest of the block can use it
        var lb = this._ui.lb;

        // Guard against lb being missing (e.g. if draw hasn't happened yet)
        if (!lb) return;

        // Check Close Button
        if (lb.close && mx >= lb.close.x && mx <= lb.close.x + lb.close.w && my >= lb.close.y && my <= lb.close.y + lb.close.h) {
          e.preventDefault();
          if (self.game && self.game.playSound) self.game.playSound('menu_select');
          this.closeLeaderboard();
          return;
        }

        // Check Toggle Button (Local <-> Global)
        if (lb.toggle && mx >= lb.toggle.x && mx <= lb.toggle.x + lb.toggle.w && my >= lb.toggle.y && my <= lb.toggle.y + lb.toggle.h) {
          e.preventDefault();
          var newMode = (this.leaderboardOverlay.mode === 'global') ? 'local' : 'global';
          this.openLeaderboard(newMode);
          if (self.game && self.game.playSound) self.game.playSound('menu_select');
          return;
        }

        return; // Consume click if overlay is visible
      }

      // 4. HUD: Help Button (Dynamic Sizing)
      var hBtn = this.getHelpButtonRect();
      // Increase hitbox by 50% of the button size for easier clicking
      var hitPad = hBtn.w * 0.5;
      if (mx >= hBtn.x - hitPad && mx <= hBtn.x + hBtn.w + hitPad &&
        my >= hBtn.y - hitPad && my <= hBtn.y + hBtn.h + hitPad) {
        e.preventDefault();
        if (self.game && self.game.playSound) self.game.playSound('menu_select');
        this.toggleHelp();
        return;
      }

      // 5. MENU SPECIFIC CLICKS (Leaderboard Open)
      if (this.is && this.is('menu')) {
        var lbBtn = this._ui && this._ui.menu && this._ui.menu.leader;
        // Fallback calculation if _ui isn't populated yet
        if (!lbBtn) {
          var bw = Math.min(300, this.width * 0.5),
            bh = 44;
          const cx = this.width / 2;
          var by = Math.floor(this.height * 0.90);
          lbBtn = {
            x: cx - bw / 2,
            y: by - bh / 2,
            w: bw,
            h: bh
          };
        }
        if (lbBtn && mx >= lbBtn.x && mx <= lbBtn.x + lbBtn.w && my >= lbBtn.y && my <= lbBtn.y + lbBtn.h) {
          e.preventDefault();
          if (self.game && self.game.playSound) self.game.playSound('menu_select');
          this.openLeaderboard();
          return;
        }
      }
    });
    /* LEADERBOARD OVERLAY: 'R' to reset */
    Game.addEvent(document, 'keydown', (e) => {
      if (!(this.leaderboardOverlay && this.leaderboardOverlay.show)) return;
      if (e.key && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        if (self.game && self.game.playSound) self.game.playSound('menu_select');
        this.resetLeaderboard();
      }
    });
  },
  // Helper to toggle Help Overlay and handle DOM visibility
  toggleHelp: function (forceState) {
    // Toggle or force state
    this.helpOverlay.show = (typeof forceState !== 'undefined') ? forceState : !this.helpOverlay.show;

    if (this.helpOverlay.show) {
      this.helpOverlay.alpha = 0;
    }

    // --- DOM VISIBILITY LOGIC ---
    // Only mess with DOM if we are in the menu (where title/instructions live)
    if (this.is('menu')) {
      var opacity = this.helpOverlay.show ? 0 : 1;
      var display = this.helpOverlay.show ? 'none' : 'block';

      var labelDiv = document.getElementById('labelDiv');
      if (labelDiv) labelDiv.style.opacity = opacity;

      var instr = document.getElementById('instructions');
      if (instr) instr.style.display = display;
    }
  },
  toggleSound: function () {
    this.storage.sound = this.sound = !this.sound;
    if (this.sound) {
      if (this.tryStartBGM) this.tryStartBGM();
    } else {
      if (this.stopBGM) this.stopBGM();
    }
    if (typeof soundManager !== 'undefined' && soundManager.getSoundById) {
      var bgm = soundManager.getSoundById('bgm');
      if (bgm) {
        try {
          this.sound ? bgm.play() : bgm.stop();
        } catch (e) {}
      }
    }
  },
  update: function (dt) {
    // 1. Capture previous state for "Missed" detection
    var wasDilated = (this.dilation && this.dilation.active);

    // 2. Reset Dilation State
    var slowDt = dt;
    this.dilation = {
      active: false,
      zoom: 1.0,
      focus: {
        x: this.width / 2,
        y: this.height / 2
      }
    };

    // 3. Logic: Live Bricks & Dilation Calc
    if (this.court && this.ball && !this.levelOverlay.show && !this.gameoverOverlay.show) {
      var liveBricks = [];
      if (this.court.bricks) {
        for (var i = 0; i < this.court.bricks.length; i++) {
          if (!this.court.bricks[i].hit) liveBricks.push(this.court.bricks[i]);
        }
      }
      var remaining = liveBricks.length;

      // A. FORCE SHUFFLE on last 5 bricks unless we're in sudden death mode
      if (remaining <= 5 && remaining > 0) {
        // FIX: Disable Shuffle if Sudden Death (The Crusher) is active
        if (this.endGame && this.endGame.mode === 'sudden') {
          this.court.shuffleActive = false;
        } else {
          this.court.shuffleActive = true;
        }
      } else {
        // Only disable if the EndGame mode isn't 'shuffle'
        if (this.endGame && this.endGame.mode !== 'shuffle') {
          this.court.shuffleActive = false;
        }
      }

      // B. TIME DILATION on Last Brick
      if (remaining === 1 && this.ball.balls.length > 0) {
        var lastB = liveBricks[0];
        var targetX = lastB.x + lastB.w / 2;
        var targetY = lastB.y + lastB.h / 2;

        var minDist = Infinity;
        var closestBall = this.ball.balls[0];
        for (var k = 0; k < this.ball.balls.length; k++) {
          var b = this.ball.balls[k];
          var dist = Math.sqrt(Math.pow(b.x - targetX, 2) + Math.pow(b.y - targetY, 2));
          if (dist < minDist) {
            minDist = dist;
            closestBall = b;
          }
        }

        var range = 250;
        if (minDist < range) {
          this.dilation.active = true;
          var u = minDist / range;

          // Slow down & Zoom
          var timeScale = 0.15 + 0.85 * (u * u);
          slowDt = dt * timeScale;

          var maxZoom = 1.5;
          this.dilation.zoom = 1.0 + (maxZoom - 1.0) * (1.0 - u);
          this.dilation.focus.x = (closestBall.x + targetX) / 2;
          this.dilation.focus.y = (closestBall.y + targetY) / 2;
        }
      }

      // C. TRIGGER "COME ON!" SOUND
      // If we were dilated last frame, but NOT this frame, AND the brick is still alive.
      if (wasDilated && !this.dilation.active && remaining === 1) {
        if (this.playSound) this.playSound('comeon');
      }
    }

    // --- 4. UPDATE SYSTEMS ---
    this.updateMirrorWorld(slowDt);
    this.updateGhostBricks(slowDt);
    if (this.laserGrid && this.laserGrid.lines && this.laserGrid.lines.length) this.updateLaserGrid(slowDt);
    if (this.endGame && this.endGame.mode === 'fightback') {
      if (this.updateFightback) this.updateFightback(slowDt);
    }
    if (this.endGame && this.endGame.mode !== null && this.updateTimeDilation) {
      this.updateTimeDilation(slowDt);
    }
    if (this.endGame && this.endGame.mode === 'ricochet' && this.updateRicochet) {
      this.updateRicochet(slowDt);
    }

    // End-Game Chooser
    (function endGameChooser() {
      try {
        if (!this.court) return;
        var rem = 0;
        var bs = this.court.bricks || [];
        for (let i = 0; i < bs.length; i++)
          if (!bs[i].hit) rem++;

        if (rem <= 5 && this.endGame && !this.endGame.chosen) {
          if (this.playSound) this.playSound('finish');
          this.endGame.chosen = true;

          var modes = ['bumpers', 'sudden', 'lasers', 'mirror', 'ghosts', 'spikes', 'ricochet', 'rotate', 'fightback', 'virus'];
          this.endGame.mode = modes[(Math.random() * modes.length) | 0];

          if (this.endGame.mode == 'bumpers') this.spawnBumpers();
          else if (this.endGame.mode == 'sudden') this.activateSuddenDeath();
          else if (this.endGame.mode == 'lasers') this.spawnLaserGrid();
          else if (this.endGame.mode == 'mirror') {
            if (this.playSound) this.playSound('portal');
          } else if (this.endGame.mode == 'ghosts') {
            if (this.playSound) this.playSound('ghost');
          } else if (this.endGame.mode == 'spikes') this.startSpikes && this.startSpikes();
          else if (this.endGame.mode == 'fightback') this.startFightback && this.startFightback();
        }
      } catch (_) {}
    }).call(this);

    // Audio Beat
    if (this.beat) {
      this.beat.t += dt;
      if (this.beat.t - this.beat.last >= this.beat.interval) {
        this.beat.last += this.beat.interval;
        if (this.bg && this.bg.onBeat) this.bg.onBeat();
      }
    }

    this.t = (this.t || 0) + dt;
    if (this.pulse > 0) this.pulse = Math.max(0, this.pulse - dt * 2.4);
    if (this.bg) this.bg.update(dt);
    if (this.beatConductor) this.beatConductor.update();

    if (this.is && this.is('menu')) return;

    // Physics
    this.court.update(slowDt);
    this.paddle.update(slowDt);
    this.ball.update(slowDt);

    if (this.ball) {
      if (this.ball.balls && this.ball.balls.length) {
        for (let __i = 0; __i < this.ball.balls.length; __i++) this.ensureBallSpeed(this.ball.balls[__i]);
      } else {
        this.ensureBallSpeed(this.ball);
      }
    }

    // Update Helpers
    this.updatePortals(slowDt);
    this.updateGravityWell(slowDt);
    this.updateLasers(slowDt);
    if (this.spikes && this.updateSpikes) this.updateSpikes(slowDt);
    this.updateSuddenDeath(slowDt);
    this.updateOrbitals(slowDt);
    this.particles.update(slowDt);
    this.powerup.update(slowDt);
    this.floaters.update(slowDt);
    this.score.update(slowDt);
    this.updateRotate(slowDt);

    if (this.ripple && this.ripple.t > 0) {
      this.ripple.t -= slowDt;
      if (this.ripple.t < 0) this.ripple.t = 0;
    }

    if (this.shake && this.shake.t > 0) {
      this.shake.t -= slowDt;
      var u = this.shake.t / Math.max(0.0001, this.shake.dur);
      var m = (this.shake.mag || 6) * (u * u);
      this.shake.x = (Math.random() * 5 - 1) * m;
      this.shake.y = (Math.random() * 5 - 1) * m;
      if (this.shake.t <= 0) {
        this.shake.x = 0;
        this.shake.y = 0;
      }
    }

    if (this.levelOverlay && this.levelOverlay.show) {
      this.levelOverlay.t += dt;
      this.levelOverlay.alpha = Math.max(0, 1 - (this.levelOverlay.t / 3));
      if (this.levelOverlay.t >= 3) {
        this.levelOverlay.show = false;
        if (this._nextPending) {
          this._nextPending = false;
          this.nextLevel(true);
          try {
            this.ongame(true);
          } catch (e) {}
          this.ball.reset({
            launch: true
          });
        }
      }
    }
    if (this.gameoverOverlay && this.gameoverOverlay.show) {
      this.gameoverOverlay.t += dt;
      this.gameoverOverlay.alpha = Math.max(0, 1 - (this.gameoverOverlay.t / 3));
      if (this.gameoverOverlay.alpha <= 0) this.gameoverOverlay.show = false;
    }
  },
  getHelpButtonRect: function () {
    // Scale button relative to the "chunk" size so it matches the rest of the game
    var size = Math.max(28, (this.court ? this.court.chunk : 20) * 1.5);
    var pad = size * 0.4;
    return {
      x: this.width - size - pad,
      y: pad + (this.court ? this.court.chunk * 0.5 : 8), // slightly offset from very top
      w: size,
      h: size
    };
  },
  drawHelpButton: function (ctx) {
    var r = this.getHelpButtonRect();
    this._ui = this._ui || {
      menu: {},
      lb: {},
      help: {}
    };
    this._ui.help.btn = r; // keep for debugging/inspection

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);

    ctx.fillStyle = '#fff';
    ctx.font = '20px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', r.x + r.w / 2, r.y + r.h / 2 + 1);
    ctx.restore();
  },

  drawHelpOverlay: function (ctx) {
    var H = this.helpOverlay;
    if (!H || !H.show) return;

    // ease alpha
    H.alpha = Math.min(1, (H.alpha || 0) + 0.12);

    ctx.save();
    var alpha = 0.95 * H.alpha;

    // FIX: Scale dimensions based on court chunk size
    const c = this.court;
    // Fallback if court isn't ready
    var chunk = c ? c.chunk : Math.max(20, Math.min(this.width, this.height) / 30);

    // Width/Height relative to screen, maxing out at reasonable limits relative to chunks
    const w = Math.min(this.width * 0.90, chunk * 42);
    var h = Math.min(this.height * 0.90, chunk * 30);
    let x = (this.width - w) / 2,
      y = (this.height - h) / 2;

    // FIX: Fonts relative to chunk
    var fsTitle = Math.round(chunk * 0.7);
    var fsBody = Math.round(chunk * 0.55);
    var fsSmall = Math.round(chunk * 0.40);
    var fsIcon = Math.round(chunk * 0.55);

    // backdrop card
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, chunk * 0.1);
    ctx.strokeRect(x, y, w, h);

    // Close button (top-right)
    var bw = chunk * 5,
      bh = chunk * 1.6;
    var bx = x + w - bw - chunk * 0.8,
      by = y + chunk * 0.6;
    this._ui.help.close = {
      x: bx,
      y: by,
      w: bw,
      h: bh
    };

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fsBody + 'px Orbitron, sans-serif';
    ctx.fillText('Close (Esc)', bx + bw / 2, by + bh / 2);

    // columns
    var colGap = chunk * 1.5;
    var innerPad = chunk * 1;
    var colW = (w - innerPad * 2 - colGap) / 2;
    var col1X = x + innerPad,
      col2X = col1X + colW + colGap;
    var topY = y + chunk * 1.0;

    // section headings
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold ' + fsTitle + 'px "Mr Dafoe", cursive';
    ctx.fillStyle = '#fff';
    ctx.fillText('Power-ups', col1X, topY);
    ctx.fillText('End-game challenges', col2X, topY);

    // line height & icon box
    var lh = chunk * 1.0,
      padY = chunk * 0.3,
      startY = topY + lh * 1.8;

    // tiny icon helper
    const self = this;

    function drawRow(cx, cy, icon, label) {
      // icon pill
      var iw = chunk * 1.1,
        ih = chunk * 0.9;
      ctx.save();
      ctx.globalAlpha = H.alpha;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.rect(cx, cy, iw, ih);
      ctx.fill();
      ctx.stroke();

      // icon glyph
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = fsIcon + 'px Orbitron, sans-serif';
      ctx.fillText(icon || '•', cx + iw / 2, cy + ih / 2 + 1);
      ctx.restore();

      // label
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic'; // align to baseline of text
      ctx.font = fsBody + 'px Orbitron, sans-serif';
      // center vertically relative to icon height roughly
      ctx.fillText(label, cx + iw + chunk * 0.4, cy + ih * 0.75);
      ctx.restore();
    }

    var I = (this.powerup && this.powerup.icons) ? this.powerup.icons : {};

    // Left column: Power-ups
    var rows1 = [
      [I.Big, 'Big Paddle - Paddle 2x longer'],
      [I.Small, 'Small Paddle - Half size Paddle'],
      [I.OneUp, 'Extra Life - Extra paddle'],
      [I.Fire, 'Fireball - Melts bricks in path'],
      [I.BPlus || I.Big, 'Big Ball - Ball 2x bigger'],
      [I.BMinus || I.Small, 'Small Ball - Half size ball'],
      [I.Fast, 'Fast Ball - Faster ball'],
      [I.Slow, 'Slow Ball - Slower ball'],
      [I.Triple, 'Multiball - 2 extra balls'],
      [I.Sticky, 'Sticky Paddle - Catch & launch'],
      [I.Swap, 'Confused - Directions reversed'],
      [I.Chaos, 'Chaos - Ball has a mind of its own'],
      [I.Lasers, 'Lasers - Shoot bricks'],
      [I.Split, 'Split Paddle - 2 paddles w/ gap'],
      [I.Exploding, 'Exploding Balls - Boom!'],
      [I.Floor, 'Floor - Temporary safety net'],
      [I.Lightning, 'Lightning - Damage row of bricks'],
      [I.XFactor, 'X Factor - Damage bricks in X shape'],
    ];

    // Right column: End-game challenges
    var rows2 = [
      [I.Frozen, 'Frozen Paddle - Frozen for 5 seconds.'],
      [I.LightsOut, 'Lights Out - Mostly dark'],
      [I.Ghost, 'Ghost Paddle - Idle paddle fades'],
      [I.Magnet, 'Magnet - Attract pick-ups'],
      [I.Reset, 'Reset - Clear active effects'],
      [I.Orbitals, 'Orbitals - Mooning you'],
      //[I.TrickShot, 'Trick Shot - Aim the ball by clicking mouse'],
      [I.PowerSmash, 'Power Smash - Press space to smash'],
      [I.TimeAid, 'Time-Extend - +7s to effects'],
      ['◎', 'Bumpers - Sonic spinball bumpers'],
      ['║', 'Laser Grid - Deflects ball'],
      ['☠', 'Sudden Death - Bricks keep moing down!'],
      ['⇄', 'Mirror World - Reversed logic'],
      ['░', 'Ghost Bricks - Untouchable'],
      ['▼', 'Spikes - Don\'t touch walls!'],
      ['⚡', 'Ricochet - Wild bounces'],
      ['🌀', 'Rotate - World spins'],
      ['🔫', 'Fight Back - Bricks shoot back'],
      ['☣', 'Virus Outbreak - virus spreads'],
    ];

    // render
    var y1 = startY,
      y2 = startY;
    for (let i = 0; i < rows1.length; i++) {
      drawRow(col1X, y1, rows1[i][0] || '•', rows1[i][1]);
      y1 += lh + padY;
    }
    for (let j = 0; j < rows2.length; j++) {
      drawRow(col2X, y2, rows2[j][0], rows2[j][1]);
      y2 += lh + padY;
    }

    // footer hint
    ctx.save();
    ctx.globalAlpha = 0.85 * H.alpha;
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = fsSmall + 'px Orbitron, sans-serif';
    ctx.fillText('Press H to toggle Help', x + w / 2, y + h - chunk * 0.5);
    ctx.restore();

    ctx.restore();
  },

  // Darkness overlay for "Lights Out" power-up
  drawLightsOutMask: function (ctx) {
    if (!(this.powerup && this.powerup.isLightsActive && this.powerup.isLightsActive())) return;
    var c = this.court,
      p = this.paddle,
      bsys = this.ball;
    if (!c || !p || !bsys) return;

    ctx.save();
    // veil over the court
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#000000";
    ctx.fillRect((c.left | 0) - 8, (c.top | 0) - 8, (c.width | 0) + 16, (c.height | 0) + 16);

    // cut soft holes where actors are
    ctx.globalCompositeOperation = 'destination-out';

    // Paddle (supports split segments)
    var segs = p.getSegments ? p.getSegments() : [{
      left: p.left,
      right: p.right,
      top: p.top,
      w: p.w
    }];
    for (let i = 0; i < segs.length; i++) {
      var s = segs[i];
      const cx = (s.left + s.right) / 2;
      var cy = s.top - 4;
      var r = Math.max(10, Math.floor(c.chunk * 1.4));
      var g = ctx.createRadialGradient(cx, cy, Math.max(2, r * 0.25), cx, cy, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
      ctx.fill();
    }

    // Balls
    var balls = (bsys.balls && bsys.balls.length) ? bsys.balls.slice() : [bsys.primary || bsys];
    for (let j = 0; j < balls.length; j++) {
      var bb = balls[j];
      if (!bb) continue;
      var r2 = Math.max(9, bb.radius * 3.2);
      var g2 = ctx.createRadialGradient(bb.x, bb.y, Math.max(2, r2 * 0.25), bb.x, bb.y, r2);
      g2.addColorStop(0, 'rgba(0,0,0,1)');
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(bb.x, bb.y, r2, 0, Math.PI * 2, false);
      ctx.fill();
    }

    // Powerup drops (optional visibility)
    if (this.powerup && this.powerup.drops) {
      for (let k = 0; k < this.powerup.drops.length; k++) {
        var d = this.powerup.drops[k];
        if (!d) continue;
        var rr = Math.max(8, c.chunk * 0.8);
        var g3 = ctx.createRadialGradient(d.x, d.y, Math.max(2, rr * 0.25), d.x, d.y, rr);
        g3.addColorStop(0, 'rgba(0,0,0,1)');
        g3.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g3;
        ctx.beginPath();
        ctx.arc(d.x, d.y, rr, 0, Math.PI * 2, false);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  setBeatClock: function (beat) {
    this.beat = beat || null;
  },
  onBeat: function () {
    this.pulse = 1;
  },
  // Power-up: ORBITALS -----------------------------------------------------
  updateOrbitals: function (dt) {
    if (!(this.powerup && this.powerup.isOrbitalsActive && this.powerup.isOrbitalsActive())) return;
    if (!this.ball) return;
    var sys = this._orbitals || (this._orbitals = {
      ang: 0,
      r: Math.max(8, (this.ball.radius || 6) * 2.2),
      speed: 2.6,
      size: Math.max(4, (this.ball.radius || 6) * 0.55)
    });
    sys.ang += (sys.speed || 2.6) * dt;

    // Collide with bricks (circle-rect test), similar to your prior code:
    var c = this.court,
      bs = c && c.bricks || [];
    var b = (this.ball.balls && this.ball.balls[0]) || this.ball;
    if (!b) return;

    var R = sys.r,
      a = sys.ang,
      s = sys.size;
    var o1 = {
      x: b.x + Math.cos(a) * R,
      y: b.y + Math.sin(a) * R,
      r: s
    };
    var o2 = {
      x: b.x + Math.cos(a + Math.PI) * R,
      y: b.y + Math.sin(a + Math.PI) * R,
      r: s
    };

    function circleHitsRect(cx, cy, cr, rect) {
      var rx = Math.max(rect.left, Math.min(cx, rect.right));
      var ry = Math.max(rect.top, Math.min(cy, rect.bottom));
      var dx = cx - rx,
        dy = cy - ry;
      return (dx * dx + dy * dy) <= cr * cr;
    }

    for (let i = 0; i < bs.length; i++) {
      var br = bs[i];
      if (!br || br.hit || !br.isbrick) continue;
      if (circleHitsRect(o1.x, o1.y, o1.r, br) || circleHitsRect(o2.x, o2.y, o2.r, br)) {
        this.damageBrick(br, {
          kind: 'orbital'
        });
      }
    }

    // optional: spark with bumpers/lasers if present
    if (this.bumpers && this.bumpers.length) {
      if (this.playSound) this.playSound('bumpers');
      for (let j = 0; j < this.bumpers.length; j++) {
        var bp = this.bumpers[j];
        if (!bp) continue;
        var dx1 = o1.x - bp.x,
          dy1 = o1.y - bp.y;
        var dx2 = o2.x - bp.x,
          dy2 = o2.y - bp.y;
        if (dx1 * dx1 + dy1 * dy1 < (o1.r + bp.r) * (o1.r + bp.r) || dx2 * dx2 + dy2 * dy2 < (o2.r + bp.r) * (o2.r + bp.r)) {
          if (this.requestRipple) this.requestRipple(bp.x, bp.y, 0.16, 0.16);
        }
      }
    }
  },
  drawOrbitals: function (ctx) {
    if (!(this.powerup && this.powerup.isOrbitalsActive && this.powerup.isOrbitalsActive())) return;
    for (let i = 0; i < this.ball.balls.length; i++) {
      var b = this.ball.balls[i];
      var sys = this._orbitals;
      if (!sys) return;
      var R = sys.r,
        a = sys.ang,
        s = sys.size;

      function drawChrome(cx, cy, r) {
        ctx.save();
        // body
        var shade = ctx.createRadialGradient(cx, cy, Math.max(1, r * 0.25), cx, cy, r);
        shade.addColorStop(0.0, 'rgba(255,255,255,0.9)');
        shade.addColorStop(0.8, 'rgba(255,255,255,0.9)');
        shade.addColorStop(1.0, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
        ctx.fill();
        // hotspot
        ctx.globalCompositeOperation = 'lighter';
        var hx = cx - r * 0.35,
          hy = cy - r * 0.35,
          hr = Math.max(1, r * 0.65);
        var spec = ctx.createRadialGradient(hx, hy, 1, hx, hy, hr);
        spec.addColorStop(0.00, 'rgba(255,255,255,0.90)');
        spec.addColorStop(0.35, 'rgba(255,255,255,0.35)');
        spec.addColorStop(1.00, 'rgba(255,255,255,0.00)');
        ctx.fillStyle = spec;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();
      }

      drawChrome(b.x + Math.cos(a) * R, b.y + Math.sin(a) * R, s);
      drawChrome(b.x + Math.cos(a + Math.PI) * R, b.y + Math.sin(a + Math.PI) * R, s);
    }
  },
  // Spawn random circular pinball bumpers (avoiding bricks)
  spawnBumpers: function (count) {
    const c = this.court;
    if (!c) return;
    this.bumpers = [];
    count = count || (3 + ((Math.random() * 1) | 0)); // 3 or 4

    function circleHitsAnyBrick(x, y, r, bricks) {
      for (let i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        if (!b || !b.isbrick || b.hit) continue;
        const cx = Math.max(b.left, Math.min(x, b.right));
        var cy = Math.max(b.top, Math.min(y, b.bottom));
        var dx = x - cx,
          dy = y - cy;
        if (dx * dx + dy * dy < r * r) return true;
      }
      return false;
    }

    var bricks = this.court.bricks || [];
    var padY = Math.max(c.top + c.chunk * 3, c.top + 60);
    var maxY = c.bottom - Math.max(60, c.chunk * 3);
    var rBase = Math.max(12, (c.chunk * 0.7) | 0);

    for (let k = 0; k < count; k++) {
      var placed = false;
      for (let tries = 0; tries < 30 && !placed; tries++) {
        var r = rBase + ((Math.random() * rBase * 0.3) | 0);
        let x = (c.left + r) + Math.random() * (c.width - 2 * r);
        var y = (padY + r) + Math.random() * ((maxY - padY) - 2 * r);
        if (x - r < c.left + c.wall.size + 8) continue;
        if (x + r > c.right - c.wall.size - 8) continue;
        if (!circleHitsAnyBrick(x, y, r, bricks)) {
          this.bumpers.push({
            x: x | 0,
            y: y | 0,
            r: r | 0,
            bounce: 1.25 + Math.random() * 0.25
          });
          placed = true;
        }
      }
    }
  },
  // ---------- Sonic-style bumper rendering ----------
  drawStar: function (ctx, cx, cy, r, options) {
    options = options || {};
    var points = options.points || 5;
    var inner = (options.inner || 0.5) * r;
    var rot = (options.rotate || -Math.PI / 2);
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      var ang = rot + i * Math.PI / points;
      var rr = (i % 2 === 0) ? r : inner;
      let x = cx + Math.cos(ang) * rr;
      var y = cy + Math.sin(ang) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  },

  drawSonicBumper: function (ctx, bp) {
    let x = bp.x | 0,
      y = bp.y | 0,
      r = bp.r | 0;
    // Outer red ring glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var glow = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.6);
    glow.addColorStop(0, 'rgba(255,90,90,0.05)');
    glow.addColorStop(1, 'rgba(255,40,40,0.20)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Red ring body
    ctx.save();
    var ring = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, Math.max(1, r * 0.2), x, y, r);
    ring.addColorStop(0.00, '#FF9A8A');
    ring.addColorStop(0.55, '#E53935');
    ring.addColorStop(1.00, '#7A1A1A');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // rim highlight
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = Math.max(1, r * 0.12);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(x, y, r - ctx.lineWidth * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    // Blue inner disk
    ctx.globalCompositeOperation = 'source-over';
    var innerR = r * 0.72;
    var disk = ctx.createRadialGradient(x - innerR * 0.25, y - innerR * 0.25, Math.max(1, innerR * 0.15), x, y, innerR);
    disk.addColorStop(0.00, '#6FA8FF');
    disk.addColorStop(0.55, '#1E3A8A');
    disk.addColorStop(1.00, '#0B1D52');
    ctx.fillStyle = disk;
    ctx.beginPath();
    ctx.arc(x, y, innerR, 0, Math.PI * 2);
    ctx.fill();

    // Yellow star
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = Math.max(2, r * 0.08);
    ctx.shadowOffsetY = Math.max(1, r * 0.05);
    this.drawStar(ctx, x, y, innerR * 0.62, {
      points: 5,
      inner: 0.48,
      rotate: -Math.PI / 2
    });
    ctx.fillStyle = '#FFD54A';
    ctx.fill();
    ctx.restore();

    // Beat-synced gloss sweep
    var since = 0;
    if (this.beat && typeof this.beat.t === 'number' && typeof this.beat.last === 'number' && this.beat.interval) {
      since = this.beat.t - this.beat.last;
    }
    var dur = 0.25;
    var u = Math.min(1, Math.max(0, since / dur));
    if (u > 0 && u < 1) {
      const w = r * 0.9;
      var x0 = x - r + (2 * r) * u - w * 0.4;
      var x1 = x0 + w * 0.8;
      var sg = ctx.createLinearGradient(x0, 0, x1, 0);
      sg.addColorStop(0.0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,255,255,0.38)');
      sg.addColorStop(1.0, 'rgba(255,255,255,0)');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = sg;
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      ctx.restore();
    }

    // inner rim
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.arc(x, y, innerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  // Draw bumpers with glow/spec
  drawBumpers: function (ctx) {
    if (!this.bumpers || !this.bumpers.length) return;
    for (let i = 0; i < this.bumpers.length; i++) {
      var bp = this.bumpers[i];
      if (!bp) continue;
      if (this.drawSonicBumper) this.drawSonicBumper(ctx, bp);
    }
  },
  // --- End-game: Sudden Death (rows of bricks move down - hurry or die!) ---
  activateSuddenDeath: function () {
    // Initialize State
    this.sudden = {
      timer: 0,
      interval: 5.0, // Shift every 5 seconds
      nextShift: 5.0,
      warningPlayed: false
    };

    // Play Intro Sound
    if (this.playSound) this.playSound('suddendeath');

    // Visual Announcement
    if (this.floaters && this.floaters.spawn) {
      this.floaters.spawn(this.width / 2, this.height / 2, "THE CRUSHER!", '#FF0000');
    }

    // Initial Shake to signal danger
    this.requestShake(10, 0.5);
  },
  updateSuddenDeath: function (dt) {
    if (!this.endGame || this.endGame.mode !== 'sudden') return;
    if (!this.sudden) this.activateSuddenDeath();

    this.sudden.timer += dt;

    // 1. THE CRUSH: Shift Down Logic
    if (this.sudden.timer >= this.sudden.nextShift) {
      this.shiftBricks(1); // Move down 1 row
      this.sudden.nextShift += this.sudden.interval;
      this.sudden.warningPlayed = false; // Reset warning flag

      // Impact Effect
      this.requestShake(15, 0.2);
      this.playSound('thud');
    }

    // 2. CHECK HEIGHT (Fail State & Audio Warning)
    var bricks = this.court.bricks;
    var lowestY = -Infinity;
    var paddleY = this.paddle.top;
    var chunk = this.court.chunk;

    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (b.hit) continue;

      // Find the lowest point of the wall
      if (b.bottom > lowestY) lowestY = b.bottom;

      // DEATH CHECK: Brick touches paddle level
      if (b.bottom >= paddleY) {
        this.handleCrusherDeath();
        return; // Stop processing immediately
      }
    }

    // 3. LAST CHANCE AUDIO
    // Trigger if bricks are within 1 row of the paddle (chunk * 1.5 allows for a small gap)
    // paddleY - lowestY < (chunk * 1.5) means there is less than 1.5 blocks of empty space left
    var gap = paddleY - lowestY;
    if (gap < (chunk * 1.8) && gap > 0 && !this.sudden.warningPlayed) {
      if (this.playSound) this.playSound('lastchance');
      this.sudden.warningPlayed = true;

      // Visual Warning
      if (this.floaters) this.floaters.spawn(this.paddle.x + this.paddle.w / 2, this.paddle.top - 30, "LOOK OUT!", '#FF0000');
    }
  },
  shiftBricks: function (rows) {
    if (!this.court || !this.court.bricks) return;
    var chunk = this.court.chunk;
    var dy = rows * chunk;

    for (var i = 0; i < this.court.bricks.length; i++) {
      var b = this.court.bricks[i];
      if (b.hit) continue;

      // Update Position
      b.y += dy;
      // Update Logic Position (for shuffle/logic)
      if (b.pos) b.pos.y += rows;

      // CRITICAL: Synchronize Collision Box
      // (Fixes the "Ghost Collision" bug)
      if (typeof Game !== 'undefined' && Game.Math && Game.Math.bound) {
        Game.Math.bound(b);
      } else {
        b.left = b.x;
        b.right = b.x + b.w;
        b.top = b.y;
        b.bottom = b.y + b.h;
      }
    }
  },
  handleCrusherDeath: function () {
    // 1. Lose Life
    this.loseBall();

    // 2. Reset Mechanics: Push bricks BACK UP 5 rows
    this.shiftBricks(-5);

    // 3. Reset Timer slightly to give breathing room
    this.sudden.timer = 0;
    this.sudden.nextShift = this.sudden.interval;
    this.sudden.warningPlayed = false;

    // 4. Feedback
    this.playSound('explosion');
    if (this.floaters) this.floaters.spawn(this.width / 2, this.height / 2, "RETREATING...", '#FFFFFF');
  },
  // --- End-game: Laser Grid (vertical beams that toggle on/off) ---
  spawnLaserGrid: function () {
    const c = this.court;
    if (!c) return;
    this.laserGrid = {
      lines: [],
      t: 0,
      on: true
    };
    var count = 3;
    var margin = c.wall.size + Math.max(8, (c.chunk * 0.5) | 0);
    var minX = c.left + margin,
      maxX = c.right - margin;
    for (let i = 0; i < count; i++) {
      let x = (minX + Math.random() * (maxX - minX)) | 0;
      const w = Math.max(4, (c.chunk * 0.18) | 0);
      // vertical from top to bottom with small gap around paddle zone
      this.laserGrid.lines.push({
        x: x,
        w: w,
        phase: Math.random() * Math.PI * 2
      });
    }
  },
  updateLaserGrid: function (dt) {
    if (!this.laserGrid || !this.laserGrid.lines) return;
    var L = this.laserGrid;
    L.t += dt;
    // toggle on/off every ~1.2s
    var period = 1.2;
    var prevPhase = Math.floor((L.t - dt) / period);
    var currPhase = Math.floor(L.t / period);
    if (currPhase !== prevPhase) L.on = !L.on;
  },
  drawLaserGrid: function (ctx) {
    var c = this.court,
      L = this.laserGrid;
    if (!c || !L || !L.lines || !L.lines.length) return;
    var on = !!L.on;
    var alpha = on ? 0.55 : 0.15;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < L.lines.length; i++) {
      var ln = L.lines[i];
      let x = ln.x,
        w = ln.w;
      // body beam
      var g = ctx.createLinearGradient(x, c.top, x, c.bottom);
      g.addColorStop(0, 'rgba(255, 64, 64,' + alpha + ')');
      g.addColorStop(0.5, 'rgba(255,255,255,' + (alpha * 0.8) + ')');
      g.addColorStop(1, 'rgba(255, 64, 64,' + alpha + ')');
      ctx.fillStyle = g;
      ctx.fillRect(x - w / 2, c.top, w, c.height);
      // glow fringes
      var gw = Math.max(2, w * 2);
      ctx.globalAlpha = alpha * 0.65;
      ctx.fillStyle = 'rgba(255,100,100,0.25)';
      ctx.fillRect(x - gw, c.top, gw, c.height);
      ctx.fillRect(x + w, c.top, gw, c.height);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
  // End-Game: Mirror World ---------------------------------------------------------
  updateMirrorWorld: function (dt) {
    if (!this.endGame || this.endGame.mode !== 'mirror') return;
    if (!this.court) return;
    this.mirror.next -= dt;
    if (this.mirror.next <= 0) {
      var c = this.court,
        left = c.left,
        right = c.right;
      var mid = (left + right) * 0.5;
      if (this.ball && this.ball.balls) {
        for (let i = 0; i < this.ball.balls.length; i++) {
          var b = this.ball.balls[i];
          if (!b) continue;
          var off = b.x - mid;
          b.x = mid - off;
          b.dx = -b.dx;
        }
      }
      this.mirror.ripple = 0.30;
      this.mirror.next = 3.0 + Math.random() * 1.0;
      if (this.requestShake) this.requestShake(5, 0.06);
    }
    if (this.mirror.ripple > 0) this.mirror.ripple = Math.max(0, this.mirror.ripple - dt);
  },
  drawMirrorRipple: function (ctx) {
    if (!this.endGame || this.endGame.mode !== 'mirror') return;
    if (this.mirror.ripple <= 0) return;
    const c = this.court;
    if (!c) return;
    var u = this.mirror.ripple / 0.30;
    var a = 0.35 * u;
    var mid = (c.left + c.right) / 2;
    ctx.save();
    const w = Math.max(8, c.width * (1 - u));
    var g = ctx.createLinearGradient(mid - w, 0, mid + w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,' + a.toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.fillRect(c.left, c.top, c.width, c.height);
    ctx.restore();
  },
  // --- End-Game: Ghost Bricks ----------------------------------------------------------
  updateGhostBricks: function (dt) {
    if (!this.endGame || this.endGame.mode !== 'ghosts') return;
    this.ghosts.t += dt;
    var u = 0;
    if (this.beat && this.beat.interval) {
      var since = Math.max(0, this.beat.t - this.beat.last);
      var T = Math.max(0.2, this.beat.interval);
      u = (since % T) / T;
    } else {
      u = (this.ghosts.t % 1);
    }
    var p = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
    this.ghosts.phase = p;
    this.ghosts.solid = (p > 0.55);
  },
  isBrickGhosted: function () {
    return (this.endGame && this.endGame.mode === 'ghosts' && this.ghosts && !this.ghosts.solid);
  },
  drawGhostBricksOverlay: function (ctx) {
    if (!this.endGame || this.endGame.mode !== 'ghosts') return;
    const c = this.court;
    if (!c) return;
    var bricks = c.bricks || [];
    var p = (this.ghosts && this.ghosts.phase) || 0;

    // Pulse amount; brighter when ghosted, lighter when solid
    var veilAlpha = (this.ghosts && this.ghosts.solid) ? 0.20 : 0.38;
    // Subtle pulse swell (breathes with the beat)
    let pulse = 0.08 + 0.35 * (1 - Math.abs(0.5 - p) * 2);

    ctx.save();
    // Put a soft blue veil on top of the brick quads
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (!b || b.hit || !b.isbrick) continue;
      var x = b.left,
        y = b.top,
        w = b.right - b.left,
        h = b.bottom - b.top;

      // 1) Veil fill
      var g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, 'rgba(120,180,255,' + (0.10 + pulse * 0.25).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(40,80,180,' + (veilAlpha).toFixed(3) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);

      // 2) Perimeter glow when ghosted (thin rim)
      if (this.ghosts && !this.ghosts.solid) {
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = 'rgba(140,190,255,0.9)';
        ctx.lineWidth = Math.max(1, (c.chunk * 0.08) | 0);
        // outer rim
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        // inner rim shimmer
        ctx.globalAlpha = 0.40;
        ctx.strokeStyle = 'rgba(200,230,255,0.7)';
        ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      }
    }
    ctx.restore();
  },
  // --- Power-up: ORBITALS -----------------------------------------------------
  updateOrbitals: function (dt) {
    if (!(this.powerup && this.powerup.isOrbitalsActive && this.powerup.isOrbitalsActive())) return;
    if (!this.ball) return;
    var sys = this._orbitals || (this._orbitals = {
      ang: 0,
      r: Math.max(8, (this.ball.radius || 6) * 2.2),
      speed: 2.6,
      size: Math.max(4, (this.ball.radius || 6) * 0.55)
    });
    sys.ang += (sys.speed || 2.6) * dt;

    // Collide with bricks (circle-rect test), similar to your prior code:
    var c = this.court,
      bs = c && c.bricks || [];
    var b = (this.ball.balls && this.ball.balls[0]) || this.ball;
    if (!b) return;

    var R = sys.r,
      a = sys.ang,
      s = sys.size;
    var o1 = {
      x: b.x + Math.cos(a) * R,
      y: b.y + Math.sin(a) * R,
      r: s
    };
    var o2 = {
      x: b.x + Math.cos(a + Math.PI) * R,
      y: b.y + Math.sin(a + Math.PI) * R,
      r: s
    };

    function circleHitsRect(cx, cy, cr, rect) {
      var rx = Math.max(rect.left, Math.min(cx, rect.right));
      var ry = Math.max(rect.top, Math.min(cy, rect.bottom));
      var dx = cx - rx,
        dy = cy - ry;
      return (dx * dx + dy * dy) <= cr * cr;
    }

    for (let i = 0; i < bs.length; i++) {
      var br = bs[i];
      if (!br || br.hit || !br.isbrick) continue;
      if (circleHitsRect(o1.x, o1.y, o1.r, br) || circleHitsRect(o2.x, o2.y, o2.r, br)) {
        this.damageBrick(br, {
          kind: 'orbital'
        });
      }
    }

    // optional: spark with bumpers/lasers if present
    if (this.bumpers && this.bumpers.length) {
      if (this.playSound) this.playSound('bumpers');
      for (let j = 0; j < this.bumpers.length; j++) {
        var bp = this.bumpers[j];
        if (!bp) continue;
        var dx1 = o1.x - bp.x,
          dy1 = o1.y - bp.y;
        var dx2 = o2.x - bp.x,
          dy2 = o2.y - bp.y;
        if (dx1 * dx1 + dy1 * dy1 < (o1.r + bp.r) * (o1.r + bp.r) || dx2 * dx2 + dy2 * dy2 < (o2.r + bp.r) * (o2.r + bp.r)) {
          if (this.requestRipple) this.requestRipple(bp.x, bp.y, 0.16, 0.16);
        }
      }
    }
  },

  drawOrbitals: function (ctx) {
    if (!(this.powerup && this.powerup.isOrbitalsActive && this.powerup.isOrbitalsActive())) return;
    for (let i = 0; i < this.ball.balls.length; i++) {
      var b = this.ball.balls[i];
      var sys = this._orbitals;
      if (!sys) return;
      var R = sys.r,
        a = sys.ang,
        s = sys.size;

      function drawChrome(cx, cy, r) {
        ctx.save();
        // body
        var shade = ctx.createRadialGradient(cx, cy, Math.max(1, r * 0.25), cx, cy, r);
        shade.addColorStop(0.0, 'rgba(255,255,255,0.9)');
        shade.addColorStop(0.8, 'rgba(255,255,255,0.9)');
        shade.addColorStop(1.0, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
        ctx.fill();
        // hotspot
        ctx.globalCompositeOperation = 'lighter';
        var hx = cx - r * 0.35,
          hy = cy - r * 0.35,
          hr = Math.max(1, r * 0.65);
        var spec = ctx.createRadialGradient(hx, hy, 1, hx, hy, hr);
        spec.addColorStop(0.00, 'rgba(255,255,255,0.90)');
        spec.addColorStop(0.35, 'rgba(255,255,255,0.35)');
        spec.addColorStop(1.00, 'rgba(255,255,255,0.00)');
        ctx.fillStyle = spec;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();
      }

      drawChrome(b.x + Math.cos(a) * R, b.y + Math.sin(a) * R, s);
      drawChrome(b.x + Math.cos(a + Math.PI) * R, b.y + Math.sin(a + Math.PI) * R, s);
    }
  },
  // --- SPIKES MODE (now destructible) ---
  startSpikes: function () {
    var c = this.court;
    var midY = (c.top + c.bottom) / 2;
    var midX = (c.left + c.right) / 2;

    this.spikes = {
      t: 0,

      // motion params
      ampY: c.height * 0.35, // vertical amplitude for side spikes
      ampX: c.width * 0.35, // horizontal amplitude for ceiling spike
      omegaY: 1.25, // angular speed (left/right)
      omegaX: 1.35, // angular speed (top)

      // visuals/geometry
      w: Math.max(8, c.wall.size), // spike “thickness”
      h: Math.max(24, (c.chunk * 1.4) | 0), // spike “length”
      inset: Math.max(6, (c.chunk * 0.35) | 0), // distance from wall

      // instances: left, right, top
      items: [{
        side: 'left',
        y: midY,
        phase: 0.00
      }, {
        side: 'right',
        y: midY,
        phase: Math.PI * 0.75
      }, {
        side: 'top',
        x: midX,
        phase: Math.PI * 0.33
      }]
    };
  },

  updateSpikes: function (dt) {
    if (!(this.endGame && this.endGame.mode === 'spikes' && this.spikes)) return;
    var c = this.court;
    if (!c) return;
    var S = this.spikes;
    if (!S.items || !S.items.length) return;

    S.t += dt;
    var baseY = (c.top + c.bottom) / 2;
    var baseX = (c.left + c.right) / 2;

    var padY = Math.max(20, c.chunk * 2);
    var padX = Math.max(20, c.chunk * 2);

    for (var i = 0; i < S.items.length; i++) {
      var s = S.items[i];
      var ph = (s.phase || 0);

      if (s.side === 'left' || s.side === 'right') {
        var omY = S.omegaY || 1.25;
        var ampY = S.ampY || (c.height * 0.35);
        s.y = baseY + Math.sin(S.t * omY + ph) * ampY;
        if (s.y < c.top + padY) s.y = c.top + padY;
        if (s.y > c.bottom - padY) s.y = c.bottom - padY;
      } else if (s.side === 'top') {
        var omX = S.omegaX || 1.35;
        var ampX = S.ampX || (c.width * 0.35);
        s.x = baseX + Math.sin(S.t * omX + ph) * ampX;
        if (s.x < c.left + padX) s.x = c.left + padX;
        if (s.x > c.right - padX) s.x = c.right - padX;
      }
    }

    // collision
    var bsys = this.ball;
    var balls = (bsys && bsys.balls && bsys.balls.length) ? bsys.balls.slice() : [bsys && (bsys.primary || bsys)];
    for (var bi = 0; bi < balls.length; bi++) {
      var b = balls[bi];
      if (!b) continue;
      var bx = b.x,
        by = b.y,
        br = b.radius || Math.max(4, this.court.chunk * 0.3);

      for (var j = 0; j < S.items.length; j++) {
        var sp = S.items[j];
        var w = S.w,
          h = S.h,
          inset = S.inset;

        var hitX = false,
          hitY = false;
        var minX, maxX, minY, maxY;

        if (sp.side === 'left' || sp.side === 'right') {
          // triangle pointing horizontally
          var xBase = (sp.side === 'left') ? (c.wall.left.right + inset) : (c.wall.right.left - inset);
          var xTip = (sp.side === 'left') ? (xBase + w) : (xBase - w);
          minX = Math.min(xBase, xTip);
          maxX = Math.max(xBase, xTip);
          minY = sp.y - h * 0.5;
          maxY = sp.y + h * 0.5;

          hitX = (bx + br >= minX && bx - br <= maxX);
          hitY = (by + br >= minY && by - br <= maxY);
        } else if (sp.side === 'top') {
          // triangle pointing downward
          var yBase = c.wall.top.bottom + inset;
          var yTip = yBase + h;
          minY = Math.min(yBase, yTip);
          maxY = Math.max(yBase, yTip);
          minX = sp.x - w * 0.5;
          maxX = sp.x + w * 0.5;

          hitX = (bx + br >= minX && bx - br <= maxX);
          hitY = (by + br >= minY && by - br <= maxY);
        }

        if (hitX && hitY) {
          // === SYNERGY: EXPLODING BALL DESTROYS SPIKE ===
          if (this.powerup && this.powerup.isExplodingActive && this.powerup.isExplodingActive()) {
            S.items.splice(j, 1); // Remove spike
            this.playSound('explosion');
            this.requestShake(10, 0.15);

            // Visuals
            if (this.particles && this.particles.explosion) {
              this.particles.explosion((minX + maxX) / 2, (minY + maxY) / 2, {
                count: 20,
                color: '#FF0000'
              });
            }

            // Bounce ball off destroyed spike area
            if (sp.side === 'top') b.dy = Math.abs(b.dy);
            else b.dx = (sp.side === 'left') ? Math.abs(b.dx) : -Math.abs(b.dx);

            j--; // Adjust index
            continue;
          }

          // NORMAL BEHAVIOR: DEATH
          if (this.loseBall) {
            this.loseBall();
            return;
          }
        }
      }
    }
  },

  drawSpikes: function (ctx) {
    if (!(this.endGame && this.endGame.mode === 'spikes' && this.spikes)) return;
    var c = this.court,
      S = this.spikes;
    if (!c || !S || !S.items || !S.items.length) return;

    ctx.save();
    for (var i = 0; i < S.items.length; i++) {
      var s = S.items[i];
      var w = S.w,
        h = S.h,
        inset = S.inset;

      if (s.side === 'left' || s.side === 'right') {
        var xBase = (s.side === 'left') ? c.wall.left.right + inset : c.wall.right.left - inset;
        var xTip = (s.side === 'left') ? xBase + w : xBase - w;

        // glow
        ctx.globalCompositeOperation = 'lighter';
        var gx = (s.side === 'left') ? (c.wall.left.left) : (c.wall.right.left - w);
        var grad = (s.side === 'left') ? ctx.createLinearGradient(gx + w, 0, gx, 0) :
          ctx.createLinearGradient(gx, 0, gx + w, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, 'rgba(255,255,255,0.20)');
        ctx.fillStyle = grad;
        ctx.fillRect(gx, s.y - h * 0.9, w, h * 1.8);

        // spike
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.moveTo(xBase, s.y - h * 0.5);
        ctx.lineTo(xTip, s.y);
        ctx.lineTo(xBase, s.y + h * 0.5);
        ctx.closePath();
        ctx.fillStyle = '#e53935';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

      } else if (s.side === 'top') {
        var yBase = c.wall.top.bottom + inset;
        var yTip = yBase + h;

        // glow
        ctx.globalCompositeOperation = 'lighter';
        var gy = c.wall.top.top;
        var gh = Math.max(2, Math.floor(c.wall.size * 0.6));
        var gradT = ctx.createLinearGradient(0, gy, 0, gy + gh);
        gradT.addColorStop(0, 'rgba(255,255,255,0.20)');
        gradT.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = gradT;
        ctx.fillRect(Math.max(c.left, s.x - w), gy, Math.min(w * 2, c.right - c.left), gh);

        // spike
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.moveTo(s.x - w * 0.5, yBase);
        ctx.lineTo(s.x, yTip);
        ctx.lineTo(s.x + w * 0.5, yBase);
        ctx.closePath();
        ctx.fillStyle = '#e53935';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      }
    }
    ctx.restore();
  },
  // Time Dilation - was initially an end-game mode, but not fully working. Need to fix.
  // Returns [0.35..1.00] multiplier based on distance to the last brick center.
  getTimeDilationScaleFor: function (x, y) {
    if (!(this.endGame && this.endGame.mode)) return 1;
    if (!this.timeDilation || !this.timeDilation.lastCenter) return 1;
    var td = this.timeDilation,
      cx = td.lastCenter.x,
      cy = td.lastCenter.y,
      r = td.radius || 140;
    var dx = (x - cx),
      dy = (y - cy);
    var d2 = dx * dx + dy * dy;
    var r2 = r * r;
    if (d2 >= r2) return 1;
    var u = Math.max(0, Math.min(1, Math.sqrt(d2) / r)); // 0 at center -> 1 at edge
    // smoothstep envelope so it feels natural
    var s = u * u * (3 - 2 * u); // 0..1
    var minScale = 0.35; // slowest at center
    return minScale + (1 - minScale) * s;
  },
  ensureTimeDilationState: function () {
    if (!this.timeDilation) this.timeDilation = {
      lastCenter: null,
      shimmerT: 0,
      radius: 140,
      slow: 0.55
    };
    if (!this.timeDilation.radius) this.timeDilation.radius = 140;
    return this.timeDilation;
  },
  // --- Time Dilation FX --------------------------------------------------------
  updateTimeDilation: function (dt) {
    if (!(this.endGame && this.endGame.mode !== null)) return;

    // Ensure state exists
    if (!this.timeDilation) {
      this.timeDilation = {
        lastCenter: null, // {x,y}
        shimmerT: 0, // time accumulator
        radius: 140, // pixels
        slow: 0.55 // velocity multiplier when inside radius
      };
    }
    var td = this.ensureTimeDilationState();
    td.shimmerT += dt;

    // Find the "last live brick" center when 1 brick remains (scan your bricks array)
    var lastLive = null,
      aliveCount = 0;
    if (this.court && Array.isArray(this.court.bricks)) {
      for (let i = 0; i < this.court.bricks.length; i++) {
        var b = this.court.bricks[i];
        if (!b || b.hit || !b.isbrick) continue;
        aliveCount++;
        lastLive = b;
        if (aliveCount > 1) break;
      }
    }
    td.lastCenter = (aliveCount === 1 && lastLive) ? {
      x: (lastLive.left + lastLive.right) * 0.5,
      y: (lastLive.top + lastLive.bottom) * 0.5
    } : null;

    // Only apply slow-mo if the *mode itself* is 'timedilation'
    if (this.endGame.mode === 'timedilation' && td.lastCenter && this.ball) {
      var balls = (this.ball.balls && this.ball.balls.length) ? this.ball.balls : [this.ball];
      for (let k = 0; k < balls.length; k++) {
        var bb = balls[k];
        if (!bb) continue;
        var dx = bb.x - td.lastCenter.x,
          dy = bb.y - td.lastCenter.y;
        if ((dx * dx + dy * dy) <= td.radius * td.radius) {
          bb.vx *= td.slow;
          bb.vy *= td.slow;
        }
      }
    }

    // Optional gentle audio dip following the shimmer
    if (this.audio && typeof this.audio.setLowpass === 'function') {
      var amt = 0.10 + 0.05 * Math.sin(td.shimmerT * 6.28318);
      this.audio.setLowpass(amt);
    }
  },
  // --- Visuals: Last Brick Highlight ---
  drawTimeDilation: function (ctx) {
    // Only active if we are in the "last brick" state (dilation active)
    // OR if we just want to highlight the last brick generally
    if (!this.court || !this.court.bricks) return;

    // 1. Find the last live brick
    var live = [];
    for (var i = 0; i < this.court.bricks.length; i++) {
      if (!this.court.bricks[i].hit) live.push(this.court.bricks[i]);
    }

    if (live.length !== 1) return; // Only draw if exactly 1 left

    var b = live[0];
    var cx = b.x + b.w / 2;
    var cy = b.y + b.h / 2;

    // 2. Pulse Animation
    var t = Date.now() * 0.003;
    var pulse = 0.5 + 0.5 * Math.sin(t); // 0.0 to 1.0

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 3. Draw Target Reticle (Subtle)
    // Radius: Toned down from massive circle to just larger than brick
    var baseR = Math.max(b.w, b.h) * 0.8;
    var r = baseR + (pulse * 5);

    // Outer Ring (Faint)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]); // Dashed line looks more "UI target" like
    ctx.stroke();

    // Inner Glow (Soft)
    var grad = ctx.createRadialGradient(cx, cy, baseR * 0.2, cx, cy, baseR * 1.5);
    grad.addColorStop(0.0, 'rgba(255, 215, 0, 0.0)'); // Center transparent
    grad.addColorStop(0.5, 'rgba(255, 215, 0, 0.15)'); // Gold tint
    grad.addColorStop(1.0, 'rgba(255, 215, 0, 0.0)'); // Edge transparent

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // --- Ricochet FX (pronounced) ----------------------------------------------
  updateRicochet: function (dt) {
    if (!(this.endGame && this.endGame.mode === 'ricochet')) return;

    // Init state if missing
    if (!this.ricochet) {
      this.ricochet = {
        t: 0,
        cooldown: 0,
        sparks: []
      };
    }
    var R = this.ricochet;
    R.t += dt;
    R.cooldown = Math.max(0, R.cooldown - dt);

    var balls = (this.ball && this.ball.balls && this.ball.balls.length) ?
      this.ball.balls : [this.ball];

    // Trigger freq: Every 0.4s to 0.8s (Slower, more rhythmic)
    if (R.cooldown === 0) {
      R.cooldown = 0.4 + Math.random() * 0.4;

      // 30% chance of a "Wild" bounce
      var isWild = (Math.random() < 0.30);

      // Standard jitter: +/- 5 to 15 degrees
      // Wild jitter: +/- 20 to 45 degrees (Reduced max from 60 to 45)
      var minDeg = isWild ? 20 : 5;
      var maxDeg = isWild ? 45 : 15;

      // Safety threshold: Don't ricochet in the bottom 35% of the court
      // This prevents "cheap deaths" right near the paddle
      var safeY = this.court.top + this.court.height * 0.65;

      for (let i = 0; i < balls.length; i++) {
        var b = balls[i];
        if (!b) continue;

        // SKIP if ball is too close to paddle
        if (b.y > safeY) continue;
        // SKIP if ball is moving too slowly (prevents getting stuck)
        if (Math.abs(b.dy) < 0.5) continue;

        // 1. Calculate random rotation
        var dir = (Math.random() < 0.5 ? -1 : 1);
        var rot = dir * (minDeg + Math.random() * (maxDeg - minDeg));
        var ang = rot * (Math.PI / 180);
        var cs = Math.cos(ang),
          sn = Math.sin(ang);

        // 2. Apply rotation
        var dx2 = b.dx * cs - b.dy * sn;
        var dy2 = b.dx * sn + b.dy * cs;

        // Safety Check: If a wild bounce would send the ball excessively horizontal
        // (making the game stall), dampen the angle
        if (Math.abs(dy2) < Math.abs(b.speed * 0.2)) {
          dy2 = (dy2 < 0 ? -1 : 1) * Math.abs(b.speed * 0.3);
        }

        // 3. Modulate Speed
        // Wild bounces now slightly SLOW the ball (0.8 to 1.1) to give reaction time
        var speedMod = isWild ? (0.8 + Math.random() * 0.3) : 1.0;
        b.dx = dx2 * speedMod;
        b.dy = dy2 * speedMod;

        // 4. Add Visual Spark
        this.ricochet.sparks.push({
          x: b.x,
          y: b.y,
          t: 0,
          isWild: isWild,
          rot: Math.random() * Math.PI
        });

        if (isWild && this.playSound) this.playSound('bumper');
      }
    }

    // Update sparks
    for (let k = R.sparks.length - 1; k >= 0; k--) {
      var p = R.sparks[k];
      p.t += dt;
      var life = p.isWild ? 0.6 : 0.25;
      if (p.t > life) R.sparks.splice(k, 1);
    }
  },

  drawRicochet: function (ctx) {
    if (!this.ricochet || !this.ricochet.sparks) return;
    var R = this.ricochet;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; // Glow effect

    for (let i = 0; i < R.sparks.length; i++) {
      var p = R.sparks[i];
      var life = p.isWild ? 0.6 : 0.25;
      var u = p.t / life; // 0..1
      var a = Math.max(0, 1 - u);

      // Wild = Cyan/White, Normal = Gold/Yellow
      var color = p.isWild ? '#00FFFF' : '#FFD54F';
      var size = p.isWild ? 16 : 3;

      ctx.globalAlpha = a;

      // 1. Draw Core Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // 2. Wild Effect: "Electric Cross" & Ring
      if (p.isWild) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot + u * 2); // Spin as it fades

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        // Draw Jagged Cross
        var r = size * (0.8 + u); // expands
        ctx.beginPath();
        ctx.moveTo(-r, -r);
        ctx.lineTo(r, r);
        ctx.moveTo(r, -r);
        ctx.lineTo(-r, r);
        ctx.stroke();

        // Expanding Shockwave Ring
        ctx.beginPath();
        ctx.arc(0, 0, size * (1 + u * 2), 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
    }
    ctx.restore();
  },
  // ---- End Game: Rotate -------------------------------------------------------
  ensureRotateState: function () {
    if (!this.rotate) {
      this.rotate = {
        angleDeg: 0, // accumulated angle in degrees
        speedDps: 42, // degrees per second
        dir: (Math.random() < 0.5 ? -1 : 1), // spin direction
        ramp: 0, // 0..1 blend (ease-in/out)
        rampIn: 0.6, // seconds to fade in
        rampOut: 0.6 // seconds to fade out
      };
    }
    return this.rotate;
  },
  updateRotate: function (dt) {
    const R = this.ensureRotateState();

    // Ease ramp depending on whether rotate is currently the active mode
    const target = (this.endGame && this.endGame.mode === 'rotate') ? 1 : 0;
    if (target > R.ramp) {
      R.ramp = Math.min(1, R.ramp + dt / Math.max(0.001, R.rampIn));
    } else if (target < R.ramp) {
      R.ramp = Math.max(0, R.ramp - dt / Math.max(0.001, R.rampOut));
    }

    // Advance angle only when visibly rotating
    if (R.ramp > 0) {
      R.angleDeg += R.dir * R.speedDps * dt;
      // keep angle bounded
      if (R.angleDeg > 360 || R.angleDeg < -360) R.angleDeg = R.angleDeg % 360;
    }
  },
  beginRotateCanvas: function (ctx) {
    if (!this.rotate || this.rotate.ramp <= 0) return false;

    // Apply eased rotation (use ramp as a multiplier so it fades naturally)
    const R = this.rotate;
    const degToRad = Math.PI / 180;
    const angleRad = (R.angleDeg * R.ramp) * degToRad;

    // Center of the court (rotate around visible playfield)
    const c = this.court;
    const cx = (c.left + c.right) * 0.5;
    const cy = (c.top + c.bottom) * 0.5;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleRad);
    ctx.translate(-cx, -cy);
    return true;
  },

  endRotateCanvas: function (ctx, applied) {
    if (applied) ctx.restore();
  },
  // --- End-game: FIGHTBACK --------------------------------------------------
  startFightback: function () {
    this.endGame = {
      chosen: true,
      mode: 'fightback'
    };
    this.fightLasers = [];
    // Stable per-brick schedule keyed by a persistent UID.
    if (!this._brickUIDSeq) this._brickUIDSeq = 1;
    this._fightTimers = Object.create(null); // uid -> nextFireTs
    this._fightLastNow = Date.now();

    // Seed UIDs & randomized stagger so they don't all fire together.
    var now = Date.now();
    for (let i = 0; i < this.court.bricks.length; i++) {
      var br = this.court.bricks[i];
      if (!br || br.hit) continue;
      if (!br._uid) br._uid = (this._brickUIDSeq++);
      this._fightTimers[br._uid] = now + (600 + Math.random() * 1800) | 0;
    }
  },
  _updateFightbackSpawn: function (dt) {
    // Spawn new lasers from live bricks according to their independent timers.
    var c = this.court,
      now = Date.now();
    var remaining = Math.max(0, c.numbricks - c.numhits);
    // Allow up to "remaining" lasers concurrently, minimum cap of 4.
    var maxBeams = Math.max(remaining, 4);

    // Clean timers for dead bricks
    for (let k in this._fightTimers) {
      if (!Object.prototype.hasOwnProperty.call(this._fightTimers, k)) continue;
      // If no brick with this uid exists anymore, drop its timer.
      var found = false;
      for (let i = 0; i < c.bricks.length && !found; i++) {
        var b = c.bricks[i];
        if (b && !b.hit && b._uid == k) found = true;
      }
      if (!found) delete this._fightTimers[k];
    }
    // Ensure all current live bricks have a uid & a timer.
    for (let i = 0; i < c.bricks.length; i++) {
      var br = c.bricks[i];
      if (!br || br.hit) continue;
      if (!br._uid) br._uid = (this._brickUIDSeq = (this._brickUIDSeq || 1) + 1);
      if (this._fightTimers[br._uid] == null) {
        this._fightTimers[br._uid] = now + (800 + Math.random() * 2000) | 0;
      }
    }
    // If we're already at capacity, just return (timers remain scheduled).
    if (this.fightLasers.length >= maxBeams) return;
    // Try to spawn from bricks whose cooldown elapsed. Shuffle order a bit so
    // the same brick doesn't always win the check first.
    var idxs = [];
    for (let j = 0; j < c.bricks.length; j++) idxs.push(j);
    for (let s = idxs.length - 1; s > 0; s--) { // Fisher-Yates
      var r = (Math.random() * (s + 1)) | 0;
      var tmp = idxs[s];
      idxs[s] = idxs[r];
      idxs[r] = tmp;
    }
    for (let p = 0; p < idxs.length; p++) {
      if (this.fightLasers.length >= maxBeams) break;
      var br = c.bricks[idxs[p]];
      if (!br || br.hit) continue;

      var uid = br._uid;
      var fireAt = this._fightTimers[uid] || 0;
      if (now < fireAt) continue;

      // Spawn a straight-down beam from the brick's center bottom.
      var bx = (br.left + br.right) * 0.5;
      var by = br.bottom;

      this.fightLasers.push({
        x: bx,
        y: by,
        vy: Math.max(300, c.chunk * 16), // beam speed
        w: Math.max(2, (c.chunk * 0.18) | 0),
        h: Math.max(10, (c.chunk * 0.8) | 0),
        life: 0,
        maxLife: 3.5, // seconds (for fallback cleanup)
        color: '#ff3b3b'
      });

      // Reschedule this brick’s next shot with some jitter.
      var cooldown = 900 + Math.random() * 2000; // 0.9 – 2.9s
      this._fightTimers[uid] = now + cooldown | 0;
    }
  },
  updateFightLasers: function (dt) {
    // Move beams, check paddle hit, clean up off-court / expired.
    if (!this.fightLasers) return;
    var c = this.court,
      P = this.paddle,
      snd = this.playSound && this.playSound.bind(this);

    for (let i = this.fightLasers.length - 1; i >= 0; i--) {
      var L = this.fightLasers[i];
      L.y += L.vy * dt;
      L.life += dt;

      // Paddle collision (simple AABB vs thin rect)
      if (P && L.y + L.h >= P.top && L.y <= P.bottom && L.x >= P.left && L.x <= P.right) {
        // Damage: shrink paddle smoothly to half size
        P.smoothResizeTo((this.paddleBaseW || 96) * 0.5, 220);

        // FX: ripple + shake + sound
        if (this.ripple) {
          this.ripple.t = 0;
          this.ripple.dur = 0.35;
          this.ripple.cx = L.x;
          this.ripple.cy = P.top;
          this.ripple.r = 0;
          this.ripple.max = this.court.chunk * 4;
        }
        if (this.shake) {
          this.shake.t = 0.18; // duration
          this.shake.dur = 0.18;
          this.shake.mag = 5; // magnitude
        }
        if (snd) snd('damage');

        // Remove beam on impact
        this.fightLasers.splice(i, 1);
        continue;
      }

      // Off-court or timed out
      if (L.y > c.bottom + 6 || L.life > L.maxLife) {
        this.fightLasers.splice(i, 1);
      }
    }
  },
  updateFightback: function (dt) {
    // Only run when active
    if (!this.endGame || this.endGame.mode !== 'fightback') return;
    this._updateFightbackSpawn(dt);
    this.updateFightLasers(dt);
  },
  drawFightLasers: function (ctx) {
    if (!this.fightLasers || !this.fightLasers.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this.fightLasers.length; i++) {
      var L = this.fightLasers[i];
      ctx.fillStyle = L.color || '#ff3b3b';
      ctx.fillRect((L.x - (L.w * 0.5)) | 0, L.y | 0, L.w | 0, L.h | 0);

      // tiny glow
      ctx.globalAlpha = 0.35;
      ctx.fillRect((L.x - (L.w * 1.2)) | 0, (L.y - 2) | 0, (L.w * 2.4) | 0, (L.h + 4) | 0);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
  draw: function (ctx) {
    ctx.save();
    if (ctx.setTransform) ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.restore();

    // 1. ROTATION (End Game)
    var _rotApplied = this.beginRotateCanvas && this.beginRotateCanvas(ctx);

    // 2. ZOOM (Time Dilation)
    // We apply this BEFORE drawing game elements, but AFTER clearing screen.
    // We do NOT want to zoom the HUD/UI later.
    ctx.save(); // Start Zoom Layer

    if (this.dilation && this.dilation.zoom > 1.0) {
      var s = this.dilation.zoom;
      var cx = this.dilation.focus.x;
      var cy = this.dilation.focus.y;

      // Clamp focus point so we don't zoom into the void (keep viewport on screen)
      // Viewport dimensions in game pixels
      var vw = this.width / s;
      var vh = this.height / s;

      // Clamp X
      cx = Math.max(vw / 2, Math.min(this.width - vw / 2, cx));
      // Clamp Y
      cy = Math.max(vh / 2, Math.min(this.height - vh / 2, cy));

      // Apply Transform: Translate center to origin, scale, translate origin to center
      ctx.translate(this.width / 2, this.height / 2);
      ctx.scale(s, s);
      ctx.translate(-cx, -cy);
    }

    // --- GAMEPLAY RENDERING (Affected by Zoom) ---
    if (this.endGame && this.endGame.mode === 'bumpers' && this.drawBumpers) {
      this.drawBumpers(ctx);
    }
    if (this.bg) this.bg.draw(ctx);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // Shake effect
    ctx.save();
    if (this.shake) ctx.translate((this.shake.x || 0), (this.shake.y || 0));

    this.court.draw(ctx);
    this.drawGhostBricksOverlay(ctx);
    this.drawMirrorRipple(ctx);
    if (this.endGame && this.endGame.mode === 'spikes') this.drawSpikes(ctx);
    if (this.drawTimeDilation) this.drawTimeDilation(ctx);
    if (this.endGame && this.endGame.mode === 'ricochet') this.drawRicochet(ctx);
    this.drawOrbitals(ctx);
    if (this.court && typeof this.court.drawBrickSweep === 'function') this.court.drawBrickSweep(ctx);
    this.drawTempFloor(ctx);
    this.drawRipple(ctx);
    this.drawGravityWell(ctx);
    this.drawPortals(ctx);

    if (this.endGame && this.endGame.mode === 'lasers' && this.drawLaserGrid) this.drawLaserGrid(ctx);
    if (this.endGame && this.endGame.mode === 'fightback' && this.drawFightLasers) this.drawFightLasers(ctx);
    if (this.endGame && this.endGame.mode === 'bumpers' && this.drawBumpers) this.drawBumpers(ctx);

    this.particles.draw(ctx);
    this.floaters.draw(ctx);
    this.paddle.draw(ctx);
    if (this.paddle && typeof this.paddle.drawSkin === 'function') this.paddle.drawSkin(ctx);
    this.ball.draw(ctx);

    if (this.suddenDeath && this.drawSuddenDeathVignette) this.drawSuddenDeathVignette(ctx);

    this.drawLasers(ctx);
    this.powerup.draw(ctx);
    this.drawLightsOutMask(ctx);

    ctx.restore(); // End Shake
    ctx.restore(); // End Zoom Layer

    // --- UI/HUD RENDERING (Static, unaffected by zoom/shake) ---
    // Note: Rotation (_rotApplied) might still be active, usually we want HUD static relative to rotation too,
    // but typically EndGame rotation spins the whole screen. We'll leave it as is or move endRotateCanvas up if you prefer HUD static.

    this.drawEffectsHUD(ctx);
    this.drawComboHUD(ctx);
    this.score.draw(ctx);

    // --- MENU/OVERLAYS ---
    if (this.is && this.is('menu')) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var bw = Math.min(300, this.width * 0.5),
        bh = 44;
      const cx = this.width / 2;
      var by = Math.floor(this.height * 0.90);
      this._ui.menu.leader = {
        x: cx - bw / 2,
        y: by - bh / 2,
        w: bw,
        h: bh
      };
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(this._ui.menu.leader.x, this._ui.menu.leader.y, bw, bh);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this._ui.menu.leader.x + 0.5, this._ui.menu.leader.y + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = '#fff';
      ctx.font = '18px Orbitron, sans-serif';
      ctx.fillText('View Leaderboard (L)', cx, by);
      ctx.restore();
    }

    if (this.drawLeaderboardOverlay) this.drawLeaderboardOverlay(ctx);
    this.drawHelpButton(ctx);
    this.drawLeaderboardOverlay(ctx);
    this.drawHelpOverlay(ctx);

    // Close Rotation if active
    if (this.endRotateCanvas) this.endRotateCanvas(ctx, _rotApplied);

    // Full screen overlays (Game Over / Level Complete)
    if (this.gameoverOverlay && this.gameoverOverlay.show && this.gameoverOverlay.alpha > 0) {
      var img = this.gameoverOverlay.img;
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;
      if (iw && ih) {
        var scale = Math.min(this.width / iw, this.height / ih);
        var dw = Math.floor(iw * scale);
        var dh = Math.floor(ih * scale);
        var dx = Math.floor((this.width - dw) / 2);
        var dy = Math.floor((this.height - dh) / 2);
        ctx.save();
        ctx.globalAlpha = this.gameoverOverlay.alpha;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      }
    }
    if (this.levelOverlay && this.levelOverlay.show && this.levelOverlay.alpha > 0) {
      var img2 = this.levelOverlay.img;
      var iw2 = img2.naturalWidth || img2.width;
      var ih2 = img2.naturalHeight || img2.height;
      if (iw2 && ih2) {
        var scale2 = this.width / iw2;
        var dw2 = Math.floor(iw2 * scale2);
        var dh2 = Math.floor(ih2 * scale2);
        var dx2 = 0;
        var dy2 = Math.floor((this.height - dh2) / 2);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.levelOverlay.alpha));
        ctx.drawImage(img2, dx2, dy2, dw2, dh2);
        ctx.restore();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    if (this.bg && this.bg.drawCRTOverlay) this.bg.drawCRTOverlay(ctx);
  },
  onresize: function (width, height) {
    if (this.bg && this.bg.resize) this.bg.resize(width, height);
    this.width = width;
    this.height = height;
    this.court.resize();
    this.paddle.reset();
    this.ball.reset();
    if (this.bg && this.bg.buildLayers) {
      this.bg.buildLayers();
    }
  },
  drawLeaderboardOverlay: function (ctx) {
    var L = this.leaderboardOverlay;
    if (!L || !L.show) return;
    var alpha = (typeof L.alpha === 'number') ? Math.max(0, Math.min(1, L.alpha)) : 1;

    ctx.save();

    const c = this.court;
    var chunk = c ? c.chunk : Math.max(20, Math.min(this.width, this.height) / 30);
    const w = Math.min(this.width * 0.85, chunk * 35);
    var h = Math.min(this.height * 0.90, chunk * 32);
    let x = (this.width - w) / 2,
      y = (this.height - h) / 2;

    // --- Background ---
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(1, chunk * 0.1);
    ctx.strokeRect(x, y, w, h);

    var fsTitle = Math.round(chunk * 1.2);
    var fsRow = Math.round(chunk * 0.8);
    var fsBtn = Math.round(chunk * 0.75);

    // --- Header ---
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold ' + fsTitle + 'px Orbitron, sans-serif';

    var title = (L.mode === 'global') ? 'Global Leaders' : 'Local High Scores';
    ctx.fillText(title, x + chunk, y + chunk * 0.8);

    // --- Rows ---
    var rows = (L.rows && Array.isArray(L.rows)) ? L.rows : [];
    ctx.font = fsRow + 'px monospace';
    var startY = y + chunk * 2.5;
    var rowH = chunk * 0.95;

    for (let i = 0; i < 20; i++) {
      var r = rows[i];
      var rank = (i + 1).toString().padStart(2, ' ');
      var name = (r && r.name) ? String(r.name).slice(0, 20) : '---';
      let score = (r && typeof r.score !== 'undefined') ? String(r.score) : '-';

      // Highlight "YOU" (simple check if local)
      if (L.mode === 'local' && this.score && r && r.date === this.score.date) ctx.fillStyle = '#ff0';
      else ctx.fillStyle = '#fff';

      ctx.textAlign = 'left';
      ctx.fillText(rank + '. ' + name, x + chunk * 1.5, startY + i * rowH);
      ctx.textAlign = 'right';
      ctx.fillText(score, x + w - chunk * 1.5, startY + i * rowH);
    }

    // --- Buttons area ---
    var bh = chunk * 1.8;
    var bw = chunk * 8;

    // 1. Toggle Button (Left)
    var btnToggleX = x + chunk;
    var btnY = y + h - bh - chunk;

    // Store rect for click detection
    this._ui.lb.toggle = {
      x: btnToggleX,
      y: btnY,
      w: bw,
      h: bh
    };

    var toggleColor = (L.mode === 'global') ? '#4db8ff' : '#ffcc00';
    var toggleText = (L.mode === 'global') ? 'Show Local' : 'Show Global';

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(btnToggleX, btnY, bw, bh);
    ctx.strokeStyle = toggleColor;
    ctx.strokeRect(btnToggleX, btnY, bw, bh);
    ctx.fillStyle = toggleColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fsBtn + 'px Orbitron, sans-serif';
    ctx.fillText(toggleText, btnToggleX + bw / 2, btnY + bh / 2);

    // 2. Close Button (Right)
    var btnCloseX = x + w - bw - chunk;
    this._ui.lb.close = {
      x: btnCloseX,
      y: btnY,
      w: bw,
      h: bh
    }; // Update rect

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(btnCloseX, btnY, bw, bh);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(btnCloseX, btnY, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.fillText('Close', btnCloseX + bw / 2, btnY + bh / 2);

    ctx.restore();
  },
  drawTempFloor: function (ctx) {
    if (!(this.powerup && this.powerup.isFloorActive && this.powerup.isFloorActive())) return;
    const c = this.court;
    if (!c) return;
    var size = Math.max(4, (c.wall && c.wall.size ? c.wall.size : Math.floor(c.chunk * 0.25)) | 0);
    var y = c.bottom - size;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = this.color.border || '#333';
    ctx.fillRect(c.left, y, c.width, size);
    // subtle glow
    var g = ctx.createLinearGradient(0, y - 6, 0, y + size);
    g.addColorStop(0, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(c.left, y - 6, c.width, 6);
    ctx.restore();
  },

  onmenu: function () {
    if (this.stopBGM) this.stopBGM();
    if (typeof soundManager !== 'undefined' && soundManager.getSoundById) {
      var _bgm = soundManager.getSoundById('bgm');
      if (_bgm) {
        try {
          _bgm.stop();
          if (this.stopBGM) this.stopBGM();
        } catch (e) {}
      }
    }
    if (this.levelOverlay) {
      this.levelOverlay.show = false;
      this.levelOverlay.alpha = 0;
      this.levelOverlay.t = 0;
      this._nextPending = false;
    }
    if (this.gameoverOverlay) {
      this.gameoverOverlay.show = false;
      this.gameoverOverlay.alpha = 0;
      this.gameoverOverlay.t = 0;
    }
    this.resetLevel();
    this.theme = this.determineLevelTheme();
    this.paddle.reset();
    this.ball.reset();
    this.refreshDOM();
    this.lasers = [];
    this.laserCooldown = 0;
    // clear portal whooshes
    this.portalWhooshes = [];
    // Gravity Well state
    this.gravityWell = null;
    this.gravityPulse = 0;
    // clear portals
    this.portals = [];
    this.portalsUntil = 0;
    this.portalsSpawned = false;
  },
  ongame: function (keepScore) {
    // Choose theme music once we actually start the level
    var themeName = (this.theme || 'synthwave').toLowerCase();

    // Ensure music is playing (this creates the 'bgm' sound object if needed)
    this.playThemeMusic(themeName);

    if (this.bg) {
      this.bg.palette = this.bg.extractPalette();
      this.bg.buildLayers();
    }
    if (this.levelOverlay) {
      this.levelOverlay.show = false;
      this.levelOverlay.alpha = 0;
      this.levelOverlay.t = 0;
      this._nextPending = false;
    }
    if (this.gameoverOverlay) {
      this.gameoverOverlay.show = false;
      this.gameoverOverlay.alpha = 0;
      this.gameoverOverlay.t = 0;
    }
    this.refreshDOM();

    if (keepScore !== true) {
      this.score.reset();
    }

    this.ball.reset({
      launch: true
    });

    this.lasers = [];
    this.laserCooldown = 0;
    this.portalWhooshes = [];
    this.gravityWell = null;
    this.gravityPulse = 0;
    this.portals = [];
    this.portalsUntil = 0;
    this.portalsSpawned = false;

    // FIX: Retrieve the actual sound object for the beat conductor
    if (this.beatConductor) {
      var bgmObject = (typeof soundManager !== 'undefined') ? soundManager.getSoundById('bgm') : null;
      if (bgmObject) {
        this.beatConductor.attach(bgmObject);
      }
    }
  },
  onlose: function () {
    this.playSound('gameover');
    const self = this;
    var pts = 0;
    try {
      // Prefer Score.points; fall back to stats.score if present
      pts = (this.score && typeof this.score.score === 'number') ? this.score.score :
        (this.stats && typeof this.stats.score === 'number') ? this.stats.score : 0;
      console.log('[HS] onlose fired. score(from Score.score)=', this.score && this.score.score, ' fallback(stats.score)=', this.stats && this.stats.score);
    } catch (e) {
      try {
        console.warn('[HS] onlose score read error', e);
      } catch (_e) {}
    }

    try {
      Breakout.HighScores.checkAndSubmit(pts, 20).finally(function () {
        // Only show the overlay AFTER the high score flow finishes (or is skipped)
        console.log('[HS] showGameOverOverlay now');
        self.showGameOverOverlay();
      });
    } catch (e) {
      try {
        console.warn('[HS] onlose check error', e);
      } catch (_e) {}
      console.log('[HS] showGameOverOverlay now');
      self.showGameOverOverlay();
    }
  },

  showGameOverOverlay: function () {
    if (this.gameoverOverlay) {
      this.gameoverOverlay.show = true;
      this.gameoverOverlay.alpha = 1;
      this.gameoverOverlay.t = 0;
    }
  },
  onleavegame: function () {
    this.score.save();
    this.score.resetLives();
  },
  onbeforeabandon: function () {
    return this.runner.confirm("Abandon game?");
  },
  loseBall: function () {
    if (this.game && this.game.comboReset) this.game.comboReset();
    this.powerup.resetPowerups();
    this.playSound('loselife');
    if (this.score.loseLife()) this.lose();
    else this.ball.reset({
      launch: true
    });
  },
  winLevel: function () {
    if (this.requestShake) this.requestShake(8, 0.08);
    if (this.requestRipple) {
      var C = this.court,
        w = C.right - C.left,
        h = C.bottom - C.top;
      this.requestRipple(C.left + w / 2, C.top + h / 2, 0.24, 0.18, {
        mode: 'gold'
      });
    }
    if (this.playSound) this.playSound('thud');
    if (this.requestShake) this.requestShake(8, 0.08);
    this.playSound('levelup');
    this.score.gainLife();
    if (this.levelOverlay) {
      this.levelOverlay.show = true;
      this.levelOverlay.alpha = 1;
      this.levelOverlay.t = 0;
      this._nextPending = true;
    }
    this.ball.reset({
      launch: true
    });
  },
  hitBrick: function (brick, opts) {
    if (!brick || brick.hit || !brick.isbrick) return false;
    this.comboOnBrick(this.score);
    if (this.endGame && this.endGame.mode === 'ricochet') {
      if (this.playSound) this.playSound('bumper');
      this.ricochet = this.ricochet || {
        sparks: []
      };
      var R = this.ricochet;
      (R.sparks || (R.sparks = [])).push({
        x: _cx,
        y: _cy,
        t: 1000
      });
      if (this.requestShake) this.requestShake(9, 0.11);
      if (this.requestRipple) {
        var _cx = (brick.left + brick.right) / 2;
        var _cy = (brick.top + brick.bottom) / 2;
        this.requestRipple(_cx, _cy, 0.22, 0.18);
      }
    }
    opts = opts || {};
    var from = opts.from || 'ball';

    // Apply your normal damage rules; returns true if killed
    var destroyed = this.damageBrick(brick, opts);

    // Trigger neighborhood explosion ONLY on ball-sourced hits while Exploding is active.
    // (No pre-scan, no powerup-activation blast, no laser path here unless you want it.)
    if (this.powerup && this.powerup.isExplodingActive && this.powerup.isExplodingActive() && from !== 'explosion') {
      this.explodeBrickNeighborhood(brick);
    }
    return destroyed;
  },
  // Apply damage to a brick with optional source {from: 'ball'|'laser'}.
  // Returns true if the brick was destroyed.
  damageBrick: function (brick, source) {
    if (this.isBrickGhosted && this.isBrickGhosted()) {
      return;
    }
    var __override = false,
      dmg_override = 0;
    if (source && typeof source.dmg === 'number') {
      __override = true;
      dmg_override = source.dmg;
    }
    var from = (source && source.from) || 'ball';
    var hp = (typeof brick.hp === 'number') ? brick.hp : 1;
    var __prevHp = hp;
    // Determine damage per rules
    var dmg = 1;
    if (from === 'laser') {
      dmg = 1.5; // lasers do fixed 1.5
    } else if ((this.ball && this.ball.fire) || from === 'fireball') {
      dmg = 2; // fireball does fixed 2
    } else if (from === 'explosion') {
      dmg = 2; // explosion does fixed 2
    } else {
      // regular ball: size/speed modifiers
      var inc = 0;
      var t = (this.ball && this.ball.temp) ? this.ball.temp : {
        size: 1,
        speed: 1
      };
      if (t.size > 1.0) inc++;
      if (t.size < 1.0) inc--;
      if (t.speed > 1.0) inc++;
      if (t.speed < 1.0) inc--;
      dmg = (inc > 0) ? 2 : (inc < 0 ? 0.5 : 1);
    }
    hp -= (__override ? dmg_override : dmg);
    // micro shake if we *crushed* a multi-hit brick to zero
    if (hp <= 0 && (__prevHp || 1) >= 2) {
      if (this.requestShake) this.requestShake(8, 0.08);
    }
    if (this.requestRipple) {
      var _cx = (brick.left + brick.right) / 2;
      var _cy = (brick.top + brick.bottom) / 2;
      var __dir = (source && source.from === 'laser') ? null : (this._lastBallImpact || null);
      this.requestRipple(_cx, _cy, 0.18, 0.14, __dir ? {
        dir: __dir
      } : null);
    }
    if (this.playSound) this.playSound('thud');
    if (hp > 0) {
      brick.hp = hp;
      brick.cracked = true;
      this.court.rerender = true;
      this.playSound('brick');
      return false; // not destroyed
    }
    // Destroyed
    this.powerup.rollForPowerup(brick);
    this.playSound('brick');
    if (this.particles) {
      var __from = (source && source.from) || null;
      var __isFire = (this.ball && this.ball.fire) || (__from === 'fireball');
      var __doBurn = (__from === 'laser') || __isFire;
      if (__doBurn && this.particles.burn) {
        this.particles.burn(brick);
      } else if (this.particles.explode) {
        this.particles.explode(brick, this._lastBallImpact || {
          dx: 0,
          dy: -1
        });
      }
    } else {
      if (this.particles.explode) this.particles.explode(brick, this._lastBallImpact || {
        dx: 0,
        dy: -1
      });
    }
    if (this.floaters) this.floaters.spawn(
      brick.x + brick.w / 2, brick.y, "+" + brick.score, '#FFD700' // Gold color
    );
    this.court.remove(brick);
    this.score.increase(brick.score);
    if (from === 'ball' || from === 'fireball') {
      if (this.ball && this.ball.bumpSpeed) this.ball.bumpSpeed();
    }
    if (this.court.empty()) this.winLevel();
    return true; // destroyed
  },
  explodeBrickNeighborhood: function (center) {
    if (!center || !this.court || !this.court.bricks) return;

    const cx = (center.left + center.right) * 0.5;
    var cy = (center.top + center.bottom) * 0.5;
    var bw = Math.max(4, center.right - center.left);
    var bh = Math.max(4, center.bottom - center.top);

    // Collect the 8 neighbors
    var neighbors = [];
    for (let i = 0; i < this.court.bricks.length; i++) {
      var b = this.court.bricks[i];
      if (!b || !b.isbrick || b.hit || b === center) continue;
      var bx = (b.left + b.right) * 0.5;
      var by = (b.top + b.bottom) * 0.5;
      var dx = Math.abs(bx - cx) / bw;
      var dy = Math.abs(by - cy) / bh;
      var cheb = Math.max(dx, dy);
      if (cheb > 0 && cheb <= 1.05) neighbors.push(b);
    }

    // Damage neighbors
    for (let k = 0; k < neighbors.length; k++) {
      var nb = neighbors[k];
      if (nb.hit) continue;
      this.damageBrick(nb, {
        from: 'explosion',
        override: 99
      });

      if (this.particles && this.particles.explosion) {
        var ex = (nb.left + nb.right) * 0.5;
        var ey = (nb.top + nb.bottom) * 0.5;
        this.particles.explosion(ex, ey, {
          count: 42,
          color: '#ffecb3',
          spread: 2.6
        });
      }
    }

    // Shock ring
    if (this.particles && this.particles.ring) {
      this.particles.ring(cx, cy, {
        color: '#ffae00',
        maxR: Math.max(bw, bh) * 1.1,
        life: 240
      });
    }

    // NEW: Play Explosion Sound
    if (this.playSound) this.playSound('explosion');
    if (this.requestShake) this.requestShake(7, 0.11);
  },

  resetLevel: function () {
    this.setLevel();
  },
  setLevel: function (level) {
    // reset end-game challenge each level
    this.endGame = {
      chosen: false,
      mode: null
    };
    this.bumpers = [];
    this.shuffleActive = false;

    level = (typeof level == 'undefined') ? (this.storage.level ? parseInt(this.storage.level) : 0) : level;
    level = level < Breakout.Levels.length ? level : 0;
    this.court.reset(level);
    this.storage.level = this.level = level;
    this.determineLevelName();
    this.theme = this.determineLevelTheme();
    if (this.bg && this.bg.setTheme) {
      this.bg.setTheme(this.theme); // <--- FIX: Call a theme setting function on the BG
      if (this.bg && this.bg.buildLayers) this.bg.buildLayers();
    }
    if (this.theme === 'circuit') {
      this.bg.crt.vignetteAlpha = 0.22;
      this.bg.crt.lineAlpha = 0.08;
      this.bg.crt.spacing = 2; // 2 = dense, 3 = sparser
      this.bg.crt.rgbGlow = true; // set true if you like the glow look
    }
    this.powerup.resetPowerups();
    this.refreshDOM();
  },
  canPrevLevel: function () {
    return this.is('menu') && (this.level > 0);
  },
  canNextLevel: function () {
    return this.is('menu') && (this.level < (Breakout.Levels.length - 1));
  },
  prevLevel: function (force) {
    if (force || this.canPrevLevel()) this.setLevel(this.level - 1);
  },
  nextLevel: function (force) {
    if (force || this.canNextLevel()) this.setLevel(this.level + 1);
  },
  determineLevelName: function () {
    if (this.level) this.setLevelName(Breakout.Levels[this.storage.level].name);
    else this.setLevelName(Breakout.Levels[this.level].name);
  },
  setLevelName: function (name) {
    this.Defaults.level.name = name;
    this.setLevelLabel();
  },
  determineLevelTheme: function () {
    var L = (window.Breakout && Breakout.Levels && Breakout.Levels[this.level]) ? Breakout.Levels[this.level] : null;
    return L ? (L.theme || Breakout.Defaults.level.theme) : Breakout.Defaults.level.theme;
  },
  setLevelTheme: function (theme) {
    this.Defaults.level.theme = theme;
    this.level.theme = theme;
    this.theme = theme;
  },
  setLevelLabel: function () {
    var element = document.getElementById('label');
    if (element) element.innerHTML = this.getLevelName();
  },
  getLevelName: function () {
    return this.Defaults.level.name;
  },
  load: function (fresh) {
    if (fresh) {
      var givenLevelCode = prompt("Paste level code:");
      if (givenLevelCode) {
        this.readLevel(givenLevelCode);
        this.setLevel(0);
      }
    }
  },
  readLevel: function (level) {
    try {
      var decodedLevel = atob(level).trim();
      if (this.isValidJson(decodedLevel)) {
        var levelJson = JSON.parse(decodedLevel);
        if (this.isValidLevel(levelJson)) Breakout.Levels.unshift(levelJson);
      }
    } catch (e) {
      alert("Level code provided could not be");
    }
  },
  isValidLevel: function (levelJson) {
    if (!levelJson.name || !levelJson.bricks) {
      alert("Level code provided is missing key attribute.");
      return false;
    }
    return true;
  },
  isValidJson: function (str) {
    try {
      JSON.parse(str);
    } catch (e) {
      alert("Level code provided could not be parsed.");
      return false;
    }
    return true;
  },
  initCanvas: function (ctx) {
    ctx.fillStyle = this.color.foreground;
    ctx.strokeStyle = this.color.foreground;
    ctx.lineWidth = 1;
    this.score.measure(ctx);
  },
  refreshDOM: function () {
    var instructions = $('instructions');
    var labelDiv = $('labelDiv'); // Get the title overlay

    instructions.className = Game.ua.hasTouch ? 'touch' : 'keyboard';

    if (this.is('menu')) {
      instructions.style.display = 'block';
      if (labelDiv) labelDiv.style.opacity = 1; // Show title in menu
    } else {
      instructions.style.display = 'none';
      if (labelDiv) labelDiv.style.opacity = 0; // Hide title during game
    }
    $('prev').toggleClassName('disabled', !this.canPrevLevel());
    $('next').toggleClassName('disabled', !this.canNextLevel());
    $('level').update(this.level + 1);
    $('sound').checked = this.sound;
  },
  playSound: function (id) {
    if (window.soundManager && this.sound) soundManager.play(id);
  },
  ontouchstart: function (ev) {
    if (ev.targetTouches && ev.targetTouches.length == 1) {
      var t = ev.targetTouches[0];
      this.paddle.place(t.pageX - this.runner.bounds.left - this.paddle.w / 2);
      this._touch = {
        x: t.pageX,
        y: t.pageY,
        t: Date.now(),
        lastX: t.pageX
      };
      ev.preventDefault();
    }
  },
  ontouchmove: function (ev) {
    if (ev.targetTouches.length == 1) {
      var t = ev.targetTouches[0];
      this.paddle.place(t.pageX - this.runner.bounds.left - this.paddle.w / 2);
      if (this._touch) this._touch.lastX = t.pageX;
      ev.preventDefault();
    }
  },
  ontouchend: function (ev) {
    var info = this._touch;
    this._touch = null;
    if (!info) return;
    var dt = Math.max(1, Date.now() - info.t);
    var dx = (info.lastX || info.x) - info.x;
    var adx = Math.abs(dx);
    var threshold = (this.court && this.court.chunk) ? (this.court.chunk * 0.5) : 10;
    if (adx < threshold && dt < 250) {
      if (this.ball.releaseSticky && this.ball.releaseSticky()) {
        ev.preventDefault();
        return;
      }
      if (this.ball.hasParkedBall && this.ball.hasParkedBall()) {
        this.ball.launchNow();
        ev.preventDefault();
        return;
      }
    }
    if (adx >= threshold && dt < 400) {
      var dir = (dx > 0) ? 1 : -1;
      this.paddle.moving = dir;
      const self = this;
      setTimeout(function () {
        if (self.paddle.moving === dir) self.paddle.moving = 0;
      }, 180);
      ev.preventDefault();
    }
  },
  onmousemove: function (ev) {
    let x = ev.pageX - this.runner.bounds.left - this.paddle.w / 2;
    this.paddle.place(x);
  },
  //=============================================================================
  // Powerups (falling drops + Tripleball + Sticky + Confused)
  //=============================================================================
  Powerups: {
    sizeScale: 1.2,
    DURATION_MS: 10000,
    initialize: function (game, cfg, ball, paddle, score) {
      this.game = game;
      this.cfg = cfg;
      this.ball = ball;
      this.paddle = paddle;
      this.score = score;
      this.drops = [];
      this.icons = {
        Score: '💰',
        Big: '🠝',
        Small: '🠟',
        OneUp: '♥',
        Fire: '🔥',
        Triple: '3',
        BPlus: '➕',
        BMinus: '➖',
        Fast: '⏩',
        Slow: '⏪',
        Sticky: '🍯',
        Swap: '꩜',
        Lasers: '🔫',
        Split: '2',
        Chaos: '✴',
        Exploding: '💣',
        Floor: '❑',
        Frozen: '🧊',
        LightsOut: '💡',
        Ghost: '👻',
        Magnet: '🧲',
        Reset: '↺',
        TimeAid: '🕛',
        Orbitals: '🛰️',
        Lightning: '🌩️',
        XFactor: '⛌',
        TrickShot: '🖱️',
        PowerSmash: '💥',
      };
      this.fireUntil = 0;
      this.stickyUntil = 0;
      this.confusedUntil = 0;
      this.lasersUntil = 0;
      this.splitUntil = 0;
      this.chaosUntil = 0;
      this.lightsUntil = 0;
      this.floorUntil = 0;
      this.smallUntil = 0;
      this.slowUntil = 0;
      this.explodingUntil = 0;
      this.ghostUntil = 0;
      this.magnetUntil = 0;
      this.orbitalsUntil = 0;
      this.lightningUntil = 0;
      this.xFactorUntil = 0;
      this.trickShotUntil = 0;
      this.powerSmashUntil = 0;
    },
    isFireActive: function () {
      return Date.now() < (this.fireUntil || 0);
    },
    isStickyActive: function () {
      return Date.now() < (this.stickyUntil || 0);
    },
    isConfusedActive: function () {
      return Date.now() < (this.confusedUntil || 0);
    },
    isFloorActive: function () {
      return Date.now() < (this.floorUntil || 0);
    },
    isLasersActive: function () {
      return Date.now() < (this.lasersUntil || 0);
    },
    isSplitActive: function () {
      return Date.now() < (this.splitUntil || 0);
    },
    isChaosActive: function () {
      return Date.now() < (this.chaosUntil || 0);
    },
    isLightsActive: function () {
      return Date.now() < (this.lightsUntil || 0);
    },
    isSmallActive: function () {
      return Date.now() < (this.smallUntil || 0);
    },
    isSlowActive: function () {
      return Date.now() < (this.slowUntil || 0);
    },
    isFrozenActive: function () {
      return Date.now() < (this.frozenUntil || 0);
    },
    isExplodingActive: function () {
      return Date.now() < (this.explodingUntil || 0);
    },
    isGhostActive: function () {
      return Date.now() < (this.ghostUntil || 0);
    },
    isMagnetActive: function () {
      return Date.now() < (this.magnetUntil || 0);
    },
    isOrbitalsActive: function () {
      return Date.now() < (this.orbitalsUntil || 0);
    },
    isLightningActive: function () {
      return Date.now() < (this.lightningUntil || 0);
    },
    isXFactorActive: function () {
      return Date.now() < (this.xFactorUntil || 0);
    },
    isTrickShotActive: function () {
      return Date.now() < (this.trickShotUntil || 0);
    },
    isPowerSmashActive: function () {
      return Date.now() < (this.powerSmashUntil || 0);
    },
    resetPowerups: function () {
      this.drops = [];
      Breakout.Defaults.paddle.width = Breakout.Defaults.paddle.defaultWidth;
      this.paddle.reset();
      this.paddle.setpos((this.game.width / 2) - Breakout.Defaults.paddle.width, this.paddle.y);
      this.ball.resetTemporaryMods();
      this.ball.setFire(false);
      this.fireUntil = 0;
      this.stickyUntil = 0;
      this.confusedUntil = 0;
      this.lasersUntil = 0;
      this.splitUntil = 0;
      this.chaosUntil = 0;
      this.smallUntil = 0;
      this.slowUntil = 0;
      this.floorUntil = 0;
      this.explodingUntil = 0;
      this.ghostUntil = 0;
      this.magnetUntil = 0;
      this.orbitalsUntil = 0;
      this.lightningUntil = 0;
      this.xFactorUntil = 0;
      this.trickShotUntil = 0;
      this.powerSmashUntil = 0;
      this.spikes = null;
      this.ball.setSticky(false);
      if (this.endGame && this.endGame.mode === 'sudden') {
        this.paddle.smoothResizeTo(this.paddleBaseW || 96, 90);
        // restart the sudden ramp from the beginning
        if (!this.sudden) this.sudden = {};
        this.sudden.t = 0;

        // ensure actual sizes are reset immediately so the ramp is visible:
        if (this.paddle) this.paddle.w = Breakout.Defaults.paddle.defaultWidth;
        if (this.ball && this.ball.balls) {
          var base = Breakout.Defaults.ball.defaultSpeed * this.court.chunk;
          for (let i = 0; i < this.ball.balls.length; i++) {
            var b = this.ball.balls[i];
            if (!b) continue;
            var v = Math.sqrt(b.dx * b.dx + b.dy * b.dy) || 1;
            var scale = base / v;
            b.dx *= scale;
            b.dy *= scale;
          }
        }
      }
      var el = $('powerups');
      if (el) el.innerHTML = "";
    },
    softResetEffects: function () {
      // Do not clear existing drops; just clear active effect timers and restore sizes
      Breakout.Defaults.paddle.width = Breakout.Defaults.paddle.defaultWidth;
      if (this.paddle && this.paddle.reset) this.paddle.reset();
      if (this.ball && this.ball.resetTemporaryMods) this.ball.resetTemporaryMods();
      var props = ['fireUntil', 'stickyUntil', 'confusedUntil', 'lasersUntil', 'splitUntil', 'chaosUntil', 'smallUntil', 'slowUntil', 'floorUntil', 'explodingUntil', 'ghostUntil', 'lightsUntil', 'frozenUntil', 'magnetUntil', 'portalsUntil', 'orbitalsUntil', 'lightningUntil', 'xFactorUntil', 'powerSmashUntil'];
      for (let i = 0; i < props.length; i++) {
        if (typeof this[props[i]] !== 'undefined') this[props[i]] = 0;
      }
      // Explicit flags
      if (this.ball) {
        this.ball.fire = false;
      }
    },
    rollForPowerup: function (brick) {
      if (Math.round(Game.randomInt(Breakout.Defaults.powerup.droprate.low, Breakout.Defaults.powerup.droprate.high)) ==
        Breakout.Defaults.powerup.droprate.goal) {
        this.spawnDrop(brick);
      }
    },
    spawnDrop: function (brick) {
      let centerX = brick.x + brick.w / 2;
      let centerY = brick.y + brick.h / 2;
      let types = ['Score100', 'Score250', 'Score500', 'Score750', 'Score1000', 'BigPaddle', 'SmallPaddle', 'ExtraLife', 'Fireball', 'Tripleball', 'BigBall', 'SmallBall', 'FastBall', 'SlowBall', 'StickyPaddle', 'Confused', 'Lasers', 'SplitPaddle', 'Chaos', 'Exploding', 'Floor', 'Frozen', 'LightsOut', 'Ghost', 'Magnet', 'Reset', 'Time-Add', 'Orbitals', 'Lightning', 'XFactor', 'PowerSmash'];
      let type = types[Math.floor(Math.random() * types.length)];
      this.drops.push({
        type: type,
        x: centerX,
        y: centerY,
        w: this.game.court.chunk * 0.9,
        h: this.game.court.chunk * 0.9,
        vy: this.game.court.chunk * 0.22
      });
    },
    update: function (dt) {
      var ghostIdle = (this.game && this.game.powerup && this.game.powerup.isGhostActive && this.game.powerup.isGhostActive() && !this.game.paddle.isMoving());
      if (this.current) {
        this.timer -= dt;
        if (this.timer <= 0) {
          // If Trick Shot ends, ensure we reset any cursor styling
          if (this.current === 'TrickShot') {
            document.body.style.cursor = 'default';
          }
          this.current = null;
          this.game.paddle.resetTemporaryMods && this.game.paddle.resetTemporaryMods();
          this.game.ball.resetTemporaryMods && this.game.ball.resetTemporaryMods();
        }
      }
      // Keep drops falling even when Ghost is active and paddle is idle
      if (ghostIdle) {
        for (let i = this.drops.length - 1; i >= 0; i--) {
          var d = this.drops[i];
          d.y += d.vy;
          if (d.x - d.w / 2 < this.paddle.right && d.x + d.w / 2 > this.paddle.left &&
            d.y - d.h / 2 < this.paddle.bottom && d.y + d.h / 2 > this.paddle.top) {
            this.apply(d.type);
            this.drops.splice(i, 1);
          }
        }
      }

      if (!ghostIdle) {
        // auto-expire sticky flag on the ball
        if (!this.isStickyActive()) this.ball.setSticky(false);
        for (let i = this.drops.length - 1; i >= 0; i--) {
          var d = this.drops[i];
          d.y += d.vy;
          // Magnet effect: gently pull drops toward paddle center when active
          if (this.isMagnetActive && this.isMagnetActive()) {
            var px = (this.paddle.left + this.paddle.right) * 0.5;
            var py = this.paddle.top;
            var ax = px - d.x;
            var ay = py - d.y;
            var dist = Math.sqrt(ax * ax + ay * ay) || 1;
            // Strength scales with proximity; cap to avoid teleporting
            var pull = Math.min(0.06, 0.9 / Math.max(150, dist)); // tuned
            d.x += ax * pull;
            d.y += ay * (pull * 0.6); // bias less on Y so it doesn't overshoot
          }
          if (d.x - d.w / 2 < this.paddle.right && d.x + d.w / 2 > this.paddle.left &&
            d.y - d.h / 2 < this.paddle.bottom && d.y + d.h / 2 > this.paddle.top) {
            this.apply(d.type);
            this.drops.splice(i, 1);
          } else if (d.y - d.h / 2 > this.game.height) {
            this.drops.splice(i, 1);
          }
        }
        // auto-expire Small/Slow ball penalties after 10s
        (function () {
          var now = Date.now();
          if (this.smallUntil && now >= this.smallUntil) {
            this.smallUntil = 0;
            if (this.ball && this.ball.temp && this.ball.temp.size < 1) {
              this.ball.temp.size = 1;
              if (this.ball.resize) this.ball.resize();
              var el = $('powerups');
              if (el && el.innerHTML === 'Small Puny Ball') el.innerHTML = '';
            }
          }
          if (this.slowUntil && now >= this.slowUntil) {
            this.slowUntil = 0;
            if (this.ball && this.ball.temp && this.ball.temp.speed < 1) {
              this.ball.temp.speed = 1;
              if (this.ball.resize) this.ball.resize();
              var el2 = $('powerups');
              if (el2 && el2.innerHTML === 'Slow Weak Ball') el2.innerHTML = '';
            }
          }
        }).call(this);
      }
    },
    draw: function (ctx) {
      ctx.save();
      for (let i = 0; i < this.drops.length; i++) {
        var d = this.drops[i];

        // Default visuals
        var fill = '#7efc7e',
          glyph = '?',
          tcolor = '#063';

        // Define colors and icons
        switch (d.type) {
        case 'Score100':
          fill = '#FFD54F';
          glyph = this.icons.Score;
          tcolor = '#000';
          break;
        case 'Score250':
          fill = '#FFD53F';
          glyph = this.icons.Score;
          tcolor = '#000';
          break;
        case 'Score500':
          fill = '#FFD52F';
          glyph = this.icons.Score;
          tcolor = '#000';
          break;
        case 'Score750':
          fill = '#FFD51F';
          glyph = this.icons.Score;
          tcolor = '#000';
          break;
        case 'Score1000':
          fill = '#FFD50F';
          glyph = this.icons.Score;
          tcolor = '#000';
          break;

        case 'BigPaddle':
          fill = '#7efc7e';
          glyph = this.icons.Big;
          break;
        case 'SmallPaddle':
          fill = '#1e88e5';
          glyph = this.icons.Small;
          tcolor = '#fff';
          break; // Bad
        case 'ExtraLife':
          fill = '#FFC0CB';
          glyph = this.icons.OneUp;
          tcolor = '#FF0000';
          break;
        case 'Fireball':
          fill = '#FFFF00';
          glyph = this.icons.Fire;
          tcolor = '#FF0000';
          break;
        case 'Tripleball':
          fill = '#C0C0C0';
          glyph = this.icons.Triple;
          tcolor = '#FF0000';
          break;
        case 'BigBall':
          fill = '#1e88e5';
          glyph = this.icons.BPlus;
          break;
        case 'SmallBall':
          fill = '#C0C0C0';
          glyph = this.icons.BMinus;
          tcolor = '#1e88e5';
          break; // Bad
        case 'FastBall':
          fill = '#e53935';
          glyph = this.icons.Fast;
          tcolor = '#fff';
          break;
        case 'SlowBall':
          fill = '#1e88e5';
          glyph = this.icons.Slow;
          tcolor = '#fff';
          break; // Bad

        case 'StickyPaddle':
          fill = '#ffffff';
          glyph = this.icons.Sticky;
          tcolor = '#000';
          break;
        case 'Confused':
          fill = '#7e57c2';
          glyph = this.icons.Swap;
          tcolor = '#fff';
          break; // Bad
        case 'Lasers':
          fill = '#ffeb3b';
          glyph = this.icons.Lasers;
          tcolor = '#5c3';
          break;
        case 'SplitPaddle':
          fill = '#ffa726';
          glyph = this.icons.Split;
          tcolor = '#000';
          break;
        case 'Chaos':
          fill = '#ec407a';
          glyph = this.icons.Chaos;
          tcolor = '#fff';
          break; // Bad
        case 'Exploding':
          fill = '#ff7a00';
          glyph = this.icons.Exploding;
          tcolor = '#fff';
          break; // Bad
        case 'Floor':
          fill = '#964B00';
          glyph = this.icons.Floor;
          tcolor = '#fff';
          break;

        case 'Frozen':
          fill = '#6ad8ff';
          glyph = this.icons.Frozen;
          tcolor = '#fff';
          break; // Bad
        case 'LightsOut':
          fill = '#3b3b3b';
          glyph = this.icons.LightsOut;
          tcolor = '#fff';
          break; // Bad
        case 'Ghost':
          fill = '#818589';
          glyph = this.icons.Ghost;
          tcolor = '#000';
          break; // Bad

        case 'Magnet':
          fill = '#fff';
          glyph = this.icons.Magnet;
          break;
        case 'Orbitals':
          fill = '#7393B3';
          glyph = this.icons.Orbitals;
          break;
        case 'Lightning':
          fill = '#00FFFF';
          glyph = this.icons.Lightning;
          tcolor = '#000';
          break;
        case 'Reset':
          fill = '#fff';
          glyph = this.icons.Reset;
          break;
        case 'Time-Add':
          fill = '#7efc7e';
          glyph = this.icons.TimeAid;
          break;
        case 'XFactor':
          fill = '#FF00FF';
          glyph = '⛌';
          tcolor = '#FFF';
          break;
        case 'TrickShot':
          fill = '#76FF03';
          glyph = '🖱️';
          tcolor = '#000';
          break;
        case 'PowerSmash':
          fill = '#76FF03';
          glyph = '💥';
          tcolor = '#000';
          break;
        }

        // Determine if this is a "Bad" pickup for red glow
        var isBad = this.isBadPowerup(d.type);

        // Draw the unified 3D object
        this.draw3DDrop(ctx, d, fill, glyph, tcolor, isBad);
      }
      ctx.restore();
    },

    // --- NEW HELPER: Identify Bad Pickups ---
    isBadPowerup: function (type) {
      var bads = [
        'SmallPaddle', 'SmallBall', 'SlowBall', 'Confused', 'SplitPaddle', 'Chaos', 'Frozen', 'LightsOut', 'Ghost'
      ];
      return (bads.indexOf(type) >= 0);
    },

    // --- NEW HELPER: Draw 3D Capsule with Glow ---
    draw3DDrop: function (ctx, d, color, glyph, tcolor, isBad) {
      var sc = this.sizeScale || 1;
      const w = (d.w || 20) * sc;
      var h = (d.h || 14) * sc;
      let x = (d.x || 0) - w / 2;
      var y = (d.y || 0) - h / 2;
      var r = h * 0.5; // Full rounded sides (capsule)

      ctx.save();

      // 1. Glow / Shadow Layer
      // We use shadowBlur to create the glow, colored Red (bad) or Green (good)
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4; // Slight drop shadow for depth

      if (isBad) {
        ctx.shadowColor = 'rgba(255, 0, 0, 0.9)'; // Strong Red Glow
      } else {
        ctx.shadowColor = 'rgba(0, 255, 0, 0.6)'; // Subtle Green Glow
      }

      // Draw base shape to cast the shadow
      ctx.fillStyle = color;
      this.traceRoundedRect(ctx, x, y, w, h, r);
      ctx.fill();
      ctx.restore();

      // 2. Main Body Gradient (Top-down lighting)
      var gBody = ctx.createLinearGradient(x, y, x, y + h);
      gBody.addColorStop(0.0, 'rgba(255,255,255,0.4)'); // Highlight at top
      gBody.addColorStop(0.5, color); // Base color
      gBody.addColorStop(1.0, 'rgba(0,0,0,0.3)'); // Shadow at bottom

      ctx.fillStyle = gBody;
      this.traceRoundedRect(ctx, x, y, w, h, r);
      ctx.fill();

      // 3. Specular Highlight (The glossy shine on top)
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      var hlW = w * 0.7;
      var hlH = h * 0.3;
      this.traceRoundedRect(ctx, x + (w - hlW) / 2, y + 2, hlW, hlH, hlH);
      ctx.fill();
      ctx.restore();

      // 4. Icon / Glyph
      if (glyph) {
        ctx.fillStyle = tcolor || '#000';
        ctx.font = 'bold ' + Math.floor(h * 0.7) + 'px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Draw text
        ctx.fillText(glyph, x + w / 2, y + h / 2 + 1);
      }

      // 5. Outline (Definition)
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      this.traceRoundedRect(ctx, x, y, w, h, r);
      ctx.stroke();

      ctx.restore();
    },

    // --- NEW HELPER: Path Tracer ---
    traceRoundedRect: function (ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    },
    resetPaddleSize: function () {
      this._didResize = false;
      this.paddle.smoothResizeTo(this.paddleBaseW || 96, 180);
    },
    apply: function (type) {
      if (this.game && this.game.playSound) this.game.playSound('powerup');
      var msg = '';
      switch (type) {
      case 'Score100':
        if (this.score && this.score.increase) this.score.increase(100);
        msg = '💰 100 points. Okay, I guess.';
        break;
      case 'Score250':
        if (this.score && this.score.increase) this.score.increase(250);
        msg = '💰 250 points. Nice.';
        break;
      case 'Score500':
        if (this.score && this.score.increase) this.score.increase(500);
        msg = '💰 500 points. Sweet.';
        break;
      case 'Score750':
        if (this.score && this.score.increase) this.score.increase(750);
        msg = '💰 750 points. Cha-ching!';
        break;
      case 'Score1000':
        if (this.score && this.score.increase) this.score.increase(1000);
        msg = '💰 1000 points. That\'s what I am talking about!!';
        break;
      case 'BigPaddle':
        if (Breakout.Defaults.paddle.width <= Breakout.Defaults.paddle.defaultWidth) {
          this._didResize = false;
          var newW = Breakout.Defaults.paddle.defaultWidth * 2;
          Breakout.Defaults.paddle.width = newW;
          if (!this._didResize) {
            this._didResize = true;
            this.paddle.smoothResizeTo(Math.max(36, this.paddle.w * 2.0), 220);
          }
        }
        msg = '🠝 Big Paddle Impresses the Ladies';
        break;
      case 'SmallPaddle':
        if (Breakout.Defaults.paddle.width >= Breakout.Defaults.paddle.defaultWidth) {
          this._didResize = false;
          var newW = Breakout.Defaults.paddle.defaultWidth / 2;
          Breakout.Defaults.paddle.width = newW;
          if (!this._didResize) {
            this._didResize = true;
            this.paddle.smoothResizeTo(Math.max(36, this.paddle.w * 0.5), 220);
          }
        }
        msg = '🠟 Small Paddle Nothing to be Ashamed Of';
        break;
      case 'ExtraLife':
        this.score.gainLife();
        msg = '♥ 1UP, but where is Mario?';
        break;
      case 'Fireball':
        this.ball.setFire(true);
        this.fireUntil = Date.now() + this.DURATION_MS; // NEW: timed fireball
        msg = '🔥 Fireball Melts Steel Blocks';
        break;
      case 'Tripleball':
        this.ball.triple();
        msg = '×3 Balls, unlike Lance Armstrong';
        break;
      case 'BigBall':
        this.ball.grow();
        msg = '🠝 Big Strong Ball';
        break;
      case 'SmallBall':
        this.ball.shrink();
        this.smallUntil = Date.now() + 10000;
        msg = '🠟 Small Puny Ball';
        break;
      case 'FastBall':
        this.ball.fast();
        msg = '⏩ Fast Mighty Ball';
        break;
      case 'SlowBall':
        this.ball.slow();
        this.slowUntil = Date.now() + 10000;
        msg = '⏪ Slow Weak Ball';
        break;
      case 'StickyPaddle':
        this.stickyUntil = Date.now() + this.DURATION_MS;
        this.ball.setSticky(true);
        msg = '🍯 Sticky Paddle. I\'m not touching that one.';
        break;
      case 'Confused':
        if (this.playSound) this.playSound('confused');
        this.confusedUntil = Date.now() + this.DURATION_MS;
        msg = '꩜ Dazed and Confused!';
        break;
      case 'Lasers':
        this.lasersUntil = Date.now() + 3000;
        msg = '🔫 Sharks with Laser Beams';
        break;
      case 'SplitPaddle':
        this.splitUntil = Date.now() + this.DURATION_MS;
        msg = '2 Split Paddle. Well there is your problem!';
        break;
      case 'Chaos':
        this.chaosUntil = Date.now() + this.DURATION_MS;
        msg = '✴ Chaos! Just like my life!';
        break;
      case 'Exploding':
        this.explodingUntil = Date.now() + 5000; // 5 seconds
        this.game.showLabel && this.game.showLabel('💣 Exploding Balls! That sounds painful.', '#ff7a00');
        // Optional: give the balls a quick cosmetic flash
        if (this.game.ball && this.game.ball.setExplodingVisual)
          this.game.ball.setExplodingVisual(true, this.explodingUntil);
        break;
      case 'Floor':
        this.floorUntil = Date.now() + 5000;
        if (this.game && this.game.messages) this.game.messages.add("❑ Floor! Walk all over me!", 1.0);
        break;
      case 'Frozen':
        this.frozenUntil = Date.now() + 5000;
        if (this.paddle && this.paddle.setFrozen) this.paddle.setFrozen(true);
        this.game && this.game.messages && this.game.messages.add('🧊 Frozen Paddle - That\'s Ice Cold!', 2);
        break;
      case 'LightsOut':
        this.lightsUntil = Date.now() + 5000;
        this.game && this.game.messages && this.game.messages.add('💡 Who is afraid of the dark?', 2);
        break;
      case 'Ghost':
        this.ghostUntil = Date.now() + this.DURATION_MS;
        if (this.playSound) this.playSound('ghost');
        msg = '👻 You just got ghosted by a game. Damn.';
        break;
      case 'Magnet':
        this.magnetUntil = Date.now() + this.DURATION_MS;
        msg = '🧲 Magnet: Gotta Catch \'em All!';
        break;
      case 'Orbitals':
        this.orbitalsUntil = Date.now() + this.DURATION_MS;
        msg = '🛰️ Orbitals - They are mooning you.';
        break;
      case 'Lightning':
        this.lightningUntil = Date.now() + this.DURATION_MS;
        msg = '🌩️ Lightning - Feel the power of Thor!';
        break;
      case 'XFactor':
        this.xFactorUntil = Date.now() + this.DURATION_MS;
        msg = '⛌ X-Factor - Destroy bricks in X shape';
        break;
      case 'TrickShot':
        this.trickShotUntil = Date.now() + this.DURATION_MS;
        msg = '🖱️ Trick Shot - aim with mouse and click';
        break;
      case 'PowerSmash':
        this.powerSmashUntil = Date.now() + this.DURATION_MS;
        if (this.paddle) this.paddle.smashCooldown = 0.5;
        msg = '💥 Power Smash - Press space to launch with force';
        break;
      case 'Reset':
        if (this.softResetEffects) {
          this.softResetEffects();
        } else if (this.resetPowerups) {
          this.resetPowerups();
        }
        msg = '↺ Reset: all effects cleared';
        break;
      case 'Time-Add':
        (function (self) {
          var now = Date.now(),
            add = 7000;
          var props = ['fireUntil', 'stickyUntil', 'confusedUntil', 'lasersUntil', 'splitUntil', 'chaosUntil', 'smallUntil', 'slowUntil', 'floorUntil', 'explodingUntil', 'ghostUntil', 'lightsUntil', 'frozenUntil', 'magnetUntil', 'portalsUntil', 'orbitalsUntil', 'lightningUntil', 'xFactorUntil', 'powerSmashUntil'];
          for (let i = 0; i < props.length; i++) {
            var k = props[i];
            if (typeof self[k] === 'number' && self[k] > now) self[k] += add;
          }
        })(this);
        msg = '🕛 All active timers extended. If it lasts more than 4 hours, seek medical...';
        this.game && this.game.playSound && this.game.playSound('powerup');
        break;
      }
      var el = $('powerups');
      if (el) el.innerHTML = msg;
    },
    drawDropSkin: function (ctx, d) {
      if (!d) return;
      const w = d.w || Math.max(16, this.game.court ? Math.floor(this.game.court.chunk * 1.1) : 20);
      var h = d.h || Math.max(12, this.game.court ? Math.floor(this.game.court.chunk * 0.9) : 14);
      let x = (d.x || 0) - w / 2,
        y = (d.y || 0) - h / 2;
      var r = Math.max(4, Math.min(h * 0.5, (this.game.court ? Math.floor(this.game.court.chunk * 0.45) : 8)));

      // soft shadow
      ctx.save();
      var sy = y + h + 2;
      var sh = Math.max(3, (this.game.court ? Math.floor(this.game.court.chunk * 0.35) : 5));
      var grad = ctx.createLinearGradient(x, sy, x, sy + sh);
      grad.addColorStop(0, 'rgba(0,0,0,0.28)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = grad;
      ctx.fillRect(x + r * 0.5, sy, w - r, sh);
      ctx.restore();

      // rounded rect + gloss
      ctx.save();
      (function roundedRect() {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.clip();
      })();

      var base = d.color || '#3A9AD9';
      var g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0.00, 'rgba(255,255,255,0.28)');
      g.addColorStop(0.42, base);
      g.addColorStop(1.00, 'rgba(0,0,0,0.28)');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);

      ctx.globalCompositeOperation = 'lighter';
      var band = ctx.createLinearGradient(x, y + h * 0.35, x, y + h * 0.65);
      band.addColorStop(0.00, 'rgba(255,255,255,0.00)');
      band.addColorStop(0.50, 'rgba(255,255,255,0.22)');
      band.addColorStop(1.00, 'rgba(255,255,255,0.00)');
      ctx.fillStyle = band;
      ctx.fillRect(x, y, w, h);
      ctx.restore();

      // rim
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },
    // Render a glossy badge bezel behind the power-up icon, with beat-synced sparkle
    drawDropBadge: function (ctx, d) {
      if (!d) return;
      var sc = (this.sizeScale || 1);
      const w = (d.w || 20) * sc;
      var h = (d.h || 14) * sc;
      let x = (d.x || 0) - w / 2;
      var y = (d.y || 0) - h / 2;
      var r = Math.max(4, Math.min(h * 0.5, Math.floor((this.game && this.game.court ? this.game.court.chunk : 16) * 0.45)));

      // Soft drop shadow
      ctx.save();
      var sy = y + h + 2;
      var sh = Math.max(3, Math.floor((this.game && this.game.court ? this.game.court.chunk : 16) * 0.35));
      var gradS = ctx.createLinearGradient(x, sy, x, sy + sh);
      gradS.addColorStop(0, 'rgba(0,0,0,0.26)');
      gradS.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = gradS;
      ctx.fillRect(x + r * 0.5, sy, w - r, sh);
      ctx.restore();

      // Rounded badge clip
      ctx.save();
      (function rounded() {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.clip();
      })();

      // Body gradient (base color if provided)
      var base = d.color || '#3A9AD9';
      var g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0.00, 'rgba(255,255,255,0.25)');
      g.addColorStop(0.40, base);
      g.addColorStop(1.00, 'rgba(0,0,0,0.28)');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);

      // Inner shadow (top rim)
      ctx.globalCompositeOperation = 'multiply';
      var inner = ctx.createLinearGradient(x, y, x, y + h * 0.45);
      inner.addColorStop(0.00, 'rgba(0,0,0,0.22)');
      inner.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.fillStyle = inner;
      ctx.fillRect(x, y, w, h * 0.45);

      // Gloss band
      ctx.globalCompositeOperation = 'lighter';
      var band = ctx.createLinearGradient(x, y + h * 0.35, x, y + h * 0.65);
      band.addColorStop(0.00, 'rgba(255,255,255,0.00)');
      band.addColorStop(0.50, 'rgba(255,255,255,0.20)');
      band.addColorStop(1.00, 'rgba(255,255,255,0.00)');
      ctx.fillStyle = band;
      ctx.fillRect(x, y, w, h);

      // Beat-synced sparkle sweep (left -> right over ~250ms after beat)
      var game = this.game || (this && this.game);
      var since = (game && game.beat) ? Math.max(0, (game.beat.t - game.beat.last)) : ((game && game.t) ? (game.t % 0.25) : 0);
      var dur = 0.25; // 250ms
      var u = Math.min(1, since / dur);
      if (u > 0 && u < 1) {
        var x0 = x + w * (u - 0.20);
        var x1 = x + w * (u + 0.20);
        var sg = ctx.createLinearGradient(x0, 0, x1, 0);
        sg.addColorStop(0.00, 'rgba(255,255,255,0.00)');
        sg.addColorStop(0.50, 'rgba(255,255,255,0.30)');
        sg.addColorStop(1.00, 'rgba(255,255,255,0.00)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = sg;
        ctx.fillRect(x, y, w, h);
      }

      ctx.restore(); // end clip

      // Rim stroke
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },
    endChaos: function () {
      this.chaosUntil = 0; // Kill timer
    },
  },
  //=============================================================================
  // Score
  //=============================================================================
  Score: {
    initialize: function (game, cfg) {
      this.game = game;
      this.cfg = cfg;
      this.load();
      this.reset();
    },
    reset: function () {
      this.set(0);
      this.resetLives();
    },
    set: function (n) {
      this.score = this.vscore = n;
      this.rerender = true;
    },
    increase: function (n) {
      this.score = this.score + n;
      this.rerender = true;
    },
    format: function (n) {
      return ("0000000" + n).slice(-7);
    },
    load: function () {
      this.highscore = this.game.storage.highscore ? parseInt(this.game.storage.highscore) : 1337;
    },
    save: function () {
      if (this.score > this.highscore) this.game.storage.highscore = this.highscore = this.score;
    },
    resetLives: function () {
      this.setLives(this.cfg.lives.initial);
    },
    setLives: function (n) {
      this.lives = n;
      this.rerender = true;
    },
    gainLife: function () {
      this.setLives(Math.min(this.cfg.lives.max, this.lives + 1));
    },
    loseLife: function () {
      this.setLives(this.lives - 1);
      return (this.lives == 0);
    },
    update: function (dt) {
      if (this.vscore < this.score) {
        this.vscore = Math.min(this.score, this.vscore + 10);
        this.rerender = true;
      }
    },
    measure: function (ctx) {
      this.left = this.game.court.left;
      this.top = this.game.court.top - this.game.court.wall.size * 2;
      this.width = this.game.court.width;
      this.height = this.game.court.wall.size * 2;
      this.scorefont = "bold " + Math.max(9, this.game.court.wall.size - 2) + "pt Orbitron, sans-serif";
      this.highfont = "" + Math.max(9, this.game.court.wall.size - 8) + "pt Orbitron, sans-serif";
      ctx.save();
      ctx.font = this.scorefont;
      this.scorewidth = ctx.measureText(this.format(0)).width;
      ctx.font = this.highfont;
      this.highwidth = ctx.measureText("HIGH SCORE: " + this.format(0)).width;
      ctx.restore();
      this.rerender = true;
    },
    draw: function (ctx) {
      if (this.rerender) {
        this.canvas = Game.renderToCanvas(this.width, this.height, this.render.bind(this), this.canvas);
        this.rerender = false;
      }
      ctx.drawImage(this.canvas, this.left, this.top);
    },
    render: function (ctx) {
      var text, width, paddle;
      var ishigh = this.game.is('game') && (this.score > this.highscore);
      ctx.textBaseline = "middle";
      ctx.fillStyle = this.game.color.score;
      ctx.font = this.scorefont;
      text = this.format(this.vscore);
      ctx.fillText(text, 0, this.height / 2);
      ctx.fillStyle = ishigh ? this.game.color.score : this.game.color.highscore;
      text = "HIGH SCORE: " + this.format(ishigh ? this.score : this.highscore);
      ctx.font = this.highfont;
      width = ctx.measureText(text).width;
      ctx.fillText(text, this.width - width, this.height / 2);
      paddle = {
        game: this.game,
        w: this.game.court.chunk * 1.5,
        h: this.game.court.chunk * 2 / 3
      };
      // seed bounds so Paddle.render can draw rounded corners
      paddle.left = 0;
      paddle.top = 0;
      paddle.right = paddle.w;
      paddle.bottom = paddle.h;
      // set fill now because render() does not set it (draw() does)
      ctx.fillStyle = this.game.color.paddle;
      ctx.translate(this.scorewidth + 100, (this.height - paddle.h) / 2);
      for (let n = 0; n < this.lives; n++) {
        this.game.paddle.render.call(paddle, ctx);
        ctx.translate(paddle.w + 5, 0);
      }
    }
  },
  //=============================================================================
  // Court
  //=============================================================================
  Court: {
    brickCache: {},

    initialize: function (game, cfg) {
      this.game = game;
      this.cfg = cfg;
      this.brickCache = {};
      this.bricks = [];
      this.numbricks = 0;
      this.virusTimer = 0;
      this.lightningBolts = [];
      this.xFactorBolts = [];
      // --- DYNAMIC HAZARDS ---
      this.vent = {
        active: false,
        state: 'closed', // closed, warning, open
        x: 0,
        w: 0,
        timer: 0,
        cooldown: 5
      };

      this.pistons = []; // { side:'left'/'right', y, w, h, state, timer }
      this.pistonCooldown = 8;
    },
    update: function (dt) {
      // 1. Animation Logic (Float In)
      for (var i = 0; i < this.bricks.length; i++) {
        var b = this.bricks[i];
        if (b.anim) {
          b.anim.t += dt;
          var u = Math.min(1, b.anim.t / b.anim.dur);
          var e = 1 - Math.pow(1 - u, 3);

          // Update visual position
          b.x = b.anim.x0 + (b.anim.x1 - b.anim.x0) * e;
          b.y = b.anim.y0 + (b.anim.y1 - b.anim.y0) * e;

          // FIX: Synchronize Collision Box immediately
          // This ensures the physics engine knows where the brick is right now
          if (typeof Game !== 'undefined' && Game.Math && Game.Math.bound) {
            Game.Math.bound(b);
          } else {
            // Manual fallback if Game.Math isn't found
            b.left = b.x;
            b.right = b.x + b.w;
            b.top = b.y;
            b.bottom = b.y + b.h;
          }

          if (u >= 1) delete b.anim;
        }
      }

      // 2. Shuffle Logic
      if (this.shuffleActive) {
        if (!this.shuffleTimer) this.shuffleTimer = 0;
        if (!this.shuffleCooldown) this.shuffleCooldown = 0;

        this.shuffleTimer += dt;
        if (this.shuffleCooldown > 0) this.shuffleCooldown -= dt;

        if (this.shuffleTimer > 1.5 && this.shuffleCooldown <= 0) {
          if (this.randomlyRelocateOne()) {
            this.shuffleTimer = 0;
            this.shuffleCooldown = 0.5;
          } else {
            this.shuffleTimer = 1.0;
          }
        }
      }

      // 3. Lightning Bolt Decay
      if (this.lightningBolts.length > 0) {
        for (var i = this.lightningBolts.length - 1; i >= 0; i--) {
          this.lightningBolts[i].life -= dt;
          if (this.lightningBolts[i].life <= 0) this.lightningBolts.splice(i, 1);
        }
      }

      // 4. Virus Logic
      if (this.game.endGame && this.game.endGame.mode === 'virus') {
        var survivors = [];
        var virusActive = false;

        for (var i = 0; i < this.bricks.length; i++) {
          if (!this.bricks[i].hit) {
            survivors.push(this.bricks[i]);
            if (this.bricks[i].isVirus) virusActive = true;
          }
        }

        if (survivors.length > 0 && !virusActive) {
          var patientZero = survivors[Math.floor(Math.random() * survivors.length)];
          this.makeVirus(patientZero);
          if (this.game && this.game.playSound) this.game.playSound('powerup');
        }

        if (virusActive) {
          this.virusTimer += dt;
          if (this.virusTimer > 5.0) {
            this.virusTimer = 0;
            this.spreadVirus();
          }
        }
      }

      // 5. X-Factor Bolt Decay
      if (this.xFactorBolts.length > 0) {
        for (var i = this.xFactorBolts.length - 1; i >= 0; i--) {
          this.xFactorBolts[i].life -= dt;
          if (this.xFactorBolts[i].life <= 0) this.xFactorBolts.splice(i, 1);
        }
      }
      // A. CEILING VENT (Opens to let ball escape)
      this.vent.timer -= dt;
      if (this.vent.state === 'closed') {
        if (this.vent.timer <= 0) {
          // Start Warning
          this.vent.state = 'warning';
          this.vent.timer = 2.0; // 2s warning
          // Pick random spot
          this.vent.w = this.chunk * 4;
          this.vent.x = this.left + Math.random() * (this.width - this.vent.w);
          if (this.game.playSound) this.game.playSound('comeon');
        }
      } else if (this.vent.state === 'warning') {
        if (this.vent.timer <= 0) {
          // OPEN!
          this.vent.state = 'open';
          this.vent.timer = 4.0; // Stay open for 4s
          if (this.game.playSound) this.game.playSound('thaw');
        }
      } else if (this.vent.state === 'open') {
        if (this.vent.timer <= 0) {
          this.vent.state = 'closed';
          this.vent.timer = 10 + Math.random() * 10; // Cooldown
        }
      }

      // B. SIDE PISTONS (Slide out to block)
      if (this.pistonCooldown > 0) this.pistonCooldown -= dt;
      else {
        if (this.pistons.length < 2) {
          var side = Math.random() > 0.5 ? 'left' : 'right';
          // Random Y position (not too close to paddle)
          var py = this.top + 100 + Math.random() * (this.height - 300);

          this.pistons.push({
            side: side,
            y: py,
            w: 0,
            targetW: this.chunk * (2 + Math.random() * 2),
            h: this.chunk * 1.5,
            state: 'extending'
          });
          this.pistonCooldown = 5 + Math.random() * 5;
          if (this.game.playSound) this.game.playSound('bumper');
        }
      }

      // Animate Pistons
      for (var i = this.pistons.length - 1; i >= 0; i--) {
        var p = this.pistons[i];
        var speed = 100; // px per sec

        if (p.state === 'extending') {
          p.w += speed * dt;
          if (p.w >= p.targetW) {
            p.w = p.targetW;
            p.state = 'waiting';
            p.waitTimer = 3.0;
          }
        } else if (p.state === 'waiting') {
          p.waitTimer -= dt;
          if (p.waitTimer <= 0) p.state = 'retracting';
        } else if (p.state === 'retracting') {
          p.w -= speed * dt;
          if (p.w <= 0) {
            this.pistons.splice(i, 1);
          }
        }

        // Calculate bounding box for collision
        p.hH = p.h / 2; // half height
        if (p.side === 'left') {
          p.x = this.left;
          p.bb = { left: p.x, right: p.x + p.w, top: p.y - p.hH, bottom: p.y + p.hH };
        } else {
          p.x = this.right;
          p.bb = { left: p.x - p.w, right: p.x, top: p.y - p.hH, bottom: p.y + p.hH };
        }
      }
    },
    // Trigger Chain Lightning
    triggerLightning: function (sourceBrick) {
      if (!sourceBrick) return;
      if (this.playSound) this.playSound('lightning');

      // 1. Visual Effect (Horizontal Bolt)
      this.lightningBolts.push({
        y: sourceBrick.y + sourceBrick.h / 2,
        life: 0.15, // Lasts 0.15 seconds
        w: this.width
      });

      // 2. Damage Row
      var row = sourceBrick.pos.y;
      var hitCount = 0;

      for (var i = 0; i < this.bricks.length; i++) {
        var b = this.bricks[i];
        // Target neighbors in same row that aren't dead
        if (!b.hit && b !== sourceBrick && b.pos.y === row) {
          // Deal Damage
          if (b.hp > 1) {
            b.hp--;
            b.cracked = true;
          } else {
            this.remove(b);
          }
          if (this.game.requestShake) this.game.requestShake(9, 0.11);
          hitCount++;
        }
      }

      if (hitCount > 0 && this.game.playSound) this.game.playSound('lasers');
    },

    makeVirus: function (brick) {
      if (!brick) return;
      brick.isVirus = true;
      brick.color = '#39FF14';
      brick.score = 500;
      brick.hp = 1;
    },

    spreadVirus: function () {
      var activeViruses = [];
      for (var i = 0; i < this.bricks.length; i++) {
        if (!this.bricks[i].hit && this.bricks[i].isVirus) activeViruses.push(this.bricks[i]);
      }
      if (!activeViruses.length) return;

      var parent = activeViruses[Math.floor(Math.random() * activeViruses.length)];
      var candidates = [];
      var pRow = parent.pos.y,
        pCol1 = parent.pos.x1,
        pCol2 = parent.pos.x2;

      for (var i = 0; i < this.bricks.length; i++) {
        var b = this.bricks[i];
        if (b.hit) {
          var bRow = b.pos.y,
            bCol1 = b.pos.x1,
            bCol2 = b.pos.x2;
          var isAdj = false;
          if (bRow === pRow && (bCol2 === pCol1 - 1 || bCol1 === pCol2 + 1)) isAdj = true;
          if (Math.abs(bRow - pRow) === 1) {
            if (Math.max(pCol1, bCol1) <= Math.min(pCol2, bCol2)) isAdj = true;
          }
          if (isAdj) candidates.push(b);
        }
      }

      if (candidates.length > 0) {
        var target = candidates[Math.floor(Math.random() * candidates.length)];
        target.hit = false;
        this.numhits--;
        this.makeVirus(target);
        if (this.game && this.game.playSound) this.game.playSound('recover');
      }
    },

    // Trigger X-Factor
    triggerXFactor: function (sourceBrick) {
      if (!sourceBrick) return;
      if (this.game.playSound) this.game.playSound('lightning');

      // 1. Visual Effect (4 Diagonal Bolts)
      // We store the center point and draw lines outwards
      this.xFactorBolts.push({
        x: sourceBrick.x + sourceBrick.w / 2,
        y: sourceBrick.y + sourceBrick.h / 2,
        life: 0.25,
        w: this.width // max reach
      });

      // 2. Logic: March outwards in 4 diagonal directions
      // Coordinates are in Grid Space (pos.x, pos.y)
      var cx = sourceBrick.pos.x1; // Use x1 for simplicity
      var cy = sourceBrick.pos.y;
      var range = 20; // How far the X extends

      var hitCount = 0;

      // Directions: TL, TR, BL, BR
      var dirs = [{
        x: -1,
        y: -1
      }, {
        x: 1,
        y: -1
      }, {
        x: -1,
        y: 1
      }, {
        x: 1,
        y: 1
      }];

      for (var d = 0; d < dirs.length; d++) {
        var dir = dirs[d];
        for (var step = 1; step < range; step++) {
          var tx = cx + (dir.x * step);
          var ty = cy + (dir.y * step);

          // Find brick at this grid location
          // (This is an O(N) scan, could be optimized but fine for Breakout)
          for (var i = 0; i < this.bricks.length; i++) {
            var b = this.bricks[i];
            if (!b.hit && b !== sourceBrick && b.pos.y === ty && b.pos.x1 <= tx && b.pos.x2 >= tx) {
              // Hit!
              if (b.hp > 1) {
                b.hp--;
                b.cracked = true;
              } else {
                this.remove(b);
              }

              hitCount++;
              // Stop processing this ray? Optional. 
              // "Penetrating X" is cooler, so we continue.
            }
          }
        }
      }

      if (hitCount > 0) {
        this.game.requestShake(8, 0.1);
      }
    },

    // Directional Smash (Shotgun Effect)
    smashThrough: function (sourceBrick, ball) {
      if (!sourceBrick || !ball) return;

      // 1. Calculate normalized direction vector of the ball
      // (Using ball's current velocity gives us the 'penetration' vector)
      var vLen = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      if (vLen === 0) return;
      var dirX = ball.dx / vLen;
      var dirY = ball.dy / vLen;

      // 2. Cast a ray "through" the source brick
      var currX = sourceBrick.x + sourceBrick.w / 2;
      var currY = sourceBrick.y + sourceBrick.h / 2;

      // Step size roughly equal to chunk size (grid walking)
      var step = this.chunk * 0.8;

      // We want to hit up to 3 bricks BEHIND the source
      var hitsLeft = 3;
      var dist = 0;
      var maxDist = this.chunk * 6; // Limit ray length

      // Visual: Debris Cone at impact
      if (this.game.particles && this.game.particles.spawn) {
        for (var p = 0; p < 12; p++) {
          this.game.particles.spawn({
            kind: 'shard',
            x: currX,
            y: currY,
            vx: dirX * 300 + (Math.random() - 0.5) * 150,
            vy: dirY * 300 + (Math.random() - 0.5) * 150,
            color: '#ffffff',
            life: 0.3,
            size: 3
          });
        }
      }

      // 3. March the ray
      while (hitsLeft > 0 && dist < maxDist) {
        currX += dirX * step;
        currY += dirY * step;
        dist += step;

        // Check collision with any brick
        for (var i = 0; i < this.bricks.length; i++) {
          var b = this.bricks[i];
          // Don't hit the source brick again, or already broken ones
          if (!b.hit && b !== sourceBrick) {
            if (currX >= b.left && currX <= b.right &&
              currY >= b.top && currY <= b.bottom) {

              // DESTROY! (Override damage to ensure 1-hit kill)
              this.game.damageBrick(b, {
                from: 'smash',
                override: 99
              });
              hitsLeft--;

              // Chain explosion visual at this brick
              if (this.game.particles && this.game.particles.explode) {
                this.game.particles.explode(b, {
                  dx: dirX,
                  dy: dirY
                });
              }

              // Advance ray slightly to prevent double-hitting the same brick
              dist += step * 0.5;
              currX += dirX * step * 0.5;
              currY += dirY * step * 0.5;

              break;
            }
          }
        }
      }

      if (this.game.requestShake) this.game.requestShake(15, 0.2);
    },

    reset: function (level) {
      this.lightningBolts = [];
      this.xFactorBolts = [];
      this.pistons = [];
      this.vent = { active: false, state: 'closed', timer: 5, x: 0, w: 0 };
      this.virusTimer = 0;
      var layout = Breakout.Levels[level];
      if (!layout) return;

      var countsLC = {};
      for (var ry = 0; ry < layout.bricks.length; ry++) {
        var row = layout.bricks[ry];
        for (var rx = 0; rx < row.length; rx++) {
          var ch = row[rx];
          if (ch && ch !== ' ') {
            var key = ch.toLowerCase();
            if (layout.colors && layout.colors[key]) countsLC[key] = (countsLC[key] || 0) + 1;
          }
        }
      }
      var pairs = [];
      for (var k in countsLC) pairs.push({
        k: k,
        n: countsLC[k]
      });
      pairs.sort(function (a, b) {
        return a.n - b.n;
      });

      var tough3Key = (pairs.length > 0) ? pairs[0].k : null;
      var tough2Key = (pairs.length > 1) ? pairs[1].k : null;
      this.tough3Key = tough3Key;
      this.tough2Key = tough2Key;

      var line, brick, score, c, nx, ny = Math.min(layout.bricks.length, this.cfg.ychunks);
      this.bricks = [];

      for (var y = 0; y < ny; y++) {
        score = (this.cfg.ychunks - y) * 5;
        line = layout.bricks[y] + " ";
        brick = null;
        nx = Math.min(line.length, this.cfg.xchunks + 1);
        for (var x = 0; x < nx; x++) {
          c = line[x];
          if (brick && (brick.c == c)) brick.pos.x2 = x;
          else if (brick && (brick.c != c)) {
            this.bricks.push(brick);
            brick = null;
          }
          if (!brick && (c != ' ')) {
            brick = {
              isbrick: true,
              hit: false,
              c: c,
              pos: {
                x1: x,
                x2: x,
                y: y
              },
              score: score,
              color: layout.colors[c.toLowerCase()]
            };
            var cl = c.toLowerCase();
            if (this.tough3Key && cl === this.tough3Key) {
              brick.hp = 3;
              brick.cracked = false;
            } else if (this.tough2Key && cl === this.tough2Key) {
              brick.hp = 2;
              brick.cracked = false;
            }
          }
        }
      }
      this.numbricks = this.bricks.length;

      this.rowsMin = Infinity;
      this.rowsMax = -Infinity;
      for (var _i = 0; _i < this.bricks.length; _i++) {
        var _b = this.bricks[_i];
        if (_b && _b.pos && typeof _b.pos.y === 'number') {
          if (_b.pos.y < this.rowsMin) this.rowsMin = _b.pos.y;
          if (_b.pos.y > this.rowsMax) this.rowsMax = _b.pos.y;
        }
      }
      if (!isFinite(this.rowsMin)) this.rowsMin = 0;
      if (!isFinite(this.rowsMax)) this.rowsMax = Math.max(0, this.cfg.ychunks - 1);

      this.shuffleActive = false;
      this.shuffleTimer = 0;
      this.shuffleCooldown = 0;
      this.numhits = 0;
      this.resize();
    },

    resize: function () {
      var availW = this.game.width;
      var availH = this.game.height;
      var padW = 2;
      var padH = 4;

      var chunkW = Math.floor(availW / (this.cfg.xchunks + padW));
      var chunkH = Math.floor(availH / (this.cfg.ychunks + padH));

      this.chunk = Math.min(chunkW, chunkH);
      this.brickCache = {};

      this.width = this.cfg.xchunks * this.chunk;
      this.height = this.cfg.ychunks * this.chunk;
      this.left = Math.floor((availW - this.width) / 2);
      this.top = Math.floor((availH - this.height) / 2);
      this.right = this.left + this.width;
      this.bottom = this.top + this.height;

      this.wall = {};
      this.wall.size = this.chunk;
      this.wall.top = Game.Math.bound({
        x: this.left - this.wall.size,
        y: this.top - this.wall.size * 2,
        w: this.width + this.wall.size * 2,
        h: this.wall.size * 2
      });
      this.wall.left = Game.Math.bound({
        x: this.left - this.wall.size,
        y: this.top - this.wall.size * 2,
        w: this.wall.size,
        h: this.wall.size * 2 + this.height
      });
      this.wall.right = Game.Math.bound({
        x: this.right,
        y: this.top - this.wall.size * 2,
        w: this.wall.size,
        h: this.wall.size * 2 + this.height
      });

      for (var n = 0; n < this.numbricks; n++) {
        var brick = this.bricks[n];
        brick.x = this.left + (brick.pos.x1 * this.chunk);
        brick.y = this.top + (brick.pos.y * this.chunk);
        brick.w = (brick.pos.x2 - brick.pos.x1 + 1) * this.chunk;
        brick.h = this.chunk;
        Game.Math.bound(brick);
      }
      this.rerender = true;
    },

    getCrackSprite: function (w, h, variant) {
      if (!w || !h || w < 1 || h < 1) return null;
      var key = "crack_" + Math.floor(w) + "_" + Math.floor(h) + "_" + variant;
      if (this.brickCache[key]) return this.brickCache[key];

      var cvs = document.createElement('canvas');
      cvs.width = w;
      cvs.height = h;
      var ctx = cvs.getContext('2d');
      var pts = [];
      var variance = Math.min(w, h) * 0.15;

      if (variant === 0) {
        pts.push({
          x: w * 0.15,
          y: h * 0.15
        });
        pts.push({
          x: w * 0.4,
          y: h * 0.35 + (Math.random() - 0.5) * variance
        });
        pts.push({
          x: w * 0.6,
          y: h * 0.65 + (Math.random() - 0.5) * variance
        });
        pts.push({
          x: w * 0.85,
          y: h * 0.85
        });
      } else if (variant === 1) {
        pts.push({
          x: w * 0.85,
          y: h * 0.15
        });
        pts.push({
          x: w * 0.6,
          y: h * 0.35 + (Math.random() - 0.5) * variance
        });
        pts.push({
          x: w * 0.4,
          y: h * 0.65 + (Math.random() - 0.5) * variance
        });
        pts.push({
          x: w * 0.15,
          y: h * 0.85
        });
      } else {
        pts.push({
          x: w * 0.5,
          y: h * 0.1
        });
        pts.push({
          x: w * 0.5 + (Math.random() - 0.5) * variance,
          y: h * 0.4
        });
        pts.push({
          x: w * 0.5 + (Math.random() - 0.5) * variance,
          y: h * 0.7
        });
        pts.push({
          x: w * 0.5,
          y: h * 0.9
        });
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(pts[0].x + 1, pts[0].y + 1);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x + 1, pts[i].y + 1);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 1.0;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();

      this.brickCache[key] = cvs;
      return cvs;
    },

    getBrickSprite: function (color, w, h) {
      if (!w || !h || w < 1 || h < 1) return null;
      var key = color + "_" + Math.floor(w) + "_" + Math.floor(h);
      if (this.brickCache[key]) return this.brickCache[key];

      var cvs = document.createElement('canvas');
      cvs.width = w;
      cvs.height = h;
      var ctx = cvs.getContext('2d');
      var bevel = Math.max(2, Math.floor(h * 0.15));

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w - bevel, bevel);
      ctx.lineTo(bevel, bevel);
      ctx.lineTo(bevel, h - bevel);
      ctx.fill();

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w, 0);
      ctx.lineTo(w - bevel, bevel);
      ctx.lineTo(w - bevel, h - bevel);
      ctx.lineTo(bevel, h - bevel);
      ctx.fill();

      var grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(255,255,255,0.1)');
      grad.addColorStop(1, 'rgba(0,0,0,0.1)');
      ctx.fillStyle = grad;
      ctx.fillRect(bevel, bevel, w - bevel * 2, h - bevel * 2);

      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);

      this.brickCache[key] = cvs;
      return cvs;
    },

    drawBrickShine: function (ctx) {
      if (!this.bricks || !this.bricks.length) return;
      ctx.beginPath();
      for (var i = 0; i < this.bricks.length; i++) {
        var b = this.bricks[i];
        if (!b.hit) ctx.rect(b.x, b.y, b.w, b.h);
      }
      ctx.save();
      ctx.clip();

      var pulse = this.game ? this.game.pulse : 0;
      if (pulse > 0.05) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (pulse * 0.25).toFixed(2) + ')';
        ctx.fillRect(this.left, this.top, this.width, this.height);
      }

      var t = (this.game ? this.game.time : 0) || 0;
      var sheenX = (t * 300) % (this.width * 2 + 200) - 200;
      var g = ctx.createLinearGradient(this.left + sheenX, 0, this.left + sheenX + 150, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.25)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(this.left, this.top, this.width, this.height);
      ctx.restore();
    },

    draw: function (ctx) {
      this.drawWalls(ctx);

      ctx.fillStyle = this.game.color.wall;
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.game.color.border;

      var walls = [this.wall.top, this.wall.left, this.wall.right];
      for (var i = 0; i < walls.length; i++) {
        var w = walls[i];
        if (w) {
          ctx.beginPath();
          ctx.rect(w.x, w.y, w.w, w.h);
          ctx.fill();
          ctx.stroke();
        }
      }

      // 1. Ceiling Vent
      if (this.vent.state !== 'closed' && this.wall.top) {
        ctx.save();
        // The "Hole"
        ctx.fillStyle = '#000'; // Void
        var vx = this.vent.x;
        var vw = this.vent.w;
        var vy = this.wall.top.y;
        var vh = this.wall.top.h;

        ctx.fillRect(vx, vy, vw, vh);

        // Hazard Stripes on edges
        ctx.beginPath();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 4;
        ctx.moveTo(vx, vy + vh);
        ctx.lineTo(vx + vw, vy + vh); // Bottom edge warning
        ctx.stroke();

        // Warning Lights
        if (this.vent.state === 'warning') {
          var blink = (Date.now() % 500) < 250;
          ctx.fillStyle = blink ? 'red' : '#330000';
          ctx.beginPath();
          ctx.arc(vx + 10, vy + vh / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(vx + vw - 10, vy + vh / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Pistons
      ctx.save();
      for (var i = 0; i < this.pistons.length; i++) {
        var p = this.pistons[i];
        // Piston Arm
        ctx.fillStyle = '#555';
        if (p.side === 'left') ctx.fillRect(p.x, p.y - p.hH, p.w, p.h);
        else ctx.fillRect(p.x - p.w, p.y - p.hH, p.w, p.h);

        // Hazard Stripes
        ctx.save();
        ctx.beginPath();
        var px = (p.side === 'left') ? p.x : p.x - p.w;
        ctx.rect(px, p.y - p.hH, p.w, p.h);
        ctx.clip();

        ctx.strokeStyle = '#222';
        ctx.lineWidth = 4;
        for (var k = -20; k < p.w + p.h; k += 10) {
          ctx.beginPath();
          ctx.moveTo(px + k, p.y - p.hH);
          ctx.lineTo(px + k - 10, p.y + p.hH);
          ctx.stroke();
        }
        ctx.restore();

        // Piston Head (Impact Plate)
        ctx.fillStyle = '#888';
        var headW = 6;
        if (p.side === 'left') ctx.fillRect(p.x + p.w - headW, p.y - p.hH - 2, headW, p.h + 4);
        else ctx.fillRect(p.x - p.w, p.y - p.hH - 2, headW, p.h + 4);
      }
      ctx.restore();

      for (var n = 0; n < this.numbricks; n++) {
        var b = this.bricks[n];
        if (!b.hit) {
          var sprite = this.getBrickSprite(b.color, b.w, b.h);
          if (sprite) ctx.drawImage(sprite, b.x, b.y);

          if (b.cracked) {
            var variant = (b.pos.x1 + b.pos.y) % 3;
            var crack = this.getCrackSprite(b.w, b.h, variant);
            if (crack) ctx.drawImage(crack, b.x, b.y);
          }
        }
      }

      if (this.drawBrickShine) this.drawBrickShine(ctx);
      if (this.drawBrickSweep) this.drawBrickSweep(ctx);

      // Draw Lightning Bolts
      if (this.lightningBolts.length > 0) {
        ctx.save();
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#E0FFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var i = 0; i < this.lightningBolts.length; i++) {
          var bolt = this.lightningBolts[i];
          var ly = bolt.y;
          var lx = this.left;
          var segments = 12;
          var segW = this.width / segments;

          ctx.moveTo(lx, ly);
          for (var s = 1; s <= segments; s++) {
            var offset = (Math.random() - 0.5) * 15; // Jagged offset
            ctx.lineTo(lx + s * segW, ly + offset);
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw X-Factor Bolts
      if (this.xFactorBolts.length > 0) {
        ctx.save();
        ctx.shadowColor = '#FF00FF';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#FF80FF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        for (var i = 0; i < this.xFactorBolts.length; i++) {
          var b = this.xFactorBolts[i];
          var cx = b.x;
          var cy = b.y;
          var len = this.width; // Draw off-screen to ensure full coverage

          ctx.globalAlpha = Math.min(1, b.life * 4); // Fade out

          ctx.beginPath();
          // Diagonal 1 (\)
          ctx.moveTo(cx - len, cy - len);
          ctx.lineTo(cx + len, cy + len);
          // Diagonal 2 (/)
          ctx.moveTo(cx + len, cy - len);
          ctx.lineTo(cx - len, cy + len);
          ctx.stroke();
        }
        ctx.restore();
      }
    },

    drawBrickSweep: function (ctx) {
      var g = this.game || null;
      if (!g) return;
      var beatInterval = (g.beat && g.beat.interval) ? g.beat.interval : 0.5;
      var beatIdx = (g.beat && typeof g.beat.t === 'number') ? Math.floor(g.beat.t / beatInterval) : Math.floor(((g.t || 0) / 0.5));
      if ((beatIdx % 4) !== 0) return;

      var since = (g.beat && typeof g.beat.t === 'number' && typeof g.beat.last === 'number') ?
        Math.max(0, g.beat.t - g.beat.last) : ((g.t || 0) % 0.25);
      var dur = 0.25;
      var u = Math.min(1, since / dur);
      if (u <= 0 || u >= 1) return;

      var intensity = 0.06 + 0.06 * Math.max(0, 1 - u);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      ctx.beginPath();
      for (var i = 0; i < this.bricks.length; i++) {
        var b = this.bricks[i];
        if (!b.hit) ctx.rect(b.x, b.y, b.w, b.h);
      }
      ctx.clip();

      var gx = this.left,
        gw = this.width;
      var x0 = gx + gw * (u - 0.22);
      var x1 = gx + gw * (u + 0.22);

      var grad = ctx.createLinearGradient(x0, 0, x1, 0);
      grad.addColorStop(0.00, 'rgba(255,255,255,0.00)');
      grad.addColorStop(0.50, 'rgba(255,255,255,' + intensity + ')');
      grad.addColorStop(1.00, 'rgba(255,255,255,0.00)');

      ctx.fillStyle = grad;
      ctx.fillRect(this.left, this.top, this.width, this.height);
      ctx.restore();
    },

    randomlyRelocateOne: function () {
      var alive = [];
      for (var i = 0; i < this.bricks.length; i++)
        if (!this.bricks[i].hit) alive.push(this.bricks[i]);
      if (!alive.length) return false;
      var brick = alive[(Math.random() * alive.length) | 0];
      var colsWide = Math.max(1, Math.round(brick.w / this.chunk));
      var minRow = Math.max(0, this.rowsMin);
      var maxRow = Math.min(this.cfg.ychunks - 1, this.rowsMax);
      if (Math.random() < 0.15) {
        minRow = Math.max(0, minRow - 1);
        maxRow = Math.min(this.cfg.ychunks - 1, maxRow + 1);
      }
      for (var attempts = 0; attempts < 30; attempts++) {
        var row = (minRow + Math.floor(Math.random() * (maxRow - minRow + 1)));
        var maxCol = this.cfg.xchunks - colsWide;
        if (maxCol < 0) break;
        var col = Math.floor(Math.random() * (maxCol + 1));
        var nx = this.left + col * this.chunk;
        var ny = this.top + row * this.chunk;
        var cand = {
          left: nx,
          top: ny,
          right: nx + brick.w,
          bottom: ny + brick.h
        };
        var ok = true;
        for (var j = 0; j < this.bricks.length; j++) {
          var B = this.bricks[j];
          if (B === brick || B.hit) continue;
          if (cand.left < B.right && cand.right > B.left && cand.top < B.bottom && cand.bottom > B.top) {
            ok = false;
            break;
          }
        }
        if (cand.left < this.left || cand.right > this.right || cand.top < this.top || cand.bottom > this.bottom) ok = false;
        if (!ok) continue;
        brick.anim = {
          x0: brick.x,
          y0: brick.y,
          x1: nx,
          y1: ny,
          t: 0,
          dur: 0.25 + Math.random() * 0.1
        };
        if (brick.pos) {
          brick.pos.x1 = col;
          brick.pos.x2 = col + colsWide - 1;
          brick.pos.y = row;
        }
        this.rerender = true;
        return true;
      }
      return false;
    },

    remove: function (brick) {
      brick.hit = true;
      this.numhits++;
      this.rerender = true;
    },
    empty: function () {
      if (this.numbricks === 0) return false;
      return (this.numhits === this.numbricks);
    },
    drawWalls: function (ctx) {
      if (!this.wall || !this.wall.top) return;
    }
  },
  //=============================================================================
  // Paddle
  //=============================================================================
  Paddle: {
    spriteCache: {},

    initialize: function (game, cfg) {
      this.game = game;
      this.cfg = cfg;
      this.spriteCache = {};
      this.moving = 0;

      // Dash State
      this.dash = {
        active: false,
        timer: 0,
        cooldown: 0,
        dir: 0,
        lastLeftUp: 0,
        lastRightUp: 0
      };

      // Setup reset if court is ready
      if (this.game && this.game.court && this.game.court.width > 0) {
        this.reset(true);
      }

      // --- MOUSE / TOUCH TRIGGER (Direct Listener) ---
      var self = this;

      function tryClickSmash(e) {
        if (self.game && self.game.is('game')) {
          // Optional: Check if we are clicking a UI element (like pause) here if needed
          self.triggerSmash();
        }
      }
      if (typeof window !== 'undefined') {
        // Remove old listeners if any (to prevent duplicates on re-init)
        if (this._smashListener) {
          window.removeEventListener('mousedown', this._smashListener);
          window.removeEventListener('touchstart', this._smashListener);
        }
        this._smashListener = tryClickSmash;
        window.addEventListener('mousedown', tryClickSmash);
        window.addEventListener('touchstart', tryClickSmash, {
          passive: true
        });
      }
    },

    // === 1. GAME LOGIC ===
    setFrozen: function (on) {
      this.frozen = !!on;
      if (on) {
        this.frozenSince = Date.now();
        this.frozenCrack = 0;
      }
    },

    isMoving: function () {
      return !!(this.moving || Math.abs(this.vx || 0) > 0.001 || this.dash.active);
    },

    // --- 1. STATE & RESET ---
    reset: function (forceCenter) {
      if (!this.game.court || !this.game.court.chunk) return;

      this.w = this.cfg.width * this.game.court.chunk;
      this.h = this.cfg.height * this.game.court.chunk;
      this.y = this.game.court.bottom - this.h * 1.5;

      var shouldCenter = forceCenter;
      if (typeof forceCenter === 'undefined') {
        var ballActive = (this.game.ball && (this.game.ball.active || this.game.ball.sticky));
        shouldCenter = !ballActive;
      }

      var startX = this.game.court.left + (this.game.court.width - this.w) / 2;
      if (!shouldCenter && typeof this.x !== 'undefined') {
        startX = this.x;
      }

      this.setpos(startX, this.y);
      this.speed = this.cfg.speed * this.game.court.chunk;
      this.moving = 0;
      this.frozen = false;
      this.frozenSince = 0;
      this.frozenCrack = 0;

      // Smash & Dash Reset
      this.lungeState = 'idle';
      this.recoil = 0;
      this.smashCooldown = 0.5;
      this.dash.active = false;
      this.dash.cooldown = 0;

      this.spriteCache = {};
      this.place(this.x);
    },

    smoothResizeTo: function (newW, durationMs) {
      if (newW === this.w) return;
      this._resize = {
        from: this.w,
        to: Math.max(24, newW | 0),
        t: 0,
        d: Math.max(60, durationMs | 0)
      };
    },

    // --- 2. SMASH TRIGGER ---
    triggerSmash: function () {
      // Must have powerup, be idle, and cooldown expired
      var pup = this.game.powerup;
      if (pup && pup.isPowerSmashActive && pup.isPowerSmashActive()) {
        if (this.lungeState === 'idle' && this.smashCooldown <= 0) {
          this.lungeState = 'lunging';
          this.lungeT = 0;
          if (this.game.playSound) this.game.playSound('jump');
        }
      }
    },

    triggerDash: function (dir) {
      if (this.frozen) return; // Can't dash if frozen
      if (this.dash.active) return;
      if (this.dash.cooldown > 0) return;

      this.dash.active = true;
      this.dash.dir = dir;
      this.dash.timer = 0.15; // Short burst
      this.dash.cooldown = 0.6; // Cooldown

      if (this.game.playSound) this.game.playSound('jump'); // Sound effect
      if (this.game.requestShake) this.game.requestShake(3, 0.1);
    },

    // --- 3. MAIN LOOP ---
    update: function (dt) {
      var pup = this.game.powerup;

      // 1. Synergy: Fire Thaws Ice
      if (pup.isFrozenActive && pup.isFrozenActive() && pup.isFireActive && pup.isFireActive()) {
        pup.frozenUntil = 0;
        this.setFrozen(false);
        if (this.game.playSound) this.game.playSound('thaw');

        if (this.game.particles && this.game.particles.spawn) {
          this.game.particles.spawn({
            kind: 'smoke',
            x: this.x + this.w / 2,
            y: this.top + 15,
            count: 50,
            color: 'rgba(240, 248, 255, 0.6)', // AliceBlue steam
            spread: 4.5,
            vx: 0,
            vy: -80, // Rising fast
            life: 1.5
          });
        }
        if (this.game.floaters && this.game.floaters.spawn) {
          this.game.floaters.spawn(this.x + this.w / 2, this.top - 40, "Fire Thaws Ice!", '#FF5722');
        }
        isFrozen = false;
      }

      // 2. POWER SMASH LOGIC
      if (!this.lungeState) {
        this.lungeState = 'idle';
      }
      if (this.smashCooldown > 0) this.smashCooldown -= dt;

      // Lunge Physics
      var lungeHeight = this.h * 2.0;
      var lungeSpeed = 20.0;

      if (this.lungeState === 'lunging') {
        // Move UP (Negative Recoil)
        this.recoil -= lungeSpeed * dt * 60;
        if (this.recoil <= -lungeHeight) {
          this.recoil = -lungeHeight;
          this.lungeState = 'returning';
        }
      } else if (this.lungeState === 'returning') {
        // Move DOWN (Return to 0)
        this.recoil += (lungeSpeed * 0.5) * dt * 60;
        if (this.recoil >= 0) {
          this.recoil = 0;
          this.lungeState = 'idle';
        }
      } else {
        // Normal hit recoil decay (Only if NOT lunging)
        if (this.recoil > 0.1) this.recoil *= 0.85;
        else if (this.recoil > 0) this.recoil = 0;
      }

      // 3. DASH LOGIC (Overrides normal movement)
      if (this.dash.cooldown > 0) this.dash.cooldown -= dt;

      if (this.dash.active) {
        this.dash.timer -= dt;

        var dashSpeed = this.speed * 4.0; // 4x Speed

        // Check for Confusion
        var dDir = this.dash.dir;
        if (pup.isConfusedActive && pup.isConfusedActive()) dDir = -dDir;

        this.place(this.x + dDir * dashSpeed * dt);

        // Dash Particles (Wind lines)
        if (this.game.particles && this.game.particles.spawn) {
          var pY = this.top + Math.random() * this.h;
          var pX = (dDir > 0) ? this.left : this.right; // Trail behind
          this.game.particles.spawn({
            kind: 'spark',
            x: pX,
            y: pY,
            vx: -dDir * 100, // Move opposite to dash
            vy: (Math.random() - 0.5) * 20,
            count: 1,
            life: 0.2,
            color: 'rgba(255, 255, 255, 0.5)'
          });
        }

        if (this.dash.timer <= 0) {
          this.dash.active = false;
        }
        return; // Skip normal movement inputs while dashing
      }

      // === FROZEN LOGIC ===
      if (pup.isFrozenActive && pup.isFrozenActive()) {
        this.moving = 0;
        var rem = Math.max(0, pup.frozenUntil - Date.now());
        var gone = 5000 - rem;
        this.frozenCrack = Math.max(this.frozenCrack, Math.min(5, Math.floor(gone / 1000)));
      } else if (this.frozen) {
        // Cleanup if we just finished freezing naturally
        this.frozen = false;
        this.frozenCrack = 0;
        if (this.game.requestRipple) {
          this.game.requestRipple(this.x + this.w / 2, this.top, 0.18, 0.14);
        }
        if (this.game.playSound) this.game.playSound('thud');
      }

      // === RESIZE LOGIC ===
      if (this._resize) {
        this._resize.t += (dt * 1000);
        var u = Math.min(1, this._resize.t / this._resize.d);
        var k = 1 - Math.pow(1 - u, 3);
        const cx = this.x + (this.w / 2);
        this.w = (this._resize.from + (this._resize.to - this._resize.from) * k) | 0;
        var newLeft = cx - (this.w / 2);
        this.place(newLeft);
        if (u >= 1) this._resize = null;
      }

      if (!this.paddleBaseW) this.paddleBaseW = this.w;

      // E. MOVEMENT LOGIC 
      var mv = this.moving;
      if (pup.isConfusedActive && pup.isConfusedActive()) mv = -mv;

      // Mouse/Key Movement
      if (this.game.input && (this.game.input.x || this.game.input.x === 0)) {
        var targetX = this.game.input.x - this.w / 2;
        var dist = targetX - this.x;
        var speed = this.speed * dt;
        if (Math.abs(dist) > speed) {
          this.place(this.x + (dist > 0 ? speed : -speed));
        } else {
          this.place(targetX);
        }
      } else if (mv !== 0) {
        this.place(this.x + mv * this.speed * dt);
      }

      // Update Bounding Box with Lunge Offset
      this.top = this.y + this.recoil;
      this.bottom = this.top + this.h;
    },

    getSegments: function () {
      var split = this.game.powerup && this.game.powerup.isSplitActive && this.game.powerup.isSplitActive();
      if (!split) {
        return [{
          left: this.left,
          top: this.top,
          right: this.right,
          bottom: this.bottom,
          w: this.w,
          h: this.h
        }];
      }
      var gap = Math.max(this.h * 1.2, this.game.court.chunk * 0.8);
      var half = (this.w - gap) / 2;
      if (half < this.h) half = this.h;
      var leftSeg = {
        left: this.left,
        top: this.top,
        right: this.left + half,
        bottom: this.bottom,
        w: half,
        h: this.h
      };
      var rightSeg = {
        left: this.right - half,
        top: this.top,
        right: this.right,
        bottom: this.bottom,
        w: half,
        h: this.h
      };
      return [leftSeg, rightSeg];
    },

    // === 2. OPTIMIZED DRAWING ===

    getSprite: function (w, h, color) {
      w = Math.ceil(w);
      h = Math.ceil(h);
      var key = w + "_" + h + "_" + color;
      if (this.spriteCache[key]) return this.spriteCache[key];

      var cvs = document.createElement('canvas');
      var shadowY = Math.max(4, h * 0.6);
      cvs.width = w;
      cvs.height = h + shadowY;
      var ctx = cvs.getContext('2d');
      var r = Math.min(h * 0.5, Math.max(4, w * 0.05));

      var sy = h + Math.max(1, h * 0.12);
      var sh = Math.max(4, h * 0.6);
      var grad = ctx.createLinearGradient(0, sy, 0, sy + sh);
      grad.addColorStop(0, 'rgba(0,0,0,0.28)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(r * 0.6, sy, w - r * 1.2, sh);

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 0, w, h, r);
      } else {
        ctx.moveTo(r, 0);
        ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      var gloss = ctx.createLinearGradient(0, 0, 0, h);
      gloss.addColorStop(0.00, 'rgba(255,255,255,0.30)');
      gloss.addColorStop(0.45, 'rgba(255,255,255,0.06)');
      gloss.addColorStop(1.00, 'rgba(0,0,0,0.22)');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gloss;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = Math.max(1, h * 0.06);
      ctx.beginPath();
      ctx.moveTo(r * 0.6, 1);
      ctx.lineTo(w - r * 0.6, 1);
      ctx.stroke();

      this.spriteCache[key] = cvs;
      return cvs;
      //return this.spriteCache[w+"_"+h+"_"+color] || this._makeSprite(w,h,color);
    },

    draw: function (ctx) {
      ctx.save();
      var ghostActive = this.game.powerup && this.game.powerup.isGhostActive && this.game.powerup.isGhostActive();
      var isIdle = (this.moving === 0);
      var segs = this.getSegments();

      // Ghost Effect (Idle Powerup OR Dashing)
      if ((ghostActive && isIdle) || this.dash.active) {
        // Different style for Dash vs Ghost Powerup
        if (this.dash.active) {
          ctx.globalAlpha = 0.6; // Visible but see-through
        } else {
          ctx.globalAlpha *= 0.25; // Very faint (Ghost powerup)
        }
        try {
          ctx.filter = 'saturate(35%) brightness(120%)';
        } catch (e) {}
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let gi = 0; gi < segs.length; gi++) {
          var s = segs[gi];
          const cx = (s.left + s.right) / 2;
          var cy = s.top + Math.max(2, this.h * 0.35);
          var r = Math.max(this.h * 1.4, 8);
          var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
          if (this.dash.active) {
            // Dash Trail color (White/Cyan)
            g.addColorStop(0, 'rgba(200,255,255,0.5)');
            g.addColorStop(1, 'rgba(200,255,255,0.0)');
          } else {
            g.addColorStop(0, 'rgba(160,215,255,0.35)');
            g.addColorStop(1, 'rgba(160,215,255,0.00)');
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Visual cue for Smash Powerup
      if (this.game.powerup.isPowerSmashActive && this.game.powerup.isPowerSmashActive()) {
        ctx.shadowColor = '#FF4081'; // Hot Pink Glow
        ctx.shadowBlur = 15;
      }

      // Recoil & Lunge Translation
      ctx.translate(0, this.recoil);

      var base = this.game.color.paddle;
      // Laser Blink
      if (this.game.powerup && this.game.powerup.isLasersActive && this.game.powerup.isLasersActive()) {
        var blink = ((Date.now() % 300) < 150);
        base = blink ? '#ffd54f' : base;
      }

      // 1. Draw Segments
      for (let i = 0; i < segs.length; i++) {
        var seg = segs[i];
        var color = (this.game.powerup.isPowerSmashActive && this.game.powerup.isPowerSmashActive()) ? '#FF4081' : base;
        var sprite = this.getSprite(seg.w, this.h, color);
        if (sprite) ctx.drawImage(sprite, seg.left, seg.top);
      }

      // 2. NEW: Sticky Visuals (Gooey Overlay)
      if (this.game.powerup.isStickyActive && this.game.powerup.isStickyActive()) {
        var t = Date.now() * 0.005;
        ctx.fillStyle = 'rgba(182, 255, 0, 0.85)'; // Slime Green

        for (let k = 0; k < segs.length; k++) {
          var s = segs[k];
          ctx.beginPath();
          // Wavy top line
          ctx.moveTo(s.left, s.top);
          for (var x = 0; x <= s.w; x += 2) {
            ctx.lineTo(s.left + x, s.top + Math.sin(t + x * 0.15) * 2.5);
          }
          ctx.lineTo(s.right, s.bottom - s.h * 0.6); // cover top 40%
          ctx.lineTo(s.left, s.bottom - s.h * 0.6);
          ctx.fill();

          // Random Drips
          if (Math.sin(t * 1.3) > 0.85) {
            var dripX = s.left + (s.w * 0.5) + Math.cos(t) * s.w * 0.3;
            ctx.beginPath();
            ctx.arc(dripX, s.top + 6 + Math.sin(t) * 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 3. NEW: Magnet Visuals (Electric Poles)
      var isMagnet = (this.game.powerup.isMagnetActive && this.game.powerup.isMagnetActive()) ||
        (this.game.powerup.hasGravityWell && this.game.powerup.hasGravityWell());

      if (isMagnet) {
        ctx.strokeStyle = '#00FFFF'; // Electric Blue
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 8;
        var mt = Date.now() * 0.02;

        // Draw on far outer edges of the paddle structure
        var leftPole = segs[0].left;
        var rightPole = segs[segs.length - 1].right;
        var cy = this.top + this.h / 2;

        // Left Pole
        ctx.beginPath();
        ctx.arc(leftPole, cy, 6 + Math.sin(mt) * 1.5, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();

        // Right Pole
        ctx.beginPath();
        ctx.arc(rightPole, cy, 6 + Math.cos(mt) * 1.5, Math.PI * 1.5, Math.PI * 0.5);
        ctx.stroke();

        // Sparks (Random lines)
        if (Math.random() < 0.2) {
          ctx.beginPath();
          ctx.moveTo(leftPole, cy);
          ctx.lineTo(leftPole - 8, cy + (Math.random() - 0.5) * 10);
          ctx.stroke();
        }
        if (Math.random() < 0.2) {
          ctx.beginPath();
          ctx.moveTo(rightPole, cy);
          ctx.lineTo(rightPole + 8, cy + (Math.random() - 0.5) * 10);
          ctx.stroke();
        }

        ctx.shadowBlur = 0; // Reset
      }

      // 4. Frozen Visuals
      if (this.game && this.game.powerup && this.game.powerup.isFrozenActive && this.game.powerup.isFrozenActive()) {
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = '#8ad7ff';
        for (var k = 0; k < segs.length; k++) {
          var s = segs[k];
          ctx.fillRect(s.left, s.top, s.w, s.h);
          ctx.globalAlpha = 0.9;
          ctx.strokeStyle = 'rgba(255,255,255,0.7)';
          var cracks = Math.max(1, this.frozenCrack | 0);
          for (let i = 0; i < cracks; i++) {
            var x0 = s.left + (i + 1) * (s.w / (cracks + 1));
            ctx.beginPath();
            ctx.moveTo(x0, s.top + 2);
            for (let j = 0; j < 3; j++) {
              var ox = (Math.random() * 10 - 5),
                oy = (Math.random() * 4 + 3);
              ctx.lineTo(x0 + ox, s.top + 2 + (j + 1) * oy);
            }
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      try {
        ctx.filter = 'none';
      } catch (e) {}
      ctx.restore();

      if (this.drawBrickShine) this.drawBrickShine(ctx);
      if (this.drawWallShading) this.drawWallShading(ctx);
    },

    // Helper for Scoreboard (Mini-Paddle)
    render: function (ctx) {
      var r = Math.min(this.h / 2, this.w / 6);
      ctx.beginPath();
      ctx.moveTo(this.left + r, this.top);
      ctx.lineTo(this.right - r, this.top);
      ctx.arc(this.right - r, this.top + r, r, -Math.PI / 2, 0, false);
      ctx.lineTo(this.right, this.bottom - r);
      ctx.arc(this.right - r, this.bottom - r, r, 0, Math.PI / 2, false);
      ctx.lineTo(this.left + r, this.bottom);
      ctx.arc(this.left + r, this.bottom - r, r, Math.PI / 2, Math.PI, false);
      ctx.lineTo(this.left, this.top + r);
      ctx.arc(this.left + r, this.top + r, r, Math.PI, Math.PI * 1.5, false);
      ctx.closePath();
      ctx.fill();
    },

    // === 3. MOVEMENT HELPERS ===
    moveLeft: function () {
      if (this.moving === 0) { // New Press
        var now = Date.now();
        if (now - this.dash.lastLeftUp < 250) {
          this.triggerDash(-1);
        }
      }
      this.moving = Math.min(0, this.moving - 1);
    },
    moveRight: function () {
      if (this.moving === 0) { // New Press
        var now = Date.now();
        if (now - this.dash.lastRightUp < 250) {
          this.triggerDash(1);
        }
      }
      this.moving = Math.max(0, this.moving + 1);
    },
    stopMovingLeft: function () {
      if (this.moving < 0) {
        this.moving = 0;
        this.dash.lastLeftUp = Date.now(); // Record release time
      }
    },
    stopMovingRight: function () {
      if (this.moving > 0) {
        this.moving = 0;
        this.dash.lastRightUp = Date.now(); // Record release time
      }
    },
    place: function (x) {
      var minX = this.game.court.left;
      var maxX = this.game.court.right - this.w;
      if (x < minX) x = minX;
      else if (x > maxX) x = maxX;
      this.setpos(x, this.y);
    },
    setpos: function (x, y) {
      this.x = x;
      this.y = y;
      this.left = this.x;
      this.top = this.y;
      this.right = this.x + this.w;
      this.bottom = this.y + this.h;
    },

    // === 4. EFFECTS ===
    drawBrickShine: function (ctx) {
      if (!this.bricks && this.game.court.bricks) {
        var c = this.game.court;
        c.drawBrickShine.call(c, ctx);
        return;
      }
      this.game.court.drawBrickShine(ctx);
    },

    drawWallShading: function (ctx) {
      var c = this.game.court;
      if (!c || !c.wall) return;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.left, c.bottom);
      ctx.lineTo(c.left, c.top);
      ctx.lineTo(c.right, c.top);
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.moveTo(c.right, c.top);
      ctx.lineTo(c.right, c.bottom);
      ctx.lineTo(c.left, c.bottom);
      ctx.stroke();
      ctx.restore();
    },
    hit: function (magnitude) {
      if (this.lungeState === 'idle') {
        this.recoil = Math.min(15, (magnitude || 5));
      }
    }
  },
  //=============================================================================
  // Ball (multi-ball manager)
  //=============================================================================

  Ball: {
    // === 1. INITIALIZATION & STATE ===
    initialize: function (game, cfg) {
      this.game = game;
      this.cfg = cfg;
      this.balls = [];
      this.fire = false;
      this.sticky = false;
      this.temp = {
        size: 1,
        speed: 1
      };
      this.chaosCooldown = 0;
      this.spriteCache = {};

      // Manual input tracker for Trick Shot / Smash logic
      this.manualPressed = false;
      var self = this;

      function setDown() {
        self.manualPressed = true;
      }

      function setUp() {
        self.manualPressed = false;
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('mousedown', setDown);
        window.addEventListener('mouseup', setUp);
        window.addEventListener('touchstart', setDown, {
          passive: true
        });
        window.addEventListener('touchend', setUp);
      }
    },

    resetTemporaryMods: function () {
      this.temp.size = 1;
      this.temp.speed = 1;
      this.setFire(false);
      for (let i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        b.radius = this.cfg.defaultRadius * this.game.court.chunk;
        b.speed = this.cfg.defaultSpeed * this.game.court.chunk;
        b.isSmashBall = false;
        b.preSmashSpeed = null;
      }
    },

    reset: function (options) {
      this.balls = [];
      let radius = this.cfg.radius * this.game.court.chunk;
      let speed = this.cfg.speed * this.game.court.chunk;
      const cx = this.game.paddle.left + (this.game.paddle.w / 2);
      const cy = this.game.paddle.top - radius - 1;
      this.balls.push({
        x: cx,
        y: cy,
        dx: 0,
        dy: 0,
        radius: radius,
        speed: speed
      });
      this.clearLaunch();
      if (options && options.launch) this.launch();
      this.rebuildTargets();
    },

    resize: function () {
      this.spriteCache = {};
      for (let i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        b.radius = this.cfg.radius * this.game.court.chunk * this.temp.size;
        b.speed = this.cfg.speed * this.game.court.chunk * this.temp.speed;
      }
    },

    rebuildTargets: function () {
      this.hitTargets = [this.game.paddle, this.game.court.wall.top, this.game.court.wall.left, this.game.court.wall.right].concat(this.game.court.bricks);
    },

    // === 2. GAMEPLAY MODIFIERS ===
    grow: function () {
      this.temp.size = 2;
      this.resize();
    },
    shrink: function () {
      this.temp.size = 0.5;
      this.resize();
    },
    fast: function () {
      this.temp.speed = 1.5;
      this.resize();
    },
    slow: function () {
      this.temp.speed = 1 / 1.5;
      this.resize();
    },
    setFire: function (on) {
      this.fire = !!on;
    },
    setSticky: function (on) {
      this.sticky = !!on;
      if (!this.sticky) {
        // Auto-release parked balls
        var pcx = this.game.paddle.left + this.game.paddle.w / 2;
        var pwh = this.game.paddle.w / 2;
        for (let i = 0; i < this.balls.length; i++) {
          var b = this.balls[i];
          if (b.dx === 0 && b.dy === 0) {
            var s = b.speed || (this.cfg.speed * this.game.court.chunk);
            var hit = pwh ? ((b.x - pcx) / pwh) : 0;
            b.dx = hit * (0.9 * s);
            b.dy = -0.9 * s;
            b.stuck = false;
          }
        }
      }
    },

    hasParkedBall: function () {
      for (let i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        if (b.dx === 0 && b.dy === 0) return true;
      }
      return false;
    },

    releaseSticky: function () {
      if (!this.sticky) return false;
      var released = false;
      var pcx = this.game.paddle.left + this.game.paddle.w / 2;
      var pwh = this.game.paddle.w / 2;
      for (let i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        if (b.dx === 0 && b.dy === 0) {
          var s = b.speed || (this.cfg.speed * this.game.court.chunk);
          var hit = pwh ? ((b.x - pcx) / pwh) : 0;
          b.dx = hit * (0.9 * s);
          b.dy = -0.9 * s;
          b.stuck = false;
          released = true;
        }
      }
      if (released) this.clearLaunch();
      return released;
    },

    bumpSpeed: function () {
      for (let i = 0; i < this.balls.length; i++) {
        this.balls[i].speed = Math.min(this.balls[i].speed * 1.02, this.cfg.speed * 1.5 * this.game.court.chunk);
        if (this.balls[i].speed < (this.defaultSpeed / 2) && this.endGame.mode === null) {
          this.balls[i].speed = (this.defaultSpeed / 2);
        }
      }
    },

    triple: function () {
      if (this.balls.length === 0) return;
      var seed = this.balls[0];
      var angle = Math.atan2(seed.dy, seed.dx) || -Math.PI / 3;
      var baseSpreadDeg = 20;
      var chaosOn = !!(this.game && this.game.powerup && this.game.powerup.isChaosActive && this.game.powerup.isChaosActive());
      if (chaosOn) {
        baseSpreadDeg = 34 + Math.random() * 12;
        angle += (Math.random() * 0.25 - 0.125);
      }
      var spread = (baseSpreadDeg * Math.PI) / 180;
      var speed = seed.speed;

      function make(ang) {
        var wobble = chaosOn ? (1.0 + (Math.random() * 0.08 - 0.04)) : 1.0;
        var s = speed * wobble;
        return {
          x: seed.x,
          y: seed.y,
          dx: Math.cos(ang) * s,
          dy: Math.sin(ang) * s,
          radius: Math.max(5, seed.radius * 0.75),
          speed: s
        };
      }
      this.balls.push(make(angle - spread), make(angle + spread));
      if (seed.dx === 0 && seed.dy === 0) {
        seed.dx = Math.cos(angle) * speed;
        seed.dy = Math.sin(angle) * speed;
      }
      seed.radius = Math.max(5, seed.radius * 0.75);
    },

    setExplodingVisual: function (on, untilTs) {
      this.explodingVisual = !!on;
      this.explodingVisualUntil = untilTs || 0;
    },

    // === 3. LAUNCH LOGIC (Kept exactly as is) ===
    clearLaunch: function () {
      clearTimeout(this.delayTimer);
      this.countdown = null;
      this.label = null;
    },
    launchLabel: function (count) {
      return this.cfg.labels[count];
    },

    launch: function () {
      if (this.countdown == null) this.countdown = 3;
      var lvl = (this.game && Breakout.Levels && Breakout.Levels[this.game.level]) ? Breakout.Levels[this.game.level] : null;
      var levelName = String(lvl && lvl.name || '');
      let isDoge = (levelName.toUpperCase() === 'DOGE! SUCH BREAKOUT!');
      let isAmongUs = (levelName === 'Among Us by EnderAndrew');

      if (this.countdown > 0) {
        if (isDoge) this.showDogeOverlayOnce();
        if (isAmongUs) this.showAmongUsOverlayOnce();
        this.label = this.launchLabel(this.countdown);
        this.delayTimer = setTimeout(this.launch.bind(this), 1000);
        if (this.countdown == 1) {
          for (let i = 0; i < this.balls.length; i++) {
            var b = this.balls[i];
            b.dx = 1;
            b.dy = -1;
          }
        }
        this.countdown--;
      } else {
        this.label = this.launchLabel(1) || {
          text: 'go!'
        };
        const self = this;
        for (let i = 0; i < this.balls.length; i++) {
          var b = this.balls[i];
          var dir = Game.Math.normalize({
            x: b.dx,
            y: b.dy
          });
          b.dx = dir.x * b.speed;
          b.dy = dir.y * b.speed;
        }
        if (this.game && this.game.playSound) this.game.playSound('go');
        this._dogeOverlayActive = false;
        setTimeout(function () {
          self.clearLaunch();
        }, 300);
      }
    },
    launchNow: function () {
      this.countdown = 1;
      this.launch();
    },

    moveToPaddle: function (b, opts) {
      opts = opts || {};
      var segs = this.game.paddle.getSegments ? this.game.paddle.getSegments() : [{
        left: this.game.paddle.left,
        right: this.game.paddle.right,
        top: this.game.paddle.top,
        w: this.game.paddle.w,
        h: this.game.paddle.h
      }];
      var idx = (typeof b.stuckSeg === 'number' && segs[b.stuckSeg]) ? b.stuckSeg :
        (b.x < this.game.paddle.left + this.game.paddle.w / 2 ? 0 : Math.min(1, segs.length - 1));
      var seg = segs[idx];
      const cx = seg.left + seg.w / 2;
      b.y = seg.top - b.radius - 1;
      if (opts.center === true || (!this.sticky && !b.stuck)) {
        b.x = cx;
      } else {
        var minX = seg.left + b.radius;
        var maxX = seg.left + seg.w - b.radius;
        if (b.x < minX) b.x = minX;
        if (b.x > maxX) b.x = maxX;
      }
    },

    layoutParkedBalls: function () {
      if (!this.sticky) return;
      var segs = this.game.paddle.getSegments ? this.game.paddle.getSegments() : [{
        left: this.game.paddle.left,
        right: this.game.paddle.right,
        top: this.game.paddle.top,
        w: this.game.paddle.w,
        h: this.game.paddle.h
      }];
      var groups = new Array(segs.length);
      for (let gi = 0; gi < groups.length; gi++) groups[gi] = [];
      for (let i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        if (b.dx === 0 && b.dy === 0) {
          var si = (typeof b.stuckSeg === 'number' && b.stuckSeg < segs.length) ? b.stuckSeg : 0;
          groups[si].push(b);
        }
      }
      for (let s = 0; s < segs.length; s++) {
        var seg = segs[s];
        var row = groups[s];
        var n = row.length;
        if (!n) continue;
        var r = (row[0] && row[0].radius) ? row[0].radius : (this.radius || this.cfg.radius * this.game.court.chunk * 0.5);
        var gap = Math.max(2, Math.floor(this.game.court.chunk * 0.1));
        var total = n * (2 * r) + (n - 1) * gap;
        var maxW = Math.max(2 * r, seg.w * 0.8);
        var spread = Math.min(total, maxW);
        var startX = seg.left + (seg.w - spread) / 2 + r;
        for (let k = 0; k < n; k++) {
          var bb = row[k];
          bb.x = startX + k * (2 * r + gap);
          bb.y = seg.top - bb.radius - 1;
          Game.Math.bound(bb);
        }
      }
    },

    // === 4. PHYSICS & UPDATE ===
    update: function (dt) {
      // Chaos Stabilization SYNERGY
      var pup = this.game.powerup;
      if (pup && pup.isChaosActive && pup.isChaosActive()) {
        // Check for Stabilizers
        var hasSticky = (this.sticky || (pup.isSticky && pup.isSticky()));
        var hasMagnet = (pup.isMagnetActive && pup.isMagnetActive()) ||
          (pup.hasGravityWell && pup.hasGravityWell());

        if (hasSticky || hasMagnet) {
          // 1. Force Kill Chaos
          if (pup.endChaos) pup.endChaos();
          else pup.chaosUntil = 0;

          // 2. Feedback (Sound + Message)
          if (this.game.playSound) this.game.playSound('powerup');

          if (this.game.floaters && this.game.floaters.spawn) {
            // Spawn text above paddle
            var px = this.game.paddle.x + this.game.paddle.w / 2;
            var py = this.game.paddle.top - 40;
            this.game.floaters.spawn(px, py, "Chaos Stabilized!", '#00FFFF');
          }

          // 3. Visuals (Blue Spark Ring around all balls)
          if (this.game.particles && this.game.particles.ring) {
            for (var bi = 0; bi < this.balls.length; bi++) {
              var _b = this.balls[bi];
              this.game.particles.ring(_b.x, _b.y, {
                color: '#00FFFF',
                maxR: 40,
                life: 30
              });
            }
          }
        }
      }
      // Speed limiting & Time Dilation
      for (let i = 0; i < this.balls.length; i++) {
        if (this.balls[i].speed < (this.defaultSpeed / 2) && this.endGame.mode === null) {
          this.balls[i].speed = (this.defaultSpeed / 2);
        }
      }
      var target = this.speed;
      if (this.game && this.game.endGame && this.game.endGame.mode === 'timedilation' && this.game.getTimeDilationScaleFor) {
        target *= this.game.getTimeDilationScaleFor(this.x, this.y);
      }
      var v = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
      this.vx = (this.vx / v) * target;
      this.vy = (this.vy / v) * target;

      // Laser Grid
      (function laserPass() {
        var game = this.game;
        if (!game || !game.laserGrid || !game.laserGrid.lines || !game.laserGrid.lines.length) return;
        if (!game.laserGrid.on) return;
        for (let bi = 0; bi < this.balls.length; bi++) {
          var b = this.balls[bi];
          if (!b) continue;
          for (let i = 0; i < game.laserGrid.lines.length; i++) {
            var ln = game.laserGrid.lines[i];
            var half = (ln.w || 4) / 2;
            if (b.y + b.radius < game.court.top || b.y - b.radius > game.court.bottom) continue;
            if (Math.abs(b.x - ln.x) <= (half + b.radius)) {
              if (b.x < ln.x) b.x = ln.x - (half + b.radius + 0.5);
              else b.x = ln.x + (half + b.radius + 0.5);
              b.dx = -b.dx * 1.02;
              if (game.requestShake) game.requestShake(3, 0.05);
              if (game.particles && game.particles.ring) game.particles.ring(ln.x, b.y, {
                color: '#ff6666',
                maxR: game.court.chunk * 1.5,
                life: 160
              });
            }
          }
        }
      }).call(this);

      // Bumpers (With SYNERGY: Demolition)
      (function bumpersPass() {
        var game = this.game;
        if (!game || !game.bumpers || !game.bumpers.length) return;
        for (let bi = 0; bi < this.balls.length; bi++) {
          var b = this.balls[bi];
          var bx = b.x,
            by = b.y,
            br = b.radius;
          // Reverse loop so we can splice cleanly
          for (let i = game.bumpers.length - 1; i >= 0; i--) {
            var bp = game.bumpers[i];
            var dx = bx - bp.x,
              dy = by - bp.y;
            var d2 = dx * dx + dy * dy,
              R = br + bp.r;
            if (d2 <= R * R) {
              // SYNERGY: EXPLODING BALL DESTROYS BUMPERS
              if (game.powerup.isExplodingActive && game.powerup.isExplodingActive()) {
                game.bumpers.splice(i, 1);
                game.playSound('explosion');
                game.requestShake(12, 0.2);
                // Explode the area, damaging bricks near the bumper
                if (game.explodeBrickNeighborhood) {
                  game.explodeBrickNeighborhood({
                    left: bp.x - bp.r,
                    right: bp.x + bp.r,
                    top: bp.y - bp.r,
                    bottom: bp.y + bp.r
                  });
                }
                // Visuals
                if (game.particles && game.particles.explosion) {
                  game.particles.explosion(bp.x, bp.y, {
                    count: 30,
                    color: '#b388ff'
                  });
                }
                continue; // Ball continues through (feels powerful)
              }

              // Normal Bumper Physics
              var d = Math.sqrt(Math.max(1e-6, d2));
              var nx = dx / d,
                ny = dy / d;
              var pen = (R - d) + 0.5;
              b.x += nx * pen;
              b.y += ny * pen;
              var vdotn = b.dx * nx + b.dy * ny;
              var vx = b.dx - 2 * vdotn * nx;
              var vy = b.dy - 2 * vdotn * ny;
              var boost = (bp.bounce || 1.25);
              var spd = Math.sqrt(vx * vx + vy * vy) || 1;
              var want = Math.max(spd * boost, this.cfg.speed * this.game.court.chunk * 0.9);
              var k = want / spd;
              b.dx = vx * k;
              b.dy = vy * k;
              if (this.playSound) this.playSound('bumpers');
              if (game.particles && game.particles.ring)
                game.particles.ring(bp.x, bp.y, {
                  color: '#b388ff',
                  maxR: bp.r * 2.2,
                  life: 220
                });
              if (game.playSound) game.playSound('thud');
              if (game.requestShake) game.requestShake(5, 0.06);
            }
          }
        }
      }).call(this);

      // PISTON COLLISION (Dynamic Wall Hazards)
      var pistons = this.game.court.pistons || [];
      for (let i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        for (let pIdx = 0; pIdx < pistons.length; pIdx++) {
          var p = pistons[pIdx];
          // Simple AABB for piston box
          if (b.x + b.radius > p.bb.left && b.x - b.radius < p.bb.right &&
            b.y + b.radius > p.bb.top && b.y - b.radius < p.bb.bottom) {

            // Determine bounce axis (mostly horizontal)
            var penLeft = Math.abs((b.x + b.radius) - p.bb.left);
            var penRight = Math.abs((b.x - b.radius) - p.bb.right);
            var penTop = Math.abs((b.y + b.radius) - p.bb.top);
            var penBottom = Math.abs((b.y - b.radius) - p.bb.bottom);

            var minPen = Math.min(penLeft, penRight, penTop, penBottom);

            if (minPen === penLeft) { b.x = p.bb.left - b.radius;
              b.dx = -Math.abs(b.dx); } else if (minPen === penRight) { b.x = p.bb.right + b.radius;
              b.dx = Math.abs(b.dx); } else if (minPen === penTop) { b.y = p.bb.top - b.radius;
              b.dy = -Math.abs(b.dy); } else { b.y = p.bb.bottom + b.radius;
              b.dy = Math.abs(b.dy); }

            if (this.game.playSound) this.game.playSound('thud');
          }
        }
      }

      // Floor bounce
      (function floorBouncePass() {
        if (!(this.game && this.game.powerup && this.game.powerup.isFloorActive && this.game.powerup.isFloorActive())) return;
        var c = this.game.court;
        if (!c) return;
        var size = (c.wall && c.wall.size) ? c.wall.size : Math.max(4, (c.chunk * 0.25) | 0);
        var floorY = c.bottom - size;
        for (let i = this.balls.length - 1; i >= 0; i--) {
          var b = this.balls[i];
          if (b.y + b.radius >= floorY && b.dy > 0) {
            b.y = floorY - b.radius;
            b.dy = -Math.abs(b.dy) * 0.985;
            if (Math.abs(b.dx) < 0.02) b.dx = (Math.random() < 0.5 ? -1 : 1) * 0.04;
            if (this.game && this.game.playSound) this.game.playSound('paddle');
            if (this.game && this.game.comboReset) this.game.comboReset();
            if (this.game && this.game.particles && this.game.particles.spawn) {
              this.game.particles.spawn({
                kind: 'spark',
                x: b.x,
                y: floorY,
                count: 6,
                spread: 0.6,
                vx: 0,
                vy: -90,
                life: 260
              });
            }
          }
        }
      }).call(this);

      var ghostIdle = (this.game && this.game.powerup && this.game.powerup.isGhostActive && this.game.powerup.isGhostActive() && !this.game.paddle.isMoving());
      if (this.layoutParkedBalls) this.layoutParkedBalls();
      if (this.label) return;
      if (this.sticky && this.game.powerup && !this.game.powerup.isStickyActive()) this.setSticky(false);

      for (let i = this.balls.length - 1; i >= 0; i--) {
        var b = this.balls[i];
        if (!b) continue;

        // TRAIL Logic
        var fastActive = (this.temp && this.temp.speed > 1);
        var chaosActive = (this.game.powerup && this.game.powerup.isChaosActive && this.game.powerup.isChaosActive());
        if (fastActive || chaosActive) {
          if (!b.trail) b.trail = [];
          b.trail.push({
            x: b.x,
            y: b.y,
            r: b.radius
          });
          if (b.trail.length > 6) b.trail.shift();
        } else if (b.trail) {
          b.trail.length = 0;
        }

        // Sticky Logic
        if (this.sticky && b.dx === 0 && b.dy === 0) {
          var segs = this.game.paddle.getSegments ? this.game.paddle.getSegments() : [{
            left: this.game.paddle.left,
            right: this.game.paddle.right,
            top: this.game.paddle.top,
            w: this.game.paddle.w
          }];
          var si = (typeof b.stuckSeg === 'number' && b.stuckSeg < segs.length) ? b.stuckSeg : 0;
          var seg = segs[si];
          b.y = this.game.paddle.top - b.radius - 1;
          Game.Math.bound(b);
        }

        if (b.portalCD) b.portalCD -= dt;
        else b.portalCD = 0;
        b.x += b.dx * dt;
        b.y += b.dy * dt;
        if (this.sticky && b.dx === 0 && b.dy === 0) {
          this.moveToPaddle(b, {
            center: false
          });
        }
        Game.Math.bound(b);

        /* CHAOS */
        if (this.game.powerup && this.game.powerup.isChaosActive && this.game.powerup.isChaosActive()) {
          this.chaosCooldown -= dt;
          if (this.chaosCooldown <= 0) {
            this.chaosCooldown = 0.8 + Math.random() * 0.8;
            for (let ci = 0; ci < this.balls.length; ci++) {
              var cb = this.balls[ci];
              if (cb.dx === 0 && cb.dy === 0) continue;
              var ang = Math.atan2(cb.dy, cb.dx);
              var delta = (-Math.PI / 3) + Math.random() * (2 * Math.PI / 3);
              var speed = Math.max(50, cb.speed || (this.cfg.speed * this.game.court.chunk));
              var nx = Math.cos(ang + delta),
                ny = Math.sin(ang + delta);
              if (Math.abs(ny) < 0.15) ny = (ny < 0 ? -0.15 : 0.15);
              var norm = Math.sqrt(nx * nx + ny * ny) || 1;
              cb.dx = (nx / norm) * speed;
              cb.dy = (ny / norm) * speed;
            }
          }
        } else {
          this.chaosCooldown = 0;
        }

        /* PORTALS */
        var ports = this.game.getActivePortals && this.game.getActivePortals();
        if (ports && (b.dx !== 0 || b.dy !== 0) && (!b.portalCD || b.portalCD <= 0)) {
          for (let pi = 0; pi < 2; pi++) {
            var p = ports[pi];
            if (this.game.insidePortal(p, b.x, b.y)) {
              var q = ports[1 - pi];
              var ang = Math.atan2(b.dy, b.dx);
              var delta = (-Math.PI / 6) + Math.random() * (Math.PI / 3);
              var spd = Math.sqrt(b.dx * b.dx + b.dy * b.dy) || (this.cfg.speed * this.game.court.chunk);
              var nx = Math.cos(ang + delta),
                ny = Math.sin(ang + delta);
              var norm = Math.sqrt(nx * nx + ny * ny) || 1;
              var a = q.a || q.r * 1.6,
                bb = q.b || q.r;
              nx /= norm;
              ny /= norm;
              var t = 1 / Math.sqrt((nx * nx) / (a * a) + (ny * ny) / (bb * bb));
              var off = t + b.radius + 2;
              b.x = q.x + nx * off;
              b.y = q.y + ny * off;
              b.dx = nx * spd;
              b.dy = ny * spd;
              b.portalCD = 0.22;
              if (this.game.addPortalWhoosh) this.game.addPortalWhoosh(q.x, q.y, nx, ny, q.color);
              break;
            }
          }
        }

        /* GRAVITY WELL */
        var gw = this.game.getGravityWell && this.game.getGravityWell();
        if (gw && (b.dx !== 0 || b.dy !== 0)) {
          var vx = gw.x - b.x,
            vy = gw.y - b.y;
          var d2 = vx * vx + vy * vy;
          var d = Math.sqrt(d2) || 1;
          var k = gw.str;
          var cap = Math.max(55, (b.speed || 0) * 0.5);
          var acc = Math.min(cap, k / (1 + d));

          // Normalize direction
          var nx = vx / d;
          var ny = vy / d;

          // Anisotropic Gravity:
          // 1. Boost Left/Right (nx) significantly (2.5x)
          // 2. Boost Downward pull (ny > 0) significantly (2.5x)
          // 3. Dampen Upward pull (ny < 0) slightly (0.8x) to prevent soft-locks
          var factorX = 2.5;
          var factorY = (ny > 0) ? 2.5 : 0.8;

          b.dx += nx * acc * factorX * dt;
          b.dy += ny * acc * factorY * dt;
        }

        // Walls
        if (b.left < this.game.court.wall.left.right) {
          b.x += (this.game.court.wall.left.right - b.left);
          b.dx = Math.abs(b.dx);
          Game.Math.bound(b);
        }
        if (b.right > this.game.court.wall.right.left) {
          b.x -= (b.right - this.game.court.wall.right.left);
          b.dx = -Math.abs(b.dx);
          Game.Math.bound(b);
        }
        // TOP WALL / VENT LOGIC
        if (b.top < this.game.court.wall.top.bottom) {
          // Check if Vent is Open and ball is within X range
          var vent = this.game.court.vent;
          var inVent = (vent && vent.state === 'open' && b.x > vent.x && b.x < vent.x + vent.w);

          if (inVent) {
            // PASS THROUGH - Do not bounce
            // If ball goes completely off top screen, kill it
            if (b.y < -b.radius * 2) {
              this.balls.splice(i, 1);
              if (this.game.playSound) this.game.playSound('loselife');
              // Add Floater text
              if (this.game.floaters) this.game.floaters.spawn(b.x, 50, "SUCKED OUT!", '#FF0000');
              continue;
            }
          } else {
            // Normal Bounce
            b.y += (this.game.court.wall.top.bottom - b.top);
            b.dy = Math.abs(b.dy);
            Game.Math.bound(b);
          }
        }
        if (b.top > this.game.court.bottom + b.radius) {
          this.balls.splice(i, 1);
          continue;
        }

        if (!ghostIdle) {
          // Paddle Collision
          var segs = this.game.paddle.getSegments ? this.game.paddle.getSegments() : [{
            left: this.game.paddle.left,
            top: this.game.paddle.top,
            right: this.game.paddle.right,
            bottom: this.game.paddle.bottom,
            w: this.game.paddle.w,
            h: this.game.paddle.h
          }];
          for (let s = 0; s < segs.length; s++) {
            var seg = segs[s];

            // NOTE: paddle.top is dynamic now (it moves up during lunge)
            if ((b.dy > 0) && (b.right >= seg.left) && (b.left <= seg.right) && (b.bottom >= seg.top) && (b.top <= seg.bottom)) {
              this.game.playSound('paddle');

              // === POWER SMASH TRIGGER ===
              // If paddle is lunging UP, trigger smash!
              var isLunging = (this.game.paddle.lungeState === 'lunging');
              var significantLunge = (this.game.paddle.recoil < -4);

              if (isLunging && significantLunge) {
                // SUCCESS: Apply Smash Effect
                b.preSmashSpeed = b.speed; // Save original
                b.speed *= 2.0; // Double it!
                b.isSmashBall = true;

                this.game.playSound('explosion');
                this.game.requestShake(10, 0.15);

                if (this.game.particles && this.game.particles.ring) {
                  this.game.particles.ring(b.x, b.y, {
                    color: '#FFFFFF',
                    maxR: 60,
                    life: 25
                  });
                }
              } else {
                // FAIL: Normal Hit
                this.game.playSound('paddle');
              }

              if (this.game && this.game.comboReset) this.game.comboReset();

              var impact = Math.abs(b.dy) * 0.05;
              this.game.paddle.hit(impact);

              if (this.sticky) {
                b.dx = 0;
                b.dy = 0;
                b.stuck = true;
                b.stuckSeg = s;
                b.y = seg.top - b.radius - 1;
              } else {
                b.y = seg.top - b.radius;
                b.dy = -Math.abs(b.dy);
                if (this.game && this.game.ensureBallSpeed) this.game.ensureBallSpeed(b);
                var hit = (b.x - (seg.left + seg.w / 2)) / (seg.w / 2);
                b.dx += hit * (0.35 * b.speed);
              }
              Game.Math.bound(b);
              break;
            }
          }
        }

        // Brick Collision
        for (let n = 0; n < this.game.court.bricks.length; n++) {
          var brick = this.game.court.bricks[n];
          if (brick.hit) continue;
          if (b.right >= brick.left && b.left <= brick.right && b.bottom >= brick.top && b.top <= brick.bottom) {
            var penX = Math.min(Math.abs(b.right - brick.left), Math.abs(brick.right - b.left));
            var penY = Math.min(Math.abs(b.bottom - brick.top), Math.abs(brick.bottom - b.top));

            var destroyed = this.game.hitBrick(brick, {
              from: (this.fire ? 'fireball' : 'ball')
            });

            // === SMASH RESULT ===
            if (b.isSmashBall) {
              this.game.court.smashThrough(brick, b);
              b.isSmashBall = false;

              // RESTORE SPEED EXACTLY
              if (b.preSmashSpeed) {
                b.speed = b.preSmashSpeed;
                b.preSmashSpeed = null;
              } else {
                b.speed /= 2.0;
              }
            }

            if (this.game.powerup && this.game.powerup.isXFactorActive && this.game.powerup.isXFactorActive()) {
              this.game.court.triggerXFactor(brick);
            } else if (this.game.powerup && this.game.powerup.isLightningActive && this.game.powerup.isLightningActive()) {
              this.game.court.triggerLightning(brick);
            }

            var shouldBounce = true;
            if (this.fire && destroyed) shouldBounce = false;
            if (shouldBounce) {
              if (penX < penY) b.dx = -b.dx;
              else b.dy = -b.dy;
            }
            break;
          }
        }
      }

      if (this.balls.length === 0) this.game.loseBall();
      if (this.game && this.game.powerup && this.game.powerup.isFireActive) {
        if (!this.game.powerup.isFireActive()) this.setFire(false);
      }
    },
    // === 5. VISUALS & RENDERING ===
    showDogeOverlayOnce: function () {
      if (this._dogeOverlayActive) return;
      this._dogeOverlayActive = true;
      if (this.game && this.game.playSound) this.game.playSound('doge');
    },

    drawDogeOverlay: function (ctx) {
      if (!this._dogeOverlayActive) return;
      var W = this.game && this.game.width || ctx.canvas.width;
      var H = this.game && this.game.height || ctx.canvas.height;
      var fs = Math.floor(Math.min(W, H) * 0.08);
      ctx.save();
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(0, 0, W, H);
      ctx.font = fs + 'px Comic Sans MS';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FF0000';
      ctx.fillText('Such Breakout', W * 0.5, H * 0.4);
      ctx.restore();
    },

    showAmongUsOverlayOnce: function () {
      if (this._amongUsOverlayActive) return;
      this._amongUsOverlayActive = true;
      if (this.game && this.game.playSound) this.game.playSound('amongus');
    },

    drawAmongUsOverlay: function (ctx) {
      if (!this._amongUsOverlayActive) return;

      // Get the preloaded image from the game instance
      var img = (this.game && this.game.amongUsOverlay) ? this.game.amongUsOverlay.img : null;
      if (!img) return;

      var W = this.game && this.game.width || ctx.canvas.width;
      var H = this.game && this.game.height || ctx.canvas.height;

      ctx.save();
      // Black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      // Draw image centered and scaled to fit
      var iw = img.naturalWidth || img.width;
      var ih = img.naturalHeight || img.height;

      if (iw && ih) {
        var scale = Math.min(W / iw, H / ih);
        var dw = iw * scale;
        var dh = ih * scale;
        var dx = (W - dw) / 2;
        var dy = (H - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
      }
      ctx.restore();
    },

    drawLaunchLabel: function (ctx) {
      if (!this.label && this.countdown == null) return;
      var L = this.label || {};
      var txt = String(L.text || '');
      if (!txt) return;
      var c = this.game.court;
      var fontSize = Math.floor(c.chunk * 2.5);
      let x = (c.left + c.right) / 2;
      var y = this.game.paddle.top - Math.max(c.chunk * 1.5, fontSize);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = L.font || ('bold ' + fontSize + 'px "Mr Dafoe", cursive');
      ctx.shadowColor = 'rgba(0,0,0,1.05)';
      ctx.shadowBlur = fontSize * 0.5;
      ctx.lineWidth = fontSize * 0.15;
      ctx.strokeStyle = L.stroke || 'black';
      ctx.strokeText(txt, x, y);
      ctx.fillStyle = L.fill || '#ffffff';
      ctx.fillText(txt, x, y);
      ctx.restore();
    },

    // NEW: Sprite Generator (Replaces the heavy gradient math in 'draw')
    getSprite: function (r) {
      // Create cache key based on radius
      r = Math.ceil(r);
      var key = "ball_" + r;
      if (this.spriteCache[key]) return this.spriteCache[key];

      var d = r * 2 + 4; // Extra space for stroke/glow
      var cvs = document.createElement('canvas');
      cvs.width = d;
      cvs.height = d;
      var ctx = cvs.getContext('2d');
      const cx = r + 2,
        cy = r + 2;

      // 1. Edge Vignette (Simulate 'multiply' shadow with low alpha black)
      var shade = ctx.createRadialGradient(cx, cy, Math.max(1, r * 0.25), cx, cy, r);
      shade.addColorStop(0.70, 'rgba(0,0,0,0.00)');
      shade.addColorStop(1.00, 'rgba(0,0,0,0.60)');
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
      ctx.fill();

      // 2. Horizon Band (Simulate 'lighter')
      var band = ctx.createLinearGradient(cx - r, cy - r * 0.2, cx + r, cy + r * 0.2);
      band.addColorStop(0.00, 'rgba(255,255,255,0.00)');
      band.addColorStop(0.45, 'rgba(255,255,255,0.12)');
      band.addColorStop(0.50, 'rgba(255,255,255,0.22)');
      band.addColorStop(0.55, 'rgba(255,255,255,0.12)');
      band.addColorStop(1.00, 'rgba(255,255,255,0.00)');
      ctx.fillStyle = band;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
      ctx.fill();

      // 3. Specular Highlight (Simulate 'lighter')
      var hx = cx - r * 0.35,
        hy = cy - r * 0.35,
        hr = Math.max(1, r * 0.65);
      var spec = ctx.createRadialGradient(hx, hy, 1, hx, hy, hr);
      spec.addColorStop(0.00, 'rgba(255,255,255,0.95)');
      spec.addColorStop(0.35, 'rgba(255,255,255,0.35)');
      spec.addColorStop(1.00, 'rgba(255,255,255,0.00)');
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
      ctx.fill();

      // 4. Rim Stroke
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = Math.max(1, r * 0.12);
      ctx.beginPath();
      ctx.arc(cx, cy, r - 0.5, -0.35, 2.5, false);
      ctx.stroke();

      this.spriteCache[key] = cvs;
      return cvs;
    },

    draw: function (ctx) {
      var chaosOn = !!(this.game.powerup && this.game.powerup.isChaosActive && this.game.powerup.isChaosActive());
      var chaosPulse = chaosOn ? (0.6 + 0.4 * Math.abs(Math.sin(Date.now() / 180))) : 0;
      var explodingOn = !!(this.game.powerup && this.game.powerup.isExplodingActive && this.game.powerup.isExplodingActive());
      var fireOn = !!this.fire;
      var lightningOn = (this.game.powerup.isLightningActive && this.game.powerup.isLightningActive());
      var fastActive = (this.temp && this.temp.speed > 1);

      ctx.save();

      for (let i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        let x = b.x,
          y = b.y,
          r = b.radius;
        if (!isFinite(x) || !isFinite(y) || !isFinite(r) || r <= 0) continue;

        // ---- A. Trails (Kept your exact logic) ----
        var fastActive = !!(this.temp && this.temp.speed > 1);

        if (fireOn && b.trail && b.trail.length) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let t = 0; t < b.trail.length; t++) {
            var p = b.trail[t];
            var u = (t + 1) / (b.trail.length + 1);
            var a = 0.06 + 0.18 * u;
            ctx.fillStyle = 'rgba(255,122,0,' + a.toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.0, p.r * (0.85 + 0.30 * u)), 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,220,120,' + (a * 0.75).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.0, p.r * (0.55 + 0.25 * u)), 0, Math.PI * 2, false);
            ctx.fill();
          }
          ctx.restore();
        } else if ((fastActive || chaosOn) && b.trail && b.trail.length) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          var tintBase = chaosOn ? 'rgba(156,39,176,' : 'rgba(255,255,255,';
          for (let t2 = 0; t2 < b.trail.length; t2++) {
            var p2 = b.trail[t2];
            var u2 = (t2 + 1) / (b.trail.length + 1);
            var a2 = 0.08 + 0.14 * u2;
            ctx.fillStyle = tintBase + a2.toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(p2.x, p2.y, Math.max(1.0, p2.r * (0.9 + 0.3 * u2)), 0, Math.PI * 2, false);
            ctx.fill();
          }
          ctx.restore();
        } else if (this.game.powerup.isLightningActive()) {
          ctx.save();
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Draw 3 random sparks
          for (let i = 0; i < 3; i++) {
            let angle = Math.random() * Math.PI * 2;
            let dist = r * 1.5;
            let sx = this.x + Math.cos(angle) * r;
            let sy = this.y + Math.sin(angle) * r;
            let ex = this.x + Math.cos(angle) * dist;
            let ey = this.y + Math.sin(angle) * dist;
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
          }
          ctx.stroke();
          ctx.restore();
        }

        // ---- B. Auras (Kept your exact logic) ----
        if (chaosOn) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.min(1, chaosPulse);
          ctx.fillStyle = '#b400ff';
          ctx.beginPath();
          ctx.arc(x, y, r * 1.6, 0, Math.PI * 2, true);
          ctx.fill();
          ctx.restore();
        }

        if (explodingOn) {
          var tt = Date.now() * 0.01;
          ctx.save();
          ctx.globalAlpha = 0.35 + 0.25 * Math.sin(tt);
          ctx.beginPath();
          ctx.arc(x, y, r + 3, 0, Math.PI * 2, false);
          ctx.fillStyle = '#ff7a00';
          ctx.fill();
          ctx.restore();
        }

        if (fireOn) {
          var ft = Date.now() * 0.016;
          var flick = 0.85 + 0.15 * Math.sin(ft);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.35 * flick;
          ctx.fillStyle = '#ff7a00';
          ctx.beginPath();
          ctx.arc(x, y, r * 2.0, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.globalAlpha = 0.45 * flick;
          ctx.fillStyle = '#ffd080';
          ctx.beginPath();
          ctx.arc(x, y, r * 1.4, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.restore();
        }

        if (lightningOn) {
          ctx.save();
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Draw 3 random sparks radiating from the ball center
          for (var k = 0; k < 3; k++) {
            var angle = Math.random() * Math.PI * 2;
            var dist = r * 1.6;
            var sx = b.x + Math.cos(angle) * r;
            var sy = b.y + Math.sin(angle) * r;
            var ex = b.x + Math.cos(angle) * dist;
            var ey = b.y + Math.sin(angle) * dist;
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
          }
          ctx.stroke();
          ctx.restore();
        }

        if (b.isSmashBall) {
          // 1. Draw Speed Lines (Trails behind ball)
          ctx.save();
          ctx.translate(b.x, b.y);
          var angle = Math.atan2(b.dy, b.dx); // Direction of motion
          ctx.rotate(angle);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Draw three diverging lines pointing backward (-x)
          ctx.moveTo(-b.radius, -2);
          ctx.lineTo(-b.radius * 4, -4);
          ctx.moveTo(-b.radius, 2);
          ctx.lineTo(-b.radius * 4, 4);
          ctx.moveTo(-b.radius * 0.8, 0);
          ctx.lineTo(-b.radius * 5, 0);
          ctx.stroke();
          ctx.restore();

          // 2. White Hot Glow
          ctx.save();
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // ---- C. The Ball Itself (OPTIMIZED) ----
        // Instead of calculating gradients, we just draw the cached image!
        var sprite = this.getSprite(r);
        var offset = r + 2; // Compensate for the padding in the sprite
        ctx.drawImage(sprite, x - offset, y - offset);
      }

      if (this.label && (this.countdown != null)) {
        this.drawDogeOverlay(ctx);
        this.drawAmongUsOverlay(ctx);
        this.drawLaunchLabel(ctx);
      }

      ctx.restore();

      // Sudden Death clamp (kept your logic)
      (function suddenSpeedClamp() {
        var g = this.game;
        if (!g || !g.suddenDeath) return;
        for (let bi = 0; bi < this.balls.length; bi++) {
          var b = this.balls[bi];
          if (!b) continue;
          var v = Math.sqrt(b.dx * b.dx + b.dy * b.dy) || 1;
          var want = this.cfg.speed * this.game.court.chunk * 1.15;
          if (v < want) {
            var k = want / v;
            b.dx *= k;
            b.dy *= k;
          }
        }
      }).call(this);
    }
  },

  //-----------------------------------------------------------------------------
  updateLasers: function (dt) {
    var active = this.powerup && this.powerup.isLasersActive && this.powerup.isLasersActive();
    if (active) {
      if (this.laserCooldown <= 0) {
        if (this.playSound) this.playSound('lasers');
        const w = Math.max(2, Math.floor(this.court.chunk * 0.15));
        var h = Math.max(8, Math.floor(this.court.chunk * 0.6));
        var vy = -this.court.chunk * 30;
        var y = this.paddle.top - 2;
        var segs = this.paddle.getSegments ? this.paddle.getSegments() : [{
          left: this.paddle.left,
          right: this.paddle.right,
          w: this.paddle.w
        }];
        if (segs.length === 1) {
          var x1 = this.paddle.left + Math.max(6, this.paddle.w * 0.18);
          var x2 = this.paddle.left + Math.min(this.paddle.w - 6, this.paddle.w * 0.82);
          this.lasers.push({
            x: x1 - w / 2,
            y: y,
            w: w,
            h: h,
            vy: vy
          });
          this.lasers.push({
            x: x2 - w / 2,
            y: y,
            w: w,
            h: h,
            vy: vy
          });
        } else {
          var lx = segs[0].left + segs[0].w / 2;
          var rx = segs[1].left + segs[1].w / 2;
          this.lasers.push({
            x: lx - w / 2,
            y: y,
            w: w,
            h: h,
            vy: vy
          });
          this.lasers.push({
            x: rx - w / 2,
            y: y,
            w: w,
            h: h,
            vy: vy
          });
        }
        this.laserCooldown = 0.12;
      } else {
        this.laserCooldown -= dt;
      }
    } else {
      this.laserCooldown = 0;
    }

    for (let i = this.lasers.length - 1; i >= 0; i--) {
      var L = this.lasers[i];
      L.y += L.vy * dt;

      // Portals
      var ports = this.getActivePortals && this.getActivePortals();
      if (ports && (!L.pcd || L.pcd <= 0)) {
        for (let pi = 0; pi < 2; pi++) {
          var p = ports[pi];
          const cx = L.x + L.w / 2,
            cy = L.y + L.h / 2;
          if (this.insidePortal(p, cx, cy)) {
            var q = ports[1 - pi];
            L.x = q.x - L.w / 2;
            L.y = q.y - q.r - L.h - 2;
            L.pcd = 0.18;
            break;
          }
        }
      } else if (L.pcd) {
        L.pcd -= dt;
      }

      if (L.y + L.h < this.court.top) {
        this.lasers.splice(i, 1);
        continue;
      }

      // === SYNERGY: LASERS DESTROY WALL SPIKES ===
      var hitSpike = false;
      if (this.spikes && this.spikes.items) {
        var S = this.spikes;
        var w = S.w,
          h = S.h,
          inset = S.inset;

        for (let k = S.items.length - 1; k >= 0; k--) {
          var sp = S.items[k];
          // Calculate Bounding Box for the spike
          var sMinX, sMaxX, sMinY, sMaxY;

          if (sp.side === 'left') {
            var base = this.court.wall.left.right + inset;
            sMinX = base;
            sMaxX = base + w;
            sMinY = sp.y - h / 2;
            sMaxY = sp.y + h / 2;
          } else if (sp.side === 'right') {
            var base = this.court.wall.right.left - inset;
            sMinX = base - w;
            sMaxX = base;
            sMinY = sp.y - h / 2;
            sMaxY = sp.y + h / 2;
          } else { // top
            var base = this.court.wall.top.bottom + inset;
            sMinX = sp.x - w / 2;
            sMaxX = sp.x + w / 2;
            sMinY = base;
            sMaxY = base + h;
          }

          // Simple AABB Collision
          if (L.x < sMaxX && L.x + L.w > sMinX &&
            L.y < sMaxY && L.y + L.h > sMinY) {

            // Destroy Spike
            S.items.splice(k, 1);
            this.playSound('explosion');
            if (this.particles && this.particles.explosion) {
              this.particles.explosion((sMinX + sMaxX) / 2, (sMinY + sMaxY) / 2, {
                count: 10,
                color: '#FF0000',
                size: 2
              });
            }
            this.lasers.splice(i, 1); // Laser absorbed
            hitSpike = true;
            break;
          }
        }
      }
      if (hitSpike) continue;

      // Brick Collision
      var hit = false;
      for (let n = 0; n < this.court.bricks.length && !hit; n++) {
        var brick = this.court.bricks[n];
        if (brick.hit) continue;
        if (L.x < brick.right && L.x + L.w > brick.left && L.y < brick.bottom && L.y + L.h > brick.top) {
          this.damageBrick(brick, {
            from: 'laser'
          });
          this.lasers.splice(i, 1);
          hit = true;
        }
      }
    }
  },
  drawLasers: function (ctx) {
    if (!this.lasers || !this.lasers.length) return;
    ctx.save();
    ctx.fillStyle = '#ffd400';
    for (let i = 0; i < this.lasers.length; i++) {
      var L = this.lasers[i];
      ctx.fillRect(L.x, L.y, L.w, L.h);
    }
    ctx.restore();
  },
  //=============================================================================
  // Particles (subtle pixel burst on brick break)
  //=============================================================================
  Particles: {
    initialize: function (game) {
      this.game = game;
      this.items = [];
    },
    // Draws an expanding, fading ring. Call with particles.ring(x, y, {color, maxR, life})
    ring: function (x, y, opts) {
      opts = opts || {};
      var p = {
        kind: 'ring',
        x: x,
        y: y,
        r: 2,
        maxR: opts.maxR || 36,
        life: opts.life || 240,
        age: 0,
        color: opts.color || '#ffd66b'
      };
      this.items.push(p);
    },
    // particles.explosion(x, y, {count, color, spread})
    explosion: function (x, y, opts) {
      opts = opts || {};
      var N = opts.count || 36;
      var spread = opts.spread || 2.0;
      var base = Math.random() * Math.PI * 2;
      for (let n = 0; n < N; n++) {
        var a = base + (n / N) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / 10);
        var s = 140 + Math.random() * 120;
        this.items.push({
          kind: 'shard',
          x: x,
          y: y,
          vx: Math.cos(a) * s * spread * 0.01,
          vy: Math.sin(a) * s * spread * 0.01,
          life: 380 + Math.random() * 220,
          age: 0,
          w: 2 + Math.random() * 2,
          h: 2 + Math.random() * 2,
          color: opts.color || '#ffdca6'
        });
      }
    },
    explode: function (brick, dir) {
      if (!brick || brick.hit) return;

      // Optimization: Fixed low count (8-12 particles) regardless of brick size.
      // Previous code calculated areaUnits which could spike to 28+ particles.
      var count = 8 + Math.floor(Math.random() * 4);

      var chunk = this.game.court.chunk;
      var size = Math.max(2, Math.floor(chunk / 5)); // Slightly larger particles

      for (let i = 0; i < count; i++) {
        var ang = Math.random() * Math.PI * 2;
        var spd = (chunk * 3) * (0.4 + Math.random() * 0.6);

        this.items.push({
          x: brick.x + brick.w / 2,
          y: brick.y + brick.h / 2,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd * 0.5 - chunk * 1.0, // Slight upward bias

          // Optimization: Shorter life = less overlap = higher FPS
          life: 0.3 + Math.random() * 0.3,
          maxlife: 0.6,

          // Optimization: 'shard' draws a simple fillRect (fast) vs circle (slow)
          kind: 'shard',
          w: size,
          h: size,
          color: brick.color
        });
      }
    },
    burn: function (brick) {
      if (!brick || brick.hit) return;
      // ember-like upward burn: warmer palette, lighter gravity, gentle drift
      var emberColors = ['#ffb74d', '#ff8a65', '#ffd54f', '#ffcc80', '#f4511e'];
      var areaUnits = (brick.w * brick.h) / (this.game.court.chunk * this.game.court.chunk);
      var count = Math.max(10, Math.min(32, Math.floor(areaUnits * 7)));
      for (let i = 0; i < count; i++) {
        var col = emberColors[(Math.random() * emberColors.length) | 0];
        var size = Math.max(1, Math.floor(this.game.court.chunk / 7)) * (0.6 + Math.random() * 0.7);
        var vx = (Math.random() - 0.5) * this.game.court.chunk * 10.0; // gentle horizontal drift
        var vy = -this.game.court.chunk * (8 + Math.random() * 12); // strong upward initial
        this.items.push({
          x: brick.x + brick.w / 2,
          y: brick.y + brick.h / 2,
          vx: vx,
          vy: vy,
          life: 0.55 + Math.random() * 0.45,
          maxlife: 0.55 + Math.random() * 0.45,
          size: size,
          color: col,
          mode: 'burn',
          g: this.game.court.chunk * 3.0 // lighter gravity than default
        });
      }
    },
    update: function (dt) {
      if (!this.items.length) return;
      var baseG = this.game.court.chunk * 7.5;
      for (let i = this.items.length - 1; i >= 0; i--) {
        var p = this.items[i];
        var g = (p.g != null) ? p.g : baseG;
        p.vy += g * dt * 0.5;
        p.age += dt;
        if (p.kind === 'ring') {
          var t = p.age / p.life;
          p.r = 2 + (p.maxR - 2) * t;
          if (t >= 1) {
            this.items.splice(i, 1);
            continue;
          }
        }
        if (p.kind === 'shard') {
          p.vy += 0.0006 * dt; // gentle gravity
          p.x += p.vx * dt * 0.06;
          p.y += p.vy * dt * 0.06;
          if (p.age >= p.life) {
            this.items.splice(i, 1);
            continue;
          }
        }
        if (p.mode === 'burn') {
          p.size *= 0.985;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) this.items.splice(i, 1);
      }
    },
    draw: function (ctx) {
      if (!this.items.length) return;

      // Batch 1: Rings (require individual styles, kept separate)
      for (let i = 0; i < this.items.length; i++) {
        var p = this.items[i];
        if (p.kind === 'ring') {
          var t = p.age / p.life;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - t);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2 * (1 - t) + 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Batch 2: Shards/Sparks (The optimization)
      // We group them to avoid setting context state repeatedly
      ctx.save();

      // Optimization: Don't use globalCompositeOperation 'lighter' for everything if not needed,
      // but if we do, set it ONCE.
      // We will assume standard blending for performance unless 'burn' is active.

      for (let i = 0; i < this.items.length; i++) {
        var p = this.items[i];
        if (p.kind === 'ring') continue; // Already drawn

        var alpha = (p.kind === 'shard') ? Math.max(0, 1 - p.age / p.life) : Math.max(0, p.life / p.maxlife);
        if (alpha <= 0.01) continue;

        // We have to set color per particle, but we avoid save/restore
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color || '#888';

        // Draw directly
        var s = p.size || p.w || 2;
        // Integer coordinates (|0) are faster for canvas to render
        ctx.fillRect((p.x) | 0, (p.y) | 0, s, (p.h || s));
      }
      ctx.restore();
    }
  }
}

//=============================================================================
// Background & Decoration System
//=============================================================================
// Animated Parallax Background (v27: Fixed Particle Coordinates)
Breakout.BG = {
  initialize: function (game, cfg) {
    this.game = game;
    this.cfg = cfg || {};
    this.t = 0;
    this.w = game.width;
    this.h = game.height;

    // --- LEGACY OBJECTS ---
    this.stars = [];
    this.clouds = [];
    this.comets = [];
    this.matrixCols = [];
    this.cityMoon = {
      x: 0.78,
      y: 0.15,
      r: 0.13,
      blinkT: 0
    };
    this.ufo = {
      active: false,
      x: 0,
      y: 0,
      t: 0,
      cd: 5 + Math.random() * 15
    };
    this.bigfoot = {
      active: false,
      x: 0,
      y: 0,
      frame: 0,
      cd: 10 + Math.random() * 20
    };
    this.flamingo = {
      active: false,
      x: 0,
      y: 0,
      frame: 0,
      cd: 8 + Math.random() * 15
    };
    this.pcb = {
      traces: [],
      spawnT: 0
    };

    // --- PROCEDURAL OBJECTS ---
    this.neonSign = {
      active: false,
      x: 0,
      y: 0,
      text: "SYNTHWAVE",
      flicker: 0,
      cd: 5
    };

    // --- DECORATION & PARTICLE SYSTEM ---
    this.decorations = [];
    this.rain = [];
    this.images = {};

    this.DECOR_DEFS = {
      'synthwave': [{
        name: 'car',
        src: ['./images/decor/outrun_car.png', './images/decor/outrun_car2.png', './images/decor/outrun_car3.png'],
        yMin: 0.80,
        yMax: 0.92,
        speed: 200,
        scale: 1.3,
        prob: 0.001,
        effect: 'car'
      }, {
        name: 'shades',
        src: ['./images/decor/shades.png', './images/decor/shades2.png', './images/decor/shades3.png'],
        yMin: 0.20,
        yMax: 0.50,
        speed: 40,
        scale: 0.8,
        prob: 0.002
      }],
      'city': [
        // 1. ANIMATED TAXI
        {
          name: 'taxi-1',
          src: './images/decor/taxi-sprite.png',
          yMin: 0.88,
          yMax: 0.96,
          speed: 220,
          scale: 0.9,
          prob: 0.002,
          frames: 3,
          frameW: 192,
          frameSpeed: 0.35,
          effect: 'car'
        },
        // 2. ANIMATED TAXI (Ecto-1)
        {
          name: 'taxi-2',
          src: './images/decor/taxi-2-sprite.png',
          yMin: 0.88,
          yMax: 0.96,
          speed: 240,
          scale: 0.9,
          prob: 0.002,
          frames: 3,
          frameW: 196,
          frameSpeed: 0.35,
          effect: 'car'
        },
        // 3. ANIMATED FLYING DELOREAN (No 'car' effect = smooth flight)
        {
          name: 'taxi-3',
          src: './images/decor/taxi-3-sprite.png',
          yMin: 0.88,
          yMax: 0.96,
          speed: 240,
          scale: 0.9,
          prob: 0.002,
          frames: 3,
          frameW: 206,
          frameSpeed: 0.35,
        },
        // 4. ANIMATED TMNT PARTY WAGON
        {
          name: 'taxi-4',
          src: './images/decor/taxi-4-sprite.png',
          yMin: 0.88,
          yMax: 0.96,
          speed: 240,
          scale: 0.9,
          prob: 0.002,
          frames: 3,
          frameW: 127,
          frameSpeed: 0.35,
          effect: 'car'
        },
        // 5. ANIMATED KITT
        {
          name: 'taxi-5',
          src: './images/decor/taxi-5-sprite.png',
          yMin: 0.88,
          yMax: 0.96,
          speed: 240,
          scale: 0.9,
          prob: 0.002,
          frames: 3,
          frameW: 192,
          frameSpeed: 0.35,
          effect: 'car'
        },
        // 6. ANIMATED MYSTERY MACHINE
        {
          name: 'taxi-6',
          src: './images/decor/taxi-6-sprite.png',
          yMin: 0.88,
          yMax: 0.96,
          speed: 240,
          scale: 0.9,
          prob: 0.002,
          frames: 3,
          frameW: 145,
          frameSpeed: 0.35,
          effect: 'car'
        },
        // 7. STATIC TAXIS
        {
          name: 'taxi-static',
          src: ['./images/decor/taxi-7.png'],
          yMin: 0.88,
          yMax: 0.96,
          speed: 220,
          scale: 0.9,
          prob: 0.004,
          effect: 'car'
        }
      ],
      'space': [{
        name: 'astro',
        src: './images/decor/astronaut.png',
        yMin: 0.2,
        yMax: 0.8,
        speed: 25,
        scale: 0.6,
        prob: 0.002,
        drift: true
      }, {
        name: 'ship-special',
        src: './images/decor/ship.png',
        yMin: 0.1,
        yMax: 0.8,
        speed: 350,
        scale: 1.0,
        prob: 0.001,
        effect: 'car'
      }, {
        name: 'ship-fleet',
        src: [
          './images/decor/ship-2.png', './images/decor/ship-3.png', './images/decor/ship-4.png', './images/decor/ship-5.png', './images/decor/ship-6.png'
        ],
        yMin: 0.1,
        yMax: 0.8,
        speed: 350,
        scale: 1.0,
        prob: 0.003
      }],
      'forest': [{
        name: 'dragon',
        src: './images/decor/dragon.png',
        yMin: 0.1,
        yMax: 0.4,
        speed: 60,
        scale: 0.8,
        prob: 0.002,
        frames: 3,
        frameW: 191,
        frameSpeed: 0.15
      }, {
        name: 'navi',
        src: './images/decor/navi.png',
        yMin: 0.78,
        yMax: 0.85,
        speed: 80,
        scale: 0.5,
        prob: 0.002
      }, ],
      'circuit': [
        // Lightcycle: Fast, laser trail
        {
          name: 'cycle',
          src: './images/decor/lightcycle.png',
          yMin: 0.82,
          yMax: 0.92,
          speed: 450,
          scale: 1.0,
          prob: 0.004,
          effect: 'lightcycle'
        },
        // Gridbug: Increased prob for testing
        {
          name: 'gridbug',
          src: './images/decor/gridbug-sprite.png',
          yMin: 0.75,
          yMax: 0.85,
          speed: 120,
          scale: 0.8,
          prob: 0.006,
          frames: 4,
          frameW: 66,
          frameSpeed: 0.2
        },
        // Tank: Increased prob for testing
        {
          name: 'tank',
          src: './images/decor/tank-sprite.png',
          yMin: 0.78,
          yMax: 0.88,
          speed: 70,
          scale: 1.3,
          prob: 0.004,
          frames: 2,
          frameW: 68,
          frameSpeed: 0.75
        },
        // Recognizer
        {
          name: 'recog',
          src: './images/decor/tron-recognizer.png',
          yMin: 0.1,
          yMax: 0.4,
          speed: 80,
          scale: 1.0,
          prob: 0.003
        }
      ]
    };

    this.makeStars();
    this.layers = [];
    this.level = 0;
    this.theme = "synthwave";
    this.palette = this.extractPalette();
    if (!this.game && this.parent) this.game = this.parent;

    this.setTheme(this.theme);
    this.pulse = 0;
    this.beat = null;
    this.scanlines = null;
  },

  init: function () {
    if (!this.stars.length) this.makeStars();
  },

  setTheme: function (themeName) {
    this.theme = (themeName || this.theme || 'synthwave');

    if (this.theme === 'circuit') {
      this.crt = {
        enabled: true,
        vignetteAlpha: 0.20,
        lineAlpha: 0.06,
        spacing: 2,
        rgbGlow: true
      };
      this.pcb = {
        traces: [],
        spawnT: 0
      };
    } else {
      this.crt = {
        enabled: false
      };
    }

    var defs = this.DECOR_DEFS[this.theme];
    if (defs) {
      for (var i = 0; i < defs.length; i++) {
        var d = defs[i];
        var sources = Array.isArray(d.src) ? d.src : [d.src];
        for (var k = 0; k < sources.length; k++) {
          var s = sources[k];
          if (!this.images[s]) {
            var img = new Image();
            img.src = s;
            this.images[s] = img;
          }
        }
      }
    }

    this.decorations = [];
    this.rain = [];
    this.palette = this.extractPalette();
    this.buildLayers();
  },

  setBeatClock: function (beat) {
    this.beat = beat || null;
  },
  onBeat: function () {
    this.pulse = 1;
  },

  extractPalette: function () {
    var bricks = (this.game && this.game.court && this.game.court.bricks) ? this.game.court.bricks : [];
    var hist = {};
    for (let i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      if (b.hit || !b.color) continue;
      hist[b.color] = (hist[b.color] || 0) + 1;
    }
    var defaults = ["#0e0e1a", "#ff3e9e", "#5ef2ff", "#ffcc33", "#8b5cf6"];
    var colors = Object.keys(hist).sort(function (a, b) {
      return (hist[b] - hist[a]);
    });
    if (!colors.length) colors = defaults;
    return {
      bg: colors[4] || defaults[0],
      main: colors[0] || defaults[1],
      acc: colors[1] || defaults[2],
      warm: colors[2] || defaults[3],
      cool: colors[3] || defaults[4]
    };
  },

  buildLayers: function () {
    var P = this.palette;
    this.layers.length = 0;

    if (this.theme === "city") {
      this.buildCityBlocks(this.w, this.h);
      this.layers.push({
        kind: "city-moon",
        opacity: 1
      });
    } else if (this.theme === "circuit") {
      if (!this.matrixCols.length) {
        var cols = 15;
        for (let c = 0; c < cols; c++) {
          this.matrixCols.push({
            x: c / cols,
            y: Math.random(),
            speed: 0.1 + Math.random() * 0.3,
            t: 0
          });
        }
      }
    } else if (this.theme === "forest") {
      if (!this.clouds.length) {
        for (let i = 0; i < 3; i++) {
          this.clouds.push({
            x: Math.random(),
            y: 0.10 + 0.35 * Math.random(),
            s: 0.10 + Math.random() * 0.10,
            dx: 0.005 + Math.random() * 0.02,
            a: 0.35 + Math.random() * 0.25
          });
        }
      }
    }
  },

  resize: function (w, h) {
    this.w = w;
    this.h = h;
    if (!this.stars || !this.stars.length) this.makeStars();
    if (this.crt.enabled) this.buildScanlines();
    if (this.theme === 'city') this.buildCityBlocks(w, h);
  },

  makeStars: function (n, big) {
    const w = this.w || 800,
      h = this.h || 600;
    var stars = [];
    n = n || 100;
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        s: big ? (1.5 + Math.random() * 2) : (1 + Math.random()),
        a: 0.5 + Math.random() * 0.5,
        t: Math.random() * 6.283,
        dx: (Math.random() - 0.5) * 0.02,
        dy: (Math.random() - 0.5) * 0.01
      });
    }
    this.stars = stars;
    return stars;
  },

  spawnDecor: function (def) {
    if (!def) return;
    var src = Array.isArray(def.src) ? def.src[Math.floor(Math.random() * def.src.length)] : def.src;
    var img = this.images[src];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    var isSprite = !!def.frames;
    var baseW = isSprite ? def.frameW : img.width;

    var w = baseW * (def.scale || 1);
    var h = img.height * (def.scale || 1);
    var y = this.h * (def.yMin + Math.random() * (def.yMax - def.yMin));

    var dir = (Math.random() > 0.5) ? 1 : -1;
    var startX = (dir === 1) ? -w - 50 : this.w + 50;

    var obj = {
      img: img,
      name: def.name,
      x: startX,
      y: y,
      w: w,
      h: h,
      vx: def.speed * dir,
      vy: (def.drift ? (Math.random() - 0.5) * 10 : 0),
      float: def.float || false,
      effect: def.effect || false,
      particles: [],
      trail: [],
      t: 0
    };

    if (isSprite) {
      obj.frames = def.frames;
      obj.frameW = def.frameW;
      obj.frameSpeed = def.frameSpeed || 0.1;
      obj.frame = 0;
      obj.animT = 0;
    }

    if (def.name === 'dragon' || def.name === 'astro' || def.name === 'navi') {
      obj.hue = Math.floor(Math.random() * 360);
    }

    this.decorations.push(obj);
  },

  update: function (dt) {
    this.t = (this.t || 0) + dt;
    if (this.pulse > 0) this.pulse = Math.max(0, this.pulse - dt * 1.2);

    var defs = this.DECOR_DEFS[this.theme];
    if (defs) {
      for (var k = 0; k < defs.length; k++) {
        if (Math.random() < defs[k].prob) this.spawnDecor(defs[k]);
      }
    }

    for (var i = this.decorations.length - 1; i >= 0; i--) {
      var d = this.decorations[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.t += dt;

      if (d.float) d.y += Math.sin(d.t * 2) * 0.3;

      if (d.frames) {
        d.animT += dt;
        if (d.animT >= d.frameSpeed) {
          d.animT = 0;
          d.frame = (d.frame + 1) % d.frames;
        }
      }

      if (d.effect === 'car') {
        d.yOffset = Math.sin(d.t * 20) * 0.5;
        if (Math.random() < 0.3) {
          var isDust = Math.random() > 0.5;
          var pX = (d.vx > 0) ? d.x + 10 : d.x + d.w - 10;
          var pY = d.y + d.h - (isDust ? 2 : 10);
          d.particles.push({
            x: pX,
            y: pY,
            vx: (d.vx > 0 ? -1 : 1) * (20 + Math.random() * 20),
            vy: isDust ? -(Math.random() * 10) : -(10 + Math.random() * 20),
            life: 1.0,
            size: isDust ? 2 + Math.random() * 2 : 3 + Math.random() * 3,
            color: isDust ? 'rgba(120,100,80,' : 'rgba(200,200,200,'
          });
        }
        for (var p = d.particles.length - 1; p >= 0; p--) {
          var pt = d.particles[p];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.life -= dt * 1.5;
          if (pt.life <= 0) d.particles.splice(p, 1);
        }
      }

      if (d.effect === 'lightcycle') {
        var tx = (d.vx > 0) ? d.x : d.x + d.w;
        var ty = d.y + d.h * 0.8;
        d.trail.push({
          x: tx,
          y: ty
        });
        if (d.trail.length > 40) d.trail.shift();
      }

      if ((d.vx > 0 && d.x > this.w + 100) || (d.vx < 0 && d.x < -d.w - 100)) this.decorations.splice(i, 1);
    }

    if (this.theme === 'city') {
      if (Math.random() < 0.4) {
        for (var r = 0; r < 4; r++) {
          this.rain.push({
            x: Math.random() * this.w,
            y: -20,
            vy: 500 + Math.random() * 300,
            len: 15 + Math.random() * 15
          });
        }
      }
      for (var ri = this.rain.length - 1; ri >= 0; ri--) {
        var drop = this.rain[ri];
        drop.y += drop.vy * dt;
        if (drop.y > this.h) this.rain.splice(ri, 1);
      }
    } else if (this.rain.length > 0) {
      this.rain = [];
    }

    // CIRCUIT TRACERS
    if (this.theme === 'circuit') {
      for (let m = 0; m < this.matrixCols.length; m++) {
        var col = this.matrixCols[m];
        col.t += dt;
        if (col.t > 0.05) {
          col.y += col.speed * col.t;
          col.t = 0;
          if (col.y > 1.3) col.y = -0.3 - Math.random() * 0.2;
        }
      }

      this.pcb.spawnT -= dt;
      if (this.pcb.spawnT <= 0) {
        this.pcb.spawnT = 0.5 + Math.random();
        this.pcb.traces.push({
          head: {
            x: Math.random() * this.w,
            y: Math.random() * this.h
          },
          path: [],
          dir: (Math.floor(Math.random() * 4)),
          life: 1.0,
          speed: 100 + Math.random() * 100
        });
      }
      for (var i = this.pcb.traces.length - 1; i >= 0; i--) {
        var tr = this.pcb.traces[i];
        tr.life -= dt * 0.3;
        if (tr.life <= 0) {
          this.pcb.traces.splice(i, 1);
          continue;
        }
        var move = tr.speed * dt;
        if (tr.dir === 0) tr.head.y -= move;
        if (tr.dir === 1) tr.head.x += move;
        if (tr.dir === 2) tr.head.y += move;
        if (tr.dir === 3) tr.head.x -= move;
        if (!tr.path.length || Math.hypot(tr.head.x - tr.path[tr.path.length - 1].x, tr.head.y - tr.path[tr.path.length - 1].y) > 10) {
          tr.path.push({
            x: tr.head.x,
            y: tr.head.y
          });
        }
        if (Math.random() < 0.05) tr.dir = (tr.dir + (Math.random() > 0.5 ? 1 : 3)) % 4;
      }
    }

    // LEGACY UPDATES
    if (this.theme === "space" || this.theme === "city") {
      this._cometCD = (this._cometCD || 0) - dt;
      if (this._cometCD <= 0 && Math.random() < 0.01) {
        if (!this.comets) this.comets = [];
        var fromLeft = Math.random() < 0.5;
        this.comets.push({
          x: fromLeft ? -50 : this.w + 50,
          y: Math.random() * this.h * 0.6,
          vx: (fromLeft ? 1 : -1) * (300 + Math.random() * 200),
          vy: 40 + Math.random() * 80,
          life: 1.5,
          len: 80 + Math.random() * 60
        });
        this._cometCD = 8 + Math.random() * 15;
      }
      for (let i = this.comets.length - 1; i >= 0; i--) {
        var c = this.comets[i];
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.life -= dt;
        if (c.life <= 0) this.comets.splice(i, 1);
      }
    }
    if (this.theme === "forest") {
      for (let i = 0; i < this.clouds.length; i++) {
        var cl = this.clouds[i];
        cl.x += cl.dx * dt * 0.08;
        if (cl.x > 1.2) cl.x = -0.4;
      }
      if (!this.bigfoot.active) {
        this.bigfoot.cd -= dt;
        if (this.bigfoot.cd <= 0) {
          this.bigfoot.active = true;
          this.bigfoot.x = -40;
          this.bigfoot.y = this.h * 0.80;
          this.bigfoot.cd = 25 + Math.random() * 30;
        }
      } else {
        this.bigfoot.x += dt * 35;
        this.bigfoot.frame += dt * 4;
        if (this.bigfoot.x > this.w + 50) this.bigfoot.active = false;
      }
    } else if (this.theme === "space") {
      if (!this.ufo.active) {
        this.ufo.cd -= dt;
        if (this.ufo.cd <= 0) {
          this.ufo.active = true;
          this.ufo.x = Math.random() < 0.5 ? -60 : this.w + 60;
          this.ufo.y = this.h * (0.15 + Math.random() * 0.25);
          this.ufo.vx = (this.ufo.x < 0 ? 1 : -1) * (60 + Math.random() * 40);
          this.ufo.t = 0;
          this.ufo.cd = 15 + Math.random() * 25;
        }
      } else {
        this.ufo.x += this.ufo.vx * dt;
        this.ufo.t += dt;
        this.ufo.y += Math.sin(this.ufo.t * 3) * 0.3;
        if ((this.ufo.vx > 0 && this.ufo.x > this.w + 60) || (this.ufo.vx < 0 && this.ufo.x < -60)) this.ufo.active = false;
      }
    } else if (this.theme === "city") {
      this.cityMoon.blinkT = Math.max(0, this.cityMoon.blinkT - dt);
      if (Math.random() < 0.002 * dt) this.cityMoon.blinkT = 0.22;
    } else if (this.theme === "synthwave") {
      if (!this.flamingo.active) {
        this.flamingo.cd -= dt;
        if (this.flamingo.cd <= 0) {
          this.flamingo.active = true;
          this.flamingo.x = -60;
          this.flamingo.y = this.h * (0.1 + Math.random() * 0.25);
          this.flamingo.cd = 15 + Math.random() * 25;
        }
      } else {
        this.flamingo.x += dt * 120;
        this.flamingo.frame += dt * 8;
        this.flamingo.y += Math.sin(this.flamingo.frame) * 0.5;
        if (this.flamingo.x > this.w + 60) this.flamingo.active = false;
      }
      if (!this.neonSign.active) {
        this.neonSign.cd -= dt;
        if (this.neonSign.cd <= 0) {
          this.neonSign.active = true;
          this.neonSign.y = this.h * 0.15;
          this.neonSign.x = this.w + 150;
          this.neonSign.cd = 10 + Math.random() * 15;
        }
      } else {
        this.neonSign.x -= dt * 60;
        this.neonSign.flicker += dt;
        if (this.neonSign.x < -300) this.neonSign.active = false;
      }
    }
  },

  draw: function (ctx, w, h, dt, theme) {
    var w = this.w || this.game.width,
      h = this.h || this.game.height;
    var P = (this.pulse || 0);
    var t = this.theme;

    // --- 1. GRADIENTS ---
    if (t === 'synthwave') {
      var horizonY = Math.floor(h * 0.65);
      var gSky = ctx.createLinearGradient(0, 0, 0, horizonY);
      gSky.addColorStop(0, '#2b003b');
      gSky.addColorStop(0.6, '#5e0042');
      gSky.addColorStop(1, '#ff6e7f');
      ctx.fillStyle = gSky;
      ctx.fillRect(0, 0, w, horizonY);
      var gSea = ctx.createLinearGradient(0, horizonY, 0, h);
      gSea.addColorStop(0, '#1a0b2e');
      gSea.addColorStop(1, '#2b003b');
      ctx.fillStyle = gSea;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      ctx.save();
      for (let i = 0; i < this.stars.length; i++) {
        var st = this.stars[i];
        if (st.y * h < horizonY) {
          var tw = 0.6 + 0.4 * Math.sin(this.t * 1.8 + st.t);
          ctx.globalAlpha = (st.a * tw) * 0.9;
          ctx.fillStyle = '#ffffff';
          let x = (st.x + this.t * st.dx * 0.06) % 1;
          if (x < 0) x += 1;
          var y = (st.y + this.t * st.dy * 0.06) % 1;
          if (y < 0) y += 1;
          ctx.fillRect((x * w) | 0, (y * h) | 0, st.s, st.s);
        }
      }
      ctx.restore();

      var sx = w * 0.5,
        sy = h * 0.40;
      var baseR = Math.min(w, h) * 0.18;
      var grow = 1 + P * 0.13;
      ctx.save();
      var refY = horizonY + (horizonY - sy);
      ctx.filter = 'blur(4px)';
      ctx.scale(1, 0.6);
      var rgRef = ctx.createRadialGradient(sx, (refY / 0.6), baseR * 0.5, sx, (refY / 0.6), baseR * grow);
      rgRef.addColorStop(0, 'rgba(255, 0, 85, 0.6)');
      rgRef.addColorStop(1, 'rgba(255, 215, 0, 0.0)');
      ctx.fillStyle = rgRef;
      ctx.arc(sx, (refY / 0.6), baseR * grow, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      var rg = ctx.createLinearGradient(0, sy - baseR, 0, sy + baseR);
      rg.addColorStop(0, '#ffd700');
      rg.addColorStop(1, '#ff0055');
      ctx.save();
      ctx.fillStyle = rg;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 40 * grow;
      ctx.beginPath();
      ctx.arc(sx, sy, baseR * grow, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.restore();
    } else {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      if (t === 'city') {
        g.addColorStop(0, '#001D37');
        g.addColorStop(0.4, '#013155');
        g.addColorStop(1, '#01162E');
      } else if (t === 'space') {
        g.addColorStop(0, '#010b19');
        g.addColorStop(0.4, '#021631');
        g.addColorStop(1, '#010b19');
      } else if (t === 'forest') {
        g.addColorStop(0, '#281f72');
        g.addColorStop(0.4, '#EBD587');
        g.addColorStop(1, '#6F624F');
      } else if (t === 'circuit') {
        g.addColorStop(0, '#000500');
        g.addColorStop(0.5, '#001a00');
        g.addColorStop(1, '#002200');
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Stars
      if (t === 'city' || t === 'space') {
        if (!this.stars || !this.stars.length) this.makeStars();
        ctx.save();
        for (let i = 0; i < this.stars.length; i++) {
          var st = this.stars[i];
          var tw = 0.6 + 0.4 * Math.sin(this.t * 1.8 + st.t);
          let x = (st.x + this.t * st.dx * 0.06) % 1;
          if (x < 0) x += 1;
          var y = (st.y + this.t * st.dy * 0.06) % 1;
          if (y < 0) y += 1;
          ctx.globalAlpha = (st.a * tw) * 0.9;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect((x * w) | 0, (y * h) | 0, st.s, st.s);
        }
        ctx.restore();
      }

      // Comets
      if ((t === 'city' || t === 'space') && this.comets.length) {
        ctx.save();
        for (let i = 0; i < this.comets.length; i++) {
          var k = this.comets[i];
          var tailLen = k.len || 80;
          var speed = Math.hypot(k.vx, k.vy) || 1;
          var lx = k.x - (k.vx / speed) * tailLen;
          var ly = k.y - (k.vy / speed) * tailLen;
          var g = ctx.createLinearGradient(lx, ly, k.x, k.y);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(1, 'rgba(255,255,255,0.9)');
          ctx.strokeStyle = g;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(k.x, k.y);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.arc(k.x, k.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Forest Sky
      if (t === 'forest') {
        ctx.save();
        for (let i = 0; i < this.clouds.length; i++) {
          var cl = this.clouds[i];
          const cx = (cl.x * w) | 0,
            cy = (cl.y * h) | 0;
          var r = (Math.min(w, h) * cl.s) | 0;
          ctx.globalAlpha = 0.40 + 0.30 * cl.a;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(cx, cy, r * 2.2, r * 1.0, 0, 0, Math.PI * 2);
          } else {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(2.2, 1.0);
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.restore();
          }
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx - r * 1.0, cy - r * 0.6, r * 0.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + r * 0.2, cy - r * 0.8, r * 1.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + r * 1.2, cy - r * 0.5, r * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        this.drawRainbow(ctx, {
          opacity: 0.9
        });
        var sx = w * 0.18,
          sy = h * 0.18,
          sr = Math.min(w, h) * (0.10 + 0.02 * P);
        var rg = ctx.createRadialGradient(sx, sy, Math.max(2, sr * 0.08), sx, sy, sr);
        rg.addColorStop(0, 'rgba(255,210,122,0.95)');
        rg.addColorStop(1, 'rgba(255,210,122,0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- 2. GRID ---
    var horizon = Math.floor(h * (0.78 + 0.01 * P)) + 0.5;
    if (t === 'synthwave') horizon = Math.floor(h * 0.65);

    var vpX = w * 0.5,
      vpY = (t === 'synthwave') ? horizon : h + h * 0.14;
    ctx.save();
    ctx.lineWidth = (t === 'synthwave') ? 2 : 1;
    // Circuit: Neon Cyan Grid
    if (t === 'circuit') ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    else if (t === 'synthwave') ctx.strokeStyle = 'rgba(255,0,255,0.4)';
    else ctx.strokeStyle = 'rgba(255,255,255,' + (0.07 + 0.05 * Math.min(1, P)).toFixed(3) + ')';

    var cols = 28,
      step = w / cols;
    for (let c = -3; c <= cols + 3; c++) {
      let x = Math.floor(c * step + (P * 0.8) * Math.sin(this.t * 5 + c * 0.7)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, horizon);
      ctx.lineTo(vpX, vpY);
      ctx.stroke();
    }
    var y = horizon + 6,
      dy = 8;
    while (y < h) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      dy *= 1.12;
      y += dy;
    }
    ctx.restore();

    // --- 3. THEME EXTRAS ---
    this.drawThemeExtras(ctx);

    // --- 4. DECORATIONS ---
    ctx.save();
    for (var i = 0; i < this.decorations.length; i++) {
      var d = this.decorations[i];

      ctx.save();

      // DRAW PARTICLES & TRAILS (BEFORE IMAGE)
      // Fixed: Draw at pt.x, pt.y (World Coordinates)
      if (d.particles && d.particles.length) {
        for (var p = 0; p < d.particles.length; p++) {
          var pt = d.particles[p];
          ctx.fillStyle = pt.color + pt.life + ')';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // CAR POSITION
      if (d.vx < 0) {
        ctx.translate(d.x + d.w, d.y);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(d.x, d.y);
      }

      // APPLY HUE (Only affects the image)
      if (d.hue !== undefined) {
        ctx.filter = 'hue-rotate(' + d.hue + 'deg)';
      }

      var bob = (d.float || d.effect === 'car') ? (d.yOffset || 0) : 0;
      if (d.float) bob = Math.sin(d.t * 2) * 2;

      if (d.frames) {
        var sx = d.frame * d.frameW;
        ctx.drawImage(d.img, sx, 0, d.frameW, d.img.height, 0, bob, d.w, d.h);
      } else {
        ctx.drawImage(d.img, 0, bob, d.w, d.h);
      }

      ctx.restore();

      // DRAW LIGHTCYCLE TRAIL (In World Space, after restore)
      if (d.effect === 'lightcycle' && d.trail && d.trail.length > 1) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(d.trail[0].x, d.trail[0].y);
        for (var k = 1; k < d.trail.length; k++) ctx.lineTo(d.trail[k].x, d.trail[k].y);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    // --- 5. RAIN ---
    if (this.rain.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var i = 0; i < this.rain.length; i++) {
        var r = this.rain[i];
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.len);
      }
      ctx.stroke();
      ctx.restore();
    }

    // --- 6. CIRCUIT TRACERS ---
    if (this.theme === 'circuit') {
      // PCB Traces (Background)
      ctx.save();
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#0f0';
      ctx.lineWidth = 2;
      for (var i = 0; i < this.pcb.traces.length; i++) {
        var tr = this.pcb.traces[i];
        ctx.strokeStyle = 'rgba(50, 255, 50, ' + tr.life + ')';
        ctx.beginPath();
        if (tr.path.length > 0) {
          ctx.moveTo(tr.path[0].x, tr.path[0].y);
          for (var j = 1; j < tr.path.length; j++) ctx.lineTo(tr.path[j].x, tr.path[j].y);
          ctx.lineTo(tr.head.x, tr.head.y);
          ctx.stroke();
        }
        ctx.fillStyle = '#aff';
        ctx.fillRect(tr.head.x - 2, tr.head.y - 2, 4, 4);
      }
      ctx.restore();

      // Matrix Rain (Midground)
      if (this.matrixCols.length) {
        ctx.save();
        ctx.font = "14px monospace";
        ctx.textAlign = 'center';
        for (let i = 0; i < this.matrixCols.length; i++) {
          var col = this.matrixCols[i];
          const cx = (col.x * w) | 0;
          var cy = (col.y * h) | 0;
          var rows = 12;
          for (let r = 0; r < rows; r++) {
            var ch = 0x30 + ((i * r + (r << 2)) % 42);
            var y = cy + r * 16;
            var a = Math.max(0, 1 - r / rows);
            ctx.fillStyle = (r == 0) ? '#fff' : "rgba(0,255,100," + (0.1 + 0.9 * a) + ")";
            ctx.fillText(String.fromCharCode(ch), cx, y);
          }
        }
        ctx.restore();
      }
    }

    // --- 7. SCANLINES ---
    if (this.scanlines && this.scanlines.img) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.drawImage(this.scanlines.img, 0, 0, w, h);
      ctx.restore();
    }
  },


  mix: function (a, b, t) {
    function h2r(h) {
      h = h.replace('#', '');
      return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    function r2h(r, g, b) {
      return '#' + [r, g, b].map(function (v) {
        v = Math.max(0, Math.min(255, Math.round(v)));
        return (v.toString(16).length < 2 ? '0' : '') + v.toString(16);
      }).join('');
    }
    try {
      var A = h2r(a),
        B = h2r(b);
      return r2h(A[0] * (1 - t) + B[0] * t, A[1] * (1 - t) + B[1] * t, A[2] * (1 - t) + B[2] * t);
    } catch (e) {
      return a;
    }
  },

  drawThemeExtras: function (ctx) {
    var t = this.theme,
      W = this.w,
      H = this.h;

    // SYNTHWAVE
    if (t === 'synthwave') {
      if (this.flamingo.active) {
        var fx = this.flamingo.x,
          fy = this.flamingo.y,
          flap = Math.sin(this.flamingo.frame);
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.ellipse(fx, fy, 15, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fx + 12, fy - 3);
        ctx.bezierCurveTo(fx + 25, fy - 10, fx + 20, fy - 25, fx + 30, fy - 20);
        ctx.lineTo(fx + 32, fy - 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fx - 5, fy + 5);
        ctx.lineTo(fx - 25, fy + 12);
        ctx.moveTo(fx - 5, fy + 5);
        ctx.lineTo(fx - 20, fy + 18);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,105,180,0.5)';
        ctx.beginPath();
        ctx.moveTo(fx + 5, fy - 2);
        ctx.lineTo(fx - 15, fy - 5 + (flap * 10));
        ctx.lineTo(fx + 5, fy + 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      if (this.neonSign.active) {
        ctx.save();
        ctx.font = "bold 60px 'Mr Dafoe', cursive";
        ctx.textAlign = "center";
        var flicker = (Math.sin(this.neonSign.flicker * 20) > 0.9) ? 0.4 : 1.0;
        ctx.globalAlpha = flicker;
        ctx.shadowColor = "#00FFFF";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#E0FFFF";
        ctx.fillText(this.neonSign.text, this.neonSign.x, this.neonSign.y);
        ctx.strokeStyle = "#008B8B";
        ctx.lineWidth = 2;
        ctx.strokeText(this.neonSign.text, this.neonSign.x, this.neonSign.y);
        ctx.restore();
      }
    }

    // CITY: Buildings + Mac Tonight Moon
    else if (t === 'city') {
      var blocks = (this.city && this.city.blocks) || [];
      ctx.fillStyle = '#222';
      for (let i = 0; i < blocks.length; i++) ctx.fillRect(blocks[i].x, blocks[i].y, blocks[i].w, blocks[i].h);

      ctx.save();
      ctx.fillStyle = '#ffd37a';
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      var t2 = this.t * 2.0;
      var t15 = this.t * 1.5;
      for (let i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        if (b.x > W || b.x + b.w < 0) continue;
        var pad = Math.max(4, (b.w * 0.08) | 0);
        var ww = Math.max(2, (b.w * 0.07) | 0);
        var wh = Math.max(3, (b.h * 0.05) | 0);
        var gapX = Math.max(2, (b.w * 0.05) | 0);
        var gapY = Math.max(3, (b.h * 0.05) | 0);

        var startY = b.y + pad,
          endY = b.y + b.h - pad;
        var startX = b.x + pad,
          endX = b.x + b.w - pad;
        for (let y = startY; y < endY; y += wh + gapY) {
          for (let x = startX; x < endX; x += ww + gapX) {
            var seed = (x + y) * 0.01 + b.seed;
            var flicker = Math.sin(t2 + seed);
            if (flicker > -0.5) {
              if (Math.sin((x * 7 + y * 13) + t15) > -0.85) {
                ctx.rect((x | 0), (y | 0), ww, wh);
              }
            }
          }
        }
      }
      ctx.fill();
      ctx.restore();

      if (this.layers.some(l => l.kind === "city-moon")) {
        var cm = this.cityMoon,
          mx = W * cm.x,
          my = H * cm.y;
        var baseR = Math.min(W, H) * cm.r;
        var pulse = (this.pulse || 0);
        var mr = baseR * (1 + pulse * 0.05);

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(-0.3);

        ctx.shadowColor = 'rgba(255,255,200,0.5)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fffcda';
        ctx.beginPath();
        ctx.moveTo(0, -mr);
        ctx.bezierCurveTo(mr * 1.3, -mr * 0.5, mr * 1.3, mr * 0.5, 0, mr);
        ctx.bezierCurveTo(mr * 0.6, mr * 0.5, mr * 0.6, -mr * 0.5, 0, -mr);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.translate(mr * 0.5, -mr * 0.2);
        ctx.beginPath();
        ctx.moveTo(-mr * 0.35, 0);
        ctx.lineTo(mr * 0.35, 0);
        ctx.lineTo(mr * 0.30, mr * 0.25);
        ctx.quadraticCurveTo(mr * 0.15, mr * 0.30, 0.05 * mr, mr * 0.25);
        ctx.lineTo(0.05 * mr, 0);
        ctx.lineTo(-0.05 * mr, 0);
        ctx.lineTo(-0.05 * mr, mr * 0.25);
        ctx.quadraticCurveTo(-0.15 * mr, mr * 0.30, -0.30 * mr, mr * 0.25);
        ctx.lineTo(-0.35 * mr, 0);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, mr * 0.5, mr * 0.15, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        ctx.restore();
      }
    }

    // SPACE
    else if (t === 'space') {
      var sx = W * 0.62,
        sy = H * 0.30,
        sr = Math.min(W, H) * 0.11;
      var rg = ctx.createRadialGradient(sx - sr * 0.3, sy - sr * 0.3, sr * 0.1, sx, sy, sr);
      rg.addColorStop(0, '#cdb8ff');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.25);
      ctx.scale(1.9, 0.75);
      ctx.strokeStyle = '#ddffff';
      ctx.lineWidth = sr * 0.12;
      ctx.beginPath();
      ctx.arc(0, 0, sr * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (this.ufo.active) {
        ctx.save();
        ctx.translate(this.ufo.x, this.ufo.y + Math.sin(this.ufo.t * 10) * 2);
        ctx.fillStyle = '#aaddff';
        ctx.beginPath();
        ctx.arc(0, -4, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = (Math.floor(this.ufo.t * 8) % 2 === 0) ? '#f00' : '#0f0';
        ctx.beginPath();
        ctx.arc(-10, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // FOREST
    else if (t === 'forest') {
      if (this.bigfoot.active) {
        var bx = this.bigfoot.x,
          by = this.bigfoot.y,
          walk = Math.sin(this.bigfoot.frame);
        ctx.fillStyle = '#1a120b';
        ctx.beginPath();
        ctx.ellipse(bx, by - 18, 9, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx + 2, by - 36, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#1a120b';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx - 2, by - 10);
        ctx.lineTo(bx - 4 + walk * 6, by);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx + 2, by - 10);
        ctx.lineTo(bx + 4 - walk * 6, by);
        ctx.stroke();
      }
      ctx.save();
      var base = Math.floor(H * 0.80);
      var treeBaseH = H * 0.09;
      var treeVar = H * 0.03;
      for (let i = 0; i < 45; i++) {
        var sway = Math.sin((this.t * 0.5) + i) * 4;
        var tx = (i / 45) * (W + 100) - 50 + sway;
        var th = treeBaseH + ((i * 13) % 5) * treeVar;
        ctx.fillStyle = '#2d1d15';
        var trW = th * 0.12,
          trH = th * 0.25;
        ctx.fillRect(tx - trW / 2, base - trH, trW, trH);
        ctx.fillStyle = '#144219';

        function drawTier(x, y, w, h) {
          ctx.beginPath();
          ctx.moveTo(x - w / 2, y);
          ctx.lineTo(x, y - h);
          ctx.lineTo(x + w / 2, y);
          ctx.fill();
        }
        var t1y = base - trH * 0.7;
        drawTier(tx, t1y, th * 0.7, th * 0.4);
        var t2y = t1y - th * 0.25;
        drawTier(tx, t2y, th * 0.5, th * 0.35);
        var t3y = t2y - th * 0.25;
        drawTier(tx, t3y, th * 0.3, th * 0.35);
      }
      ctx.restore();
    }
  },

  drawRainbow: function (ctx, opts) {
    const cx = this.w * 0.5,
      cy = this.h * 0.86,
      R = Math.min(this.w, this.h) * 0.9;
    var bands = ['#ff1744', '#ff9100', '#ffee58', '#69f0ae', '#00e5ff', '#7c4dff'];
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < bands.length; i++) {
      ctx.lineWidth = 9;
      ctx.strokeStyle = bands[i];
      ctx.globalAlpha = opts.opacity || 0.55;
      ctx.beginPath();
      ctx.arc(cx, cy, R - i * 10, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();
  },

  buildScanlines: function () {
    var c = document.createElement('canvas');
    c.width = 1;
    c.height = 2;
    var x = c.getContext('2d');
    x.fillStyle = 'rgba(0,0,0,0.1)';
    x.fillRect(0, 1, 1, 1);
    this.scanlines = {
      img: c
    };
  },

  buildCityBlocks: function (w, h) {
    var base = Math.floor(h * 0.82);
    var blocks = [];
    let x = -w * 0.05;
    while (x < w * 1.05) {
      var bw = (w * 0.04) + (Math.random() * (w * 0.08));
      var bh = (h * 0.10) + (Math.random() * (h * 0.35));
      blocks.push({
        x: x,
        y: base - bh,
        w: bw,
        h: bh,
        seed: Math.random() * 1000
      });
      x += bw + (w * 0.01);
    }
    this.city = this.city || {};
    this.city.blocks = blocks;
  }
};

// === Beat Conductor: sync BG pulses to ./sound/breakout/bgm-synthwave.beats.json ===
Breakout.BeatConductor = {
  init: function (game) {
    this.game = game;
    this.i = 0;
    this.beats = [];
    this.ready = false;
    this.bgm = null;
    try {
      fetch('./sound/breakout/bgm-synthwave.beats.json')
        .then(function (r) {
          return r.json();
        })
        .then(function (d) {
          var arr = Array.isArray(d) ? d : (d.beats || []);
          arr = arr.map(Number).filter(function (n) {
            return !isNaN(n);
          }).sort(function (a, b) {
            return a - b;
          });
          this.beats = arr;
          this.ready = this.beats.length > 0;
        }.bind(this))
        .catch(function () {
          this.ready = false;
        }.bind(this));
    } catch (e) {
      /* no-op */
    }
  },
  attach: function (bgm) {
    this.bgm = bgm;
    this.i = 0;
  },
  reset: function () {
    this.i = 0;
  },
  update: function () {
    if (!this.ready || !this.bgm) return;
    var posMs = (typeof this.bgm.position === 'number') ? this.bgm.position : 0;
    while (this.i < this.beats.length && posMs >= this.beats[this.i] * 1000) {
      if (this.game && this.game.bg && this.game.bg.onBeat) this.game.bg.onBeat();
      this.i++;
    }
  }
};

/* ===== FORCE LOCAL HIGH SCORES (no server) ===== */
;
(function () {
  try {
    if (!window.Breakout) return;
    var LS_KEY = 'breakout_highscores_v1';
    var profanity = null;

    function _load() {
      try {
        var raw = localStorage.getItem(LS_KEY);
        var arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) arr = [];
        return arr.filter(function (r) {
          return r && typeof r.score !== 'undefined';
        });
      } catch (e) {
        return [];
      }
    }

    function _save(rows) {
      try {
        rows = Array.isArray(rows) ? rows : [];
        // sort desc by score, then by ts asc (older first if tie)
        rows.sort(function (a, b) {
          var as = Number(a && a.score) || 0;
          var bs = Number(b && b.score) || 0;
          if (bs !== as) return bs - as;
          var at = Number(a && a.ts) || 0;
          var bt = Number(b && b.ts) || 0;
          return at - bt;
        });
        // keep top 50 just to bound storage, even though we show top 20
        if (rows.length > 50) rows = rows.slice(0, 50);
        localStorage.setItem(LS_KEY, JSON.stringify(rows));
      } catch (e) {
        /* no-op */
      }
    }

    function _loadProfanity() {
      if (profanity) return profanity;
      try {
        // Some builds inline words.json; if not available, allow all names by default
        profanity = window.__PROFANE_WORDS__ || profanity;
      } catch (e) {}
      return profanity || [];
    }

    function _isProfane(name) {
      if (!name) return false;
      var s = String(name).toLowerCase().trim();
      var list = _loadProfanity();
      if (!list || !list.length) return false;
      for (let i = 0; i < list.length; i++) {
        var w = String(list[i] || '').toLowerCase();
        if (!w) continue;
        if (s === w) return true;
        if (s.indexOf(w) !== -1) return true;
      }
      return false;
    }

    var LocalHS = {
      _load: _load,
      _save: _save,
      init: function () {
        try {
          // best-effort fetch of words.json; tolerate failure
          fetch('./words.json', {
              cache: 'no-cache'
            })
            .then(function (r) {
              return r.ok ? r.json() : [];
            })
            .then(function (list) {
              window.__PROFANE_WORDS__ = Array.isArray(list) ? list : [];
            })
            .catch(function () {
              /* ignore */
            });
        } catch (e) {}
      },
      top: function (limit) {
        limit = limit || 20;
        var rows = _load().slice(0, limit);
        return Promise.resolve(rows);
      },
      submit: function (entry) {
        var rows = _load();
        rows.push({
          name: String(entry.name || '').slice(0, 20),
          score: Number(entry.score) || 0,
          ts: Date.now()
        });
        _save(rows);
        try {
          console.log('[HS] saved (local):', entry);
        } catch (e) {}
        return Promise.resolve({
          ok: true
        });
      },
      checkAndSubmit: function (score, limit) {
        const self = this;
        self.init();
        return new Promise(function (resolve) {
          try {
            console.log('[HS] checkAndSubmit(local) score=', score);
          } catch (e) {}
          if (!score || !(score > 0)) {
            resolve(false);
            return;
          }

          self.top(limit || 20).then(function (rows) {
            var min = 0;
            if (Array.isArray(rows) && rows.length >= (limit || 20)) {
              for (let i = 0; i < rows.length; i++) {
                var s = Number(rows[i] && rows[i].score);
                if (!isFinite(s)) continue;
                if (min === 0 || s < min) min = s;
              }
            }

            // Qualification Logic:
            // You might want to qualify if you beat the GLOBAL min score too, 
            // but for now, let's keep it simple: if you qualify locally, you get prompted.
            var qualifies = (!rows || rows.length < (limit || 20) || score > min);

            try {
              console.log('[HS] qualifies(local)=', qualifies, 'min=', min);
            } catch (e) {}

            if (!qualifies) {
              resolve(false);
              return;
            }

            setTimeout(function () {
              var name = window.prompt('New High Score! Enter your name (max 20 chars):', '');
              if (name == null) {
                resolve(false);
                return;
              }
              name = String(name).trim().slice(0, 20);
              if (!name) {
                resolve(false);
                return;
              }

              // Profanity Check
              if (typeof _isProfane === 'function' && _isProfane(name)) {
                try {
                  alert('Name not allowed.');
                } catch (e) {}
                resolve(false);
                return;
              } else if (self.isProfane && self.isProfane(name)) {
                // Check using internal helper if _isProfane global missing
                try {
                  alert('Name not allowed.');
                } catch (e) {}
                resolve(false);
                return;
              }

              // 1. Submit to Global (Fire and Forget - don't wait for it)
              if (Breakout.GlobalScores) {
                Breakout.GlobalScores.add(name, score);
              }

              // 2. Submit to Local and Resolve
              self.submit({
                  name: name,
                  score: score
                })
                .then(function () {
                  // Success! Open Global Leaderboard to show off
                  if (window.Breakout && window.Breakout.openLeaderboard) {
                    window.Breakout.openLeaderboard('global');
                  }
                  resolve(true);
                })
                .catch(function () {
                  resolve(false);
                });

            }, 50);
          }).catch(function () {
            resolve(false);
          });
        });
      },
    };

    // Force our local impl to take precedence
    window.Breakout.HighScores = LocalHS;
    try {
      console.log('[HS] Local HighScores override active');
    } catch (e) {}
  } catch (e) {
    /* ignore */
  }
})();
Breakout.audio = {
  setLowpass: function (amount) {
    if (!this.enabled || !this.lowpass || !this.ctx) return;
    // amount: 0.0 (no filtering) to 1.0 (strong filtering)
    const baseFreq = 22050; // full audible range
    const minFreq = 500; // deepest muffled
    const clamped = Math.min(Math.max(amount, 0), 1);
    const targetFreq = baseFreq - (baseFreq - minFreq) * clamped;
    this.lowpass.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
  },

  setVolume: function (vol) {
    if (!this.enabled || !this.masterGain || !this.ctx) return;
    // vol: 0.0 (mute) to 1.0 (full volume)
    const clamped = Math.min(Math.max(vol, 0), 1);
    this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
  },
  init: function () {
    this.setLowpass(1); // 0–1 strength
    this.setVolume(1); // 0–1 overall volume
    //this.audio.play(name);         // quick oscillator blips: 'brick', 'powerup', 'lose'
  },
},
Breakout.Colors = {

	hf: {
		/* Reputation */
		a: "#00B500", // rep green
		b: "#FF2121", // rep red
		/* Theme */
		c: "#4d2f5d", // dark purple background
		d: "#333333", // background gray
		e: "#1F1F1F", // background dark gray
		/* Groups */
		f: "#fFcC00", // L33t yelLow
		g: "#0066fF", // Ub3r blue
		h: "#afaAaA", // R00t gray
		i: "#ed1c24", // Sociopaths red
		j: "#00cC66", // Divined green
		k: "#99cCfF", // Staff blue
		l: "#aA00fF", // Bots purple
		m: "#2D7E52", // Vender green
		n: "#9999FF", // Admin purple
		o: "#fFcd94" // Skin tone
	},

	arkanoid: {
		w: "#FCFCFC", // white
		o: "#FC7460", // orange
		l: "#3CBCFC", // light blue
		g: "#80D010", // green
		r: "#D82800", // red
		b: "#0070EC", // blue
		p: "#FC74B4", // pink
		y: "#FC9838", // yelLow
		s: "#BCBCBC", // silver
		d: "#F0BC3C" // gold
	},

	pastel: {
		y: "#FFF7A5", // yelLow
		p: "#FFA5E0", // pink
		b: "#A5B3FF", // blue
		g: "#BFFFA5", // green
		o: "#FFCBA5" // orange
	},

	vintage: {
		a: "#EFD279", // yelLow
		b: "#95CBE9", // light blue
		c: "#024769", // dark blue
		d: "#AFD775", // light green
		e: "#2C5700", // grass
		f: "#DE9D7F", // red
		g: "#7F9DDE", // purple
		h: "#00572C", // dark green
		i: "#75D7AF", // mint
		j: "#694702", // brown
		k: "#E9CB95", // peach
		l: "#79D2EF" // blue
	},

	liquidplanNer: {
		a: '#62C4E7', // light blue
		b: '#00A5DE', // dark  blue
		x: '#969699', // light gray
		y: '#7B797E' // dark  gray
	},

};

Breakout.Levels = [

	{
		colors: {
			a: '#000000', // black
			b: '#C3FF00', // yelLow-greEn
			c: '#00FFFF', // cyan
			d: '#FF00FF', // magenta
		}
		, name: "Windows 93.11 by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			"", ""
			, "                aAaA         "
			, "              aAaAaAaA       "
			, "       a     aAabBbBaAa      "
			, "       a a aAaAbaBbabAa      "
			, "         aAaAaAbaBbabAa      "
			, "       c     aAbBbBbBaA      "
			, "       c c cCaAbBbBbBaA      "
			, "         cCcCaAbabBabaA      "
			, "       d     aAbBaAbBaA      "
			, "       d d dDaAbBbBbBaA      "
			, "         dDdDaAbaAaAbaA      "
			, "       a     aAaAaAaAaA      "
			, "       a a aAaAa    aAa      "
			, "         aAaAa        a      "
		, ]
	},

	{
		colors: {
			a: '#543746', // dark-purple
			b: '#B97C1F', // brown
			c: '#EDAE48', // light-brown
			d: '#FEDDAD', // tan
			e: '#887B66', // dark
			f: '#DFD7AD', // light
			g: '#DFD7AD', // white
		}
		, name: "DOGE! SUCH BREAKOUT!"
		, theme: "city"
		, bricks: [
			"", "", ""
			, "             aA   a   "
			, "            adDaAada  "
			, "            adcCcCca  "
			, "            adcCcCcCa "
			, "            acCcCcCaga"
			, "        a  acCcCagcCca"
			, "       ada acCfFcCcaAfa"
			, "       adDacCcfFfFfFafa"
			, "       acdabcCefFaAafFa"
			, "        acCabBbefFfFfea"
			, "         aAaAbBeEeEeEa"
			, "            aAaAaAaAa "
		, ]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#595656', // grey
			c: '#FFFFFF', // white
			d: '#962F4D', // pink
			e: '#D8625D', // peach
			f: '#915A73', // dark-lavender
			g: '#B38D95', // light-lavender
		}
		, name: "Possie by EnderAndrew"
		, theme: "forest"
		, bricks: [
			"", "", ""
			, "         aA   aAaA           "
			, "       aAbBaAabBbBa          "
			, "      acbababBbBbBba         "
			, "    aAcCcbBbBbBbBbBa    aAa  "
			, "  aAcCcacCcbBbBbBbBba  agGga "
			, "  adcCcCcCcCbBbBbBbBfaAagaga "
			, "   aAcCcCcCbBbBbBbBbfFfaAaga "
			, "     aAaAaAabBbBbBaAaAfFgGga "
			, "        aeabBaeaBba   aAaAa  "
			, "         aeEa aeEa           "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Pac-Man by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			"", ""
			, "     rrrr            yyyyy   "
			, "   rrrrrrrr        yyyyyyyyy "
			, "  rrrrrrrrrr     yyyyyyyyyyyy"
			, " rwwrrrrwwrrr   yyyyyyyyyyyyy"
			, " wwwwrrwwwwrr   yyyyyyyyyyyyyy"
			, " lLwwrrlLwwrr     yyyyyyyyyyyy"
			, "rlLwwrrlLwwrrr       yyyyyyyyy"
			, "rrwwrrrrwwrrrr          yyyyyy"
			, "rrrrrrrrrrrrrr       yyyyyyyyy"
			, "rrrrrrrrrrrrrr    yyyyyyyyyyy"
			, "rrrrrrrrrrrrrr  yyyyyyyyyyyyy"
			, "rrrrrrrrrrrrrr  yyyyyyyyyyyy "
			, "rrrr rrrr rrrr   yyyyyyyyyy  "
			, " rr   rr   rr      yyyyy     "
		, ]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#AC385D', // dark purple
			c: '#B56BA6', // light purple
			d: '#83978C', // grey
			e: '#1B9BD8', // blue
			f: '#FFFFFF', // white
		}
		, name: "Among Us by EnderAndrew"
		, theme: "space"
		, bricks: [
			"", "", ""
			, "         aAaA       a a      "
			, "        acCaAa     afafa     "
			, "       acCadefa    afFfa     "
			, "      aAcCadeEa     afa      "
			, "     acabcadDda     afa      "
			, "     ababcCaAa  aAaAaAaAa    "
			, "     ababBcCca  ababBcCca    "
			, "     ababBbBba  ababBbBba    "
			, "      aAbBbBba  aAabBbBba    "
			, "       abBabBa    abBabBa    "
			, "        aA aA      aA aA     "
		, ]
	},

	{
		colors: {
			e: '#000000', // Black
			w: '#FFFFFF', // White
			b: '#FF0000', // Red
			h: '#DDDDDD' // Light Grey (Button)
		}
		, name: "Catch 'em All"
		, theme: "city"
		, bricks: [
			"                              "
			, "                              "
			, "             eEeE             "
			, "           eEbBbBeE           "
			, "          ewWbBbBbBe          "
			, "         ewWbBbBbBbeE         "
			, "         ewbBbBbBbBbe         "
			, "        ewbBbBbBbBbBbe        "
			, "        eEebBbBeEebBbe        "
			, "        eEeEbBewWwebBe        "
			, "        ehweEeEWhWeEeE        "
			, "         ewWweEwWwewe         "
			, "         eWwWwWeEewWe         "
			, "          ehHWwWwWwe          "
			, "           eEhHhHeE           "
			, "             eEeE             "
		]
	},

	{
		colors: {
			e: '#000000', // black
			m: '#DB3C58', // magenta
			o: '#E8B0CA', // pink
		}
		, name: "Poyo Kirby by EnderAndrew"
		, theme: "forest"
		, bricks: [
			""
			, "             eEeEe eE         "
			, "           eEmoOomemoe        "
			, "          emoOoOoOoeoOe       "
			, "         emoOoeoeoOomoe       "
			, "         eoOoOeoeoOomMe       "
			, "        eoOoOoeoeoOoOme       "
			, "       emoOomMoOomMoOoe       "
			, "       eoOmoOoOeoOoOome       "
			, "       eoOmoOoOeoOoOoe        "
			, "        eEeoOoOoOoOome        "
			, "       emMmeoOoOoOoOme        "
			, "       emMmMeoOoOoOme         "
			, "       emMmMeoOoOomeE         "
			, "        emMmMemMmeEmMe        "
			, "         emMeEeEemMmMme       "
			, "          eEe   eEeEeE        "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Space Invaders"
		, theme: "space"
		, bricks: [
			"", ""
			, "          yy      yy          "
			, "            yy  yy            "
			, "            yy  yy            "
			, "          ssSSssSSss          "
			, "          ssSSssSSss          "
			, "        SSsswwsswwssSS        "
			, "        SSsswwsswwssSS        "
			, "      ssSSssSSssSSssSSss      "
			, "      ssSSssSSssSSssSSss      "
			, "      ss  ssSSssSSss  ss      "
			, "      ss  ss      ss  ss      "
			, "      ss  ss      ss  ss      "
			, "            ss  ss            "
			, "            ss  ss            "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Retro by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"", "", ""
			, " wdw  wdwo ysdwo wdw    yp   d"
			, " o  o o      l   o  o  s  b  s"
			, " l  l l      g   l  l w    r y"
			, " g  g g      r   g  g o    g p"
			, " rbr  rlg    b   rbr  g    l b"
			, " b p  b      p   b p  r    o r"
			, " p  y p      y   p  y b    w g"
			, " y  s y      s   y  s  p  d   "
			, " s  d srbp   d   s  d   ys   l"
		, ]
	},

	{
		colors: {
			s: '#C0C0C0', // Silver
			g: '#FFD700', // Gold
			b: '#4169E1', // Royal Blue
			d: '#222222' // Dark Grey
		}
		, name: "It's Dangerous to go Alone"
		, theme: "forest"
		, bricks: [
			"              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "              s               "
			, "             dgd              "
			, "            bbgbb             "
			, "           bBbgbBb            "
			, "          bBbBgBbBb           "
			, "           d  b  d            "
			, "              b               "
			, "              b               "
			, "              b               "
			, "                              "
		]
	},

	{
		colors: {
			c: '#00FFFF', // Cyan
			w: '#FFFFFF', // White
			b: '#0000CC' // Dark Blue (Pupils)
		}
		, name: "Inky"
		, theme: "space"
		, bricks: [
			"                              "
			, "           cccccccc           "
			, "         cccccccccccc         "
			, "        cccccccccccccc        "
			, "       cccccccccccccccc       "
			, "       ccwwbbccccwwbbcc       "
			, "       ccwwbbccccwwbbcc       "
			, "       ccwwbbccccwwbbcc       "
			, "       cccccccccccccccc       "
			, "       cccccccccccccccc       "
			, "       cccccccccccccccc       "
			, "       cccccccccccccccc       "
			, "       cccccccccccccccc       "
			, "       cc  cc    cc  cc       "
			, "       c    c    c    c       "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Heart"
		, theme: "forest"
		, bricks: [
			"                              "
			, "                              "
			, "                              "
			, "          rpr     rpr         "
			, "         rprpr   rprpr        "
			, "        rprprpr rprprpr       "
			, "        rprprprprprprpr       "
			, "        rprprprprprprpr       "
			, "         rprprprprprpr        "
			, "          rprprprprpr         "
			, "           rprprprpr          "
			, "            rprprpr           "
			, "             rprpr            "
			, "              rpr             "
			, "               r              "
			, "                              "
		, ]
	},

	{
		colors: {
			g: '#00AA00', // Green
			l: '#55FF55', // Light Green
			b: '#000000' // Black
		}
		, name: "Creeper by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"          llllllllll          "
			, "          llllllllll          "
			, "        llggllggllggll        "
			, "        llggllggllggll        "
			, "        ggbbbggggbbbgg        "
			, "        ggbbbggggbbbgg        "
			, "        ggbbbggggbbbgg        "
			, "        ggbbbggggbbbgg        "
			, "        gggggbbbbggggg        "
			, "        gggggbbbbggggg        "
			, "        gggbbbbbbbbggg        "
			, "        gggbbbbbbbbggg        "
			, "        gggbbbbbbbbggg        "
			, "        gggbbgGgGbbggg        "
			, "        gggbbgGgGbbggg        "
			, "                              "
		]
	},

	{
		colors: {
			g: '#C0C0C0', // Grey Body
			d: '#808080', // Dark Grey details
			s: '#98A200', // Screen Green
			b: '#222222', // Black/Dark Grey
			r: '#8B0000' // Red buttons
		}
		, name: "Handheld '89"
		, theme: "circuit"
		, bricks: [
			"      gggggggggggggggggg      "
			, "      g                g      "
			, "      g dddddddddddddd g      "
			, "      g d            d g      "
			, "      g d ssssssssss d g      "
			, "      g d ssssssssss d g      "
			, "      g d ssssssssss d g      "
			, "      g d ssssssssss d g      "
			, "      g d ssssssssss d g      "
			, "      g d            d g      "
			, "      g dddddddddddddd g      "
			, "      g   no     no    g      "
			, "      g                g      "
			, "      g             r  g      "
			, "      g  b        r   Gg      "
			, "      g bbb          g g      "
			, "      g  b          g gG     "
			, "      g            g g g      "
			, "      gggggggggggggggggg      "
			, "                              "
		]
	},


	{
		colors: Breakout.Colors.arkanoid
		, name: "Classic Arkanoid"
		, theme: "synthwave"
		, bricks: [
			""
			, "oo"
			, "ooll"
			, "oollgg"
			, "oollggbb"
			, "oollggbbrr"
			, "oollggbbrroo"
			, "oollggbbrrooll"
			, "oollggbbrroollgg"
			, "oollggbbrroollggbb"
			, "oollggbbrroollggbbrr"
			, "oollggbbrroollggbbrroo"
			, "oollggbbrroollggbbrrooll"
			, "oollggbbrroollggbbrroollgg"
			, "oollggbbrroollggbbrroollggbb"
			, "ssSSssSSssSSssSSssSSssSSssSSrr"
		]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#5E7985', // blue-grey
			c: '#424242', // dark-grey
			d: '#6F6F6F', // light-grey
			e: '#FFFFFF', // white
			f: '#9B2525', // red
		}
		, name: "NES Controller by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			""
			, "          a                  "
			, "          aA                 "
			, "           a                 "
			, "           aAa               "
			, "             a               "
			, "  bBbBbBbBbBbBbBbBbBbBbBbBb  "
			, "  bcCcCcCcbBbBbBbcCcCcCcCcb  "
			, "  bcCcCcCcCcCcCcCcCfFfFfcCb  "
			, "  bcCcCcCcbBbBbBbcCcCcCcCcb  "
			, "  bcCcCcCcCcCcCcCcCcCcCcCcb  "
			, "  bcCbBbcCdDdDdDdcdDdDdDdcb  "
			, "  bcbBdbBdeEeEeEedeEeEeEedb  "
			, "  bcbdcdbdedDedDedefFefFedb  "
			, "  bcbBdbBdeEeEeEedefFefFedb  "
			, "  bcCbBbcCdDdDdDdceEeEeEedb  "
			, "  bcCcCcCcbBbBbBbcdDdDdDdcb  "
			, "  bBbBbBbBbBbBbBbBbBbBbBbBb  "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Arkanoid Umbrella"
		, theme: "forest"
		, bricks: [
			"", ""
			, "              ss              "
			, "          bbBBssggGG          "
			, "        BBbbWWwwWWGGgg        "
			, "      bbBBwwWWwwWWwwggGG      "
			, "      bbBBwwWWwwWWwwggGG      "
			, "      bbBBwwWWwwWWwwggGG      "
			, "      ss  ss  ss  ss  ss      "
			, "              ss              "
			, "              ss              "
			, "          oo  oo              "
			, "          ooOOoo              "
			, "            OO                "
		]
	},

	{
		colors: {
			a: '#22481C', // dark greEn
			b: '#3C9D30', // light greEn
			c: '#000000', // black
			d: '#FFFFFF', // white
			e: '#E9A3C0', // light pink
			f: '#BF1864', // dark pink
			g: '#643800', // brown
			h: '#FDC98D' // tan
		}
		, name: "Grogu by EnderAndrew"
		, theme: "space"
		, bricks: [
			""
			, "            aAaAaA           "
			, "           abBbBbBa          "
			, "     aAabaAbBbBbBbBaAbaAa    "
			, "     aAbBbacCcbBcCcabBbaA    "
			, "     eEfbBbcCdbBcCdbBbfeE    "
			, "      eEabBcCcbBcCcbBaeE     "
			, "       eEaAbBbBbBbBaAeE      "
			, "        cgGgGgGgGgGgGc       "
			, "        chHhgGgGgGhHhc       "
			, "         chgGgGgGgGhc        "
			, "         chHghgGhghHc        "
			, "         bchghgGhghcb        "
			, "          chghgGhghc         "
			, "          cgGhgGhgGc         "
			, "           chHgGhHc          "
			, "            cCcCcC           "
		, ]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#797979', // dark-grey
			c: '#BCBCBC', // light-grey
			d: '#F7B606', // yelLow
			e: '#F8D776', // light-yelLow
			f: '#EFD1AD', // peach
			g: '#0000BA', // blue
			h: '#4228BD', // purple
			i: '#4F3400', // dark-brown
			j: '#AA7B09', // tan
			k: '#FD3502', // red
		}
		, name: "Cloud Strife by EnderAndrew"
		, theme: "city"
		, bricks: [
			""
			, "              d              "
			, "      a        dD            "
			, "      aA       dDd   d       "
			, "      baA     dDdDdDd        "
			, "      baAa   dedDdDded       "
			, "      baAaA d dedDdedDd      "
			, "      cCaAaA dDdDfdDdDdD     "
			, "       cCaAaAdDdDfdfdDd      "
			, "        cCaAaAdDgfFgfd       "
			, "         cCaAaAdfFfFfd       "
			, "          cCaAaAfFfFfd       "
			, "           cCaAaAhHb d       "
			, "            cCaAbGgf         "
			, "             cCbjgf          "
			, "              b iji          "
			, "                gGk          "
			, "                g Gg         "
			, "               aA  aA        "
		, ]
	},

	{
		colors: {
			a: '#FFA32B', // orange
			b: '#EB6307', // brown
			c: '#C7E666', // greEn
			d: '#FD3B11', // red
			e: '#FFFFFF', // white
		}
		, name: "Link by EnderAndrew"
		, theme: "forest"
		, bricks: [
			""
			, "        cCcCcC      adDda    "
			, "       cCcCcCcC     dadad    "
			, "     a cbBbBbBc a  edDdDdDe  "
			, "     a bBbBbBbB a  edaAadDe  "
			, "     aAbacaAcabaA  edaAadDe  "
			, "     aAbabaAbabaA   edadDe   "
			, "      aAaAaAaAaAb   daAade   "
			, "      cCaAbBaAcCb   adada    "
			, "    bBbBbaAaAcCbBb  aedea    "
			, "   bBabBbBcCcCcabB aedDdea   "
			, "   baAabBabBcCaAab   ada e   "
			, "   bBabBbacbBbBaAa   aAad    "
			, "   bBabBbabBcCcCa    aA      "
			, "   bBbBbBacCcCc      a       "
			, "    aAaAab  bBb      a       "
			, "       bBb           d       "
		, ]
	},

	{
		colors: {
			b: '#111111', // black,
			w: '#EEEEEE', // white,
			c: '#EC7150', // cherry,
			s: '#B33A2F' // shadow,
		}
		, name: "Cherries!"
		, theme: "synthwave"
		, bricks: [
			""
			, "       bBb                    "
			, "      BcCcB                   "
			, "     bCwCcsb  b               "
			, "     bCcCcsb b                "
			, "      BcCsB B                 "
			, "    BbBsSsBbB       bBb       "
			, "   bcCcbBbcCcb     BcCcB      "
			, "  bcwcCsbcwcCsb   bCwCcsb  b  "
			, "  bcCcCsbcCcCsb   bCcCcsb b   "
			, "  bcCcsSbcCcsSb    BcCsB B    "
			, "   bsSsb bsSsb   BbBsSsBbB    "
			, "    bBb   bBb   bcCcbBbcCcb   "
			, "               bcwcCsbcwcCsb  "
			, "               bcCcCsbcCcCsb  "
			, "               bcCcsSbcCcsSb  "
			, "                bsSsb bsSsb   "
			, "                 bBb   bBb    "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
		, ]
	},

	{
		colors: {
			r: '#D80000', // red
			b: '#706800', // brown
			o: '#F8AB00', // orange
			f: '#F83800', // fire
			w: '#FFFFFF', // white
			e: '#FFE0A8' // beige
		}
		, name: "My Boy Mario"
		, theme: "city"
		, bricks: [
			""
			, "    rRrRr                     "
			, "   RrRrRrRrR                  "
			, "   BbBoObo                    "
			, "  boboOoboOo       F    f   f "
			, "  bobBoOoboOo     f e         "
			, "  bBoOoObBbB       F  f     e "
			, "    oOoOoOo        Ff      E  "
			, "   bBrbBb        E  f fF F  f "
			, "  bBbrbBrbBb       FfFfFf  F  "
			, " bBbBrRrRbBbB     fFeFeFfFf   "
			, " oObrorRorboO    FfEeEeEfF    "
			, " oOorRrRrRoOo    FeEeWwEeFf   "
			, " oOrRrRrRrRoO   fFeFwWfEeFf   "
			, "   rRr  RrR     fFeFwWfEeFf   "
			, "  bBb    bBb    fFeEwWeEeFf   "
			, " bBbB    bBbB   fFfEeEeEfF    "
			, "                 FfFfFfFfF    "
			, "                   FfFfF      "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Galaga by xadamxk"
		, theme: "space"
		, bricks: [
			"     jJj    jJj    jJj        "
			, "    jJfjJ  jJfjJ  jJfjJ       "
			, "    jfFfj  jfFfj  jfFfj       "
			, "    j   j  j   j  j   j       "
			, "                              "
			, "   b  b  b  b  b  b  b  b     "
			, "   bnNb  bnNb  bnNb  bnNb     "
			, "    nN    nN    nN    nN      "
			, "   bnNb  bnNb  bnNb  bnNb     "
			, "   b  b  b  b  b  b  b  b     "
			, ""
			, "             jJ               "
			, "            jfFj              "
			, "            jfFj              "
			, "    ik      j  j      ki      "
			, "  ifFfk     j  j     kfFfi    "
			, "  kfFfFk   g    g   kfFfFk    "
			, "   kfFf     gGgG     fFfk     "
			, "    kf    g      g    fk      "
			, "           g    g             "
			, "         g  gGgG  g           "
			, "          g      g            "
			, "           gGgGgG             "
		]
	},

	{
		colors: Breakout.Colors.vintage
		, name: "Tetris by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			""
			, "            e                "
			, "            eE               "
			, "             e               "
			, "                             "
			, "                             "
			, "         aAa                 "
			, "         akf  l      kK      "
			, "     gG eEkfF lLl   lkKea    "
			, "     gGeElkKfgGafFflLeEea    "
			, "     fFflLlegGaAafelgGgaA    "
			, "     fkaAfeEekKkKleEfFgkK    "
			, "     kKaAflLlaAfFleafFkKf    "
			, "     kleEfFlaAeEflaAgeEef    "
			, "     lLleEgGgGeEflagGgefF    "
		, ]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#FFFF00', // yelLow
			c: '#FF0000', // red
			d: '#742806', // brown
			e: '#338715', // greEn
			f: '#FFE9D1', // peach
			g: '#FFFFFF', // white
		}
		, name: "I Choose You by EnderAndrew"
		, theme: "forest"
		, bricks: [
			"", ""
			, "     aAaAaA                 "
			, "    agGcCcCa                "
			, "   aegGcCcCca          aA   "
			, "  aAegGcCcCca       aAaAaAaAa"
			, " acCgGgcCcCaAa   aAabBaAabBba"
			, "  aAfFfaAaAaAa  abBbBbBabBba"
			, "   afafFaAaAaA abBbBbBaAbBa "
			, "   afafFafFaA  abBbBbBabBa  "
			, "   afFfFfFfa  abBabBbBbabaAa"
			, "    afFfFaAea abBbBcbBbabBba"
			, "     aAaAaeEa  abBbBbdDdada "
			, "      aAfFaea  ababBbBbBadDa"
			, "      aAfFaea  abaAbBdDdada "
			, "     aAaAaAa   abBbBbBbaAa  "
			, "     agGgGa     aAbBbaA     "
			, "      aAaA        aAa       "
		, ]
	},

	{
		colors: {
			a: '#E3C697', // tan
			b: '#000000', // black
			c: '#FFFFFF', // white
			d: '#416999', // blue
			e: '#BE2F37', // red
			f: '#FEC23C', // orange
		}
		, name: "Dig Dug by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			""
			, "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA"
			, "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA"
			, "aAbBbBbBbaAaAaAaAaAaAabBbBbBaA"
			, "bBbBcCcbBbaAaAaAaAaAbBbeEeEbBa"
			, "bBcCcCcCbBbaAaAaAaAabBfcbfeEbB"
			, "bcCcCcCcCcbaAaAaAaAbBfcCbcfeEb"
			, "cCcCcCcCcCbBaAaAaAabfFbBbcCfeE"
			, "cCcdDdbdbdbBbBbBbBbBefcCcCcCce"
			, "cCcCdDbdbdbBbBbBbBbBeEfcCbBbcf"
			, "bcdDdDdDdbebBbBbBbBbeEefcbcCfF"
			, "bcbBcCcCcbeEbBbfFbBbfeEefFfFfF"
			, "eEedDdeEeEeEefFbBfbfbeEeEefefF"
			, "bcCcdDdcCbeEbBbBbBfbBbeEeEeEef"
			, "bcCcCcCcbBebBbBbBbBbBbBefeEecf"
			, "bcCcbBcCbBbBbBbBbBbBbBbBfbBbcb"
			, "bBcCcbcCcbBbaAaAaAaAabBfFfbBbc"
			, "aAaAaAaAaAaAaAaAaAaAaAaAaAaAaA"
		, ]
	},

	{
		colors: {
			a: '#000000', // black
			b: '#FF0000', // red
			c: '#FF9900', // orange
			d: '#EFE305', // yelLow
			e: '#00FF00', // greEn
			f: '#0000FF', // blue
			g: '#9900FF', // purple
			h: '#666666', // grey
			i: '#C98F4C', // tan
			j: '#FF949D', // pink
			k: '#FFFFFF', // white
		}
		, name: "Nyan Cat by EnderAndrew"
		, theme: "city"
		, bricks: [
			""
			, "bB       aAaAaAaAaAaAaA      "
			, "bBbBbBbBaiIiIiIiIiIiIiIa     "
			, "cCbBbBbaiIjJjJgjJgjJjiIia    "
			, "cCcCcCcaijJgjJjJaAjJjJjia aA "
			, "daAaAcCaijJjJjJahHajJgjiaAhHa"
			, "ahHhaAaAijJjJjJahHhajJjiahHha"
			, "aAhHhHhaijJjgjJahHhHaAaihHhHa"
			, "eEaAaAhaijJjJjJahHhHhHhHhHhHa"
			, "fFfFfaAaijJjJgahHhkahHhHhkahHa"
			, "fFfFfFfaijgjJjahHhaAhHhahaAhHa"
			, "gGfFfFfaijJjgjahjJhHhHhHhHhjJa"
			, "gGgGgGaAiIjgjJahjJhahHahHahjJa"
			, "  gGaAaAiIijJjJahHhaAaAaAahHa"
			, "   ahHhaAiIiIiIiahHhHhHhHhHa "
			, "   ahHa aAaAaAaAaAaAaAaAaAa  "
			, "   aAa   ahHa   ahHa ahHa    "
			, "          aAa    aAa  aAa    "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Portal by Adam"
		, theme: "space"
		, bricks: [
			" fF                        kK "
			, " fF                        kK "
			, " fF                        kK "
			, " fF   hH                   kK "
			, " fF  hHhH                  kK "
			, " fF  hHhH                  kK "
			, " fFh  hH                   kK "
			, " fFhHh                     kK "
			, " fFhHhH                hH hkK "
			, " fFhHhHhH             hHhHhkK "
			, " fFhHh hHh           hHh hHkK "
			, " fFhH   hHh         hHh  hHkK "
			, " fFhH    hH          h   hHkK "
			, " fFh                     hHkK "
			, " fFhH               h   hHhkK "
			, " fF hH             hHh hHhHkK "
			, " fF  hH             hHhHh hkK "
			, " fF hH               hHh   kK "
			, " fFhH                 h    kK "
			, " fF                        kK "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Nintendo 64 by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"            kKkKk             "
			, "         nNcknNnkcnN          "
			, "        kKkKkKkKkKkKk         "
			, "       kncnkKkKkKknfnk        "
			, "       kcCckKkKkKkfnfk        "
			, "       kncnkKkbkKjnfnk        "
			, "       nkKkKkKkKkKgkKn        "
			, "       knkKkKcCckKkKnk        "
			, "       kKnNnkcncknNnkK        "
			, "       kKk  ncCcn  kKk        "
			, "       kKk  nkKkn  kKk        "
			, "       nkn   kKk   nkn        "
			, "        n    kKk    n         "
			, "             nknh             "
			, "              n h             "
			, "                hHh           "
			, "                  h           "
			, "                  hH          "
			, "                   hH         "
			, "                    hH        "
			, "                     h        "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "GameCube by EnderAndrew"
		, theme: "synthwave"
		, bricks: [
			"           gGgGgGg            "
			, "       gGgGgkKkKkgGgGg        "
			, "      gkKkgGgGgGgGghHkg       "
			, "     gk h kgGghgGgkKjJhg      "
			, "     gkhHhkgGgGgGgbkaAhg      "
			, "     gk h kKg   gkKkKkKg      "
			, "     gGkKkKhkg gfofkKkgG      "
			, "     gGgGkhHhg goOokgGgG      "
			, "     gGg gkhkg gfofg gGg      "
			, "     gGg  gGg   gGG  gGg      "
			, "     gGg        h    gGg      "
			, "      g         hH    g       "
			, "                 hH           "
			, "                  hH          "
			, "                   hH         "
			, "                    h         "
			, "                    hH        "
			, "                     h        "
			, "                     h        "
			, "                     hH       "
			, "                      h       "
			, "                      h       "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "AOL by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"                              "
			, "                              "
			, "       gGg                    "
			, "      gfFfg                   "
			, "      gfFfg                   "
			, "      gfFfg                   "
			, "      gGgGg                   "
			, "     gfFfFgGg                 "
			, "     gfFfFfFg  gG   gG  g     "
			, "    gfFfgfFfg g  g g  g g     "
			, "    gfFfFgGg  g  g g  g g     "
			, "   gfFfFfFg   g  g g  g g     "
			, "  gfFfgGfFg   gGgG g  g g     "
			, "  gfFg  gfFg  g  g g  g g     "
			, "   gG    gG   g  g  gG  gGgG  "
		, ]
	},

	{
		colors: {
			w: '#F2F2F2', // White/Bone
			g: '#BDC3C7', // Grey/Shadow
			k: '#000000' // Black holes
		}
		, name: "Bad to the Bone"
		, theme: "synthwave"
		, bricks: [
			"                              "
			, "     wwwww          wwwww     "
			, "   wwwwwwwww      wwwwwwwww   "
			, "  wwwwwwwwwww    wwwwwwwwwww  "
			, " wwwwwwwwwwwww  wwwwwwwwwwwww "
			, " wwkkwwwwwkkww  wwkkwwwwwkkww "
			, " wwkkwwwwwkkww  wwkkwwwwwkkww "
			, " wwwwwwwwwwwww  wwwwwwwwwwwww "
			, "  wwwwwkwwwww    wwwwwkwwwww  "
			, "  wwwwwkwwwww    wwwwwkwwwww  "
			, "   wwwwwwwww      wwwwwwwww   "
			, "   ggwgwgwgg      ggwgwgwgg   "
			, "   gwgwgwgwg      gwgwgwgwg   "
			, "                               "
		]
	},

	{
		colors: {
			o: '#000000', // Black
			g: '#00008B', // Dark Blue
			f: '#C0C0C0', // Silver
			k: '#ADD8E6', // Light Blue
		}
		, name: "Save Icon by EnderAndrew"
		, theme: "circuit"
		, bricks: [
			"                              "
			, "                              "
			, "      ogGgoOofFfFfFfgGg       "
			, "      ogGgoOofFfFoOfgGg       "
			, "      ogGgoOofFfFoOfgGg       "
			, "      ogGgoOofFfFoOfgGg       "
			, "      ogGgoOofFfFfFfgGg       "
			, "      ogGgGgGgGgGgGgGgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKgGgGgGgGkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKgGgGgGgGkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogokKkKkKkKkKkKog       "
			, "      ogGkKkKkKkKkKkKgG       "
			, "      ogGkKkKkKkKkKkKgG       "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Frog by Mix3rz"
		, theme: "forest"
		, bricks: [
			"                              "
			, "                              "
			, "                              "
			, "         dDd      dDd         "
			, "        dfFfd    dfFfd        "
			, "       dfdDfFdDdDfFdDfd       "
			, "       dfdDfFaAaAfFdDfd       "
			, "       dfFfFfaAaAfFfFfd       "
			, "        dfFfaAaAaAfFfd        "
			, "       daAaAaAaAaAaAaAd       "
			, "      daAdaAaAaAaAaAdaAd      "
			, "      daAadDdDdDdDdDaAad      "
			, "       daAaAaAaAaAaAaAd       "
			, "        dDdaAaAaAaAdDd        "
			, "         daAaAaAaAaAd         "
			, "       dDaAaAamMaAaAadD       "
			, "      dmdaAaAmMmMaAaAdmd      "
			, "      dmMmdmdmMmMdmdmMmd      "
			, "       dDd d dDdD d dDd       "
			, "                              "
			, "                              "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Ace of Spades by Mix3rz"
		, theme: "city"
		, bricks: [
			"                              "
			, "  e                           "
			, " e e         dD               "
			, " eEe        dDeE              "
			, " e e       deEeEe             "
			, "           dEeEeE             "
			, "          dEeEeEeE            "
			, "          dEeEeEeE            "
			, "         dEeEeEeEeE           "
			, "         dEeEeEeEeE           "
			, "        dEeEeEeEeEeE          "
			, "        dEeEeEeEeEeE          "
			, "       dEeEeEeEeEeEeE         "
			, "       dEeEeEeEeEeEeE         "
			, "             eE               "
			, "            eEeE              "
			, "           eEeEeE             "
			, "          eEeEeEeE        e e "
			, "          eEeEeEeE        eEe "
			, "                          e e "
			, "                           e  "
			, "                              "
		]
	},

	{
		colors: {
			a: '#7FFD44', // light greEn
			b: '#56B428', // greEn
			c: '#AE7349', // tan
			d: '#7A4E33', // brown
			e: '#5A3724', // dark brown
			f: '#A19B9B', // light grey
			g: '#665C64', // dark grey
		}
		, name: "Minecraft by EnderAndrew"
		, theme: "forest"
		, bricks: [
			""
			, "       aAabBabaAaAaAaba      "
			, "       aAaAaebBbaAabaAa      "
			, "       aeabBebeaAaAebBe      "
			, "       egeEbeEebebedeEd      "
			, "       cdcCecCceEegdced      "
			, "       decCeceEedDedDdc      "
			, "       cedDfdDcCdcCdcdc      "
			, "       cdcCcCdDcCcCdDcC      "
			, "       cdDcdcdcdcCdDded      "
			, "       cCedDeEdDdDdcCdc      "
			, "       cCdcCdcCcCcdcCfd      "
			, "       cdDcCcdcgcCdecde      "
			, "       decdcCcdDdDdDdcC      "
			, "       dcdDedcCdecedcCc      "
			, "       cdecdcdcdDdedDcC      "
			, "       cdcCcdgcCcdDcCde      "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Pyramid"
		, theme: "circuit"
		, bricks: [
			"                              "
			, "               d              "
			, "              d d             "
			, "             r S r            "
			, "            r r r r           "
			, "           r r S r r          "
			, "          r r r r r r         "
			, "         r r S r r S r        "
			, "        r r r r r r r r       "
			, "       r r S r r S r r S      "
			, "      r r r r r r r r r r     "
			, "     r r S r r S r r S r r    "
			, "    r r r r r r r r r r r r   "
			, "   r r S r r S r r S r r S r  "
			, "  r r r r r r r r r r r r r r "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.pastel
		, name: "Six Pack"
		, theme: "circuit"
		, bricks: [
			"", ""
			, "  yyYYyyYYyyYY  YYyyYYyyYYyy  "
			, "  bbBBbbBBbbBB  BBbbBBbbBBbb  "
			, "  ggGGggGGggGG  GGggGGggGGgg  "
			, "  ooOOooOOooOO  OOooOOooOOoo  "
			, "", ""
			, "  yyYYyyYYyyYY  YYyyYYyyYYyy  "
			, "  bbBBbbBBbbBB  BBbbBBbbBBbb  "
			, "  ggGGggGGggGG  GGggGGggGGgg  "
			, "  ooOOooOOooOO  OOooOOooOOoo  "
			, "", ""
			, "  yyYYyyYYyyYY  YYyyYYyyYYyy  "
			, "  bbBBbbBBbbBB  BBbbBBbbBBbb  "
			, "  ggGGggGGggGG  GGggGGggGGgg  "
			, "  ooOOooOOooOO  OOooOOooOOoo  "
		]
	},

	{
		colors: Breakout.Colors.vintage
		, name: "Louvre Inverted Pyramid"
		, theme: "city"
		, bricks: [
			"", "", ""
			, "   AAaaAAaaAAaaAAaaAAaaAAaa   "
			, "    BBbbBBbbBBbbBBbbBBbbBB    "
			, "     CCccCCccCCccCCccCCcc     "
			, "      DDddDDddDDddDDddDD      "
			, "       EEeeEEeeEEeeEEee       "
			, "        FFffFFffFFffFF        "
			, "         GGggGGggGGgg         "
			, "          HHhhHHhhHH          "
			, "           IIiiIIii           "
			, "            JJjjJJ            "
			, "             KKkk             "
			, "              LL              "
		]
	},

	{
		colors: Breakout.Colors.vintage
		, name: "Love Triangles"
		, theme: "forest"
		, bricks: [
			"", ""
			, "  aabbccddeeffggFFEEDDCCBBAA  "
			, "   aabbccddeeffFFEEDDCCBBAA   "
			, "    aabbccddeeffEEDDCCBBAA    "
			, "     aabbccddeeEEDDCCBBAA     "
			, "      aabbccddeeDDCCBBAA      "
			, "       aabbccddDDCCBBAA       "
			, "        aabbccddCCBBAA        "
			, "         aabbccCCBBAA         "
			, "          aabbccBBAA          "
			, "      hh   aabbBBAA   hh      "
			, "     hhHH   aabbAA   hhHH     "
			, "    hhiiHH   aaAA   hhiiHH    "
			, "   hhiiIIHH   aa   hhiiIIHH   "
			, "  hhiijjIIHH      hhiijjIIHH  "
			, " hhiijjJJIIHH    hhiijjJJIIHH "
		]
	},

	{
		colors: Breakout.Colors.pastel
		, name: "You've Got Mail"
		, theme: "circuit"
		, bricks: [
			"                              "
			, "                              "
			, "  bbBBbbBBbbBBbbBBbbBBbbBBbb  "
			, "  ooyyYYyyYYyyYYyyYYyyYYyyoo  "
			, "  ooyyYYyyYYyyYYyyYYyyYYyyoo  "
			, "  ooOOYYyyYYyyYYyyYYyyYYOOoo  "
			, "  ooOOooyyYYyyYYyyYYyyooOOoo  "
			, "  oobbooOOYYyyYYyyYYOOoobboo  "
			, "  oobbBBOOooyyYYyyooOOBBbboo  "
			, "  ooppBBbbOOooYYooOObbBBppoo  "
			, "  ooppPPbbBBooOOooBBbbPPppoo  "
			, "  ooppPPppBBbbOObbBBppPPppoo  "
			, "  ooppPPppPPbbBBbbPPppPPppoo  "
			, "  ooppPPppPPppBBppPPppPPppoo  "
			, "  ooppPPppPPppPPppPPppPPppoo  "
			, "  ooggGGggGGggGGggGGggGGggoo  "
			, "  ooggGGggGGggGGggGGggGGggoo  "
			, "  bbBBbbBBbbBBbbBBbbBBbbBBbb  "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Crossfire"
		, theme: "space"
		, bricks: [
			" S S S r r r r r r r r r S S S S"
			, "r S S S r r r r r r r r S S S S "
			, " S r S S r r r r r r r S S S S S"
			, "S S S r S r r r r r r S S S S S "
			, " S S S S r r r r r r S S S S S  "
			, "  S S S S r r r r r S S S S S   "
			, "   S S S S r r r r S S S S S    "
			, "    S S S S r r r S S S S S     "
			, "     S S S S r r S S S S S      "
			, "      S S S S r S S S S S       "
			, "       r r r r S r r r r        "
			, "        S S S S r S S S         "
			, "                           "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Chevron"
		, theme: "city"
		, bricks: [
			"                              "
			, "i     i     i     i     i     "
			, " j   j j   j j   j j   j j   j"
			, "  k k   k k   k k   k k   k k "
			, "   l     l     l     l     l  "
			, "    m   m m   m m   m m   m   "
			, "     n n   n n   n n   n n    "
			, "      f     f     f     f     "
			, "     n n   n n   n n   n n    "
			, "    m   m m   m m   m m   m   "
			, "   l     l     l     l     l  "
			, "  k k   k k   k k   k k   k k "
			, " j   j j   j j   j j   j j   j"
			, "i     i     i     i     i     "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Pillars"
		, theme: "forest"
		, bricks: [
			"                              "
			, " i  i  i  i  i  i  i  i  i  i "
			, " j  j  j  j  j  j  j  j  j  j "
			, " k  k  k  k  k  k  k  k  k  k "
			, " l  l  l  l  l  l  l  l  l  l "
			, " m  m  m  m  m  m  m  m  m  m "
			, " m  m  m  m  m  m  m  m  m  m "
			, " l  l  l  l  l  l  l  l  l  l "
			, " k  k  k  k  k  k  k  k  k  k "
			, " j  j  j  j  j  j  j  j  j  j "
			, " i  i  i  i  i  i  i  i  i  i "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "T-Rings"
		, theme: "city"
		, bricks: [
			"n n n n n n n n n n n n n n n"
			, " k                          k"
			, "  i                        i "
			, "   j                      j  "
			, "    l                    l   "
			, "     m m m m m m m m m m m  "
			, "    l                    l   "
			, "   j                      j  "
			, "  i                        i "
			, " k                          k"
			, "n n n n n n n n n n n n n n n"
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "The Wall"
		, theme: "circuit"
		, bricks: [
			"r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r "
			, "o o o o o o o o o o o o o o o o o o o o o o o o o o o o o o "
			, "l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r "
			, "o o o o o o o o o o o o o o o o o o o o o o o o o o o o o o "
			, "l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "r r r r r r r r r r r r r r r r r r r r r r r r r r r r r r "
			, "o o o o o o o o o o o o o o o o o o o o o o o o o o o o o o "
			, "l l l l l l l l l l l l l l l l l l l l l l l l l l l l l l "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Checkerboard"
		, theme: "city"
		, bricks: [
			"                              "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "S r S r S r S r S r S r S r S r S r S r S r S r S r S r S r "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "S l S l S l S l S l S l S l S l S l S l S l S l S l S l S l "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "S r S r S r S r S r S r S r S r S r S r S r S r S r S r S r "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "S l S l S l S l S l S l S l S l S l S l S l S l S l S l S l "
			, "o S o S o S o S o S o S o S o S o S o S o S o S o S o S o S "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Tunnel Vision"
		, theme: "space"
		, bricks: [
			"S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S r r r r r r r r r r r r r r r r r r r r r r r r r r r r S "
			, "S r S S S S S S S S S S S S S S S S S S S S S S S S S S r S "
			, "S r S l l l l l l l l l l l l l l l l l l l l l l l l S r S "
			, "S r S l S S S S S S S S S S S S S S S S S S S S S S S l S r S "
			, "S r S l S o o o o o o o o o o o o o o o o o o o o o S l S r S "
			, "S r S l S o S S S S S S S S S S S S S S S S S S S o S l S r S "
			, "S r S l S o S y y y y y y y y y y y y y y y y y S o S l S r S "
			, "S r S l S o S y S             S y S o S l S r S "
			, "S r S l S o S y S S S S S S S S S S S S S S S y S o S l S r S "
			, "S r S l S o S y y y y y y y y y y y y y y y y y S o S l S r S "
			, "S r S l S o S S S S S S S S S S S S S S S S S S S o S l S r S "
			, "S r S l l l l l l l l l l l l l l l l l l l l l l l l S r S "
			, "S r S S S S S S S S S S S S S S S S S S S S S S S S S S S r S "
			, "S r r r r r r r r r r r r r r r r r r r r r r r r r r r r S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "The Box"
		, theme: "forest"
		, bricks: [
			"r S o l l l l l l l l l l l l l l l l l l l l l l l o S r "
			, "r S o l y y y y y y y y y y y y y y y y y y y y y l o S r "
			, "r S o l y g g g g g g g g g g g g g g g g g g y l o S r "
			, "r S o l y g b b b b b b b b b b b b b b b b g y l o S r "
			, "r S o l y g b p p p p p p p p p p p p p p b g y l o S r "
			, "r S o l y g b p w w w w w w w w w w w w p b g y l o S r "
			, "r S o l y g b p w S S S S S S S S S S w p b g y l o S r "
			, "r S o l y g b p w S r r r r r r r r S w p b g y l o S r "
			, "r S o l y g b p w S r l l l l l l r S w p b g y l o S r "
			, "r S o l y g b p w S r l o o o l r S w p b g y l o S r "
			, "r S o l y g b p w S r l l l l l l r S w p b g y l o S r "
			, "r S o l y g b p w S r r r r r r r r S w p b g y l o S r "
			, "r S o l y g b p w S S S S S S S S S S w p b g y l o S r "
			, "r S o l y g b p w w w w w w w w w w w w p b g y l o S r "
			, "r S o l y g b b b b b b b b b b b b b b b b g y l o S r "
			, "r S o l y g g g g g g g g g g g g g g g g g g y l o S r "
			, "r S o l y y y y y y y y y y y y y y y y y y y y y l o S r "
			, "r S o l l l l l l l l l l l l l l l l l l l l l l l l o S r "
			, "r S o o o o o o o o o o o o o o o o o o o o o o o o o S r "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Play a Game"
		, theme: "circuit"
		, bricks: [
			"m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
			, "m l m l m l m l m l m l m l m l"
			, "n k n k n k n k n k n k n k n k"
		, ]
	},


	{
		colors: Breakout.Colors.arkanoid
		, name: "The Grid"
		, theme: "synthwave"
		, bricks: [
			"S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S r o l y g b p S r o l y g b p S r o l y g b p S r o l y S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S o r l y g b p S o r l y g b p S o r l y g b p S o r l y S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S l o r y g b p S l o r y g b p S l o r y g b p S l o r y S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S y g b p r o l S y g b p r o l S y g b p r o l S y g b p S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S g b p r o l y S g b p r o l y S g b p r o l y S g b p r S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S b p r o l y g S b p r o l y g S b p r o l y g S b p r o S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
			, "S p r o l y g b S p r o l y g b S p r o l y g b S p r o l S "
			, "S S S S S S S S S S S S S S S S S S S S S S S S S S S S S S "
		, ]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Wavy Walls"
		, theme: "city"
		, bricks: [
			"G G G G G G G G G G G G G G G "
			, " y y y y y y y y y y y y y y y"
			, "G G G G G G G G G G G G G G G "
			, " y y y y y y y y y y y y y y y"
			, " G G G G G G G G G G G G G G G"
			, "  y y y y y y y y y y y y y y "
			, " G G G G G G G G G G G G G G G"
			, "  y y y y y y y y y y y y y y "
			, " G G G G G G G G G G G G G G G"
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "The Checker"
		, theme: "space"
		, bricks: [
			"R Y R Y R Y R Y R Y R Y R Y R Y "
			, " Y R Y R Y R Y R Y R Y R Y R Y R"
			, "R Y R Y R Y R Y R Y R Y R Y R Y "
			, " Y R Y R Y R Y R Y R Y R Y R Y R"
			, "R Y R Y R Y R Y R Y R Y R Y R Y "
			, " Y R Y R Y R Y R Y R Y R Y R Y R"
			, "R Y R Y R Y R Y R Y R Y R Y R Y "
			, " Y R Y R Y R Y R Y R Y R Y R Y R"
			, "r y r y r y r y r y r y r y r y "
			, " y r y r y r y r y r y r y r y r"
			, "r y r y r y r y r y r y r y r y "
			, " y r y r y r y r y r y r y r y r"
			, "r y r y r y r y r y r y r y r y "
			, " y r y r y r y r y r y r y r y r"
			, "                              "
			, "                              "
			, "                              "
			, "                              "
			, "                              "
		]
	},

	{
		colors: Breakout.Colors.arkanoid
		, name: "Waterfall"
		, theme: "forest"
		, bricks: [
			"S r r r r S r r r r S r r r r S r r r r S "
			, " l l l l   l l l l   l l l l   l l l l    "
			, "  o o o o S o o o o S o o o o S o o o o S "
			, "   w w w   w w w   w w w   w w w          "
			, "S r r r r S r r r r S r r r r S r r r r S "
			, " l l l l   l l l l   l l l l   l l l l    "
			, "  o o o o S o o o o S o o o o S o o o o S "
			, "   w w w   w w w   w w w   w w w          "
			, "S r r r r S r r r r S r r r r S r r r r S "
			, " l l l l   l l l l   l l l l   l l l l    "
			, "                              "
		, ]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Test"
		, theme: "space"
		, bricks: [
			"fffffFFFFFfffffFFFFFfffffFFFFf"
			, "ggGggGGGGGgggggGGGGGgggggGGGGG"
			, "hhhhhHHHHHhhhhhHHHHHhhhhhHHHHH"
			, "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII"
			, "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ"
			, "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK"
			, "lllllLLLLLlllllLLLLLlllllLLLLL"
			, "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM"
			, "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN"
			, "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII"
			, "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ"
			, "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK"
			, "lllllLLLLLlllllLLLLLlllllLLLLL"
			, "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM"
			, "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN"
			, "iiiiiIIIIIiiiiiIIIIIiiiiiIIIII"
			, "jjjjjJJJJJjjjjjJJJJJjjjjjJJJJJ"
			, "kkkkkKKKKKkkkkkKKKKKkkkkkKKKKK"
			, "lllllLLLLLlllllLLLLLlllllLLLLL"
			, "mmmmmMMMMMmmmmmMMMMMmmmmmMMMMM"
			, "nnnnnNNNNNnnnnnNNNNNnnnnnNNNNN"
		]
	},

	{
		colors: Breakout.Colors.hf
		, name: "Test2"
		, theme: "city"
		, bricks: [
			"                              "
			, "       eE eEeEeEeEeEeEeE      "
			, "      eEeEeEe           e     "
			, "    eEe                 eE    "
			, "   eE                    e    "
			, "   e       gG     gG     eE   "
			, "   e       gG     gG      e   "
			, "  eE                      e   "
			, "  e                       e   "
			, "   e                  i   eE  "
			, "   e                  i    e  "
			, "   e                  i    e  "
			, "   e   iIi          iIi    e  "
			, "   eE    iIiIiIiIiIi      eE  "
			, "    eE                    e   "
			, "     eE                   e   "
			, "      eE                 eE   "
			, "        eE              eE    "
			, "         eEeE        eEeE     "
			, "             eEeEeEeEe        "
		, ]
	},

];