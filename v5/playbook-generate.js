/*
 * 3DCAY — KI-Marketing-Playbook: clientseitige PDF-Generierung.
 * Befüllt v5/playbook-template.html mit dem Live-Ergebnis, erzeugt das PDF
 * (Sofort-Download) und liefert Base64 zurück (für E-Mail-Versand via Backend).
 * Additiv – verändert keine bestehende Logik der Seite.
 */
(function () {
  'use strict';

  var TEMPLATE_URL = '/v5/playbook-template.html';

  function esc(s) { return String(s == null ? '' : s); }

  function monthYearDe() {
    var m = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    var d = new Date();
    return m[d.getMonth()] + ' ' + d.getFullYear();
  }

  // Ergebnis-Daten aus dem bereits gerenderten Result-DOM lesen (1:1 wie angezeigt)
  function collect(form) {
    var fd = form ? new FormData(form) : null;
    var get = function (n) { return fd ? (fd.get(n) || '') : ''; };

    var scoreTxt = (document.getElementById('resScore') || {}).textContent || '0';
    var score = parseInt((scoreTxt.match(/\d+/) || ['0'])[0], 10);

    var hoursTxt = (document.getElementById('resHours') || {}).textContent || '0';
    var hours = parseInt((hoursTxt.match(/\d+/) || ['0'])[0], 10);

    var outTxt = (document.getElementById('resOutput') || {}).textContent || '0';
    var output = parseInt((outTxt.match(/\d+/) || ['0'])[0], 10);

    var benchNote = (document.getElementById('resBenchNote') || {}).textContent || '';
    // Format: "Ø Industrie/B2B 36 · Sie 44"
    var industry = 'Ihrer Branche', avg = Math.max(0, score - 8);
    var mInd = benchNote.match(/Ø\s*(.+?)\s*(\d+)\s*·/);
    if (mInd) { industry = mInd[1].trim(); avg = parseInt(mInd[2], 10); }

    var phase = (document.getElementById('resBadge') || {}).innerHTML || 'Aufbau-Phase';
    var phaseDesc = (document.getElementById('resDesc') || {}).textContent || '';

    var first = esc(get('first_name')).trim();
    var last = esc(get('last_name')).trim();
    var name = (first + ' ' + last).trim() || 'Ihr Marketing-Team';
    var company = esc(get('company')).trim();

    return {
      score: score, hours: hours, output: output, avg: avg,
      industry: industry, phase: phase, phaseDesc: phaseDesc,
      name: name, company: company,
      email: esc(get('email')).trim(),
      industryKey: esc((document.getElementById('kpLeadIndustry') || {}).value),
      pain: esc((document.getElementById('kpLeadPain') || {}).value),
      goal: esc((document.getElementById('kpLeadGoal') || {}).value)
    };
  }

  function buildQuickWins() {
    var host = document.getElementById('resQuickwins');
    if (!host) return '';
    var out = '';
    var items = host.querySelectorAll('.kp-quickwin');
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var num = (el.querySelector('.kp-quickwin__num') || {}).textContent || (i + 1);
      var title = (el.querySelector('.kp-quickwin__title') || {}).innerHTML || '';
      var desc = (el.querySelector('.kp-quickwin__desc') || {}).innerHTML || '';
      var spans = el.querySelectorAll('.kp-quickwin__meta span');
      var timeTxt = '', impact = '', impl = '2–4 Wochen';
      if (spans[0]) { var st = spans[0].querySelector('strong'); timeTxt = st ? st.textContent : ''; }
      if (spans[1]) { var si = spans[1].querySelector('strong'); impact = si ? si.textContent : ''; }
      if (spans[2]) { var sp = spans[2].querySelector('strong'); impl = sp ? sp.innerHTML : impl; }
      out +=
        '<div class="qw"><div class="qw__n">' + num + '</div><div>' +
        '<div class="qw__t">' + title + '</div>' +
        '<div class="qw__d">' + desc + '</div>' +
        '<div class="qw__meta">' +
        '<span>Zeit / Woche: <b>' + timeTxt + '</b></span>' +
        '<span>Impact: <span class="chip">' + impact + '</span></span>' +
        '<span>Umsetzung: <b>' + impl + '</b></span>' +
        '</div></div></div>';
    }
    return out;
  }

  function buildPlan() {
    var host = document.getElementById('resPlan');
    if (!host) return '';
    var out = '';
    var items = host.querySelectorAll('.kp-plan__item');
    for (var i = 0; i < items.length; i++) {
      var w = (items[i].querySelector('.kp-plan__week') || {}).innerHTML || '';
      var t = (items[i].querySelector('.kp-plan__text') || {}).innerHTML || '';
      out += '<div class="plan__item"><div class="plan__w">' + w + '</div><div class="plan__t">' + t + '</div></div>';
    }
    return out;
  }

  function fillTemplate(tpl, d) {
    var diff = Math.abs(d.score - d.avg);
    var rel = d.score >= d.avg ? 'liegt ' + diff + ' Punkte über dem Branchenschnitt'
                               : 'liegt ' + diff + ' Punkte unter dem Branchenschnitt';
    var benchNote = '<b>Lesart:</b> ' + d.score + '/100 ' + rel + ' (' + d.avg +
      '). Der nächste Sprung kommt aus <b>Struktur</b> (Prompt-Library, fester Review) statt aus mehr Tools.';
    var companySuffix = d.company ? ' &middot; <b>' + d.company + '</b>' : '';

    var map = {
      '{{NAME}}': d.name,
      '{{COMPANY_SUFFIX}}': companySuffix,
      '{{INDUSTRY}}': d.industry,
      '{{SCORE}}': d.score,
      '{{PHASE}}': d.phase,
      '{{PHASE_DESC}}': d.phaseDesc,
      '{{BENCH_AVG}}': d.avg,
      '{{HOURS}}': d.hours,
      '{{OUTPUT}}': d.output,
      '{{BENCH_NOTE}}': benchNote,
      '{{DATE}}': monthYearDe(),
      '{{QUICKWINS}}': buildQuickWins(),
      '{{PLAN}}': buildPlan()
    };
    return tpl.replace(/\{\{[A-Z_]+\}\}/g, function (k) {
      return (k in map) ? map[k] : '';
    });
  }

  function blobToBase64(blob) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onloadend = function () { res(String(r.result).split(',')[1] || ''); };
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }

  // Hauptfunktion: erzeugt das PDF, startet Download, gibt {base64, data} zurück.
  // Wirft bei fehlender Engine/Fehler – Aufrufer entscheidet über Fallback.
  function generate(form) {
    var d = collect(form);
    return fetch(TEMPLATE_URL).then(function (r) {
      if (!r.ok) throw new Error('template ' + r.status);
      return r.text();
    }).then(function (tpl) {
      var html = fillTemplate(tpl, d);

      // Isolierter Render-Kontext (kein CSS-Leak in die Seite)
      var iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;opacity:0;pointer-events:none;';
      document.body.appendChild(iframe);
      var idoc = iframe.contentWindow.document;
      idoc.open(); idoc.write(html); idoc.close();

      return new Promise(function (resolve) {
        var go = function () {
          var fontsReady = (idoc.fonts && idoc.fonts.ready) ? idoc.fonts.ready : Promise.resolve();
          fontsReady.catch(function(){}).then(function () {
            setTimeout(function () { resolve({ iframe: iframe, idoc: idoc, data: d }); }, 250);
          });
        };
        if (idoc.readyState === 'complete') go();
        else iframe.onload = go;
      });
    }).then(function (ctx) {
      if (!window.html2pdf) { ctx.iframe.remove(); throw new Error('html2pdf fehlt'); }
      var opt = {
        margin: 0,
        filename: 'KI-Marketing-Playbook.pdf',
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      var worker = window.html2pdf().set(opt).from(ctx.idoc.body);
      return worker.toPdf().get('pdf').then(function (pdf) {
        var blob = pdf.output('blob');
        // Sofort-Download
        try {
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = opt.filename;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        } catch (e) {}
        return blobToBase64(blob).then(function (b64) {
          ctx.iframe.remove();
          return { base64: b64, data: ctx.data };
        });
      });
    });
  }

  window.kpGeneratePlaybook = generate;
})();
