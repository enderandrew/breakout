// PATCH: parallax-grid+start-guard 2025-10-01 17:50:54 sha256:82ec1789ac6a
//=============================================================================
// Breakout in HTML5 / Javascript with powerups and a level creator.
// 
//=============================================================================
var Breakout = {
  // --- Audio unlock & BGM control (autoplay-safe) ---
  installAudioUnlock: function () {
    if (this._audioUnlockInstalled) return;
    this._audioUnlockInstalled = true;
    var self = this;

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
  tryStartBGM: function () {
    if (!this.sound || !this.userAudioUnlocked) return;
    if (typeof soundManager === 'undefined' || !soundManager.ok) return;
    if (soundManager.ok && !soundManager.ok()) return;
    var sm = soundManager;
    var bgm = sm.getSoundById ? sm.getSoundById('bgm') : null;
    if (!bgm && sm.createSound) {
      sm.createSound({
        id: 'bgm',
        url: './sound/breakout/bgm-synthwave.wav',
        volume: 55,
        onfinish: function () {
          try {
            this.play();
          } catch (e) {}
        }
      });
      bgm = sm.getSoundById ? sm.getSoundById('bgm') : null;
    }
    if (!bgm) return;
    if (this._bgmState === 'playing') return;
    this._bgmState = 'playing';
    try {
      var r = bgm.play();
      if (r && typeof r.then === 'function') {
        r.catch(function () {
          /* ignore blocked autoplay; will retry on user gesture */
        });
      }
    } catch (e) {
      this._bgmState = 'idle';
    }
  },
  stopBGM: function () {
    try {
      if (typeof soundManager !== 'undefined' && soundManager.getSoundById) {
        var bgm = soundManager.getSoundById('bgm');
        if (bgm) bgm.stop();
      }
    } catch (e) {}
    this._bgmState = 'idle';
  },
  //---------------------------------------------------------------------------
  // Defaults
  //---------------------------------------------------------------------------
  Defaults: {
    level: {
      name: ""
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
      radius: 0.3,
      defaultRadius: 0.3,
      speed: 15,
      defaultSpeed: 15,
      labels: {
        3: {
          text: 'ready...',
          fill: '#FF2121',
          stroke: 'black',
          font: 'bold 28pt arial'
        },
        2: {
          text: 'set..',
          fill: 'white',
          stroke: 'black',
          font: 'bold 28pt arial'
        },
        1: {
          text: 'go!',
          fill: '#00B500',
          stroke: 'black',
          font: 'bold 28pt arial'
        }
      }
    },
    paddle: {
      width: 6,
      defaultWidth: 6,
      height: 1,
      speed: 20
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
        },
        {
          name: 'abandon',
          from: 'game',
          to: 'menu'
        },
        {
          name: 'lose',
          from: 'game',
          to: 'menu'
        }
      ]
    },
    powerup: {
      droprate: {
        low: 0,
        high: 5,
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
      },
      {
        keys: [Game.KEY.RIGHT, Game.KEY.D],
        mode: 'down',
        state: 'game',
        action: function () {
          this.paddle.moveRight();
        }
      },
      {
        keys: [Game.KEY.LEFT, Game.KEY.A],
        state: 'game',
        action: function () {
          this.paddle.stopMovingLeft();
        }
      },
      {
        keys: [Game.KEY.RIGHT, Game.KEY.D],
        state: 'game',
        action: function () {
          this.paddle.stopMovingRight();
        }
      },
      {
        keys: [Game.KEY.SPACE, Game.KEY.RETURN],
        state: 'menu',
        action: function () {
          this.play();
        }
      },
      {
        keys: [Game.KEY.SPACE, Game.KEY.RETURN],
        state: 'game',
        action: function () {
          if (this.ball.releaseSticky && this.ball.releaseSticky()) return;
          if (this.ball.hasParkedBall && this.ball.hasParkedBall()) this.ball.launchNow();
        }
      },
      {
        key: Game.KEY.ESC,
        state: 'game',
        action: function () {
          this.abandon();
        }
      },
      {
        key: Game.KEY.UP,
        state: 'menu',
        action: function () {
          this.nextLevel();
        }
      },
      {
        key: Game.KEY.DOWN,
        state: 'menu',
        action: function () {
          this.prevLevel();
        }
      }
    ],
    sounds: {
      brick: './sound/breakout/brick.mp3',
      paddle: './sound/breakout/paddle.mp3',
      go: './sound/breakout/go.mp3',
      levelup: './sound/breakout/levelup.mp3',
      loselife: './sound/breakout/loselife.mp3',
      gameover: './sound/breakout/gameover.mp3',
      powerup: './sound/breakout/powerup.mp3',
      portal: './sound/breakout/portal.mp3',
    }
  },
  //---------------------------------------------------------------------------
  initialize: function (runner, cfg) {
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
    this.storage = runner.storage();
    this.color = cfg.color;
    this.sound = (this.storage.sound == "true");
    if (typeof this.storage.sound === 'undefined') {
      this.storage.sound = this.sound = true;
    }
    this.court = Object.construct(Breakout.Court, this, cfg.court);
    //=============================================================================
    // Background (parallax synthwave sky + stars + horizon grid)
    //=============================================================================
    Breakout.BG = {
      initialize: function (game) {
        this.game = game;
        this.t = 0;
        this.layers = [];
      },
      init: function () {
        this.resize(this.game.width, this.game.height);
      },
      resize: function (w, h) {
        this.w = w;
        this.h = h;
        var mkStars = (count, parallax, seed) => {
          var s = [];
          var r = seed >>> 0;
          for (var i = 0; i < count; i++) {
            r = (1664525 * r + 1013904223) >>> 0;
            var x = (r % this.w);
            r = (1664525 * r + 1013904223) >>> 0;
            var y = (r % this.h);
            s.push({
              x: x,
              y: y,
              p: parallax,
              a: 0.35 + 0.35 * Math.random(),
              tw: Math.random() * 6.28
            });
          }
          return s;
        };
        this.layers = [{
            type: 'gradient'
          },
          {
            type: 'stars',
            stars: mkStars(70, 0.15, 7)
          },
          {
            type: 'stars',
            stars: mkStars(40, 0.35, 11)
          },
          {
            type: 'horizon'
          }
        ];
      },
      update: function (dt) {
        this.t += dt;
      },
      draw: function (ctx) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        var g = ctx.createLinearGradient(0, 0, 0, this.h);
        var pulse = 0.02 * Math.sin(this.t * 1.3);
        g.addColorStop(0, '#2a1f72');
        g.addColorStop(0.4, '#624ea2');
        g.addColorStop(0.7, 'rgba(' + ((220 + 20 * pulse) | 0) + ',' + ((160 + 10 * pulse) | 0) + ',' + ((190 + 10 * pulse) | 0) + ',1)');
        g.addColorStop(1, '#1a1422');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, this.w, this.h);
        for (var i = 0; i < this.layers.length; i++) {
          var L = this.layers[i];
          if (L.type !== 'stars') continue;
          for (var s = 0; s < L.stars.length; s++) {
            var st = L.stars[s];
            var tw = 0.5 + 0.5 * Math.sin(this.t * 2.0 + st.tw);
            var y = st.y + 2 * Math.sin(this.t * (0.6 + st.p));
            ctx.globalAlpha = st.a * tw * 0.8;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(st.x, y, 1, 1);
          }
        }
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
// --- perspective grid (clean) ---
(function drawPerspectiveGrid(ctx, w, h) {
  const horizon = Math.floor(h * 0.58) + 0.5;
  const alpha   = 0.14;
  const stepX   = Math.max(28, Math.floor(w / 26));
  const stepY   = Math.max(18, Math.floor(h / 40));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = 1;
  for (let y = horizon + stepY; y <= h; y += stepY) {
    const yy = Math.floor(y) + 0.5;
    ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke();
  }
  const cx = w * 0.5;
  for (let x = -w; x <= 2*w; x += stepX) {
    const xx = Math.floor(x % stepX) + 0.5;
    ctx.beginPath(); ctx.moveTo(xx, horizon);
    const targetX = cx + (xx - cx) * 1.15;
    ctx.lineTo(targetX, h + 0.5); ctx.stroke();
  }
  ctx.restore();
})(ctx, this.w, this.h);

        ctx.restore();
      }
    };
    this.court = Object.construct(Breakout.Court, this, cfg.court);
    this.paddle = Object.construct(Breakout.Paddle, this, cfg.paddle);
    this.ball = Object.construct(Breakout.Ball, this, cfg.ball);
    this.score = Object.construct(Breakout.Score, this, cfg.score);
    this.powerup = Object.construct(Breakout.Powerups, this, cfg, this.ball, this.paddle, this.score);
    this.particles = Object.construct(Breakout.Particles, this, {});
    this.bg = Object.construct(Breakout.BG, this, {});
    this.bg.init();
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
    this.PORTAL_DURATION_MS = 15000; // 15s lifetime
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
    this._nextPending = false;
  },
  //-----------------------------------------------------------------------------
  // Portals
  //-----------------------------------------------------------------------------
  spawnPortals: function () {
    var c = this.court;

    function spot() {
      for (var attempt = 0; attempt < 40; attempt++) {
        var rowMin = Math.max(0, c.rowsMin || 0),
          rowMax = Math.min(c.cfg.ychunks - 1, c.rowsMax || c.cfg.ychunks - 1);
        var col = Math.floor(Math.random() * c.cfg.xchunks);
        var row = rowMin + Math.floor(Math.random() * (rowMax - rowMin + 1));
        var x = c.left + col * c.chunk + c.chunk / 2;
        var y = c.top + row * c.chunk + c.chunk / 2;
        var r = Math.max(12, Math.floor(c.chunk * 1.10)); // bigger portals
        // reject if overlaps a live brick or walls
        var ok = (x - r >= c.left && x + r <= c.right && y - r >= c.top && y + r <= c.bottom);
        for (var i = 0; ok && i < c.bricks.length; i++) {
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
      for (var wi = this.portalWhooshes.length - 1; wi >= 0; wi--) {
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
    for (var i = 0; i < P.length; i++) {
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
    var w = Math.max(2, Math.floor(this.court.chunk * 0.18));
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
    var c = this.court;
    var thr = this.court.chunk * 3; // influence distance
    function clamp(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < P.length; i++) {
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
    for (var i = 0; i < this.portalWhooshes.length; i++) {
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
    var c = this.court;
    // try to pick a spot near the center but away from live bricks & walls
    function okSpot(x, y, r) {
      if (x - r < c.left || x + r > c.right || y - r < c.top || y + r > c.bottom) return false;
      for (var i = 0; i < c.bricks.length; i++) {
        var B = c.bricks[i];
        if (!B || B.hit) continue;
        if (x - r < B.right && x + r > B.left && y - r < B.bottom && y + r > B.top) return false;
      }
      return true;
    }
    var r = Math.max(10, Math.floor(c.chunk * 1.0));
    var cx = c.left + c.width * 0.5;
    var cy = c.top + c.height * 0.45;
    var spot = null;
    // try a few jitters around the center
    for (var tries = 0; tries < 40; tries++) {
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
    var c = this.court;
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
    var pulses = 3;
    for (var i = 0; i < pulses; i++) {
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
    for (var ri = 0; ri < 3; ri++) {
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
    var c = this.court;
    if (!c) return;
    var items = [];
    // size/speed labels
    if (this.ball && this.ball.temp) {
      if (this.ball.temp.size > 1) items.push('Big Strong Ball');
      else if (this.ball.temp.size < 1) items.push('Small Puny Ball');
      if (this.ball.temp.speed > 1) items.push('Fast Mighty Ball');
      else if (this.ball.temp.speed < 1) items.push('Slow Weak Ball');
    }
    if (Breakout.Defaults.paddle.width > Breakout.Defaults.paddle.defaultWidth) {
      items.push('Big Paddle');
    }
    if (Breakout.Defaults.paddle.width < Breakout.Defaults.paddle.defaultWidth) {
      items.push('Small Paddle');
    }
    // other effects
    if (this.ball && this.ball.fire) items.push('Fireball');
    if (this.powerup && this.powerup.isStickyActive && this.powerup.isStickyActive()) items.push('Sticky');
    if (this.powerup && this.powerup.isConfusedActive && this.powerup.isConfusedActive()) items.push('Confused');
    if (this.powerup && this.powerup.isLasersActive && this.powerup.isLasersActive()) items.push('Lasers');
    if (this.powerup && this.powerup.isSplitActive && this.powerup.isSplitActive()) items.push('Split Paddle');
    if (this.powerup && this.powerup.isChaosActive && this.powerup.isChaosActive()) items.push('Chaos!');
    if (this.ball && this.ball.balls && this.ball.balls.length > 1) items.push('Multiball');
    if (this.getActivePortals && this.getActivePortals()) items.push('Portals');
    if (this.shuffleActive) items.push('Shuffle');
    if (this.gravityWell) items.push('Black Hole');
    if (!items.length) return;
    var x = c.right + Math.max(6, c.wall.size + 6);
    var y = c.top + 10;
    var pad = 6;
    var rowH = Math.max(18, Math.floor(c.chunk * 1.1));
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold ' + Math.max(12, Math.floor(c.chunk * 0.7)) + 'px Arial';
    for (var i = 0; i < items.length; i++) {
      var t = items[i];
      var tw = ctx.measureText(t).width;
      var boxw = tw + pad * 2;
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y - rowH + 4, boxw, rowH);
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y - rowH + 4 + 0.5, boxw - 1, rowH - 1);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#fff';
      ctx.fillText(t, x + pad, y - 6);
      y += Math.max(22, Math.floor(c.chunk * 1.5));
    }
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
    var w = C.right - C.left,
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
    var cx = R.cx,
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
    Game.addEvent('prev', 'click', this.prevLevel.bind(this, false));
    Game.addEvent('next', 'click', this.nextLevel.bind(this, false));
    Game.addEvent('sound', 'change', this.toggleSound.bind(this, false));
    Game.addEvent('instructions', 'touchstart', this.play.bind(this));
    Game.addEvent('instructions', 'click', this.play.bind(this));
    Game.addEvent(this.runner.canvas, 'touchstart', this.ontouchstart.bind(this));
    Game.addEvent(this.runner.canvas, 'touchmove', this.ontouchmove.bind(this));
    Game.addEvent(this.runner.canvas, 'touchend', this.ontouchend.bind(this));
    Game.addEvent(this.runner.canvas, 'mousemove', this.onmousemove.bind(this));
    Game.addEvent(document.body, 'touchmove', function (event) {
      event.preventDefault();
    });
    Game.addEvent('upload', 'click', this.load.bind(this, true));
    Game.addEvent(document, 'keydown', (e) => { if (!this.is || !this.is('menu')) return; if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.play(); }});
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
    if (this.beat) {
      this.beat.t += dt;
      if (this.beat.t - this.beat.last >= this.beat.interval) {
        this.beat.last += this.beat.interval;
        if (this.bg && this.bg.onBeat) this.bg.onBeat();
      }
    }
    if (this.bg) this.bg.update(dt);
    this.court.update(dt);
    this.paddle.update(dt);
    this.ball.update(dt);
    this.updatePortals(dt);
    this.updateGravityWell(dt);
    this.updateLasers(dt);
    this.particles.update(dt);
    this.powerup.update(dt);
    this.score.update(dt);
    if (this.ripple && this.ripple.t > 0) {
      this.ripple.t -= dt;
      if (this.ripple.t < 0) this.ripple.t = 0;
      if (this.pulse && this.pulse > 0) {
        this.pulse = Math.max(0, this.pulse - dt * 2.5);
      }
    }
    // micro screen-shake update
    if (this.shake && this.shake.t > 0) {
      this.shake.t -= dt;
      var u = Math.max(0, this.shake.t / Math.max(0.0001, this.shake.dur));
      var m = (this.shake.mag || 6) * u;
      var dx = (Math.random() * 2 - 1) * m;
      var dy = (Math.random() * 2 - 1) * m;
      // clamp so court stays inside its margins, UI remains steady
      var mx = Math.max(0, Math.min(this.court.left, this.width - this.court.right));
      var my = Math.max(0, Math.min(this.court.top, this.height - this.court.bottom));
      if (dx < -mx) dx = -mx;
      else if (dx > mx) dx = mx;
      if (dy < -my) dy = -my;
      else if (dy > my) dy = my;
      this.shake.x = dx;
      this.shake.y = dy;
      if (this.shake.t <= 0) {
        this.shake.x = 0;
        this.shake.y = 0;
        this.shake.mag = 0;
        this.shake.dur = 0;
      }
    }
    // Level completed overlay fade + delay next
    if (this.levelOverlay && this.levelOverlay.show) {
      this.levelOverlay.t += dt;
      this.levelOverlay.alpha = Math.max(0, 1 - (this.levelOverlay.t / 3));
      if (this.levelOverlay.t >= 3) {
        this.levelOverlay.show = false;
        if (this._nextPending) {
          this._nextPending = false;
          this.nextLevel(true);
          this.ball.reset({
            launch: true
          });
        }
      }
    }
    // fade gameover overlay
    if (this.gameoverOverlay && this.gameoverOverlay.show) {
      this.gameoverOverlay.t += dt;
      this.gameoverOverlay.alpha = Math.max(0, 1 - (this.gameoverOverlay.t / 3));
      if (this.gameoverOverlay.alpha <= 0) this.gameoverOverlay.show = false;
    }
  },
  setBeatClock: function (beat) {
    this.beat = beat || null;
  },
  onBeat: function () {
    this.pulse = 1;
  },
  draw: function (ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.bg) this.bg.draw(ctx);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.save();
    // === shaken gameplay layer (court + effects) ===
    ctx.save();
    if (this.shake) ctx.translate((this.shake.x || 0), (this.shake.y || 0));
    this.court.draw(ctx);
    this.drawRipple(ctx);
    this.drawGravityWell(ctx);
    this.drawPortals(ctx);
    this.particles.draw(ctx);
    this.paddle.draw(ctx);
    this.ball.draw(ctx);
    this.drawLasers(ctx);
    this.powerup.draw(ctx);
    ctx.restore();
    // HUD/score remain steady
    this.drawEffectsHUD(ctx);
    this.score.draw(ctx);
    // draw gameover overlay
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
    // draw level-completed overlay (scaled to full canvas width)
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
    ctx.restore();
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
  onmenu: function () {
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
  ongame: function () {
    // ensure synthwave BGM is created and playing (loops via onfinish)
    if (typeof soundManager !== 'undefined') {
      try {
        var _bgm = soundManager.getSoundById ? soundManager.getSoundById('bgm') : null;
        if (!_bgm && soundManager.createSound) {
          soundManager.createSound({
            id: 'bgm',
            url: './sound/breakout/bgm-synthwave.wav',
            volume: 55,
            onfinish: function () {
              try {
                this.play();
                if (this.tryStartBGM) this.tryStartBGM();
              } catch (e) {}
            }
          });
          _bgm = soundManager.getSoundById ? soundManager.getSoundById('bgm') : null;
        }
        if (_bgm) {
          try {
            if (this.sound) {
              _bgm.stop();
              _bgm.play();
            }
          } catch (e) {}
        }
      } catch (e) {}
    }
    if (this.bg) {
      this.bg.palette = this.bg.extractPalette();
      this.bg.pickThemeForLevel();
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
    this.score.reset();
    this.ball.reset({
      launch: true
    });
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
  onlose: function () {
    this.playSound('gameover');
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
    this.powerup.resetPowerups();
    this.playSound('loselife');
    if (this.score.loseLife()) this.lose();
    else this.ball.reset({
      launch: true
    });
  },
  winLevel: function () {
    if (this.requestShake) this.requestShake(6, 0.08);
    if (this.requestRipple) {
      var C = this.court,
        w = C.right - C.left,
        h = C.bottom - C.top;
      this.requestRipple(C.left + w / 2, C.top + h / 2, 0.24, 0.18, {
        mode: 'gold'
      });
    }
    if (this.playSound) this.playSound('thud');
    if (this.requestShake) this.requestShake(6, 0.08);
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
  hitBrick: function (brick) {
    // Delegate to damageBrick (ball source). Handles tough bricks (hp>1) and particles.
    this.damageBrick(brick, {
      from: 'ball'
    });
  },
  // Apply damage to a brick with optional source {from: 'ball'|'laser'}.
  // Returns true if the brick was destroyed.
  damageBrick: function (brick, source) {
    var from = (source && source.from) || 'ball';
    var hp = (typeof brick.hp === 'number') ? brick.hp : 1;
    var __prevHp = hp;
    // Determine damage per rules
    var dmg = 1;
    if (from === 'laser') {
      dmg = 1.5; // lasers do fixed 1.5
    } else if ((this.ball && this.ball.fire) || from === 'fireball') {
      dmg = 2; // fireball does fixed 2
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
    hp -= dmg;
    // micro shake if we *crushed* a multi-hit brick to zero
    if (hp <= 0 && (__prevHp || 1) >= 2) {
      if (this.requestShake) this.requestShake(6, 0.08);
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
    this.court.remove(brick);
    this.score.increase(brick.score);
    if (from === 'ball' || from === 'fireball') {
      if (this.ball && this.ball.bumpSpeed) this.ball.bumpSpeed();
    }
    if (this.court.empty()) this.winLevel();
    return true; // destroyed
  },
  resetLevel: function () {
    this.setLevel();
  },
  setLevel: function (level) {
    level = (typeof level == 'undefined') ? (this.storage.level ? parseInt(this.storage.level) : 0) : level;
    level = level < Breakout.Levels.length ? level : 0;
    this.court.reset(level);
    this.storage.level = this.level = level;
    this.determineLevelName();
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
    $('instructions').className = Game.ua.hasTouch ? 'touch' : 'keyboard';
    $('instructions').showIf(this.is('menu'));
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
    if (adx < 10 && dt < 250) {
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
    if (adx >= 10 && dt < 400) {
      var dir = (dx > 0) ? 1 : -1;
      this.paddle.moving = dir;
      var self = this;
      setTimeout(function () {
        if (self.paddle.moving === dir) self.paddle.moving = 0;
      }, 180);
      ev.preventDefault();
    }
  },
  onmousemove: function (ev) {
    var x = ev.pageX - this.runner.bounds.left - this.paddle.w / 2;
    this.paddle.place(x);
  },
  //=============================================================================
  // Powerups (falling drops + Tripleball + Sticky + Confused)
  //=============================================================================
  Powerups: {
    DURATION_MS: 10000,
    initialize: function (game, cfg, ball, paddle, score) {
      this.game = game;
      this.cfg = cfg;
      this.ball = ball;
      this.paddle = paddle;
      this.score = score;
      this.drops = [];
      this.icons = {
        Big: '↑',
        Small: '↓',
        OneUp: '♥',
        Fire: '🔥',
        Triple: '3',
        BPlus: '+',
        BMinus: '−',
        Swap: '↔'
      };
      this.stickyUntil = 0;
      this.confusedUntil = 0;
      this.lasersUntil = 0;
      this.splitUntil = 0;
      this.chaosUntil = 0;
      this.smallUntil = 0;
      this.slowUntil = 0;
    },
    isStickyActive: function () {
      return Date.now() < this.stickyUntil;
    },
    isConfusedActive: function () {
      return Date.now() < this.confusedUntil;
    },
    isLasersActive: function () {
      return Date.now() < this.lasersUntil;
    },
    isSplitActive: function () {
      return Date.now() < this.splitUntil;
    },
    isChaosActive: function () {
      return Date.now() < this.chaosUntil;
    },
    isSmallActive: function () {
      return Date.now() < this.smallUntil;
    },
    isSlowActive: function () {
      return Date.now() < this.slowUntil;
    },
    resetPowerups: function () {
      this.drops = [];
      Breakout.Defaults.paddle.width = Breakout.Defaults.paddle.defaultWidth;
      this.paddle.reset();
      this.paddle.setpos((this.game.width / 2) - Breakout.Defaults.paddle.width, this.paddle.y);
      this.ball.resetTemporaryMods();
      this.stickyUntil = 0;
      this.confusedUntil = 0;
      this.lasersUntil = 0;
      this.splitUntil = 0;
      this.chaosUntil = 0;
      this.smallUntil = 0;
      this.slowUntil = 0;
      this.ball.setSticky(false);
      var el = $('powerups');
      if (el) el.innerHTML = "";
    },
    rollForPowerup: function (brick) {
      if (Math.round(Game.randomInt(Breakout.Defaults.powerup.droprate.low, Breakout.Defaults.powerup.droprate.high)) ==
        Breakout.Defaults.powerup.droprate.goal) {
        this.spawnDrop(brick);
      }
    },
    spawnDrop: function (brick) {
      var centerX = brick.x + brick.w / 2;
      var centerY = brick.y + brick.h / 2;
      var types = ['BigPaddle', 'SmallPaddle', 'ExtraLife', 'Fireball', 'Tripleball', 'BigBall', 'SmallBall', 'FastBall', 'SlowBall', 'StickyPaddle', 'Confused', 'Lasers', 'SplitPaddle', 'Chaos'];
      var type = types[Math.floor(Math.random() * types.length)];
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
      // auto-expire sticky flag on the ball
      if (!this.isStickyActive()) this.ball.setSticky(false);
      for (var i = this.drops.length - 1; i >= 0; i--) {
        var d = this.drops[i];
        d.y += d.vy;
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
    },
    draw: function (ctx) {
      ctx.save();
      for (var i = 0; i < this.drops.length; i++) {
        var d = this.drops[i];
        // base green
        var fill = '#7efc7e',
          glyph = '',
          tcolor = '#063';
        switch (d.type) {
        case 'BigPaddle':
          glyph = this.icons.Big;
          break;
        case 'SmallPaddle':
          glyph = this.icons.Small;
          break;
        case 'ExtraLife':
          glyph = this.icons.OneUp;
          break;
        case 'Fireball':
          glyph = this.icons.Fire;
          break;
        case 'BigBall':
          glyph = this.icons.BPlus;
          break;
        case 'SmallBall':
          glyph = this.icons.BMinus;
          break;
        case 'FastBall':
          fill = '#e53935';
          tcolor = '#fff';
          break; // red
        case 'SlowBall':
          fill = '#1e88e5';
          tcolor = '#fff';
          break; // blue
        case 'Tripleball':
          glyph = this.icons.Triple;
          break;
        case 'StickyPaddle':
          fill = '#ffffff';
          tcolor = '#000';
          break; // white
        case 'Confused':
          fill = '#7e57c2';
          glyph = this.icons.Swap;
          tcolor = '#fff';
          break; // purple
        case 'Lasers':
          fill = '#ffeb3b';
          glyph = 'L';
          tcolor = '#5c3';
          break; // yellow 'L'
        case 'SplitPaddle':
          fill = '#ffa726';
          glyph = '||';
          tcolor = '#000';
          break; // orange split
        case 'Chaos':
          fill = '#ec407a';
          glyph = '∿';
          tcolor = '#fff';
          break; // magenta wave
        }
        ctx.fillStyle = fill;
        ctx.fillRect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h);
        if (glyph) {
          ctx.fillStyle = tcolor;
          ctx.font = Math.round(this.game.court.chunk * 0.5) + 'px arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(glyph, d.x, d.y);
        }
      }
      ctx.restore();
    },
    apply: function (type) {
      if (this.game && this.game.playSound) this.game.playSound('powerup');
      var msg = '';
      switch (type) {
      case 'BigPaddle': {
        var posX = this.paddle.x - (Breakout.Defaults.paddle.defaultWidth / 2);
        var posY = this.paddle.y;
        Breakout.Defaults.paddle.width = Breakout.Defaults.paddle.defaultWidth * 2;
        this.paddle.reset();
        this.paddle.setpos(posX, posY);
        msg = 'Big Paddle Impresses the Ladies';
      }
      break;
      case 'SmallPaddle': {
        var posX2 = this.paddle.x + (Breakout.Defaults.paddle.defaultWidth / 2);
        var posY2 = this.paddle.y;
        Breakout.Defaults.paddle.width = Breakout.Defaults.paddle.defaultWidth / 2;
        this.paddle.reset();
        this.paddle.setpos(posX2, posY2);
        msg = 'Small Paddle Nothing to be Ashamed Of';
      }
      break;
      case 'ExtraLife':
        this.score.gainLife();
        msg = '1UP';
        break;
      case 'Fireball':
        this.ball.setFire(true);
        msg = 'Fireball Melts Steel Blocks';
        break;
      case 'BigBall':
        this.ball.grow();
        msg = 'Big Strong Ball';
        break;
      case 'SmallBall':
        this.ball.shrink();
        this.smallUntil = Date.now() + 10000;
        msg = 'Small Puny Ball';
        break;
      case 'FastBall':
        this.ball.fast();
        msg = 'Fast Mighty Ball';
        break;
      case 'SlowBall':
        this.ball.slow();
        this.slowUntil = Date.now() + 10000;
        msg = 'Slow Weak Ball';
        break;
      case 'StickyPaddle':
        this.stickyUntil = Date.now() + this.DURATION_MS;
        this.ball.setSticky(true);
        msg = 'Sticky Paddle';
        break;
      case 'Confused':
        this.confusedUntil = Date.now() + this.DURATION_MS;
        msg = 'Dazed Confused!';
        break;
      case 'Tripleball':
        this.ball.triple();
        msg = '×3 Balls, unlike Lance Armstrong';
        break;
      case 'Lasers':
        this.lasersUntil = Date.now() + 3000;
        msg = 'Sharks with Laser Beams';
        break;
      case 'SplitPaddle':
        this.splitUntil = Date.now() + this.DURATION_MS;
        msg = 'Split Paddle';
        break;
      case 'Chaos':
        this.chaosUntil = Date.now() + this.DURATION_MS;
        msg = 'Chaos!';
        break;
      }
      var el = $('powerups');
      if (el) el.innerHTML = msg;
    }
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
      this.scorefont = "bold " + Math.max(9, this.game.court.wall.size - 2) + "pt arial";
      this.highfont = "" + Math.max(9, this.game.court.wall.size - 8) + "pt arial";
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
      ctx.translate(this.scorewidth + 20, (this.height - paddle.h) / 2);
      for (var n = 0; n < this.lives; n++) {
        this.game.paddle.render.call(paddle, ctx);
        ctx.translate(paddle.w + 5, 0);
      }
    }
  },
  //=============================================================================
  // Court
  //=============================================================================
  Court: {
    initialize: function (game, cfg) {
      this.game = game;
      this.cfg = cfg;
    },
    reset: function (level) {
      var layout = Breakout.Levels[level];
      // Determine least-common brick color (by character frequency) for toughness
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
      this.tough3Key = tough3Key; // most rare (3 HP)
      this.tough2Key = tough2Key; // second-most rare (2 HP)
      var line, brick, score, c, n, x, y, nx, ny = Math.min(layout.bricks.length, this.cfg.ychunks);
      this.bricks = [];
      for (y = 0; y < ny; y++) {
        score = (this.cfg.ychunks - y) * 5;
        line = layout.bricks[y] + " ";
        brick = null;
        nx = Math.min(line.length, this.cfg.xchunks + 1);
        for (x = 0; x < nx; x++) {
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
      // compute row band of the original layout
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
      // late-game shuffle timers
      this.shuffleActive = false;
      this.shuffleTimer = 0;
      this.shuffleCooldown = 0;
      this.numhits = 0;
      this.resize();
    },
    resize: function () {
      this.chunk = Math.floor(Math.min(this.game.width, this.game.height) / (Math.max(this.cfg.xchunks, this.cfg.ychunks) + 4));
      this.width = this.cfg.xchunks * this.chunk;
      this.height = this.cfg.ychunks * this.chunk;
      this.left = Math.floor((this.game.width - this.width) / 2);
      this.top = Math.floor((this.game.height - this.height) / 2);
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
    update: function (dt) {
      // animate bricks that are currently sliding
      var anyAnim = false;
      for (var i = 0; i < this.bricks.length; i++) {
        var B = this.bricks[i];
        if (B && !B.hit && B.anim) {
          B.anim.t += dt;
          var u = Math.min(1, B.anim.t / B.anim.dur);
          // easeInOutCubic
          var uu = (u < 0.5) ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
          B.x = B.anim.x0 + (B.anim.x1 - B.anim.x0) * uu;
          B.y = B.anim.y0 + (B.anim.y1 - B.anim.y0) * uu;
          Game.Math.bound(B);
          anyAnim = true;
          if (u >= 1) B.anim = null;
        }
      }
      if (anyAnim) this.rerender = true;
      // start the shuffle cadence near the end of a level
      var remaining = this.numbricks - this.numhits;
      if (remaining <= 5 && remaining > 0) {
        if (!this.shuffleActive) {
          this.shuffleActive = true;
          this.shuffleTimer = 0;
          this.shuffleCooldown = 0.8 + Math.random() * 1.7; // first move in 0.8–2.5s
        } else {
          this.shuffleTimer += dt;
          if (this.shuffleTimer >= this.shuffleCooldown) {
            this.shuffleTimer = 0;
            this.shuffleCooldown = 0.9 + Math.random() * 1.6; // then 0.9–2.5s
            this.randomlyRelocateOne();
          }
        }
      } else {
        this.shuffleActive = false;
        this.shuffleTimer = 0;
      }
    },
    draw: function (ctx) {
      if (this.rerender) {
        this.canvas = Game.renderToCanvas(this.game.width, this.game.height, this.render.bind(this), this.canvas);
        this.rerender = false;
      }
      ctx.drawImage(this.canvas, 0, 0);
    },
    render: function (ctx) {
      var n, brick;
      ctx.translate(0.5, 0.5);
      ctx.strokeStyle = this.game.color.border;
      ctx.lineWidth = 1;
      for (n = 0; n < this.numbricks; n++) {
        brick = this.bricks[n];
        if (!brick.hit) {
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
          // outline: thicker if sturdy (hp>=2 and not yet cracked), normal otherwise
          var lw = 1;
          if (brick.hp && !brick.cracked) {
            if (brick.hp >= 3) lw = 4;
            else if (brick.hp >= 2) lw = 3;
          }
          ctx.lineWidth = lw;
          ctx.strokeRect(brick.x + 0.5 * (lw - 1), brick.y + 0.5 * (lw - 1), brick.w - (lw - 1), brick.h - (lw - 1));
          // cracks overlay on first hit
          if (brick.cracked) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // simple crack pattern
            var cx = brick.x,
              cy = brick.y,
              cw = brick.w,
              ch = brick.h;
            ctx.moveTo(cx + cw * 0.15, cy + ch * 0.2);
            ctx.lineTo(cx + cw * 0.45, cy + ch * 0.5);
            ctx.moveTo(cx + cw * 0.6, cy + ch * 0.15);
            ctx.lineTo(cx + cw * 0.8, cy + ch * 0.45);
            ctx.moveTo(cx + cw * 0.35, cy + ch * 0.6);
            ctx.lineTo(cx + cw * 0.55, cy + ch * 0.85);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      ctx.fillStyle = this.game.color.wall;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.wall.top.left, this.wall.top.top);
      ctx.lineTo(this.wall.top.right, this.wall.top.top);
      ctx.lineTo(this.wall.top.right, this.wall.right.bottom);
      ctx.lineTo(this.wall.right.left, this.wall.right.bottom);
      ctx.lineTo(this.wall.right.left, this.wall.top.bottom);
      ctx.lineTo(this.wall.left.right, this.wall.top.bottom);
      ctx.lineTo(this.wall.left.right, this.wall.left.bottom);
      ctx.lineTo(this.wall.left.left, this.wall.left.bottom);
      ctx.lineTo(this.wall.top.left, this.wall.top.top);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    },
    // Teleport a random remaining brick to a new grid-aligned spot (slides over ~0.3s)
    randomlyRelocateOne: function () {
      // collect candidates (unbroken bricks)
      var alive = [];
      for (var i = 0; i < this.bricks.length; i++)
        if (!this.bricks[i].hit) alive.push(this.bricks[i]);
      if (!alive.length) return false;
      var brick = alive[(Math.random() * alive.length) | 0];
      // how many columns wide is this brick?
      var colsWide = Math.max(1, Math.round(brick.w / this.chunk));
      // choose a row mostly inside the original band, with a small chance to drift
      var minRow = Math.max(0, this.rowsMin);
      var maxRow = Math.min(this.cfg.ychunks - 1, this.rowsMax);
      if (Math.random() < 0.15) { // 15% chance to drift 1 row
        minRow = Math.max(0, minRow - 1);
        maxRow = Math.min(this.cfg.ychunks - 1, maxRow + 1);
      }
      // try up to 30 random spots
      for (var attempts = 0; attempts < 30; attempts++) {
        var row = (minRow + Math.floor(Math.random() * (maxRow - minRow + 1)));
        var maxCol = this.cfg.xchunks - colsWide;
        if (maxCol < 0) break;
        var col = Math.floor(Math.random() * (maxCol + 1));
        var nx = this.left + col * this.chunk;
        var ny = this.top + row * this.chunk;
        // candidate rect
        var cand = {
          left: nx,
          top: ny,
          right: nx + brick.w,
          bottom: ny + brick.h
        };
        // keep away from other surviving bricks
        var ok = true;
        for (var j = 0; j < this.bricks.length; j++) {
          var B = this.bricks[j];
          if (B === brick || B.hit) continue;
          if (cand.left < B.right && cand.right > B.left && cand.top < B.bottom && cand.bottom > B.top) {
            ok = false;
            break;
          }
        }
        // stay within walls
        if (cand.left < this.left || cand.right > this.right || cand.top < this.top || cand.bottom > this.bottom)
          ok = false;
        if (!ok) continue;
        // set a short slide animation to the new position
        brick.anim = {
          x0: brick.x,
          y0: brick.y,
          x1: nx,
          y1: ny,
          t: 0,
          dur: 0.25 + Math.random() * 0.1
        };
        // update grid position so future resizes keep the new location
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
      return (this.numhits == this.numbricks);
    }
  },
  //=============================================================================
  // Paddle
  //=============================================================================
  Paddle: {
    initialize: function (game, cfg) {
      this.game = game;
      this.cfg = cfg;
      this.reset();
    },
    reset: function () {
      this.w = this.cfg.width * this.game.court.chunk;
      this.h = this.cfg.height * this.game.court.chunk;
      this.y = this.game.court.bottom - this.h * 1.5;
      this.setpos(this.game.court.left + (this.game.court.width - this.w) / 2, this.y);
      this.speed = this.cfg.speed * this.game.court.chunk;
      this.moving = 0;
    },
    update: function (dt) {
      var mv = this.moving;
      if (this.game.powerup && this.game.powerup.isConfusedActive && this.game.powerup.isConfusedActive()) mv = -mv;
      if (mv < 0) this.place(this.x - this.speed * dt);
      else if (mv > 0) this.place(this.x + this.speed * dt);
    },
    // Returns one or two paddle segments for collision and drawing
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
      if (half < this.h) half = this.h; // keep sensible width
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
    draw: function (ctx) {
      ctx.save();
      // flashing when LASERS is active
      var base = this.game.color.paddle;
      if (this.game.powerup && this.game.powerup.isLasersActive && this.game.powerup.isLasersActive()) {
        var blink = ((Date.now() % 300) < 150);
        ctx.fillStyle = blink ? '#ffd54f' : base;
      } else {
        ctx.fillStyle = base;
      }
      var segs = this.getSegments ? this.getSegments() : [{
        left: this.left,
        top: this.top,
        right: this.right,
        bottom: this.bottom,
        w: this.w,
        h: this.h
      }];
      if (segs.length === 1) {
        this.render(ctx);
      } else {
        for (var i = 0; i < segs.length; i++) {
          var seg = segs[i];
          var tmp = {
            left: seg.left,
            top: seg.top,
            right: seg.right,
            bottom: seg.bottom,
            w: seg.w,
            h: seg.h
          };
          this.render.call(tmp, ctx);
        }
      }
      ctx.restore();
    },
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
    moveLeft: function () {
      this.moving = Math.min(0, this.moving - 1);
    },
    moveRight: function () {
      this.moving = Math.max(0, this.moving + 1);
    },
    stopMovingLeft: function () {
      if (this.moving < 0) this.moving = 0;
    },
    stopMovingRight: function () {
      if (this.moving > 0) this.moving = 0;
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
    }
  },
  //=============================================================================
  // Ball (multi-ball manager)
  //=============================================================================
  Ball: {
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
    },
    resetTemporaryMods: function () {
      this.temp.size = 1;
      this.temp.speed = 1;
      this.setFire(false);
      for (var i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        b.radius = this.cfg.defaultRadius * this.game.court.chunk;
        b.speed = this.cfg.defaultSpeed * this.game.court.chunk;
      }
    },
    reset: function (options) {
      this.balls = [];
      var radius = this.cfg.radius * this.game.court.chunk;
      var speed = this.cfg.speed * this.game.court.chunk;
      var cx = this.game.paddle.left + (this.game.paddle.w / 2);
      var cy = this.game.paddle.top - radius - 1;
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
      for (var i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        b.radius = this.cfg.radius * this.game.court.chunk * this.temp.size;
        b.speed = this.cfg.speed * this.game.court.chunk * this.temp.speed;
      }
    },
    rebuildTargets: function () {
      this.hitTargets = [this.game.paddle, this.game.court.wall.top, this.game.court.wall.left, this.game.court.wall.right].concat(this.game.court.bricks);
    },
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
        // Sticky expired → auto-release any parked balls
        var pcx = this.game.paddle.left + this.game.paddle.w / 2;
        var pwh = this.game.paddle.w / 2;
        for (var i = 0; i < this.balls.length; i++) {
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
      for (var i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        if (b.dx === 0 && b.dy === 0) return true;
      }
      return false;
    },
    // Release balls held by Sticky without replaying the countdown/labels.
    // Returns true if at least one ball was released.
    releaseSticky: function () {
      if (!this.sticky) return false;
      var released = false;
      var pcx = this.game.paddle.left + this.game.paddle.w / 2;
      var pwh = this.game.paddle.w / 2;
      for (var i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        if (b.dx === 0 && b.dy === 0) {
          var s = b.speed || (this.cfg.speed * this.game.court.chunk);
          var hit = pwh ? ((b.x - pcx) / pwh) : 0; // outward bias based on position
          b.dx = hit * (0.9 * s);
          b.dy = -0.9 * s;
          b.stuck = false;
          released = true;
        }
      }
      if (released) {
        this.clearLaunch(); // don't replay ready/set/go
      }
      return released;
    },
    bumpSpeed: function () {
      for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].speed = Math.min(this.balls[i].speed * 1.02, this.cfg.speed * 1.5 * this.game.court.chunk);
      }
    },
    triple: function () {
      if (this.balls.length === 0) return;
      var seed = this.balls[0];
      var angle = Math.atan2(seed.dy, seed.dx) || -Math.PI / 3;
      var spread = (20 * Math.PI) / 180;
      var speed = seed.speed;

      function make(ang) {
        return {
          x: seed.x,
          y: seed.y,
          dx: Math.cos(ang) * speed,
          dy: Math.sin(ang) * speed,
          radius: Math.max(5, seed.radius * 0.75),
          speed: speed
        };
      }
      this.balls.push(make(angle - spread), make(angle + spread));
      if (seed.dx === 0 && seed.dy === 0) {
        seed.dx = Math.cos(angle) * speed;
        seed.dy = Math.sin(angle) * speed;
      }
      seed.radius = Math.max(5, seed.radius * 0.75);
    },
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
      if (this.countdown > 0) {
        this.label = this.launchLabel(this.countdown);
        this.delayTimer = setTimeout(this.launch.bind(this), 1000);
        if (this.countdown == 1) {
          for (var i = 0; i < this.balls.length; i++) {
            var b = this.balls[i];
            b.dx = 1;
            b.dy = -1;
          }
        }
        this.countdown--;
      } else {
        this.clearLaunch();
        for (var i = 0; i < this.balls.length; i++) {
          var b = this.balls[i];
          var dir = Game.Math.normalize({
            x: b.dx,
            y: b.dy
          });
          b.dx = dir.x * b.speed;
          b.dy = dir.y * b.speed;
        }
        this.game.playSound('go');
      }
    },
    launchNow: function () {
      this.countdown = 1;
      this.launch();
    },
    moveToPaddle: function (b, opts) {
      opts = opts || {};
      var segs = this.game.paddle.getSegments ?
        this.game.paddle.getSegments() : [{
          left: this.game.paddle.left,
          right: this.game.paddle.right,
          top: this.game.paddle.top,
          w: this.game.paddle.w,
          h: this.game.paddle.h
        }];
      // pick the segment: prefer the one that caught it (stuckSeg); otherwise guess by x
      var idx = (typeof b.stuckSeg === 'number' && segs[b.stuckSeg]) ? b.stuckSeg :
        (b.x < this.game.paddle.left + this.game.paddle.w / 2 ? 0 : Math.min(1, segs.length - 1));
      var seg = segs[idx];
      var cx = seg.left + seg.w / 2;
      // Y always sits just above the paddle
      b.y = seg.top - b.radius - 1;
      // Center ONLY when explicitly asked (initial serve) or when not sticky/parked.
      // Otherwise keep the ball's own x and just clamp within the segment so it rides along.
      if (opts.center === true || (!this.sticky && !b.stuck)) {
        b.x = cx;
      } else {
        var minX = seg.left + b.radius;
        var maxX = seg.left + seg.w - b.radius;
        if (b.x < minX) b.x = minX;
        if (b.x > maxX) b.x = maxX;
      }
    },
    // Lay out all parked (sticky) balls across the hit segment(s) to be visible
    layoutParkedBalls: function () {
      if (!this.sticky) return;
      var segs = this.game.paddle.getSegments ?
        this.game.paddle.getSegments() : [{
          left: this.game.paddle.left,
          right: this.game.paddle.right,
          top: this.game.paddle.top,
          w: this.game.paddle.w,
          h: this.game.paddle.h
        }];
      var groups = new Array(segs.length);
      for (var gi = 0; gi < groups.length; gi++) groups[gi] = [];
      for (var i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        if (b.dx === 0 && b.dy === 0) {
          var si = (typeof b.stuckSeg === 'number' && b.stuckSeg < segs.length) ? b.stuckSeg : 0;
          groups[si].push(b);
        }
      }
      for (var s = 0; s < segs.length; s++) {
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
        for (var k = 0; k < n; k++) {
          var bb = row[k];
          bb.x = startX + k * (2 * r + gap);
          bb.y = seg.top - bb.radius - 1;
          Game.Math.bound(bb);
        }
      }
    },
    update: function (dt) {
      if (this.layoutParkedBalls) this.layoutParkedBalls();
      if (this.label) return;
      // auto-clear sticky when Powerups say it expired
      if (this.sticky && this.game.powerup && !this.game.powerup.isStickyActive()) this.setSticky(false);
      for (var i = this.balls.length - 1; i >= 0; i--) {
        var b = this.balls[i];
        // TRAIL: record last positions when Fast or Chaos is active
        var fastActive = (this.temp && this.temp.speed > 1);
        var chaosActive = (this.game.powerup && this.game.powerup.isChaosActive && this.game.powerup.isChaosActive());
        if (fastActive || chaosActive) {
          if (!b.trail) b.trail = [];
          b.trail.push({
            x: b.x,
            y: b.y,
            r: b.radius
          });
          if (b.trail.length > 6) b.trail.shift(); // keep it short & cheap
        } else if (b.trail) {
          b.trail.length = 0; // clear when feature not active
        }
        // follow paddle while parked (Sticky active)
        if (this.sticky && b.dx === 0 && b.dy === 0) {
          var segs = this.game.paddle.getSegments ?
            this.game.paddle.getSegments() : [{
              left: this.game.paddle.left,
              right: this.game.paddle.right,
              top: this.game.paddle.top,
              w: this.game.paddle.w
            }];
          var si = (typeof b.stuckSeg === 'number' && b.stuckSeg < segs.length) ? b.stuckSeg : 0;
          var seg = segs[si];
          //b.x = seg.left + seg.w/2;
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
            this.chaosCooldown = 0.8 + Math.random() * 0.8; // 0.8–1.6s
            for (var ci = 0; ci < this.balls.length; ci++) {
              var cb = this.balls[ci];
              if (cb.dx === 0 && cb.dy === 0) continue; // stuck to paddle
              var ang = Math.atan2(cb.dy, cb.dx);
              var delta = (-Math.PI / 3) + Math.random() * (2 * Math.PI / 3); // ±60°
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
          for (var pi = 0; pi < 2; pi++) {
            var p = ports[pi];
            if (this.game.insidePortal(p, b.x, b.y)) {
              var q = ports[1 - pi];
              var ang = Math.atan2(b.dy, b.dx);
              var delta = (-Math.PI / 6) + Math.random() * (Math.PI / 3); // ±30°
              var spd = Math.sqrt(b.dx * b.dx + b.dy * b.dy) || (this.cfg.speed * this.game.court.chunk);
              var nx = Math.cos(ang + delta),
                ny = Math.sin(ang + delta);
              var norm = Math.sqrt(nx * nx + ny * ny) || 1;
              // exit just outside the rim to avoid immediate re-entry
              var a = q.a || q.r * 1.6,
                bb = q.b || q.r;
              var norm = Math.sqrt(nx * nx + ny * ny) || 1;
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
          // attraction strength decays with distance; cap influence to keep control
          var k = gw.str; // ~pixels/sec added at close range
          var cap = Math.max(60, (b.speed || 0) * 0.5);
          var acc = Math.min(cap, k / (1 + d));
          b.dx += (vx / d) * acc * dt;
          b.dy += (vy / d) * acc * dt;
        }
        // walls
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
        if (b.top < this.game.court.wall.top.bottom) {
          b.y += (this.game.court.wall.top.bottom - b.top);
          b.dy = Math.abs(b.dy);
          Game.Math.bound(b);
        }
        // bottom (lost)
        if (b.top > this.game.court.bottom + b.radius) {
          this.balls.splice(i, 1);
          continue;
        }
        // paddle
        var segs = this.game.paddle.getSegments ? this.game.paddle.getSegments() : [{
          left: this.game.paddle.left,
          top: this.game.paddle.top,
          right: this.game.paddle.right,
          bottom: this.game.paddle.bottom,
          w: this.game.paddle.w,
          h: this.game.paddle.h
        }];
        for (var s = 0; s < segs.length; s++) {
          var seg = segs[s];
          if ((b.dy > 0) &&
            (b.right >= seg.left) && (b.left <= seg.right) &&
            (b.bottom >= seg.top) && (b.top <= seg.bottom)) {
            this.game.playSound('paddle');
            if (this.sticky) {
              // park the ball without re-centering X; remember which segment caught it
              b.dx = 0;
              b.dy = 0;
              b.stuck = true;
              b.stuckSeg = s; // <- s is the segment index in your loop
              b.y = seg.top - b.radius - 1;
            } else {
              b.y = seg.top - b.radius;
              b.dy = -Math.abs(b.dy);
              var hit = (b.x - (seg.left + seg.w / 2)) / (seg.w / 2);
              b.dx += hit * (0.35 * b.speed);
            }
            Game.Math.bound(b);
            break;
          }
        }
        // bricks
        for (var n = 0; n < this.game.court.bricks.length; n++) {
          var brick = this.game.court.bricks[n];
          if (brick.hit) continue;
          if (b.right >= brick.left && b.left <= brick.right && b.bottom >= brick.top && b.top <= brick.bottom) {
            // penetration heuristic for bounce axis
            var penX = Math.min(Math.abs(b.right - brick.left), Math.abs(brick.right - b.left));
            var penY = Math.min(Math.abs(b.bottom - brick.top), Math.abs(brick.bottom - b.top));
            var fromType = this.fire ? 'fireball' : 'ball';
            var destroyed = this.game.damageBrick(brick, {
              from: fromType
            });
            var shouldBounce = true;
            if (this.fire && destroyed) {
              // fireball pierced the brick it destroyed -> keep travelling
              shouldBounce = false;
            }
            if (shouldBounce) {
              if (penX < penY) {
                b.dx = -b.dx;
              } else {
                b.dy = -b.dy;
              }
            }
            break;
          }
        }
      }
      if (this.balls.length === 0)
        this.game.loseBall();
    },
    draw: function (ctx) {
      // Chaos visual state (glow pulse)
      var chaosActive = (this.game.powerup && this.game.powerup.isChaosActive && this.game.powerup.isChaosActive());
      var chaosPulse = chaosActive ? (0.6 + 0.4 * Math.abs(Math.sin(Date.now() / 180))) : 0;
      if (this.label) {
        var l = this.label;
        ctx.save();
        ctx.fillStyle = l.fill;
        ctx.strokeStyle = l.stroke;
        ctx.font = l.font;
        var tw = ctx.measureText(l.text).width;
        var x = this.game.court.left + (this.game.court.width - tw) / 2;
        var y = this.game.court.top + this.game.court.height * 0.7;
        ctx.fillText(l.text, x, y);
        ctx.restore();
        return;
      }
      ctx.save();
      // ball color: default, red if fast, blue if slow
      var col = this.game.color.ball;
      var fireBlink = this.fire && ((Date.now() % 200) < 100); // flashing fireball
      if (this.temp && this.temp.speed) {
        if (this.temp.speed > 1) col = '#f33';
        else if (this.temp.speed < 1) col = '#39f';
      }
      ctx.fillStyle = col;
      for (var i = 0; i < this.balls.length; i++) {
        var b = this.balls[i];
        // TRAIL: additive bloom for Fast/Chaos
        var fastActive = (this.temp && this.temp.speed > 1);
        var chaosActive = (this.game.powerup && this.game.powerup.isChaosActive && this.game.powerup.isChaosActive());
        if ((fastActive || chaosActive) && b.trail && b.trail.length) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          // pick a tint: chaos = purple glow, fast = warm/white glow
          var base = chaosActive ? 'rgba(156,39,176,' : 'rgba(255,255,255,';
          // oldest -> newest, fade in
          for (var t = 0; t < b.trail.length; t++) {
            var p = b.trail[t];
            var u = (t + 1) / (b.trail.length + 1); // 0..1
            var a = 0.08 + 0.14 * u; // subtle ramp
            ctx.fillStyle = base + a.toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.0, p.r * (0.9 + 0.3 * u)), 0, Math.PI * 2, false);
            ctx.fill();
          }
          ctx.restore();
        }
        if (chaosActive) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.min(1, chaosPulse);
          ctx.fillStyle = '#b400ff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 1.6, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        if (this.fire) {
          ctx.fillStyle = fireBlink ? '#ffffff' : '#f75';
        } else {
          ctx.fillStyle = col;
        }
        ctx.fill();
      }
      ctx.restore();
    }
  },
  //-----------------------------------------------------------------------------
  updateLasers: function (dt) {
    // spawn cadence while active
    var active = this.powerup && this.powerup.isLasersActive && this.powerup.isLasersActive();
    if (active) {
      if (this.laserCooldown <= 0) {
        var w = Math.max(2, Math.floor(this.court.chunk * 0.15));
        var h = Math.max(8, Math.floor(this.court.chunk * 0.6));
        var vy = -this.court.chunk * 30; // speed upwards
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
        this.laserCooldown = 0.12; // seconds between shots (~8.3/s)
      } else {
        this.laserCooldown -= dt;
      }
    } else {
      this.laserCooldown = 0;
    }
    // move & collide
    for (var i = this.lasers.length - 1; i >= 0; i--) {
      var L = this.lasers[i];
      L.y += L.vy * dt;
      /* PORTALS */
      var ports = this.getActivePortals && this.getActivePortals();
      if (ports && (!L.pcd || L.pcd <= 0)) {
        for (var pi = 0; pi < 2; pi++) {
          var p = ports[pi];
          var cx = L.x + L.w / 2,
            cy = L.y + L.h / 2;
          if (this.insidePortal(p, cx, cy)) {
            var q = ports[1 - pi];
            // reappear just above the exit portal and continue upward
            L.x = q.x - L.w / 2;
            L.y = q.y - q.r - L.h - 2;
            L.pcd = 0.18; // prevent immediate re-entry
            break;
          }
        }
      } else if (L.pcd) {
        L.pcd -= dt;
      }
      // off-screen
      if (L.y + L.h < this.court.top) {
        this.lasers.splice(i, 1);
        continue;
      }
      // bricks
      var hit = false;
      for (var n = 0; n < this.court.bricks.length && !hit; n++) {
        var brick = this.court.bricks[n];
        if (brick.hit) continue;
        if (L.x < brick.right && L.x + L.w > brick.left && L.y < brick.bottom && L.y + L.h > brick.top) {
          // damage via lasers; remove bolt regardless of destroy or not
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
    for (var i = 0; i < this.lasers.length; i++) {
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
    explode: function (brick, dir) {
      if (!brick || brick.hit) return;
      var areaUnits = (brick.w * brick.h) / (this.game.court.chunk * this.game.court.chunk);
      var count = Math.max(8, Math.min(28, Math.floor(areaUnits * 6)));
      var size = Math.max(1, Math.floor(this.game.court.chunk / 6));
      for (var i = 0; i < count; i++) {
        var ang = Math.random() * Math.PI * 2;
        var spd = (this.game.court.chunk * 4) * (0.3 + Math.random() * 0.7);
        this.items.push({
          x: brick.x + brick.w / 2,
          y: brick.y + brick.h / 2,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd * 0.5 - this.game.court.chunk * 1.8,
          life: 0.45 + Math.random() * 0.35,
          maxlife: 0.45 + Math.random() * 0.35,
          size: size,
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
      for (var i = 0; i < count; i++) {
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
      for (var i = this.items.length - 1; i >= 0; i--) {
        var p = this.items[i];
        var g = (p.g != null) ? p.g : baseG;
        p.vy += g * dt * 0.5;
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
      ctx.save();
      for (var i = 0; i < this.items.length; i++) {
        var p = this.items[i];
        ctx.globalAlpha = Math.max(0, p.life / p.maxlife);
        var prevOp = ctx.globalCompositeOperation;
        if (p.mode === 'burn') ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = p.color || '#888';
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalCompositeOperation = prevOp;
      }
      ctx.restore();
    }
  }
};
Breakout.Backgrounds = {
  init: function () {
    this.layers = [];
    this.theme = null;
    this.palette = this.extractPalette();
    this.pickThemeForLevel();
    this.buildLayers();
    this.t = 0;
    this.pulse = 0;
    this.beat = null;
    this.scanlines = null;
  },
  extractPalette: function () {
    var bricks = (this.game && this.game.court && this.game.court.bricks) ? this.game.court.bricks : [];
    var hist = {};
    for (var i = 0; i < bricks.length; i++) {
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
      bg: colors[colors.length - 1] || defaults[0],
      main: colors[0] || defaults[1],
      acc: colors[1] || defaults[2],
      warm: colors[2] || defaults[3],
      cool: colors[3] || defaults[4]
    };
  },
  pickThemeForLevel: function () {
    var name = "";
    if (this.game && this.game.levels && typeof this.game.level === 'number' && this.game.levels[this.game.level]) {
      name = (this.game.levels[this.game.level].name || "") + "";
    } else if (this.game && this.game.levels && this.game.levels.length) {
      name = (this.game.levels[0].name || "") + "";
    } else {
      // levels not ready yet—default to synthwave; will refresh on ongame()/onlevel()
      this.theme = "synthwave";
      return;
    }
    name = name.toLowerCase();
    if (name.indexOf("portal") >= 0) this.theme = "synthwave";
    else if (name.indexOf("space") >= 0) this.theme = "space";
    else if (name.indexOf("city") >= 0) this.theme = "city";
    else this.theme = "synthwave";
  },
  buildLayers: function () {
    var P = this.palette;
    this.layers.length = 0;
    // 0) sky gradient
    this.layers.push({
      kind: "gradient",
      speedX: 2,
      speedY: 0,
      opacity: 1,
      stops: [{
          at: 0.00,
          color: this.mix(P.bg, "#000014", 0.5)
        },
        {
          at: 0.55,
          color: this.mix(P.cool, P.bg, 0.5)
        },
        {
          at: 1.00,
          color: this.mix(P.main, "#000000", 0.2)
        }
      ]
    });
    if (this.theme === "synthwave") {
      this.layers.push({
        kind: "stars",
        speedX: 6,
        speedY: 0,
        opacity: 0.40,
        stars: this.makeStars(80)
      });
      this.layers.push({
        kind: "sunstripes",
        speedX: 0,
        speedY: 0,
        opacity: 0.45,
        color: this.mix(P.warm, "#FFD700", 0.6)
      });
      this.layers.push({
        kind: "grid",
        speedX: 28,
        speedY: 0,
        opacity: 0.65,
        color: this.mix(P.acc, "#66ffff", 0.4)
      });
    } else if (this.theme === "space") {
      this.layers.push({
        kind: "stars",
        speedX: 10,
        speedY: 0,
        opacity: 0.65,
        stars: this.makeStars(140)
      });
      this.layers.push({
        kind: "stars",
        speedX: 18,
        speedY: 0,
        opacity: 0.45,
        stars: this.makeStars(70, true)
      });
    } else {
      this.layers.push({
        kind: "stars",
        speedX: 5,
        speedY: 0,
        opacity: 0.25,
        stars: this.makeStars(60)
      });
      this.layers.push({
        kind: "silhouette",
        speedX: 14,
        speedY: 0,
        opacity: 0.8,
        color: this.mix(P.bg, "#000000", 0.2)
      });
    }
  },
  makeStars: function (n, big) {
    var w = (this.game && this.game.width) || this.width || (this.game && this.game.canvas && this.game.canvas.width) || 800,
      h = (this.game && this.game.height) || this.height || (this.game && this.game.canvas && this.game.canvas.height) || 600;
    var stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        r: big ? (1.2 + Math.random() * 1.4) : (0.7 + Math.random() * 0.9),
        a: 0.5 + Math.random() * 0.5
      });
    }
    return stars;
  },
  update: function (dt) {
    this.t += dt;
  },
  draw: function (ctx) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    var w = (this.game && this.game.width) || this.width || (this.game && this.game.canvas && this.game.canvas.width) || 800,
      h = (this.game && this.game.height) || this.height || (this.game && this.game.canvas && this.game.canvas.height) || 600;
    for (var i = 0; i < this.layers.length; i++) {
      var L = this.layers[i];
      ctx.save();
      ctx.globalAlpha = L.opacity;
      var ox = (this.t * L.speedX) % w;
      var oy = (this.t * L.speedY) % h;
      if (L.kind === "gradient") {
        var g = ctx.createLinearGradient(0, 0, 0, h);
        for (var s = 0; s < L.stops.length; s++) g.addColorStop(L.stops[s].at, L.stops[s].color);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      } else if (L.kind === "stars") {
        for (var s = 0; s < L.stars.length; s++) {
          var st = L.stars[s];
          var x = ((st.x - ox) % w + w) % w;
          var y = st.y;
          ctx.globalAlpha = L.opacity * st.a * (0.6 + 0.4 * Math.sin(this.t * 3 + s));
          ctx.fillStyle = this.mix("#ffffff", this.palette.acc, 0.2);
          ctx.beginPath();
          ctx.arc(x, y, st.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (L.kind === "sunstripes") {
        var cx = w * 0.5,
          cy = h * 0.35,
          R = Math.min(w, h) * 0.22;
        ctx.fillStyle = L.color;
        var __boost = 1 + 0.35 * (this.pulse || 0);
        var __oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = (L.opacity * 0.45) * __boost;
        for (var k = 0; k < 8; k++) {
          var ry = R * (1 - k * 0.1);
          ctx.globalAlpha = L.opacity * (0.65 - k * 0.06);
          if (ctx.ellipse) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, R, ry, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, (ry / R));
            ctx.beginPath();
            ctx.arc(0, 0, R, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      } else if (L.kind === "grid") {
        var cell = Math.max(14, Math.floor(w / 28));
        var __boost = 1 + 0.25 * (this.pulse || 0);
        ctx.strokeStyle = L.color;
        ctx.globalAlpha = L.opacity * 0.75;
        ctx.lineWidth = 1;
        var y0 = h * 0.66;
        for (var gy = 0; gy < h * 0.5; gy += cell) {
          ctx.beginPath();
          ctx.moveTo(0, y0 + gy);
          ctx.lineTo(w, y0 + gy);
          ctx.stroke();
        }
        ctx.globalAlpha = L.opacity * 0.45;
        for (var gx = -w; gx < w * 2; gx += cell * 1.4) {
          var xx = ((gx - ox) % (cell * 1.4) + cell * 1.4);
          ctx.beginPath();
          ctx.moveTo(xx, y0);
          ctx.lineTo(xx - w * 0.5, h);
          ctx.stroke();
        }
      } else if (L.kind === "silhouette") {
        ctx.fillStyle = L.color;
        var base = h * 0.60;
        var x = -ox;
        while (x < w + 80) {
          var bw = 22 + Math.random() * 36;
          var bh = 40 + Math.random() * 120;
          ctx.fillRect(x, base - bh, bw, bh);
          ctx.fillRect(x + bw * 0.2, base - bh * 0.6, bw * 0.15, bh * 0.6);
          x += bw + 16;
        }
        ctx.fillRect(0, base, w, h - base);
      }
      ctx.restore();
    }
    if (this.scanlines && this.scanlines.ready) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.drawImage(this.scanlines.img, 0, 0, w, h);
      ctx.restore();
    }
    ctx.restore();
  },
  mix: function (a, b, t) {
    function h2r(h) {
      h = h.replace('#', '');
      return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    function r2h(r, g, b) {
      return '#' + [r, g, b].map(function (v) {
        v = Math.max(0, Math.min(255, Math.round(v)));
        var s = v.toString(16);
        return s.length < 2 ? '0' + s : s;
      }).join('');
    }
    try {
      var A = h2r(a),
        B = h2r(b);
      return r2h(A[0] * (1 - t) + B[0] * t, A[1] * (1 - t) + B[1] * t, A[2] * (1 - t) + B[2] * t);
    } catch (e) {
      return a;
    }
  }
};