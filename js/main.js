/* ============================================================
   main.js - Bootstraps the page: i18n, projects, controls,
   clock, filters, theme/motion toggles, card cursor glow.
   Runs after other scripts (all use `defer`).
   ============================================================ */

(function () {
    "use strict";

    const STORE = {
        theme: "labidi.theme",
        motion: "labidi.motion"
    };

    /* Combined view state for the project grid. */
    const view = { filter: "all", query: "", tags: [] };

    function renderProjects() {
        if (window.Projects) window.Projects.render(view.filter, view.query, view.tags);
    }

    function get(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function set(key, val) {
        try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
    }

    /* ---------- Clock / welcome ---------- */
    function initClock() {
        const clockEl = document.getElementById("clock");
        const yearEl = document.getElementById("footer-year");
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());
        if (!clockEl) return;

        function tick() {
            const lang = window.I18N ? window.I18N.lang : "en";
            const locale = { en: "en-GB", fr: "fr-FR", de: "de-DE", ar: "ar" }[lang] || "en-GB";
            const now = new Date();
            const opts = {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit"
            };
            try {
                clockEl.textContent = now.toLocaleString(locale, opts);
            } catch (e) {
                clockEl.textContent = now.toLocaleString();
            }
        }
        tick();
        setInterval(tick, 1000);
    }

    /* ---------- Language ---------- */
    function initLanguage() {
        const select = document.getElementById("lang-select");
        if (window.I18N) {
            window.I18N.init();
            if (select) select.value = window.I18N.lang;

            // Re-render dynamic content whenever language changes
            window.I18N.onChange(function () {
                renderProjects();
                if (select) select.value = window.I18N.lang;
            });
        }
        if (select) {
            select.addEventListener("change", function () {
                if (window.I18N) window.I18N.setLang(select.value);
            });
        }
    }

    /* ---------- Filters ---------- */
    function initFilters() {
        const buttons = document.querySelectorAll(".filter");
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                buttons.forEach(function (b) {
                    b.classList.remove("is-active");
                    b.setAttribute("aria-pressed", "false");
                });
                btn.classList.add("is-active");
                btn.setAttribute("aria-pressed", "true");
                view.filter = btn.dataset.filter;
                renderProjects();
            });
            btn.setAttribute("aria-pressed", btn.classList.contains("is-active") ? "true" : "false");
        });
    }

    /* ---------- Search ---------- */
    function initSearch() {
        const input = document.getElementById("project-search-input");
        if (!input) return;

        input.addEventListener("input", function () {
            view.query = input.value;
            renderProjects();
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && input.value) {
                input.value = "";
                view.query = "";
                renderProjects();
            }
        });
    }

    /* ---------- Tag filter ---------- */
    function syncTagChips() {
        document.querySelectorAll("#tag-cloud .tag-chip").forEach(function (chip) {
            const on = view.tags.indexOf(chip.dataset.tag) !== -1;
            chip.classList.toggle("is-active", on);
            chip.setAttribute("aria-pressed", on ? "true" : "false");
        });
        const clear = document.getElementById("tag-clear");
        if (clear) clear.hidden = view.tags.length === 0;
    }

    function toggleTag(name) {
        if (!name) return;
        const i = view.tags.indexOf(name);
        if (i === -1) view.tags.push(name);
        else view.tags.splice(i, 1);
        syncTagChips();
        renderProjects();
    }

    function initTags() {
        const cloud = document.getElementById("tag-cloud");
        if (!cloud || !window.Projects) return;

        window.Projects.tags.forEach(function (name) {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "tag-chip";
            chip.dataset.tag = name;
            chip.textContent = name;
            chip.setAttribute("aria-pressed", "false");
            cloud.append(chip);
        });

        cloud.addEventListener("click", function (e) {
            const chip = e.target.closest(".tag-chip");
            if (chip) toggleTag(chip.dataset.tag);
        });

        const clear = document.getElementById("tag-clear");
        if (clear) {
            clear.addEventListener("click", function () {
                view.tags.length = 0;
                syncTagChips();
                renderProjects();
            });
        }

        // Tags printed on a card toggle the same filter.
        document.addEventListener("project:tag", function (e) { toggleTag(e.detail); });
    }

    /* ---------- Theme toggle ---------- */
    function initTheme() {
        const btn = document.getElementById("theme-toggle");
        const stored = get(STORE.theme) || "dark";
        applyTheme(stored);

        if (btn) {
            btn.addEventListener("click", function () {
                const next = document.documentElement.getAttribute("data-theme") === "light"
                    ? "dark" : "light";
                applyTheme(next);
                set(STORE.theme, next);
            });
        }

        function applyTheme(theme) {
            document.documentElement.setAttribute("data-theme", theme);
            if (btn) btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
        }
    }

    /* ---------- Motion toggle ---------- */
    function initMotion() {
        const btn = document.getElementById("motion-toggle");
        const stored = get(STORE.motion); // "off" | "on" | null
        // Default follows OS preference unless user overrode it
        if (stored === "off") applyMotion("off");
        else applyMotion("on");

        if (btn) {
            btn.addEventListener("click", function () {
                const isOff = document.documentElement.getAttribute("data-motion") === "off";
                const next = isOff ? "on" : "off";
                applyMotion(next);
                set(STORE.motion, next);
                if (window.SpaceBG) window.SpaceBG.refresh();
            });
        }

        function applyMotion(state) {
            if (state === "off") {
                document.documentElement.setAttribute("data-motion", "off");
            } else {
                document.documentElement.removeAttribute("data-motion");
            }
            // aria-pressed true means "motion enabled"
            if (btn) btn.setAttribute("aria-pressed", state === "off" ? "false" : "true");
        }
    }

    /* ---------- Card cursor glow (delegated) ---------- */
    function initCardGlow() {
        const grid = document.getElementById("project-grid");
        if (!grid) return;
        grid.addEventListener("pointermove", function (e) {
            const card = e.target.closest(".project-card");
            if (!card) return;
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
            card.style.setProperty("--my", (e.clientY - rect.top) + "px");
        });
    }

    /* ---------- Urgent help (SOS) dialog ---------- */
    function initSos() {
        const dialog = document.getElementById("sos-dialog");
        const openBtn = document.getElementById("sos-open");
        if (!dialog || !openBtn) return;

        openBtn.addEventListener("click", function () {
            if (typeof dialog.showModal === "function") dialog.showModal();
            else dialog.setAttribute("open", "");
        });

        const closeBtn = document.getElementById("sos-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                if (typeof dialog.close === "function") dialog.close();
                else dialog.removeAttribute("open");
            });
        }

        // A click on the backdrop lands on the dialog element itself.
        dialog.addEventListener("click", function (e) {
            if (e.target === dialog && typeof dialog.close === "function") dialog.close();
        });
    }

    /* ---------- Boot ---------- */
    function boot() {
        initLanguage();          // sets lang + applies static text
        initTags();
        initSearch();
        renderProjects();
        initClock();
        initFilters();
        initSos();
        initTheme();
        initMotion();
        initCardGlow();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
