let DVDS = [];
let currentIndex = 0;
let activeBg = "A"; // which bg layer is currently visible

const discTrack = document.getElementById("discTrack");
const yearReadout = document.getElementById("yearReadout");
const bgA = document.getElementById("bgA");
const bgB = document.getElementById("bgB");

fetch("data/dvds.json")
  .then((res) => res.json())
  .then((data) => {
    // 按年份从新到旧、同年内保持原顺序排列成一条时间轴
    DVDS = [...data].sort((a, b) => b.year - a.year);
    buildDiscs();
    goTo(0, true);
  })
  .catch((err) => {
    discTrack.innerHTML = '<p style="color:#a9b8ae;font-family:monospace;">数据加载失败，请检查 data/dvds.json</p>';
    console.error(err);
  });

// ---------- 构建碟片DOM ----------
function buildDiscs() {
  discTrack.innerHTML = "";
  DVDS.forEach((dvd, i) => {
    const item = document.createElement("div");
    item.className = "disc-item";
    item.dataset.index = i;

    const img = document.createElement("img");
    img.src = dvd.disc;
    img.alt = dvd.title;
    item.appendChild(img);

    const label = document.createElement("div");
    label.className = "disc-label";
    label.innerHTML = `<div class="lt">${escapeHtml(dvd.title)}</div><div class="lr">${escapeHtml(dvd.role || "")}</div>`;
    item.appendChild(label);

    item.addEventListener("click", () => {
      if (i === currentIndex) {
        openDetail(dvd);
      } else {
        goTo(i);
      }
    });

    discTrack.appendChild(item);
  });
}

// ---------- 定位碟片（coverflow效果） ----------
function layout() {
  const items = discTrack.querySelectorAll(".disc-item");
  const spacing = 210;
  items.forEach((item, i) => {
    const offset = i - currentIndex;
    const abs = Math.abs(offset);
    item.classList.toggle("is-center", offset === 0);

    if (abs > 4) {
      item.style.opacity = "0";
      item.style.pointerEvents = "none";
      return;
    }
    item.style.pointerEvents = "all";

    const tx = offset * spacing;
    const scale = offset === 0 ? 1 : 1 - Math.min(abs * 0.16, 0.5);
    const rot = offset === 0 ? 0 : (offset > 0 ? -18 : 18);
    const z = 100 - abs;
    const opacity = offset === 0 ? 1 : Math.max(1 - abs * 0.32, 0.15);

    item.style.transform = `translateX(${tx}px) scale(${scale}) rotateY(${rot}deg)`;
    item.style.zIndex = z;
    item.style.opacity = opacity;
    item.style.filter = offset === 0 ? "none" : `blur(${abs * 0.6}px)`;
  });
}

function goTo(index, instant) {
  currentIndex = Math.max(0, Math.min(DVDS.length - 1, index));
  layout();
  updateBackground();
  yearReadout.textContent = DVDS[currentIndex] ? DVDS[currentIndex].year : "----";
}

function updateBackground() {
  const dvd = DVDS[currentIndex];
  if (!dvd) return;
  const url = `url('${dvd.cover}')`;
  if (activeBg === "A") {
    bgB.style.backgroundImage = url;
    bgB.classList.add("active");
    bgA.classList.remove("active");
    activeBg = "B";
  } else {
    bgA.style.backgroundImage = url;
    bgA.classList.add("active");
    bgB.classList.remove("active");
    activeBg = "A";
  }
}

// ---------- 交互：滚轮 / 拖动 / 键盘 / 箭头 ----------
let wheelLock = false;
document.getElementById("stage").addEventListener("wheel", (e) => {
  e.preventDefault();
  if (wheelLock) return;
  wheelLock = true;
  setTimeout(() => (wheelLock = false), 160);
  if (e.deltaY > 0 || e.deltaX > 0) goTo(currentIndex + 1);
  else goTo(currentIndex - 1);
}, { passive: false });

document.addEventListener("keydown", (e) => {
  if (document.getElementById("detailView").classList.contains("open")) return;
  if (e.key === "ArrowRight") goTo(currentIndex + 1);
  if (e.key === "ArrowLeft") goTo(currentIndex - 1);
  if (e.key === "Enter" && DVDS[currentIndex]) openDetail(DVDS[currentIndex]);
});

document.getElementById("navLeft").addEventListener("click", () => goTo(currentIndex - 1));
document.getElementById("navRight").addEventListener("click", () => goTo(currentIndex + 1));

let dragStartX = null;
let dragStartIndex = 0;
const stageEl = document.getElementById("stage");
stageEl.addEventListener("pointerdown", (e) => {
  dragStartX = e.clientX;
  dragStartIndex = currentIndex;
});
stageEl.addEventListener("pointerup", (e) => {
  if (dragStartX === null) return;
  const dx = e.clientX - dragStartX;
  if (Math.abs(dx) > 40) {
    goTo(dragStartIndex + (dx < 0 ? 1 : -1));
  }
  dragStartX = null;
});

// ---------- 详情过渡 ----------
const veil = document.getElementById("transitionVeil");
const veilText = document.getElementById("veilText");
const detailView = document.getElementById("detailView");
const stage = document.getElementById("stage");

function openDetail(dvd) {
  veilText.textContent = `INTERVIEWS ARCHIVE — ${dvd.interviews.length}`;
  veil.classList.add("show");
  stage.style.transition = "opacity 0.4s ease";
  stage.style.opacity = "0";

  setTimeout(() => {
    renderDetail(dvd);
    detailView.classList.add("open");
    setTimeout(() => {
      veil.classList.remove("show");
    }, 500);
  }, 700);
}

