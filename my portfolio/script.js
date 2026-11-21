/* ============================================================
   Sanyam Soni — Portfolio interactions + data binding
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
    "use strict";

    var STORAGE_KEY = "sanyamPortfolioData";

    /* ---------- Data source: saved admin edits, else data.js ---------- */
    function loadData() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) { /* ignore corrupt storage */ }
        return window.PORTFOLIO_DATA || null;
    }

    var DATA = loadData();

    /* ---------- Small DOM helpers ---------- */
    function setText(id, value) {
        var el = document.getElementById(id);
        if (el && value !== undefined && value !== null) el.textContent = String(value);
    }
    function findContact(key) {
        if (!DATA || !Array.isArray(DATA.contact)) return null;
        for (var i = 0; i < DATA.contact.length; i++) {
            if (DATA.contact[i].key === key) return DATA.contact[i];
        }
        return null;
    }
    function node(tag, className, text) {
        var n = document.createElement(tag);
        if (className) n.className = className;
        if (text !== undefined && text !== null) n.textContent = String(text);
        return n;
    }
    function fill(id, children) {
        var host = document.getElementById(id);
        if (!host) return;
        host.textContent = "";
        children.forEach(function (c) { host.appendChild(c); });
    }
    // Only allow safe schemes in links that come from editable data.
    function safeUrl(u) {
        if (!u || !String(u).trim()) return "";
        var s = String(u).trim();
        return /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(s) ? s : "";
    }

    /* ---------- Apply content from data ---------- */
    function applyTheme(t) {
        if (!t) return;
        var s = document.documentElement.style;
        if (t.accent) s.setProperty("--accent", t.accent);
        if (t.accent2) s.setProperty("--accent-2", t.accent2);
        if (t.bg) {
            s.setProperty("--bg", t.bg);
            var meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute("content", t.bg);
        }
        if (t.bgSoft) s.setProperty("--bg-soft", t.bgSoft);
        if (t.surface) s.setProperty("--surface", t.surface);
        if (t.text) s.setProperty("--text", t.text);
        if (t.accent && t.accent2) {
            s.setProperty("--gradient", "linear-gradient(120deg, " + t.accent + " 0%, " + t.accent2 + " 100%)");
        }
    }

    function applyData() {
        if (!DATA) return;

        setText("logoText", DATA.brand);
        setText("footerBrand", DATA.brand);
        setText("logoMark", (DATA.firstName || "S").charAt(0));
        setText("footerMark", (DATA.firstName || "S").charAt(0));
        setText("heroFirst", DATA.firstName);
        setText("heroLast", DATA.lastName);
        setText("homeLabel", DATA.homeLabel);
        setText("heroRole", DATA.role);
        setText("heroDescription", DATA.heroDescription);
        setText("avatarLetter", (DATA.avatarLetter || DATA.firstName || "S").charAt(0));

        // Swap the letter avatar for the real photo when one is configured.
        var avatar = document.querySelector(".visual-avatar");
        if (avatar && DATA.photo) {
            var photo = document.getElementById("avatarImg");
            if (!photo) {
                photo = node("img", "avatar-img");
                photo.id = "avatarImg";
                avatar.insertBefore(photo, avatar.firstChild);
                var letter = document.getElementById("avatarLetter");
                if (letter) letter.remove();
            }
            photo.src = String(DATA.photo);
            photo.alt = (DATA.firstName || "") + " " + (DATA.lastName || "");
        }

        var about = DATA.about || {};
        setText("availabilityText", about.availability);
        setText("aboutQuote", about.quote ? "“" + about.quote + "”" : "");
        if (Array.isArray(about.paragraphs)) {
            fill("aboutParagraphs", about.paragraphs.map(function (p) { return node("p", null, p); }));
        }
        if (Array.isArray(about.facts)) {
            fill("aboutFacts", about.facts.map(function (f) {
                var box = node("div", "fact");
                box.appendChild(node("span", "fact-value", f.value));
                box.appendChild(node("span", "fact-label", f.label));
                return box;
            }));
        }

        if (Array.isArray(DATA.skills)) {
            fill("skillsGrid", DATA.skills.map(function (s) {
                var card = node("div", "skill-card reveal");
                card.appendChild(node("span", "skill-icon", s.icon));
                card.appendChild(node("h3", null, s.title));
                card.appendChild(node("p", null, s.description));
                return card;
            }));
        }

        if (Array.isArray(DATA.projects)) {
            fill("projectsGrid", DATA.projects.map(function (p) {
                var card = node("article", "project-card placeholder reveal");
                var thumb = node("div", "project-thumb");
                thumb.appendChild(node("span", null, p.number));
                var body = node("div", "project-body");
                body.appendChild(node("span", "project-badge", p.badge));
                body.appendChild(node("h3", null, p.title));
                body.appendChild(node("p", null, p.description));
                card.appendChild(thumb);
                card.appendChild(body);
                return card;
            }));
        }

        if (Array.isArray(DATA.contact)) {
            fill("contactDetails", DATA.contact.map(function (c) {
                var link = safeUrl(c.link);
                var isLink = !!link;
                var item = node(isLink ? "a" : "div", "contact-item" + (isLink ? "" : " is-muted"));
                if (isLink) {
                    item.setAttribute("href", link);
                    if (/^https?:/i.test(link)) {
                        item.setAttribute("target", "_blank");
                        item.setAttribute("rel", "noopener noreferrer");
                    }
                }
                item.appendChild(node("span", "contact-icon", c.icon));
                var meta = node("span", "contact-meta");
                meta.appendChild(node("span", "contact-label", c.label));
                meta.appendChild(node("span", "contact-value", c.value));
                item.appendChild(meta);
                return item;
            }));
        }

        // Hero socials use the contact entries for their links.
        var socialMap = [
            { key: "github", label: "GitHub", icon: "icon-gh" },
            { key: "linkedin", label: "LinkedIn", icon: "icon-in" },
            { key: "instagram", label: "Instagram", icon: "icon-ig" }
        ];
        var socials = socialMap.filter(function (s) { return !!findContact(s.key); }).map(function (s) {
            var c = findContact(s.key);
            var link = safeUrl(c.link);
            var a = node("a", null);
            a.setAttribute("href", link || "#");
            if (/^https?:/i.test(link)) {
                a.setAttribute("target", "_blank");
                a.setAttribute("rel", "noopener noreferrer");
            }
            a.setAttribute("aria-label", s.label);
            a.appendChild(node("i", s.icon));
            a.appendChild(node("span", null, s.label));
            return a;
        });
        if (socials.length) fill("heroSocials", socials);

        setText("footerName", (DATA.footer || {}).name);
        setText("footerNote", (DATA.footer || {}).note);

        applyTheme(DATA.theme);
    }

    applyData();

    /* ---------- Mobile menu ---------- */
    var navToggle = document.getElementById("navToggle");
    var navMenu = document.getElementById("navMenu");

    function closeMenu() {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            var isOpen = navMenu.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });
        navMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeMenu);
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") closeMenu();
        });
    }

    /* ---------- Header background on scroll ---------- */
    var header = document.querySelector(".site-header");
    function onScroll() {
        if (header) header.classList.toggle("scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Reveal elements on scroll ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    var revealObserver = null;
    if ("IntersectionObserver" in window) {
        revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("visible"); });
    }

    // Safety net: if a fast scroll skips an observer callback, reveal anything
    // that has already reached (or passed) the viewport. Nothing stays hidden.
    function revealPass() {
        var line = window.innerHeight - 20;
        revealEls.forEach(function (el) {
            if (el.classList.contains("visible")) return;
            if (el.getBoundingClientRect().top < line) {
                el.classList.add("visible");
                if (revealObserver) revealObserver.unobserve(el);
            }
        });
    }
    window.addEventListener("scroll", revealPass, { passive: true });
    window.addEventListener("resize", revealPass, { passive: true });
    revealPass();

    /* ---------- Active nav link highlighting ---------- */
    var sections = document.querySelectorAll("main section[id]");
    var navLinks = document.querySelectorAll(".nav-link");
    if ("IntersectionObserver" in window && sections.length) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                navLinks.forEach(function (link) {
                    var active = link.getAttribute("href") === "#" + id;
                    link.classList.toggle("active", active);
                    if (active) link.setAttribute("aria-current", "page");
                    else link.removeAttribute("aria-current");
                });
            });
        }, { threshold: 0.55 });
        sections.forEach(function (section) { sectionObserver.observe(section); });
    }

    /* ---------- Contact form -> mailto (no backend needed) ---------- */
    var form = document.getElementById("contactForm");
    var note = document.getElementById("formNote");
    var emailEntry = findContact("email");
    var RECIPIENT = (emailEntry && emailEntry.value) || "sanyamsoni4455@gmail.com";

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var name = form.elements["name"].value.trim();
            var email = form.elements["email"].value.trim();
            var message = form.elements["message"].value.trim();
            var subject = "Portfolio message from " + name;
            var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
            var mailto = "mailto:" + RECIPIENT +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(body);
            if (note) note.textContent = "Opening your email app… if nothing happens, email " + RECIPIENT + " directly.";
            window.location.href = mailto;
        });
    }

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
