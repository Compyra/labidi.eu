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
            tags: ["Web Bluetooth", "Security", "Canvas"]
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
            tags: ["Editor", "PWA", "Offline"]
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
            tags: ["HTML", "CSS", "JS"]
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
            tags: ["Networking", "Privacy"]
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
            url: "https://lebon.info/projects/fakeupdate/",
            tags: ["Prank"]
        }
    ];

    function localize(field) {
        if (typeof field === "string") return field;
        const lang = window.I18N ? window.I18N.lang : "en";
        return field[lang] || field.en || Object.values(field)[0] || "";
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
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = tagText;
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

    function render(filter) {
        const grid = document.getElementById("project-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const list = PROJECTS.filter(function (p) {
            return filter === "all" || p.status === filter;
        });

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
        get all() { return PROJECTS.slice(); }
    };
})();
