/* ============================================================
   Notepad — Web Code Editor
   Vanilla JS, zero dependencies. Offline-first.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Small utilities
     --------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const uid = () => "f" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  function debounce(fn, ms) {
    let t;
    return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
  }

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, (c) => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;"));
  }

  function formatBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / 1024 / 1024).toFixed(2) + " MB";
  }

  function safeConfirm(msg) { try { return window.confirm(msg); } catch (e) { return true; } }

  function toast(msg, kind) {
    const host = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .3s";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  /* ---------------------------------------------------------
     Persistence: IndexedDB with localStorage fallback
     --------------------------------------------------------- */
  const Store = (function () {
    const DB_NAME = "notepad-editor";
    const STORE = "kv";
    let dbP = null;
    let usable = "idb";

    function openDb() {
      if (dbP) return dbP;
      dbP = new Promise((resolve) => {
        if (!("indexedDB" in window)) { usable = "ls"; return resolve(null); }
        let req;
        try { req = indexedDB.open(DB_NAME, 1); }
        catch (e) { usable = "ls"; return resolve(null); }
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => { usable = "ls"; resolve(null); };
      });
      return dbP;
    }

    async function set(key, val) {
      const db = await openDb();
      if (!db) { try { localStorage.setItem(DB_NAME + ":" + key, JSON.stringify(val)); } catch (e) {} return; }
      return new Promise((res, rej) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(val, key);
        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
      });
    }

    async function get(key) {
      const db = await openDb();
      if (!db) {
        try { const v = localStorage.getItem(DB_NAME + ":" + key); return v ? JSON.parse(v) : null; }
        catch (e) { return null; }
      }
      return new Promise((res) => {
        const tx = db.transaction(STORE, "readonly");
        const r = tx.objectStore(STORE).get(key);
        r.onsuccess = () => res(r.result ?? null);
        r.onerror = () => res(null);
      });
    }
    return { set, get, backend: () => usable };
  })();

  /* ---------------------------------------------------------
     Language detection
     --------------------------------------------------------- */
  const LANGS = {
    javascript: { label: "JavaScript", ext: ["js", "mjs", "cjs", "jsx", "ts", "tsx"] },
    html: { label: "HTML", ext: ["html", "htm", "xml", "svg"] },
    css: { label: "CSS", ext: ["css", "scss", "less"] },
    json: { label: "JSON", ext: ["json", "webmanifest"] },
    markdown: { label: "Markdown", ext: ["md", "markdown"] },
    python: { label: "Python", ext: ["py", "pyw"] },
    powershell: { label: "PowerShell", ext: ["ps1", "psm1", "psd1"] },
    csv: { label: "CSV", ext: ["csv", "tsv"] },
    yaml: { label: "YAML", ext: ["yml", "yaml"] },
    shell: { label: "Shell", ext: ["sh", "bash", "zsh"] },
    plaintext: { label: "Plain Text", ext: ["txt", "log", ""] },
  };

  function langFromName(name) {
    const ext = (name.split(".").pop() || "").toLowerCase();
    for (const id in LANGS) if (LANGS[id].ext.includes(ext)) return id;
    return "plaintext";
  }

  /* ---------------------------------------------------------
     Syntax highlighter (regex tokenizers per language)
     Produces HTML from raw source. Input is HTML-escaped first
     for languages that don't need structural parsing; HTML lang
     escapes internally.
     --------------------------------------------------------- */
  const Highlight = (function () {
    const JS_KW = new RegExp("\\b(" + [
      "abstract","await","async","break","case","catch","class","const","continue","debugger",
      "default","delete","do","else","export","extends","finally","for","from","function","get",
      "if","implements","import","in","instanceof","interface","let","new","of","return","set",
      "static","super","switch","this","throw","try","typeof","var","void","while","with","yield"
    ].join("|") + ")\\b", "g");
    const JS_BOOL = /\b(true|false|null|undefined|NaN|Infinity)\b/g;

    const PY_KW = new RegExp("\\b(" + [
      "and","as","assert","async","await","break","class","continue","def","del","elif","else",
      "except","finally","for","from","global","if","import","in","is","lambda","nonlocal","not",
      "or","pass","raise","return","try","while","with","yield","match","case"
    ].join("|") + ")\\b", "g");
    const PY_BOOL = /\b(True|False|None|self|cls)\b/g;

    const CSS_KW = /([.#]?[a-zA-Z_-][\w-]*)(?=\s*\{)|(@[a-z-]+)|(:[a-z-]+)/g;

    // Generic tokenizer using placeholder protection for strings/comments.
    function highlightJS(src) {
      return protectAndColor(src, [
        { re: /\/\*[\s\S]*?\*\//g, cls: "tok-com" },
        { re: /\/\/[^\n]*/g, cls: "tok-com" },
        { re: /`(?:\\[\s\S]|[^`\\])*`/g, cls: "tok-str" },
        { re: /"(?:\\.|[^"\\])*"/g, cls: "tok-str" },
        { re: /'(?:\\.|[^'\\])*'/g, cls: "tok-str" },
      ], (text) => {
        text = text.replace(/\b(\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?|0x[\da-fA-F]+)\b/g, '\u0001tok-num\u0002$1\u0003');
        text = text.replace(JS_BOOL, '\u0001tok-bool\u0002$1\u0003');
        text = text.replace(JS_KW, '\u0001tok-key\u0002$1\u0003');
        text = text.replace(/\b([A-Za-z_$][\w$]*)(?=\s*\()/g, '\u0001tok-fn\u0002$1\u0003');
        return text;
      });
    }

    function highlightPython(src) {
      return protectAndColor(src, [
        { re: /#[^\n]*/g, cls: "tok-com" },
        { re: /"""[\s\S]*?"""|'''[\s\S]*?'''/g, cls: "tok-str" },
        { re: /"(?:\\.|[^"\\])*"/g, cls: "tok-str" },
        { re: /'(?:\\.|[^'\\])*'/g, cls: "tok-str" },
      ], (text) => {
        text = text.replace(/\b(\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?|0x[\da-fA-F]+)\b/g, '\u0001tok-num\u0002$1\u0003');
        text = text.replace(PY_BOOL, '\u0001tok-bool\u0002$1\u0003');
        text = text.replace(PY_KW, '\u0001tok-key\u0002$1\u0003');
        text = text.replace(/\b([A-Za-z_][\w]*)(?=\s*\()/g, '\u0001tok-fn\u0002$1\u0003');
        return text;
      });
    }

    function highlightCSS(src) {
      return protectAndColor(src, [
        { re: /\/\*[\s\S]*?\*\//g, cls: "tok-com" },
        { re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, cls: "tok-str" },
      ], (text) => {
        text = text.replace(/([\w-]+)(\s*:)/g, '\u0001tok-prop\u0002$1\u0003$2');
        text = text.replace(/(#[0-9a-fA-F]{3,8}\b|\b\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg|fr|pt)?\b)/g, '\u0001tok-num\u0002$1\u0003');
        text = text.replace(/(@[a-z-]+|![a-z]+)/g, '\u0001tok-key\u0002$1\u0003');
        return text;
      });
    }

    function highlightJSON(src) {
      return protectAndColor(src, [
        { re: /"(?:\\.|[^"\\])*"(?=\s*:)/g, cls: "tok-prop" },
        { re: /"(?:\\.|[^"\\])*"/g, cls: "tok-str" },
      ], (text) => {
        text = text.replace(/\b(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, '\u0001tok-num\u0002$1\u0003');
        text = text.replace(/\b(true|false|null)\b/g, '\u0001tok-bool\u0002$1\u0003');
        return text;
      });
    }

    function highlightHTML(src) {
      // Escape first, then colour tags/attributes on the escaped stream.
      let out = escapeHtml(src);
      // comments
      out = out.replace(/&lt;!--[\s\S]*?--&gt;/g, (m) => '\u0001tok-com\u0002' + m + '\u0003');
      // tags
      out = out.replace(/(&lt;\/?)([a-zA-Z][\w-]*)((?:[^&]|&(?!gt;))*?)(\/?&gt;)/g, (m, open, tag, attrs, close) => {
        const at = attrs.replace(/([a-zA-Z-]+)(=)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')?/g,
          (mm, name, eq, val) => '\u0001tok-attr\u0002' + name + '\u0003' + (eq || "") + (val ? '\u0001tok-str\u0002' + val + '\u0003' : ""));
        return '\u0001tok-punc\u0002' + open + '\u0003' + '\u0001tok-tag\u0002' + tag + '\u0003' + at + '\u0001tok-punc\u0002' + close + '\u0003';
      });
      return finalize(out);
    }

    function highlightMarkdown(src) {
      const lines = src.split("\n");
      return lines.map((line) => {
        let l = escapeHtml(line);
        if (/^#{1,6}\s/.test(line)) return '<span class="tok-md-head">' + l + "</span>";
        if (/^\s*(```|~~~)/.test(line)) return '<span class="tok-md-code">' + l + "</span>";
        if (/^\s*&gt;\s?/.test(l)) return '<span class="tok-com">' + l + "</span>";
        l = l.replace(/(\*\*|__)(.+?)\1/g, '<span class="tok-md-head">$1$2$1</span>');
        l = l.replace(/`([^`]+)`/g, '<span class="tok-md-code">`$1`</span>');
        l = l.replace(/(\[[^\]]*\]\([^)]*\))/g, '<span class="tok-md-link">$1</span>');
        l = l.replace(/^(\s*[-*+]\s)/, '<span class="tok-key">$1</span>');
        return l;
      }).join("\n");
    }

    const PS_KW = new RegExp("\\b(" + [
      "begin","break","catch","class","continue","data","do","dynamicparam","else","elseif","end",
      "enum","exit","filter","finally","for","foreach","from","function","hidden","if","in","param",
      "process","return","static","switch","throw","trap","try","until","using","while","workflow"
    ].join("|") + ")\\b", "gi");
    const PS_OP = /\B(-(?:eq|ne|gt|ge|lt|le|like|notlike|match|notmatch|contains|notcontains|in|notin|replace|split|join|and|or|not|xor|band|bor|is|isnot|as|f)\b)/gi;

    function highlightPowerShell(src) {
      return protectAndColor(src, [
        { re: /&lt;#[\s\S]*?#&gt;/g, cls: "tok-com" },
        { re: /#[^\n]*/g, cls: "tok-com" },
        { re: /@"[\s\S]*?"@|@'[\s\S]*?'@/g, cls: "tok-str" },
        { re: /"(?:`.|[^"`])*"/g, cls: "tok-str" },
        { re: /'(?:''|[^'])*'/g, cls: "tok-str" },
      ], (text) => {
        text = text.replace(/(\$[A-Za-z_][\w:]*|\$\{[^}]+\}|\$[\$\^\?_])/g, '\u0001tok-prop\u0002$1\u0003');
        text = text.replace(/\b(\d+\.?\d*(?:[eE][+-]?\d+)?|0x[\da-fA-F]+)\b/g, '\u0001tok-num\u0002$1\u0003');
        text = text.replace(PS_OP, '\u0001tok-op\u0002$1\u0003');
        text = text.replace(PS_KW, '\u0001tok-key\u0002$1\u0003');
        // cmdlets: Verb-Noun
        text = text.replace(/\b([A-Z][a-z]+-[A-Z][A-Za-z]+)\b/g, '\u0001tok-fn\u0002$1\u0003');
        // parameters -Name
        text = text.replace(/(\s)(-[A-Za-z][\w]+)\b/g, '$1\u0001tok-attr\u0002$2\u0003');
        return text;
      });
    }

    function highlightYaml(src) {
      const lines = src.split("\n");
      return lines.map((line) => {
        let l = escapeHtml(line);
        if (/^\s*#/.test(line)) return '<span class="tok-com">' + l + "</span>";
        l = l.replace(/^(\s*)([-\w .]+?)(\s*:)(\s|$)/, '$1<span class="tok-prop">$2</span>$3$4');
        l = l.replace(/^(\s*-\s)/, '<span class="tok-key">$1</span>');
        l = l.replace(/\b(true|false|null|yes|no|~)\b/gi, '<span class="tok-bool">$1</span>');
        return l;
      }).join("\n");
    }

    function highlightShell(src) {
      return protectAndColor(src, [
        { re: /#[^\n]*/g, cls: "tok-com" },
        { re: /"(?:\\.|[^"\\])*"/g, cls: "tok-str" },
        { re: /'[^']*'/g, cls: "tok-str" },
      ], (text) => {
        text = text.replace(/(\$[A-Za-z_]\w*|\$\{[^}]+\}|\$[\d@*#?])/g, '\u0001tok-prop\u0002$1\u0003');
        text = text.replace(/\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|in|select|until|echo|export|local|read|cd|exit)\b/g, '\u0001tok-key\u0002$1\u0003');
        return text;
      });
    }

    function highlightCsv(src) {
      // Colour delimiters lightly; values are inert text.
      return src.split("\n").map((line) => {
        let out = "", field = "", inQ = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') { inQ = !inQ; field += c; }
          else if ((c === "," || c === "\t") && !inQ) {
            out += escapeHtml(field) + '<span class="tok-punc">' + c + "</span>";
            field = "";
          } else field += c;
        }
        return out + escapeHtml(field);
      }).join("\n");
    }

    // Replaces protected regions with markers, colours the rest, restores.
    // Placeholders use Private-Use-Area code points so the number/identifier
    // tokenizers below can never match (and thus corrupt) them.
    function protectAndColor(src, protectors, colorFn) {
      const slots = [];
      let text = escapeHtml(src);
      // Re-run protectors against escaped text (patterns use plain quotes which survive escaping).
      protectors.forEach((p) => {
        text = text.replace(p.re, (m) => {
          const i = slots.length;
          slots.push("\u0001" + p.cls + "\u0002" + m + "\u0003");
          return i < 6400 ? String.fromCharCode(0xE000 + i) : m;
        });
      });
      text = colorFn(text);
      text = text.replace(/[\uE000-\uF8FF]/g, (ch) => slots[ch.charCodeAt(0) - 0xE000] || ch);
      return finalize(text);
    }

    // Converts internal markers \u0001cls\u0002 ... \u0003 into spans.
    function finalize(text) {
      return text
        .replace(/\u0001([\w-]+)\u0002/g, '<span class="$1">')
        .replace(/\u0003/g, "</span>");
    }

    const table = {
      javascript: highlightJS,
      python: highlightPython,
      powershell: highlightPowerShell,
      css: highlightCSS,
      json: highlightJSON,
      html: highlightHTML,
      markdown: highlightMarkdown,
      yaml: highlightYaml,
      shell: highlightShell,
      csv: highlightCsv,
      plaintext: (s) => escapeHtml(s),
    };

    function run(src, lang) {
      const fn = table[lang] || table.plaintext;
      try { return fn(src); } catch (e) { return escapeHtml(src); }
    }
    return { run };
  })();

  /* ---------------------------------------------------------
     Safe Markdown renderer (Part 2 security: never emit raw
     file HTML; everything is escaped, links are protocol-checked,
     no scripts/handlers survive).
     --------------------------------------------------------- */
  const Markdown = (function () {
    const SAFE_PROTO = /^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i;

    function safeUrl(url) {
      url = (url || "").trim();
      if (SAFE_PROTO.test(url)) return url.replace(/"/g, "%22");
      return "#";
    }

    function inline(text) {
      // text is RAW; escape first so no HTML from the file executes.
      let out = escapeHtml(text);
      const codes = [];
      out = out.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return "\u0000" + (codes.length - 1) + "\u0000"; });
      out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, (m, alt, src) =>
        '<span class="md-img" title="' + safeUrl(src) + '">🖼 ' + alt + "</span>");
      out = out.replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, (m, txt, href) =>
        '<a href="' + safeUrl(href) + '" target="_blank" rel="noopener noreferrer nofollow">' + txt + "</a>");
      out = out.replace(/(\*\*|__)(.+?)\1/g, "<strong>$2</strong>");
      out = out.replace(/(\*|_)(?!\s)(.+?)(?<!\s)\1/g, "<em>$2</em>");
      out = out.replace(/~~(.+?)~~/g, "<del>$1</del>");
      out = out.replace(/\u0000(\d+)\u0000/g, (m, i) => "<code>" + escapeHtml(codes[+i]) + "</code>");
      return out;
    }

    function render(src) {
      const lines = src.replace(/\r\n?/g, "\n").split("\n");
      let html = "", i = 0;
      const listStack = [];
      function closeLists(toDepth) {
        while (listStack.length > toDepth) html += (listStack.pop() === "ol" ? "</ol>" : "</ul>");
      }
      while (i < lines.length) {
        let line = lines[i];
        // fenced code
        const fence = line.match(/^\s*(```|~~~)(.*)$/);
        if (fence) {
          closeLists(0);
          const marker = fence[1];
          const lang = fence[2].trim();
          i++;
          let code = "";
          while (i < lines.length && !lines[i].match(new RegExp("^\\s*" + marker))) { code += lines[i] + "\n"; i++; }
          i++;
          const hl = lang ? Highlight.run(code.replace(/\n$/, ""), langFromName("x." + lang)) : escapeHtml(code.replace(/\n$/, ""));
          html += '<pre class="md-pre"><code>' + hl + "</code></pre>";
          continue;
        }
        // table
        if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && /-/.test(lines[i + 1])) {
          closeLists(0);
          const header = splitRow(line);
          i += 2;
          const rows = [];
          while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== "") { rows.push(splitRow(lines[i])); i++; }
          html += '<table class="md-table"><thead><tr>' + header.map((h) => "<th>" + inline(h) + "</th>").join("") + "</tr></thead><tbody>";
          rows.forEach((r) => { html += "<tr>" + r.map((c) => "<td>" + inline(c) + "</td>").join("") + "</tr>"; });
          html += "</tbody></table>";
          continue;
        }
        // heading
        const h = line.match(/^(#{1,6})\s+(.*)$/);
        if (h) { closeLists(0); html += "<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">"; i++; continue; }
        // hr
        if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { closeLists(0); html += "<hr>"; i++; continue; }
        // blockquote
        if (/^\s*>\s?/.test(line)) {
          closeLists(0);
          let q = "";
          while (i < lines.length && /^\s*>\s?/.test(lines[i])) { q += lines[i].replace(/^\s*>\s?/, "") + "\n"; i++; }
          html += "<blockquote>" + render(q) + "</blockquote>";
          continue;
        }
        // list item
        const li = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (li) {
          const depth = Math.floor(li[1].length / 2) + 1;
          const ordered = /\d/.test(li[2]);
          while (listStack.length < depth) { const tag = ordered ? "ol" : "ul"; listStack.push(tag); html += "<" + tag + ">"; }
          while (listStack.length > depth) html += (listStack.pop() === "ol" ? "</ol>" : "</ul>");
          html += "<li>" + inline(li[3]) + "</li>";
          i++;
          continue;
        }
        // blank
        if (line.trim() === "") { closeLists(0); i++; continue; }
        // paragraph (gather consecutive)
        closeLists(0);
        let para = line;
        i++;
        while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6}\s|\s*([-*+]|\d+[.)])\s|\s*>|```|~~~)/.test(lines[i])) {
          para += "\n" + lines[i]; i++;
        }
        html += "<p>" + inline(para).replace(/\n/g, "<br>") + "</p>";
      }
      closeLists(0);
      return html;
    }

    function splitRow(line) {
      return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
    }

    return { render };
  })();

  /* ---------------------------------------------------------
     CSV parsing (RFC-4180-ish). Values are inert data only.
     --------------------------------------------------------- */
  function parseCsv(text, delimiter) {
    const d = delimiter || (text.indexOf("\t") >= 0 && text.indexOf(",") < 0 ? "\t" : ",");
    const rows = [];
    let row = [], field = "", inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === d) { row.push(field); field = ""; }
        else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
        else if (c === "\r") { /* skip */ }
        else field += c;
      }
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function rowsToCsv(rows) {
    return rows.map((r) => r.map((c) => {
      c = c == null ? "" : String(c);
      return /[",\n\r]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
    }).join(",")).join("\n");
  }

  /* ---------------------------------------------------------
     Minimal XLSX reader (ZIP + raw-deflate via DecompressionStream).
     Reads shared strings + first worksheet. Formulas are NOT
     evaluated; only cached values / text are read (inert).
     --------------------------------------------------------- */
  const Xlsx = (function () {
    async function inflateRaw(bytes) {
      if (typeof DecompressionStream === "undefined") throw new Error("DecompressionStream unsupported");
      const ds = new DecompressionStream("deflate-raw");
      const buf = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
      return new Uint8Array(buf);
    }

    async function unzip(u8) {
      const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
      // find End Of Central Directory
      let eocd = -1;
      for (let i = u8.length - 22; i >= 0 && i > u8.length - 22 - 65536; i--) {
        if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
      }
      if (eocd < 0) throw new Error("Not a ZIP file");
      const count = dv.getUint16(eocd + 10, true);
      let off = dv.getUint32(eocd + 16, true);
      const files = {};
      const dec = new TextDecoder();
      for (let n = 0; n < count; n++) {
        if (dv.getUint32(off, true) !== 0x02014b50) break;
        const method = dv.getUint16(off + 10, true);
        const compSize = dv.getUint32(off + 20, true);
        const nameLen = dv.getUint16(off + 28, true);
        const extraLen = dv.getUint16(off + 30, true);
        const commLen = dv.getUint16(off + 32, true);
        const localOff = dv.getUint32(off + 42, true);
        const name = dec.decode(u8.subarray(off + 46, off + 46 + nameLen));
        // local header
        const lNameLen = dv.getUint16(localOff + 26, true);
        const lExtraLen = dv.getUint16(localOff + 28, true);
        const dataStart = localOff + 30 + lNameLen + lExtraLen;
        const comp = u8.subarray(dataStart, dataStart + compSize);
        files[name] = { method, comp };
        off += 46 + nameLen + extraLen + commLen;
      }
      return files;
    }

    async function fileText(files, name) {
      const f = files[name];
      if (!f) return "";
      const bytes = f.method === 0 ? f.comp : await inflateRaw(f.comp);
      return new TextDecoder().decode(bytes);
    }

    function decodeXmlEntities(s) {
      return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, d) => String.fromCharCode(+d))
        .replace(/&#x([\da-f]+);/gi, (m, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/&amp;/g, "&");
    }

    function parseShared(xml) {
      const out = [];
      const items = xml.match(/<si\b[\s\S]*?<\/si>/g) || [];
      for (const si of items) {
        const texts = si.match(/<t\b[^>]*>([\s\S]*?)<\/t>/g) || [];
        out.push(texts.map((t) => decodeXmlEntities(t.replace(/<[^>]+>/g, ""))).join(""));
      }
      return out;
    }

    function colToIndex(ref) {
      const m = ref.match(/^([A-Z]+)(\d+)$/);
      if (!m) return { c: 0, r: 0 };
      let c = 0;
      for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
      return { c: c - 1, r: parseInt(m[2], 10) - 1 };
    }

    function parseSheet(xml, shared) {
      const grid = [];
      const cells = xml.match(/<c\b[^>]*>(?:[\s\S]*?)<\/c>|<c\b[^>]*\/>/g) || [];
      let maxC = 0;
      for (const cell of cells) {
        const refM = cell.match(/r="([A-Z]+\d+)"/);
        const typeM = cell.match(/t="([^"]+)"/);
        const vM = cell.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);
        const isM = cell.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
        if (!refM) continue;
        const { c, r } = colToIndex(refM[1]);
        let val = "";
        if (typeM && typeM[1] === "s" && vM) val = shared[parseInt(vM[1], 10)] || "";
        else if (typeM && typeM[1] === "inlineStr" && isM) val = decodeXmlEntities(isM[1]);
        else if (vM) val = decodeXmlEntities(vM[1]);
        if (!grid[r]) grid[r] = [];
        grid[r][c] = val;
        if (c > maxC) maxC = c;
      }
      // normalize rectangular
      return grid.map((row) => {
        row = row || [];
        for (let i = 0; i <= maxC; i++) if (row[i] == null) row[i] = "";
        return row;
      });
    }

    async function toRows(arrayBuffer) {
      const u8 = new Uint8Array(arrayBuffer);
      const files = await unzip(u8);
      const shared = parseShared(await fileText(files, "xl/sharedStrings.xml"));
      // pick first worksheet
      let sheetName = Object.keys(files).filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(n)).sort()[0];
      if (!sheetName) sheetName = Object.keys(files).find((n) => /^xl\/worksheets\/.*\.xml$/i.test(n));
      if (!sheetName) throw new Error("No worksheet found");
      return parseSheet(await fileText(files, sheetName), shared);
    }

    return { toRows };
  })();

  /* ---------------------------------------------------------
     Line diff (LCS). Returns ops for a side-by-side/unified view.
     --------------------------------------------------------- */
  function diffLines(aText, bText) {
    const a = aText.replace(/\r\n?/g, "\n").split("\n");
    const b = bText.replace(/\r\n?/g, "\n").split("\n");
    const n = a.length, m = b.length;
    const ops = [];
    if (n * m > 4000000) {
      // too large for DP; fall back to naive alignment
      const max = Math.max(n, m);
      for (let i = 0; i < max; i++) {
        if (i < n && i < m && a[i] === b[i]) ops.push({ t: "same", a: a[i], b: b[i], la: i + 1, lb: i + 1 });
        else { if (i < n) ops.push({ t: "del", a: a[i], la: i + 1 }); if (i < m) ops.push({ t: "add", b: b[i], lb: i + 1 }); }
      }
      return ops;
    }
    const dp = new Array(n + 1);
    for (let i = 0; i <= n; i++) { dp[i] = new Uint32Array(m + 1); }
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { ops.push({ t: "same", a: a[i], b: b[j], la: i + 1, lb: j + 1 }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ t: "del", a: a[i], la: i + 1 }); i++; }
      else { ops.push({ t: "add", b: b[j], lb: j + 1 }); j++; }
    }
    while (i < n) { ops.push({ t: "del", a: a[i], la: i + 1 }); i++; }
    while (j < m) { ops.push({ t: "add", b: b[j], lb: j + 1 }); j++; }
    return ops;
  }

  /* ---------------------------------------------------------
     Application state
     --------------------------------------------------------- */
  const state = {
    tabs: [],          // { id, name, content, lang, dirty, cursor, scrollTop, scrollLeft, folder }
    activeId: null,
    folders: [],       // { id, name }
    settings: {
      theme: "dark",
      fontSize: 14,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: false,
      eol: "LF",
    },
    find: { open: false, query: "", replace: "", matchCase: false, wholeWord: false, regex: false, hits: [], index: -1 },
    sidebarHidden: false,
    secondary: { open: false, mode: "preview", tabId: null, width: 50 },
  };

  // DOM refs
  const dom = {
    input: $("#input"),
    highlight: $("#highlight code"),
    gutter: $("#gutter"),
    codeScroll: $("#codeScroll"),
    code: $("#codeHost"),
    tabs: $("#tabs"),
    tree: $("#fileTree"),
    sidebar: $("#sidebar"),
    empty: $("#emptyState"),
    editorWrap: $(".editor-wrap"),
    panes: $("#panes"),
    panePrimary: $("#panePrimary"),
    paneSecondary: $("#paneSecondary"),
    splitter: $("#splitter"),
    secBody: $("#secBody"),
    secTitle: $("#secTitle"),
    secMode: $("#secMode"),
    secFile: $("#secFile"),
    dropzones: $("#dropzones"),
  };

  // Secondary editor references (built lazily for "Second File" split mode)
  const secEd = { input: null, highlight: null, gutter: null, scroll: null };

  /* ---------------------------------------------------------
     Pane abstraction (todo3: shortcuts route to the focused pane)
     Both the primary and the secondary "Second File" editor share
     the same behaviour through a lightweight editor object.
     --------------------------------------------------------- */
  const primaryEd = {
    isPrimary: true,
    get input() { return dom.input; },
    get highlight() { return dom.highlight; },
    get gutter() { return dom.gutter; },
    get scroll() { return dom.codeScroll; },
    getTab: () => activeTab(),
  };
  secEd.isPrimary = false;
  secEd.getTab = () => tabById(state.secondary.tabId);
  state.focused = "primary"; // which pane last had editor focus

  function secondaryIsEditor() {
    return state.secondary.open && state.secondary.mode === "editor" && secEd.input && document.contains(secEd.input);
  }
  // The editor that keyboard actions should apply to.
  function activeEd() {
    return (state.focused === "secondary" && secondaryIsEditor()) ? secEd : primaryEd;
  }
  function edTab(ed) { return ed.getTab(); }

  /* ---------------------------------------------------------
     Undo / redo — a small per-tab history stack. We manage this
     ourselves (rather than relying on the textarea's native stack)
     because programmatic edits (indent, duplicate line, replace…)
     otherwise break native undo, and so redo can be bound to Ctrl+Y.
     --------------------------------------------------------- */
  const UndoMgr = (function () {
    const map = new WeakMap();
    function st(tab) {
      if (!map.has(tab)) map.set(tab, { stack: [{ value: tab.content, s: tab.cursor || 0, e: tab.cursor || 0 }], idx: 0, timer: null });
      return map.get(tab);
    }
    function seed(tab) { st(tab); }
    function snapshot(tab, ed) {
      const s = st(tab);
      const val = ed ? ed.input.value : tab.content;
      if (s.stack[s.idx] && s.stack[s.idx].value === val) return;
      s.stack.length = s.idx + 1; // drop any redo history
      s.stack.push({ value: val, s: ed ? ed.input.selectionStart : val.length, e: ed ? ed.input.selectionEnd : val.length });
      s.idx = s.stack.length - 1;
      if (s.stack.length > 250) { s.stack.shift(); s.idx--; }
    }
    function record(tab, ed) { const s = st(tab); clearTimeout(s.timer); s.timer = setTimeout(() => snapshot(tab, ed), 300); }
    function apply(tab, ed, snap) {
      ed.input.value = snap.value; tab.content = snap.value; tab.dirty = true;
      try { ed.input.setSelectionRange(snap.s, snap.e); } catch (e) {}
      renderHighlightFor(ed); renderTabs(); renderTree(); renderStatus(); persist();
      if (ed.isPrimary && state.secondary.open && state.secondary.mode !== "editor") scheduleSecondary();
    }
    function undo(tab, ed) { const s = st(tab); clearTimeout(s.timer); snapshot(tab, ed); if (s.idx > 0) { s.idx--; apply(tab, ed, s.stack[s.idx]); } }
    function redo(tab, ed) { const s = st(tab); clearTimeout(s.timer); if (s.idx < s.stack.length - 1) { s.idx++; apply(tab, ed, s.stack[s.idx]); } }
    return { seed, record, undo, redo };
  })();

  // Stack of recently closed tabs, for "reopen last closed" (Ctrl+Shift+T).
  const closedStack = [];
  function pushClosed(t, pane) {
    closedStack.push({ name: t.name, content: t.content, lang: t.lang, folder: t.folder, cursor: t.cursor || 0, pane: pane || "primary" });
    if (closedStack.length > 30) closedStack.shift();
  }
  function reopenLastClosed() {
    const c = closedStack.pop();
    if (!c) { toast("No recently closed files", "err"); return; }
    const t = newFile(c.name, c.content, c.folder);
    t.cursor = c.cursor;
    if (c.pane === "secondary" && state.tabs.length > 1) openSecondary("editor", t.id);
    toast("Reopened " + c.name, "ok");
  }

  /* ---------------------------------------------------------
     Reusable context menu (todo3 items 2 & 3)
     --------------------------------------------------------- */
  const ContextMenu = (function () {
    let el = null, items = [], idx = -1, onScrollClose = null;

    function close() {
      if (!el) return;
      el.remove(); el = null; items = []; idx = -1;
      document.removeEventListener("mousedown", outside, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", closeScroll, true);
      window.removeEventListener("resize", close, true);
    }
    function outside(e) { if (el && !el.contains(e.target)) close(); }
    function closeScroll() { close(); }
    function move(d) {
      const n = items.length; if (!n) return;
      let i = idx;
      do { i = (i + d + n) % n; } while (items[i].separator && i !== idx);
      idx = i; highlight();
    }
    function highlight() {
      $$(".ctxmenu__item", el).forEach((it, i) => it.classList.toggle("sel", i === idx));
      const sel = el.querySelector(".ctxmenu__item.sel");
      if (sel) sel.scrollIntoView({ block: "nearest" });
    }
    function onKey(e) {
      if (!el) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); if (items[idx] && items[idx].action) { const a = items[idx].action; close(); a(); } }
    }
    function open(x, y, list) {
      close();
      items = list.filter(Boolean);
      el = document.createElement("div");
      el.className = "ctxmenu";
      el.setAttribute("role", "menu");
      items.forEach((it, i) => {
        if (it.separator) { const s = document.createElement("div"); s.className = "ctxmenu__sep"; el.appendChild(s); return; }
        const d = document.createElement("div");
        d.className = "ctxmenu__item" + (it.disabled ? " disabled" : "");
        d.setAttribute("role", "menuitem");
        d.dataset.i = i;
        d.innerHTML = "<span>" + escapeHtml(it.label) + "</span>" + (it.kb ? '<span class="ctxmenu__kb">' + escapeHtml(it.kb) + "</span>" : "");
        if (!it.disabled) d.addEventListener("click", () => { const a = it.action; close(); a && a(); });
        el.appendChild(d);
      });
      document.body.appendChild(el);
      // keep within viewport
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      if (x + r.width > vw) x = Math.max(4, vw - r.width - 4);
      if (y + r.height > vh) y = Math.max(4, vh - r.height - 4);
      el.style.left = x + "px"; el.style.top = y + "px";
      setTimeout(() => {
        document.addEventListener("mousedown", outside, true);
        document.addEventListener("keydown", onKey, true);
        window.addEventListener("scroll", closeScroll, true);
        window.addEventListener("resize", close, true);
      }, 0);
    }
    return { open, close };
  })();

  /* ---------------------------------------------------------
     Rendering
     --------------------------------------------------------- */
  const scheduleHighlight = debounce(renderHighlight, 40);

  function activeTab() { return state.tabs.find((t) => t.id === state.activeId) || null; }

  function renderAll() {
    renderTabs();
    renderTree();
    renderEditor();
    renderStatus();
    applySettings();
    renderSecondary();
  }

  function renderEditor() {
    const t = activeTab();
    if (!t) {
      dom.empty.classList.remove("hidden");
      dom.code.classList.add("hidden");
      return;
    }
    dom.empty.classList.add("hidden");
    dom.code.classList.remove("hidden");
    if (dom.input.value !== t.content) dom.input.value = t.content;
    UndoMgr.seed(t);
    renderHighlight();
    // restore scroll/cursor
    requestAnimationFrame(() => {
      dom.codeScroll.scrollTop = t.scrollTop || 0;
      dom.codeScroll.scrollLeft = t.scrollLeft || 0;
      if (typeof t.cursor === "number") {
        try { dom.input.setSelectionRange(t.cursor, t.cursor); } catch (e) {}
      }
    });
  }

  function renderHighlight() { renderHighlightFor(primaryEd); }

  function renderHighlightFor(ed) {
    const t = edTab(ed);
    if (!t || !ed.input) return;
    const src = ed.input.value;
    let html = Highlight.run(src, t.lang);
    // find highlights overlay (only in the pane the find widget targets)
    if (state.find.open && findEd === ed && state.find.hits.length) html = injectFindMarks(html, src);
    // trailing newline keeps last line height correct
    ed.highlight.innerHTML = html + "\n";
    renderGutterFor(ed);
  }

  function renderGutter(src) { renderGutterFor(primaryEd); }

  function renderGutterFor(ed) {
    const t = edTab(ed);
    if (!t || !ed.gutter) return;
    const src = ed.input.value;
    const wrap = state.settings.wordWrap;
    const focusedHere = activeEd() === ed;
    const lines = src.split("\n");
    const curLine = (wrap || !focusedHere) ? -1 : lineAt(ed);
    let html = "";
    for (let i = 0; i < lines.length; i++) {
      html += '<span class="lnum' + (i + 1 === curLine ? " active" : "") + '">' + (i + 1) + "</span>";
    }
    ed.gutter.innerHTML = html;
    ed.gutter.scrollTop = ed.scroll.scrollTop;
  }

  function lineAt(ed) {
    const pos = ed.input.selectionStart;
    return ed.input.value.slice(0, pos).split("\n").length;
  }
  function currentLine() { return lineAt(primaryEd); }

  function injectFindMarks(html, src) {
    // Rebuild highlighted HTML with find marks by operating on plain text ranges
    // is complex with nested spans; instead we re-highlight but wrap raw hits.
    // Simpler robust approach: mark on escaped-plain text when there are hits.
    const t = activeTab();
    const hits = state.find.hits;
    let out = "";
    let last = 0;
    const plain = src;
    // Build from plain text with escaping + marks (loses syntax colour while searching-large; acceptable)
    for (let i = 0; i < hits.length; i++) {
      const h = hits[i];
      out += escapeHtml(plain.slice(last, h.start));
      const cls = "find-hit" + (i === state.find.index ? " active" : "");
      out += '<span class="' + cls + '">' + escapeHtml(plain.slice(h.start, h.end)) + "</span>";
      last = h.end;
    }
    out += escapeHtml(plain.slice(last));
    return out;
  }

  function renderTabs() {
    dom.tabs.innerHTML = "";
    state.tabs.forEach((t) => {
      const el = document.createElement("div");
      el.className = "tab" + (t.id === state.activeId ? " active" : "") +
        (t.id === state.secondary.tabId && state.secondary.open ? " tab--secondary" : "");
      el.setAttribute("role", "tab");
      el.setAttribute("draggable", "true");
      el.dataset.id = t.id;
      el.innerHTML =
        '<span class="ticon">' + fileIcon(t.lang) + "</span>" +
        '<span class="tname" title="Double-click or click to rename">' + escapeHtml(t.name) + "</span>" +
        (t.dirty ? '<span class="tdirty" title="Unsaved">●</span>' : "") +
        '<button class="tclose" title="Close">✕</button>';
      dom.tabs.appendChild(el);
    });
  }

  function renderTree() {
    dom.tree.innerHTML = "";
    // folders (with expand/collapse + nested, indented children)
    state.folders.forEach((f) => {
      const collapsed = !!f.collapsed;
      const li = document.createElement("li");
      li.className = "tree-item";
      li.innerHTML =
        '<div class="node node--folder" data-folder="' + f.id + '" data-droptarget="' + f.id + '" data-depth="0" style="padding-left:6px">' +
          '<span class="chevron" data-chevron aria-hidden="true">' + (collapsed ? "▸" : "▾") + "</span>" +
          '<span class="ic">' + (collapsed ? "🗀" : "🗁") + "</span>" +
          '<span class="nm">' + escapeHtml(f.name) + "</span>" +
          '<button class="del" title="Delete folder">✕</button></div>' +
        '<ul class="children" data-droptarget="' + f.id + '"' + (collapsed ? " hidden" : "") + "></ul>";
      const ul = li.querySelector(".children");
      const kids = state.tabs.filter((t) => t.folder === f.id);
      if (!kids.length) ul.innerHTML = '<li class="empty-folder" style="padding-left:40px">empty</li>';
      kids.forEach((t) => ul.appendChild(fileNode(t, 1)));
      dom.tree.appendChild(li);
    });
    // root drop target + files (depth 0)
    const rootWrap = document.createElement("li");
    rootWrap.className = "root-drop";
    rootWrap.dataset.droptarget = "";
    const ul = document.createElement("ul");
    ul.className = "children children--root";
    ul.dataset.droptarget = "";
    state.tabs.filter((t) => !t.folder).forEach((t) => ul.appendChild(fileNode(t, 0)));
    rootWrap.appendChild(ul);
    dom.tree.appendChild(rootWrap);
  }

  function fileNode(t, depth) {
    depth = depth || 0;
    const pad = 8 + depth * 16 + 16; // align icon under the folder icon; +16 per depth level
    const li = document.createElement("li");
    li.innerHTML = '<div class="node' + (t.id === state.activeId ? " active" : "") +
      (state.secondary.open && t.id === state.secondary.tabId ? " node--insplit" : "") +
      '" data-id="' + t.id + '" draggable="true" data-depth="' + depth + '" style="padding-left:' + pad + 'px">' +
      '<span class="ic">' + fileIcon(t.lang) + "</span>" +
      '<span class="nm">' + escapeHtml(t.name) + "</span>" +
      (t.dirty ? '<span class="dot" title="Unsaved">●</span>' : '<button class="del" title="Delete">✕</button>') +
      "</div>";
    return li;
  }

  function fileIcon(lang) {
    return ({
      javascript: "🟨", html: "🟧", css: "🟦", json: "🟩", markdown: "📝",
      python: "🐍", powershell: "💠", csv: "📊", yaml: "🗂", shell: "🐚",
    })[lang] || "📄";
  }

  function renderStatus() {
    const t = activeTab();
    $("#stTabs").textContent = state.tabs.length + (state.tabs.length === 1 ? " tab" : " tabs");
    if (!t) {
      $("#stLang").textContent = "Plain Text";
      $("#stPos").textContent = "Ln 1, Col 1";
      $("#stSize").textContent = "0 B";
      $("#stSel").hidden = true;
    } else {
      $("#stLang").textContent = LANGS[t.lang].label;
      $("#stSize").textContent = formatBytes(new Blob([t.content]).size);
      $("#stEol").textContent = state.settings.eol;
      $("#stIndent").textContent = (state.settings.insertSpaces ? "Spaces: " : "Tab Size: ") + state.settings.tabSize;
      updateCursorStatusFor(primaryEd);
    }
    // Split status bar when the second pane is an editor (todo3 item 5)
    const split = secondaryIsEditor();
    $("#statusSecondary").hidden = !split;
    if (split) {
      const t2 = edTab(secEd);
      $("#stLang2").textContent = t2 ? LANGS[t2.lang].label : "Plain Text";
      $("#stSize2").textContent = t2 ? formatBytes(new Blob([t2.content]).size) : "0 B";
      updateCursorStatusFor(secEd);
    }
    $("#statusPrimary").classList.toggle("active", !split || activeEd() === primaryEd);
    $("#statusSecondary").classList.toggle("active", split && activeEd() === secEd);
  }

  function updateCursorStatus() { updateCursorStatusFor(activeEd()); }

  function updateCursorStatusFor(ed) {
    if (!ed || !ed.input) return;
    const isPrimary = ed.isPrimary;
    const posEl = $(isPrimary ? "#stPos" : "#stPos2");
    const selEl = $(isPrimary ? "#stSel" : "#stSel2");
    if (!posEl) return;
    const val = ed.input.value;
    const start = ed.input.selectionStart, end = ed.input.selectionEnd;
    const before = val.slice(0, start);
    const line = before.split("\n").length;
    const col = start - before.lastIndexOf("\n");
    posEl.textContent = "Ln " + line + ", Col " + col;
    if (end > start) {
      const selLen = end - start;
      const selLines = val.slice(start, end).split("\n").length;
      selEl.hidden = false;
      selEl.textContent = "(" + selLen + " selected" + (selLines > 1 ? ", " + selLines + " lines" : "") + ")";
    } else selEl.hidden = true;
  }

  /* ---------------------------------------------------------
     Tab / file operations
     --------------------------------------------------------- */
  function newFile(name, content, folder) {
    let base = name || nextUntitled();
    const t = {
      id: uid(), name: base, content: content || "", lang: langFromName(base),
      dirty: false, cursor: 0, scrollTop: 0, scrollLeft: 0, folder: folder || null,
    };
    state.tabs.push(t);
    UndoMgr.seed(t);
    setActive(t.id);
    renderAll();
    persist();
    return t;
  }

  function nextUntitled() {
    let n = 1, name;
    do { name = "untitled-" + n + ".txt"; n++; } while (state.tabs.some((t) => t.name === name));
    return name;
  }

  function setActive(id) {
    // save current scroll/cursor
    const cur = activeTab();
    if (cur) {
      cur.scrollTop = dom.codeScroll.scrollTop;
      cur.scrollLeft = dom.codeScroll.scrollLeft;
      cur.cursor = dom.input.selectionStart;
    }
    state.activeId = id;
    closeFind();
    renderTabs();
    renderTree();
    renderEditor();
    renderStatus();
    renderSecondary();
    dom.input.focus();
  }

  function closeTab(id) {
    const idx = state.tabs.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const t = state.tabs[idx];
    if (t.dirty && !safeConfirm('"' + t.name + '" has unsaved changes. Close anyway?')) return;
    pushClosed(t, id === state.secondary.tabId ? "secondary" : "primary");
    state.tabs.splice(idx, 1);
    if (state.activeId === id) {
      const next = state.tabs[idx] || state.tabs[idx - 1] || null;
      state.activeId = next ? next.id : null;
    }
    renderAll();
    persist();
  }

  function deleteFile(id) {
    const t = state.tabs.find((x) => x.id === id);
    if (!t) return;
    if (t.dirty && !safeConfirm('Delete "' + t.name + '" with unsaved changes?')) return;
    closeTabForce(id);
  }
  function closeTabForce(id) {
    const idx = state.tabs.findIndex((t) => t.id === id);
    if (idx < 0) return;
    pushClosed(state.tabs[idx], id === state.secondary.tabId ? "secondary" : "primary");
    state.tabs.splice(idx, 1);
    if (state.activeId === id) {
      const next = state.tabs[idx] || state.tabs[idx - 1] || null;
      state.activeId = next ? next.id : null;
    }
    renderAll();
    persist();
  }

  // "Save" = download the file (browser sandbox has no real FS write).
  function saveFile() {
    const t = edTab(activeEd()) || activeTab();
    if (!t) return;
    const blob = new Blob([normalizeEol(t.content)], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = t.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    t.dirty = false;
    renderTabs(); renderTree();
    persist();
    toast("Saved " + t.name, "ok");
  }

  function normalizeEol(text) {
    const nl = state.settings.eol === "CRLF" ? "\r\n" : "\n";
    return text.replace(/\r\n|\r|\n/g, nl);
  }

  function openFiles(fileList) {
    Array.from(fileList).forEach((file) => {
      if (file.size > 25 * 1024 * 1024) { toast("File too large: " + file.name, "err"); return; }
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (ext === "xlsx" || ext === "xls") {
        openSpreadsheet(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const t = newFile(file.name, String(reader.result));
        if (t.lang === "csv") openSecondary("table");
      };
      reader.onerror = () => toast("Failed to read " + file.name, "err");
      reader.readAsText(file);
    });
  }

  // Excel -> parse to rows -> convert to CSV text (inert) -> open with table split.
  function openSpreadsheet(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rows = await Xlsx.toRows(reader.result);
        const csv = rowsToCsv(rows);
        const name = file.name.replace(/\.xlsx?$/i, ".csv");
        const t = newFile(name, csv);
        t.origName = file.name;
        openSecondary("table");
        toast("Imported " + file.name + " (" + rows.length + " rows)", "ok");
      } catch (e) {
        toast("Could not read spreadsheet: " + e.message, "err");
      }
    };
    reader.onerror = () => toast("Failed to read " + file.name, "err");
    reader.readAsArrayBuffer(file);
  }

  /* ---------------------------------------------------------
     Editing helpers: indentation, tabs
     --------------------------------------------------------- */
  function indentUnit() {
    return state.settings.insertSpaces ? " ".repeat(state.settings.tabSize) : "\t";
  }

  function handleTabKey(e, ed) {
    ed = ed || activeEd();
    e.preventDefault();
    const el = ed.input;
    const start = el.selectionStart, end = el.selectionEnd;
    const val = el.value;
    const unit = indentUnit();
    if (start === end && !e.shiftKey) {
      insertText(unit, ed);
      return;
    }
    // multi-line indent / dedent
    const ls = val.lastIndexOf("\n", start - 1) + 1;
    const before = val.slice(0, ls);
    const block = val.slice(ls, end);
    const after = val.slice(end);
    let newBlock;
    if (e.shiftKey) {
      newBlock = block.replace(/^(\t| {1,})/gm, (m) => {
        if (m[0] === "\t") return "";
        return m.slice(0, Math.min(m.length, state.settings.tabSize)) ? m.slice(state.settings.tabSize) : "";
      });
    } else {
      newBlock = block.replace(/^/gm, unit);
    }
    el.value = before + newBlock + after;
    el.selectionStart = ls;
    el.selectionEnd = ls + newBlock.length;
    onEditorInput(ed);
  }

  function insertText(text, ed) {
    ed = ed || activeEd();
    const el = ed.input;
    const start = el.selectionStart, end = el.selectionEnd;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    el.selectionStart = el.selectionEnd = start + text.length;
    onEditorInput(ed);
  }

  function handleEnterAutoIndent(e, ed) {
    ed = ed || activeEd();
    const el = ed.input;
    if (el.selectionStart !== el.selectionEnd) return;
    const val = el.value;
    const start = el.selectionStart;
    const ls = val.lastIndexOf("\n", start - 1) + 1;
    const lineStr = val.slice(ls, start);
    const indentMatch = lineStr.match(/^[\t ]*/);
    let indent = indentMatch ? indentMatch[0] : "";
    // extra indent after opening bracket
    if (/[\{\[\(:]\s*$/.test(lineStr)) indent += indentUnit();
    if (!indent) return; // default behaviour
    e.preventDefault();
    insertText("\n" + indent, ed);
  }

  function autoClosePair(e, ed) {
    ed = ed || activeEd();
    const pairs = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
    const ch = e.key;
    if (!pairs[ch]) return false;
    const el = ed.input;
    if (el.selectionStart !== el.selectionEnd) {
      // wrap selection
      e.preventDefault();
      const s = el.selectionStart, en = el.selectionEnd, val = el.value;
      el.value = val.slice(0, s) + ch + val.slice(s, en) + pairs[ch] + val.slice(en);
      el.selectionStart = s + 1; el.selectionEnd = en + 1;
      onEditorInput(ed);
      return true;
    }
    return false;
  }

  /* ---------------------------------------------------------
     Find / Replace
     --------------------------------------------------------- */
  const findWidget = $("#findWidget");
  let findEd = primaryEd; // the pane the find widget currently searches

  function openFind(withReplace) {
    const ed = activeEd();
    if (!edTab(ed)) return;
    findEd = ed;
    state.find.open = true;
    findWidget.hidden = false;
    // seed with selection
    const sel = ed.input.value.slice(ed.input.selectionStart, ed.input.selectionEnd);
    if (sel && !sel.includes("\n")) { $("#findInput").value = sel; state.find.query = sel; }
    runFind();
    $("#findInput").focus();
    $("#findInput").select();
  }

  function closeFind() {
    state.find.open = false;
    state.find.hits = [];
    state.find.index = -1;
    findWidget.hidden = true;
    renderHighlightFor(findEd);
    if (findEd.input) findEd.input.focus();
  }

  function buildFindRegex() {
    const f = state.find;
    if (!f.query) return null;
    let pattern = f.query;
    if (!f.regex) pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (f.wholeWord) pattern = "\\b" + pattern + "\\b";
    try { return new RegExp(pattern, "g" + (f.matchCase ? "" : "i")); }
    catch (e) { return null; }
  }

  function runFind() {
    const f = state.find;
    const re = buildFindRegex();
    f.hits = [];
    if (re && findEd.input) {
      const src = findEd.input.value;
      let m, guard = 0;
      while ((m = re.exec(src)) && guard++ < 100000) {
        if (m[0] === "") { re.lastIndex++; continue; }
        f.hits.push({ start: m.index, end: m.index + m[0].length });
      }
    }
    f.index = f.hits.length ? 0 : -1;
    $("#findCount").textContent = (f.index + 1) + "/" + f.hits.length;
    renderHighlightFor(findEd);
    if (f.index >= 0) scrollToHit(f.index, false);
  }

  function nextHit(dir) {
    const f = state.find;
    if (!f.hits.length) return;
    f.index = (f.index + dir + f.hits.length) % f.hits.length;
    $("#findCount").textContent = (f.index + 1) + "/" + f.hits.length;
    scrollToHit(f.index, true);
    renderHighlightFor(findEd);
  }

  function scrollToHit(i, select) {
    const h = state.find.hits[i];
    if (!h || !findEd.input) return;
    if (select) {
      findEd.input.focus();
      findEd.input.setSelectionRange(h.start, h.end);
      $("#findInput").focus();
    }
    // approximate vertical scroll
    const line = findEd.input.value.slice(0, h.start).split("\n").length;
    const lineH = state.settings.fontSize * 1.5;
    const target = (line - 1) * lineH;
    const view = findEd.scroll.clientHeight;
    if (target < findEd.scroll.scrollTop || target > findEd.scroll.scrollTop + view - lineH * 2) {
      findEd.scroll.scrollTop = Math.max(0, target - view / 2);
    }
  }

  function replaceOne() {
    const f = state.find;
    if (f.index < 0 || !f.hits[f.index] || !findEd.input) return;
    const h = f.hits[f.index];
    const rep = f.replace;
    const val = findEd.input.value;
    findEd.input.value = val.slice(0, h.start) + rep + val.slice(h.end);
    onEditorInput(findEd);
    runFind();
  }

  function replaceAll() {
    const f = state.find;
    const re = buildFindRegex();
    if (!re || !findEd.input) return;
    const count = f.hits.length;
    findEd.input.value = findEd.input.value.replace(re, f.replace);
    onEditorInput(findEd);
    runFind();
    toast("Replaced " + count + " occurrence" + (count === 1 ? "" : "s"), "ok");
  }

  /* ---------------------------------------------------------
     Command palette
     --------------------------------------------------------- */
  const commands = [
    { id: "file.new", title: "New File", kb: "Alt+N", run: () => newFile() },
    { id: "file.open", title: "Open File…", kb: "Ctrl+O", run: () => $("#fileOpener").click() },
    { id: "file.save", title: "Save File (download)", kb: "Ctrl+S", run: saveFile },
    { id: "file.newFolder", title: "New Folder", run: newFolder },
    { id: "file.rename", title: "Rename Active File", run: () => { const el = dom.tabs.querySelector(".tab.active"); if (el) startInlineRename(el); } },
    { id: "file.close", title: "Close Active Tab", kb: "Ctrl+W", run: () => closeFocusedTab() },
    { id: "file.closeOthers", title: "Close Other Tabs", kb: "Ctrl+Shift+W", run: () => state.activeId && closeOtherTabs(state.activeId) },
    { id: "file.reopen", title: "Reopen Last Closed Tab", kb: "Ctrl+Shift+T", run: reopenLastClosed },
    { id: "edit.undo", title: "Undo", kb: "Ctrl+Z", run: doUndo },
    { id: "edit.redo", title: "Redo", kb: "Ctrl+Y", run: doRedo },
    { id: "edit.find", title: "Find / Replace", kb: "Ctrl+F", run: () => openFind(true) },
    { id: "edit.gotoLine", title: "Go to Line…", kb: "Ctrl+G", run: openGoto },
    { id: "edit.trimWhitespace", title: "Trim Trailing Whitespace", run: trimTrailing },
    { id: "edit.toSpaces", title: "Convert Indentation to Spaces", run: () => convertIndent(true) },
    { id: "edit.toTabs", title: "Convert Indentation to Tabs", run: () => convertIndent(false) },
    { id: "edit.duplicateLine", title: "Duplicate Line", kb: "Ctrl+Shift+D", run: duplicateLine },
    { id: "edit.deleteLine", title: "Delete Line", kb: "Ctrl+Shift+K", run: deleteLine },
    { id: "edit.compare", title: "Compare / Diff Two Files", kb: "Ctrl+Shift+C", run: () => openSecondary("diff") },
    { id: "view.splitFile", title: "Split View: Open Second File", kb: "Ctrl+\\", run: () => openSecondary("editor") },
    { id: "view.mdPreview", title: "Markdown Preview (Split)", kb: "Ctrl+Shift+V", run: () => openSecondary("preview") },
    { id: "view.tableView", title: "Table View (CSV / Excel)", run: () => openSecondary("table") },
    { id: "view.closeSplit", title: "Close Split / Side Pane", run: closeSecondary },
    { id: "view.wordWrap", title: "Toggle Word Wrap", kb: "Alt+Z", run: toggleWordWrap },
    { id: "view.sidebar", title: "Toggle Explorer", kb: "Ctrl+B", run: toggleSidebar },
    { id: "view.theme", title: "Toggle Light/Dark Theme", run: toggleTheme },
    { id: "view.palette", title: "Show All Commands", kb: "Ctrl+P", run: openPalette },
    { id: "app.settings", title: "Open Settings", kb: "Ctrl+,", run: openSettings },
    { id: "app.export", title: "Export Session (shareable URL)", run: exportSession },
    { id: "app.import", title: "Import Session (from URL/data)", run: importSessionPrompt },
    { id: "app.keys", title: "Keyboard Shortcuts Cheat Sheet", run: openSettings },
  ];

  const paletteOverlay = $("#paletteOverlay");
  let paletteFiltered = [], paletteSel = 0;

  function openPalette() {
    paletteOverlay.hidden = false;
    $("#paletteInput").value = "";
    filterPalette("");
    $("#paletteInput").focus();
  }
  function closePalette() { paletteOverlay.hidden = true; dom.input.focus(); }

  function fuzzy(needle, hay) {
    needle = needle.toLowerCase(); hay = hay.toLowerCase();
    if (!needle) return true;
    let i = 0;
    for (const c of hay) { if (c === needle[i]) i++; if (i === needle.length) return true; }
    return false;
  }

  function filterPalette(q) {
    paletteFiltered = commands.filter((c) => fuzzy(q, c.title));
    paletteSel = 0;
    const list = $("#paletteList");
    list.innerHTML = "";
    paletteFiltered.forEach((c, i) => {
      const li = document.createElement("li");
      if (i === paletteSel) li.className = "sel";
      li.dataset.i = i;
      li.innerHTML = "<span>" + escapeHtml(c.title) + "</span>" + (c.kb ? '<span class="kb">' + c.kb + "</span>" : "");
      list.appendChild(li);
    });
  }

  function movePalette(dir) {
    if (!paletteFiltered.length) return;
    paletteSel = (paletteSel + dir + paletteFiltered.length) % paletteFiltered.length;
    $$("#paletteList li").forEach((li, i) => li.classList.toggle("sel", i === paletteSel));
    const sel = $("#paletteList li.sel");
    if (sel) sel.scrollIntoView({ block: "nearest" });
  }

  function runPaletteSel() {
    const c = paletteFiltered[paletteSel];
    closePalette();
    if (c) c.run();
  }

  function runCommand(id) {
    const c = commands.find((x) => x.id === id);
    if (c) c.run();
  }

  /* ---------------------------------------------------------
     Editing commands
     --------------------------------------------------------- */
  function trimTrailing() {
    const ed = activeEd();
    const el = ed.input;
    const pos = el.selectionStart;
    el.value = el.value.replace(/[ \t]+$/gm, "");
    el.selectionStart = el.selectionEnd = Math.min(pos, el.value.length);
    onEditorInput(ed);
    toast("Trimmed trailing whitespace", "ok");
  }

  function convertIndent(toSpaces) {
    const ed = activeEd();
    const el = ed.input;
    const size = state.settings.tabSize;
    if (toSpaces) el.value = el.value.replace(/^\t+/gm, (m) => " ".repeat(m.length * size));
    else el.value = el.value.replace(/^ +/gm, (m) => "\t".repeat(Math.floor(m.length / size)) + " ".repeat(m.length % size));
    state.settings.insertSpaces = toSpaces;
    onEditorInput(ed);
    saveSettings();
    renderStatus();
  }

  function duplicateLine() {
    const ed = activeEd();
    const el = ed.input, val = el.value, pos = el.selectionStart;
    const ls = val.lastIndexOf("\n", pos - 1) + 1;
    let le = val.indexOf("\n", pos); if (le < 0) le = val.length;
    const line = val.slice(ls, le);
    el.value = val.slice(0, le) + "\n" + line + val.slice(le);
    el.selectionStart = el.selectionEnd = pos + line.length + 1;
    onEditorInput(ed);
  }

  function deleteLine() {
    const ed = activeEd();
    const el = ed.input, val = el.value, pos = el.selectionStart;
    const ls = val.lastIndexOf("\n", pos - 1) + 1;
    let le = val.indexOf("\n", pos); if (le < 0) le = val.length; else le += 1;
    el.value = val.slice(0, ls) + val.slice(le);
    el.selectionStart = el.selectionEnd = ls;
    onEditorInput(ed);
  }

  /* ---------------------------------------------------------
     Go to line
     --------------------------------------------------------- */
  const gotoOverlay = $("#gotoOverlay");
  function openGoto() {
    if (!activeEd().getTab()) return;
    gotoOverlay.hidden = false;
    $("#gotoInput").value = "";
    $("#gotoInput").focus();
  }
  function closeGoto() { gotoOverlay.hidden = true; activeEd().input.focus(); }
  function doGoto() {
    const ed = activeEd();
    const n = parseInt($("#gotoInput").value, 10);
    closeGoto();
    if (!n) return;
    const lines = ed.input.value.split("\n");
    const line = clamp(n, 1, lines.length);
    let pos = 0;
    for (let i = 0; i < line - 1; i++) pos += lines[i].length + 1;
    ed.input.focus();
    ed.input.setSelectionRange(pos, pos);
    const lineH = state.settings.fontSize * 1.5;
    ed.scroll.scrollTop = Math.max(0, (line - 1) * lineH - ed.scroll.clientHeight / 2);
    onSelectionChangeFor(ed);
  }

  /* ---------------------------------------------------------
     Settings panel
     --------------------------------------------------------- */
  const settingsOverlay = $("#settingsOverlay");
  function openSettings() {
    settingsOverlay.hidden = false;
    renderSettings();
  }
  function closeSettings() { settingsOverlay.hidden = true; dom.input.focus(); }

  function renderSettings() {
    const s = state.settings;
    const body = $("#settingsBody");
    body.innerHTML = `
      <div class="setting">
        <div><label>Theme</label><div class="desc">Color scheme</div></div>
        <select id="setTheme">
          <option value="dark">Dark</option><option value="light">Light</option>
        </select>
      </div>
      <div class="setting">
        <div><label>Font size</label><div class="desc">Editor text size (px)</div></div>
        <input type="number" id="setFont" min="10" max="32" value="${s.fontSize}">
      </div>
      <div class="setting">
        <div><label>Indentation size</label><div class="desc">Spaces per indent level</div></div>
        <input type="number" id="setTab" min="1" max="8" value="${s.tabSize}">
      </div>
      <div class="setting">
        <div><label>Insert spaces</label><div class="desc">Use spaces instead of tabs</div></div>
        <input type="checkbox" id="setSpaces" ${s.insertSpaces ? "checked" : ""}>
      </div>
      <div class="setting">
        <div><label>Word wrap</label><div class="desc">Wrap long lines</div></div>
        <input type="checkbox" id="setWrap" ${s.wordWrap ? "checked" : ""}>
      </div>
      <div class="setting">
        <div><label>End of line</label><div class="desc">Line ending on save</div></div>
        <select id="setEol"><option value="LF">LF (\\n)</option><option value="CRLF">CRLF (\\r\\n)</option></select>
      </div>
      <div class="setting" style="flex-direction:column;align-items:flex-start;gap:8px">
        <label>Keyboard shortcuts</label>
        <div class="kbd-list">
          ${commands.filter((c) => c.kb).map((c) => "<span>" + escapeHtml(c.title) + "</span><span><kbd>" + c.kb.replace(/\+/g, "</kbd>+<kbd>") + "</kbd></span>").join("")}
        </div>
      </div>`;
    $("#setTheme").value = s.theme;
    $("#setEol").value = s.eol;
    $("#setTheme").onchange = (e) => { s.theme = e.target.value; applySettings(); saveSettings(); };
    $("#setFont").onchange = (e) => { s.fontSize = clamp(+e.target.value, 10, 32); applySettings(); saveSettings(); };
    $("#setTab").onchange = (e) => { s.tabSize = clamp(+e.target.value, 1, 8); applySettings(); renderStatus(); saveSettings(); };
    $("#setSpaces").onchange = (e) => { s.insertSpaces = e.target.checked; renderStatus(); saveSettings(); };
    $("#setWrap").onchange = (e) => { s.wordWrap = e.target.checked; applySettings(); saveSettings(); };
    $("#setEol").onchange = (e) => { s.eol = e.target.value; renderStatus(); saveSettings(); };
  }

  function applySettings() {
    const s = state.settings;
    document.body.classList.toggle("theme-light", s.theme === "light");
    document.documentElement.style.setProperty("--font-size", s.fontSize + "px");
    document.documentElement.style.setProperty("--gutter-w", Math.max(44, 22 + String(Math.max(1, (activeTab()?.content.split("\n").length) || 1)).length * 9) + "px");
    dom.input.style.tabSize = s.tabSize;
    dom.highlight.parentElement.style.tabSize = s.tabSize;
    dom.editorWrap.parentElement.classList.toggle("wrap", s.wordWrap);
    document.body.classList.toggle("wrap", s.wordWrap);
    dom.input.setAttribute("wrap", s.wordWrap ? "soft" : "off");
    renderHighlight();
    if (secEd.input) { secEd.input.style.tabSize = s.tabSize; secEd.input.setAttribute("wrap", s.wordWrap ? "soft" : "off"); renderHighlightFor(secEd); }
  }

  /* ---------------------------------------------------------
     Export / Import session (shareable data)
     --------------------------------------------------------- */
  function serializeSession() {
    return {
      v: 1,
      tabs: state.tabs.map((t) => ({ name: t.name, content: t.content, lang: t.lang, folder: t.folder, dirty: t.dirty })),
      folders: state.folders,
      activeId: state.activeId,
      activeIndex: state.tabs.findIndex((t) => t.id === state.activeId),
      settings: state.settings,
      secondary: state.secondary,
    };
  }

  function b64encodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64decodeUnicode(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  function exportSession() {
    const data = b64encodeUnicode(JSON.stringify(serializeSession()));
    const url = location.origin + location.pathname + "#session=" + data;
    navigator.clipboard?.writeText(url).then(
      () => toast("Shareable URL copied to clipboard", "ok"),
      () => promptCopy(url)
    );
    if (!navigator.clipboard) promptCopy(url);
  }
  function promptCopy(url) {
    prompt("Copy this URL to restore the session later:", url);
  }

  function importSessionPrompt() {
    const input = prompt("Paste a session URL or exported data:");
    if (input) importSessionString(input);
  }

  function importSessionString(str) {
    try {
      let data = str.trim();
      const m = data.match(/#session=(.+)$/);
      if (m) data = m[1];
      const json = JSON.parse(b64decodeUnicode(data));
      loadSession(json, true);
      toast("Session imported", "ok");
    } catch (e) {
      toast("Invalid session data", "err");
    }
  }

  function loadSession(data, replace) {
    if (!data || !Array.isArray(data.tabs)) return;
    if (data.settings) Object.assign(state.settings, data.settings);
    if (replace) { state.tabs = []; state.folders = []; }
    state.folders = data.folders || [];
    const newTabs = data.tabs.map((t) => ({
      id: uid(), name: t.name, content: t.content || "", lang: t.lang || langFromName(t.name),
      dirty: !!t.dirty, cursor: 0, scrollTop: 0, scrollLeft: 0, folder: t.folder || null,
    }));
    state.tabs = replace ? newTabs : state.tabs.concat(newTabs);
    const ai = data.activeIndex != null ? data.activeIndex : 0;
    state.activeId = state.tabs.length ? (state.tabs[ai] || state.tabs[0]).id : null;
    if (data.secondary) {
      Object.assign(state.secondary, data.secondary);
      if (state.secondary.open && (state.secondary.mode === "editor" || state.secondary.mode === "diff")) {
        const idx = typeof data.secondary.tabIndex === "number" ? data.secondary.tabIndex : -1;
        const other = state.tabs.find((t) => t.id !== state.activeId);
        state.secondary.tabId = (idx >= 0 && newTabs[idx]) ? newTabs[idx].id : (other ? other.id : null);
      }
    }
    renderAll();
    persist();
  }

  /* ---------------------------------------------------------
     Secondary pane: split view, markdown preview, table, diff.
     All content rendered here is inert/escaped (Part 2 security).
     --------------------------------------------------------- */
  const scheduleSecondary = debounce(renderSecondary, 60);

  function tabById(id) { return state.tabs.find((t) => t.id === id) || null; }

  function colName(n) {
    let s = "";
    n++;
    while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }

  function openSecondary(mode, tabId) {
    if (!activeTab()) { toast("Open a file first", "err"); return; }
    state.secondary.open = true;
    if (mode) state.secondary.mode = mode;
    if (tabId !== undefined) state.secondary.tabId = tabId;
    if (state.secondary.mode === "editor" || state.secondary.mode === "diff") {
      const others = state.tabs.filter((t) => t.id !== state.activeId);
      if (!others.some((t) => t.id === state.secondary.tabId)) {
        if (!others.length) { toast("Open a second file to use this view", "err"); state.secondary.open = false; return; }
        state.secondary.tabId = others[0].id;
      }
    }
    dom.paneSecondary.hidden = false;
    dom.splitter.hidden = false;
    applySplitWidth();
    renderTabs();
    renderSecondary();
    persist();
  }

  function closeSecondary() {
    state.secondary.open = false;
    state.focused = "primary";
    dom.paneSecondary.hidden = true;
    dom.splitter.hidden = true;
    secEd.input = secEd.highlight = secEd.gutter = secEd.scroll = secEd.tabId = null;
    dom.panePrimary.style.flex = "";
    dom.paneSecondary.style.flex = "";
    renderTabs();
    renderStatus();
    persist();
    dom.input.focus();
  }

  function applySplitWidth() {
    const w = clamp(state.secondary.width || 50, 20, 80);
    dom.panePrimary.style.flex = "1 1 " + (100 - w) + "%";
    dom.paneSecondary.style.flex = "0 0 " + w + "%";
  }

  function setSecMode(mode) {
    state.secondary.mode = mode;
    if ((mode === "editor" || mode === "diff")) {
      const others = state.tabs.filter((t) => t.id !== state.activeId);
      if (!others.some((t) => t.id === state.secondary.tabId)) state.secondary.tabId = others[0] ? others[0].id : null;
    }
    renderSecondary();
    persist();
  }

  function renderSecondary() {
    if (!state.secondary.open) { dom.paneSecondary.hidden = true; dom.splitter.hidden = true; return; }
    const t = activeTab();
    if (!t) { closeSecondary(); return; }
    dom.paneSecondary.hidden = false;
    dom.splitter.hidden = false;
    applySplitWidth();
    const mode = state.secondary.mode;
    dom.secMode.value = mode;
    if (mode === "editor" || mode === "diff") { populateSecFile(); dom.secFile.hidden = false; }
    else dom.secFile.hidden = true;

    if (mode === "preview") { dom.secTitle.textContent = "Preview · " + t.name; renderPreview(t); }
    else if (mode === "table") { dom.secTitle.textContent = "Table · " + t.name; renderTable(t); }
    else if (mode === "diff") { renderDiff(t, tabById(state.secondary.tabId)); }
    else if (mode === "editor") {
      const b = tabById(state.secondary.tabId);
      dom.secTitle.textContent = b ? b.name : "Second file";
      renderSecEditor(b);
    }
    // reflect the split status bar (todo3 item 5)
    renderStatus();
  }

  function populateSecFile() {
    const opts = state.tabs.filter((t) => t.id !== state.activeId);
    dom.secFile.innerHTML = opts.length
      ? opts.map((t) => '<option value="' + t.id + '">' + escapeHtml(t.name) + "</option>").join("")
      : '<option value="">(no other files)</option>';
    if (!opts.some((t) => t.id === state.secondary.tabId)) state.secondary.tabId = opts[0] ? opts[0].id : null;
    if (state.secondary.tabId) dom.secFile.value = state.secondary.tabId;
  }

  function renderPreview(t) {
    if (t.lang !== "markdown") {
      dom.secBody.innerHTML = '<div class="sec-empty">Markdown preview is available for <b>.md</b> files.<br>This file is <b>' +
        escapeHtml(LANGS[t.lang].label) + "</b>.</div>";
      return;
    }
    const div = document.createElement("div");
    div.className = "md-preview";
    // Markdown.render escapes all raw content; safe to assign.
    div.innerHTML = Markdown.render(t.content);
    dom.secBody.innerHTML = "";
    dom.secBody.appendChild(div);
  }

  const tableState = { tabId: null, filters: [] };

  function renderTable(t) {
    const rows = parseCsv(t.content);
    if (!rows.length) { dom.secBody.innerHTML = '<div class="sec-empty">No rows to display.</div>'; return; }
    const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
    if (tableState.tabId !== t.id) { tableState.tabId = t.id; tableState.filters = new Array(maxCols).fill(""); }
    if (tableState.filters.length < maxCols) tableState.filters = tableState.filters.concat(new Array(maxCols - tableState.filters.length).fill(""));
    renderTableInner(rows, maxCols);
  }

  function renderTableInner(rows, maxCols) {
    const filters = tableState.filters;
    const active = filters.map((f) => (f || "").trim().toLowerCase());
    const anyFilter = active.some((f) => f);
    // filter, keeping original row indices for the row-number column
    const filtered = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      let ok = true;
      for (let c = 0; c < maxCols; c++) { if (active[c] && !String(r[c] != null ? r[c] : "").toLowerCase().includes(active[c])) { ok = false; break; } }
      if (ok) filtered.push({ r, i });
    }
    let html = '<div class="table-toolbar"><span class="table-count">Showing ' + filtered.length + " of " + rows.length + " rows</span>" +
      (anyFilter ? '<button class="text-btn" id="tblClear">Clear filters</button>' : "") + "</div>";
    html += '<div class="table-wrap"><table class="data-table"><thead>';
    html += '<tr><th class="rownum">#</th>';
    for (let c = 0; c < maxCols; c++) html += "<th>" + colName(c) + "</th>";
    html += '</tr><tr class="filter-row"><th class="rownum"></th>';
    for (let c = 0; c < maxCols; c++) html += '<th><input class="col-filter" data-col="' + c + '" type="text" placeholder="Filter…" value="' + escapeHtml(filters[c] || "") + '" aria-label="Filter column ' + colName(c) + '"></th>';
    html += "</tr></thead><tbody>";
    for (let ri = 0; ri < filtered.length; ri++) {
      const { r, i } = filtered[ri];
      html += '<tr><td class="rownum">' + (i + 1) + "</td>";
      for (let c = 0; c < maxCols; c++) html += "<td>" + escapeHtml(r[c] != null ? r[c] : "") + "</td>";
      html += "</tr>";
    }
    html += "</tbody></table></div>";
    dom.secBody.innerHTML = html; // all cell values escaped -> inert (no formula execution)
    // wire per-column filters
    $$(".col-filter", dom.secBody).forEach((inp) => {
      inp.addEventListener("input", () => {
        const col = +inp.dataset.col;
        tableState.filters[col] = inp.value;
        const pos = inp.selectionStart;
        renderTableInner(rows, maxCols);
        const again = dom.secBody.querySelector('.col-filter[data-col="' + col + '"]');
        if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) {} }
      });
    });
    const clr = $("#tblClear", dom.secBody);
    if (clr) clr.addEventListener("click", () => { tableState.filters = new Array(maxCols).fill(""); renderTableInner(rows, maxCols); });
  }

  function renderDiff(a, b) {
    if (!b) { dom.secTitle.textContent = "Diff"; dom.secBody.innerHTML = '<div class="sec-empty">Choose a file to compare above.</div>'; return; }
    const ops = diffLines(a.content, b.content);
    let adds = 0, dels = 0;
    let rows = "";
    for (const op of ops) {
      if (op.t === "same") rows += '<tr class="d-same"><td class="dn">' + op.la + '</td><td class="dn">' + op.lb + '</td><td class="dc"> </td><td class="dl">' + escapeHtml(op.a) + "</td></tr>";
      else if (op.t === "del") { dels++; rows += '<tr class="d-del"><td class="dn">' + op.la + '</td><td class="dn"></td><td class="dc">−</td><td class="dl">' + escapeHtml(op.a) + "</td></tr>"; }
      else { adds++; rows += '<tr class="d-add"><td class="dn"></td><td class="dn">' + op.lb + '</td><td class="dc">+</td><td class="dl">' + escapeHtml(op.b) + "</td></tr>"; }
    }
    dom.secTitle.textContent = "Diff · " + escapeHtml(a.name) + " ↔ " + escapeHtml(b.name);
    dom.secBody.innerHTML = '<div class="diff-stats"><span class="d-add-txt">+' + adds + '</span> <span class="d-del-txt">−' + dels + '</span></div>' +
      '<div class="diff"><table>' + rows + "</table></div>";
  }

  function renderSecEditor(b) {
    if (!b) { dom.secBody.innerHTML = '<div class="sec-empty">No second file selected.</div>'; secEd.input = null; secEd.tabId = null; return; }
    if (secEd.input && secEd.tabId === b.id && dom.secBody.contains(secEd.input)) {
      if (secEd.input.value !== b.content) secEd.input.value = b.content;
      renderHighlightFor(secEd);
      return;
    }
    dom.secBody.innerHTML =
      '<div class="code sec-code"><div class="gutter" data-g aria-hidden="true"></div>' +
      '<div class="code__scroll" data-s><pre class="highlight" aria-hidden="true"><code data-h></code></pre>' +
      '<textarea class="input" data-i spellcheck="false" autocomplete="off" wrap="off" aria-label="Second editor"></textarea></div></div>';
    secEd.gutter = dom.secBody.querySelector("[data-g]");
    secEd.scroll = dom.secBody.querySelector("[data-s]");
    secEd.highlight = dom.secBody.querySelector("[data-h]");
    secEd.input = dom.secBody.querySelector("[data-i]");
    secEd.tabId = b.id;
    secEd.input.value = b.content;
    secEd.input.style.tabSize = state.settings.tabSize;
    UndoMgr.seed(b);
    attachEditorEvents(secEd); // same behaviour as the primary pane (todo3 item 7)
    renderHighlightFor(secEd);
  }

  function highlightSec(b) { renderHighlightFor(secEd); }

  // Drag a tab to a side -> open split view with two notes.
  function splitWithTab(id, side) {
    const otherId = (state.tabs.find((t) => t.id !== id) || {}).id;
    if (!otherId) { toast("Open a second file to use split view", "err"); return; }
    if (side === "left") {
      state.secondary.tabId = (state.secondary.tabId && state.secondary.tabId !== id) ? state.secondary.tabId : otherId;
      if (state.secondary.tabId === id) state.secondary.tabId = otherId;
      state.activeId = id;
    } else {
      state.secondary.tabId = id;
      if (state.activeId === id) state.activeId = otherId;
    }
    openSecondary("editor", state.secondary.tabId);
    renderAll();
  }

  function moveFileToFolder(id, folderId) {
    const t = tabById(id);
    if (!t) return;
    t.folder = folderId || null;
    renderTree();
    persist();
  }

  function reorderTabs(dragId, targetId) {
    const from = state.tabs.findIndex((t) => t.id === dragId);
    const to = state.tabs.findIndex((t) => t.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = state.tabs.splice(from, 1);
    state.tabs.splice(to, 0, moved);
    renderTabs();
    persist();
  }

  // Move a tab one position left/right within the strip (todo3 item 3).
  function moveTab(id, dir) {
    const from = state.tabs.findIndex((t) => t.id === id);
    if (from < 0) return;
    const to = clamp(from + dir, 0, state.tabs.length - 1);
    if (to === from) return;
    const [moved] = state.tabs.splice(from, 1);
    state.tabs.splice(to, 0, moved);
    renderTabs();
    persist();
  }

  // Close every tab except the given one.
  function closeOtherTabs(keepId) {
    const others = state.tabs.filter((t) => t.id !== keepId);
    for (const t of others) {
      if (t.dirty && !safeConfirm('"' + t.name + '" has unsaved changes. Close anyway?')) continue;
      pushClosed(t, "primary");
      state.tabs = state.tabs.filter((x) => x.id !== t.id);
    }
    if (!state.tabs.some((t) => t.id === state.activeId)) state.activeId = keepId;
    if (!state.tabs.some((t) => t.id === state.secondary.tabId)) closeSecondary();
    renderAll();
    persist();
  }

  // Open a tab in the secondary pane as an editor (split).
  function splitTabToSecondary(id) {
    const others = state.tabs.filter((t) => t.id !== id);
    if (!others.length) { toast("Open a second file to split", "err"); return; }
    if (state.activeId === id) state.activeId = others[0].id;
    openSecondary("editor", id);
    renderAll();
  }

  // --- Keyboard actions scoped to the focused pane (todo3 items 6-8) ---
  function closeFocusedTab() {
    const t = edTab(activeEd());
    if (t) closeTab(t.id);
    else if (state.activeId) closeTab(state.activeId);
  }
  function doUndo() { const ed = activeEd(); const t = edTab(ed); if (t) UndoMgr.undo(t, ed); }
  function doRedo() { const ed = activeEd(); const t = edTab(ed); if (t) UndoMgr.redo(t, ed); }

  function startInlineRename(tabEl) {
    const t = tabById(tabEl.dataset.id);
    if (!t) return;
    const span = tabEl.querySelector(".tname");
    if (!span) return;
    const input = document.createElement("input");
    input.className = "tname-edit";
    input.value = t.name;
    span.replaceWith(input);
    input.focus(); input.select();
    let done = false;
    const commit = () => {
      if (done) return; done = true;
      const v = input.value.trim();
      if (v && v !== t.name) { t.name = v; t.lang = langFromName(v); }
      renderAll(); persist();
      dom.input.focus();
    };
    input.addEventListener("keydown", (ev) => {
      ev.stopPropagation();
      if (ev.key === "Enter") { ev.preventDefault(); commit(); }
      else if (ev.key === "Escape") { done = true; renderTabs(); }
    });
    input.addEventListener("blur", commit);
    input.addEventListener("click", (ev) => ev.stopPropagation());
    input.addEventListener("dblclick", (ev) => ev.stopPropagation());
  }

  /* ---------------------------------------------------------
     View toggles
     --------------------------------------------------------- */
  function toggleWordWrap() { state.settings.wordWrap = !state.settings.wordWrap; applySettings(); saveSettings(); toast("Word wrap " + (state.settings.wordWrap ? "on" : "off")); }
  function toggleSidebar() { state.sidebarHidden = !state.sidebarHidden; dom.sidebar.classList.toggle("hidden", state.sidebarHidden); saveSettings(); }
  function toggleTheme() { state.settings.theme = state.settings.theme === "dark" ? "light" : "dark"; applySettings(); saveSettings(); }

  function newFolder() {
    let n = 1, name;
    do { name = "New Folder" + (n > 1 ? " " + n : ""); n++; } while (state.folders.some((f) => f.name === name));
    const f = { id: uid(), name };
    state.folders.push(f);
    renderTree();
    persist();
    const nodeEl = dom.tree.querySelector('.node--folder[data-folder="' + f.id + '"]');
    if (nodeEl) treeInlineRename(nodeEl);
  }

  // Inline rename for tree nodes (works for both files and folders; avoids prompt()).
  function treeInlineRename(nodeEl) {
    const isFolder = nodeEl.classList.contains("node--folder");
    const id = isFolder ? nodeEl.dataset.folder : nodeEl.dataset.id;
    const obj = isFolder ? state.folders.find((f) => f.id === id) : tabById(id);
    if (!obj) return;
    const span = nodeEl.querySelector(".nm");
    if (!span) return;
    const input = document.createElement("input");
    input.className = "tname-edit";
    input.value = obj.name;
    span.replaceWith(input);
    input.focus(); input.select();
    let done = false;
    const commit = () => {
      if (done) return; done = true;
      const v = input.value.trim();
      if (v) { obj.name = v; if (!isFolder) obj.lang = langFromName(v); }
      renderAll(); persist();
    };
    input.addEventListener("keydown", (ev) => {
      ev.stopPropagation();
      if (ev.key === "Enter") { ev.preventDefault(); commit(); }
      else if (ev.key === "Escape") { done = true; renderTree(); }
    });
    input.addEventListener("blur", commit);
    input.addEventListener("click", (ev) => ev.stopPropagation());
  }

  function deleteFolder(fid) {
    const f = state.folders.find((x) => x.id === fid);
    if (!f) return;
    const kids = state.tabs.filter((t) => t.folder === fid);
    if (kids.length && !safeConfirm('Delete folder "' + f.name + '"? Files inside move to the root.')) return;
    kids.forEach((t) => (t.folder = null));
    state.folders = state.folders.filter((x) => x.id !== fid);
    renderTree();
    persist();
  }

  function toggleFolder(fid) {
    const f = state.folders.find((x) => x.id === fid);
    if (!f) return;
    f.collapsed = !f.collapsed;
    renderTree();
    persist();
  }

  // Create a file inside a folder (context menu). Auto-expands the folder and
  // drops the new item straight into inline rename mode (todo3 item 2).
  function newFileInFolder(folderId) {
    const f = state.folders.find((x) => x.id === folderId);
    if (f) f.collapsed = false;
    const t = newFile(undefined, "", folderId);
    // newFile() already re-rendered the tree, so the node exists now.
    const el = dom.tree.querySelector('.node[data-id="' + t.id + '"]');
    if (el) treeInlineRename(el);
  }

  function duplicateFile(id) {
    const t = tabById(id);
    if (!t) return;
    const dot = t.name.lastIndexOf(".");
    const base = dot > 0 ? t.name.slice(0, dot) : t.name;
    const ext = dot > 0 ? t.name.slice(dot) : "";
    let name, n = 1;
    do { name = base + " copy" + (n > 1 ? " " + n : "") + ext; n++; } while (state.tabs.some((x) => x.name === name));
    newFile(name, t.content, t.folder);
  }

  /* ---------------------------------------------------------
     Persistence of full session
     --------------------------------------------------------- */
  const persist = debounce(function () {
    const cur = activeTab();
    if (cur) { cur.cursor = dom.input.selectionStart; cur.scrollTop = dom.codeScroll.scrollTop; cur.scrollLeft = dom.codeScroll.scrollLeft; }
    Store.set("session", {
      tabs: state.tabs, folders: state.folders, activeId: state.activeId, settings: state.settings,
      sidebarHidden: state.sidebarHidden, secondary: state.secondary,
    });
  }, 300);

  function saveSettings() { persist(); }

  async function restore() {
    const data = await Store.get("session");
    if (data && Array.isArray(data.tabs) && data.tabs.length) {
      Object.assign(state.settings, data.settings || {});
      state.folders = data.folders || [];
      state.tabs = data.tabs.map((t) => ({
        id: t.id || uid(), name: t.name, content: t.content || "", lang: t.lang || langFromName(t.name),
        dirty: !!t.dirty, cursor: t.cursor || 0, scrollTop: t.scrollTop || 0, scrollLeft: t.scrollLeft || 0, folder: t.folder || null,
      }));
      state.activeId = data.activeId && state.tabs.some((t) => t.id === data.activeId) ? data.activeId : state.tabs[0].id;
      state.sidebarHidden = !!data.sidebarHidden;
      dom.sidebar.classList.toggle("hidden", state.sidebarHidden);
      if (data.secondary) {
        Object.assign(state.secondary, data.secondary);
        // only keep the split open if the referenced second file still exists (for editor/diff)
        if ((state.secondary.mode === "editor" || state.secondary.mode === "diff") &&
            !state.tabs.some((t) => t.id === state.secondary.tabId && t.id !== state.activeId)) {
          state.secondary.tabId = (state.tabs.find((t) => t.id !== state.activeId) || {}).id || null;
        }
      }
      return true;
    }
    return false;
  }

  /* ---------------------------------------------------------
     Input & event wiring
     --------------------------------------------------------- */
  function onEditorInput(ed) {
    ed = ed || activeEd();
    const t = edTab(ed);
    if (!t) return;
    t.content = ed.input.value;
    t.dirty = true;
    UndoMgr.record(t, ed);
    if (state.find.open && findEd === ed) runFind();
    if (ed.isPrimary) scheduleHighlight(); else scheduleHighlightSec();
    renderTabs();
    renderTree();
    renderStatus();
    if (ed.isPrimary && state.secondary.open && state.secondary.mode !== "editor") scheduleSecondary();
    persist();
  }
  function onInput() { onEditorInput(primaryEd); }

  const scheduleHighlightSec = debounce(() => renderHighlightFor(secEd), 40);

  function onScrollFor(ed) {
    ed.gutter.scrollTop = ed.scroll.scrollTop;
    const t = edTab(ed);
    if (t) { t.scrollTop = ed.scroll.scrollTop; t.scrollLeft = ed.scroll.scrollLeft; }
  }
  function onScroll() { onScrollFor(primaryEd); }

  function onSelectionChangeFor(ed) {
    state.focused = ed.isPrimary ? "primary" : "secondary";
    updateCursorStatusFor(ed);
    if (!state.settings.wordWrap) renderGutterFor(ed);
    $("#statusPrimary").classList.toggle("active", activeEd() === primaryEd);
    $("#statusSecondary").classList.toggle("active", secondaryIsEditor() && activeEd() === secEd);
  }
  function onSelectionChange() { onSelectionChangeFor(primaryEd); }

  // Attach the unified editor behaviour to a pane (used by primary + secondary
  // so every shortcut/edit works identically in the right-side pane — todo3 item 7).
  function attachEditorEvents(ed) {
    ed.input.addEventListener("input", () => onEditorInput(ed));
    ed.scroll.addEventListener("scroll", () => onScrollFor(ed));
    ed.input.addEventListener("keyup", () => onSelectionChangeFor(ed));
    ed.input.addEventListener("click", () => onSelectionChangeFor(ed));
    ed.input.addEventListener("select", () => onSelectionChangeFor(ed));
    ed.input.addEventListener("focus", () => { state.focused = ed.isPrimary ? "primary" : "secondary"; onSelectionChangeFor(ed); });
    ed.input.addEventListener("keydown", (e) => {
      if (e.key === "Tab") { handleTabKey(e, ed); return; }
      if (e.key === "Enter") { handleEnterAutoIndent(e, ed); return; }
      autoClosePair(e, ed);
    });
  }

  function wire() {
    let draggingTabId = null, draggingFileId = null;

    // Primary editor behaviour (unified with the secondary pane)
    attachEditorEvents(primaryEd);

    // Menu buttons / data-cmd
    document.body.addEventListener("click", (e) => {
      const cmdEl = e.target.closest("[data-cmd]");
      if (cmdEl) { runCommand(cmdEl.dataset.cmd); return; }
    });

    // Tabs: activate, close, inline-rename (click active tab's name)
    dom.tabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      if (e.target.classList.contains("tclose")) { closeTab(tab.dataset.id); return; }
      if (e.target.classList.contains("tname") && tab.dataset.id === state.activeId) { startInlineRename(tab); return; }
      setActive(tab.dataset.id);
    });
    dom.tabs.addEventListener("dblclick", (e) => {
      const tab = e.target.closest(".tab");
      if (tab && e.target.classList.contains("tname")) startInlineRename(tab);
    });

    // Tab context menu (todo3 item 3)
    dom.tabs.addEventListener("contextmenu", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      e.preventDefault();
      const id = tab.dataset.id;
      const t = tabById(id);
      const idx = state.tabs.findIndex((x) => x.id === id);
      ContextMenu.open(e.clientX, e.clientY, [
        { label: "Split Editor (Open to Side)", action: () => splitTabToSecondary(id) },
        (t && t.lang === "markdown") ? { label: "Open Markdown Preview", action: () => { setActive(id); openSecondary("preview"); } } : null,
        state.secondary.open ? {
          label: "Move to Other Pane", action: () => {
            state.secondary.tabId = id;
            if (state.activeId === id) { const o = state.tabs.find((x) => x.id !== id); if (o) state.activeId = o.id; }
            setSecMode("editor"); renderAll();
          }
        } : null,
        { separator: true },
        { label: "Move Tab Left", disabled: idx <= 0, action: () => moveTab(id, -1) },
        { label: "Move Tab Right", disabled: idx >= state.tabs.length - 1, action: () => moveTab(id, 1) },
        { separator: true },
        { label: "Rename", action: () => { const el = dom.tabs.querySelector('.tab[data-id="' + id + '"]'); if (el) startInlineRename(el); } },
        { label: "Close", kb: "Ctrl+W", action: () => closeTab(id) },
        { label: "Close Others", disabled: state.tabs.length < 2, action: () => closeOtherTabs(id) },
      ]);
    });

    // Tab drag: reorder within strip, or drag to a side to split
    dom.tabs.addEventListener("dragstart", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      draggingTabId = tab.dataset.id;
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", tab.dataset.id); } catch (x) {}
      dom.dropzones.hidden = false;
    });
    dom.tabs.addEventListener("dragend", () => {
      draggingTabId = null; dom.dropzones.hidden = true;
      $$(".dropzone", dom.dropzones).forEach((z) => z.classList.remove("over"));
    });
    dom.tabs.addEventListener("dragover", (e) => { if (draggingTabId) e.preventDefault(); });
    dom.tabs.addEventListener("drop", (e) => {
      if (!draggingTabId) return;
      e.preventDefault();
      const tgt = e.target.closest(".tab");
      if (tgt && tgt.dataset.id !== draggingTabId) reorderTabs(draggingTabId, tgt.dataset.id);
    });

    // Split drop zones
    $$(".dropzone", dom.dropzones).forEach((z) => {
      z.addEventListener("dragover", (e) => { if (draggingTabId) { e.preventDefault(); z.classList.add("over"); } });
      z.addEventListener("dragleave", () => z.classList.remove("over"));
      z.addEventListener("drop", (e) => {
        e.preventDefault(); z.classList.remove("over");
        const id = draggingTabId; dom.dropzones.hidden = true;
        if (id) splitWithTab(id, z.dataset.zone);
      });
    });

    // File tree: activate / delete / folder delete / expand-collapse
    dom.tree.addEventListener("click", (e) => {
      const chevron = e.target.closest("[data-chevron]");
      const del = e.target.closest(".del");
      const fileNodeEl = e.target.closest(".node[data-id]");
      const folderNodeEl = e.target.closest(".node--folder");
      if (del && folderNodeEl) { deleteFolder(folderNodeEl.dataset.folder); return; }
      if (del && fileNodeEl) { deleteFile(fileNodeEl.dataset.id); return; }
      if (folderNodeEl) { toggleFolder(folderNodeEl.dataset.folder); return; }
      if (fileNodeEl) setActive(fileNodeEl.dataset.id);
    });
    dom.tree.addEventListener("dblclick", (e) => {
      const node = e.target.closest(".node[data-id], .node--folder");
      if (node) treeInlineRename(node);
    });

    // Explorer context menu (todo3 item 2)
    dom.tree.addEventListener("contextmenu", (e) => {
      const fileNodeEl = e.target.closest(".node[data-id]");
      const folderNodeEl = e.target.closest(".node--folder");
      if (!fileNodeEl && !folderNodeEl) {
        e.preventDefault();
        ContextMenu.open(e.clientX, e.clientY, [
          { label: "New File", action: () => newFile() },
          { label: "New Folder", action: () => newFolder() },
        ]);
        return;
      }
      e.preventDefault();
      if (folderNodeEl) {
        const fid = folderNodeEl.dataset.folder;
        ContextMenu.open(e.clientX, e.clientY, [
          { label: "New File", action: () => newFileInFolder(fid) },
          { label: "New Folder", action: () => newFolder() },
          { label: "Rename", action: () => treeInlineRename(folderNodeEl) },
          { separator: true },
          { label: "Delete Folder", action: () => deleteFolder(fid) },
        ]);
      } else {
        const id = fileNodeEl.dataset.id;
        const t = tabById(id);
        ContextMenu.open(e.clientX, e.clientY, [
          { label: "Open", action: () => setActive(id) },
          { label: "Open to the Side (Split)", action: () => splitTabToSecondary(id) },
          (t && t.lang === "markdown") ? { label: "Open Preview", action: () => { setActive(id); openSecondary("preview"); } } : null,
          { label: "Rename", action: () => treeInlineRename(fileNodeEl) },
          { label: "Duplicate", action: () => duplicateFile(id) },
          { separator: true },
          { label: "Delete", action: () => deleteFile(id) },
        ]);
      }
    });

    // File tree drag-and-drop: move files between folders / root
    dom.tree.addEventListener("dragstart", (e) => {
      const node = e.target.closest(".node[data-id]");
      if (!node) return;
      draggingFileId = node.dataset.id;
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", node.dataset.id); } catch (x) {}
    });
    dom.tree.addEventListener("dragend", () => {
      draggingFileId = null;
      $$("[data-droptarget]", dom.tree).forEach((el) => el.classList.remove("over"));
    });
    dom.tree.addEventListener("dragover", (e) => {
      if (draggingFileId == null) return;
      const dt = e.target.closest("[data-droptarget]");
      if (dt) { e.preventDefault(); $$("[data-droptarget]", dom.tree).forEach((el) => el.classList.remove("over")); dt.classList.add("over"); }
    });
    dom.tree.addEventListener("drop", (e) => {
      if (draggingFileId == null) return;
      const dt = e.target.closest("[data-droptarget]");
      if (dt) { e.preventDefault(); moveFileToFolder(draggingFileId, dt.dataset.droptarget || null); }
    });

    // Secondary pane controls
    dom.secMode.addEventListener("change", (e) => setSecMode(e.target.value));
    dom.secFile.addEventListener("change", (e) => { state.secondary.tabId = e.target.value || null; renderTabs(); renderSecondary(); persist(); });
    $("#secClose").addEventListener("click", closeSecondary);

    // Splitter drag to resize
    let splitting = false;
    dom.splitter.addEventListener("mousedown", (e) => { splitting = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; e.preventDefault(); });
    document.addEventListener("mousemove", (e) => {
      if (!splitting) return;
      const rect = dom.panes.getBoundingClientRect();
      state.secondary.width = clamp((rect.right - e.clientX) / rect.width * 100, 20, 80);
      applySplitWidth();
    });
    document.addEventListener("mouseup", () => { if (splitting) { splitting = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; persist(); } });

    $("#toggleSidebar").addEventListener("click", toggleSidebar);
    $("#fileOpener").addEventListener("change", (e) => { openFiles(e.target.files); e.target.value = ""; });

    // Find widget
    $("#findInput").addEventListener("input", (e) => { state.find.query = e.target.value; runFind(); });
    $("#replaceInput").addEventListener("input", (e) => { state.find.replace = e.target.value; });
    $("#findInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); nextHit(e.shiftKey ? -1 : 1); }
      else if (e.key === "Escape") closeFind();
    });
    $("#replaceInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); replaceOne(); }
      else if (e.key === "Escape") closeFind();
    });
    $("#findNext").onclick = () => nextHit(1);
    $("#findPrev").onclick = () => nextHit(-1);
    $("#findClose").onclick = closeFind;
    $("#replaceOne").onclick = replaceOne;
    $("#replaceAll").onclick = replaceAll;
    $("#findCase").onclick = () => toggleFindOpt("matchCase", "#findCase");
    $("#findWord").onclick = () => toggleFindOpt("wholeWord", "#findWord");
    $("#findRegex").onclick = () => toggleFindOpt("regex", "#findRegex");

    // Palette
    $("#paletteInput").addEventListener("input", (e) => filterPalette(e.target.value));
    $("#paletteInput").addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); movePalette(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); movePalette(-1); }
      else if (e.key === "Enter") { e.preventDefault(); runPaletteSel(); }
      else if (e.key === "Escape") closePalette();
    });
    $("#paletteList").addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (li) { paletteSel = +li.dataset.i; runPaletteSel(); }
    });

    // Settings / goto close
    $("#settingsClose").onclick = closeSettings;
    settingsOverlay.addEventListener("click", (e) => { if (e.target === settingsOverlay) closeSettings(); });
    paletteOverlay.addEventListener("click", (e) => { if (e.target === paletteOverlay) closePalette(); });
    gotoOverlay.addEventListener("click", (e) => { if (e.target === gotoOverlay) closeGoto(); });
    $("#gotoInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); doGoto(); }
      else if (e.key === "Escape") closeGoto();
    });

    // Status bar interactions
    $("#stEol").setAttribute("data-clickable", "");
    $("#stEol").onclick = () => { state.settings.eol = state.settings.eol === "LF" ? "CRLF" : "LF"; renderStatus(); saveSettings(); };
    $("#stIndent").setAttribute("data-clickable", "");
    $("#stIndent").onclick = openSettings;
    $("#stLang").setAttribute("data-clickable", "");

    // Drag & drop files
    document.addEventListener("dragover", (e) => { e.preventDefault(); });
    document.addEventListener("drop", (e) => {
      e.preventDefault();
      if (e.dataTransfer?.files?.length) openFiles(e.dataTransfer.files);
    });

    // Global keybindings
    document.addEventListener("keydown", globalKeys, true);

    // Before unload warning
    window.addEventListener("beforeunload", (e) => {
      if (state.tabs.some((t) => t.dirty)) { e.preventDefault(); e.returnValue = ""; }
    });

    // Connectivity
    const conn = $("#connStatus");
    const setConn = () => { conn.classList.toggle("offline", !navigator.onLine); conn.title = navigator.onLine ? "Online" : "Offline"; };
    window.addEventListener("online", setConn);
    window.addEventListener("offline", setConn);
    setConn();
  }

  function toggleFindOpt(key, sel) {
    state.find[key] = !state.find[key];
    $(sel).classList.toggle("active", state.find[key]);
    runFind();
  }

  function globalKeys(e) {
    const ctrl = e.ctrlKey || e.metaKey;
    // Command palette (Ctrl+P / Ctrl+Shift+P). preventDefault stops the browser Print dialog.
    if (ctrl && (e.key === "p" || e.key === "P")) { e.preventDefault(); openPalette(); return; }
    // Ctrl+N is reserved by browsers (opens a new window) and cannot be reliably
    // intercepted. We attempt it as best-effort (works in browsers that deliver the
    // event) and also provide Alt+N, the "New" button, and the command palette.
    if (ctrl && !e.shiftKey && !e.altKey && (e.key === "n" || e.key === "N")) { e.preventDefault(); newFile(); return; }
    if (e.altKey && !ctrl && (e.key === "n" || e.key === "N")) { e.preventDefault(); newFile(); return; }
    if (ctrl && e.key === "o") { e.preventDefault(); $("#fileOpener").click(); return; }
    if (ctrl && e.key === "s") { e.preventDefault(); saveFile(); return; }
    if (ctrl && e.key === "f") { e.preventDefault(); openFind(true); return; }
    if (ctrl && e.key === "g") { e.preventDefault(); openGoto(); return; }
    if (ctrl && e.key === "b") { e.preventDefault(); toggleSidebar(); return; }
    if (ctrl && e.key === ",") { e.preventDefault(); openSettings(); return; }
    if (ctrl && e.key === "w") { e.preventDefault(); closeFocusedTab(); return; }
    if (ctrl && e.shiftKey && (e.key === "w" || e.key === "W")) { e.preventDefault(); state.secondary.open ? closeSecondary() : (state.activeId && closeOtherTabs(state.activeId)); return; }
    // Reopen last closed. Ctrl+Shift+T is reserved by some browsers; best-effort +
    // always available via the command palette.
    if (ctrl && e.shiftKey && (e.key === "t" || e.key === "T")) { e.preventDefault(); reopenLastClosed(); return; }
    // Undo / redo routed to the focused pane (custom history supports programmatic edits).
    if (ctrl && !e.shiftKey && (e.key === "z" || e.key === "Z")) { e.preventDefault(); doUndo(); return; }
    if (ctrl && ((e.shiftKey && (e.key === "z" || e.key === "Z")) || (!e.shiftKey && (e.key === "y" || e.key === "Y")))) { e.preventDefault(); doRedo(); return; }
    if (ctrl && e.key === "\\") { e.preventDefault(); state.secondary.open ? closeSecondary() : openSecondary("editor"); return; }
    if (ctrl && e.shiftKey && (e.key === "c" || e.key === "C")) { e.preventDefault(); openSecondary("diff"); return; }
    if (ctrl && e.shiftKey && (e.key === "v" || e.key === "V")) { e.preventDefault(); openSecondary("preview"); return; }
    if (e.altKey && (e.key === "z" || e.key === "Z")) { e.preventDefault(); toggleWordWrap(); return; }
    if (ctrl && e.shiftKey && (e.key === "d" || e.key === "D")) { e.preventDefault(); duplicateLine(); return; }
    if (ctrl && e.shiftKey && (e.key === "k" || e.key === "K")) { e.preventDefault(); deleteLine(); return; }
    // Ctrl+Tab tab switching
    if (ctrl && e.key === "Tab") {
      e.preventDefault();
      if (!state.tabs.length) return;
      let i = state.tabs.findIndex((t) => t.id === state.activeId);
      i = (i + (e.shiftKey ? -1 : 1) + state.tabs.length) % state.tabs.length;
      setActive(state.tabs[i].id);
      return;
    }
    if (e.key === "Escape") {
      if (!paletteOverlay.hidden) closePalette();
      else if (!settingsOverlay.hidden) closeSettings();
      else if (!gotoOverlay.hidden) closeGoto();
      else if (state.find.open) closeFind();
    }
  }

  /* ---------------------------------------------------------
     Service worker (offline)
     --------------------------------------------------------- */
  function registerSW() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      });
    }
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  async function init() {
    wire();
    registerSW();

    // Import from URL hash if present
    const hash = location.hash || "";
    if (hash.startsWith("#session=")) {
      try {
        const json = JSON.parse(b64decodeUnicode(hash.slice(9)));
        loadSession(json, true);
        history.replaceState(null, "", location.pathname);
        applySettings();
        renderAll();
        return;
      } catch (e) { /* fall through */ }
    }

    const restored = await restore();
    if (!restored) {
      newFile("welcome.md", WELCOME);
    }
    applySettings();
    renderAll();
    dom.input.focus();
  }

  const WELCOME = `# Welcome to Note

A fast, self-contained code editor that runs entirely in your browser.

## Features
- Multiple tabs with unsaved indicators, inline rename (click the tab name)
- Right-click **tabs** and the **Explorer** for context menus (split, preview, new file in folder, rename, delete…)
- Split view — drag a tab to the left/right edge to open two notes side by side
- Shortcuts (save, close, undo/redo, find…) apply to whichever pane is focused
- Compare / diff two open files (**Ctrl+Shift+C**)
- Markdown preview in a side pane (**Ctrl+Shift+V**)
- Open **.csv** / **.xlsx** for a safe table with per-column filters and a row count
- Folders with indentation, indent guides and collapse; drag-and-drop in the explorer
- Undo **Ctrl+Z** / redo **Ctrl+Y**, reopen last closed **Ctrl+Shift+T**
- Find & Replace with regex, command palette (**Ctrl+P**)
- Offline-first — works with no internet, auto-saves locally

## Try it
1. Press **Alt+N** to create a file (Ctrl+N is reserved by the browser).
2. Press **Ctrl+P** to see all commands.
3. Drag this tab to the right edge to split the view.

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("world"));
\`\`\`

Happy coding!
`;

  document.addEventListener("DOMContentLoaded", init);
})();
