(function () {
  "use strict";
  var root = document.documentElement;

  /* ---- theme ---------------------------------------------------------- */
  var saved = null;
  try { saved = localStorage.getItem("f2m-theme"); } catch (e) {}
  if (saved === "dark" || (saved === null && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    root.setAttribute("data-theme", "dark");
  }
  function syncThemeIcon() {
    var b = document.querySelector(".theme-btn");
    if (b) b.innerHTML = root.getAttribute("data-theme") === "dark" ? "☾" : "☀";
  }
  syncThemeIcon();
  function repaint() {
    // Some browsers (Chrome) don't fully re-resolve root custom properties when
    // data-theme changes, leaving a stale/mixed background until reload. Force a
    // synchronous re-render of the body subtree, preserving scroll position.
    var b = document.body;
    if (!b) return;
    var y = window.scrollY || window.pageYOffset || 0;
    b.style.display = "none";
    void b.offsetHeight;
    b.style.display = "";
    if (y) window.scrollTo(0, y);
  }
  var themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark";
    if (dark) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", "dark");
    try { localStorage.setItem("f2m-theme", dark ? "light" : "dark"); } catch (e) {}
    syncThemeIcon();
    repaint();
  });

  /* ---- mobile drawer -------------------------------------------------- */
  var menuBtn = document.querySelector(".menu-btn");
  var scrim = document.querySelector(".scrim");
  if (menuBtn) menuBtn.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
  if (scrim) scrim.addEventListener("click", function () { document.body.classList.remove("nav-open"); });

  /* ---- collapsible chapters ------------------------------------------ */
  document.querySelectorAll(".nav-chapter-h").forEach(function (h) {
    h.addEventListener("click", function () { h.parentElement.classList.toggle("is-open"); });
  });

  /* ---- keep active lesson in view ------------------------------------ */
  var active = document.querySelector(".nav-lessons a.active");
  if (active) {
    var sb = document.querySelector(".sidebar");
    if (sb) {
      var r = active.getBoundingClientRect(), sr = sb.getBoundingClientRect();
      if (r.top < sr.top || r.bottom > sr.bottom) active.scrollIntoView({ block: "center" });
    }
  }

  /* ---- on-this-page scroll spy --------------------------------------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if (tocLinks.length) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var sections = tocLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
    var current = null;
    function spy() {
      var top = 0, best = null, line = window.innerHeight * 0.28;
      sections.forEach(function (s) {
        var t = s.getBoundingClientRect().top;
        if (t - line <= 0) best = s;
      });
      if (!best && sections.length) best = sections[0];
      if (best && best !== current) {
        current = best;
        tocLinks.forEach(function (a) { a.classList.remove("active"); });
        var a = map[best.id]; if (a) a.classList.add("active");
      }
    }
    spy();
    window.addEventListener("scroll", function () { window.requestAnimationFrame(spy); }, { passive: true });
  }

  /* ---- close drawer on lesson nav (mobile) --------------------------- */
  document.querySelectorAll(".nav-lessons a").forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
  });
})();

/* ---- quick-copy on python code blocks --------------------------------- */
(function () {
  function copyText(text, btn) {
    var done = function () {
      btn.textContent = "Copied";
      btn.classList.add("copied");
      setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else { fallback(text); done(); }
  }
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  document.querySelectorAll("pre.code.python, pre.code.py").forEach(function (pre) {
    var codeEl = pre.querySelector("code") || pre;
    var wrap = document.createElement("div");
    wrap.className = "copywrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code");
    btn.addEventListener("click", function () {
      // drop the leading "# (n)" label line — it's book bookkeeping, not code
      var text = codeEl.textContent.replace(/^#\s*\(\d+\)\s*\n/, "").replace(/\s+$/, "") + "\n";
      copyText(text, btn);
    });
    wrap.appendChild(btn);
  });
})();
