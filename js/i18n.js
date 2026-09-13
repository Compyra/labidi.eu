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
            "filters.tools": "Tools",
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
            "card.tool": "Tool",
            "status.active": "Active Dev.",
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
            "egg.stamp": "You are already here, traveler",
            "footer.privacy": "Privacy",
            "notfound.eyebrow": "Temporal anomaly detected",
            "notfound.title": "This page is lost in the vortex",
            "notfound.subtitle": "The coordinates you followed do not exist in this timeline. The page may have been moved, erased, or never built.",
            "notfound.path": "Requested coordinates",
            "notfound.home": "Return to the portal",
            "notfound.report": "Report this anomaly",
            "privacy.eyebrow": "Transparency transmission",
            "privacy.title": "Privacy",
            "privacy.subtitle": "How this portal treats your data: in short, it does not want any.",
            "privacy.updated": "Last updated",
            "privacy.tldr": "The short version: this site collects no personal data, sets no cookies and runs no trackers. Everything below is detail.",
            "privacy.tracking.title": "No tracking",
            "privacy.tracking.text": "No analytics, no advertising, no fingerprinting, no cookies, no third-party scripts. Visits are not counted, profiled or shared. What you do here stays between you and your browser.",
            "privacy.storage.title": "Preferences on your device",
            "privacy.storage.text": "Theme, motion and language choices are saved in your browser's local storage so the portal remembers them. They never leave your device, and clearing your browser data removes them completely.",
            "privacy.hosting.title": "Hosting",
            "privacy.hosting.text": "This site is served as static files by GitHub Pages. Like any web host, GitHub may log requests (such as IP addresses) for security and operational reasons; I never see or use those logs.",
            "privacy.hosting.link": "GitHub Privacy Statement",
            "privacy.links.title": "Other destinations",
            "privacy.links.text": "Projects listed here link to other sites and subdomains, each with its own privacy practices. This policy covers labidi.eu only, so check the destination when you travel onwards.",
            "privacy.email.title": "If you email me",
            "privacy.email.text": "Writing to info@labidi.eu shares whatever you put in the message. It is used only to reply to you, is never added to any list and is never passed to anyone else.",
            "privacy.changes.title": "Changes",
            "privacy.changes.text": "If anything about this policy changes, the update appears on this page with a new date. There is no tracking to add, so do not expect much drama.",
            "privacy.contact": "Questions about any of this? Ask directly:"
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
            "filters.tools": "Outils",
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
            "card.tool": "Outil",
            "status.active": "Dév. actif",
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
            "egg.stamp": "Vous êtes déjà ici, voyageur",
            "footer.privacy": "Confidentialité",
            "notfound.eyebrow": "Anomalie temporelle détectée",
            "notfound.title": "Cette page s'est perdue dans le vortex",
            "notfound.subtitle": "Les coordonnées que vous avez suivies n'existent pas dans cette chronologie. La page a peut-être été déplacée, effacée, ou jamais construite.",
            "notfound.path": "Coordonnées demandées",
            "notfound.home": "Retour au portail",
            "notfound.report": "Signaler cette anomalie",
            "privacy.eyebrow": "Transmission de transparence",
            "privacy.title": "Confidentialité",
            "privacy.subtitle": "Comment ce portail traite vos données : en bref, il n'en veut aucune.",
            "privacy.updated": "Dernière mise à jour",
            "privacy.tldr": "La version courte : ce site ne collecte aucune donnée personnelle, ne dépose aucun cookie et n'exécute aucun traceur. Tout ce qui suit n'est que du détail.",
            "privacy.tracking.title": "Aucun suivi",
            "privacy.tracking.text": "Pas d'analytique, pas de publicité, pas d'empreinte numérique, pas de cookies, pas de scripts tiers. Les visites ne sont ni comptées, ni profilées, ni partagées. Ce que vous faites ici reste entre vous et votre navigateur.",
            "privacy.storage.title": "Préférences sur votre appareil",
            "privacy.storage.text": "Les choix de thème, d'animation et de langue sont enregistrés dans le stockage local de votre navigateur pour que le portail s'en souvienne. Ils ne quittent jamais votre appareil, et effacer les données de votre navigateur les supprime complètement.",
            "privacy.hosting.title": "Hébergement",
            "privacy.hosting.text": "Ce site est servi en fichiers statiques par GitHub Pages. Comme tout hébergeur, GitHub peut journaliser les requêtes (comme les adresses IP) pour des raisons de sécurité et d'exploitation ; je ne consulte ni n'utilise jamais ces journaux.",
            "privacy.hosting.link": "Déclaration de confidentialité de GitHub",
            "privacy.links.title": "Autres destinations",
            "privacy.links.text": "Les projets répertoriés ici mènent vers d'autres sites et sous-domaines, chacun avec ses propres pratiques de confidentialité. Cette politique ne couvre que labidi.eu : vérifiez la destination quand vous poursuivez le voyage.",
            "privacy.email.title": "Si vous m'écrivez",
            "privacy.email.text": "Écrire à info@labidi.eu partage ce que vous mettez dans le message. Il sert uniquement à vous répondre, n'est jamais ajouté à une liste et n'est jamais transmis à qui que ce soit.",
            "privacy.changes.title": "Modifications",
            "privacy.changes.text": "Si quelque chose change dans cette politique, la mise à jour apparaît sur cette page avec une nouvelle date. Il n'y a aucun suivi à ajouter, ne vous attendez donc pas à beaucoup de rebondissements.",
            "privacy.contact": "Des questions sur tout cela ? Demandez directement :"
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
            "filters.tools": "Tools",
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
            "card.tool": "Tool",
            "status.active": "Aktive Entw.",
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
            "egg.stamp": "Sie sind bereits hier, Reisender",
            "footer.privacy": "Datenschutz",
            "notfound.eyebrow": "Temporale Anomalie entdeckt",
            "notfound.title": "Diese Seite ist im Vortex verloren gegangen",
            "notfound.subtitle": "Die Koordinaten, denen Sie gefolgt sind, existieren in dieser Zeitlinie nicht. Die Seite wurde vielleicht verschoben, gelöscht oder nie gebaut.",
            "notfound.path": "Angeforderte Koordinaten",
            "notfound.home": "Zurück zum Portal",
            "notfound.report": "Anomalie melden",
            "privacy.eyebrow": "Transparenz-Übertragung",
            "privacy.title": "Datenschutz",
            "privacy.subtitle": "Wie dieses Portal mit Ihren Daten umgeht: kurz gesagt, es will keine.",
            "privacy.updated": "Zuletzt aktualisiert",
            "privacy.tldr": "Die Kurzfassung: Diese Seite sammelt keine personenbezogenen Daten, setzt keine Cookies und betreibt keine Tracker. Alles Weitere ist Detail.",
            "privacy.tracking.title": "Kein Tracking",
            "privacy.tracking.text": "Keine Analyse, keine Werbung, kein Fingerprinting, keine Cookies, keine Skripte von Dritten. Besuche werden weder gezählt noch profiliert noch geteilt. Was Sie hier tun, bleibt zwischen Ihnen und Ihrem Browser.",
            "privacy.storage.title": "Einstellungen auf Ihrem Gerät",
            "privacy.storage.text": "Thema, Animation und Sprache werden im lokalen Speicher Ihres Browsers abgelegt, damit das Portal sie sich merkt. Sie verlassen Ihr Gerät nie, und das Löschen Ihrer Browserdaten entfernt sie vollständig.",
            "privacy.hosting.title": "Hosting",
            "privacy.hosting.text": "Diese Seite wird als statische Dateien von GitHub Pages ausgeliefert. Wie jeder Anbieter kann GitHub Anfragen (etwa IP-Adressen) aus Sicherheits- und Betriebsgründen protokollieren; ich sehe oder nutze diese Protokolle nie.",
            "privacy.hosting.link": "GitHub-Datenschutzerklärung",
            "privacy.links.title": "Andere Ziele",
            "privacy.links.text": "Die hier gelisteten Projekte führen zu anderen Seiten und Subdomains, jede mit eigenen Datenschutzpraktiken. Diese Erklärung gilt nur für labidi.eu: prüfen Sie das Ziel, wenn Sie weiterreisen.",
            "privacy.email.title": "Wenn Sie mir schreiben",
            "privacy.email.text": "Eine E-Mail an info@labidi.eu teilt, was Sie in die Nachricht schreiben. Sie dient nur der Antwort an Sie, landet nie auf einer Liste und wird nie an Dritte weitergegeben.",
            "privacy.changes.title": "Änderungen",
            "privacy.changes.text": "Ändert sich etwas an dieser Erklärung, erscheint die Aktualisierung auf dieser Seite mit neuem Datum. Es gibt kein Tracking, das hinzukommen könnte, erwarten Sie also wenig Drama.",
            "privacy.contact": "Fragen dazu? Fragen Sie direkt:"
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
            "filters.tools": "أدوات",
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
            "card.tool": "أداة",
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
            "egg.stamp": "أنت هنا بالفعل أيها المسافر",
            "footer.privacy": "الخصوصية",
            "notfound.eyebrow": "تم رصد شذوذ زمني",
            "notfound.title": "ضاعت هذه الصفحة في الدوامة",
            "notfound.subtitle": "الإحداثيات التي تبعتها غير موجودة في هذا الجدول الزمني. ربما نُقلت الصفحة أو مُحيت أو لم تُبنَ بعد.",
            "notfound.path": "الإحداثيات المطلوبة",
            "notfound.home": "العودة إلى البوابة",
            "notfound.report": "الإبلاغ عن هذا الشذوذ",
            "privacy.eyebrow": "بث الشفافية",
            "privacy.title": "الخصوصية",
            "privacy.subtitle": "كيف تتعامل هذه البوابة مع بياناتك: باختصار، هي لا تريد أياً منها.",
            "privacy.updated": "آخر تحديث",
            "privacy.tldr": "النسخة المختصرة: هذا الموقع لا يجمع أي بيانات شخصية، ولا يضع أي ملفات تعريف ارتباط، ولا يشغّل أي متتبعات. كل ما يلي مجرد تفاصيل.",
            "privacy.tracking.title": "لا تتبع",
            "privacy.tracking.text": "لا تحليلات، لا إعلانات، لا بصمة رقمية، لا ملفات تعريف ارتباط، لا نصوص برمجية من أطراف ثالثة. الزيارات لا تُعد ولا تُحلل ولا تُشارك. ما تفعله هنا يبقى بينك وبين متصفحك.",
            "privacy.storage.title": "التفضيلات على جهازك",
            "privacy.storage.text": "تُحفظ خيارات السمة والحركة واللغة في التخزين المحلي لمتصفحك كي تتذكرها البوابة. لا تغادر جهازك أبداً، ومسح بيانات المتصفح يزيلها تماماً.",
            "privacy.hosting.title": "الاستضافة",
            "privacy.hosting.text": "يُقدَّم هذا الموقع كملفات ثابتة عبر GitHub Pages. وكأي مستضيف، قد تسجل GitHub الطلبات (مثل عناوين IP) لأسباب أمنية وتشغيلية؛ أنا لا أطلع على تلك السجلات ولا أستخدمها أبداً.",
            "privacy.hosting.link": "بيان خصوصية GitHub",
            "privacy.links.title": "وجهات أخرى",
            "privacy.links.text": "المشاريع المدرجة هنا تقود إلى مواقع ونطاقات فرعية أخرى، لكل منها ممارساتها الخاصة في الخصوصية. تغطي هذه السياسة labidi.eu فقط، فتحقق من وجهتك عندما تواصل الرحلة.",
            "privacy.email.title": "إذا راسلتني",
            "privacy.email.text": "مراسلة info@labidi.eu تشارك ما تضعه في الرسالة. تُستخدم فقط للرد عليك، ولا تُضاف إلى أي قائمة، ولا تُمرر إلى أي جهة أخرى.",
            "privacy.changes.title": "التغييرات",
            "privacy.changes.text": "إذا تغير شيء في هذه السياسة، يظهر التحديث على هذه الصفحة بتاريخ جديد. لا يوجد تتبع لإضافته، فلا تتوقع الكثير من الإثارة.",
            "privacy.contact": "أسئلة حول أي من هذا؟ اسأل مباشرة:"
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
