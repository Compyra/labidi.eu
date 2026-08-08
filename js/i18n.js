/* ============================================================
   i18n.js - Translation dictionary + language switching
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
            "filters.active": "Active development",
            "filters.finished": "Finished",
            "filters.soon": "Soon",
            "search.label": "Search projects",
            "search.placeholder": "Search projects, tags\u2026",
            "tags.label": "Filter by tag",
            "tags.clear": "Clear tags",
            "about.title": "About this portal",
            "about.text": "A centralized hub for navigation, project management and visitor information, built with pure HTML, CSS and JavaScript. No frameworks, no dependencies, no tracking.",
            "footer.message": "Safe travels through the vortex.",
            "footer.business": "Business",
            "footer.contact": "Contact",
            "footer.fun": "Fun",
            "card.visit": "Visit",
            "card.soon": "Coming soon",
            "card.empty": "No projects in this timeline.",
            "status.active": "Active development",
            "status.finished": "Finished",
            "status.soon": "Soon",
            "sos.button": "I need help",
            "sos.title": "Need help right now?",
            "sos.lead": "Pick the situation that matches yours.",
            "sos.close": "Close",
            "sos.online.title": "I need someone, right now",
            "sos.online.desc": "Society is working and you have network access. Find official helplines and someone to talk to.",
            "sos.offline.title": "Society is not OK, or I have no network",
            "sos.offline.desc": "An offline survival guide with the knowledge to keep going when nothing else works.",
            "sos.cyber.title": "I got phished, hacked or scammed",
            "sos.cyber.desc": "First aid for online incidents: what to do the moment after you clicked.",
            "sos.contact": "Something else going on? Contact me and I will see what I can do to help.",
            "egg.stamp": "You are already here, traveler"
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
            "filters.active": "Développement actif",
            "filters.finished": "Terminés",
            "filters.soon": "Bientôt",
            "search.label": "Rechercher des projets",
            "search.placeholder": "Rechercher projets, tags\u2026",
            "tags.label": "Filtrer par tag",
            "tags.clear": "Effacer les tags",
            "about.title": "À propos de ce portail",
            "about.text": "Un hub centralisé pour la navigation, la gestion de projets et l'information des visiteurs : construit en HTML, CSS et JavaScript purs. Aucun framework, aucune dépendance, aucun suivi.",
            "footer.message": "Bon voyage à travers le vortex.",
            "footer.business": "Professionnel",
            "footer.contact": "Contact",
            "footer.fun": "Loisirs",
            "card.visit": "Visiter",
            "card.soon": "Bientôt disponible",
            "card.empty": "Aucun projet dans cette chronologie.",
            "status.active": "Développement actif",
            "status.finished": "Terminé",
            "status.soon": "Bientôt",
            "sos.button": "J'ai besoin d'aide",
            "sos.title": "Besoin d'aide maintenant ?",
            "sos.lead": "Choisissez la situation qui correspond à la vôtre.",
            "sos.close": "Fermer",
            "sos.online.title": "J'ai besoin de quelqu'un, maintenant",
            "sos.online.desc": "La société fonctionne et vous avez du réseau. Trouvez des lignes d'écoute officielles et quelqu'un à qui parler.",
            "sos.offline.title": "La société ne va pas bien, ou je n'ai pas de réseau",
            "sos.offline.desc": "Un guide de survie hors ligne avec les connaissances pour tenir quand rien d'autre ne fonctionne.",
            "sos.cyber.title": "J'ai été piégé par du phishing ou piraté",
            "sos.cyber.desc": "Premiers secours pour les incidents en ligne : quoi faire juste après avoir cliqué.",
            "sos.contact": "Autre chose ne va pas ? Contactez-moi et je verrai ce que je peux faire pour aider.",
            "egg.stamp": "Vous êtes déjà ici, voyageur"
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
            "filters.active": "Aktive Entwicklung",
            "filters.finished": "Fertig",
            "filters.soon": "Demnächst",
            "search.label": "Projekte suchen",
            "search.placeholder": "Projekte, Tags suchen\u2026",
            "tags.label": "Nach Tag filtern",
            "tags.clear": "Tags zurücksetzen",
            "about.title": "Über dieses Portal",
            "about.text": "Ein zentraler Knotenpunkt für Navigation, Projektverwaltung und Besucherinformationen, gebaut mit reinem HTML, CSS und JavaScript. Keine Frameworks, keine Abhängigkeiten, kein Tracking.",
            "footer.message": "Gute Reise durch den Vortex.",
            "footer.business": "Geschäftlich",
            "footer.contact": "Kontakt",
            "footer.fun": "Spaß",
            "card.visit": "Besuchen",
            "card.soon": "Demnächst",
            "card.empty": "Keine Projekte in dieser Zeitlinie.",
            "status.active": "Aktive Entwicklung",
            "status.finished": "Fertig",
            "status.soon": "Demnächst",
            "sos.button": "Ich brauche Hilfe",
            "sos.title": "Brauchen Sie jetzt Hilfe?",
            "sos.lead": "Wählen Sie die Situation, die zu Ihrer passt.",
            "sos.close": "Schließen",
            "sos.online.title": "Ich brauche jetzt jemanden",
            "sos.online.desc": "Die Gesellschaft funktioniert und Sie haben Netz. Finden Sie offizielle Hilfetelefone und jemanden zum Reden.",
            "sos.offline.title": "Die Gesellschaft ist nicht in Ordnung, oder ich habe kein Netz",
            "sos.offline.desc": "Ein Offline-Überlebensleitfaden mit dem Wissen, um weiterzumachen, wenn nichts anderes funktioniert.",
            "sos.cyber.title": "Ich wurde gephisht, gehackt oder betrogen",
            "sos.cyber.desc": "Erste Hilfe bei Online-Vorfällen: was direkt nach dem Klick zu tun ist.",
            "sos.contact": "Ist etwas anderes los? Kontaktieren Sie mich und ich schaue, was ich tun kann.",
            "egg.stamp": "Sie sind bereits hier, Reisender"
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
            "filters.active": "تطوير نشط",
            "filters.finished": "مكتمل",
            "filters.soon": "قريباً",
            "search.label": "البحث في المشاريع",
            "search.placeholder": "ابحث في المشاريع والوسوم\u2026",
            "tags.label": "التصفية حسب الوسم",
            "tags.clear": "مسح الوسوم",
            "about.title": "حول هذه البوابة",
            "about.text": "مركز موحد للتنقل وإدارة المشاريع ومعلومات الزوار، مبني بلغة HTML وCSS وJavaScript خالصة. بدون أطر عمل، بدون تبعيات، بدون تتبع.",
            "footer.message": "رحلة آمنة عبر الدوامة.",
            "footer.business": "أعمال",
            "footer.contact": "اتصال",
            "footer.fun": "ترفيه",
            "card.visit": "زيارة",
            "card.soon": "قريباً",
            "card.empty": "لا توجد مشاريع في هذا الجدول الزمني.",
            "status.active": "تطوير نشط",
            "status.finished": "مكتمل",
            "status.soon": "قريباً",
            "sos.button": "أحتاج مساعدة",
            "sos.title": "هل تحتاج مساعدة الآن؟",
            "sos.lead": "اختر الحالة التي تناسب وضعك.",
            "sos.close": "إغلاق",
            "sos.online.title": "أحتاج شخصاً الآن",
            "sos.online.desc": "المجتمع يعمل ولديك اتصال بالشبكة. اعثر على خطوط مساعدة رسمية وشخص تتحدث إليه.",
            "sos.offline.title": "المجتمع ليس بخير، أو لا يوجد لدي اتصال",
            "sos.offline.desc": "دليل بقاء يعمل دون اتصال ويحتوي المعرفة اللازمة للاستمرار عندما لا يعمل أي شيء آخر.",
            "sos.cyber.title": "تعرضت للتصيد أو الاختراق أو الاحتيال",
            "sos.cyber.desc": "إسعافات أولية للحوادث الرقمية: ماذا تفعل فور النقر.",
            "sos.contact": "هل يحدث شيء آخر؟ تواصل معي وسأرى ما يمكنني فعله للمساعدة.",
            "egg.stamp": "أنت هنا بالفعل أيها المسافر"
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

    function tIn(lang, key) {
        const d = DICT[lang] || DICT.en;
        return d[key] || DICT.en[key] || key;
    }

    function applyStaticText() {
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            el.textContent = t(el.getAttribute("data-i18n"));
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
            el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
        });
        document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
            el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
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
        tIn: tIn,
        setLang: setLang,
        get lang() { return current; },
        get supported() { return SUPPORTED.slice(); },
        onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
        init: function () { setLang(detectInitial()); }
    };
})();
