/* ============================================================
   i18n.js — Translation dictionary + language switching
   No dependencies. Exposes window.I18N.
   ============================================================ */

(function () {
    "use strict";

    const DICT = {
        en: {
            "nav.projects": "Projects",
            "nav.about": "About",
            "nav.contact": "Contact",
            "controls.language": "Language",
            "controls.motion": "Motion",
            "controls.theme": "Theme",
            "welcome.eyebrow": "Incoming transmission",
            "welcome.greeting": "Welcome, visitor",
            "welcome.subtitle": "You have arrived at a fixed point in space and time.",
            "projects.title": "Projects",
            "projects.lead": "A catalogue of ongoing experiments, completed builds and archived timelines.",
            "filters.all": "All",
            "filters.active": "Active",
            "filters.finished": "Finished",
            "filters.archived": "Archived",
            "about.title": "About this portal",
            "about.text": "A centralized hub for navigation, project management and visitor information — built with pure HTML, CSS and JavaScript. No frameworks, no dependencies, no tracking.",
            "footer.message": "Safe travels through the vortex.",
            "card.visit": "Visit",
            "card.soon": "Coming soon",
            "card.empty": "No projects in this timeline.",
            "status.active": "Active",
            "status.finished": "Finished",
            "status.archived": "Archived"
        },
        fr: {
            "nav.projects": "Projets",
            "nav.about": "À propos",
            "nav.contact": "Contact",
            "controls.language": "Langue",
            "controls.motion": "Animation",
            "controls.theme": "Thème",
            "welcome.eyebrow": "Transmission entrante",
            "welcome.greeting": "Bienvenue, visiteur",
            "welcome.subtitle": "Vous êtes arrivé à un point fixe dans l'espace et le temps.",
            "projects.title": "Projets",
            "projects.lead": "Un catalogue d'expériences en cours, de projets terminés et de chronologies archivées.",
            "filters.all": "Tous",
            "filters.active": "En cours",
            "filters.finished": "Terminés",
            "filters.archived": "Archivés",
            "about.title": "À propos de ce portail",
            "about.text": "Un hub centralisé pour la navigation, la gestion de projets et l'information des visiteurs — construit en HTML, CSS et JavaScript purs. Aucun framework, aucune dépendance, aucun suivi.",
            "footer.message": "Bon voyage à travers le vortex.",
            "card.visit": "Visiter",
            "card.soon": "Bientôt disponible",
            "card.empty": "Aucun projet dans cette chronologie.",
            "status.active": "En cours",
            "status.finished": "Terminé",
            "status.archived": "Archivé"
        },
        de: {
            "nav.projects": "Projekte",
            "nav.about": "Über",
            "nav.contact": "Kontakt",
            "controls.language": "Sprache",
            "controls.motion": "Animation",
            "controls.theme": "Thema",
            "welcome.eyebrow": "Eingehende Übertragung",
            "welcome.greeting": "Willkommen, Besucher",
            "welcome.subtitle": "Sie sind an einem festen Punkt in Raum und Zeit angekommen.",
            "projects.title": "Projekte",
            "projects.lead": "Ein Katalog laufender Experimente, abgeschlossener Projekte und archivierter Zeitlinien.",
            "filters.all": "Alle",
            "filters.active": "Aktiv",
            "filters.finished": "Fertig",
            "filters.archived": "Archiviert",
            "about.title": "Über dieses Portal",
            "about.text": "Ein zentraler Knotenpunkt für Navigation, Projektverwaltung und Besucherinformationen — gebaut mit reinem HTML, CSS und JavaScript. Keine Frameworks, keine Abhängigkeiten, kein Tracking.",
            "footer.message": "Gute Reise durch den Vortex.",
            "card.visit": "Besuchen",
            "card.soon": "Demnächst",
            "card.empty": "Keine Projekte in dieser Zeitlinie.",
            "status.active": "Aktiv",
            "status.finished": "Fertig",
            "status.archived": "Archiviert"
        },
        ar: {
            "nav.projects": "المشاريع",
            "nav.about": "حول",
            "nav.contact": "اتصل",
            "controls.language": "اللغة",
            "controls.motion": "الحركة",
            "controls.theme": "السمة",
            "welcome.eyebrow": "بث وارد",
            "welcome.greeting": "مرحباً أيها الزائر",
            "welcome.subtitle": "لقد وصلت إلى نقطة ثابتة في المكان والزمان.",
            "projects.title": "المشاريع",
            "projects.lead": "فهرس للتجارب الجارية والمشاريع المكتملة والجداول الزمنية المؤرشفة.",
            "filters.all": "الكل",
            "filters.active": "نشط",
            "filters.finished": "مكتمل",
            "filters.archived": "مؤرشف",
            "about.title": "حول هذه البوابة",
            "about.text": "مركز موحد للتنقل وإدارة المشاريع ومعلومات الزوار — مبني بلغة HTML وCSS وJavaScript خالصة. بدون أطر عمل، بدون تبعيات، بدون تتبع.",
            "footer.message": "رحلة آمنة عبر الدوامة.",
            "card.visit": "زيارة",
            "card.soon": "قريباً",
            "card.empty": "لا توجد مشاريع في هذا الجدول الزمني.",
            "status.active": "نشط",
            "status.finished": "مكتمل",
            "status.archived": "مؤرشف"
        }
    };

    const RTL_LANGS = ["ar", "he", "fa", "ur"];
    const SUPPORTED = Object.keys(DICT);
    const STORAGE_KEY = "labidi.lang";

    let current = "en";
    const listeners = [];

    function t(key) {
        const lang = DICT[current] || DICT.en;
        return lang[key] || DICT.en[key] || key;
    }

    function applyStaticText() {
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            el.textContent = t(el.getAttribute("data-i18n"));
        });
    }

    function detectInitial() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED.includes(stored)) return stored;
        const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
        return SUPPORTED.includes(nav) ? nav : "en";
    }

    function setLang(lang) {
        if (!SUPPORTED.includes(lang)) return;
        current = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }

        const html = document.documentElement;
        html.setAttribute("lang", lang);
        html.setAttribute("dir", RTL_LANGS.includes(lang) ? "rtl" : "ltr");

        applyStaticText();
        listeners.forEach(function (fn) { fn(lang); });
    }

    window.I18N = {
        t: t,
        setLang: setLang,
        get lang() { return current; },
        get supported() { return SUPPORTED.slice(); },
        onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
        init: function () { setLang(detectInitial()); }
    };
})();
