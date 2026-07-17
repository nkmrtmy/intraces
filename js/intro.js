// ------------------------------------------------------------------
// 开场动画：白色发光线条书架 + 木箱（带顶面/侧面，做出立体感，水平放置），
// 鼠标悬浮变发光手，点击后书架自身的每一根线/每一块板直接向下坍塌
// （轻微旋转，不整圈乱转），同时飞出弧形翅膀的蓝色发光蝴蝶，
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

  // 顶面/侧面用的多边形，做出立体厚度感
  function poly(points, extraClass) {
    const el = document.createElementNS(SVG_NS, "polygon");
    el.setAttribute("points", points.map((p) => p.join(",")).join(" "));
    el.setAttribute("class", extraClass ? `wire ${extraClass}` : "wire");
    return el;
  }

  const shelfGroup = document.createElementNS(SVG_NS, "g");
  shelfGroup.setAttribute("id", "shelfGroup");
  svg.appendChild(shelfGroup);

  // ---------- 中间柜子（书架），水平放置 ----------
  const cabX = 300, cabY = 60, cabW = 300, cabH = 420;

  // 立体厚度：顶面 + 右侧面（深度向量 DX/DY）
  const DX = 36, DY = -22;
  shelfGroup.appendChild(poly([
    [cabX, cabY], [cabX + cabW, cabY],
    [cabX + cabW + DX, cabY + DY], [cabX + DX, cabY + DY],
  ], "wire-face"));
  shelfGroup.appendChild(poly([
    [cabX + cabW, cabY], [cabX + cabW + DX, cabY + DY],
    [cabX + cabW + DX, cabY + cabH + DY], [cabX + cabW, cabY + cabH],
  ], "wire-face"));

  // 正面框
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

  // 顶部只放3本，尺寸做得更长一些，摆得随性但不重叠
  {
    const maxX = cabX + cabW - 10;
    const startX = cabX + 10;
    const totalW = maxX - startX;
    const count = 3;
    const avgW = totalW / count;
    let tx = startX;
    for (let i = 0; i < count; i++) {
      const bw = avgW * (0.78 + Math.random() * 0.16);
      const bh = 13 + Math.random() * 6;
      const by = cabY - 8 - bh;
      const b = rect(tx, by, bw, bh, 1);
      const rot = (Math.random() - 0.5) * 9;
      b.setAttribute("transform", `rotate(${rot} ${tx + bw / 2} ${by + bh})`);
      shelfGroup.appendChild(b);
      tx += avgW;
    }
  }

  // ---------- 木箱（带顶面/侧面） ----------
  function crate(cx, cy, w, h, inFront) {
    const g = document.createElementNS(SVG_NS, "g");
    const cdx = inFront ? 22 : 16;
    const cdy = inFront ? -14 : -10;

    g.appendChild(poly([
      [cx, cy], [cx + w, cy], [cx + w + cdx, cy + cdy], [cx + cdx, cy + cdy],
    ], "wire-face"));
    g.appendChild(poly([
      [cx + w, cy], [cx + w + cdx, cy + cdy],
      [cx + w + cdx, cy + h + cdy], [cx + w, cy + h],
    ], "wire-face"));

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
  shelfGroup.appendChild(crate(70, crateY, 170, 148, false));
  const crateRGroup = crate(cabX + 60, crateY + 40, 320, 118, true);
  shelfGroup.appendChild(crateRGroup);

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

  // ---------- 点击：整体向下坍塌（轻微旋转）+ 化蝶 ----------
  function shatter() {
    svg.removeEventListener("click", shatter);
    svg.style.cursor = "default";
    cursor.style.display = "none";
    hovering = false;

    const bbox = svg.getBoundingClientRect();

    const pieces = shelfGroup.querySelectorAll(".wire");
    pieces.forEach((el) => {
      const dx = (Math.random() - 0.5) * 130;       // 横向漂移不大，整体感觉是往下坠
      const dy = 180 + Math.random() * 260;          // 主要是往下掉
      const rot = (Math.random() - 0.5) * 170;       // 旋转幅度收在约±85度，不整圈乱转
      el.style.setProperty("--dx", dx + "px");
      el.style.setProperty("--dy", dy + "px");
      el.style.setProperty("--rot", rot + "deg");
      el.style.animationDelay = Math.random() * 0.16 + "s";
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
