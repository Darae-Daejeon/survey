/* =========================================================
   지역 물류산업 AX 수요조사 — 동작
   ========================================================= */
(function () {
  "use strict";
  var S = window.SURVEY;
  var $ = function (id) { return document.getElementById(id); };
  var NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
  var DRAFT_KEY = "dicia-survey-draft-" + S.survey;
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 고정 문구 채우기 ---------------- */
  var qCount = S.sections.reduce(function (n, s) { return n + s.questions.length; }, 0);
  $("brandHost").textContent = S.host;
  $("audienceChip").textContent = S.audience;
  $("introLead").innerHTML = S.intro.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
  $("metaMin").textContent = S.minutes + "분";
  $("metaQ").textContent = qCount + "문항";
  $("footHost").textContent = S.host;
  $("footAgency").textContent = S.agency;
  $("barTitle").textContent = S.title + " · " + S.audience;
  document.title = S.title + " | " + S.audience;
  [["footTel", "footMail"], ["doneTel", "doneEmail"], ["closedTel", "closedMail"]].forEach(function (p) {
    $(p[0]).textContent = "T. " + S.contactPhone; $(p[0]).href = "tel:" + S.contactPhone.replace(/[^0-9]/g, "");
    $(p[1]).textContent = S.contactEmail; $(p[1]).href = "mailto:" + S.contactEmail;
  });

  /* ---------------- 배경: 물류 네트워크 애니메이션 ---------------- */
  function Net(canvas, opt) {
    opt = opt || {};
    var ctx = canvas.getContext("2d"), dpr = 1, W = 0, H = 0;
    var nodes = [], edges = [], cars = [], hubs = [], raf = 0, running = false;
    var NAMES = ["유성", "대덕", "둔산", "신탄진", "대화", "관저", "판암", "원신흥", "문평", "평촌"];

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = []; edges = []; cars = []; hubs = [];
      var gap = (W < 720 ? 64 : 84) * (opt.scale || 1);
      var cols = Math.ceil(W / gap) + 2, rows = Math.ceil(H / gap) + 2;
      var grid = [];
      for (var r = 0; r < rows; r++) {
        grid[r] = [];
        for (var c = 0; c < cols; c++) {
          var n = { x: (c - 0.5) * gap + (Math.random() - 0.5) * gap * 0.55, y: (r - 0.5) * gap + (Math.random() - 0.5) * gap * 0.55, adj: [], pulse: 0, hub: false };
          grid[r][c] = n; nodes.push(n);
        }
      }
      function link(a, b, major) {
        var e = { a: a, b: b, heat: 0, major: !!major, len: Math.hypot(a.x - b.x, a.y - b.y) };
        edges.push(e); a.adj.push({ n: b, e: e }); b.adj.push({ n: a, e: e });
      }
      for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) {
        var majorRow = r % 4 === 1, majorCol = c % 5 === 2;
        if (c + 1 < cols && (majorRow || Math.random() < 0.62)) link(grid[r][c], grid[r][c + 1], majorRow);
        if (r + 1 < rows && (majorCol || Math.random() < 0.55)) link(grid[r][c], grid[r + 1][c], majorCol);
        if (c + 1 < cols && r + 1 < rows && Math.random() < 0.08) link(grid[r][c], grid[r + 1][c + 1]);
      }
      /* 거점(허브) — 화면 오른쪽에 더 많이 */
      var cand = nodes.filter(function (n) { return n.adj.length >= 3 && n.x > W * 0.12 && n.x < W - 30 && n.y > 70 && n.y < H - 70; });
      cand.sort(function (a, b) { return (b.x / W + Math.random() * 0.9) - (a.x / W + Math.random() * 0.9); });
      var hubN = Math.max(4, Math.min(10, Math.round(W * H / (220000 * (opt.scale || 1) * (opt.scale || 1)))));
      for (var i = 0; i < cand.length && hubs.length < hubN; i++) {
        var ok = hubs.every(function (h) { return Math.hypot(h.x - cand[i].x, h.y - cand[i].y) > gap * 2.6; });
        if (ok) { cand[i].hub = true; cand[i].name = NAMES[hubs.length % NAMES.length]; hubs.push(cand[i]); }
      }
      var carN = Math.round(Math.min(170, Math.max(24, W * H / (15000 * (opt.scale || 1) * (opt.scale || 1)))));
      for (i = 0; i < carN; i++) spawn(true);
    }

    function spawn(randomPos) {
      var start = nodes[(Math.random() * nodes.length) | 0];
      if (!start.adj.length) return;
      var nx = start.adj[(Math.random() * start.adj.length) | 0];
      var amber = Math.random() < 0.32;
      cars.push({ from: start, to: nx.n, e: nx.e, t: randomPos ? Math.random() : 0, v: (amber ? 0.9 : 0.6) + Math.random() * 0.7, amber: amber, trail: [] });
    }

    function step(dt) {
      for (var i = 0; i < edges.length; i++) edges[i].heat *= 0.985;
      for (i = 0; i < nodes.length; i++) nodes[i].pulse *= 0.96;
      cars.forEach(function (c) {
        c.t += (c.v * dt * 0.06) / Math.max(c.e.len, 1) * 60 / 60 * 1.6;
        c.e.heat = Math.min(1, c.e.heat + (c.amber ? 0.02 : 0.01));
        if (c.t >= 1) {
          var at = c.to;
          if (at.hub) at.pulse = 1;
          var opts = at.adj.filter(function (a) { return a.n !== c.from; });
          if (!opts.length) opts = at.adj;
          /* 굵은 도로(간선)를 더 자주 탐 */
          var pick = opts[(Math.random() * opts.length) | 0];
          for (var k = 0; k < opts.length; k++) if (opts[k].e.major && Math.random() < 0.35) { pick = opts[k]; break; }
          c.from = at; c.to = pick.n; c.e = pick.e; c.t = 0;
        }
        var x = c.from.x + (c.to.x - c.from.x) * c.t, y = c.from.y + (c.to.y - c.from.y) * c.t;
        c.trail.push(x, y);
        if (c.trail.length > 36) c.trail.splice(0, 2);
        c.x = x; c.y = y;
      });
    }

    function draw(time) {
      ctx.clearRect(0, 0, W, H);
      /* 도로 */
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        ctx.strokeStyle = e.heat > 0.05 ? "rgba(255,181,71," + (0.08 + e.heat * 0.32).toFixed(3) + ")" : (e.major ? "rgba(130,155,190,.26)" : "rgba(130,155,190,.13)");
        ctx.lineWidth = (e.major ? 1.3 : 0.8) * (opt.scale || 1);
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      }
      /* 교차점 */
      ctx.fillStyle = "rgba(150,170,200,.22)";
      for (i = 0; i < nodes.length; i++) { var n = nodes[i]; if (!n.hub) ctx.fillRect(n.x - 1, n.y - 1, 2, 2); }
      /* 차량 궤적 */
      cars.forEach(function (c) {
        var t = c.trail, len = t.length / 2;
        if (len < 2) return;
        for (var k = 1; k < len; k++) {
          var a = k / len;
          ctx.strokeStyle = c.amber ? "rgba(255,181,71," + (a * 0.75).toFixed(3) + ")" : "rgba(170,200,255," + (a * 0.45).toFixed(3) + ")";
          ctx.lineWidth = (c.amber ? 2 : 1.4) * (opt.scale || 1);
          ctx.beginPath(); ctx.moveTo(t[k * 2 - 2], t[k * 2 - 1]); ctx.lineTo(t[k * 2], t[k * 2 + 1]); ctx.stroke();
        }
        ctx.fillStyle = c.amber ? "#ffd08a" : "#dbe7ff";
        ctx.beginPath(); ctx.arc(c.x, c.y, (c.amber ? 2.3 : 1.6) * (opt.scale || 1), 0, 6.283); ctx.fill();
      });
      /* 거점 */
      hubs.forEach(function (h, idx) {
        var breathe = 0.5 + 0.5 * Math.sin(time / 900 + idx);
        var R = 5 + h.pulse * 22;
        ctx.strokeStyle = "rgba(255,181,71," + (0.15 + h.pulse * 0.5).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(h.x, h.y, R, 0, 6.283); ctx.stroke();
        ctx.strokeStyle = "rgba(255,181,71," + (0.25 + breathe * 0.2).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(h.x, h.y, 9, 0, 6.283); ctx.stroke();
        ctx.fillStyle = "#ffb547";
        ctx.beginPath(); ctx.arc(h.x, h.y, 3.2, 0, 6.283); ctx.fill();
        ctx.font = "600 " + Math.round(13 * (opt.scale || 1)) + "px " + getComputedStyle(document.body).fontFamily;
        ctx.fillStyle = "rgba(220,228,240,.55)";
        ctx.fillText(h.name + " HUB " + String(idx + 1).padStart(2, "0"), h.x + 14, h.y + 4);
      });
    }

    var last = 0;
    function loop(t) {
      if (!running) return;
      var dt = Math.min(50, t - (last || t)); last = t;
      step(dt); draw(t);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running) return; running = true; last = 0;
      if (!W) build();
      if (reduceMotion) { for (var i = 0; i < 120; i++) step(16); draw(0); running = false; return; }
      raf = requestAnimationFrame(loop);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (canvas.clientWidth && Math.abs(canvas.clientWidth - W) > 40 || Math.abs(canvas.clientHeight - H) > 120) { build(); if (!running) draw(0); } }, 200);
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (!canvas.closest("[hidden]")) start(); });
    return { start: start, stop: stop, rebuild: build };
  }
  var net1 = Net($("net"), { scale: 1.35 }), net2 = null;

  /* ---------------- 아이콘 ---------------- */
  var ICON = {
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M12 8v5M12 16.5v.01"/>',
    box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
    robot: '<rect x="4" y="8" width="16" height="10" rx="3"/><path d="M12 4v4M8.5 13h.01M15.5 13h.01M7 18v2M17 18v2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8" r="1.5"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.3-5.5 6.5-5.5s5.9 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
    truck: '<path d="M2 6h11v10H2zM13 10h4.5l3.5 3.5V16h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  };
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------------- 화면 구성 ---------------- */
  var answers = {};   /* { A1: ["물류업"], ... } */
  var etcText = {};   /* { A1: "직접 입력값" } */
  var info = {};
  var consent = false;

  var pagesEl = $("pages");
  var steps = [{ key: "info", label: "작성자 정보" }].concat(S.sections.map(function (s) { return { key: s.key, label: s.title }; }));

  $("steps").innerHTML = steps.map(function (s, i) {
    return '<li data-i="' + i + '"><span>' + (i ? s.key + ". " : "") + esc(i ? s.label : "작성자 정보") + "</span></li>";
  }).join("");

  function ruleText(q) {
    if (q.type === "single") return "1개 선택";
    if (q.max) return "최대 " + q.max + "개";
    return "복수 선택";
  }

  function pageInfo() {
    var h = '<section class="page" data-step="0">' +
      '<header class="sec"><div class="sec__key">I</div>' +
      '<h2 class="sec__title">작성자 정보</h2>' +
      '</header>' +
      '<div class="field-grid">';
    S.info.forEach(function (f) {
      h += '<div class="field" data-field="' + f.id + '">' +
        '<label for="f_' + f.id + '">' + esc(f.label) + (f.required ? '<span class="req" aria-hidden="true">*</span>' : '<span class="opt-tag">선택</span>') + "</label>" +
        '<input class="input" id="f_' + f.id + '" name="' + f.id + '" type="' + (f.type || "text") + '"' +
        (f.type === "tel" ? ' inputmode="tel"' : "") + (f.type === "email" ? ' inputmode="email"' : "") +
        ' autocomplete="' + (f.auto || "on") + '" placeholder="' + esc(f.placeholder || "") + '"' + (f.required ? " required" : "") + ' maxlength="80">' +
        (f.help ? '<span class="field__help">' + esc(f.help) + "</span>" : "") +
        '<span class="field__err"></span></div>';
    });
    var P = S.privacy;
    h += "</div>" +
      '<div class="consent" id="consentBox">' +
      '<dl class="consent__table"><dt>수집 항목</dt><dd>' + esc(P.items) + "</dd>" +
      "<dt>이용 목적</dt><dd>" + esc(P.purpose) + "</dd>" +
      "<dt>보유 기간</dt><dd>" + esc(P.period) + "</dd></dl>" +
      '<p class="consent__refuse">' + esc(P.refuse) + "</p>" +
      '<label class="consent__agree" id="consentLbl"><input type="checkbox" id="consent"><span class="opt__box">' + CHECK + "</span>" +
      "개인정보 수집·이용에 동의합니다 (필수)</label></div>" +
      "</section>";
    return h;
  }

  function pageSection(sec, idx) {
    var h = '<section class="page" data-step="' + (idx + 1) + '">' +
      '<header class="sec"><div class="sec__key">' + sec.key + '</div>' +
      '<h2 class="sec__title">' + esc(sec.title) + "</h2>" +
      (sec.lead || sec.note ? '<p class="sec__lead">' + esc(sec.lead || "") + (sec.note ? ' <span class="sec__hl">' + esc(sec.note) + "</span>" : "") + "</p>" : "") +
      "</header><div class=\"qgrid\">";
    sec.questions.forEach(function (q, qi) {
      var inputType = q.type === "single" ? "radio" : "checkbox";
      h += '<fieldset class="q' + (q.half ? " q--half" : "") + '" id="q_' + q.id + '" data-q="' + q.id + '" style="border:0;margin:0;min-width:0">' +
        '<legend class="q__head" style="padding:0;float:left;width:100%"><span class="q__no">' + sec.key + "-" + (qi + 1) + "</span>" +
        '<span class="q__title">' + esc(q.title) + '<span class="q__rule">' + ruleText(q) + "</span></span></legend>" +
        '<div class="opts' + (q.tech ? " opts--tech" : "") + (!q.tech && !q.options.some(function (o) { return o.desc; }) ? " opts--short" : "") + (q.type === "single" && q.options.length <= 3 && !q.options.some(function (o) { return o.etc; }) ? " opts--row opts--" + q.options.length : "") + '" style="clear:both">';
      var n = 0;
      q.options.forEach(function (o, oi) {
        var cls = "opt opt--" + (q.type === "single" ? "single" : "multi") + (o.none ? " opt--none" : "") + (o.etc ? " opt--etc" : "") + (q.tech && !o.none ? " opt--tech" : "");
        var label = q.tech && !o.none ? NUM[n++] + " " + o.label : o.label;
        h += '<label class="' + cls + '" data-v="' + esc(label) + '">' +
          '<input type="' + inputType + '" name="' + q.id + '" value="' + esc(label) + '"' + (o.none ? ' data-none="1"' : "") + (o.etc ? ' data-etc="1"' : "") + ">";
        if (q.tech && !o.none) {
          h += '<span class="opt__txt"><span class="opt__label"><span class="opt__ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICON[o.icon] || "") + "</svg></span>" +
            '<span class="opt__num">' + NUM[n - 1] + '</span> ' + esc(o.label) + "</span>" +
            '<span class="opt__desc">' + esc(o.desc || "") + "</span></span>" +
            '<span class="opt__box">' + CHECK + "</span>";
        } else {
          h += '<span class="opt__box">' + CHECK + "</span>" +
            '<span class="opt__txt"><span class="opt__label">' + esc(o.label) + "</span>" +
            (o.desc ? '<span class="opt__desc">' + esc(o.desc) + "</span>" : "") + "</span>";
          if (o.etc) h += '<span class="opt__etc"><input class="input input--sm" type="text" data-etc-for="' + q.id + '" maxlength="100" placeholder="내용을 입력해 주십시오" aria-label="' + esc(q.short) + ' 기타 내용"></span>';
        }
        h += "</label>";
      });
      h += '</div><p class="q__err" role="alert"></p></fieldset>';
    });
    return h + "</div></section>";
  }

  var pageHTML = [pageInfo()].concat(S.sections.map(pageSection));
  var cur = 0, dirBack = false;

  function findQ(id) {
    for (var i = 0; i < S.sections.length; i++) for (var j = 0; j < S.sections[i].questions.length; j++)
      if (S.sections[i].questions[j].id === id) return S.sections[i].questions[j];
  }

  /* 현재 단계 그리기 (상태 → 화면) */
  function render() {
    pagesEl.innerHTML = pageHTML[cur];
    var page = pagesEl.firstChild;
    if (dirBack) page.classList.add("is-back");
    if (cur === 0) {
      S.info.forEach(function (f) { $("f_" + f.id).value = info[f.id] || ""; });
      $("consent").checked = consent;
      $("consentLbl").classList.toggle("is-on", consent);
    } else {
      page.querySelectorAll(".q").forEach(function (fs) {
        var id = fs.dataset.q, sel = answers[id] || [];
        fs.querySelectorAll("input[name]").forEach(function (inp) { inp.checked = sel.indexOf(inp.value) > -1; });
        var et = fs.querySelector("[data-etc-for]"); if (et) et.value = etcText[id] || "";
        syncQ(fs);
      });
    }
    $("steps").querySelectorAll("li").forEach(function (li, i) {
      li.classList.toggle("is-now", i === cur); li.classList.toggle("is-done", i < cur);
      if (i === cur) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    $("barCount").innerHTML = "<b>" + (cur + 1) + "</b> / " + steps.length;
    $("btnPrev").style.visibility = cur === 0 ? "hidden" : "visible";
    var last = cur === steps.length - 1;
    $("btnNext").classList.toggle("is-submit", last);
    $("btnNext").querySelector("span").textContent = last ? "응답 제출하기" : "다음";
    $("formErr").textContent = "";
  }

  /* 선택 상태를 타일 모양에 반영 */
  function syncQ(fs) {
    var q = findQ(fs.dataset.q), sel = answers[q.id] || [];
    var full = q.max && sel.length >= q.max;
    fs.querySelectorAll(".opt").forEach(function (lb) {
      var on = sel.indexOf(lb.dataset.v) > -1;
      lb.classList.toggle("is-on", on);
      lb.classList.toggle("is-dim", !!(full && !on));
    });
  }

  /* 선택 처리 */
  pagesEl.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "consent") {
      consent = t.checked; $("consentLbl").classList.toggle("is-on", consent);
      if (consent) $("consentBox").classList.remove("is-invalid");
      saveDraft(); return;
    }
    if (!t.name || t.dataset.etcFor || !t.closest(".q")) return;
    var fs = t.closest(".q"), q = findQ(t.name);
    var sel = (answers[q.id] || []).slice();
    if (q.type === "single") sel = [t.value];
    else if (t.checked) {
      if (t.dataset.none) sel = [t.value];
      else {
        sel = sel.filter(function (v) { return !isNone(q, v); });
        if (q.max && sel.length >= q.max) {
          t.checked = false;
          showQErr(fs, "최대 " + q.max + "개까지 선택할 수 있습니다.");
          return;
        }
        sel.push(t.value);
      }
    } else sel = sel.filter(function (v) { return v !== t.value; });
    answers[q.id] = sel;
    fs.querySelectorAll("input[name]").forEach(function (inp) { inp.checked = sel.indexOf(inp.value) > -1; });
    fs.classList.remove("is-invalid");
    syncQ(fs);
    if (t.dataset.etc && t.checked) { var et = fs.querySelector("[data-etc-for]"); setTimeout(function () { et.focus(); }, 30); }
    saveDraft();
  });
  pagesEl.addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset.etcFor) { etcText[t.dataset.etcFor] = t.value; t.closest(".q").classList.remove("is-invalid"); }
    else if (t.id && t.id.indexOf("f_") === 0) {
      var k = t.id.slice(2);
      if (k === "phone") { var p = fmtPhone(t.value); if (p !== t.value) t.value = p; }
      info[k] = t.value; t.closest(".field").classList.remove("is-invalid");
    }
    saveDraft();
  });
  /* 기타 입력칸 클릭이 라벨 선택을 뒤집지 않도록 */
  pagesEl.addEventListener("click", function (e) { if (e.target.dataset && e.target.dataset.etcFor) e.preventDefault(); });

  function isNone(q, v) { return q.options.some(function (o, i) { return o.none && o.label === v; }); }
  function isEtc(q, v) { return q.options.some(function (o) { return o.etc && o.label === v; }); }
  function showQErr(fs, msg) {
    fs.querySelector(".q__err").textContent = msg;
    fs.classList.add("is-invalid");
    clearTimeout(fs._t); fs._t = setTimeout(function () { if (!fs.dataset.hard) fs.classList.remove("is-invalid"); }, 2200);
  }

  /* ---------------- 검사 ---------------- */
  function validate() {
    var first = null;
    if (cur === 0) {
      S.info.forEach(function (f) {
        var v = String(info[f.id] || "").trim(), box = document.querySelector('[data-field="' + f.id + '"]'), msg = "";
        if (f.required && !v) msg = f.label + josa(f.label) + " 입력해 주십시오.";
        else if (f.id === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "이메일 주소 형식을 확인해 주십시오.";
        else if (f.id === "phone" && v && !/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v)) msg = "연락처 형식을 확인해 주십시오.";
        box.classList.toggle("is-invalid", !!msg);
        box.querySelector(".field__err").textContent = msg;
        if (msg && !first) first = box;
      });
      if (!consent) { $("consentBox").classList.add("is-invalid"); if (!first) first = $("consentBox"); }
      if (first) $("formErr").textContent = !consent && first.id === "consentBox" ? "개인정보 수집·이용 동의가 필요합니다." : "입력하지 않은 항목이 있습니다.";
    } else {
      S.sections[cur - 1].questions.forEach(function (q) {
        var fs = $("q_" + q.id), sel = answers[q.id] || [], msg = "";
        if (!sel.length) msg = "응답을 선택해 주십시오.";
        else if (sel.some(function (v) { return isEtc(q, v); }) && !String(etcText[q.id] || "").trim()) msg = "기타 내용을 입력해 주십시오.";
        fs.dataset.hard = msg ? "1" : "";
        if (msg) { fs.querySelector(".q__err").textContent = msg; fs.classList.add("is-invalid"); if (!first) first = fs; }
        else fs.classList.remove("is-invalid");
      });
      if (first) $("formErr").textContent = "응답하지 않은 문항이 있습니다.";
    }
    if (first) {
      first.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      var f = first.querySelector("input"); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 350);
      return false;
    }
    return true;
  }

  /* ---------------- 이동 ---------------- */
  function go(i, push) {
    dirBack = i < cur; cur = i; render();
    window.scrollTo({ top: 0, behavior: "auto" });
    if (push !== false) history.pushState({ step: i }, "", "#" + (i === 0 ? "info" : steps[i].key));
    saveDraft();
  }
  $("btnNext").addEventListener("click", function () {
    if (!validate()) return;
    if (cur < steps.length - 1) go(cur + 1); else submit();
  });
  $("btnPrev").addEventListener("click", function () { if (cur > 0) go(cur - 1); });
  $("form").addEventListener("submit", function (e) { e.preventDefault(); });
  $("form").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox" && e.target.type !== "radio") { e.preventDefault(); $("btnNext").click(); }
  });

  function show(id) {
    ["intro", "survey", "done", "closed"].forEach(function (s) { $(s).hidden = s !== id; });
    if (id === "intro") net1.start(); else net1.stop();
    if (id === "done") { if (!net2) net2 = Net($("net2")); net2.start(); } else if (net2) net2.stop();
  }
  function startSurvey(resume) {
    if (isClosed()) { show("closed"); return; }
    if (!resume) { answers = {}; etcText = {}; info = {}; consent = false; cur = 0; clearDraft(); }
    show("survey");
    history.pushState({ step: cur }, "", "#" + (cur === 0 ? "info" : steps[cur].key));
    dirBack = false; render();
    window.scrollTo(0, 0);
    setTimeout(function () { var f = document.querySelector("#pages input"); if (f && cur === 0 && matchMedia("(min-width: 721px)").matches) f.focus(); }, 300);
  }
  $("btnStart").addEventListener("click", function () { startSurvey(false); });
  $("btnResume").addEventListener("click", function () { startSurvey(true); });
  $("btnHome").addEventListener("click", function () { show("intro"); history.pushState({ step: -1 }, "", location.pathname + location.search); updateResume(); });
  window.addEventListener("popstate", function (e) {
    var st = e.state;
    if (!$("done").hidden) return;
    if (!st || st.step < 0) { show("intro"); updateResume(); return; }
    if ($("survey").hidden) show("survey");
    dirBack = st.step < cur; cur = st.step; render();
  });

  /* ---------------- 제출 ---------------- */
  function valueOf(q) {
    return (answers[q.id] || []).map(function (v) { return isEtc(q, v) ? v + "(" + String(etcText[q.id] || "").trim() + ")" : v; }).join(", ");
  }
  function buildPayload() {
    var fields = S.info.map(function (f) { return { key: f.id, label: f.label === "E-mail" ? "이메일" : f.label, value: String(info[f.id] || "").trim() }; });
    var summary = [];
    S.sections.forEach(function (sec) {
      var items = [];
      sec.questions.forEach(function (q, qi) {
        var v = valueOf(q);
        fields.push({ key: q.id, label: q.id + ". " + q.short, value: v });
        items.push({ no: sec.key + "-" + (qi + 1), q: q.short, a: v });
      });
      summary.push({ key: sec.key, title: sec.title, items: items });
    });
    fields.push({ key: "privacy", label: "개인정보 동의", value: consent ? "동의" : "미동의" });
    return {
      survey: S.survey,
      title: S.title,
      audience: S.audience,
      company: String(info.company || "").trim(),
      name: String(info.name || "").trim(),
      position: String(info.position || "").trim(),
      email: String(info.email || "").trim(),
      notice: (answers.D1 || [])[0] === "동의",
      fields: fields,
      summary: summary,
      page: location.href.split("#")[0],
      ua: navigator.userAgent.slice(0, 180),
    };
  }

  function submit() {
    if (isClosed()) { show("closed"); return; }
    var data = buildPayload();
    var btn = $("btnNext");
    btn.disabled = true; btn.querySelector("span").textContent = "제출하는 중…";
    send(data).then(function (res) {
      clearDraft();
      $("doneLead").textContent = (data.company ? data.company + " " : "") + data.name + (data.position ? " " + data.position : "") + "님의 응답이 정상 접수되었습니다. 보내주신 의견은 ’27년 사업 기획에 반영하겠습니다.";
      $("doneNo").textContent = res.no || "-";
      $("doneAt").textContent = res.at || fmtNow();
      $("doneMail").innerHTML = res.demo ? "※ 시험 모드: 응답이 저장되지 않았습니다. (endpoint 미설정)"
        : res.mail ? "<b>" + esc(data.email) + "</b> 으로 응답 확인 메일을 보내드렸습니다." : "";
      show("done");
      history.replaceState({ step: -2 }, "", location.pathname + location.search);
      window.scrollTo(0, 0);
    }).catch(function (err) {
      btn.disabled = false; btn.querySelector("span").textContent = "응답 제출하기";
      if (err && err.message === "closed") { show("closed"); return; }
      $("formErr").textContent = "일시적인 오류로 제출되지 않았습니다. 잠시 후 다시 시도해 주십시오." + (err && err.message ? " (" + err.message + ")" : "");
      console.error("[설문 제출 오류]", err);
    });
  }

  function send(data) {
    if (!S.endpoint) {
      console.info("[시험 모드] endpoint가 비어 있어 저장하지 않았습니다.", data);
      return new Promise(function (r) { setTimeout(function () { r({ ok: true, demo: true }); }, 700); });
    }
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    return fetch(S.endpoint, {
      method: "POST",
      body: JSON.stringify(data),   /* text/plain 전송 → 사전요청 없이 Apps Script로 바로 전달 */
      signal: ctrl ? ctrl.signal : undefined,
    }).then(function (r) {
      return r.text().then(function (t) {
        try { return JSON.parse(t); }
        catch (e) { throw new Error(/<html|<!doctype/i.test(t) ? "웹 앱 액세스 권한 확인 필요" : "응답 형식 오류 " + r.status); }
      });
    }).then(function (res) {
      clearTimeout(timer);
      if (!res || !res.ok) throw new Error(res && res.error);
      return res;
    }, function (err) { clearTimeout(timer); throw err.name === "AbortError" ? new Error("응답 시간 초과") : err; });
  }

  /* ---------------- 임시 저장 (이 브라우저에만) ---------------- */
  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ a: answers, e: etcText, i: info, c: consent, s: cur, t: Date.now() })); } catch (e) {}
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
  function loadDraft() {
    try {
      var d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (!d || Date.now() - d.t > 1000 * 60 * 60 * 24 * 14) return false;
      answers = d.a || {}; etcText = d.e || {}; info = d.i || {}; consent = !!d.c; cur = Math.min(d.s || 0, steps.length - 1);
      return Object.keys(info).some(function (k) { return info[k]; }) || Object.keys(answers).length > 0;
    } catch (e) { return false; }
  }
  function updateResume() { $("btnResume").hidden = !loadDraft(); }

  /* ---------------- 마감 ---------------- */
  var deadline = Date.parse(S.deadline || "");
  function isClosed() { return /[?&]closed\b/.test(location.search) || (!isNaN(deadline) && Date.now() >= deadline); }

  /* ---------------- 도구 ---------------- */
  function fmtPhone(v) {
    var d = v.replace(/[^0-9]/g, "").slice(0, 11);
    if (/^02/.test(d)) return d.length < 3 ? d : d.length < 6 ? d.slice(0, 2) + "-" + d.slice(2) : d.length < 10 ? d.slice(0, 2) + "-" + d.slice(2, 5) + "-" + d.slice(5) : d.slice(0, 2) + "-" + d.slice(2, 6) + "-" + d.slice(6);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + "-" + d.slice(3);
    if (d.length < 11) return d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6);
    return d.slice(0, 3) + "-" + d.slice(3, 7) + "-" + d.slice(7);
  }
  function fmtNow() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "." + p(d.getMonth() + 1) + "." + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  function josa(w) {
    var c = w.charCodeAt(w.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return "을";
    return (c - 0xAC00) % 28 ? "을" : "를";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  /* ---------------- 시작 ---------------- */
  if (isClosed()) show("closed");
  else { show("intro"); updateResume(); history.replaceState({ step: -1 }, "", location.pathname + location.search); }
})();
