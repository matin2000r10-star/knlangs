(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toFa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isEn = () => document.documentElement.lang === "en";
  const L = (fa, en) => (isEn() ? en : fa);
  const num = (n) => (isEn() ? n.toLocaleString("en") : toFa(n.toLocaleString("en").replace(/,/g, "٬")));
  // +1 scrolls toward the reading end of a horizontal track
  const fwd = () => (isEn() ? 1 : -1);

  // Header shadow on scroll
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const menuBtn = $("#menuBtn");
  const nav = $("#mainNav");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // Search toggle
  const searchBar = $("#searchBar");
  $("#searchBtn").addEventListener("click", () => {
    searchBar.hidden = !searchBar.hidden;
    if (!searchBar.hidden) $("input", searchBar).focus();
  });

  // Active nav link while scrolling
  const links = $$(".main-nav ul a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  // Reveal on scroll + count-up
  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = num(target); return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const v = Math.round(target * (1 - Math.pow(1 - k, 3)));
      el.textContent = num(v);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      $$("[data-count]", en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));

  // Dashboard tabs
  const tabs = $$(".dm-nav [role=tab]");
  const panels = $$(".dm-panel");
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((t) => t.setAttribute("aria-selected", t === tab));
    panels.forEach((p) => {
      const on = p.dataset.panel === tab.dataset.tab;
      p.hidden = !on;
      p.classList.toggle("active", on);
    });
  }));

  // Vocabulary quiz on the phone mockup
  const fb = $("#quizFb");
  $$("#quiz button").forEach((b) => b.addEventListener("click", () => {
    $$("#quiz button").forEach((x) => x.classList.remove("right", "wrong"));
    const ok = b.dataset.ok === "1";
    b.classList.add(ok ? "right" : "wrong");
    fb.textContent = ok ? "Great job! 🎉 +10 XP" : "Almost! Try again 💪";
    if (ok) window.novinConfetti?.(b);
  }));

  // Testimonials slider
  const track = $("#tTrack");
  const step = () => track.firstElementChild.getBoundingClientRect().width + 24;
  // In RTL, scrolling "forward" moves toward negative scrollLeft
  $("#tNext").addEventListener("click", () => track.scrollBy({ left: fwd() * step(), behavior: "smooth" }));
  $("#tPrev").addEventListener("click", () => track.scrollBy({ left: -fwd() * step(), behavior: "smooth" }));

  // Newsletter
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#newsMsg").textContent = L("ممنون! عضویت شما با موفقیت ثبت شد ✨", "Thanks! You're subscribed ✨");
    window.novinConfetti?.(e.target.querySelector("button"));
    e.target.reset();
  });

  /* ===================== Extra delight ===================== */
  const finePointer = matchMedia("(pointer: fine)").matches;

  // Scroll progress bar + back-to-top ring
  const bar = $("#scrollBar"), toTop = $("#toTop"), ttProg = $("#ttProg");
  const onProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const k = max > 0 ? scrollY / max : 0;
    bar.style.transform = `scaleX(${k})`;
    ttProg.style.strokeDashoffset = 132 * (1 - k);
    toTop.classList.toggle("show", scrollY > 600);
  };
  addEventListener("scroll", onProgress, { passive: true });
  onProgress();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Hero greeting bubbles cycle through languages
  const greetings = ["Hello!", "سلام!", "Bonjour!", "¡Hola!", "Ciao!", "Hallo!", "Merhaba!", "こんにちは", "Olá!", "안녕!"];
  const bubbles = $$(".hello-bubble b");
  let gi = 3;
  if (!reduceMotion) setInterval(() => {
    const b = bubbles[gi % bubbles.length];
    b.classList.add("out");
    setTimeout(() => { b.textContent = greetings[gi % greetings.length]; b.classList.remove("out"); gi++; }, 350);
  }, 1600);

  // FX canvas: confetti bursts + cursor sparkles
  const cv = $("#fxCanvas"), ctx = cv.getContext("2d");
  let parts = [], running = false, dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener("resize", resize);
  const colors = ["#8b5cf6", "#f472b6", "#38bdf8", "#34d399", "#fbbf24", "#a78bfa"];
  const loop = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.life--; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= p.drag; p.rot += p.vr;
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 30); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      if (p.star) {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) { const r = i % 2 ? p.s * .35 : p.s; const a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.fill();
      } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
  window.novinConfetti = (el) => {
    if (reduceMotion) return;
    const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 8;
      parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, g: .28, drag: .97, s: 6 + Math.random() * 7,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[i % colors.length], life: 70 + Math.random() * 40, star: Math.random() < .25 });
    }
    kick();
  };
  if (finePointer && !reduceMotion) {
    let last = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - last < 40) return; last = now;
      parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.2, vy: Math.random() * .6 + .2, g: .02, drag: .98,
        s: 3 + Math.random() * 4, rot: 0, vr: .1, c: colors[Math.floor(Math.random() * colors.length)], life: 32, star: true });
      kick();
    }, { passive: true });
  }
  $$("[data-confetti]").forEach((b) => b.addEventListener("click", () => window.novinConfetti(b)));

  // Ripple on buttons
  $$(".btn").forEach((b) => b.addEventListener("pointerdown", (e) => {
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const s = document.createElement("span");
    s.className = "ripple";
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }));

  if (finePointer && !reduceMotion) {
    // Magnetic primary buttons
    $$(".btn-primary.btn-lg").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
      });
      b.addEventListener("pointerleave", () => (b.style.translate = ""));
    });

    // 3D tilt + glare on course cards
    $$(".course-card").forEach((c) => {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.classList.add("tilting");
        c.style.transform = `translateY(-8px) rotateX(${(.5 - y) * 10}deg) rotateY(${(x - .5) * 12}deg)`;
        c.style.setProperty("--gx", x * 100 + "%");
        c.style.setProperty("--gy", y * 100 + "%");
      });
      c.addEventListener("pointerleave", () => { c.classList.remove("tilting"); c.style.transform = ""; });
    });

    // Hero image parallax
    const heroImg = $(".hero-art img");
    $(".hero").addEventListener("pointermove", (e) => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      heroImg.style.translate = `${x * -18}px ${y * -12}px`;
    });
  }

  // Tools mascot: tap to jump & talk
  const mascot = $("#mascotTools"), say = $("#mascotSay");
  const lines = ["Let's learn! ✨", "You can do it! 💪", "New word: Brave 🦁", "Practice makes perfect!", "Hello, friend! 👋"];
  let li = 0, sayT;
  mascot.addEventListener("click", () => {
    mascot.classList.remove("jump"); void mascot.getBoundingClientRect(); mascot.classList.add("jump");
    say.textContent = lines[li++ % lines.length];
    say.classList.add("show");
    clearTimeout(sayT); sayT = setTimeout(() => say.classList.remove("show"), 2200);
    window.novinConfetti(mascot);
  });

  /* ===================== Round 2 ===================== */
  const toast = $("#toast");
  let toastT;
  const showToast = (msg) => {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("show"), 2600);
  };

  // Intro splash
  const intro = $("#intro");
  const hideIntro = () => { intro.classList.add("hide"); setTimeout(() => intro.remove(), 600); };
  if (reduceMotion) intro.remove();
  else setTimeout(hideIntro, 1100);

  // Word of the day flip card
  const words = [["Brave", "/breɪv/", "شجاع"], ["Journey", "/ˈdʒɜːni/", "سفر"], ["Curious", "/ˈkjʊəriəs/", "کنجکاو"],
    ["Achieve", "/əˈtʃiːv/", "به دست آوردن"], ["Confident", "/ˈkɒnfɪdənt/", "با اعتمادبه‌نفس"], ["Dream", "/driːm/", "رویا"],
    ["Fluent", "/ˈfluːənt/", "روان (در صحبت)"], ["Grow", "/ɡrəʊ/", "رشد کردن"]];
  let wi = 0;
  const wotd = $("#wotd");
  wotd.addEventListener("click", () => {
    if (wotd.classList.contains("flipped")) {
      wi = (wi + 1) % words.length;
      setTimeout(() => {
        $("#wotdWord").textContent = words[wi][0]; $("#wotdIpa").textContent = words[wi][1]; $("#wotdFa").textContent = words[wi][2];
      }, 300);
    }
    wotd.classList.toggle("flipped");
  });

  // Heading squiggles
  $$(".section-head h2").forEach((h2) => {
    h2.insertAdjacentHTML("afterend", '<svg class="squiggle" viewBox="0 0 130 14" aria-hidden="true"><path d="M3 9c12-8 20-8 30 0s20 8 30 0 20-8 30 0 20 8 34-2"/></svg>');
  });

  // Floating letters parallax
  const floaters = $$(".float-bg span");
  const courses = $("#courses");
  if (!reduceMotion) addEventListener("scroll", () => {
    const top = courses.getBoundingClientRect().top;
    floaters.forEach((f) => (f.style.transform = `translateY(${top * f.dataset.speed}px) rotate(${top * f.dataset.speed * .1}deg)`));
  }, { passive: true });

  // Dashboard ring counter + live notifications
  const dashMock = $(".dash-mock"), ringNum = $("#ringNum");
  const dashIO = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    dashIO.disconnect();
    if (reduceMotion) return;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 1600);
      ringNum.textContent = num(Math.round(75 * (1 - Math.pow(1 - k, 3)))) + L("٪", "%");
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.3 });
  dashIO.observe(dashMock);
  const live = $("#dmLive"), liveText = $("#dmLiveText");
  const liveMsgs = [
    ["🔔", "استاد یک تکلیف جدید فرستاد", "Your teacher sent new homework"],
    ["🏆", "نمره آزمون شما ثبت شد: ۸۸", "Your exam score is in: 88"],
    ["⏰", "کلاس بعدی تا ۳۰ دقیقه دیگر", "Next class starts in 30 minutes"],
    ["💬", "پیام جدید از پشتیبانی", "New message from support"],
    ["🔥", "۷ روز پشت سر هم تمرین کردی!", "7-day practice streak!"]];
  let lm = 0;
  if (!reduceMotion) setInterval(() => {
    live.classList.remove("show");
    setTimeout(() => {
      const [ic, fa, en] = liveMsgs[lm++ % liveMsgs.length];
      live.querySelector(".dm-live-ic").textContent = ic; liveText.textContent = L(fa, en);
      live.classList.add("show");
    }, 450);
  }, 3800);

  // Testimonials autoplay (pauses on hover)
  let tPaused = false;
  track.addEventListener("pointerenter", () => (tPaused = true));
  track.addEventListener("pointerleave", () => (tPaused = false));
  if (!reduceMotion) setInterval(() => {
    if (tPaused) return;
    const atEnd = Math.abs(track.scrollLeft) + track.clientWidth >= track.scrollWidth - 8;
    if (atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
    else track.scrollBy({ left: fwd() * step(), behavior: "smooth" });
  }, 4500);

  // Custom cursor ring + click letter burst
  if (finePointer && !reduceMotion) {
    const ringEl = $("#cursorRing");
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY; ringEl.classList.add("on");
      ringEl.classList.toggle("big", !!e.target.closest("a, button, .course-card, .wotd, #mascotTools"));
    }, { passive: true });
    document.addEventListener("pointerleave", () => ringEl.classList.remove("on"));
    addEventListener("pointerdown", () => ringEl.classList.add("down"));
    addEventListener("pointerup", () => ringEl.classList.remove("down"));
    const follow = () => {
      rx += (mx - rx) * .2; ry += (my - ry) * .2;
      ringEl.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    };
    follow();
  }
  const letters = ["A", "B", "C", "a", "z", "!", "?", "ب", "س", "★", "♥"];
  if (!reduceMotion) addEventListener("click", (e) => {
    if (e.target.closest("a, button, input, .dm-window, .phone, .ticket, .marquee, .cc-thumb")) return;
    for (let i = 0; i < 6; i++) {
      const s = document.createElement("span");
      s.className = "pop-letter";
      s.textContent = letters[Math.floor(Math.random() * letters.length)];
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 50;
      s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;color:${colors[i % colors.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 30}px;--r:${(Math.random() - .5) * 90}deg`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  });

  // Secret words: type "hello" or "novin" anywhere
  let typed = "";
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea") || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed === "hello" || typed === "novin") {
      for (let i = 0; i < 6; i++) setTimeout(() => window.novinConfetti({ getBoundingClientRect: () => ({ left: Math.random() * innerWidth, top: innerHeight * .3, width: 0, height: 0 }) }), i * 180);
      showToast(typed === "hello"
        ? L("👋 Hello to you too! رمز مخفی رو پیدا کردی 🎉", "👋 Hello to you too! You found a secret 🎉")
        : L("💜 NOVIN loves you! رمز مخفی رو پیدا کردی 🎉", "💜 NOVIN loves you! You found a secret 🎉"));
      typed = "";
    }
  });

  // Mobile: shake-free fun — double tap the logo for confetti
  $$(".logo").forEach((l) => l.addEventListener("dblclick", (e) => { e.preventDefault(); window.novinConfetti(l); }));

  /* ===================== Round 3: theme, language, night ===================== */
  const root = document.documentElement;
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const canVT = !!document.startViewTransition && !reduceMotion;

  // ---- Language: swap every Persian text node through the dictionary ----
  const dict = window.NOVIN_I18N || {};
  const textNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement.closest("script, style, [data-noi18n]") || !dict[n.nodeValue.trim()]
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n; (n = walker.nextNode());) textNodes.push({ n, fa: n.nodeValue });
  const attrNodes = [];
  $$("[placeholder], [aria-label]").forEach((el) => ["placeholder", "aria-label"].forEach((a) => {
    const v = el.getAttribute(a);
    if (v && dict[v] && !el.hasAttribute("data-noi18n")) attrNodes.push({ el, a, fa: v });
  }));
  const faTitle = document.title;
  const langBtn = $("#langBtn"), themeBtn = $("#themeBtn");

  const applyLang = (lang) => {
    const en = lang === "en";
    root.lang = lang; root.dir = en ? "ltr" : "rtl";
    textNodes.forEach(({ n, fa }) => { n.nodeValue = en ? fa.replace(fa.trim(), dict[fa.trim()]) : fa; });
    attrNodes.forEach(({ el, a, fa }) => el.setAttribute(a, en ? dict[fa] : fa));
    document.title = en ? "NOVIN Language Academy" : faTitle;
    track.scrollLeft = 0;
    $$("[data-count]").forEach((el) => (el.textContent = num(+el.dataset.count)));
    ringNum.textContent = num(75) + L("٪", "%");
    langBtn.setAttribute("aria-label", en ? "تغییر زبان به فارسی" : "Switch to English");
    updateThemeLabel();
    dispatchEvent(new Event("novin:lang"));
  };

  // Headings briefly scramble into the new language
  const scramble = () => {
    if (reduceMotion) return;
    const glyphs = isEn() ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" : "ابپتثجچحخدذرزسشصطظعغفقکگلمنوهی";
    textNodes.filter(({ n }) => n.parentElement.closest("h1, h2, h3")).forEach(({ n }) => {
      const final = n.nodeValue;
      let frame = 0;
      const total = 16;
      const tick = () => {
        frame++;
        const keep = Math.floor((frame / total) * final.length);
        n.nodeValue = final.slice(0, keep) + [...final.slice(keep)].map((c) => (c.trim() ? glyphs[Math.floor(Math.random() * glyphs.length)] : c)).join("");
        if (frame < total) setTimeout(tick, 35); else n.nodeValue = final;
      };
      tick();
    });
  };

  const switchLang = () => {
    const next = isEn() ? "fa" : "en";
    store("novin-lang", next);
    langBtn.classList.add("squash");
    setTimeout(() => langBtn.classList.remove("squash"), 260);
    const done = () => {
      scramble();
      showToast(next === "en" ? "🇬🇧 Switched to English" : "🇮🇷 زبان سایت فارسی شد");
      window.novinConfetti(langBtn);
    };
    if (!canVT) { applyLang(next); done(); return; }
    const vt = document.startViewTransition(() => applyLang(next));
    vt.ready.then(() => {
      // Page-turn wipe in the reading direction of the new language
      const from = next === "en" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
      root.animate({ clipPath: [from, "inset(0 0 0 0)"] }, { duration: 750, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" });
      root.animate({ opacity: [1, .35], transform: ["scale(1)", "scale(.97)"] }, { duration: 750, easing: "ease-in", pseudoElement: "::view-transition-old(root)" });
    });
    vt.finished.then(done);
  };
  langBtn.addEventListener("click", switchLang);

  // ---- Theme: circular reveal from the toggle ----
  function updateThemeLabel() {
    const dark = root.dataset.theme === "dark";
    themeBtn.setAttribute("aria-label", dark ? L("تم روشن", "Light theme") : L("تم تاریک", "Dark theme"));
  }
  const switchTheme = () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    store("novin-theme", next);
    const apply = () => { root.dataset.theme = next; updateThemeLabel(); };
    if (!canVT) { apply(); return; }
    const r = themeBtn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
        { duration: 800, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" });
    });
    if (next === "dark") setTimeout(() => showToast(L("🌙 شب بخیر! حالت تاریک فعال شد", "🌙 Good night! Dark mode on")), 500);
    else setTimeout(() => showToast(L("☀️ صبح بخیر! حالت روشن فعال شد", "☀️ Good morning! Light mode on")), 500);
  };
  themeBtn.addEventListener("click", switchTheme);
  // Follow the OS theme while the visitor hasn't picked one
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("novin-theme"); } catch (err) {}
    if (!saved) { root.dataset.theme = e.matches ? "dark" : "light"; updateThemeLabel(); }
  });

  if (isEn()) applyLang("en"); else updateThemeLabel();

  // ---- Night sky: stars + fireflies (visible in dark mode) ----
  const sky = $("#nightSky");
  const rnd = (a, b) => a + Math.random() * (b - a);
  let skyHTML = "";
  for (let i = 0; i < 46; i++) {
    skyHTML += `<i class="star" style="top:${rnd(2, 70)}%;left:${rnd(1, 99)}%;--s:${rnd(1.5, 3.2)}px;--d:${rnd(2, 5)}s;--dl:${rnd(0, 4)}s"></i>`;
  }
  for (let i = 0; i < 14; i++) {
    skyHTML += `<i class="firefly" style="top:${rnd(20, 90)}%;left:${rnd(2, 96)}%;--d:${rnd(5, 10)}s;--dl:${rnd(-6, 0)}s;--x1:${rnd(-60, 60)}px;--y1:${rnd(-50, 30)}px;--x2:${rnd(-80, 80)}px;--y2:${rnd(-70, 20)}px"></i>`;
  }
  sky.insertAdjacentHTML("beforeend", skyHTML);

  // ---- Cursor glow (dark mode, desktop) ----
  if (finePointer && !reduceMotion) {
    const glow = $("#cursorGlow");
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; glow.classList.add("on"); }, { passive: true });
    const glowLoop = () => {
      gx += (tx - gx) * .08; gy += (ty - gy) * .08;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(glowLoop);
    };
    glowLoop();
  }


  /* ===================== Round 4: pronunciation (text-to-speech) ===================== */
  const synth = window.speechSynthesis;
  if (!synth || !window.SpeechSynthesisUtterance) root.classList.add("no-tts");
  let voices = [];
  const loadVoices = () => { voices = synth ? synth.getVoices() : []; };
  loadVoices();
  if (synth) synth.addEventListener?.("voiceschanged", loadVoices);
  const pickVoice = (lang) => {
    const want = lang.toLowerCase(), base = want.split("-")[0];
    const same = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(base));
    const exact = same.filter((v) => v.lang.replace("_", "-").toLowerCase() === want);
    const nice = (list) => list.find((v) => /google|natural|samantha|daniel|serena|aria|jenny/i.test(v.name));
    return nice(exact) || exact[0] || nice(same) || same[0] || null;
  };

  // Floating ♪ notes from whatever is speaking
  const notes = (el) => {
    if (reduceMotion || !el) return;
    const r = el.getBoundingClientRect();
    ["♪", "♫", "♬"].forEach((n, i) => setTimeout(() => {
      const s = document.createElement("span");
      s.className = "note-pop"; s.textContent = n;
      s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px;color:${colors[(i * 2) % colors.length]};--dx:${(Math.random() - .5) * 70}px;--r:${(Math.random() - .5) * 60}deg`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }, i * 160));
  };

  let speakingEl = null;
  let clip = null; // the <audio> clip playing, if any
  const stopClip = () => { if (clip) { clip.pause(); clip.onended = null; clip = null; } };
  const speak = (text, { lang = "en-US", rate = .9, pitch = 1.05, el = null, onend = null, onblocked = null } = {}) => {
    if (!synth) { onblocked?.(); return; }
    loadVoices();
    stopClip();
    synth.cancel();
    speakingEl?.classList.remove("speaking", "saying");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate; u.pitch = pitch;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    speakingEl = el;
    const cls = el?.classList.contains("sayable") ? "saying" : "speaking";
    el?.classList.add(cls);
    let ended = false;
    const stop = () => { if (ended) return; ended = true; el?.classList.remove(cls); if (speakingEl === el) speakingEl = null; onend?.(); };
    u.onend = stop;
    u.onerror = (e) => { if (e.error === "not-allowed") onblocked?.(); stop(); };
    setTimeout(stop, Math.max(8000, text.length * 110)); // safety net if a browser never fires onend
    synth.speak(u);
    notes(el);
  };

  // Tap once = normal speed, tap again within 3s = slow (🐢)
  const slowState = new WeakMap();
  const speakBtn = (btn, getText) => btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const last = slowState.get(btn) || 0;
    const slow = Date.now() - last < 3000 && !btn.classList.contains("slow");
    btn.classList.toggle("slow", slow);
    slowState.set(btn, Date.now());
    speak(getText(), { rate: slow ? .55 : .9, el: btn });
  });
  speakBtn($("#wotdSpeak"), () => $("#wotdWord").textContent);
  speakBtn($("#sentSpeak"), () => "I always pack my … blank … the night before a trip.");

  // Word-of-the-day card: keyboard support (it holds its own speak button)
  wotd.addEventListener("keydown", (e) => {
    if (e.target === wotd && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); wotd.click(); }
  });

  // Quiz options: hear each word; the right answer reads the whole sentence
  $$("#quiz button").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.ok === "1") setTimeout(() => speak("I always pack my suitcase the night before a trip.", { el: $("#sentSpeak") }), 250);
    else speak(b.textContent, { el: b });
  }));

  // Recorded Persian audio (most phones and PCs have no Persian voice built in)
  const playClip = (src, { el = null, onend = null, onblocked = null } = {}) => {
    stopClip(); synth?.cancel();
    speakingEl?.classList.remove("speaking", "saying");
    const a = new Audio(src);
    clip = a;
    const cls = el?.classList.contains("sayable") ? "saying" : "speaking";
    el?.classList.add(cls); speakingEl = el;
    const stop = () => { el?.classList.remove(cls); if (clip === a) clip = null; onend?.(); };
    a.onended = stop;
    a.play().then(() => notes(el), (err) => { el?.classList.remove(cls); if (clip === a) clip = null; if (err?.name === "NotAllowedError") onblocked?.(); else onend?.(); });
  };

  // Marquee greetings speak in their own language. When the device has no voice for a
  // language, an English voice reads a romanised spelling instead of staying silent.
  const romanised = { "こんにちは": "Konnichiwa", "안녕하세요": "Annyeong haseyo", "¡Hola!": "Ola", "Olá": "Ola", "Merhaba": "Merhaba", "Ciao": "Chow", "Hallo": "Hallo", "Bonjour": "Bonjour" };
  $$(".marquee .sayable").forEach((s) => s.addEventListener("click", () => {
    const lang = s.dataset.say, text = s.textContent;
    if (lang === "fa-IR") return playClip("assets/audio/fa-salam.mp3", { el: s });
    loadVoices();
    if (!pickVoice(lang) && romanised[text]) speak(romanised[text], { lang: "en-US", rate: .85, el: s });
    else speak(text, { lang, rate: .85, el: s });
  }));

  // The tools mascot talks out loud (in a cute high voice)
  mascot.addEventListener("click", () => setTimeout(() => speak(mascotText(), { pitch: 1.6, rate: 1, el: null }), 50));
  function mascotText() { return $("#mascotSay").textContent.replace(/[^\p{L}\p{N}\s',.!?]/gu, "").trim(); }

  /* ===================== Round 5: sound effects ===================== */
  // Every sound is synthesised with Web Audio, so there are no audio files to load.
  let actx = null, master = null, noiseBuf = null;
  let soundOn = true;
  try { soundOn = localStorage.getItem("novin-sound") !== "off"; } catch (e) {}
  const audio = () => {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      master = actx.createGain(); master.gain.value = .55; master.connect(actx.destination);
      noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  };
  const tone = (freq, dur, { type = "sine", vol = .12, delay = 0, slide = 0 } = {}) => {
    const c = audio(); if (!c) return;
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + .05);
  };
  const hiss = (dur, { freq = 2000, to = 0, q = 1, vol = .08, delay = 0 } = {}) => {
    const c = audio(); if (!c) return;
    const t = c.currentTime + delay, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = noiseBuf; f.type = "bandpass"; f.Q.value = q; f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f).connect(g).connect(master); src.start(t, Math.random() * .5); src.stop(t + dur + .05);
  };
  const sfx = {
    pop: () => tone(520, .09, { type: "triangle", slide: 380, vol: .1 }),
    tick: () => tone(1900, .035, { vol: .025 }),
    chime: () => { tone(880, .18, { vol: .1 }); tone(1320, .32, { delay: .1, vol: .1 }); },
    wrong: () => { tone(240, .16, { type: "square", vol: .04, slide: -60 }); tone(180, .22, { type: "square", vol: .04, delay: .12, slide: -40 }); },
    sparkle: () => [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, .2, { type: "triangle", vol: .06, delay: i * .05 })),
    fanfare: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i === 4 ? .6 : .22, { type: "triangle", vol: .09, delay: i * .1 })),
    whoosh: () => hiss(.55, { freq: 400, to: 4000, q: .7, vol: .14 }),
    flip: () => { hiss(.18, { freq: 3000, q: 1.5, vol: .1 }); hiss(.16, { freq: 2200, q: 1.5, vol: .08, delay: .12 }); },
    boing: () => tone(160, .4, { slide: 520, vol: .12 }),
    bubbles: () => [0, 1, 2].forEach((i) => tone(700 + Math.random() * 600, .07, { type: "sine", slide: 500, vol: .06, delay: i * .06 })),
    scratch: () => hiss(.07, { freq: 3500 + Math.random() * 1500, q: .8, vol: .05 }),
  };
  const play = (name) => { if (soundOn && !reduceMotion) sfx[name]?.(); };

  const soundBtn = $("#soundBtn");
  const updateSoundBtn = () => {
    soundBtn.setAttribute("aria-pressed", soundOn);
    soundBtn.setAttribute("aria-label", soundOn ? L("قطع صدای افکت‌ها", "Mute sound effects") : L("پخش صدای افکت‌ها", "Turn on sound effects"));
  };
  updateSoundBtn();
  addEventListener("novin:lang", updateSoundBtn);
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    store("novin-sound", soundOn ? "on" : "off");
    updateSoundBtn();
    soundBtn.classList.remove("bump"); void soundBtn.offsetWidth; soundBtn.classList.add("bump");
    if (soundOn) play("chime");
    showToast(soundOn ? L("🔊 صدای افکت‌ها روشن شد", "🔊 Sound effects on") : L("🔇 صدای افکت‌ها خاموش شد", "🔇 Sound effects off"));
  });

  // Hook sounds into the existing effects
  const confettiFx = window.novinConfetti;
  window.novinConfetti = (el) => { play("sparkle"); confettiFx(el); };
  themeBtn.addEventListener("click", () => play("whoosh"));
  langBtn.addEventListener("click", () => play("flip"));
  wotd.addEventListener("click", () => play("flip"));
  mascot.addEventListener("click", () => play("boing"));
  $$("#quiz button").forEach((b) => b.addEventListener("click", () => play(b.dataset.ok === "1" ? "chime" : "wrong")));
  tabs.forEach((t) => t.addEventListener("click", () => play("tick")));
  const quiet = "#themeBtn, #langBtn, #soundBtn, #quiz button, .speak-btn, .dm-nav button, #scratchSkip, #copyCode, [data-confetti], .sayable";
  document.addEventListener("click", (e) => {
    const hit = e.target.closest("a, button, .wotd, #mascotTools, .sayable");
    if (hit) { if (!hit.matches(quiet) && !hit.closest(".wotd") && hit.id !== "mascotTools") play("pop"); return; }
    if (!e.target.closest("input, .dm-window, .phone, .ticket, .cc-thumb")) play("bubbles");
  });
  let lastTick = 0;
  $$(".course-card, .why-grid li, .stat-list li, .tool-list li").forEach((c) => c.addEventListener("pointerenter", () => {
    if (performance.now() - lastTick > 120) { lastTick = performance.now(); play("tick"); }
  }));

  /* ===================== Round 5: scratch card ===================== */
  const prizes = [
    { e: "🎉", code: "NOVIN20", fa: ["۲۰٪ تخفیف ترم اول", "برای ثبت‌نام در هر یک از دوره‌ها"], en: ["20% off your first term", "Valid for any course"] },
    { e: "🎓", code: "TRYNOVIN", fa: ["یک جلسه کلاس آزمایشی رایگان", "اول امتحان کن، بعد تصمیم بگیر"], en: ["A free trial class", "Try a class before you decide"] },
    { e: "🧭", code: "NOVIN10", fa: ["تعیین سطح رایگان + ۱۰٪ تخفیف", "به همراه مشاوره‌ی رایگان انتخاب دوره"], en: ["Free placement test + 10% off", "Plus a free course consultation"] },
  ];
  let prizeIdx = Math.floor(Math.random() * prizes.length), revealed = false;
  try {
    const saved = localStorage.getItem("novin-prize");
    if (saved !== null && prizes[+saved]) prizeIdx = +saved; else localStorage.setItem("novin-prize", prizeIdx);
    revealed = localStorage.getItem("novin-prize-revealed") === "1";
  } catch (e) {}
  const prize = prizes[prizeIdx];
  const ticket = $("#ticket"), canvas = $("#scratch"), sctx = canvas.getContext("2d"), skip = $("#scratchSkip");
  const renderPrize = () => {
    const [title, desc] = isEn() ? prize.en : prize.fa;
    $("#prizeEmoji").textContent = prize.e; $("#prizeTitle").textContent = title; $("#prizeDesc").textContent = desc;
    $("#prizeCode").textContent = prize.code; $("#copyCode").textContent = L("کپی کد", "Copy code");
  };
  renderPrize();

  const paintCover = () => {
    if (revealed) return;
    const r = canvas.getBoundingClientRect(), dpr2 = Math.min(devicePixelRatio || 1, 2);
    if (!r.width) return;
    canvas.width = r.width * dpr2; canvas.height = r.height * dpr2;
    sctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
    sctx.globalCompositeOperation = "source-over";
    const g = sctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, "#c4b5fd"); g.addColorStop(.45, "#a5b4fc"); g.addColorStop(.7, "#f0abfc"); g.addColorStop(1, "#c4b5fd");
    sctx.fillStyle = g; sctx.fillRect(0, 0, r.width, r.height);
    // shimmer stripes + little stars
    sctx.globalAlpha = .18; sctx.fillStyle = "#fff";
    for (let x = -r.height; x < r.width; x += 26) { sctx.beginPath(); sctx.moveTo(x, r.height); sctx.lineTo(x + r.height, 0); sctx.lineTo(x + r.height + 10, 0); sctx.lineTo(x + 10, r.height); sctx.fill(); }
    sctx.globalAlpha = .9;
    for (let i = 0; i < 26; i++) { const x = Math.random() * r.width, y = Math.random() * r.height, s = 2 + Math.random() * 3; sctx.fillRect(x - s / 2, y - .6, s, 1.2); sctx.fillRect(x - .6, y - s / 2, 1.2, s); }
    sctx.globalAlpha = 1;
    sctx.fillStyle = "#3b2a8f"; sctx.textAlign = "center"; sctx.textBaseline = "middle";
    sctx.font = `800 ${Math.max(18, r.width / 17)}px Vazirmatn, Poppins, sans-serif`;
    sctx.fillText(L("✨ اینجا رو بخراش ✨", "✨ Scratch here ✨"), r.width / 2, r.height / 2 - 10);
    sctx.font = `600 ${Math.max(12, r.width / 32)}px Vazirmatn, Poppins, sans-serif`;
    sctx.fillStyle = "rgba(59, 42, 143, .75)";
    sctx.fillText(L("یه جایزه زیرش منتظرته 🎁", "A prize is waiting underneath 🎁"), r.width / 2, r.height / 2 + 24);
  };
  const reveal = (celebrate) => {
    if (revealed && celebrate) return;
    revealed = true; canvas.classList.add("done"); skip.hidden = true;
    try { localStorage.setItem("novin-prize-revealed", "1"); } catch (e) {}
    if (!celebrate) return;
    ticket.classList.add("won");
    play("fanfare"); confettiFx(ticket);
    setTimeout(() => confettiFx(ticket), 250);
    showToast(L(`🎁 تبریک! ${prize.fa[0]}`, `🎁 Congrats! ${prize.en[0]}`));
  };
  if (revealed) { canvas.classList.add("done"); skip.hidden = true; }
  else {
    document.fonts?.ready.then(paintCover);
    paintCover();
    addEventListener("resize", () => { if (!revealed) paintCover(); });
    addEventListener("novin:lang", () => { if (!revealed) paintCover(); });
  }
  let scratching = false, last = null, moves = 0;
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const clearedRatio = () => {
    const { width: w, height: h } = canvas, data = sctx.getImageData(0, 0, w, h).data;
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) { total++; if (data[i] < 40) clear++; }
    return clear / total;
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (revealed) return;
    scratching = true; last = pos(e); canvas.setPointerCapture(e.pointerId);
    audio();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!scratching || revealed) return;
    const p2 = pos(e);
    sctx.globalCompositeOperation = "destination-out";
    sctx.lineWidth = Math.max(34, canvas.getBoundingClientRect().width / 9); sctx.lineCap = "round"; sctx.lineJoin = "round";
    sctx.beginPath(); sctx.moveTo(last.x, last.y); sctx.lineTo(p2.x, p2.y); sctx.stroke();
    last = p2;
    if (++moves % 3 === 0) play("scratch");
    if (moves % 8 === 0 && clearedRatio() > .5) reveal(true);
  });
  const endScratch = () => { scratching = false; };
  canvas.addEventListener("pointerup", endScratch);
  canvas.addEventListener("pointercancel", endScratch);
  skip.addEventListener("click", () => reveal(true));
  addEventListener("novin:lang", renderPrize);
  $("#copyCode").addEventListener("click", () => {
    const code = prize.code, ok = () => { play("chime"); showToast(L("✅ کد کپی شد: ", "✅ Code copied: ") + code); };
    const fallback = () => {
      const range = document.createRange(); range.selectNodeContents($("#prizeCode"));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      showToast(L("کد رو انتخاب کردم؛ کپی‌اش کن 👆", "Code selected — copy it 👆"));
    };
    try { navigator.clipboard.writeText(code).then(ok, fallback); } catch (e) { fallback(); }
  });

  /* ===================== Round 5: eyes follow the cursor ===================== */
  const pupils = $$(".scene .blink");
  const mascotEl = $("#mascotTools");
  let lookX = innerWidth / 2, lookY = innerHeight / 2, lookQueued = false, lastMove = 0;
  const aim = (rect, max) => {
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dx = lookX - cx, dy = lookY - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260) * max;
    return [(dx / d) * k, (dy / d) * k * .8];
  };
  const updateEyes = () => {
    lookQueued = false;
    pupils.forEach((g) => {
      const r = g.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const [x, y] = aim(r, 3.2);
      g.style.translate = `${x}px ${y}px`;
    });
    const mr = mascotEl.getBoundingClientRect();
    if (mr.bottom > 0 && mr.top < innerHeight) {
      const [x, y] = aim(mr, 5.5);
      mascotEl.style.setProperty("--ex", x + "px"); mascotEl.style.setProperty("--ey", y + "px");
    }
  };
  const lookAt = (x, y) => { lookX = x; lookY = y; if (!lookQueued) { lookQueued = true; requestAnimationFrame(updateEyes); } };
  if (!reduceMotion) {
    pupils.forEach((g) => (g.style.transition = "translate .15s ease-out"));
    addEventListener("pointermove", (e) => { lastMove = performance.now(); lookAt(e.clientX, e.clientY); }, { passive: true });
    addEventListener("scroll", () => lookAt(lookX, lookY), { passive: true });
    // With no pointer around (phones), the characters glance about on their own
    setInterval(() => {
      if (performance.now() - lastMove < 4000) return;
      lookAt(Math.random() * innerWidth, Math.random() * innerHeight);
    }, 2200);
  }

  /* ===================== Round 6: talking course cards ===================== */
  const courseLines = {
    kids: {
      fa: "در دوره‌ی کودکان، بچه‌ها با بازی، قصه و آهنگ، انگلیسی را با لذت و بدون استرس یاد می‌گیرند.",
      en: "In our kids' course, children learn English through games, stories and songs, joyfully and stress-free.",
    },
    teens: {
      fa: "دوره‌ی نوجوانان با کلاس‌های پرانرژی و پروژه‌های جذاب، مهارت مکالمه و اعتمادبه‌نفس نوجوان‌ها را بالا می‌برد.",
      en: "Our teens' course builds speaking skills and confidence through energetic classes and fun projects.",
    },
    adults: {
      fa: "دوره‌ی بزرگسالان برای کار، سفر و مهاجرت طراحی شده و با برنامه‌ی منعطف، کنار زندگی شلوغ شما جا می‌شود.",
      en: "Our adult course is built for work, travel and moving abroad, with a flexible schedule that fits your busy life.",
    },
    pro: {
      fa: "دوره‌های تخصصی، شما را با تمرین هدفمند و آزمون‌های شبیه‌سازی‌شده، برای آیلتس، تافل و انگلیسی تجاری آماده می‌کنند.",
      en: "Our specialized courses prepare you for IELTS, TOEFL and Business English with targeted practice and mock exams.",
    },
  };
  let talkingCard = null, typeTimer = null, hideTimer = null;
  const typeOut = (box, text) => {
    clearInterval(typeTimer);
    box.textContent = "";
    const out = document.createElement("span"), caret = document.createElement("i");
    caret.className = "caret";
    box.append(out, caret);
    if (reduceMotion) { out.textContent = text; caret.remove(); return; }
    let i = 0;
    typeTimer = setInterval(() => {
      out.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(typeTimer); caret.remove(); }
    }, 28);
  };
  const stopTalking = (card, { keepCaption = false } = {}) => {
    if (!card) return;
    card.classList.remove("talking");
    const box = $(".cc-say", card);
    clearTimeout(hideTimer);
    if (keepCaption) hideTimer = setTimeout(() => box.classList.remove("show"), 1600);
    else { box.classList.remove("show"); clearInterval(typeTimer); }
    if (talkingCard === card) {
      talkingCard = null;
      stopClip(); synth?.cancel();
    }
  };
  const talk = (card, { userAsked = false } = {}) => {
    if (talkingCard && talkingCard !== card) stopTalking(talkingCard);
    const key = card.dataset.course, text = courseLines[key][isEn() ? "en" : "fa"], box = $(".cc-say", card);
    clearTimeout(hideTimer);
    talkingCard = card;
    box.classList.add("show");
    typeOut(box, text);
    // Hover speech follows the sound toggle; a tap on the picture always speaks
    if (!soundOn && !userAsked) return;
    card.classList.add("talking");
    const done = () => { if (talkingCard === card) { card.classList.remove("talking"); talkingCard = null; hideTimer = setTimeout(() => box.classList.remove("show"), 1600); } };
    const blocked = () => {
      card.classList.remove("talking");
      if (!$(".hint", box)) box.insertAdjacentHTML("beforeend", `<span class="hint">${L("🔊 برای شنیدن صدا، یک بار روی تصویر کلیک کنید", "🔊 Click the picture once to hear it")}</span>`);
    };
    if (isEn()) speak(text, { lang: "en-US", rate: .95, onend: done, onblocked: blocked });
    else playClip(`assets/audio/fa-${key}.mp3`, { onend: done, onblocked: blocked });
  };
  $$(".course-card[data-course]").forEach((card) => {
    let dwell = null;
    card.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      dwell = setTimeout(() => talk(card), 350); // a short pause so passing over a card stays silent
    });
    card.addEventListener("pointerleave", (e) => {
      clearTimeout(dwell);
      if (e.pointerType === "mouse") stopTalking(card);
    });
    $(".cc-thumb", card).addEventListener("click", () => {
      if (talkingCard === card && card.classList.contains("talking")) stopTalking(card);
      else talk(card, { userAsked: true });
    });
  });
  addEventListener("novin:lang", () => talkingCard && stopTalking(talkingCard));

  /* ===================== Round 6: moon sits in the window ===================== */
  // The window's middle pane is at about 80% across and 19% down the hero picture.
  const heroEl = $(".hero"), heroArt = $(".hero-art"), moonEl = $(".night-sky .moon");
  const placeMoon = () => {
    const hr = heroEl.getBoundingClientRect(), ar = heroArt.getBoundingClientRect();
    if (!ar.width) return;
    const scale = Math.max(ar.width / 1280, ar.height / 853);
    const w = 1280 * scale, h = 853 * scale;
    const x = ar.left - hr.left + (ar.width - w) * .5 + w * .805;
    const y = ar.top - hr.top + (ar.height - h) * .45 + h * .19;
    moonEl.style.left = x + "px"; moonEl.style.top = y + "px";
    const size = Math.max(30, Math.min(54, w * .055));
    moonEl.style.width = moonEl.style.height = size + "px";
    moonEl.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
  };
  placeMoon();
  addEventListener("resize", placeMoon);
  addEventListener("novin:lang", () => requestAnimationFrame(placeMoon));
  heroArt.querySelector("img").addEventListener("load", placeMoon);
})();
