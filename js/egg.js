/* ============================================================
   egg.js - Temporal Portal easter egg.
   One random effect per click on the Temporal Portal card:
   1) hyperjump  2) UFO abduction  3) passport stamp
   4) wormhole greeting. Exposes window.PortalEgg.trigger(card).
   ============================================================ */

(function () {
    "use strict";

    let busy = false;

    const CLOCK_LOCALES = { en: "en-GB", fr: "fr-FR", de: "de-DE", ar: "ar" };
    const CLOCK_OPTS = {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    };

    function locale() {
        const lang = window.I18N ? window.I18N.lang : "en";
        return CLOCK_LOCALES[lang] || "en-GB";
    }

    function formatClock(date) {
        try { return date.toLocaleString(locale(), CLOCK_OPTS); }
        catch (e) { return date.toLocaleString(); }
    }

    function motionOff() {
        return document.documentElement.getAttribute("data-motion") === "off" ||
            (window.matchMedia &&
             window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    /* ---- 1) Hyperjump: starfield streaks + clock time travel ---- */
    function hyperjump(card) {
        card.classList.add("is-warping");
        setTimeout(function () { card.classList.remove("is-warping"); }, 600);

        if (window.SpaceBG && typeof window.SpaceBG.warp === "function") {
            window.SpaceBG.warp(1500);
        }

        const clock = document.getElementById("clock");
        if (clock) {
            const from = Date.UTC(1905, 0, 1);
            const to = Date.UTC(2205, 0, 1);
            const scramble = setInterval(function () {
                clock.textContent = formatClock(new Date(from + Math.random() * (to - from)));
            }, 70);
            setTimeout(function () {
                clearInterval(scramble);
                clock.textContent = formatClock(new Date());
            }, 1500);
        }
        return 1700;
    }

    /* ---- 2) UFO abducts the card's arrow and gives it back ---- */
    function ufo(card) {
        const arrow = card.querySelector(".project-card__link .arrow");
        const ship = document.createElement("span");
        ship.className = "egg-ufo";
        ship.textContent = "\u{1F6F8}";
        ship.setAttribute("aria-hidden", "true");

        if (arrow) {
            const c = card.getBoundingClientRect();
            const a = arrow.getBoundingClientRect();
            ship.style.setProperty("--ufo-x", (a.left - c.left + a.width / 2) + "px");
            ship.style.setProperty("--ufo-y", (a.top - c.top) + "px");
        }
        card.append(ship);

        if (arrow) {
            setTimeout(function () { arrow.classList.add("egg-abducted"); }, 900);
            setTimeout(function () {
                arrow.classList.remove("egg-abducted");
                arrow.classList.add("egg-returned");
            }, 1900);
            setTimeout(function () { arrow.classList.remove("egg-returned"); }, 2400);
        }
        setTimeout(function () { ship.remove(); }, 2650);
        return 2700;
    }

    /* ---- 3) Temporal passport stamp ---- */
    function stamp(card) {
        const overlay = document.createElement("div");
        overlay.className = "egg-stamp";

        const seal = document.createElement("div");
        seal.className = "egg-stamp__seal";

        const text = document.createElement("span");
        text.textContent = window.I18N
            ? window.I18N.t("egg.stamp")
            : "You are already here, traveler";

        const when = document.createElement("span");
        when.className = "egg-stamp__date";
        when.textContent = formatClock(new Date());

        seal.append(text, when);
        overlay.append(seal);
        card.append(overlay);

        setTimeout(function () { overlay.classList.add("is-leaving"); }, 2400);
        setTimeout(function () { overlay.remove(); }, 2800);
        return 2900;
    }

    /* ---- 4) Wormhole greeting in every language ---- */
    function wormhole(card) {
        const vortex = document.createElement("div");
        vortex.className = "egg-vortex";
        vortex.setAttribute("aria-hidden", "true");
        const greeting = document.createElement("span");
        greeting.className = "egg-vortex__greeting";
        vortex.append(greeting);
        card.append(vortex);

        const langs = window.I18N ? window.I18N.supported : ["en"];
        const texts = langs.map(function (l) {
            return window.I18N && window.I18N.tIn
                ? window.I18N.tIn(l, "welcome.greeting")
                : "Welcome, visitor";
        });

        let i = 0;
        function next() {
            greeting.textContent = texts[i++];
            greeting.classList.remove("is-spiraling");
            void greeting.offsetWidth; // restart the animation
            greeting.classList.add("is-spiraling");
        }
        next();
        const cycle = setInterval(function () {
            if (i < texts.length) next();
        }, 800);

        const total = 800 * texts.length + 200;
        setTimeout(function () {
            clearInterval(cycle);
            vortex.classList.add("is-leaving");
        }, total);
        setTimeout(function () { vortex.remove(); }, total + 450);
        return total + 500;
    }

    const EFFECTS = [hyperjump, ufo, stamp, wormhole];

    window.PortalEgg = {
        trigger: function (card) {
            if (busy || !card) return;
            // With motion disabled, only the (mostly static) stamp makes sense.
            const effect = motionOff()
                ? stamp
                : EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
            busy = true;
            const duration = effect(card) || 2000;
            setTimeout(function () { busy = false; }, duration);
        }
    };
})();
