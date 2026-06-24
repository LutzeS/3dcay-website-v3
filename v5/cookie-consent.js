/* =====================================================================
   3DCAY Cookie-Consent (DSGVO/TTDSG) – Opt-in, granular, widerrufbar.
   - Notwendig (immer aktiv), Präferenzen, Statistik, Marketing
   - "Ablehnen" gleichwertig zu "Akzeptieren"
   - Google Consent Mode v2 (default = denied) + Update nach Einwilligung
   - Gating: <script type="text/plain" data-consent="statistics" data-src="..."> wird erst nach Opt-in aktiviert
   - Consent-Log an /.netlify/functions/consent-log (Nachweispflicht)
   - Wieder öffnen: window.openCookieSettings()
   ===================================================================== */
(function () {
  'use strict';
  var KEY = '3dcay_consent';
  var VERSION = '1';
  var CATS = [
    { id: 'necessary',   name: 'Notwendig',   locked: true,  desc: 'Für den Betrieb der Website technisch erforderlich (z. B. Sicherheit, Spracheinstellung, dieser Cookie-Hinweis). Immer aktiv.' },
    { id: 'preferences', name: 'Präferenzen', locked: false, desc: 'Speichert Einstellungen wie Sprache oder Region, um Komfortfunktionen zu ermöglichen.' },
    { id: 'statistics',  name: 'Statistik',   locked: false, desc: 'Anonyme Reichweitenmessung, um die Website zu verbessern (z. B. Seitenaufrufe).' },
    { id: 'marketing',   name: 'Marketing',   locked: false, desc: 'Wird genutzt, um Inhalte/Werbung relevanter zu machen und Erfolg zu messen.' }
  ];

  /* ---------- Google Consent Mode v2 (Default: alles verweigert) ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  try {
    gtag('consent', 'default', {
      ad_storage: 'denied', analytics_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
      functionality_storage: 'denied', personalization_storage: 'denied',
      security_storage: 'granted', wait_for_update: 500
    });
  } catch (e) {}

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return (v && v.version === VERSION) ? v : null; }
    catch (e) { return null; }
  }
  function write(consent) {
    consent.version = VERSION; consent.ts = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) {}
  }

  function apply(consent) {
    // Consent Mode update
    try {
      gtag('consent', 'update', {
        analytics_storage: consent.statistics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied',
        functionality_storage: consent.preferences ? 'granted' : 'denied',
        personalization_storage: consent.preferences ? 'granted' : 'denied'
      });
    } catch (e) {}
    // Gated scripts aktivieren
    var nodes = document.querySelectorAll('script[type="text/plain"][data-consent]');
    nodes.forEach(function (old) {
      var cat = old.getAttribute('data-consent');
      if (!consent[cat]) return;
      if (old.dataset.activated) return;
      var s = document.createElement('script');
      for (var i = 0; i < old.attributes.length; i++) {
        var a = old.attributes[i];
        if (a.name === 'type' || a.name === 'data-consent' || a.name === 'data-src') continue;
        s.setAttribute(a.name, a.value);
      }
      if (old.getAttribute('data-src')) s.src = old.getAttribute('data-src');
      else s.text = old.textContent;
      old.dataset.activated = '1';
      old.parentNode.insertBefore(s, old.nextSibling);
    });
    document.dispatchEvent(new CustomEvent('cookieconsent:applied', { detail: consent }));
  }

  function logConsent(consent, action) {
    try {
      fetch('/.netlify/functions/consent-log', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: action, choices: consent, version: VERSION, url: location.pathname, ua: navigator.userAgent })
      }).catch(function () {});
    } catch (e) {}
  }

  function decide(consent, action) { write(consent); apply(consent); logConsent(consent, action); hide(); }

  /* ---------- UI ---------- */
  function injectStyles() {
    if (document.getElementById('cc-style')) return;
    var css = ''
    + '.cc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99998;display:none}'
    + '.cc-box{position:fixed;z-index:99999;left:50%;bottom:24px;transform:translateX(-50%);width:min(680px,calc(100% - 32px));background:#fff;border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.35);font-family:Inter,system-ui,Arial,sans-serif;color:#0A0A0A;overflow:hidden}'
    + '.cc-box.cc-center{top:50%;bottom:auto;transform:translate(-50%,-50%)}'
    + '.cc-pad{padding:26px 28px}'
    + '.cc-h{font-size:19px;font-weight:800;margin:0 0 8px}'
    + '.cc-t{font-size:13.5px;line-height:1.6;color:#404040;margin:0 0 16px}'
    + '.cc-t a{color:#e3101a}'
    + '.cc-btns{display:flex;gap:10px;flex-wrap:wrap}'
    + '.cc-btn{flex:1;min-width:120px;border:none;border-radius:100px;padding:12px 18px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit}'
    + '.cc-btn--accept{background:#e3101a;color:#fff}'
    + '.cc-btn--reject{background:#f0f0f0;color:#0A0A0A}'
    + '.cc-btn--settings{background:#fff;color:#0A0A0A;border:1px solid #E5E5E5}'
    + '.cc-btn--save{background:#0A0A0A;color:#fff}'
    + '.cc-link{background:none;border:none;color:#737373;font-size:13px;cursor:pointer;text-decoration:underline;padding:0;font-family:inherit;margin-top:14px}'
    + '.cc-cats{margin:6px 0 18px;border-top:1px solid #F0F0F0}'
    + '.cc-cat{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #F0F0F0;align-items:flex-start}'
    + '.cc-cat__txt{flex:1}.cc-cat__name{font-weight:700;font-size:14px}.cc-cat__desc{font-size:12.5px;color:#737373;line-height:1.5;margin-top:3px}'
    + '.cc-sw{position:relative;width:42px;height:24px;flex-shrink:0;margin-top:2px}'
    + '.cc-sw input{opacity:0;width:0;height:0}'
    + '.cc-sl{position:absolute;inset:0;background:#ccc;border-radius:100px;transition:.2s;cursor:pointer}'
    + '.cc-sl:before{content:"";position:absolute;height:18px;width:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}'
    + '.cc-sw input:checked + .cc-sl{background:#e3101a}.cc-sw input:checked + .cc-sl:before{transform:translateX(18px)}'
    + '.cc-sw input:disabled + .cc-sl{background:#e3101a;opacity:.5;cursor:not-allowed}'
    + '.cc-foot{font-size:12px;color:#9a9a9a;margin-top:14px}.cc-foot a{color:#9a9a9a}'
    + '@media(max-width:520px){.cc-btn{flex:1 1 100%}}';
    var st = document.createElement('style'); st.id = 'cc-style'; st.textContent = css; document.head.appendChild(st);
  }

  var overlay, box, showingSettings = false;
  function build() {
    injectStyles();
    overlay = document.createElement('div'); overlay.className = 'cc-overlay';
    box = document.createElement('div'); box.className = 'cc-box';
    document.body.appendChild(overlay); document.body.appendChild(box);
    renderMain();
  }
  function policyLinks() {
    return '<a href="/cookie-richtlinie.html">Cookie-Richtlinie</a> · <a href="/datenschutz.html">Datenschutz</a> · <a href="/impressum.html">Impressum</a>';
  }
  function renderMain() {
    showingSettings = false; box.classList.remove('cc-center');
    box.innerHTML = '<div class="cc-pad">'
      + '<p class="cc-h">Datenschutz-Einstellungen</p>'
      + '<p class="cc-t">Wir verwenden Cookies und ähnliche Technologien. Notwendige sind für den Betrieb der Website erforderlich. Optionale (Präferenzen, Statistik, Marketing) nutzen wir nur mit Ihrer Einwilligung. Sie können frei entscheiden und Ihre Wahl jederzeit ändern. Mehr in der ' + policyLinks() + '.</p>'
      + '<div class="cc-btns">'
      + '<button class="cc-btn cc-btn--accept" id="cc-accept">Akzeptieren</button>'
      + '<button class="cc-btn cc-btn--reject" id="cc-reject">Ablehnen</button>'
      + '<button class="cc-btn cc-btn--settings" id="cc-settings">Einstellungen</button>'
      + '</div></div>';
    box.querySelector('#cc-accept').onclick = function () { acceptAll(); };
    box.querySelector('#cc-reject').onclick = function () { rejectAll(); };
    box.querySelector('#cc-settings').onclick = function () { renderSettings(read() || {}); };
  }
  function renderSettings(cur) {
    showingSettings = true; box.classList.add('cc-center');
    var rows = CATS.map(function (c) {
      var on = c.locked ? true : !!cur[c.id];
      return '<div class="cc-cat"><div class="cc-cat__txt"><div class="cc-cat__name">' + c.name + '</div><div class="cc-cat__desc">' + c.desc + '</div></div>'
        + '<label class="cc-sw"><input type="checkbox" data-cat="' + c.id + '" ' + (on ? 'checked' : '') + ' ' + (c.locked ? 'disabled' : '') + '><span class="cc-sl"></span></label></div>';
    }).join('');
    box.innerHTML = '<div class="cc-pad">'
      + '<p class="cc-h">Einstellungen verwalten</p>'
      + '<div class="cc-cats">' + rows + '</div>'
      + '<div class="cc-btns">'
      + '<button class="cc-btn cc-btn--accept" id="cc-accept2">Alle akzeptieren</button>'
      + '<button class="cc-btn cc-btn--save" id="cc-save">Auswahl speichern</button>'
      + '</div>'
      + '<div class="cc-foot" style="margin-top:16px">' + policyLinks() + '</div>'
      + '</div>';
    box.querySelector('#cc-accept2').onclick = function () { acceptAll(); };
    box.querySelector('#cc-save').onclick = function () {
      var consent = { necessary: true };
      box.querySelectorAll('input[data-cat]').forEach(function (i) { consent[i.getAttribute('data-cat')] = i.checked; });
      consent.necessary = true;
      decide(consent, 'save');
    };
  }
  function acceptAll() { decide({ necessary: true, preferences: true, statistics: true, marketing: true }, 'accept_all'); }
  function rejectAll() { decide({ necessary: true, preferences: false, statistics: false, marketing: false }, 'reject_all'); }

  function show() { if (!box) build(); else { renderMain(); } overlay.style.display = 'block'; }
  function hide() { if (overlay) overlay.style.display = 'none'; if (box) box.remove(); box = null; if (overlay) { overlay.remove(); overlay = null; } }

  // Re-Open (Footer-Link / programmatisch)
  window.openCookieSettings = function () { if (!box) build(); renderSettings(read() || {}); overlay.style.display = 'block'; };

  // Footer-Link automatisch ergänzen (neben Datenschutz/Impressum)
  function injectFooterLink() {
    try {
      var links = document.querySelectorAll('footer a, .footer-bottom a, a[href*="datenschutz"]');
      for (var i = 0; i < links.length; i++) {
        if (/datenschutz/i.test(links[i].getAttribute('href') || '')) {
          var a = document.createElement('a');
          a.href = '#'; a.textContent = 'Cookie-Einstellungen';
          a.style.cssText = links[i].style.cssText;
          a.className = links[i].className;
          a.onclick = function (e) { e.preventDefault(); window.openCookieSettings(); };
          links[i].parentNode.insertBefore(a, links[i]);
          links[i].parentNode.insertBefore(document.createTextNode(' '), links[i]);
          break;
        }
      }
    } catch (e) {}
  }

  function init() {
    var saved = read();
    if (saved) { apply(saved); } else { show(); }
    injectFooterLink();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* =====================================================================
   3DCAY Analytics & Conversion-Tracking (einwilligungsbasiert)
   - Lädt GA4 ERST nach Statistik-Einwilligung (Consent Mode v2 ist oben gesetzt).
   - window.trackConversion(name, params) feuert GA4-Events (puffert sonst harmlos im dataLayer).
   - Bindet automatisch Conversion-Events an bekannte Formulare.
   ---------------------------------------------------------------------
   >>> EINRICHTUNG: Tragen Sie hier Ihre GA4-Mess-ID ein (Format G-XXXXXXXXXX).
       Solange leer, werden KEINE externen Skripte geladen (voll DSGVO-konform/inert).
   ===================================================================== */
(function () {
  'use strict';
  var GA_ID = ''; // <-- z. B. 'G-XXXXXXXXXX' eintragen, um Analytics zu aktivieren
  var KEY = '3dcay_consent';
  var loaded = false;

  function statisticsAllowed() {
    try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); return !!(c && c.statistics); }
    catch (e) { return false; }
  }

  function loadGA() {
    if (loaded || !GA_ID) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  // Öffentlich: Conversion-Event auslösen (funktioniert auch, wenn GA noch nicht geladen ist)
  window.trackConversion = function (name, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      (window.gtag || function () { window.dataLayer.push(arguments); })('event', name || 'conversion', params || {});
    } catch (e) {}
  };

  // GA laden, sobald Statistik-Einwilligung vorliegt (jetzt oder per Banner-Event)
  if (statisticsAllowed()) loadGA();
  document.addEventListener('cookieconsent:applied', function (e) {
    if (e && e.detail && e.detail.statistics) loadGA();
  });

  // Automatisches Conversion-Tracking für bekannte Formulare
  var FORM_EVENTS = {
    'fit-check': 'lead_fitcheck',
    'whitepaper': 'lead_whitepaper',
    'whitepaper-download': 'lead_whitepaper',
    'ki-playbook': 'lead_playbook',
    'ki-playbook-lead': 'lead_playbook',
    'demo': 'lead_demo',
    'kontakt': 'lead_contact',
    'contact': 'lead_contact',
    'newsletter': 'newsletter_signup'
  };
  document.addEventListener('submit', function (ev) {
    var f = ev.target;
    if (!f || f.tagName !== 'FORM') return;
    var key = (f.getAttribute('name') || f.id || '').toLowerCase();
    var evt = FORM_EVENTS[key];
    if (!evt) {
      if (f.id === 'kpLeadForm') evt = 'lead_playbook';
      else if (/newsletter|subscribe/.test(key)) evt = 'newsletter_signup';
    }
    window.trackConversion(evt || 'form_submit', { form: key || f.id || 'unknown', page: location.pathname });
  }, true);
})();
