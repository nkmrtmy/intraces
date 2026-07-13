// ------------------------------------------------------------------
// 开场动画：白色发光线条书架 + 木箱，鼠标悬浮变发光手，
// 点击后书架自身的每一根线/每一块板直接向下坍塌，
// 同时飞出弧形翅膀的蓝色发光蝴蝶，之后淡入正式的碟片拨选界面。
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

  // 整个场景外层的组，最后统一往左旋转15度，露出侧面高度感
  const sceneGroup = document.createElementNS(SVG_NS, "g");
  sceneGroup.setAttribute("id", "sceneGroup");
  svg.appendChild(sceneGroup);

  const shelfGroup = document.createElementNS(SVG_NS, "g");
  shelfGroup.setAttribute("id", "shelfGroup");
  sceneGroup.appendChild(shelfGroup);

  // ---------- 中间柜子（书架） ----------
  const cabX = 300, cabY = 50, cabW = 300, cabH = 430;
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

  // 顶部平放/斜靠的几本，故意做得杂乱一点：高低不齐、有的斜靠、间距不均
  const topBookCount = 6;
  let tx = cabX + 6;
  for (let i = 0; i < topBookCount; i++) {
    const bw = 30 + Math.random() * 34;
    if (tx + bw > cabX + cabW - 6) break;
    const bh = 9 + Math.random() * 8;
    const by = cabY - 8 - bh - Math.random() * 10;
    const b = rect(tx, by, bw, bh, 1);
    const rot = (Math.random() - 0.5) * 22;
    b.setAttribute("transform", `rotate(${rot} ${tx + bw / 2} ${by + bh})`);
    shelfGroup.appendChild(b);
    tx += bw + 2 + Math.random() * 10;
  }
  // 再散落几本歪倒的
  for (let i = 0; i < 2; i++) {
    const bw = 42 + Math.random() * 20;
    const bh = 10 + Math.random() * 6;
    const bx = cabX + 20 + Math.random() * (cabW - 80);
    const by = cabY - 10 - bh;
    const b = rect(bx, by, bw, bh, 1);
    b.setAttribute("transform", `rotate(${55 + Math.random() * 30} ${bx + bw / 2} ${by + bh / 2})`);
    shelfGroup.appendChild(b);
  }

  // ---------- 木箱 ----------
  function crate(cx, cy, w, h, inFront) {
    const g = document.createElementNS(SVG_NS, "g");
    const body = rect(cx, cy, w, h, 2);
    if (inFront) body.classList.add("wire-solid");
    g.appendChild(body);
    const n = inFront ? 9 : 6;
    const slotW = (w - 20) / n;
    for (let i = 0; i < n; i++) {
      const bx = cx + 10 + i * slotW;
      const bw = slotW - 4;
      const bh = h * (0.5 + Math.random() * 0.22);
      const rot = -9 + Math.random() * 18;
      const r = rect(bx, cy + h - bh - 8, bw, bh, 1);
      r.setAttribute("transform", `rotate(${rot} ${bx + bw / 2} ${cy + h - 8})`);
      g.appendChild(r);
    }
    return g;
  }

  const crateY = cabY + cabH - 148;
  // 左边木箱位置不变
  shelfGroup.appendChild(crate(70, crateY, 170, 148, false));
  // 右边木箱：挪到书架前面（画在后面=盖在上面），做成更长的长方体
  const crateRGroup = crate(cabX + 60, crateY + 40, 320, 118, true);
  shelfGroup.appendChild(crateRGroup);

  // ---------- 整个场景往左旋转15度 ----------
  sceneGroup.setAttribute("transform", "rotate(-15, 430, 300)");

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

  // ---------- 点击：书架自身坍塌 + 化蝶 ----------
  function shatter() {
    svg.removeEventListener("click", shatter);
    svg.style.cursor = "default";
    cursor.style.display = "none";
    hovering = false;

    const bbox = svg.getBoundingClientRect();

    // 书架/木箱/书本，每一根线各自往下坍塌，带随机旋转和延迟
    const pieces = shelfGroup.querySelectorAll(".wire");
    pieces.forEach((el) => {
      const dx = (Math.random() - 0.5) * 240;
      const dy = 170 + Math.random() * 300;
      const rot = (Math.random() - 0.5) * 620;
      el.style.setProperty("--dx", dx + "px");
      el.style.setProperty("--dy", dy + "px");
      el.style.setProperty("--rot", rot + "deg");
      el.style.animationDelay = Math.random() * 0.22 + "s";
      el.classList.add("shatter-piece");
    });

    // 蓝色发光蝴蝶，从书架区域向四周飞散
    const layer = document.getElementById("shatterLayer");
    const butterflyCount = 200;
    const wingsSVG = (
      '<svg viewBox="0 0 24 20">' +
      '<path d="M12 10 C8 1, -1 2, 1 10 C-1 18, 8 19, 12 10 Z" />' +
      '<path d="M12 10 C16 1, 25 2, 23 10 C25 18, 16 19, 12 10 Z" />' +
      '</svg>'
    );
    for (let i = 0; i < butterflyCount; i++) {
      const b = document.createElement("div");
      b.className = "butterfly-wrap";
      b.innerHTML = wingsSVG;
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
