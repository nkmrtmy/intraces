// ------------------------------------------------------------------
// 开场动画：白色发光线条书架 + 木箱，鼠标悬浮变发光手，
// 点击后碎裂坍塌成木板/DVD盒，再化作蓝色发光蝴蝶飞散消失，
// 之后淡入正式的碟片拨选界面。
// ------------------------------------------------------------------

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("shelfSvg");
  if (!svg) return;

  function rect(x, y, w, h, rx = 1.5) {
    const el = document.createElementNS(SVG_NS, "rect");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("width", Math.max(w, 1));
    el.setAttribute("height", Math.max(h, 1));
    el.setAttribute("rx", rx);
    el.setAttribute("class", "wire");
    return el;
  }

  function line(x1, y1, x2, y2) {
    const el = document.createElementNS(SVG_NS, "line");
    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    el.setAttribute("class", "wire");
    return el;
  }

  const shelfGroup = document.createElementNS(SVG_NS, "g");
  shelfGroup.setAttribute("id", "shelfGroup");
  svg.appendChild(shelfGroup);

  // ---------- 中间柜子（书架） ----------
  const cabX = 300, cabY = 40, cabW = 300, cabH = 440;
  shelfGroup.appendChild(rect(cabX, cabY, cabW, cabH, 3));

  const rows = 4;
  const rowH = cabH / rows;
  for (let i = 1; i < rows; i++) {
    shelfGroup.appendChild(line(cabX, cabY + rowH * i, cabX + cabW, cabY + rowH * i));
  }

  function fillCompartment(x, y, w, h) {
    let cx = x + 6;
    const bottom = y + h - 6;
    while (cx < x + w - 6) {
      const cw = 8 + Math.random() * 9;
      if (cx + cw > x + w - 6) break;
      const ch = h - 14 - Math.random() * 12;
      shelfGroup.appendChild(rect(cx, bottom - ch, cw, ch, 1));
      cx += cw + 2;
    }
  }
  for (let i = 0; i < rows; i++) {
    fillCompartment(cabX, cabY + rowH * i, cabW, rowH);
  }

  // 顶部平放的几本
  for (let i = 0; i < 4; i++) {
    shelfGroup.appendChild(rect(cabX + 16 + i * 68, cabY - 14, 56, 11, 1));
  }

  // ---------- 两侧木箱 ----------
  function crate(cx, cy, w, h) {
    const g = document.createElementNS(SVG_NS, "g");
    g.appendChild(rect(cx, cy, w, h, 2));
    const n = 6;
    const slotW = (w - 20) / n;
    for (let i = 0; i < n; i++) {
      const bx = cx + 10 + i * slotW;
      const bw = slotW - 4;
      const bh = h * (0.55 + Math.random() * 0.2);
      const rot = -10 + Math.random() * 20;
      const r = rect(bx, cy + h - bh - 8, bw, bh, 1);
      r.setAttribute("transform", `rotate(${rot} ${bx + bw / 2} ${cy + h - 8})`);
      g.appendChild(r);
    }
    return g;
  }

  const crateY = cabY + cabH - 150;
  shelfGroup.appendChild(crate(90, crateY, 170, 155));
  shelfGroup.appendChild(crate(cabX + cabW + 40, crateY, 170, 155));

  // ---------- 自定义发光手型光标 ----------
  const cursor = document.getElementById("customCursor");
  let hovering = false;

  svg.addEventListener("mouseenter", () => {
    hovering = true;
    cursor.style.display = "block";
  });
  svg.addEventListener("mouseleave", () => {
    hovering = false;
    cursor.style.display = "none";
  });
  document.addEventListener("mousemove", (e) => {
    if (!hovering) return;
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  // ---------- 点击：碎裂 + 化蝶 ----------
  function shatter() {
    svg.removeEventListener("click", shatter);
    svg.style.cursor = "default";
    cursor.style.display = "none";
    hovering = false;

    const bbox = svg.getBoundingClientRect();
    const layer = document.getElementById("shatterLayer");

    // 木板 / DVD盒碎片，往下坍塌
    const fragCount = 55;
    for (let i = 0; i < fragCount; i++) {
      const f = document.createElement("div");
      f.className = "fragment";
      const w = 12 + Math.random() * 28;
      const h = 5 + Math.random() * 12;
      f.style.width = w + "px";
      f.style.height = h + "px";
      f.style.left = bbox.left + Math.random() * bbox.width + "px";
      f.style.top = bbox.top + Math.random() * bbox.height + "px";
      f.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");
      f.style.setProperty("--fall", 180 + Math.random() * 260 + "px");
      f.style.setProperty("--drift", Math.random() * 160 - 80 + "px");
      f.style.animationDelay = Math.random() * 0.2 + "s";
      layer.appendChild(f);
    }

    // 蓝色发光蝴蝶，从书架区域向四周飞散
    const butterflyCount = 200;
    for (let i = 0; i < butterflyCount; i++) {
      const b = document.createElement("div");
      b.className = "butterfly";
      const startX = bbox.left + bbox.width * 0.5 + (Math.random() - 0.5) * bbox.width * 0.85;
      const startY = bbox.top + bbox.height * 0.5 + (Math.random() - 0.5) * bbox.height * 0.85;
      b.style.left = startX + "px";
      b.style.top = startY + "px";

      const angle = Math.random() * Math.PI * 2;
      const dist = 260 + Math.random() * 520;
      b.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      b.style.setProperty("--dy", Math.sin(angle) * dist - 160 + "px");
      b.style.animationDelay = 0.15 + Math.random() * 0.65 + "s";
      b.style.animationDuration = 1.3 + Math.random() * 0.9 + "s";
      layer.appendChild(b);
    }

    document.getElementById("introOverlay").classList.add("shatter-fade");
    document.getElementById("introHintText").style.opacity = "0";

    setTimeout(() => {
      document.getElementById("introOverlay").classList.add("hide");
      document.body.classList.remove("pre-reveal");
    }, 1900);

    setTimeout(() => {
      layer.innerHTML = "";
    }, 2600);
  }

  svg.addEventListener("click", shatter);
})();
