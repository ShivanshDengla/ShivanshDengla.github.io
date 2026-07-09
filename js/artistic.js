/* Artistic portfolio interactions: aurora canvas, reveals, tilt, cursor, counters */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var isMobile = window.matchMedia("(max-width: 820px)").matches;

  function safeInit(fn) {
    try { fn(); } catch (e) { console.warn("artistic.js:", e); }
  }

  /* ----------------------------------------------------------
     Aurora canvas: drifting gradient blobs + particle network
     ---------------------------------------------------------- */
  function initAurora() {
    var canvas = document.getElementById("aurora-canvas");
    if (!canvas || reduceMotion) return;

    var ctx = canvas.getContext("2d");
    var W, H, dpr;
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var isMobile = W < 768;

    var blobs = [
      { hue: 271, sat: 80, x: 0.22, y: 0.28, r: 0.42, sp: 0.00016, ph: 0 },
      { hue: 316, sat: 95, x: 0.78, y: 0.22, r: 0.38, sp: 0.00012, ph: 2.1 },
      { hue: 190, sat: 85, x: 0.55, y: 0.85, r: 0.45, sp: 0.0001, ph: 4.2 },
      { hue: 250, sat: 75, x: 0.12, y: 0.78, r: 0.34, sp: 0.00019, ph: 1.2 }
    ];

    var count = isMobile ? 42 : 90;
    var particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        r: Math.random() * 1.7 + 0.5,
        tw: Math.random() * Math.PI * 2
      });
    }

    if (finePointer) {
      window.addEventListener("pointermove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }, { passive: true });
    }

    var LINK_DIST = isMobile ? 100 : 140;
    var running = true;

    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });

    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // Aurora blobs
      ctx.globalCompositeOperation = "lighter";
      for (var b = 0; b < blobs.length; b++) {
        var bl = blobs[b];
        var bx = (bl.x + Math.sin(t * bl.sp + bl.ph) * 0.1) * W;
        var by = (bl.y + Math.cos(t * bl.sp * 1.3 + bl.ph) * 0.12) * H;
        var br = bl.r * Math.min(W, H);
        var g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, "hsla(" + bl.hue + "," + bl.sat + "%,55%,0.13)");
        g.addColorStop(1, "hsla(" + bl.hue + "," + bl.sat + "%,55%,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // Particles
      for (var p = 0; p < particles.length; p++) {
        var pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;

        // gentle attraction to cursor
        var dxm = mouse.x - pt.x, dym = mouse.y - pt.y;
        var dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 220 && dm > 0.001) {
          pt.x += (dxm / dm) * 0.25;
          pt.y += (dym / dm) * 0.25;
        }

        if (pt.x < -20) pt.x = W + 20; else if (pt.x > W + 20) pt.x = -20;
        if (pt.y < -20) pt.y = H + 20; else if (pt.y > H + 20) pt.y = -20;

        var alpha = 0.35 + Math.sin(t * 0.002 + pt.tw) * 0.25;
        ctx.fillStyle = "rgba(210,200,255," + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connective lines
      for (var a = 0; a < particles.length; a++) {
        for (var c = a + 1; c < particles.length; c++) {
          var dx = particles[a].x - particles[c].x;
          var dy = particles[a].y - particles[c].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            var op = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
            ctx.strokeStyle = "rgba(160,150,255," + op.toFixed(3) + ")";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[c].x, particles[c].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------
     Custom cursor
     ---------------------------------------------------------- */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    var dot = document.querySelector(".cursor-dot");
    var halo = document.querySelector(".cursor-halo");
    if (!dot || !halo) return;

    var hx = -100, hy = -100, tx = -100, ty = -100;

    window.addEventListener("pointermove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = "translate(" + tx + "px," + ty + "px) translate(-50%,-50%)";
    }, { passive: true });

    (function follow() {
      hx += (tx - hx) * 0.14;
      hy += (ty - hy) * 0.14;
      halo.style.transform = "translate(" + hx + "px," + hy + "px) translate(-50%,-50%)";
      requestAnimationFrame(follow);
    })();

    document.querySelectorAll("a, button, .work-card").forEach(function (el) {
      el.addEventListener("mouseenter", function () { halo.classList.add("is-active"); });
      el.addEventListener("mouseleave", function () { halo.classList.remove("is-active"); });
    });
  }

  /* ----------------------------------------------------------
     Nav state + scroll progress
     ---------------------------------------------------------- */
  function initScrollUI() {
    var nav = document.querySelector(".site-nav");
    var bar = document.querySelector(".scroll-progress");
    var ticking = false;

    function update() {
      var y = window.scrollY;
      if (nav) nav.classList.toggle("is-scrolled", y > 40);
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      }
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------- */
  function initReveals() {
    var els = document.querySelectorAll(".reveal, .reveal-scale");
    if (!els.length) return;

    function showAll() {
      els.forEach(function (el) { el.classList.add("is-visible"); });
    }

    if (!("IntersectionObserver" in window) || reduceMotion || isMobile) {
      showAll();
      return;
    }

    function markInView(el) {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < vh - 8 && rect.bottom > 8) {
        el.classList.add("is-visible");
        return true;
      }
      return false;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px 80px 0px" });

    els.forEach(function (el) {
      if (!markInView(el)) io.observe(el);
    });
  }

  /* ----------------------------------------------------------
     3D tilt + glow-follow on work cards
     ---------------------------------------------------------- */
  function initTilt() {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll(".work-card").forEach(function (card) {
      var raf = null;

      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var rx = (0.5 - py) * 7;
          var ry = (px - 0.5) * 7;
          card.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
          raf = null;
        });
      });

      card.addEventListener("pointerleave", function () {
        card.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
        card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
        setTimeout(function () { card.style.transition = ""; }, 600);
      });
    });
  }

  /* ----------------------------------------------------------
     Counters
     ---------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      if (reduceMotion) { el.textContent = target; return; }
      var start = null, dur = 1800;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     Magnetic buttons
     ---------------------------------------------------------- */
  function initMagnetic() {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll(".btn-aurora, .btn-ghost, .nav-cta").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var rect = btn.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width / 2);
        var dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = "translate(" + dx * 0.18 + "px," + dy * 0.28 + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transition = "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
        btn.style.transform = "";
        setTimeout(function () { btn.style.transition = ""; }, 500);
      });
    });
  }

  /* ----------------------------------------------------------
     Hero word stagger delays
     ---------------------------------------------------------- */
  function initHeroWords() {
    document.querySelectorAll(".hero-title .word").forEach(function (w, i) {
      w.style.animationDelay = (0.25 + i * 0.11) + "s";
    });
  }

  /* ----------------------------------------------------------
     Adaptive work-kind contrast (samples card image behind label)
     ---------------------------------------------------------- */
  function initWorkKindContrast() {
    var cards = document.querySelectorAll(".work-card");
    if (!cards.length) return;

    function luminance(r, g, b) {
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    function classifyKind(card) {
      var img = card.querySelector(".work-media img");
      var kind = card.querySelector(".work-kind");
      if (!img || !kind || !img.naturalWidth) return;

      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      var sampleW = 48;
      var sampleH = 24;
      canvas.width = sampleW;
      canvas.height = sampleH;

      var srcW = img.naturalWidth;
      var srcH = img.naturalHeight;
      var cropH = Math.max(24, Math.round(srcH * 0.22));
      var cropY = srcH - cropH;

      try {
        ctx.drawImage(img, 0, cropY, srcW, cropH, 0, 0, sampleW, sampleH);
        var data = ctx.getImageData(0, 0, sampleW, sampleH).data;
        var lum = 0;
        var blue = 0;
        var count = 0;

        for (var i = 0; i < data.length; i += 4) {
          lum += luminance(data[i], data[i + 1], data[i + 2]);
          blue += data[i + 2] / 255;
          count++;
        }

        lum /= count;
        blue /= count;

        kind.classList.remove("on-light", "on-dark", "on-cool");
        if (lum > 0.58) {
          kind.classList.add("on-light");
        } else if (blue > 0.42) {
          kind.classList.add("on-cool");
        } else {
          kind.classList.add("on-dark");
        }
      } catch (e) {
        kind.classList.add("on-dark");
      }
    }

    function schedule(card) {
      var img = card.querySelector(".work-media img");
      if (!img) return;

      function run() {
        if (img.naturalWidth) classifyKind(card);
      }

      if (img.complete) run();
      img.addEventListener("load", run, { once: true });
    }

    cards.forEach(schedule);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            schedule(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "160px" });
      cards.forEach(function (card) { io.observe(card); });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    safeInit(initHeroWords);
    safeInit(initAurora);
    safeInit(initCursor);
    safeInit(initScrollUI);
    safeInit(initReveals);
    safeInit(initTilt);
    safeInit(initCounters);
    safeInit(initMagnetic);
    safeInit(initWorkKindContrast);
  });
})();
