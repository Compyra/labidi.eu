/* ============================================================
   projects.js — Project data + rendering.
   Edit the PROJECTS array to manage the catalogue.
   Each project's `name`/`desc` may be a string or a map of
   language codes for translated content.
   ============================================================ */

(function () {
    "use strict";

    /* status: "active" | "finished" | "archived"
       progress: 0-100 (used for active projects)
       url: string or null (null => "coming soon", not clickable) */
    const PROJECTS = [
        {
            name: "O.A.S.I.S.",
            desc: {
                en: "An air-gapped survival and field reference — before/during/after playbooks for every emergency, first aid, navigation, radio and hazard response, with working calculators. Loads once, then never needs the internet again.",
                fr: "Une référence de survie et de terrain entièrement hors ligne — des guides avant/pendant/après pour chaque urgence, premiers secours, navigation, radio et risques, avec des calculateurs fonctionnels. Se charge une fois, puis n'a plus jamais besoin d'Internet.",
                de: "Ein netzunabhängiges Überlebens- und Feldhandbuch — Playbooks für vor, während und nach jedem Notfall, Erste Hilfe, Navigation, Funk und Gefahrenabwehr, mit funktionierenden Rechnern. Einmal geladen, danach nie wieder Internet nötig.",
                ar: "مرجع ميداني للنجاة يعمل دون اتصال بالكامل — أدلة لما قبل الطوارئ وأثنائها وبعدها، مع الإسعافات الأولية والملاحة والاتصال اللاسلكي ومواجهة المخاطر، وحاسبات عملية. يُحمَّل مرة واحدة ثم لا يحتاج إلى الإنترنت أبداً."
            },
            status: "finished",
            progress: 100,
            url: "https://oasis.labidi.eu",
            tags: ["Survival", "Offline", "Reference"]
        },
        {
            name: "GHOSTTOOTH",
            desc: {
                en: "Real-time Bluetooth surveillance & tracker detector running fully in the browser.",
                fr: "Détecteur de traceurs et de surveillance Bluetooth en temps réel, entièrement dans le navigateur.",
                de: "Echtzeit-Bluetooth-Überwachungs- und Tracker-Detektor, vollständig im Browser.",
                ar: "كاشف تتبع ومراقبة بلوتوث في الوقت الفعلي يعمل بالكامل في المتصفح."
            },
            status: "active",
            progress: 70,
            url: "https://ghosttooth.labidi.eu",
            tags: ["Bluetooth", "Security"]
        },
        {
            name: "4ck.org",
            desc: {
                en: "A story-driven Capture The Flag site — an immersive hacking narrative where every page is a location inside the grid.",
                fr: "Un site Capture The Flag narratif — une aventure de piratage immersive où chaque page est un lieu à l'intérieur du réseau.",
                de: "Eine story-getriebene Capture-The-Flag-Seite — ein immersives Hacking-Abenteuer, in dem jede Seite ein Ort innerhalb des Grids ist.",
                ar: "موقع Capture The Flag قائم على قصة — مغامرة اختراق غامرة حيث تُمثّل كل صفحة موقعاً داخل الشبكة."
            },
            status: "active",
            progress: 30,
            url: "https://4ck.org",
            tags: ["CTF", "Storytelling"]
        },
        {
            name: "note.labidi.eu",
            desc: {
                en: "A self-contained, dependency-free code editor running entirely in the browser.",
                fr: "Un éditeur de code autonome et sans dépendance, fonctionnant entièrement dans le navigateur.",
                de: "Ein eigenständiger, abhängigkeitsfreier Code-Editor, der vollständig im Browser läuft.",
                ar: "محرر أكواد مستقل وبدون تبعيات يعمل بالكامل في المتصفح."
            },
            status: "finished",
            progress: 100,
            url: "https://note.labidi.eu",
            tags: ["Editor", "Offline"]
        },
        {
            name: "Temporal Portal",
            desc: {
                en: "This very start page — a dependency-free, multilingual, space-themed launch hub.",
                fr: "Cette page d'accueil — un hub de lancement multilingue sur le thème de l'espace, sans dépendance.",
                de: "Diese Startseite — ein abhängigkeitsfreier, mehrsprachiger, weltraumthematischer Start-Hub.",
                ar: "هذه الصفحة الرئيسية — مركز إطلاق متعدد اللغات بطابع فضائي وبدون تبعيات."
            },
            status: "finished",
            progress: 100,
            url: "https://labidi.eu",
            tags: ["Portal", "Multilingual"]
        },
        {
            name: "rami.party",
            desc: {
                en: "My personal test area — a sandbox where I spin up new sites, park half-formed ideas and push at the limits of what the web can do.",
                fr: "Mon terrain d'essai personnel — un bac à sable où je lance de nouveaux sites, gare des idées en germe et explore les limites du web.",
                de: "Mein persönlicher Testbereich — eine Spielwiese, auf der ich neue Websites starte, halbfertige Ideen ablege und auslote, was im Web möglich ist.",
                ar: "منطقة الاختبار الشخصية الخاصة بي — مساحة تجريبية أُطلق فيها مواقع جديدة وأضع أفكاراً قيد التشكّل وأستكشف حدود ما يمكن للويب فعله."
            },
            status: "active",
            progress: 50,
            url: "https://rami.party",
            tags: ["Experiments", "Prototypes"]
        },
        {
            name: "Huiskeuring.be",
            desc: {
                en: "A polished home-inspection service site — Dutch-language, aimed at property inspections in Belgium.",
                fr: "Un site soigné de service d'inspection immobilière — en néerlandais, dédié aux expertises de biens en Belgique.",
                de: "Eine ausgefeilte Website für Hausinspektionen — auf Niederländisch, für Immobilienbegutachtungen in Belgien.",
                ar: "موقع أنيق لخدمة فحص المنازل — باللغة الهولندية، مخصص لفحص العقارات في بلجيكا."
            },
            status: "finished",
            progress: 100,
            url: "https://huiskeuring.be",
            tags: ["Business", "IRL"]
        },
        {
            name: "Militaire Alphabet",
            desc: {
                en: "A page that keeps the computer awake and unlocked while it is open or in focus.",
                fr: "Une page qui empêche l'ordinateur de se verrouiller tant qu'elle est ouverte ou au premier plan.",
                de: "Eine Seite, die den Computer wach und entsperrt hält, solange sie geöffnet oder im Fokus ist.",
                ar: "صفحة تُبقي الحاسوب مستيقظاً وغير مقفل ما دامت مفتوحة أو في التركيز."
            },
            status: "finished",
            progress: 100,
            url: "https://rami.party/gallery/militaryalphabet/",
            tags: ["Wake Lock", "Utility"]
        },
        {
            name: "DNS Sinkhole",
            desc: {
                en: "Notes and tooling around a self-hosted DNS-based ad & tracker blocker.",
                fr: "Notes et outils autour d'un bloqueur de publicités et de traceurs auto-hébergé basé sur DNS.",
                de: "Notizen und Werkzeuge rund um einen selbst gehosteten DNS-basierten Werbe- und Tracker-Blocker.",
                ar: "ملاحظات وأدوات حول حاجب إعلانات وتتبع قائم على DNS مستضاف ذاتياً."
            },
            status: "archived",
            progress: 100,
            url: null,
            tags: ["Networking", "Privacy"],
            hidden: true
        },
        {
            name: "Fake Update",
            desc: {
                en: "A full-screen prank simulating an endless operating-system update.",
                fr: "Une farce en plein écran simulant une mise à jour interminable du système d'exploitation.",
                de: "Ein Vollbild-Streich, der ein endloses Betriebssystem-Update simuliert.",
                ar: "مقلب بملء الشاشة يحاكي تحديث نظام تشغيل لا ينتهي."
            },
            status: "archived",
            progress: 100,
            url: "https://rami.party/gallery/prankscreens/windows11/",
            tags: ["Prank"],
            hidden: true
        }
    ];

    function localize(field) {
        if (typeof field === "string") return field;
        const lang = window.I18N ? window.I18N.lang : "en";
        return field[lang] || field.en || Object.values(field)[0] || "";
    }

    /* Current view state: status filter + free-text query + selected tags. */
    let state = { filter: "all", query: "", tags: [] };

    function visibleProjects() {
        return PROJECTS.filter(function (p) { return !p.hidden; });
    }

    function allTags() {
        const seen = [];
        visibleProjects().forEach(function (p) {
            (p.tags || []).forEach(function (tag) {
                if (seen.indexOf(tag) === -1) seen.push(tag);
            });
        });
        return seen.sort(function (a, b) { return a.localeCompare(b); });
    }

    /* A project must match the status filter, every selected tag (AND),
       and the search query (name / description / tags). */
    function matches(p) {
        if (state.filter !== "all" && p.status !== state.filter) return false;

        const hasAllTags = state.tags.every(function (tag) {
            return (p.tags || []).indexOf(tag) !== -1;
        });
        if (!hasAllTags) return false;

        if (state.query) {
            /* The name is also indexed with punctuation stripped, so "oasis"
               finds "O.A.S.I.S." and "4ckorg" finds "4ck.org". */
            const haystack = (
                p.name + " " + p.name.replace(/[.\-_/\s]/g, "") + " " +
                localize(p.desc) + " " + (p.tags || []).join(" ")
            ).toLowerCase();
            if (haystack.indexOf(state.query) === -1) return false;
        }
        return true;
    }

    function statusLabel(status) {
        return window.I18N ? window.I18N.t("status." + status) : status;
    }

    function createCard(p, index) {
        const li = document.createElement("li");
        li.className = "project-card";
        li.dataset.status = p.status;
        li.style.animationDelay = (index * 70) + "ms";

        const head = document.createElement("div");
        head.className = "project-card__head";

        const title = document.createElement("h3");
        title.className = "project-card__title";
        title.textContent = p.name;

        const badge = document.createElement("span");
        badge.className = "badge badge--" + p.status;
        badge.textContent = statusLabel(p.status);

        head.append(title, badge);

        const desc = document.createElement("p");
        desc.className = "project-card__desc";
        desc.textContent = localize(p.desc);

        li.append(head, desc);

        // Progress bar for active projects
        if (p.status === "active" && typeof p.progress === "number") {
            const progress = document.createElement("div");
            progress.className = "progress";
            progress.setAttribute("role", "progressbar");
            progress.setAttribute("aria-valuenow", String(p.progress));
            progress.setAttribute("aria-valuemin", "0");
            progress.setAttribute("aria-valuemax", "100");
            const bar = document.createElement("div");
            bar.className = "progress__bar";
            progress.append(bar);
            li.append(progress);
            // Animate width on next frame
            requestAnimationFrame(function () { bar.style.width = p.progress + "%"; });
        }

        // Footer: tags + link
        const foot = document.createElement("div");
        foot.className = "project-card__foot";

        const tags = document.createElement("div");
        tags.className = "project-card__tags";
        (p.tags || []).forEach(function (tagText) {
            const tag = document.createElement("button");
            tag.type = "button";
            tag.className = "tag";
            tag.dataset.tag = tagText;
            tag.textContent = tagText;
            tag.setAttribute("aria-pressed",
                state.tags.indexOf(tagText) !== -1 ? "true" : "false");
            // Bubbles up to the document, where main.js toggles the filter.
            tag.addEventListener("click", function (e) {
                e.preventDefault();
                tag.dispatchEvent(new CustomEvent("project:tag", {
                    detail: tagText,
                    bubbles: true
                }));
            });
            tags.append(tag);
        });

        const link = document.createElement("a");
        link.className = "project-card__link";
        if (p.url) {
            link.href = p.url;
            link.rel = "noopener noreferrer";
            link.innerHTML = "<span></span><span class='arrow' aria-hidden='true'>&rarr;</span>";
            link.firstElementChild.textContent =
                window.I18N ? window.I18N.t("card.visit") : "Visit";
        } else {
            link.setAttribute("aria-disabled", "true");
            link.textContent = window.I18N ? window.I18N.t("card.soon") : "Coming soon";
        }

        foot.append(tags, link);
        li.append(foot);

        // Whole-card click opens the project (mirrors the "Visit" link),
        // while keeping the real anchor for keyboard & assistive tech.
        if (p.url) {
            li.classList.add("project-card--clickable");

            const openCard = function (e) {
                // Let real interactive elements (the link) behave natively.
                if (e.target.closest("a, button")) return;
                // Don't hijack an intentional text selection.
                const sel = window.getSelection && window.getSelection().toString();
                if (sel) return;

                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
                    window.open(p.url, "_blank", "noopener");
                } else {
                    window.location.href = p.url;
                }
            };

            li.addEventListener("click", openCard);
            // Middle-click (opens in a new tab).
            li.addEventListener("auxclick", function (e) {
                if (e.button === 1) openCard(e);
            });
        }

        return li;
    }

    function render(filter, query, tags) {
        state = {
            filter: filter || "all",
            query: (query || "").trim().toLowerCase(),
            tags: (tags || []).slice()
        };

        const grid = document.getElementById("project-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const pool = visibleProjects();
        const list = pool.filter(matches);

        const countEl = document.getElementById("project-count");
        if (countEl) countEl.textContent = list.length + " / " + pool.length;

        if (list.length === 0) {
            const empty = document.createElement("li");
            empty.className = "project-empty";
            empty.textContent = window.I18N ? window.I18N.t("card.empty") : "No projects.";
            grid.append(empty);
            return;
        }

        list.forEach(function (p, i) { grid.append(createCard(p, i)); });
    }

    window.Projects = {
        render: render,
        get all() { return PROJECTS.slice(); },
        get tags() { return allTags(); }
    };
})();