function renderDetail(dvd) {
  document.getElementById("detailTitle").textContent = dvd.title;
  document.getElementById("detailRole").textContent = dvd.role || "";

  const list = document.getElementById("detailInterviews");
  list.innerHTML = dvd.interviews && dvd.interviews.length
    ? dvd.interviews.map((iv, i) => `
        <div class="interview-list-item" data-idx="${i}">
          <div class="meta">${iv.date || ""}${iv.source ? " · " + escapeHtml(iv.source) : ""}</div>
          <div class="title">${escapeHtml(iv.title || "（无标题）")}</div>
        </div>
      `).join("")
    : `<p class="no-interviews">暂无相关采访记录。</p>`;

  list.querySelectorAll(".interview-list-item").forEach((el) => {
    el.addEventListener("click", () => {
      openInterviewModal(dvd.interviews[Number(el.dataset.idx)]);
    });
  });
}

// ---------- 采访全屏详情弹窗 ----------
const interviewModal = document.getElementById("interviewModal");
const interviewModalInner = document.getElementById("interviewModalInner");

function openInterviewModal(iv) {
  interviewModalInner.innerHTML = `
    <button class="interview-modal-close" id="interviewModalClose">×</button>
    <div class="interview-modal-meta">${iv.date || ""}${iv.source ? " · " + escapeHtml(iv.source) : ""}</div>
    <h3 class="interview-modal-title">${escapeHtml(iv.title || "")}</h3>
    ${renderExcerpt(iv)}
    ${iv.url ? `<a class="interview-modal-link" href="${iv.url}" target="_blank" rel="noopener">跳转至出处网站（外链） →</a>` : ""}
  `;
  interviewModal.classList.add("open");
  document.getElementById("interviewModalClose").addEventListener("click", closeInterviewModal);
}

function closeInterviewModal() {
  interviewModal.classList.remove("open");
}

interviewModal.addEventListener("click", (e) => {
  if (e.target.id === "interviewModal") closeInterviewModal();
});

// 日中对照：按换行切段，逐段配对，每行高度取较高的一边，另一边顶部对齐
function renderExcerpt(iv) {
  if (iv.excerpt_ja || iv.excerpt_zh) {
    const jaParas = (iv.excerpt_ja || "").split("\n").filter((s) => s.trim() !== "");
    const zhParas = (iv.excerpt_zh || "").split("\n").filter((s) => s.trim() !== "");
    const rows = Math.max(jaParas.length, zhParas.length);
    if (rows === 0) return "";

    let html = '<div class="excerpt-bilingual">';
    for (let i = 0; i < rows; i++) {
      html += `
        <div class="excerpt-row">
          <div class="excerpt-ja">${i === 0 ? '<span class="excerpt-lang-tag">JA</span><br>' : ""}${escapeHtml(jaParas[i] || "")}</div>
          <div class="excerpt-zh">${i === 0 ? '<span class="excerpt-lang-tag">中</span><br>' : ""}${escapeHtml(zhParas[i] || "")}</div>
        </div>`;
    }
    html += "</div>";
    return html;
  }
  // 兼容旧数据：只有单一 excerpt 字段
  if (iv.excerpt) {
    return `<p>${escapeHtml(iv.excerpt)}</p>`;
  }
  return "";
}

document.getElementById("detailClose").addEventListener("click", closeDetail);

function closeDetail() {
  detailView.classList.remove("open");
  stage.style.opacity = "1";
  closeInterviewModal();
}

// ---------- 搜索 ----------
const searchInput = document.getElementById("searchInput");
const searchOverlay = document.getElementById("searchOverlay");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchOverlay.classList.remove("open");
    searchOverlay.innerHTML = "";
    return;
  }

  const matches = [];
  DVDS.forEach((dvd) => {
    (dvd.interviews || []).forEach((iv) => {
      const haystack = [dvd.title, dvd.role, iv.title, iv.source, iv.excerpt, iv.excerpt_ja, iv.excerpt_zh]
        .join(" ").toLowerCase();
      if (haystack.includes(q)) matches.push({ dvd, iv });
    });
    if (dvd.title.toLowerCase().includes(q) && !(dvd.interviews || []).length) {
      matches.push({ dvd, iv: null });
    }
  });

  searchOverlay.classList.add("open");
  if (!matches.length) {
    searchOverlay.innerHTML = `<div class="search-result-item"><div class="excerpt">没有找到匹配的结果。</div></div>`;
    return;
  }

  searchOverlay.innerHTML = matches.map(({ dvd, iv }) => `
    <div class="search-result-item" data-id="${dvd.id}">
      <img src="${dvd.disc}" alt="${escapeHtml(dvd.title)}">
      <div>
        <div class="meta">${dvd.year}${iv ? " · " + (iv.source || "") : ""}</div>
        <div class="title">${escapeHtml(dvd.title)}${iv ? " — " + escapeHtml(iv.title || "") : ""}</div>
        ${iv ? `<div class="excerpt">${escapeHtml(iv.excerpt_zh || iv.excerpt_ja || iv.excerpt || "")}</div>` : ""}
      </div>
    </div>
  `).join("");

  searchOverlay.querySelectorAll(".search-result-item[data-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const dvd = DVDS.find((d) => d.id === el.dataset.id);
      if (dvd) {
        searchOverlay.classList.remove("open");
        searchInput.value = "";
        const idx = DVDS.indexOf(dvd);
        goTo(idx, true);
        openDetail(dvd);
      }
    });
  });
});

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
