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
} // Game