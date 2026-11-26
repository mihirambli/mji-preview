/* ==========================================================================
   MJI homepage prototype
   1. Scroll reel  - rendered frames on a canvas, scrubbed by GSAP ScrollTrigger (+ Lenis)
   2. Bestsellers  - cards rendered from PRODUCTS, filter chips, size picker, quick add
   3. Bag toast    - free-shipping progress after every add
   4. Mobile menu
   ========================================================================== */
(() => {
  "use strict";

  const SITE = "https://www.mjiperfumes.com";
  const FREE_SHIPPING_AT = 1999;
  const img = (path, w = 640) => `${SITE}/_next/image?url=${encodeURIComponent(path)}&w=${w}&q=75`;
  const inr = (n) => "₹" + n.toLocaleString("en-IN");

  // ------------------------------------------------------------------------
  // Products (prices, sizes and notes as listed on mjiperfumes.com, Nov 2026)
  // ------------------------------------------------------------------------
  const PRODUCTS = [
    { slug: "oudh-assamica", name: "Oudh Assamica", type: "perfume", label: "Eau de parfum", badge: "House signature",
      notes: ["Floral", "Fruity", "Oud"], img: "/products/oudh-assamica/plinth.jpg",
      sizes: [["10 ml", 10, 400], ["50 ml", 50, 2500], ["100 ml", 100, 4000]] },
    { slug: "ethereal-love", name: "Ethereal Love", type: "perfume", label: "Eau de parfum",
      notes: ["Floral", "Spice", "Oud"], img: "/products/ethereal-love/plinth.jpg",
      sizes: [["10 ml", 10, 500], ["50 ml", 50, 3000], ["100 ml", 100, 6000]] },
    { slug: "woody-oudh", name: "Woody Oudh", type: "perfume", label: "Eau de parfum",
      notes: ["Floral", "Musk", "Oud"], img: "/products/woody-oudh/plinth.jpg",
      sizes: [["10 ml", 10, 400], ["50 ml", 50, 2500], ["100 ml", 100, 4000]] },
    { slug: "sweet-sensation", name: "Sweet Sensation", type: "perfume", label: "Eau de parfum",
      notes: ["Spicy", "Musk", "Oud"], img: "/products/sweet-sensation/plinth.jpg",
      sizes: [["10 ml", 10, 400], ["50 ml", 50, 2000], ["100 ml", 100, 4000]] },
    { slug: "mystic-oudh", name: "Mystic Oudh", type: "perfume", label: "Eau de parfum", badge: "Free Glam You 50 ml with 100 ml",
      notes: ["Leafy green", "Smoky", "Oud"], img: "/products/mystic-oudh/plinth.jpg",
      sizes: [["10 ml", 10, 400], ["100 ml", 100, 4000]] },
    { slug: "attar-royal", name: "Attar Royal", type: "attar", label: "Attar · alcohol-free",
      notes: ["Citrus", "Floral", "Oud"], img: "/products/attar-royal/1.png",
      sizes: [["3 ml", 3, 400], ["6 ml", 6, 700], ["12 ml", 12, 1200]] },
    { slug: "attar-agar-oil-super-aaa", name: "Agar Oil Super AAA", type: "oil", label: "Pure oud oil", badge: "Highest grade",
      notes: ["Woody", "Smoky", "Aged oud"], img: "/products/films/attar-agar-oil-super-aaa-poster.jpg",
      sizes: [["3 ml", 3, 6000], ["6 ml", 6, 12000], ["12 ml", 12, 22000]] },
    { slug: "bakhoor-set", name: "Bakhoor Set", type: "bakhoor", label: "Agarwood incense",
      desc: "Agarwood chips and resins to scent a room or a garment", img: "/products/bakhoor-set/plinth.jpg",
      sizes: [["One size", 0, 1500]] },
    { slug: "bakhoor-set-leather-hamperbakhoor-50gms-bottle-50gms-burner-lighter-charcoal", name: "Bakhoor Leather Hamper",
      type: "bakhoor", label: "Gift hamper", badge: "Gift-ready",
      desc: "Bakhoor, bottle, burner, lighter and charcoal in a leather case",
      img: "/products/bakhoor-set-leather-hamperbakhoor-50gms-bottle-50gms-burner-lighter-charcoal/plinth.jpg",
      sizes: [["One size", 0, 4400]] },
    { slug: "attar-sandal", name: "Attar Sandal", type: "attar", label: "Attar · alcohol-free",
      notes: ["Citrus", "Sandalwood", "Oud"], img: "/products/attar-sandal/plinth.jpg",
      sizes: [["3 ml", 3, 300], ["6 ml", 6, 600], ["12 ml", 12, 1000]] },
  ];
  // homepage shows 8 by default ("All"); the chips reveal the rest of each type
  const DEFAULT_COUNT = 8;

  // ------------------------------------------------------------------------
  // Bag + toast
  // ------------------------------------------------------------------------
  const bag = { count: 0, total: 0 };
  const bagBtn = document.querySelector(".header__bag");
  const bagCount = document.querySelector(".header__bag-count");
  const toast = document.querySelector(".toast");
  let toastTimer;

  function addToBag(name, size, price) {
    bag.count += 1;
    bag.total += price;
    bagCount.hidden = false;
    bagCount.textContent = bag.count;
    bagBtn.setAttribute("aria-label", `Bag, ${bag.count} item${bag.count > 1 ? "s" : ""}`);

    toast.querySelector(".toast__title").textContent = `Added: ${name} · ${size}`;
    const left = FREE_SHIPPING_AT - bag.total;
    toast.querySelector(".toast__text").textContent = left > 0
      ? `${inr(left)} away from free shipping (bag: ${inr(bag.total)})`
      : `Free shipping unlocked (bag: ${inr(bag.total)})`;
    toast.querySelector(".toast__bar span").style.transform = `scaleX(${Math.min(1, bag.total / FREE_SHIPPING_AT)})`;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.hidden = true), 4200);
  }

  document.querySelectorAll("[data-add]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const { name, size, price } = JSON.parse(btn.dataset.add);
      addToBag(name, size, price);
    })
  );

  // ------------------------------------------------------------------------
  // Product cards
  // ------------------------------------------------------------------------
  const list = document.getElementById("products");

  function bestValueIndex(sizes) {
    // only flag "best value" when one size is genuinely cheapest per ml
    const perMl = sizes.map(([, ml, price]) => (ml ? price / ml : Infinity));
    const min = Math.min(...perMl);
    const winners = perMl.filter((v) => v === min);
    return winners.length === 1 && isFinite(min) ? perMl.indexOf(min) : -1;
  }

  function renderCard(p, i) {
    const li = document.createElement("li");
    li.className = "product";
    li.dataset.type = p.type;
    li.dataset.rank = i;
    const best = bestValueIndex(p.sizes);
    const url = `${SITE}/products/${p.slug}`;
    li.innerHTML = `
      <a class="product__img" href="${url}">
        <img src="${img(p.img)}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="product__badge">${p.badge}</span>` : ""}
      </a>
      <p class="product__type">${p.label}</p>
      <h3><a href="${url}">${p.name}</a></h3>
      <p class="notes">${p.notes
        ? `<b>${p.notes[0]}</b> → <b>${p.notes[1]}</b> → <b>${p.notes[2]}</b>`
        : p.desc}</p>
      ${p.sizes.length > 1 ? `<div class="sizes" role="radiogroup" aria-label="Size">${p.sizes
        .map(([label], s) => `<button class="size${s === 0 ? " is-on" : ""}" role="radio" aria-checked="${s === 0}" data-s="${s}">${label}${s === best ? " ·&nbsp;best value" : ""}</button>`)
        .join("")}</div>` : ""}
      <div class="product__buy">
        <span class="product__price"></span>
        <button class="btn btn--solid">Add to bag</button>
      </div>`;

    let chosen = 0;
    const priceEl = li.querySelector(".product__price");
    const showPrice = () => {
      const [label, ml, price] = p.sizes[chosen];
      priceEl.innerHTML = `${inr(price)}<small>${ml ? `${label} · ${inr(Math.round(price / ml))}/ml` : label}</small>`;
    };
    showPrice();

    li.querySelectorAll(".size").forEach((b) =>
      b.addEventListener("click", () => {
        chosen = Number(b.dataset.s);
        li.querySelectorAll(".size").forEach((x) => {
          const on = x === b;
          x.classList.toggle("is-on", on);
          x.setAttribute("aria-checked", on);
        });
        showPrice();
      })
    );
    li.querySelector(".product__buy .btn").addEventListener("click", () => {
      const [label, , price] = p.sizes[chosen];
      addToBag(p.name, label, price);
    });
    return li;
  }

  PRODUCTS.forEach((p, i) => list.appendChild(renderCard(p, i)));

  function applyFilter(filter) {
    list.querySelectorAll(".product").forEach((li) => {
      li.hidden = filter === "all" ? Number(li.dataset.rank) >= DEFAULT_COUNT : li.dataset.type !== filter;
    });
  }
  applyFilter("all");

  document.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("is-on", c === chip);
        c.setAttribute("aria-pressed", c === chip);
      });
      applyFilter(chip.dataset.filter);
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    })
  );

  // ------------------------------------------------------------------------
  // Mobile menu
  // ------------------------------------------------------------------------
  const menuBtn = document.querySelector(".header__menu");
  const menu = document.getElementById("menu");
  menuBtn.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    menu.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }));

  // ------------------------------------------------------------------------
  // Scroll reel
  // ------------------------------------------------------------------------
  const FRAME_COUNT = 150;
  const SCROLL_LENGTH = "+=450%";
  const SCRUB = 0.6;
  const MAX_DPR = 2;
  const PARALLEL_DOWNLOADS = 6;
  const FRAME_DIRS = { desktop: "frames/desktop", mobile: "frames/mobile" };
  const STAGES = [
    { id: "intro", from: 1, to: 8, step: -1 },
    { id: "glass", from: 9, to: 20, step: 0 },
    { id: "fill", from: 21, to: 70, step: 1 },
    { id: "seal", from: 71, to: 100, step: 2 },
    { id: "pack", from: 101, to: 141, step: 3 },
    { id: "outro", from: 142, to: 150, step: 4 },
  ];

  const root = document.documentElement;
  const reel = document.getElementById("reel");
  const header = document.querySelector(".header");
  const canvas = document.getElementById("reel-canvas");
  const ctx = canvas.getContext("2d");
  const poster = reel.querySelector(".reel__poster");
  const loader = reel.querySelector(".reel__loader");
  const loaderText = reel.querySelector(".reel__loader-text");
  const stageEls = [...reel.querySelectorAll("[data-stage]")];
  const stepEls = [...reel.querySelectorAll(".reel__step")];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    root.classList.add("is-static");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -header.offsetHeight, duration: 1.4 });
      })
    );
  }

  const frameSrc = (dir, i) => `${dir}/frame_${String(i + 1).padStart(4, "0")}.webp`;
  let images = [];
  let variant = null;
  let loadToken = 0;
  let current = 0;
  let drawn = -1;

  function loadOrder(n) {
    const order = [0, n - 1];
    const seen = new Set(order);
    for (let stride = 32; stride >= 1; stride /= 2) {
      for (let i = 0; i < n; i += stride) if (!seen.has(i)) { seen.add(i); order.push(i); }
    }
    return order;
  }

  function loadFrames(nextVariant) {
    const token = ++loadToken;
    variant = nextVariant;
    images = new Array(FRAME_COUNT);
    drawn = -1;
    const dir = FRAME_DIRS[variant];
    poster.src = frameSrc(dir, 0);
    loader.classList.remove("is-done");
    const queue = loadOrder(FRAME_COUNT);
    let active = 0;
    let finished = 0;
    const pump = () => {
      while (active < PARALLEL_DOWNLOADS && queue.length) {
        const i = queue.shift();
        const im = new Image();
        im.decoding = "async";
        active++;
        const done = (ok) => {
          if (token !== loadToken) return;
          active--;
          finished++;
          if (ok) images[i] = im;
          loader.style.setProperty("--loaded", finished / FRAME_COUNT);
          loaderText.textContent = `Loading ${Math.round((finished / FRAME_COUNT) * 100)}%`;
          if (ok && (drawn < 0 || Math.abs(i - current) < Math.abs(drawn - current))) draw(true);
          if (finished === FRAME_COUNT) loader.classList.add("is-done");
          else pump();
        };
        im.onload = () => done(true);
        im.onerror = () => done(false);
        im.src = frameSrc(dir, i);
      }
    };
    pump();
  }

  function nearestLoaded(i) {
    for (let d = 0; d < FRAME_COUNT; d++) {
      if (images[i - d]) return i - d;
      if (images[i + d]) return i + d;
    }
    return -1;
  }

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
  }

  function draw(force = false) {
    const i = nearestLoaded(current);
    if (i < 0 || (!force && i === drawn)) return;
    const im = images[i];
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * scale;
    const h = im.naturalHeight * scale;
    // on landscape screens nudge the bottle right of centre (where the image has spare width),
    // so the caption column on the left never sits on top of it
    const focusX = portrait.matches ? 0.5 : 0.62;
    const dx = Math.min(0, Math.max(cw - w, cw * focusX - w / 2));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#0b0806";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(im, dx, (ch - h) / 2, w, h);
    drawn = i;
    if (!canvas.classList.contains("is-ready")) {
      canvas.classList.add("is-ready");
      poster.classList.add("is-hidden");
    }
  }

  let activeStage = null;
  function updateStage(frameNumber, progress) {
    reel.style.setProperty("--p", progress.toFixed(4));
    const stage = STAGES.find((s) => frameNumber >= s.from && frameNumber <= s.to) || STAGES[0];
    if (stage === activeStage) return;
    activeStage = stage;
    stageEls.forEach((el) => el.classList.toggle("is-active", el.dataset.stage === stage.id));
    stepEls.forEach((el) => {
      const n = Number(el.dataset.step);
      el.classList.toggle("is-done", n < stage.step);
      el.classList.toggle("is-current", n === stage.step);
    });
  }

  const playhead = { frame: 0 };
  gsap.to(playhead, {
    frame: FRAME_COUNT - 1,
    ease: "none",
    scrollTrigger: {
      trigger: reel,
      start: () => `top ${header.offsetHeight}px`,   // pin just below the sticky header
      end: SCROLL_LENGTH,
      pin: true,
      scrub: SCRUB,
      invalidateOnRefresh: true,
    },
    onUpdate() {
      current = Math.round(playhead.frame);
      draw();
      updateStage(current + 1, playhead.frame / (FRAME_COUNT - 1));
    },
  });

  // keep the floating WhatsApp button out of the way of the hero CTAs on phones
  const reelTrigger = ScrollTrigger.getAll().find((t) => t.trigger === reel);
  ScrollTrigger.create({
    start: 0,
    end: () => reelTrigger.end,
    onUpdate: (self) => document.body.classList.toggle("in-reel", self.progress < 1),
    onRefresh: (self) => document.body.classList.toggle("in-reel", self.progress < 1),
  });

  const portrait = window.matchMedia("(max-aspect-ratio: 4/5)");
  const pickVariant = () => (portrait.matches ? "mobile" : "desktop");
  sizeCanvas();
  loadFrames(pickVariant());
  updateStage(1, 0);

  // Watch the canvas itself, not just the window: it can start at 0 px wide
  // (page opened in a background tab or hidden frame) without any window resize after.
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      sizeCanvas();
      if (pickVariant() !== variant) loadFrames(pickVariant());
      else draw(true);
    }, 120);
  };
  window.addEventListener("resize", onResize);
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(canvas);
})();
