/* ==========================================================================
   TACTICAL CATALYST — KINGFISHER PORTFOLIO ENGINE v4.0
   Clean Modular Architecture • Theme Engine • Command Palette • Synced CV Data
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.PORTFOLIO_DATA || {
    meta: { roles: ["Tactical Builder", "IT Product Manager", "AI/ML & Cloud Technologist"] },
    stats: { totalRecords: 88, totalProjects: 14, totalAwards: 15, totalOrganizations: 11, totalCommittees: 34 },
    brandPalette: [],
    featuredProjects: [],
    highlights: [],
    cvRecords: [],
    workstation: []
  };

  window.__orixMotion = {
    scrollY: window.scrollY || 0,
    scrollProgress: 0,
    velocity: 0,
    strikeEnergy: 0,
    calm: false
  };

  let lenisInstance = null;

  /* ------------------------------------------------------------------------
     UTILITIES: TOAST, CLIPBOARD, ESCAPE HTML, SMOOTH SCROLL
     ------------------------------------------------------------------------ */
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById("kf-toast");
    const text = document.getElementById("kf-toast-text");
    if (!toast || !text) return;
    text.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  async function copyToClipboard(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      showToast(label || "Tersalin ke clipboard");
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      ta.remove();
      showToast(label || "Tersalin ke clipboard");
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function scrollToSection(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (lenisInstance) {
      lenisInstance.scrollTo(el, { offset: -80, duration: 1.05 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function attachSpotlight(root) {
    (root || document).querySelectorAll(".spotlight-card").forEach((card) => {
      if (card.dataset.spotlightWired === "1") return;
      card.dataset.spotlightWired = "1";
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      }, { passive: true });
    });
  }

  /* ------------------------------------------------------------------------
     1. LIGHT / DARK THEME ENGINE & CALM FOCUS MODE
     ------------------------------------------------------------------------ */
  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme, announce) {
    const normalized = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", normalized);
    try { localStorage.setItem("opikpixel_theme", normalized); } catch (_) {}

    const icon = document.getElementById("theme-toggle-icon");
    const label = document.getElementById("theme-toggle-label");
    if (icon) {
      icon.className = normalized === "dark" ? "ph-bold ph-moon-stars text-base" : "ph-bold ph-sun text-base";
      icon.style.color = normalized === "dark" ? "var(--brand-cyan)" : "var(--brand-ember)";
    }
    if (label) {
      label.textContent = normalized === "dark" ? "DARK" : "LIGHT";
    }

    window.dispatchEvent(new CustomEvent("kingfisher:theme", { detail: { theme: normalized } }));
    if (announce) {
      showToast(normalized === "light" ? "Mode Light (Crystal Stream) aktif" : "Mode Dark (Deep River) aktif");
    }
  }

  function initThemeAndCalmControls() {
    applyTheme(getCurrentTheme(), false);

    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        applyTheme(getCurrentTheme() === "dark" ? "light" : "dark", true);
        if (typeof window.playTacticalSfx === "function") window.playTacticalSfx("tap");
      });
    }

    // Calm / Motion Focus Toggle
    const calmBtn = document.getElementById("calm-toggle-btn");
    const calmIcon = document.getElementById("calm-toggle-icon");
    let isCalm = false;
    try { isCalm = localStorage.getItem("opikpixel_calm") === "1"; } catch (_) {}

    function setCalmState(active, notify) {
      isCalm = active;
      window.__orixMotion.calm = active;
      document.body.classList.toggle("calm-mode", active);
      try { localStorage.setItem("opikpixel_calm", active ? "1" : "0"); } catch (_) {}
      if (calmBtn) calmBtn.setAttribute("aria-pressed", String(active));
      if (calmIcon) {
        calmIcon.className = active ? "ph-bold ph-eye text-sm" : "ph-bold ph-sparkle text-sm";
        calmIcon.style.color = active ? "var(--brand-ember)" : "var(--brand-cyan)";
      }
      if (notify) {
        showToast(active ? "Mode Fokus Bersih: partikel 3D dijeda" : "Efek atmosfer 3D diaktifkan");
      }
    }

    setCalmState(isCalm, false);
    if (calmBtn) {
      calmBtn.addEventListener("click", () => setCalmState(!isCalm, true));
    }

    window.toggleKingfisherTheme = () => applyTheme(getCurrentTheme() === "dark" ? "light" : "dark", true);
    window.toggleCalmMode = () => setCalmState(!isCalm, true);

    // Keyboard shortcut 'T' to switch theme when not typing in an input
    window.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select" || (e.target && e.target.isContentEditable)) return;
      if (e.key === "t" || e.key === "T") {
        applyTheme(getCurrentTheme() === "dark" ? "light" : "dark", true);
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. DETAIL LIGHTBOX MODAL & MOBILE DRAWER
     ------------------------------------------------------------------------ */
  const detailModal = document.getElementById("detail-modal");
  function openDetailModal(payload) {
    if (!detailModal) return;
    const mediaWrap = document.getElementById("detail-modal-media");
    const imgEl = document.getElementById("detail-modal-img");
    const badgeEl = document.getElementById("detail-modal-badge");
    const titleEl = document.getElementById("detail-modal-title");
    const metaEl = document.getElementById("detail-modal-meta");
    const descEl = document.getElementById("detail-modal-desc");
    const tagsEl = document.getElementById("detail-modal-tags");
    const actionsEl = document.getElementById("detail-modal-actions");

    if (payload.img && mediaWrap && imgEl) {
      mediaWrap.classList.remove("hidden");
      imgEl.src = payload.img;
      imgEl.alt = payload.title || "";
      imgEl.onerror = () => {
        if (payload.fallback && imgEl.src !== payload.fallback) imgEl.src = payload.fallback;
      };
    } else if (mediaWrap) {
      mediaWrap.classList.add("hidden");
    }

    if (badgeEl) badgeEl.textContent = payload.badge || "DETAIL";
    if (titleEl) titleEl.textContent = payload.title || "";
    if (metaEl) metaEl.textContent = payload.meta || "";
    if (descEl) descEl.textContent = payload.description || "";

    if (tagsEl) {
      const tags = Array.isArray(payload.tags) ? payload.tags : [];
      tagsEl.innerHTML = tags.map((t) => `<span class="kf-tag">${escapeHtml(t)}</span>`).join("");
    }

    if (actionsEl) {
      actionsEl.innerHTML = payload.url
        ? `<a href="${escapeHtml(payload.url)}" target="_blank" rel="noopener noreferrer" class="btn-primary py-2 px-4 text-xs">
             <span>Buka Tautan / Repositori</span>
             <i class="ph-bold ph-arrow-up-right"></i>
           </a>`
        : "";
    }

    detailModal.classList.add("is-open");
    detailModal.setAttribute("aria-hidden", "false");
  }

  function closeDetailModal() {
    if (!detailModal) return;
    detailModal.classList.remove("is-open");
    detailModal.setAttribute("aria-hidden", "true");
  }

  function initModalsAndDrawer() {
    const closeBtn = document.getElementById("detail-modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeDetailModal);
    if (detailModal) {
      detailModal.addEventListener("click", (e) => {
        if (e.target === detailModal) closeDetailModal();
      });
    }

    // Mobile drawer
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const mobileDrawer = document.getElementById("mobile-drawer");
    const mobileClose = document.getElementById("mobile-drawer-close");

    function setDrawer(open) {
      if (!mobileDrawer || !mobileBtn) return;
      mobileDrawer.classList.toggle("is-open", open);
      mobileDrawer.setAttribute("aria-hidden", String(!open));
      mobileBtn.setAttribute("aria-expanded", String(open));
    }

    if (mobileBtn) mobileBtn.addEventListener("click", () => setDrawer(true));
    if (mobileClose) mobileClose.addEventListener("click", () => setDrawer(false));
    if (mobileDrawer) {
      mobileDrawer.addEventListener("click", (e) => {
        if (e.target === mobileDrawer) setDrawer(false);
      });
      mobileDrawer.querySelectorAll("a[href^='#']").forEach((a) => {
        a.addEventListener("click", () => setDrawer(false));
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeDetailModal();
        setDrawer(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. TYPEWRITER, METRICS & INFINITE HIGHLIGHT CAROUSEL
     ------------------------------------------------------------------------ */
  function initHeroAndCarousel() {
    // Synced stat counters
    const s = DATA.stats || {};
    const elTotal = document.getElementById("stat-total-records");
    const elProj = document.getElementById("stat-total-projects");
    const elAward = document.getElementById("stat-total-awards");
    const elLead = document.getElementById("stat-total-leadership");
    if (elTotal) elTotal.textContent = String(s.totalRecords || 88);
    if (elProj) elProj.textContent = `${s.totalProjects || 14}+`;
    if (elAward) elAward.textContent = String(s.totalAwards || 15);
    if (elLead) elLead.textContent = String((s.totalOrganizations || 11) + (s.totalCommittees || 34));

    // Typewriter
    const roles = (DATA.meta && DATA.meta.roles) || ["Tactical Builder", "IT Product Manager", "AI/ML & Cloud Technologist"];
    const roleEl = document.getElementById("role-text");
    let rIdx = 0;
    let cIdx = 0;
    let deleting = false;

    function tickRole() {
      if (!roleEl) return;
      const word = roles[rIdx];
      cIdx = deleting ? cIdx - 1 : cIdx + 1;
      roleEl.textContent = word.substring(0, cIdx);

      if (!deleting && cIdx === word.length) {
        deleting = true;
        setTimeout(tickRole, 1800);
        return;
      }
      if (deleting && cIdx === 0) {
        deleting = false;
        rIdx = (rIdx + 1) % roles.length;
        setTimeout(tickRole, 280);
        return;
      }
      setTimeout(tickRole, deleting ? 36 : 70);
    }
    tickRole();

    // Infinite Highlight Carousel (curated diverse highlights including synced #22 AI Agent)
    const carouselTrack = document.getElementById("recap-carousel-track");
    if (carouselTrack && Array.isArray(DATA.highlights)) {
      const featuredNos = [22, 1, 4, 9, 13, 2, 19];
      const picks = featuredNos
        .map((n) => DATA.highlights.find((h) => h.no === n))
        .filter(Boolean);

      const renderCard = (item, isClone) => `
        <article
          data-highlight-no="${item.no}"
          ${isClone ? 'aria-hidden="true"' : ""}
          class="carousel-highlight-card w-64 rounded-2xl p-3 kf-surface kf-surface-interactive spotlight-card flex flex-col shrink-0 cursor-pointer group"
        >
          <div class="relative w-full h-36 rounded-xl overflow-hidden bg-[#0A253D] mb-2.5">
            <img
              src="${escapeHtml(item.img)}"
              alt="${isClone ? "" : escapeHtml(item.title)}"
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onerror="this.onerror=null;this.src='${escapeHtml(item.fallback)}';"
            />
            <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#041524]/82 text-[#F97316] border border-[#F97316]/40">
              ${escapeHtml(item.badge)}
            </span>
          </div>
          <h3 class="text-xs font-display font-bold line-clamp-1">${escapeHtml(item.title)}</h3>
          <p class="text-[11px] line-clamp-2 mt-1" style="color: var(--text-secondary);">${escapeHtml(item.story)}</p>
        </article>
      `;

      carouselTrack.innerHTML =
        picks.map((p) => renderCard(p, false)).join("") +
        picks.map((p) => renderCard(p, true)).join("");

      carouselTrack.querySelectorAll(".carousel-highlight-card").forEach((card) => {
        card.addEventListener("click", () => {
          const no = Number(card.dataset.highlightNo);
          const item = DATA.highlights.find((h) => h.no === no);
          if (!item) return;
          openDetailModal({
            badge: item.badge,
            title: item.title,
            meta: `Kategori: ${item.categoryLabel}`,
            description: item.story,
            img: item.img,
            fallback: item.fallback,
            tags: [item.categoryLabel, `Arsip #${item.no}`]
          });
        });
      });
    }

    const toggleBtn = document.getElementById("carousel-toggle-btn");
    const toggleIcon = document.getElementById("carousel-toggle-icon");
    const toggleText = document.getElementById("carousel-toggle-text");
    let paused = false;
    if (toggleBtn && carouselTrack) {
      toggleBtn.addEventListener("click", () => {
        paused = !paused;
        carouselTrack.classList.toggle("is-paused", paused);
        if (toggleIcon) toggleIcon.className = paused ? "ph-bold ph-play" : "ph-bold ph-pause";
        if (toggleText) toggleText.textContent = paused ? "Play" : "Pause";
      });
    }
  }

  /* ------------------------------------------------------------------------
     4. INTERACTIVE BRAND PALETTE & ORIX KINGFISHER STUDIO v4.0
     ------------------------------------------------------------------------ */
  function initBrandAndOrix() {
    // Brand Swatches Inspector
    const swatchGrid = document.getElementById("brand-palette-swatches");
    const previewLabel = document.getElementById("palette-preview-label");
    if (swatchGrid && Array.isArray(DATA.brandPalette)) {
      swatchGrid.innerHTML = DATA.brandPalette.map((tok) => `
        <button
          type="button"
          data-hex="${escapeHtml(tok.hex)}"
          data-name="${escapeHtml(tok.name)}"
          data-role="${escapeHtml(tok.role)}"
          class="group flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition cursor-pointer hover:-translate-y-0.5"
          style="background: var(--bg-surface); border: 1px solid var(--border-subtle);"
          title="${escapeHtml(tok.name)} (${escapeHtml(tok.hex)}) — Klik untuk salin"
        >
          <span class="w-full h-7 rounded-lg border border-black/15 shadow-inner" style="background-color: ${escapeHtml(tok.hex)};"></span>
          <span class="text-[9px] font-mono font-semibold tracking-tight hidden sm:block" style="color: var(--text-secondary);">${escapeHtml(tok.hex)}</span>
        </button>
      `).join("");

      swatchGrid.querySelectorAll("button[data-hex]").forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          if (previewLabel) previewLabel.textContent = `${btn.dataset.name} • ${btn.dataset.hex}`;
        });
        btn.addEventListener("mouseleave", () => {
          if (previewLabel) previewLabel.textContent = "7 Official Tokens";
        });
        btn.addEventListener("click", () => {
          copyToClipboard(btn.dataset.hex, `Warna ${btn.dataset.name} (${btn.dataset.hex}) disalin`);
        });
      });
    }

    // Orix Interactive Rig
    const orixStage = document.getElementById("orix-stage");
    const orixContainer = document.getElementById("orix-container");
    const orixRigWrapper = document.getElementById("orix-rig-wrapper");
    const orixSvg = document.getElementById("orix-svg");
    const orixHeadGroup = document.getElementById("orix-head-group");
    const orixEyePupil = document.getElementById("orix-eye-pupil");
    const orixServoSlot = document.getElementById("orix-servo-slot");
    const orixReticle = document.getElementById("orix-target-reticle");
    const renderLayer = document.getElementById("orix-3d-render-layer");
    const logoLayer = document.getElementById("orix-logo-layer");
    const telemetryStatus = document.getElementById("orix-telemetry-status");

    const btnStrike = document.getElementById("orix-btn-strike");
    const btnOverdrive = document.getElementById("orix-btn-overdrive");
    const btnScan = document.getElementById("orix-btn-scan");
    const heroOrixBadge = document.getElementById("hero-orix-badge");
    const viewTabs = document.querySelectorAll(".orix-view-tab");

    if (!orixStage || !orixSvg) return;

    let isStriking = false;
    let isOverdrive = false;
    let isScanning = false;
    let activeView = "vector";

    function setTelemetry(text, hex) {
      if (!telemetryStatus) return;
      const color = hex || "#06B6D4";
      telemetryStatus.innerHTML = `
        <span class="h-2 w-2 rounded-full" style="background:${color};"></span>
        <span style="color:${color};">${escapeHtml(text)}</span>
      `;
    }

    function setOrixView(view) {
      activeView = view;
      viewTabs.forEach((t) => {
        const active = t.dataset.orixView === view;
        t.className = active
          ? "orix-view-tab py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold bg-[#0284C7]/25 text-[#F8FAFC] border border-[#06B6D4]/40 cursor-pointer transition"
          : "orix-view-tab py-1.5 px-2 rounded-lg text-[11px] font-mono text-[#CBD5E1] hover:text-[#F8FAFC] cursor-pointer transition";
      });

      if (orixRigWrapper) orixRigWrapper.style.opacity = view === "vector" ? "1" : "0";
      if (renderLayer) renderLayer.style.opacity = view === "render" ? "1" : "0";
      if (logoLayer) logoLayer.style.opacity = view === "logo" ? "1" : "0";

      if (view === "render") setTelemetry("VIEW // 3D CYCLES RENDER", "#F97316");
      else if (view === "logo") setTelemetry("VIEW // GEOMETRIC BRAND MARK", "#06B6D4");
      else setTelemetry("VEC // 45° FLIGHT ACTIVE", "#06B6D4");
    }

    viewTabs.forEach((tab) => {
      tab.addEventListener("click", () => setOrixView(tab.dataset.orixView));
    });

    function triggerStrikeDive() {
      if (isStriking) return;
      if (activeView !== "vector") setOrixView("vector");
      isStriking = true;
      orixStage.classList.remove("is-striking");
      void orixStage.offsetWidth;
      orixStage.classList.add("is-striking");
      setTelemetry("STRIKE // 45° TARGET LOCKED!", "#F97316");

      if (typeof window.triggerWebGLStrike === "function") window.triggerWebGLStrike();
      if (typeof window.playTacticalSfx === "function") window.playTacticalSfx("strike");

      setTimeout(() => {
        orixStage.classList.remove("is-striking");
        isStriking = false;
        if (isOverdrive) setTelemetry("OVERDRIVE // TURBO WING", "#F97316");
        else if (isScanning) setTelemetry("RADAR // HUD TARGET SCAN", "#06B6D4");
        else setTelemetry("VEC // 45° FLIGHT ACTIVE", "#06B6D4");
      }, 880);
    }

    window.triggerOrixStrike = triggerStrikeDive;

    if (orixContainer) {
      orixContainer.addEventListener("click", triggerStrikeDive);
      orixContainer.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerStrikeDive();
        }
      });
    }
    if (btnStrike) btnStrike.addEventListener("click", triggerStrikeDive);
    if (heroOrixBadge) {
      heroOrixBadge.addEventListener("click", () => {
        scrollToSection("#about");
        setTimeout(triggerStrikeDive, 450);
      });
    }

    if (btnOverdrive) {
      btnOverdrive.addEventListener("click", () => {
        if (activeView !== "vector") setOrixView("vector");
        isOverdrive = !isOverdrive;
        orixStage.classList.toggle("is-overdrive", isOverdrive);
        btnOverdrive.setAttribute("aria-pressed", String(isOverdrive));
        btnOverdrive.style.borderColor = isOverdrive ? "#F97316" : "";
        btnOverdrive.style.color = isOverdrive ? "#F97316" : "";
        setTelemetry(isOverdrive ? "OVERDRIVE // TURBO WING" : "VEC // 45° FLIGHT ACTIVE", isOverdrive ? "#F97316" : "#06B6D4");
      });
    }

    if (btnScan) {
      btnScan.addEventListener("click", () => {
        if (activeView !== "vector") setOrixView("vector");
        isScanning = !isScanning;
        orixStage.classList.toggle("is-scanning", isScanning);
        btnScan.setAttribute("aria-pressed", String(isScanning));
        btnScan.style.borderColor = isScanning ? "#06B6D4" : "";
        btnScan.style.color = isScanning ? "#06B6D4" : "";
        setTelemetry(isScanning ? "RADAR // HUD TARGET SCAN" : "VEC // 45° FLIGHT ACTIVE", "#06B6D4");
      });
    }

    // 3D Cursor Tracking for Orix Rig
    window.addEventListener("mousemove", (e) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = orixStage.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;

      const normX = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));

      orixSvg.style.transform = `rotateY(${normX * 12}deg) rotateX(${-normY * 10}deg)`;
      if (orixHeadGroup) {
        orixHeadGroup.style.transform = `rotate(${normX * -4 + normY * 3}deg) translate3d(${normX * 2}px, ${normY * 2}px, 0)`;
      }
      if (orixEyePupil) {
        orixEyePupil.style.transform = `translate3d(${normX * 3}px, ${normY * 2.5}px, 0)`;
      }
      if (orixServoSlot && !isOverdrive) {
        orixServoSlot.style.transform = `rotate(${(normX + normY) * 40}deg)`;
      }
      if (orixReticle && orixContainer) {
        const cRect = orixContainer.getBoundingClientRect();
        if (e.clientX >= cRect.left && e.clientX <= cRect.right && e.clientY >= cRect.top && e.clientY <= cRect.bottom) {
          orixReticle.style.left = `${e.clientX - cRect.left}px`;
          orixReticle.style.top = `${e.clientY - cRect.top}px`;
        }
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     5. TECHNICAL PROJECTS BENTO & LIVE GITHUB API WIDGET
     ------------------------------------------------------------------------ */
  function initProjectsAndGitHub() {
    const grid = document.getElementById("projects-grid");
    const filterBtns = document.querySelectorAll(".project-filter-btn");
    const projects = Array.isArray(DATA.featuredProjects) ? DATA.featuredProjects : [];

    function renderProjects(domain) {
      if (!grid) return;
      const list = domain === "all" ? projects : projects.filter((p) => p.domain === domain);
      grid.innerHTML = list.map((proj) => `
        <article class="kf-surface kf-surface-interactive spotlight-card p-5 flex flex-col justify-between gap-4">
          <div class="space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="kf-badge ${proj.featured ? "kf-badge-ember" : ""}">${escapeHtml(proj.domainLabel)}</span>
              <span class="text-xs font-mono" style="color: var(--text-muted);">${escapeHtml(proj.year)}</span>
            </div>
            <h3 class="text-base sm:text-lg font-display font-bold leading-snug">${escapeHtml(proj.title)}</h3>
            <p class="text-xs font-mono" style="color: var(--brand-cyan);">${escapeHtml(proj.role)}</p>
            <p class="text-xs sm:text-sm leading-relaxed" style="color: var(--text-secondary);">${escapeHtml(proj.summary)}</p>
          </div>

          <div class="space-y-3 pt-2" style="border-top: 1px solid var(--border-subtle);">
            <div class="flex flex-wrap gap-1.5">
              ${(proj.stack || []).map((st) => `<span class="kf-tag">${escapeHtml(st)}</span>`).join("")}
            </div>
            <div class="flex items-center justify-between">
              <button
                type="button"
                data-proj-id="${escapeHtml(proj.id)}"
                class="proj-detail-btn text-xs font-semibold hover:underline cursor-pointer"
                style="color: var(--text-primary);"
              >
                Detail Arsitektur →
              </button>
              ${proj.repoUrl ? `
                <a
                  href="${escapeHtml(proj.repoUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-xs font-mono font-semibold hover:underline"
                  style="color: var(--brand-cyan);"
                >
                  <i class="ph-bold ph-github-logo"></i>
                  <span>Repo</span>
                  <i class="ph-bold ph-arrow-up-right text-[11px]"></i>
                </a>
              ` : `<span class="text-[11px] font-mono" style="color: var(--text-muted);">Academic / Internal</span>`}
            </div>
          </div>
        </article>
      `).join("");

      attachSpotlight(grid);
      grid.querySelectorAll(".proj-detail-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const proj = projects.find((p) => p.id === btn.dataset.projId);
          if (!proj) return;
          openDetailModal({
            badge: proj.domainLabel,
            title: proj.title,
            meta: `${proj.role} • ${proj.year}`,
            description: proj.summary,
            tags: proj.stack,
            url: proj.repoUrl
          });
        });
      });
    }

    renderProjects("all");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        renderProjects(btn.dataset.domain);
      });
    });

    // Live GitHub Ecosystem Telemetry Widget
    const ghStrip = document.getElementById("gh-repos-strip");
    const ghBadge = document.getElementById("gh-sync-badge");
    const ghRefreshBtn = document.getElementById("gh-refresh-btn");
    const ghRefreshIcon = document.getElementById("gh-refresh-icon");

    const fallbackRepos = [
      { name: "Play-Interactive", language: "JavaScript", description: "Eksplorasi antarmuka web interaktif & micro-experiences", html_url: "https://github.com/opikpixel/Play-Interactive", updated_at: "2026-11-25" },
      { name: "Tools-Kropik", language: "HTML / JS", description: "Generate Code QR, convert PDF, Text Generator, Edit Image", html_url: "https://github.com/opikpixel/Tools-Kropik", updated_at: "2026-11-25" },
      { name: "Silsilah-Keluarga", language: "JavaScript", description: "Aplikasi visualisasi silsilah keluarga interaktif", html_url: "https://github.com/opikpixel/Silsilah-Keluarga", updated_at: "2026-11-25" },
      { name: "AI-Academic-Advisor-at-Informatics-Engineering-", language: "Python / AI", description: "AI Agent Academic Advisor bagi mahasiswa Teknik Informatika", html_url: "https://github.com/opikpixel/AI-Academic-Advisor-at-Informatics-Engineering-", updated_at: "2026-10-11" }
    ];

    function renderGhRepos(repos, sourceLabel) {
      if (!ghStrip) return;
      if (ghBadge) ghBadge.textContent = sourceLabel;
      ghStrip.innerHTML = repos.slice(0, 4).map((r) => {
        const dateStr = r.updated_at ? String(r.updated_at).slice(0, 10) : "2026";
        return `
          <a
            href="${escapeHtml(r.html_url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="kf-subcard p-3.5 flex flex-col justify-between gap-2.5 no-underline group"
          >
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-1.5">
                <span class="text-xs font-mono font-bold truncate group-hover:underline" style="color: var(--text-primary);">${escapeHtml(r.name)}</span>
                <i class="ph-bold ph-arrow-up-right text-xs shrink-0" style="color: var(--brand-cyan);"></i>
              </div>
              <p class="text-[11px] line-clamp-2 leading-relaxed" style="color: var(--text-secondary);">
                ${escapeHtml(r.description || "Repositori publik di ekosistem @opikpixel")}
              </p>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono pt-1" style="color: var(--text-muted);">
              <span style="color: var(--brand-ember);">${escapeHtml(r.language || "Web / Code")}</span>
              <span>${escapeHtml(dateStr)}</span>
            </div>
          </a>
        `;
      }).join("");
    }

    async function syncGitHubRepos(forceNetwork) {
      const CACHE_KEY = "opikpixel_gh_repos_v4";
      if (!forceNetwork) {
        try {
          const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
          if (cached && Date.now() - cached.ts < 600000 && Array.isArray(cached.data)) {
            renderGhRepos(cached.data, "SYNCED API");
            return;
          }
        } catch (_) {}
      }

      renderGhRepos(fallbackRepos, "VERIFIED");
      try {
        if (ghRefreshIcon) ghRefreshIcon.classList.add("animate-spin");
        const res = await fetch("https://api.github.com/users/opikpixel/repos?sort=updated&per_page=8", {
          headers: { Accept: "application/vnd.github+json" }
        });
        if (!res.ok) throw new Error("GitHub API status " + res.status);
        const repos = await res.json();
        const filtered = repos.filter((r) => !r.fork && r.name !== "opikpixel");
        if (filtered.length) {
          renderGhRepos(filtered, `LIVE • ${repos.length}+ REPOS`);
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: filtered })); } catch (_) {}
          if (forceNetwork) showToast("Data repositori GitHub berhasil diperbarui");
        }
      } catch (_) {
        renderGhRepos(fallbackRepos, "CACHED SNAPSHOT");
      } finally {
        if (ghRefreshIcon) ghRefreshIcon.classList.remove("animate-spin");
      }
    }

    syncGitHubRepos(false);
    if (ghRefreshBtn) {
      ghRefreshBtn.addEventListener("click", () => syncGitHubRepos(true));
    }
  }

  /* ------------------------------------------------------------------------
     6. DUAL-MODE TRACK RECORD EXPLORER (22 VISUAL + 88 MASTER CV RECORDS)
     ------------------------------------------------------------------------ */
  function initTrackRecordExplorer() {
    const modeVisualBtn = document.getElementById("mode-visual-btn");
    const modeCvBtn = document.getElementById("mode-cvdb-btn");
    const visualPanel = document.getElementById("visual-archive-panel");
    const cvPanel = document.getElementById("cv-database-panel");

    function switchArchiveMode(mode) {
      const isVisual = mode === "visual";
      if (visualPanel) visualPanel.classList.toggle("hidden", !isVisual);
      if (cvPanel) cvPanel.classList.toggle("hidden", isVisual);

      if (modeVisualBtn && modeCvBtn) {
        modeVisualBtn.setAttribute("aria-selected", String(isVisual));
        modeCvBtn.setAttribute("aria-selected", String(!isVisual));
        modeVisualBtn.style.background = isVisual ? "#F97316" : "transparent";
        modeVisualBtn.style.color = isVisual ? "#FFFFFF" : "var(--text-secondary)";
        modeCvBtn.style.background = !isVisual ? "#F97316" : "transparent";
        modeCvBtn.style.color = !isVisual ? "#FFFFFF" : "var(--text-secondary)";
      }
    }

    window.openMasterCvDatabase = (groupFilter) => {
      switchArchiveMode("cv");
      if (groupFilter) setCvGroupFilter(groupFilter);
      scrollToSection("#dokumentasi");
    };

    if (modeVisualBtn) modeVisualBtn.addEventListener("click", () => switchArchiveMode("visual"));
    if (modeCvBtn) modeCvBtn.addEventListener("click", () => switchArchiveMode("cv"));

    // --- PART A: 22 VISUAL HIGHLIGHTS ---
    const highlights = Array.isArray(DATA.highlights) ? DATA.highlights : [];
    const galleryGrid = document.getElementById("gallery-grid");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const seeMoreBtn = document.getElementById("gallery-see-more-btn");
    const seeMoreText = document.getElementById("gallery-see-more-text");
    const countBadge = document.getElementById("gallery-count-badge");
    const allLoaded = document.getElementById("gallery-all-loaded");
    const loadContainer = document.getElementById("gallery-load-more-container");
    const collapseBtn = document.getElementById("gallery-collapse-btn");

    const INITIAL_ITEMS = 6;
    const STEP_ITEMS = 9;
    let currentCat = "semua";
    let visibleCount = INITIAL_ITEMS;

    function getFilteredHighlights(cat) {
      if (cat === "semua") return highlights;
      return highlights.filter((h) => h.category === cat);
    }

    function createVisualCard(item) {
      return `
        <article
          data-highlight-no="${item.no}"
          class="archive-card kf-surface kf-surface-interactive spotlight-card relative overflow-hidden group cursor-pointer select-none flex flex-col justify-between"
          tabindex="0"
          aria-label="${escapeHtml(item.title)}"
        >
          <div class="hold-progress-bar"></div>
          <div class="relative w-full h-52 bg-[#0A253D] overflow-hidden">
            <img
              src="${escapeHtml(item.img)}"
              alt="${escapeHtml(item.title)}"
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onerror="this.onerror=null;this.src='${escapeHtml(item.fallback)}';"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#041524]/80 via-transparent to-transparent"></div>
            <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#041524]/85 text-[#F97316] border border-[#F97316]/40">
              NO // ${item.no < 10 ? "0" + item.no : item.no}
            </span>
            <span class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#041524]/80 text-[#F8FAFC] border border-[#06B6D4]/35">
              Detail ↗
            </span>

            <!-- Hold-to-Peek Story Overlay -->
            <div class="peek-overlay absolute inset-0 bg-[#041524]/92 backdrop-blur-md p-5 flex flex-col justify-center items-center text-center opacity-0 pointer-events-none transition-opacity duration-200">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F97316]/20 text-[#F97316] mb-2">${escapeHtml(item.badge)}</span>
              <p class="text-xs text-[#F8FAFC] leading-relaxed">"${escapeHtml(item.story)}"</p>
            </div>
          </div>

          <div class="p-4 flex flex-col gap-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="kf-badge text-[10px]">${escapeHtml(item.categoryLabel)}</span>
              ${item.isLocalPhoto ? `<span class="text-[10px] font-mono" style="color: var(--brand-cyan);">Foto Asli</span>` : ""}
            </div>
            <h3 class="text-sm sm:text-base font-display font-bold leading-snug line-clamp-2">${escapeHtml(item.title)}</h3>
          </div>
        </article>
      `;
    }

    function wireVisualCards() {
      if (!galleryGrid) return;
      attachSpotlight(galleryGrid);
      galleryGrid.querySelectorAll(".archive-card").forEach((card) => {
        if (card.dataset.wired === "1") return;
        card.dataset.wired = "1";
        const peek = card.querySelector(".peek-overlay");
        let holdTimer = null;
        let held = false;

        const startHold = () => {
          held = false;
          card.classList.add("is-pressing");
          holdTimer = setTimeout(() => {
            held = true;
            if (peek) peek.classList.remove("opacity-0");
          }, 240);
        };

        const endHold = () => {
          clearTimeout(holdTimer);
          card.classList.remove("is-pressing");
          if (peek) peek.classList.add("opacity-0");
        };

        card.addEventListener("mousedown", startHold);
        card.addEventListener("mouseup", endHold);
        card.addEventListener("mouseleave", endHold);
        card.addEventListener("touchstart", startHold, { passive: true });
        card.addEventListener("touchend", endHold);

        card.addEventListener("click", () => {
          if (held) { held = false; return; }
          const no = Number(card.dataset.highlightNo);
          const item = highlights.find((h) => h.no === no);
          if (!item) return;
          openDetailModal({
            badge: item.badge,
            title: item.title,
            meta: `Kategori: ${item.categoryLabel} • Arsip #${item.no}`,
            description: item.story,
            img: item.img,
            fallback: item.fallback,
            tags: [item.categoryLabel, item.isLocalPhoto ? "Dokumentasi Lapangan" : "Highlight Portofolio"]
          });
        });

        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            card.click();
          }
        });
      });
    }

    function renderVisualGallery() {
      if (!galleryGrid) return;
      const all = getFilteredHighlights(currentCat);
      const shown = all.slice(0, visibleCount);
      galleryGrid.innerHTML = shown.map(createVisualCard).join("");
      wireVisualCards();

      if (loadContainer) {
        if (all.length <= INITIAL_ITEMS) {
          loadContainer.classList.add("hidden");
        } else {
          loadContainer.classList.remove("hidden");
          if (visibleCount >= all.length) {
            if (seeMoreBtn) seeMoreBtn.classList.add("hidden");
            if (allLoaded) allLoaded.classList.remove("hidden");
          } else {
            if (seeMoreBtn) seeMoreBtn.classList.remove("hidden");
            if (allLoaded) allLoaded.classList.add("hidden");
            const nextStep = Math.min(STEP_ITEMS, all.length - visibleCount);
            if (seeMoreText) seeMoreText.textContent = `Muat Berikutnya (+${nextStep} Kegiatan)`;
            if (countBadge) countBadge.textContent = `${visibleCount} / ${all.length}`;
          }
        }
      }
    }

    renderVisualGallery();

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabBtns.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        currentCat = btn.dataset.cat;
        visibleCount = INITIAL_ITEMS;
        renderVisualGallery();
      });
    });

    if (seeMoreBtn) {
      seeMoreBtn.addEventListener("click", () => {
        visibleCount += STEP_ITEMS;
        renderVisualGallery();
      });
    }
    if (collapseBtn) {
      collapseBtn.addEventListener("click", () => {
        visibleCount = INITIAL_ITEMS;
        renderVisualGallery();
        scrollToSection("#dokumentasi");
      });
    }

    // --- PART B: 88 VERIFIED MASTER CV RECORDS ---
    const cvRecords = Array.isArray(DATA.cvRecords) ? DATA.cvRecords : [];
    const cvGrid = document.getElementById("cv-records-grid");
    const cvSearch = document.getElementById("cv-search-input");
    const cvYear = document.getElementById("cv-year-select");
    const cvGroupBtns = document.querySelectorAll(".cv-group-btn");
    const cvSummary = document.getElementById("cv-results-summary");
    const cvMoreWrap = document.getElementById("cv-load-more-wrap");
    const cvMoreBtn = document.getElementById("cv-load-more-btn");

    let activeCvGroup = "all";
    let cvLimit = 12;

    const groupBadgeStyle = {
      award: "kf-badge-ember",
      project: "",
      organization: "kf-badge-azure",
      committee: "",
      certification: "kf-badge-azure",
      venture: "kf-badge-ember"
    };

    function getFilteredCvRecords() {
      const q = (cvSearch ? cvSearch.value : "").trim().toLowerCase();
      const yr = cvYear ? cvYear.value : "all";

      return cvRecords.filter((rec) => {
        if (activeCvGroup !== "all" && rec.group !== activeCvGroup) return false;
        if (yr !== "all") {
          if (yr === "older") {
            if (rec.sortYear > 2022) return false;
          } else if (String(rec.sortYear) !== yr && !String(rec.period).includes(yr)) {
            return false;
          }
        }
        if (!q) return true;
        const hay = `${rec.title} ${rec.role} ${rec.organization} ${rec.location} ${rec.description} ${(rec.skills || []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }

    function renderCvDatabase() {
      if (!cvGrid) return;
      const filtered = getFilteredCvRecords();
      const slice = filtered.slice(0, cvLimit);

      if (cvSummary) {
        cvSummary.textContent = `Menampilkan ${slice.length} dari ${filtered.length} rekam jejak terverifikasi`;
      }

      if (!slice.length) {
        cvGrid.innerHTML = `
          <div class="md:col-span-2 kf-subcard p-8 text-center space-y-2">
            <i class="ph-bold ph-magnifying-glass text-2xl" style="color: var(--brand-cyan);"></i>
            <p class="text-sm font-semibold" style="color: var(--text-primary);">Tidak ada rekam jejak yang cocok dengan filter pencarian.</p>
            <p class="text-xs" style="color: var(--text-muted);">Coba kata kunci lain atau pilih kategori "Semua (88)".</p>
          </div>
        `;
      } else {
        cvGrid.innerHTML = slice.map((rec) => `
          <article
            data-cv-id="${rec.id}"
            class="cv-record-card kf-surface kf-surface-interactive spotlight-card p-5 flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="kf-badge ${groupBadgeStyle[rec.group] || ""}">${escapeHtml(rec.groupLabel)}</span>
                <span class="text-xs font-mono" style="color: var(--text-muted);">${escapeHtml(rec.period)}</span>
              </div>
              <h3 class="text-sm sm:text-base font-display font-bold leading-snug">${escapeHtml(rec.title)}</h3>
              <p class="text-xs font-mono" style="color: var(--brand-cyan);">
                ${escapeHtml(rec.role)} • ${escapeHtml(rec.organization)}
              </p>
              <p class="text-xs leading-relaxed line-clamp-2" style="color: var(--text-secondary);">
                ${escapeHtml(rec.description)}
              </p>
            </div>
            ${(rec.skills && rec.skills.length) ? `
              <div class="flex flex-wrap gap-1.5 pt-2" style="border-top: 1px solid var(--border-subtle);">
                ${rec.skills.slice(0, 4).map((sk) => `<span class="kf-tag">${escapeHtml(sk)}</span>`).join("")}
              </div>
            ` : ""}
          </article>
        `).join("");
      }

      attachSpotlight(cvGrid);
      cvGrid.querySelectorAll(".cv-record-card").forEach((card) => {
        card.addEventListener("click", () => {
          const rec = cvRecords.find((r) => r.id === Number(card.dataset.cvId));
          if (!rec) return;
          openDetailModal({
            badge: rec.groupLabel,
            title: rec.title,
            meta: `${rec.role} • ${rec.organization} (${rec.location}) • ${rec.period}`,
            description: rec.description,
            tags: rec.skills,
            url: rec.url
          });
        });
      });

      if (cvMoreWrap) {
        cvMoreWrap.classList.toggle("hidden", slice.length >= filtered.length);
      }
    }

    function setCvGroupFilter(group) {
      activeCvGroup = group;
      cvLimit = 12;
      cvGroupBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.cvgroup === group));
      renderCvDatabase();
    }

    cvGroupBtns.forEach((btn) => {
      btn.addEventListener("click", () => setCvGroupFilter(btn.dataset.cvgroup));
    });
    if (cvSearch) {
      cvSearch.addEventListener("input", () => {
        cvLimit = 12;
        renderCvDatabase();
      });
    }
    if (cvYear) {
      cvYear.addEventListener("change", () => {
        cvLimit = 12;
        renderCvDatabase();
      });
    }
    if (cvMoreBtn) {
      cvMoreBtn.addEventListener("click", () => {
        cvLimit += 16;
        renderCvDatabase();
      });
    }

    renderCvDatabase();
  }

  /* ------------------------------------------------------------------------
     7. WORKSTATION INSPECTOR & COLLABORATION BRIEF WIDGET
     ------------------------------------------------------------------------ */
  function initWorkstationAndBrief() {
    const wsTabs = document.getElementById("workstation-tabs");
    const wsContent = document.getElementById("workstation-content");
    const items = Array.isArray(DATA.workstation) ? DATA.workstation : [];

    function renderWorkstation(id) {
      const current = items.find((w) => w.id === id) || items[0];
      if (!current || !wsContent) return;

      if (wsTabs) {
        wsTabs.innerHTML = items.map((w) => `
          <button
            type="button"
            data-ws-id="${escapeHtml(w.id)}"
            class="ws-tab-btn filter-chip py-1 px-2.5 text-[11px] ${w.id === current.id ? "is-active" : ""}"
          >
            ${escapeHtml(w.title.split(" ")[0])}
          </button>
        `).join("");
        wsTabs.querySelectorAll(".ws-tab-btn").forEach((btn) => {
          btn.addEventListener("click", () => renderWorkstation(btn.dataset.wsId));
        });
      }

      wsContent.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: var(--brand-cyan-soft); color: var(--brand-cyan);">
            <i class="ph-bold ${escapeHtml(current.icon)} text-xl"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-display font-bold">${escapeHtml(current.headline)}</h3>
            <span class="text-[11px] font-mono" style="color: var(--brand-ember);">${escapeHtml(current.title)}</span>
          </div>
        </div>
        <p class="text-xs sm:text-sm leading-relaxed" style="color: var(--text-secondary);">
          ${escapeHtml(current.description)}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          ${(current.items || []).map((spec) => `
            <div class="kf-subcard px-3 py-2 text-xs flex items-center gap-2">
              <i class="ph-fill ph-check-circle shrink-0" style="color: var(--brand-cyan);"></i>
              <span style="color: var(--text-primary);">${escapeHtml(spec)}</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    if (items.length) renderWorkstation(items[0].id);

    // Quick Collaboration Brief Builder
    const topicBtns = document.querySelectorAll(".brief-topic-btn");
    const briefArea = document.getElementById("brief-preview-text");
    const briefCopyBtn = document.getElementById("brief-copy-btn");

    const templates = {
      "IT Product & PM": "Halo Opik! Saya melihat portofolio opikpixel.github.io dan tertarik berdiskusi mengenai kolaborasi IT Product Management / penyusunan PRD proyek digital.",
      "AI & Workflow Automation": "Halo Opik! Saya tertarik dengan eksplorasi AI Agent & otomasi workflow di portofolio Anda. Mari berdiskusi mengenai peluang proyek bersama.",
      "Web & UI/UX Design": "Halo Opik! Desain sistem Kingfisher di web Anda sangat bersih. Saya ingin berdiskusi terkait pengembangan web / UI-UX.",
      "Speaker & Komunitas": "Halo Opik! Kami ingin mengundang atau berkolaborasi dengan Anda dalam kegiatan komunitas teknologi / kepanitiaan kampus."
    };

    if (briefArea) briefArea.value = templates["IT Product & PM"];

    topicBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        topicBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (briefArea && templates[btn.dataset.topic]) {
          briefArea.value = templates[btn.dataset.topic];
        }
      });
    });

    if (briefCopyBtn && briefArea) {
      briefCopyBtn.addEventListener("click", () => {
        copyToClipboard(briefArea.value, "Pesan kolaborasi disalin! Siap dikirim ke LinkedIn/IG");
      });
    }
  }

  /* ------------------------------------------------------------------------
     8. COMMAND PALETTE WIDGET (⌘K / Ctrl+K)
     ------------------------------------------------------------------------ */
  function initCommandPalette() {
    const modal = document.getElementById("cmd-palette");
    const input = document.getElementById("cmd-input");
    const resultsEl = document.getElementById("cmd-results");
    const closeBtn = document.getElementById("cmd-close-btn");
    const triggers = [
      document.getElementById("cmd-open-btn"),
      document.getElementById("hero-cmd-btn"),
      document.getElementById("footer-cmd-btn")
    ];

    if (!modal || !input || !resultsEl) return;

    const baseCommands = [
      { title: "Ganti Mode Tema Light / Dark", sub: "Shortcut: T", icon: "ph-sun-dim", run: () => window.toggleKingfisherTheme && window.toggleKingfisherTheme() },
      { title: "Buka Master Database CV (88 Rekam Jejak)", sub: "Lihat seluruh prestasi, proyek & organisasi", icon: "ph-database", run: () => window.openMasterCvDatabase && window.openMasterCvDatabase("all") },
      { title: "Filter 15 Prestasi & Penghargaan Juara", sub: "Honors & Awards", icon: "ph-trophy", run: () => window.openMasterCvDatabase && window.openMasterCvDatabase("award") },
      { title: "Trigger Orix 45° Tactical Strike", sub: "Animasi maskot Kingfisher", icon: "ph-lightning", run: () => { scrollToSection("#about"); setTimeout(() => window.triggerOrixStrike && window.triggerOrixStrike(), 380); } },
      { title: "Toggle Mode Fokus Bersih (Matikan/Nyalakan Partikel 3D)", sub: "Calm Reading Mode", icon: "ph-sparkle", run: () => window.toggleCalmMode && window.toggleCalmMode() },
      { title: "Aktifkan Live Edit Mode (Ubah Teks & Skill)", sub: "Shortcut: Ctrl+E", icon: "ph-pencil-simple-line", run: () => window.toggleLiveEditMode && window.toggleLiveEditMode(true) },
      { title: "Buka Spreadsheet CV Resmi", sub: "Google Sheets Isi CV Porto", icon: "ph-file-text", run: () => window.open(DATA.meta.cvUrl, "_blank", "noopener") },
      { title: "Salin Link GitHub (@opikpixel)", sub: "https://github.com/opikpixel", icon: "ph-github-logo", run: () => copyToClipboard("https://github.com/opikpixel", "URL GitHub disalin") }
    ];

    const projectCommands = (DATA.featuredProjects || []).map((p) => ({
      title: p.title,
      sub: `Proyek IT • ${p.domainLabel} (${p.year})`,
      icon: "ph-code-block",
      run: () => openDetailModal({ badge: p.domainLabel, title: p.title, meta: `${p.role} • ${p.year}`, description: p.summary, tags: p.stack, url: p.repoUrl })
    }));

    const cvCommands = (DATA.cvRecords || []).map((r) => ({
      title: r.title,
      sub: `${r.groupLabel} • ${r.role} (${r.period})`,
      icon: r.group === "award" ? "ph-medal" : "ph-folder-simple",
      run: () => openDetailModal({ badge: r.groupLabel, title: r.title, meta: `${r.role} • ${r.organization} • ${r.period}`, description: r.description, tags: r.skills, url: r.url })
    }));

    const allCommands = [...baseCommands, ...projectCommands, ...cvCommands];
    let currentMatches = [];
    let selectedIdx = 0;

    function renderList() {
      const q = input.value.trim().toLowerCase();
      currentMatches = (q
        ? allCommands.filter((c) => `${c.title} ${c.sub}`.toLowerCase().includes(q))
        : allCommands.slice(0, 12)
      ).slice(0, 18);
      selectedIdx = 0;

      if (!currentMatches.length) {
        resultsEl.innerHTML = `<div class="p-6 text-center text-xs" style="color: var(--text-muted);">Tidak ditemukan hasil untuk "${escapeHtml(q)}"</div>`;
        return;
      }

      resultsEl.innerHTML = currentMatches.map((item, idx) => `
        <button type="button" data-cmd-idx="${idx}" class="cmd-item ${idx === 0 ? "is-selected" : ""}">
          <div class="flex items-center gap-3 min-w-0">
            <i class="ph-bold ${escapeHtml(item.icon)} text-base shrink-0" style="color: var(--brand-cyan);"></i>
            <div class="min-w-0">
              <div class="text-xs sm:text-sm font-semibold truncate" style="color: var(--text-primary);">${escapeHtml(item.title)}</div>
              <div class="text-[11px] truncate" style="color: var(--text-muted);">${escapeHtml(item.sub)}</div>
            </div>
          </div>
          <i class="ph-bold ph-arrow-elbow-down-left text-xs shrink-0" style="color: var(--text-muted);"></i>
        </button>
      `).join("");

      resultsEl.querySelectorAll(".cmd-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = currentMatches[Number(btn.dataset.cmdIdx)];
          closePalette();
          if (item && item.run) item.run();
        });
      });
    }

    function updateSelection() {
      const nodes = resultsEl.querySelectorAll(".cmd-item");
      nodes.forEach((n, i) => n.classList.toggle("is-selected", i === selectedIdx));
      if (nodes[selectedIdx]) nodes[selectedIdx].scrollIntoView({ block: "nearest" });
    }

    function openPalette() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      input.value = "";
      renderList();
      setTimeout(() => input.focus(), 40);
    }

    function closePalette() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }

    triggers.forEach((t) => { if (t) t.addEventListener("click", openPalette); });
    if (closeBtn) closeBtn.addEventListener("click", closePalette);
    modal.addEventListener("click", (e) => { if (e.target === modal) closePalette(); });
    input.addEventListener("input", renderList);

    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (modal.classList.contains("is-open")) closePalette();
        else openPalette();
        return;
      }
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentMatches.length) {
          selectedIdx = (selectedIdx + 1) % currentMatches.length;
          updateSelection();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentMatches.length) {
          selectedIdx = (selectedIdx - 1 + currentMatches.length) % currentMatches.length;
          updateSelection();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        const chosen = currentMatches[selectedIdx];
        closePalette();
        if (chosen && chosen.run) chosen.run();
      }
    });
  }

  /* ------------------------------------------------------------------------
     9. THEME-ADAPTIVE THREE.JS BACKGROUND FACETS & 3D SKILL ORB
     ------------------------------------------------------------------------ */
  function initWebGLBackground() {
    const canvas = document.getElementById("webgl-bg");
    if (!canvas || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (_) {
      return;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const ambientLight = new THREE.AmbientLight(0x0a253d, 1.4);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0x06b6d4, 1.9);
    keyLight.position.set(6, 8, 7);
    scene.add(keyLight);
    const emberLight = new THREE.PointLight(0xf97316, 2.2, 16);
    emberLight.position.set(0, 0, 3.5);
    scene.add(emberLight);

    const shardGroup = new THREE.Group();
    scene.add(shardGroup);

    const geos = [
      new THREE.OctahedronGeometry(0.36, 0),
      new THREE.TetrahedronGeometry(0.4, 0)
    ];

    const shards = [];
    const count = window.innerWidth < 768 ? 7 : 12;

    for (let i = 0; i < count; i++) {
      const geo = geos[i % geos.length];
      const mat = new THREE.MeshPhongMaterial({
        color: 0x0a253d,
        emissive: i % 3 === 0 ? 0xf97316 : 0x0284c7,
        emissiveIntensity: 0.2,
        flatShading: true,
        transparent: true,
        opacity: 0.45
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / count) * Math.PI * 2;
      const rx = 4.0 + Math.random() * 4.2;
      const ry = 2.4 + Math.random() * 3.8;
      const bx = Math.cos(angle) * rx;
      const by = Math.sin(angle) * ry;
      const bz = -2 - Math.random() * 5.5;
      mesh.position.set(bx, by, bz);
      shardGroup.add(mesh);
      shards.push({
        mesh,
        basePos: new THREE.Vector3(bx, by, bz),
        vel: new THREE.Vector3(),
        phase: Math.random() * Math.PI * 2
      });
    }

    // Subtle 45° slipstream motes
    const pCount = 95;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 24;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.042, transparent: true, opacity: 0.36 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    function syncWebGLTheme(theme) {
      const isLight = theme === "light";
      ambientLight.color.setHex(isLight ? 0xe2eef8 : 0x0a253d);
      ambientLight.intensity = isLight ? 1.8 : 1.4;
      pMat.color.setHex(isLight ? 0x0284c7 : 0x06b6d4);
      pMat.opacity = isLight ? 0.22 : 0.36;
      shards.forEach((s, idx) => {
        s.mesh.material.color.setHex(isLight ? 0xdbeafe : 0x0a253d);
        s.mesh.material.emissive.setHex(idx % 3 === 0 ? 0xf97316 : 0x0284c7);
        s.mesh.material.opacity = isLight ? 0.26 : 0.45;
      });
    }

    syncWebGLTheme(getCurrentTheme());
    window.addEventListener("kingfisher:theme", (e) => syncWebGLTheme(e.detail.theme));

    window.triggerWebGLStrike = function () {
      window.__orixMotion.strikeEnergy = 1;
      shards.forEach((s) => {
        const dir = s.mesh.position.clone().normalize();
        s.vel.addScaledVector(dir, 0.2);
      });
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (window.__orixMotion.calm) return;

      const t = clock.getElapsedTime();
      const motion = window.__orixMotion;
      motion.strikeEnergy = motion.strikeEnergy > 0.002 ? motion.strikeEnergy * 0.93 : 0;

      if (!reduced) {
        const pos = pGeo.attributes.position;
        const step = 0.006 + motion.strikeEnergy * 0.04;
        for (let i = 0; i < pCount; i++) {
          let x = pos.getX(i) - step;
          let y = pos.getY(i) - step * 0.75;
          if (x < -12) x = 12;
          if (y < -10) y = 10;
          pos.setXY(i, x, y);
        }
        pos.needsUpdate = true;

        shards.forEach((s) => {
          const tx = s.basePos.x + Math.sin(t * 0.5 + s.phase) * 0.2;
          const ty = s.basePos.y + Math.cos(t * 0.6 + s.phase) * 0.22 - motion.scrollProgress * 1.6;
          s.vel.x = (s.vel.x + (tx - s.mesh.position.x) * 0.03) * 0.9;
          s.vel.y = (s.vel.y + (ty - s.mesh.position.y) * 0.03) * 0.9;
          s.mesh.position.add(s.vel);
          s.mesh.rotation.x += 0.003;
          s.mesh.rotation.y += 0.004;
        });
      }
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function initSkillsOrb() {
    const orbCanvas = document.getElementById("skills-orb-canvas");
    if (!orbCanvas || typeof THREE === "undefined") return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: orbCanvas, alpha: true, antialias: true });
    } catch (_) {
      return;
    }

    const scene = new THREE.Scene();
    const w = orbCanvas.clientWidth || 360;
    const h = orbCanvas.clientHeight || 240;
    const camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 100);
    camera.position.z = 4.3;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const amb = new THREE.AmbientLight(0x0a253d, 1.5);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0x06b6d4, 2.2);
    key.position.set(4, 5, 5);
    scene.add(key);
    const emb = new THREE.PointLight(0xf97316, 2.2, 10);
    emb.position.set(-3, -2, 3);
    scene.add(emb);

    const group = new THREE.Group();
    scene.add(group);

    const outerGeo = new THREE.IcosahedronGeometry(1.32, 1);
    const outerSolidMat = new THREE.MeshPhongMaterial({
      color: 0x0a253d,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      flatShading: true,
      transparent: true,
      opacity: 0.38
    });
    const outerSolid = new THREE.Mesh(outerGeo, outerSolidMat);
    group.add(outerSolid);

    const outerWireMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.55 });
    const outerWire = new THREE.Mesh(outerGeo, outerWireMat);
    outerWire.scale.setScalar(1.03);
    group.add(outerWire);

    const innerGeo = new THREE.OctahedronGeometry(0.68, 0);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 0.45,
      flatShading: true,
      transparent: true,
      opacity: 0.88
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.68, 0.016, 12, 72),
      new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.65 })
    );
    ringMesh.rotation.x = Math.PI / 2.6;
    group.add(ringMesh);

    function syncOrbTheme(theme) {
      const light = theme === "light";
      amb.color.setHex(light ? 0xe0f2fe : 0x0a253d);
      outerSolidMat.color.setHex(light ? 0xbae6fd : 0x0a253d);
      outerWireMat.color.setHex(light ? 0x0284c7 : 0x06b6d4);
    }
    syncOrbTheme(getCurrentTheme());
    window.addEventListener("kingfisher:theme", (e) => syncOrbTheme(e.detail.theme));

    let dragging = false;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    orbCanvas.addEventListener("pointerdown", (e) => { dragging = true; px = e.clientX; py = e.clientY; });
    window.addEventListener("pointerup", () => { dragging = false; });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      ty += (e.clientX - px) * 0.012;
      tx += (e.clientY - py) * 0.012;
      px = e.clientX;
      py = e.clientY;
    }, { passive: true });

    function loop() {
      requestAnimationFrame(loop);
      outerSolid.rotation.y += 0.004;
      outerWire.rotation.copy(outerSolid.rotation);
      innerMesh.rotation.y -= 0.01;
      ringMesh.rotation.z -= 0.006;
      group.rotation.y += (ty - group.rotation.y) * 0.09;
      group.rotation.x += (tx - group.rotation.x) * 0.09;
      renderer.render(scene, camera);
    }
    loop();

    window.addEventListener("resize", () => {
      const nw = orbCanvas.clientWidth || 360;
      const nh = orbCanvas.clientHeight || 240;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  /* ------------------------------------------------------------------------
     10. CURSOR SLIPSTREAM TRAIL, AUDIO ENGINE, SCROLL SPY & LIVE EDIT
     ------------------------------------------------------------------------ */
  function initCursorAndAudio() {
    // Subtle Kingfisher Cursor Trail
    const canvas = document.getElementById("cursor-ribbon-canvas");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    if (canvas && !reduced && !coarse) {
      const ctx = canvas.getContext("2d");
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener("resize", resize);

      const trail = [];
      let mx = -100, my = -100, dirtyMove = false, overInteractive = false;
      window.addEventListener("mousemove", (e) => {
        if (trail.length && Math.hypot(e.clientX - mx, e.clientY - my) > 140) {
          trail.length = 0;
        }
        mx = e.clientX;
        my = e.clientY;
        dirtyMove = true;
        overInteractive = Boolean(e.target && e.target.closest && e.target.closest("a, button, input, select, textarea"));
      }, { passive: true });

      function drawTrail() {
        requestAnimationFrame(drawTrail);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if (window.__orixMotion.calm) return;

        if (dirtyMove) {
          trail.unshift({ x: mx, y: my, ember: overInteractive });
          if (trail.length > 14) trail.pop();
          dirtyMove = false;
        } else if (trail.length) {
          trail.pop();
        }

        for (let i = 0; i < trail.length - 1; i++) {
          const p0 = trail[i], p1 = trail[i + 1];
          const r = 1 - i / trail.length;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineCap = "round";
          ctx.lineWidth = Math.max(0.6, r * (overInteractive ? 3.5 : 2.2));
          ctx.strokeStyle = p0.ember
            ? `rgba(249, 115, 22, ${(r * 0.5).toFixed(2)})`
            : `rgba(6, 182, 212, ${(r * 0.38).toFixed(2)})`;
          ctx.stroke();
        }
      }
      drawTrail();
    }

    // Tactical Web Audio SFX
    const audioBtn = document.getElementById("tactical-audio-btn");
    let audioCtx = null;
    let enabled = false;

    window.playTacticalSfx = function (type) {
      if (!enabled || !audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      if (type === "strike") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(115, now + 0.22);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.1);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      }
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    };

    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === "suspended") audioCtx.resume();
        enabled = !enabled;
        audioBtn.classList.toggle("is-playing", enabled);
        audioBtn.setAttribute("aria-pressed", String(enabled));
        if (enabled) window.playTacticalSfx("tap");
        showToast(enabled ? "Efek suara taktis diaktifkan" : "Efek suara dimatikan");
      });
    }
  }

  function initScrollAndAnimations() {
    const progressEl = document.getElementById("scroll-progress");
    const atmoVectors = document.getElementById("atmo-vectors");
    const sections = ["home", "about", "projects", "dokumentasi", "skill", "connect"];
    const navLinks = document.querySelectorAll(".nav-link-item");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onScrollUpdate(scrollTop, velocity) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const prog = maxScroll > 0 ? Math.max(0, Math.min(1, scrollTop / maxScroll)) : 0;
      window.__orixMotion.scrollY = scrollTop;
      window.__orixMotion.scrollProgress = prog;
      window.__orixMotion.velocity = velocity || 0;

      if (progressEl) progressEl.style.transform = `scaleX(${prog})`;
      if (atmoVectors && !reduced) {
        atmoVectors.style.transform = `translate3d(0, ${Math.min(scrollTop * -0.04, 0)}px, 0)`;
      }

      let activeId = "home";
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && scrollTop >= el.offsetTop - 240) activeId = id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.nav === activeId);
      });
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      if (!reduced && typeof Lenis !== "undefined") {
        lenisInstance = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
        lenisInstance.on("scroll", (e) => {
          ScrollTrigger.update();
          onScrollUpdate(e.scroll, e.velocity || 0);
        });
        gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        window.addEventListener("scroll", () => onScrollUpdate(window.scrollY, 0), { passive: true });
      }

      gsap.utils.toArray(".animate-section").forEach((sec) => {
        gsap.fromTo(sec,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: sec, start: "top 88%", once: true }
          }
        );
      });
    } else {
      window.addEventListener("scroll", () => onScrollUpdate(window.scrollY, 0), { passive: true });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        scrollToSection(href);
      });
    });
  }

  function initLiveEditMode() {
    const STORAGE_KEY = "opikpixel_live_edits_v4";
    const hud = document.getElementById("live-edit-hud");
    const statusEl = document.getElementById("live-edit-status");
    const drawerBtn = document.getElementById("drawer-live-edit-btn");
    const footerBtn = document.getElementById("footer-edit-btn");
    const exportBtn = document.getElementById("live-edit-export-btn");
    const copyBtn = document.getElementById("live-edit-copy-btn");
    const resetBtn = document.getElementById("live-edit-reset-btn");
    const exitBtn = document.getElementById("live-edit-exit-btn");

    if (!hud) return;
    let active = false;

    const LEVEL_META = {
      4: { label: "Core Focus", color: "var(--brand-ember)", bar: "skill-bar-segment bg-[#F97316] rounded-full" },
      3: { label: "Practitioner", color: "var(--brand-cyan)", bar: "skill-bar-segment bg-[#06B6D4] rounded-full" },
      2: { label: "Fundamental", color: "var(--brand-azure)", bar: "skill-bar-segment bg-[#0284C7] rounded-full" },
      1: { label: "Explorer", color: "var(--text-muted)", bar: "skill-bar-segment bg-[#94A3B8] rounded-full" }
    };

    function load() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"texts":{}}'); } catch (_) { return { texts: {} }; }
    }
    function save(st) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch (_) {}
    }

    const editableNodes = document.querySelectorAll("#home h1, #home p, #about h2, #about h3, #about p, #connect h2, #connect p");
    const savedState = load();
    editableNodes.forEach((el, idx) => {
      el.dataset.editId = `edit_${idx}`;
      el.setAttribute("data-editable", "text");
      if (savedState.texts && typeof savedState.texts[`edit_${idx}`] === "string") {
        el.innerHTML = savedState.texts[`edit_${idx}`];
      }
      el.addEventListener("blur", () => {
        if (!active) return;
        const st = load();
        st.texts = st.texts || {};
        st.texts[el.dataset.editId] = el.innerHTML;
        save(st);
        if (statusEl) statusEl.textContent = "Perubahan teks tersimpan otomatis";
      });
    });

    document.querySelectorAll(".skill-item").forEach((item) => {
      const grid = item.querySelector(".grid-cols-4");
      const labelEl = item.querySelectorAll("span")[1];
      if (!grid) return;
      grid.classList.add("skill-bars-grid");
      Array.from(grid.children).forEach((bar, i) => {
        bar.addEventListener("click", () => {
          if (!active) return;
          const lvl = i + 1;
          const meta = LEVEL_META[lvl];
          if (labelEl) {
            labelEl.textContent = meta.label;
            labelEl.style.color = meta.color;
          }
          Array.from(grid.children).forEach((b, bi) => {
            if (bi < lvl) {
              b.className = meta.bar;
              b.style.background = "";
            } else {
              b.className = "rounded-full";
              b.style.background = "var(--bar-unlit)";
            }
          });
          if (statusEl) statusEl.textContent = `Level diubah ke ${lvl}/4 (${meta.label})`;
        });
      });
    });

    function setEdit(next) {
      active = next;
      document.body.classList.toggle("live-edit-active", active);
      document.querySelectorAll("[data-editable]").forEach((el) => {
        if (active) {
          el.setAttribute("contenteditable", "true");
          el.setAttribute("spellcheck", "false");
        } else {
          el.removeAttribute("contenteditable");
        }
      });
      if (active) showToast("Live Edit Mode aktif — klik teks atau balok skill");
    }

    window.toggleLiveEditMode = setEdit;
    if (drawerBtn) drawerBtn.addEventListener("click", () => setEdit(!active));
    if (footerBtn) footerBtn.addEventListener("click", () => setEdit(!active));
    if (exitBtn) exitBtn.addEventListener("click", () => setEdit(false));
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        window.location.reload();
      });
    }
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        copyToClipboard(JSON.stringify(load(), null, 2), "Konfigurasi Live Edit disalin sebagai JSON");
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        setEdit(false);
        const blob = new Blob(["<!DOCTYPE html>\n" + document.documentElement.outerHTML], { type: "text/html;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "index.html";
        a.click();
        URL.revokeObjectURL(a.href);
        showToast("File index.html diunduh");
      });
    }

    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEdit(!active);
      }
    });
  }

  /* ------------------------------------------------------------------------
     BOOT PORTFOLIO APPLICATION
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initThemeAndCalmControls();
    initModalsAndDrawer();
    initHeroAndCarousel();
    initBrandAndOrix();
    initProjectsAndGitHub();
    initTrackRecordExplorer();
    initWorkstationAndBrief();
    initCommandPalette();
    initWebGLBackground();
    initSkillsOrb();
    initCursorAndAudio();
    initScrollAndAnimations();
    initLiveEditMode();
    attachSpotlight(document);
  });
})();
