/* ============================================================
   Portfolio Admin — edit content, save locally, export data.js
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
    "use strict";

    var STORAGE_KEY = "sanyamPortfolioData";
    var DEFAULTS = window.PORTFOLIO_DATA || {};
    var DATA = load();

    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    function load() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore corrupt saved data */ }
        return clone(DEFAULTS);
    }

    /* ---------- DOM helpers ---------- */
    function el(tag, className, text) {
        var n = document.createElement(tag);
        if (className) n.className = className;
        if (text !== undefined && text !== null) n.textContent = String(text);
        return n;
    }
    function val(id) {
        var n = document.getElementById(id);
        return n ? n.value : "";
    }

    function field(label, id, value, opts) {
        opts = opts || {};
        var wrap = el("div", "field" + (opts.wide ? " wide" : ""));
        wrap.appendChild(el("label", null, label));
        var input;
        if (opts.textarea) {
            input = el("textarea");
            input.rows = opts.rows || 4;
        } else {
            input = el("input");
            input.type = "text";
        }
        input.id = id;
        input.value = value === undefined || value === null ? "" : String(value);
        if (opts.placeholder) input.placeholder = opts.placeholder;
        wrap.appendChild(input);
        if (opts.hint) wrap.appendChild(el("span", "hint", opts.hint));
        return wrap;
    }

    /* Repeatable list of objects. fieldDefs: [{key,label,textarea,hint}] */
    function listEditor(host, items, fieldDefs) {
        if (!host) return;
        host.textContent = "";

        var list = el("div", "list-editor");

        function refreshIndices() {
            Array.prototype.forEach.call(list.querySelectorAll(".list-row"), function (row, i) {
                row.querySelector(".row-index").textContent = "#" + (i + 1);
            });
        }

        function addRow(values) {
            values = values || {};
            var row = el("div", "list-row");

            var head = el("div", "row-head");
            head.style.gridColumn = "1 / -1";
            head.appendChild(el("span", "row-index", "#" + (list.children.length + 1)));
            var remove = el("button", "btn-remove", "Remove");
            remove.type = "button";
            remove.addEventListener("click", function () {
                row.remove();
                refreshIndices();
            });
            head.appendChild(remove);
            row.appendChild(head);

            var fieldsWrap = el("div", "row-fields");
            fieldsWrap.style.display = "grid";
            fieldsWrap.style.gap = "12px";
            fieldsWrap.style.gridTemplateColumns = "repeat(" + fieldDefs.length + ", minmax(0, 1fr))";

            fieldDefs.forEach(function (def) {
                var f = field(def.label, null, values[def.key], {
                    textarea: !!def.textarea,
                    rows: def.rows || 2,
                    hint: def.hint,
                    placeholder: def.placeholder
                });
                var input = f.querySelector("input, textarea");
                input.setAttribute("data-field", def.key);
                fieldsWrap.appendChild(f);
            });
            row.appendChild(fieldsWrap);
            list.appendChild(row);
            refreshIndices();
        }

        (Array.isArray(items) ? items : []).forEach(addRow);

        var addBtn = el("button", "btn-add", "+ Add item");
        addBtn.type = "button";
        addBtn.addEventListener("click", function () { addRow({}); });

        host.appendChild(list);
        host.appendChild(addBtn);
    }

    function collectList(hostId) {
        var host = document.getElementById(hostId);
        if (!host) return [];
        return Array.prototype.map.call(host.querySelectorAll(".list-row"), function (row) {
            var o = {};
            Array.prototype.forEach.call(row.querySelectorAll("[data-field]"), function (input) {
                o[input.getAttribute("data-field")] = input.value;
            });
            return o;
        });
    }

    function section(title, subtitle) {
        var head = el("div", "panel-head");
        head.appendChild(el("h1", null, title));
        head.appendChild(el("p", null, subtitle));
        return head;
    }
    function card(title) {
        var c = el("section", "panel-card");
        if (title) c.appendChild(el("h2", null, title));
        return c;
    }
    function panel(name) {
        var p = el("section", "admin-panel");
        p.id = "panel-" + name;
        return p;
    }

    /* ---------- Theme fields ---------- */
    var THEME_KEYS = [
        { key: "accent", label: "Accent" },
        { key: "accent2", label: "Accent 2" },
        { key: "bg", label: "Background" },
        { key: "bgSoft", label: "Soft background" },
        { key: "surface", label: "Card surface" },
        { key: "text", label: "Text" }
    ];
    var PRESETS = [
        { name: "Default", colors: { accent: "#7c6cff", accent2: "#21d4c4", bg: "#0a0a12", bgSoft: "#10111c", surface: "#141623", text: "#eef0f8" } },
        { name: "Ocean", colors: { accent: "#3b82f6", accent2: "#06b6d4", bg: "#071018", bgSoft: "#0c1722", surface: "#11202e", text: "#e8f4ff" } },
        { name: "Sunset", colors: { accent: "#ff6b6b", accent2: "#ffa94d", bg: "#140b0d", bgSoft: "#1d1013", surface: "#26161b", text: "#fff2ef" } },
        { name: "Forest", colors: { accent: "#22c55e", accent2: "#a3e635", bg: "#09120d", bgSoft: "#0e1a13", surface: "#14251a", text: "#eafff0" } }
    ];

    function colorField(def, value) {
        var wrap = el("div", "color-field");
        wrap.appendChild(el("label", null, def.label));
        var row = el("div", "color-wrap");
        var picker = el("input");
        picker.type = "color";
        var text = el("input");
        text.type = "text";
        text.id = "theme-" + def.key;
        text.value = value || "#000000";
        picker.value = /^#[0-9a-f]{6}$/i.test(text.value) ? text.value : "#000000";

        picker.addEventListener("input", function () { text.value = picker.value; });
        text.addEventListener("input", function () {
            if (/^#[0-9a-f]{6}$/i.test(text.value)) picker.value = text.value;
        });
        row.appendChild(picker);
        row.appendChild(text);
        wrap.appendChild(row);
        return wrap;
    }

    function setThemeFields(colors) {
        THEME_KEYS.forEach(function (def) {
            var text = document.getElementById("theme-" + def.key);
            if (text && colors[def.key]) {
                text.value = colors[def.key];
                var picker = text.parentNode.querySelector('input[type="color"]');
                if (picker && /^#[0-9a-f]{6}$/i.test(colors[def.key])) picker.value = colors[def.key];
            }
        });
    }

    /* ---------- Build the admin UI ---------- */
    function render() {
        var main = document.getElementById("adminMain");
        main.textContent = "";

        // Profile
        var p = panel("profile");
        p.appendChild(section("Profile", "The main text shown at the top of your site."));
        var c = card("Hero & branding");
        var grid = el("div", "field-grid");
        grid.appendChild(field("Brand / logo text", "f-brand", DATA.brand));
        grid.appendChild(field("Profile photo path", "f-photo", DATA.photo, { wide: true, hint: "e.g. assets/sanyam.jpg — keep the image inside the portfolio folder." }));
        grid.appendChild(field("Avatar letter (fallback)", "f-avatarLetter", DATA.avatarLetter, { hint: "Shown only if no photo is set." }));
        grid.appendChild(field("First name", "f-firstName", DATA.firstName));
        grid.appendChild(field("Last name", "f-lastName", DATA.lastName));
        grid.appendChild(field("Eyebrow text", "f-homeLabel", DATA.homeLabel));
        grid.appendChild(field("Tagline / role", "f-role", DATA.role));
        grid.appendChild(field("Hero description", "f-heroDescription", DATA.heroDescription, { textarea: true, wide: true, rows: 3 }));
        c.appendChild(grid);
        p.appendChild(c);

        // About
        var a = panel("about");
        a.appendChild(section("About", "Your bio, quick facts and the quote card."));
        var ac = card("About content");
        var ag = el("div", "field-grid");
        ag.appendChild(field("Availability text", "f-availability", (DATA.about||{}).availability));
        ag.appendChild(field("Quote", "f-quote", (DATA.about||{}).quote));
        ag.appendChild(field("Bio paragraphs", "f-paragraphs", ((DATA.about||{}).paragraphs||[]).join("\n"), {
            textarea: true, wide: true, rows: 6, hint: "One paragraph per line."
        }));
        ac.appendChild(ag);
        a.appendChild(ac);
        var af = card("Quick facts");
        var fhost = el("div", "editor-host"); fhost.id = "list-facts";
        af.appendChild(fhost);
        listEditor(fhost, (DATA.about||{}).facts, [
            { key: "value", label: "Value" },
            { key: "label", label: "Label" }
        ]);
        a.appendChild(af);

        // Skills
        var s = panel("skills");
        s.appendChild(section("Skills", "The cards in the “What I work with” section."));
        var sc = card("Skill cards");
        var sh = el("div", "editor-host"); sh.id = "list-skills";
        sc.appendChild(sh);
        listEditor(sh, DATA.skills, [
            { key: "icon", label: "Icon / short text" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description", textarea: true, rows: 2 }
        ]);
        s.appendChild(sc);

        // Projects
        var pr = panel("projects");
        pr.appendChild(section("Projects", "Replace the placeholders when your projects are ready."));
        var pc = card("Project cards");
        var ph = el("div", "editor-host"); ph.id = "list-projects";
        pc.appendChild(ph);
        listEditor(ph, DATA.projects, [
            { key: "number", label: "Number" },
            { key: "badge", label: "Badge" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description", textarea: true, rows: 2 }
        ]);
        pr.appendChild(pc);

        // Contact
        var co = panel("contact");
        co.appendChild(section("Contact", "Links shown on the site. Empty Link = greyed-out item."));
        var cc = card("Contact entries");
        var ch = el("div", "editor-host"); ch.id = "list-contact";
        cc.appendChild(ch);
        listEditor(ch, DATA.contact, [
            { key: "key", label: "Key", hint: "e.g. email, github" },
            { key: "label", label: "Label" },
            { key: "icon", label: "Icon text" },
            { key: "value", label: "Display value" },
            { key: "link", label: "Link URL", hint: "mailto:, tel: or https://" }
        ]);
        co.appendChild(cc);

        // Theme
        var t = panel("theme");
        t.appendChild(section("Theme", "Pick your site colours. Changes apply after Save + reload."));
        var presetsCard = card("Presets");
        var presetRow = el("div", "presets");
        PRESETS.forEach(function (preset) {
            var b = el("button", "preset");
            b.type = "button";
            var sw = el("span", "swatch");
            sw.style.background = "linear-gradient(120deg," + preset.colors.accent + "," + preset.colors.accent2 + ")";
            b.appendChild(sw);
            b.appendChild(el("span", null, preset.name));
            b.addEventListener("click", function () { setThemeFields(preset.colors); });
            presetRow.appendChild(b);
        });
        presetsCard.appendChild(presetRow);
        t.appendChild(presetsCard);

        var colorsCard = card("Custom colours");
        var tg = el("div", "theme-grid");
        THEME_KEYS.forEach(function (def) { tg.appendChild(colorField(def, (DATA.theme||{})[def.key])); });
        colorsCard.appendChild(tg);
        t.appendChild(colorsCard);

        [p, a, s, pr, co, t].forEach(function (x) { main.appendChild(x); });
    }

    /* ---------- Collect current form values into a data object ---------- */
    function collectData() {
        var d = clone(DATA);
        d.brand = val("f-brand");
        d.photo = val("f-photo");
        d.avatarLetter = val("f-avatarLetter");
        d.firstName = val("f-firstName");
        d.lastName = val("f-lastName");
        d.homeLabel = val("f-homeLabel");
        d.role = val("f-role");
        d.heroDescription = val("f-heroDescription");

        d.about = d.about || {};
        d.about.availability = val("f-availability");
        d.about.quote = val("f-quote");
        d.about.paragraphs = val("f-paragraphs").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
        d.about.facts = collectList("list-facts");
        d.skills = collectList("list-skills");
        d.projects = collectList("list-projects");
        d.contact = collectList("list-contact");

        d.theme = d.theme || {};
        THEME_KEYS.forEach(function (def) { d.theme[def.key] = val("theme-" + def.key); });
        return d;
    }

    /* ---------- Actions ---------- */
    var toastTimer;
    function toast(msg, type) {
        var t = document.getElementById("toast");
        t.textContent = msg;
        t.className = "admin-toast show " + (type || "ok");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.className = "admin-toast"; }, 3200);
    }

    function save() {
        try {
            DATA = collectData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
            toast("Saved in this browser. Export data.js to publish.", "ok");
        } catch (e) {
            toast("Could not save: " + e.message, "err");
        }
    }

    function safeJson(obj) {
        return JSON.stringify(obj, null, 2)
            .replace(/</g, "\\u003C")
            .replace(/>/g, "\\u003E")
            .replace(/&/g, "\\u0026")
            .replace(/\u2028/g, "\\u2028")
            .replace(/\u2029/g, "\\u2029");
    }

    function download(name, content, type) {
        var blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = el("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function exportFile() {
        DATA = collectData();
        var content = "/* Generated by Portfolio Admin — replace data.js with this file. */\n" +
            "window.PORTFOLIO_DATA = " + safeJson(DATA) + ";\n";
        download("data.js", content, "text/javascript;charset=utf-8");
        toast("data.js downloaded. Upload it next to index.html to publish.", "ok");
    }

    function applyImported(data) {
        if (!data || typeof data !== "object") throw new Error("Invalid file");
        DATA = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
        render();
        toast("Imported and saved.", "ok");
    }

    function importFile(file) {
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var text = String(reader.result);
                var m = text.match(/PORTFOLIO_DATA\s*=\s*(\{[\s\S]*\})\s*;?/);
                var parsed = JSON.parse(m ? m[1] : text);
                applyImported(parsed);
            } catch (e) {
                toast("Import failed: " + e.message, "err");
            }
        };
        reader.onerror = function () { toast("Could not read that file.", "err"); };
        reader.readAsText(file);
    }

    /* ---------- Wire up controls ---------- */
    document.getElementById("btnSave").addEventListener("click", save);
    document.getElementById("btnExport").addEventListener("click", exportFile);
    document.getElementById("btnView").addEventListener("click", function () {
        window.open("index.html", "_blank", "noopener");
    });
    document.getElementById("btnImport").addEventListener("click", function () {
        document.getElementById("fileInput").click();
    });
    document.getElementById("fileInput").addEventListener("change", function (e) {
        var f = e.target.files && e.target.files[0];
        if (f) importFile(f);
        e.target.value = "";
    });
    document.getElementById("btnReset").addEventListener("click", function () {
        if (!window.confirm("Reset all edits back to the original defaults?")) return;
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
        DATA = clone(DEFAULTS);
        render();
        toast("Reset to defaults.", "ok");
    });

    Array.prototype.forEach.call(document.querySelectorAll(".side-link"), function (btn) {
        btn.addEventListener("click", function () {
            Array.prototype.forEach.call(document.querySelectorAll(".side-link"), function (b) {
                b.classList.toggle("active", b === btn);
            });
            var id = "panel-" + btn.getAttribute("data-panel");
            Array.prototype.forEach.call(document.querySelectorAll(".admin-panel"), function (p) {
                p.classList.toggle("active", p.id === id);
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    render();
    var firstPanel = document.querySelector('.side-link[data-panel="profile"]');
    if (firstPanel) firstPanel.classList.add("active");
    var first = document.getElementById("panel-profile");
    if (first) first.classList.add("active");
})();
