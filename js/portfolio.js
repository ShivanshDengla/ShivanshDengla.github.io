/* Portfolio interactions: nav, rotate, tabs, filters, sticky stack, fall text, reveals */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initHeader();
    initMobileNav();
    initWordRotate();
    initProjectStack();
    initReveals();
    initHeroParallax();
  });

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    var lockY = 0;

    function unlockBody() {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
    }

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);

      if (open) {
        lockY = window.scrollY || window.pageYOffset;
        document.body.style.position = "fixed";
        document.body.style.top = "-" + lockY + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
      } else {
        unlockBody();
        window.scrollTo(0, lockY);
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = anchor.getAttribute("href") || "";
        var isHash = href.charAt(0) === "#";

        if (isHash) {
          e.preventDefault();
          var target = document.querySelector(href);
          setOpen(false);
          if (target) {
            requestAnimationFrame(function () {
              target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
            });
          }
          return;
        }

        setOpen(false);
      });
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 900px)").matches && menu.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  }

  function initWordRotate() {
    var rotate = document.querySelector(".hero-rotate");
    var words = document.querySelectorAll(".hero-rotate-word");
    if (!rotate || !words.length) return;

    var index = 0;
    var probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;white-space:nowrap;font:inherit;letter-spacing:inherit;";
    rotate.appendChild(probe);

    /* Keep slot at longest phrase width so trail text never jumps on change */
    function fitWidth() {
      var max = 0;
      for (var i = 0; i < words.length; i++) {
        probe.textContent = words[i].textContent;
        max = Math.max(max, probe.getBoundingClientRect().width);
      }
      rotate.style.width = Math.ceil(max) + "px";
    }

    function show(i) {
      words.forEach(function (w, n) {
        w.classList.toggle("is-active", n === i);
      });
    }

    function start() {
      fitWidth();
      show(index);
      if (reduceMotion) return;

      setInterval(function () {
        index = (index + 1) % words.length;
        show(index);
      }, 2600);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start).catch(start);
    } else {
      start();
    }

    window.addEventListener(
      "resize",
      function () {
        fitWidth();
      },
      { passive: true }
    );
  }

  function initProjectStack() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".project-stack-card"));
    var panel = document.getElementById("projects-active");
    var typeEl = document.getElementById("pa-type");
    var titleEl = document.getElementById("pa-title");
    var descEl = document.getElementById("pa-desc");
    var tagsEl = document.getElementById("pa-tags");
    var linksEl = document.getElementById("pa-links");
    if (!cards.length || !panel) return;

    var desktopQuery = window.matchMedia("(min-width: 900px)");
    var currentTitle = "";
    var ticking = false;

    function stickyOffset() {
      var header = document.querySelector(".site-header");
      return (header ? header.offsetHeight : 68) + 28;
    }

    function applyCard(card) {
      if (!card || !desktopQuery.matches) return;
      var title = card.getAttribute("data-title") || "";
      if (title === currentTitle) return;
      currentTitle = title;

      panel.classList.add("is-updating");

      window.setTimeout(function () {
        typeEl.textContent = card.getAttribute("data-type") || "";
        titleEl.textContent = title;
        descEl.textContent = card.getAttribute("data-desc") || "";

        tagsEl.innerHTML = "";
        (card.getAttribute("data-tags") || "")
          .split("|")
          .filter(Boolean)
          .forEach(function (tag) {
            var span = document.createElement("span");
            span.textContent = tag;
            tagsEl.appendChild(span);
          });

        linksEl.innerHTML = "";
        (card.getAttribute("data-links") || "")
          .split("||")
          .filter(Boolean)
          .forEach(function (pair) {
            var parts = pair.split("::");
            if (parts.length < 2) return;
            var a = document.createElement("a");
            a.textContent = parts[0];
            a.href = parts.slice(1).join("::");
            a.target = "_blank";
            a.rel = "noopener";
            linksEl.appendChild(a);
          });

        panel.classList.remove("is-updating");
      }, reduceMotion ? 0 : 140);

      cards.forEach(function (c) {
        c.classList.toggle("is-active", c === card);
      });
    }

    function update() {
      ticking = false;
      if (!desktopQuery.matches) {
        cards.forEach(function (card) {
          card.classList.remove("is-recessed");
        });
        return;
      }

      var offset = stickyOffset();
      var active = cards[0];

      cards.forEach(function (card) {
        var top = card.getBoundingClientRect().top;
        if (top <= offset + 12) active = card;
      });

      cards.forEach(function (card, i) {
        var covered = false;
        for (var j = i + 1; j < cards.length; j++) {
          var nextTop = cards[j].getBoundingClientRect().top;
          var cardTop = card.getBoundingClientRect().top;
          if (nextTop <= cardTop + 10) {
            covered = true;
            break;
          }
          if (nextTop > offset + 80) break;
        }
        card.classList.toggle("is-recessed", covered);
      });

      applyCard(active);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", update);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(update);
    }
    applyCard(cards[0]);
    update();
  }

  function initReveals() {
    var items = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initHeroParallax() {
    if (reduceMotion) return;
    var card = document.querySelector(".hero-card");
    var copy = document.querySelector(".hero-copy");
    if (!card && !copy) return;

    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY;
      if (y > window.innerHeight) return;
      if (card) card.style.transform = "translateY(" + y * 0.12 + "px)";
      if (copy) copy.style.transform = "translateY(" + y * 0.05 + "px)";
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }
})();
