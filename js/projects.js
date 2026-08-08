/* ============================================================
   projects.js - Project data + rendering.
   Edit the PROJECTS array to manage the catalogue.
   Each project's `name`/`desc` may be a string or a map of
   language codes for translated content.
   ============================================================ */

(function () {
    "use strict";

    /* status: "active" | "finished" | "soon"
       progress: 0-100 (used for active projects)
       url: string or null (null => "coming soon", not clickable)
       egg: true => clicking never navigates (easter-egg hook) */
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
            tags: ["Security", "Privacy"]
        },
        {
            name: "O.A.S.I.S.",
            desc: {
                en: "Offline Advanced System for Information and Survival: a knowledge base that works with no connection at all.",
                fr: "Système avancé hors ligne d'information et de survie : une base de connaissances qui fonctionne sans aucune connexion.",
                de: "Offline-Wissensbasis für Information und Überleben, funktioniert ganz ohne Verbindung.",
                ar: "نظام متقدم للمعلومات والبقاء يعمل دون أي اتصال."
            },
            status: "finished",
            progress: 100,
            url: "https://oasis.labidi.eu",
            tags: ["Offline", "Survival", "Safety"]
        },
        {
            name: "Oasis Online",
            desc: {
                en: "Official emergency numbers and helplines worldwide. Verified numbers only, free and anonymous.",
                fr: "Numéros d'urgence et lignes d'écoute officiels dans le monde entier. Vérifiés, gratuits et anonymes.",
                de: "Offizielle Notrufnummern und Hilfetelefone weltweit. Nur geprüfte Nummern, kostenlos und anonym.",
                ar: "أرقام طوارئ وخطوط مساعدة رسمية حول العالم. أرقام موثوقة فقط، مجانية ومجهولة."
            },
            status: "active",
            progress: 80,
            url: "https://oasis-online.labidi.eu",
            tags: ["Help", "Safety"]
        },
        {
            name: "Breachlight",
            desc: {
                en: "What to do the moment after you clicked: calm, step-by-step first aid for phishing and other online incidents.",
                fr: "Quoi faire juste après avoir cliqué : des premiers secours pas à pas pour le phishing et autres incidents en ligne.",
                de: "Was direkt nach dem Klick zu tun ist: ruhige Schritt-für-Schritt-Hilfe bei Phishing und anderen Online-Vorfällen.",
                ar: "ماذا تفعل فور النقر: إسعافات أولية خطوة بخطوة للتصيد وحوادث الإنترنت الأخرى."
            },
            status: "active",
            progress: 75,
            url: "https://breach.labidi.eu",
            tags: ["Security", "Help"]
        },
        {
            name: "Mail Ward",
            desc: {
                en: "SPF, DKIM and DMARC explained in plain language, with a record builder, inspector and rollout plan.",
                fr: "SPF, DKIM et DMARC expliqués simplement, avec un générateur d'enregistrements, un inspecteur et un plan de déploiement.",
                de: "SPF, DKIM und DMARC verständlich erklärt, mit Record-Builder, Inspektor und Einführungsplan.",
                ar: "شرح مبسط لـ SPF وDKIM وDMARC، مع أداة إنشاء السجلات وفاحص وخطة تطبيق."
            },
            status: "active",
            progress: 85,
            url: "https://mail.labidi.eu",
            tags: ["Email", "Security"]
        },
        {
            name: "PDF Studio",
            desc: {
                en: "A PDF toolbox running entirely in the browser: merge, split, edit and more. Files never leave the device.",
                fr: "Une boîte à outils PDF entièrement dans le navigateur : fusionner, diviser, modifier et plus. Les fichiers ne quittent jamais l'appareil.",
                de: "Ein PDF-Werkzeugkasten komplett im Browser: zusammenführen, teilen, bearbeiten und mehr. Dateien verlassen nie das Gerät.",
                ar: "صندوق أدوات PDF يعمل بالكامل في المتصفح: دمج وتقسيم وتحرير والمزيد. الملفات لا تغادر الجهاز أبداً."
            },
            status: "finished",
            progress: 100,
            url: "https://pdf.labidi.eu",
            tags: ["PDF", "Tools", "Offline"]
        },
        {
            name: "Markdown Studio",
            desc: {
                en: "A split-view Markdown editor with live preview, twelve themes and zero network calls.",
                fr: "Un éditeur Markdown en vue partagée avec aperçu en direct, douze thèmes et aucun appel réseau.",
                de: "Ein Markdown-Editor mit geteilter Ansicht, Live-Vorschau, zwölf Themes und null Netzwerkzugriffen.",
                ar: "محرر ماركداون بعرض مقسوم مع معاينة مباشرة واثنتي عشرة سمة وبدون أي اتصالات شبكة."
            },
            status: "finished",
            progress: 100,
            url: "https://md.labidi.eu",
            tags: ["Markdown", "Editor"]
        },
        {
            name: "Note",
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
            name: "Todo",
            desc: {
                en: "A daily board for quick notes and tasks that lives entirely in the browser.",
                fr: "Un tableau quotidien pour notes rapides et tâches, directement dans le navigateur.",
                de: "Ein tägliches Board für schnelle Notizen und Aufgaben, direkt im Browser.",
                ar: "لوحة يومية للملاحظات السريعة والمهام تعمل في المتصفح."
            },
            status: "finished",
            progress: 100,
            url: "https://todo.labidi.eu",
            tags: ["Notes", "Tasks"]
        },
        {
            name: "BeeFirst",
            desc: {
                en: "Everyone lands a finger on the screen and the hive picks who goes first: a fair first-player and team picker.",
                fr: "Chacun pose un doigt sur l'écran et la ruche choisit qui commence : un tirage équitable du premier joueur et des équipes.",
                de: "Alle legen einen Finger auf den Bildschirm und der Schwarm wählt, wer anfängt: faire Auswahl von Startspieler und Teams.",
                ar: "يضع الجميع إصبعاً على الشاشة وتختار الخلية من يبدأ: اختيار عادل لأول لاعب وللفرق."
            },
            status: "active",
            progress: 90,
            url: "https://beefirst.labidi.eu",
            tags: ["Game", "Tools"]
        },
        {
            name: "Alphabet Studio",
            desc: {
                en: "Phonetic alphabet studio covering military, world and fantasy spelling codes.",
                fr: "Studio d'alphabets phonétiques : codes d'épellation militaires, du monde et fantastiques.",
                de: "Studio für phonetische Alphabete: militärische, internationale und Fantasy-Buchstabiercodes.",
                ar: "استوديو الأبجديات الصوتية: رموز تهجئة عسكرية وعالمية وخيالية."
            },
            status: "finished",
            progress: 100,
            url: "https://alphabet.labidi.eu",
            tags: ["Learning"]
        },
        {
            name: "Temporal Portal",
            desc: {
                en: "This very start page: a dependency-free, multilingual, space-themed launch hub.",
                fr: "Cette page d'accueil : un hub de lancement multilingue sur le thème de l'espace, sans dépendance.",
                de: "Diese Startseite: ein abhängigkeitsfreier, mehrsprachiger Start-Hub im Weltraum-Stil.",
                ar: "هذه الصفحة الرئيسية: مركز إطلاق متعدد اللغات بطابع فضائي وبدون تبعيات."
            },
            status: "finished",
            progress: 100,
            url: "https://labidi.eu",
            egg: true,
            tags: ["Portal"]
        },
        {
            name: "Fake Update",
            desc: {
                en: "A full-screen prank simulating an endless operating-system update.",
                fr: "Une farce en plein écran simulant une mise à jour interminable du système d'exploitation.",
                de: "Ein Vollbild-Streich, der ein endloses Betriebssystem-Update simuliert.",
                ar: "مقلب بملء الشاشة يحاكي تحديث نظام تشغيل لا ينتهي."
            },
            status: "soon",
            progress: 100,
            url: null,
            tags: ["Prank"]
        },
        {
            name: "The People Library",
            desc: {
                en: "A library of interactive workshops on personality, behaviour and communication.",
                fr: "Une bibliothèque d'ateliers interactifs sur la personnalité, le comportement et la communication.",
                de: "Eine Bibliothek interaktiver Workshops zu Persönlichkeit, Verhalten und Kommunikation.",
                ar: "مكتبة ورش تفاعلية حول الشخصية والسلوك والتواصل."
            },
            status: "soon",
            progress: 100,
            url: null,
            tags: ["Psychology", "Learning"]
        },
        {
            name: "DNS Sinkhole",
            desc: {
                en: "Notes and tooling around a self-hosted DNS-based ad & tracker blocker.",
                fr: "Notes et outils autour d'un bloqueur de publicités et de traceurs auto-hébergé basé sur DNS.",
                de: "Notizen und Werkzeuge rund um einen selbst gehosteten DNS-basierten Werbe- und Tracker-Blocker.",
                ar: "ملاحظات وأدوات حول حاجب إعلانات وتتبع قائم على DNS مستضاف ذاتياً."
            },
            status: "soon",
            progress: 100,
            url: null,
            tags: ["Privacy", "Security"]
        }
    ];

    function localize(field) {
        if (typeof field === "string") return field;
        const lang = window.I18N ? window.I18N.lang : "en";
        return field[lang] || field.en || Object.values(field)[0] || "";
    }

    function prettyUrl(url) {
        try {
            const u = new URL(url);
            return u.host + (u.pathname === "/" ? "" : u.pathname.replace(/\/$/, ""));
        } catch (e) {
            return url;
        }
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

        const titles = document.createElement("div");
        titles.className = "project-card__titles";

        const title = document.createElement("h3");
        title.className = "project-card__title";
        title.textContent = p.name;
        titles.append(title);

        // Small URL revealed on hover/focus, underneath the name
        if (p.url) {
            const urlEl = document.createElement("span");
            urlEl.className = "project-card__url";
            urlEl.textContent = prettyUrl(p.url);
            titles.append(urlEl);
        }

        const badge = document.createElement("span");
        badge.className = "badge badge--" + p.status;
        badge.textContent = statusLabel(p.status);

        head.append(titles, badge);

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
            tag.textContent = tagText;
            tag.addEventListener("click", function () {
                document.dispatchEvent(new CustomEvent("project:tag", { detail: tagText }));
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

        // Easter-egg card: clicking never reloads, it triggers a random effect.
        if (p.egg) {
            li.classList.add("project-card--clickable");
            li.addEventListener("click", function (e) {
                if (e.target.closest("button.tag")) return;
                e.preventDefault();
                if (window.PortalEgg) window.PortalEgg.trigger(li);
            });
        } else if (p.url) {
            // Whole-card click opens the project (mirrors the "Visit" link),
            // while keeping the real anchor for keyboard & assistive tech.
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

    function matches(p, filter, query, tags) {
        if (filter !== "all" && p.status !== filter) return false;
        if (tags.length && !tags.every(function (t) {
            return (p.tags || []).indexOf(t) !== -1;
        })) return false;
        if (query) {
            const hay = (p.name + " " + localize(p.desc) + " " +
                (p.tags || []).join(" ")).toLowerCase();
            if (hay.indexOf(query) === -1) return false;
        }
        return true;
    }

    function render(filter, query, tags) {
        const grid = document.getElementById("project-grid");
        if (!grid) return;
        grid.innerHTML = "";

        filter = filter || "all";
        const q = (query || "").trim().toLowerCase();
        const activeTags = tags || [];

        const list = PROJECTS.filter(function (p) {
            return matches(p, filter, q, activeTags);
        });

        const count = document.getElementById("project-count");
        if (count) count.textContent = list.length + " / " + PROJECTS.length;

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
        get tags() {
            const seen = [];
            PROJECTS.forEach(function (p) {
                (p.tags || []).forEach(function (t) {
                    if (seen.indexOf(t) === -1) seen.push(t);
                });
            });
            return seen.sort();
        }
    };
})();
