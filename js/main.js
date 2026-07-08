/* ============================================================
   main.js — Bootstraps the page: i18n, projects, controls,
   clock, filters, theme/motion toggles, card cursor glow.
   Runs after other scripts (all use `defer`).
   ============================================================ */

(function () {
    "use strict";

    const STORE = {
        theme: "labidi.theme",
        motion: "labidi.motion"
    };

    let currentFilter = "all";

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
                if (window.Projects) window.Projects.render(currentFilter);
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
                currentFilter = btn.dataset.filter;
                if (window.Projects) window.Projects.render(currentFilter);
            });
            btn.setAttribute("aria-pressed", btn.classList.contains("is-active") ? "true" : "false");
        });
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

    /* ---------- Boot ---------- */
    function boot() {
        initLanguage();          // sets lang + applies static text
        if (window.Projects) window.Projects.render(currentFilter);
        initClock();
        initFilters();
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
