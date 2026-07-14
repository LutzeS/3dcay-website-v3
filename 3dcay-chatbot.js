/**
 * 3DCAY Website-Chatbot – einbettbares Widget
 * Einbau:  <script src="/3dcay-chatbot.js" defer></script>  (vor </body>)
 * Optional davor konfigurieren:
 *   <script>window.DCAY_CHAT_CONFIG = { endpoint: "/.netlify/functions/chat", lang: "auto" };</script>
 */
(function () {
  "use strict";

  var CFG = Object.assign(
    {
      endpoint: "/.netlify/functions/chat",
      lang: "auto", // "de" | "en" | "auto"
      accent: "#e3101a", // Akzentfarbe – an CI anpassen
      dark: "#0A0A0A",
    },
    window.DCAY_CHAT_CONFIG || {}
  );

  // ---------- Sprache ----------
  function detectLang() {
    if (CFG.lang === "de" || CFG.lang === "en") return CFG.lang;
    try { var ls = localStorage.getItem("3dcay-lang"); if (ls === "de" || ls === "en") return ls; } catch (e) {}
    var htmlLang = (document.documentElement.lang || "").toLowerCase();
    if (htmlLang.indexOf("en") === 0) return "en";
    if (htmlLang.indexOf("de") === 0) return "de";
    return (navigator.language || "de").toLowerCase().indexOf("en") === 0 ? "en" : "de";
  }
  var LANG = detectLang();

  var T = {
    de: {
      title: "3DCAY Assistent",
      subtitle: "Fragen zu Produkten & Services",
      placeholder: "Ihre Frage …",
      send: "Senden",
      greeting:
        "Hallo! Ich bin der 3DCAY-Assistent. Ich beantworte Fragen zu unseren Produkten (Shop, Web-to-Publish, Cashback, App), Services und Ressourcen. Wie kann ich helfen?",
      offline:
        "Entschuldigung, ich bin gerade nicht erreichbar. Bitte nutzen Sie den Kontakt-Button oben rechts – wir melden uns umgehend.",
      quick: [
        ["Was ist der 3DCAY Shop?", "Was ist der 3DCAY Shop?"],
        ["Cashback mit KI erklären", "Wie funktioniert 3DCAY Cashback mit KI-Belegerkennung?"],
        ["Web-to-Publish", "Was kann 3DCAY Web-to-Publish?"],
        ["Demo anfragen", "Ich möchte eine Demo anfragen. Wie geht das?"],
      ],
      disclaimer: "KI-Assistent – Angaben ohne Gewähr. Verbindliches klären wir gern persönlich.",
      open: "Chat öffnen",
      close: "Chat schließen",
    },
    en: {
      title: "3DCAY Assistant",
      subtitle: "Questions about products & services",
      placeholder: "Your question …",
      send: "Send",
      greeting:
        "Hi! I'm the 3DCAY assistant. I answer questions about our products (Shop, Web-to-Publish, Cashback, App), services and resources. How can I help?",
      offline:
        "Sorry, I'm currently unavailable. Please use the contact button in the top right corner – we'll get back to you right away.",
      quick: [
        ["What is 3DCAY Shop?", "What is 3DCAY Shop?"],
        ["Cashback with AI", "How does 3DCAY Cashback work with AI receipt recognition?"],
        ["Web-to-Publish", "What can 3DCAY Web-to-Publish do?"],
        ["Request a demo", "I would like to request a demo. How does that work?"],
      ],
      disclaimer: "AI assistant – information without guarantee. Happy to confirm details personally.",
      open: "Open chat",
      close: "Close chat",
    },
  }[LANG];

  // ---------- Sicheres Rendering ----------
  var ALLOWED_HOSTS = ["3dcay-version3.netlify.app", location.hostname];

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeUrl(url) {
    try {
      var u = new URL(url, location.origin);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      if (ALLOWED_HOSTS.indexOf(u.hostname) === -1) return null;
      return u.href;
    } catch (e) {
      return null;
    }
  }

  // Escaped Text → Markdown-Links [t](u), **fett**, Zeilenumbrüche, "- " Listen
  function renderMessage(text) {
    var html = escapeHtml(text);
    html = html.replace(/\[([^\]]{1,120})\]\(([^)\s]{1,300})\)/g, function (m, label, url) {
      var ok = safeUrl(url);
      return ok
        ? '<a href="' + ok + '" target="_blank" rel="noopener">' + label + "</a>"
        : label;
    });
    html = html.replace(/\*\*([^*]{1,200})\*\*/g, "<strong>$1</strong>");
    html = html.replace(/^- (.+)$/gm, "•&nbsp;$1");
    html = html.replace(/\n/g, "<br>");
    return html;
  }

  // ---------- Styles ----------
  var css =
    // Reset gegen das Seiten-Stylesheet: Website-Regeln für h3/p/button/a sind
    // spezifischer als Vererbung und würden sonst Farbe, Schriftgröße oder
    // Uppercase-Transform ins Widget durchschlagen (z. B. unsichtbarer Titel).
    ".dcaycb *{box-sizing:border-box;margin:0;padding:0;font-family:inherit;" +
    "text-transform:none;letter-spacing:normal;text-align:left}" +
    ".dcaycb{position:fixed;bottom:20px;right:20px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px}" +
    ".dcaycb-btn{width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;background:" + CFG.dark + ";color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;transition:transform .15s}" +
    ".dcaycb-btn:hover{transform:scale(1.06)}" +
    ".dcaycb-btn svg{width:26px;height:26px}" +
    ".dcaycb-panel{position:absolute;bottom:74px;right:0;width:372px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden}" +
    ".dcaycb.open .dcaycb-panel{display:flex}" +
    ".dcaycb-head{background:" + CFG.dark + ";color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}" +
    ".dcaycb-head .dot{width:9px;height:9px;border-radius:50%;background:#22c55e;flex:none}" +
    ".dcaycb-head h3{font-size:15px;font-weight:600;line-height:1.2;color:#fff;margin:0}" +
    ".dcaycb-head p{font-size:11.5px;opacity:.75;color:#fff;margin:0}" +
    ".dcaycb-head .x{margin-left:auto;background:none;border:none;color:#fff;cursor:pointer;font-size:20px;line-height:1;opacity:.8;padding:4px}" +
    ".dcaycb-body{flex:1;overflow-y:auto;padding:14px;background:#f4f6f9;display:flex;flex-direction:column;gap:10px}" +
    ".dcaycb-msg{max-width:85%;padding:9px 13px;border-radius:14px;line-height:1.45;word-wrap:break-word;white-space:normal}" +
    ".dcaycb-msg.bot{background:#fff;border:1px solid #e5e9f0;border-bottom-left-radius:4px;align-self:flex-start;color:#1a2233}" +
    ".dcaycb-msg.user{background:" + CFG.accent + ";color:#fff;border-bottom-right-radius:4px;align-self:flex-end}" +
    ".dcaycb-msg a{color:" + CFG.accent + ";font-weight:600;text-decoration:underline}" +
    ".dcaycb-quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 8px;background:#f4f6f9}" +
    ".dcaycb-quick button{border:1px solid " + CFG.accent + ";color:" + CFG.accent + ";background:#fff;border-radius:999px;padding:5px 11px;font-size:12px;cursor:pointer;transition:background .12s}" +
    ".dcaycb-quick button:hover{background:" + CFG.accent + ";color:#fff}" +
    ".dcaycb-input{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #e5e9f0;background:#fff}" +
    ".dcaycb-input textarea{flex:1;resize:none;border:1px solid #d6dce6;border-radius:10px;padding:9px 11px;font-size:14px;line-height:1.35;height:40px;max-height:96px;outline:none}" +
    ".dcaycb-input textarea:focus{border-color:" + CFG.accent + "}" +
    ".dcaycb-input button{border:none;background:" + CFG.accent + ";color:#fff;border-radius:10px;padding:0 14px;cursor:pointer;font-weight:600;font-size:13px}" +
    ".dcaycb-input button:disabled{opacity:.5;cursor:default}" +
    ".dcaycb-foot{font-size:10.5px;color:#8a93a6;text-align:center;padding:0 10px 8px;background:#fff}" +
    ".dcaycb-typing{display:inline-flex;gap:4px;padding:11px 14px}" +
    ".dcaycb-typing i{width:7px;height:7px;border-radius:50%;background:#9aa4b8;animation:dcaycbB 1.1s infinite}" +
    ".dcaycb-typing i:nth-child(2){animation-delay:.18s}.dcaycb-typing i:nth-child(3){animation-delay:.36s}" +
    "@keyframes dcaycbB{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}" +
    "@media (max-width:480px){.dcaycb-panel{width:calc(100vw - 24px);right:-8px;height:70vh}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- DOM ----------
  var root = document.createElement("div");
  root.className = "dcaycb";
  root.innerHTML =
    '<div class="dcaycb-panel" role="dialog" aria-label="' + T.title + '">' +
    '<div class="dcaycb-head"><span class="dot"></span><div><h3>' + T.title + "</h3><p>" + T.subtitle + "</p></div>" +
    '<button class="x" aria-label="' + T.close + '">&times;</button></div>' +
    '<div class="dcaycb-body"></div>' +
    '<div class="dcaycb-quick"></div>' +
    '<div class="dcaycb-input"><textarea rows="1" placeholder="' + T.placeholder + '" aria-label="' + T.placeholder + '"></textarea>' +
    "<button>" + T.send + "</button></div>" +
    '<div class="dcaycb-foot">' + T.disclaimer + "</div></div>" +
    '<button class="dcaycb-btn" aria-label="' + T.open + '">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
    "</button>";
  document.body.appendChild(root);

  var body = root.querySelector(".dcaycb-body");
  var quick = root.querySelector(".dcaycb-quick");
  var ta = root.querySelector("textarea");
  var sendBtn = root.querySelector(".dcaycb-input button");
  var toggleBtn = root.querySelector(".dcaycb-btn");
  var closeBtn = root.querySelector(".x");

  var history = []; // {role, content}
  var busy = false;

  function addMsg(role, text) {
    var el = document.createElement("div");
    el.className = "dcaycb-msg " + (role === "user" ? "user" : "bot");
    el.innerHTML = role === "user" ? escapeHtml(text).replace(/\n/g, "<br>") : renderMessage(text);
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "dcaycb-msg bot dcaycb-typing";
    el.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function renderQuick() {
    quick.innerHTML = "";
    T.quick.forEach(function (q) {
      var b = document.createElement("button");
      b.textContent = q[0];
      b.onclick = function () { send(q[1]); };
      quick.appendChild(b);
    });
  }

  function send(text) {
    text = (text || ta.value).trim();
    if (!text || busy) return;
    ta.value = "";
    quick.innerHTML = ""; // Quick-Replies nach erster Nutzung ausblenden
    addMsg("user", text);
    history.push({ role: "user", content: text });
    busy = true;
    sendBtn.disabled = true;
    var typing = showTyping();

    var timeout = new Promise(function (_, rej) { setTimeout(rej, 30000, new Error("timeout")); });
    var req = fetch(CFG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-20) }),
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); });

    Promise.race([req, timeout])
      .then(function (res) {
        typing.remove();
        var reply = res.j && res.j.reply ? res.j.reply : T.offline;
        addMsg("bot", reply);
        if (res.ok) history.push({ role: "assistant", content: reply });
      })
      .catch(function () {
        typing.remove();
        addMsg("bot", T.offline);
      })
      .finally(function () {
        busy = false;
        sendBtn.disabled = false;
        ta.focus();
      });
  }

  // ---------- Events ----------
  function toggle(open) {
    var willOpen = typeof open === "boolean" ? open : !root.classList.contains("open");
    root.classList.toggle("open", willOpen);
    if (willOpen && body.children.length === 0) {
      addMsg("bot", T.greeting);
      renderQuick();
    }
    if (willOpen) ta.focus();
  }
  toggleBtn.addEventListener("click", function () { toggle(); });
  closeBtn.addEventListener("click", function () { toggle(false); });
  sendBtn.addEventListener("click", function () { send(); });
  ta.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
})();
