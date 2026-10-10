// Behind the screens: the page layer. Builds the stage inside #bts, drives the controller from
// engine-core.js with a 1.5 s timer and draws screens.js into the phone(s).
// 900px and up: two phones in step. Below: one phone and a Quick build / Built properly switch.
// Reduced motion: no playback; each build's beats show as a numbered list of still frames.
// No network calls, no storage, no cookies.
(function () {
  'use strict';

  var E = window.BTS_ENGINE;
  var SCREENS = window.BTS_SCREENS;
  var SCENARIOS = window.BTS_SCENARIOS;
  var BUILDS = ['demo', 'proper'];
  var LABEL = { demo: 'Quick build', proper: 'Built properly' };
  var GROUPS = [['money', 'Money'], ['bookings', 'Bookings'], ['data', 'Data and security'], ['running', 'Running it']];
  var PROMPT = 'Pick something that goes wrong.';
  var REST = { practitioner: 'Ava', session: '60-minute session', day: 'Sat 24 Oct', slots: ['10:00', '12:00', '14:00', '16:00'], taken: ['10:00', '14:00'], selected: null };
  var DESKTOP = '(min-width: 900px)';
  var REDUCED = '(prefers-reduced-motion: reduce)';
  var ICONS = '<svg viewBox="0 0 54 12" width="54" height="12" focusable="false"><g fill="currentColor">' +
    '<rect x="0" y="8" width="3" height="4" rx=".6"/><rect x="4.5" y="6" width="3" height="6" rx=".6"/><rect x="9" y="3.5" width="3" height="8.5" rx=".6"/><rect x="13.5" y="1" width="3" height="11" rx=".6"/>' +
    '<path d="M27 2.6a9 9 0 0 1 6.3 2.6l-1.1 1.1a7.4 7.4 0 0 0-10.4 0l-1.1-1.1A9 9 0 0 1 27 2.6zm0 3.2a5.8 5.8 0 0 1 4 1.7l-1.1 1.1a4.2 4.2 0 0 0-5.8 0L23 7.5a5.8 5.8 0 0 1 4-1.7zm0 3.2a2.6 2.6 0 0 1 1.8.7L27 11.5l-1.8-1.8A2.6 2.6 0 0 1 27 9z"/>' +
    '<rect x="37.5" y="1.5" width="14" height="9" rx="2.4" fill="none" stroke="currentColor"/><rect x="39" y="3" width="10" height="6" rx="1.3"/><rect x="52.3" y="4.5" width="1.4" height="3" rx=".6"/>' +
    '</g></svg>';

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function onMediaChange(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn);
  }
  function device(screenHtml, extra) {
    return '<div class="bts-device' + (extra || '') + '"><div class="bts-glass">' +
      '<div class="bts-status" aria-hidden="true"><span>9:41</span><span class="bts-island"></span>' + ICONS + '</div>' +
      '<div class="bts-screen">' + screenHtml + '</div></div></div>';
  }
  function phone(build) {
    return '<figure class="bts-phone" data-build="' + build + '">' +
      '<figcaption class="bts-phone-label"><span class="bts-tag" data-build="' + build + '">' + LABEL[build] + '</span><span class="bts-step"></span></figcaption>' +
      '<div class="bts-live-view">' + device('') + '<p class="bts-caption"></p></div>' +
      '<p class="bts-outcome" hidden></p>' +
      '<ol class="bts-frames" hidden></ol>' +
      '</figure>';
  }
  function chips() {
    return GROUPS.map(function (g) {
      var items = SCENARIOS.filter(function (s) { return s.group === g[0]; }).map(function (s) {
        return '<li><button type="button" class="bts-chip" data-id="' + esc(s.id) + '" aria-pressed="false">' + esc(s.chip) + '</button></li>';
      }).join('');
      return '<div class="bts-group"><h3 id="bts-group-' + g[0] + '">' + g[1] + '</h3>' +
        '<ul class="bts-chip-list" aria-labelledby="bts-group-' + g[0] + '">' + items + '</ul></div>';
    }).join('');
  }
  function skeleton() {
    return '<p class="bts-madeup is-stage">Made-up business. Nothing here is real.</p>' +
      '<div class="bts-layout">' +
      '<div class="bts-main">' +
      '<div class="bts-switch" role="group" aria-label="Which build to watch">' +
      '<button type="button" data-switch="demo" aria-pressed="true">' + LABEL.demo + '</button>' +
      '<button type="button" data-switch="proper" aria-pressed="false">' + LABEL.proper + '</button>' +
      '</div>' +
      '<div class="bts-phones">' + phone('demo') + phone('proper') + '</div>' +
      '<div class="bts-controls">' +
      '<button type="button" class="bts-btn" data-action="pause">Pause</button>' +
      '<button type="button" class="bts-btn" data-action="next">Next</button>' +
      '<button type="button" class="bts-btn" data-action="replay">Replay</button>' +
      '</div>' +
      '<button type="button" class="bts-btn bts-btn-primary bts-other" data-action="other" hidden></button>' +
      '<div class="bts-takes" hidden><p class="bts-takes-label">What it takes to build it properly</p>' +
      '<p class="bts-takes-line"></p><p class="bts-takes-size">Size: <span class="bts-size"></span></p></div>' +
      '</div>' +
      '<div class="bts-side">' +
      '<div class="bts-tally"><p class="bts-tally-played"></p><p data-tally="demo"></p><p data-tally="proper"></p></div>' +
      '<h2 class="bts-side-title">Pick something that goes wrong</h2>' +
      chips() +
      '</div>' +
      '</div>' +
      '<p class="bts-sr" id="bts-live" aria-live="polite"></p>';
  }

  function mount(root) {
    root.innerHTML = skeleton();
    root.hidden = false;

    var ctl = E.createController(SCENARIOS);
    var mqDesktop = window.matchMedia(DESKTOP);
    var mqReduced = window.matchMedia(REDUCED);
    var still = mqReduced.matches;
    var timer = null;
    var lastLive = '';
    var lastFrames = { demo: '', proper: '' };

    var q = function (sel) { return root.querySelector(sel); };
    var phones = {};
    BUILDS.forEach(function (b) {
      var el = q('.bts-phone[data-build="' + b + '"]');
      phones[b] = {
        el: el,
        step: el.querySelector('.bts-step'),
        live: el.querySelector('.bts-live-view'),
        device: el.querySelector('.bts-live-view .bts-device'),
        screen: el.querySelector('.bts-live-view .bts-screen'),
        caption: el.querySelector('.bts-live-view .bts-caption'),
        outcome: el.querySelector('.bts-outcome'),
        frames: el.querySelector('.bts-frames')
      };
    });
    var sw = q('.bts-switch');
    var controls = q('.bts-controls');
    var pauseBtn = q('[data-action="pause"]');
    var nextBtn = q('[data-action="next"]');
    var replayBtn = q('[data-action="replay"]');
    var otherBtn = q('[data-action="other"]');
    var takes = q('.bts-takes');
    var live = q('#bts-live');

    function framesHtml(beats) {
      return beats.map(function (beat, i) {
        return '<li class="bts-frame"><p class="bts-frame-n">Step ' + (i + 1) + ' of ' + beats.length + '</p>' +
          device(SCREENS[beat.screen](beat.state), ' is-still') +
          '<p class="bts-caption">' + esc(beat.caption) + '</p></li>';
      }).join('');
    }

    function render(st) {
      var sc = ctl.scenario();
      var both = st.mode === 'both';
      root.setAttribute('data-mode', st.mode);
      root.setAttribute('data-still', still ? 'true' : 'false');
      sw.hidden = both;
      Array.prototype.forEach.call(sw.querySelectorAll('[data-switch]'), function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-switch') === st.build ? 'true' : 'false');
      });

      BUILDS.forEach(function (b) {
        var p = phones[b];
        var beats = sc ? sc.beats[b] : null;
        var beat = beats ? beats[st.beat] : { screen: 'book', state: REST, caption: PROMPT };
        p.el.hidden = !(both || st.build === b);
        p.el.setAttribute('data-beat', String(st.beat));
        p.el.setAttribute('data-screen', beat.screen);
        p.step.textContent = !sc ? '' : still ? st.total + ' steps' : 'Step ' + (st.beat + 1) + ' of ' + st.total;
        var showFrames = still && !!sc;
        p.live.hidden = showFrames;
        p.frames.hidden = !showFrames;
        if (showFrames) {
          var key = sc.id;
          if (lastFrames[b] !== key) { p.frames.innerHTML = framesHtml(beats); lastFrames[b] = key; }
        } else {
          p.screen.innerHTML = SCREENS[beat.screen](beat.state);
          p.caption.textContent = beat.caption;
          p.device.classList.toggle('is-tappable', !!sc && !st.ended);
        }
        var out = sc && st.ended ? sc.outcome[b] : '';
        p.outcome.hidden = !out;
        p.outcome.setAttribute('data-outcome', out);
        p.outcome.textContent = out === 'survived' ? '✓ Survived' : out === 'broke' ? '✕ Broke' : '';
      });

      controls.hidden = still;
      pauseBtn.textContent = st.playing ? 'Pause' : 'Play';
      pauseBtn.disabled = !sc;
      nextBtn.disabled = !sc || st.ended;
      replayBtn.disabled = !sc;

      otherBtn.hidden = !(sc && st.ended && !both);
      otherBtn.textContent = st.build === 'demo' ? 'Now see it built properly' : 'Now see it as a quick build';

      takes.hidden = !(sc && st.ended);
      if (sc) {
        q('.bts-takes-line').textContent = sc.takes.line;
        q('.bts-size').textContent = sc.takes.size;
        takes.setAttribute('data-size', sc.takes.size);
      }

      var t = ctl.tally();
      q('.bts-tally-played').textContent = 'Played so far: ' + t.played + ' of ' + t.total;
      q('[data-tally="demo"]').textContent = LABEL.demo + ': ' + t.demo.survived + ' of ' + t.total + ' survived';
      q('[data-tally="proper"]').textContent = LABEL.proper + ': ' + t.proper.survived + ' of ' + t.total + ' survived';

      Array.prototype.forEach.call(root.querySelectorAll('.bts-chip'), function (chip) {
        chip.setAttribute('aria-pressed', chip.getAttribute('data-id') === st.id ? 'true' : 'false');
      });

      var msg = '';
      if (sc && still) {
        msg = sc.chip + '. ' + (both ? 'Both builds' : LABEL[st.build]) + ', ' + st.total + ' steps shown as still pictures.';
      } else if (sc) {
        msg = 'Step ' + (st.beat + 1) + ' of ' + st.total + '. ' + (both
          ? LABEL.demo + ': ' + sc.beats.demo[st.beat].caption + ' ' + LABEL.proper + ': ' + sc.beats.proper[st.beat].caption
          : LABEL[st.build] + ': ' + sc.beats[st.build][st.beat].caption);
      }
      if (msg !== lastLive) { live.textContent = msg; lastLive = msg; }
    }

    function schedule(st) {
      clearTimeout(timer);
      timer = null;
      if (st.playing && !still) timer = setTimeout(function () { ctl.tick(); }, E.BEAT_MS);
    }

    function choose(id) {
      if (!ctl.select(id)) return false;
      if (still) ctl.finish();
      if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
      return true;
    }
    function switchTo(build) {
      if (build === ctl.state().build) return;
      ctl.setBuild(build);
      if (still) ctl.finish();
    }
    function bringIntoView() {
      if (root.getBoundingClientRect().top < 0 || ctl.state().mode === 'single') root.scrollIntoView({ block: 'start' });
    }
    function idFromHash() {
      return location.hash.replace(/^#/, '');
    }
    function onMedia() {
      still = mqReduced.matches;
      ctl.setMode(mqDesktop.matches ? 'both' : 'single');
      var st = ctl.state();
      if (still && st.id && !st.ended) ctl.finish();
      render(ctl.state());
      schedule(ctl.state());
    }

    ctl.subscribe(function (st) { render(st); schedule(st); });

    root.addEventListener('click', function (e) {
      var chip = e.target.closest('.bts-chip');
      if (chip) { if (choose(chip.getAttribute('data-id'))) bringIntoView(); return; }
      var swBtn = e.target.closest('[data-switch]');
      if (swBtn) { switchTo(swBtn.getAttribute('data-switch')); return; }
      var action = e.target.closest('[data-action]');
      if (action) {
        var a = action.getAttribute('data-action');
        if (a === 'pause') { if (ctl.state().playing) ctl.pause(); else ctl.play(); }
        else if (a === 'next') ctl.next();
        else if (a === 'replay') ctl.replay();
        else if (a === 'other') { switchTo(ctl.state().build === 'demo' ? 'proper' : 'demo'); bringIntoView(); }
        return;
      }
      if (!still && e.target.closest('.bts-live-view .bts-device')) ctl.next();
    });

    window.addEventListener('hashchange', function () {
      var id = idFromHash();
      if (ctl.has(id) && id !== ctl.state().id && choose(id)) root.scrollIntoView({ block: 'start' });
    });
    onMediaChange(mqDesktop, onMedia);
    onMediaChange(mqReduced, onMedia);

    onMedia();
    var first = idFromHash();
    if (ctl.has(first)) {
      choose(first);
      root.scrollIntoView({ block: 'start' });
    }
    return ctl;
  }

  // "Copy the list" for the questions section (static HTML; the button only shows when JS runs).
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok;
      try { ok = document.execCommand('copy'); } finally { document.body.removeChild(area); }
      if (ok) resolve(); else reject(new Error('The browser refused to copy.'));
    });
  }
  function wireCopy() {
    var btn = document.getElementById('bts-copy');
    var listEl = document.getElementById('bts-questions-list');
    var status = document.getElementById('bts-copy-status');
    if (!btn || !listEl || !status) return;
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var items = Array.prototype.map.call(listEl.querySelectorAll('li'), function (li, i) {
        return (i + 1) + '. ' + li.textContent.replace(/\s+/g, ' ').trim();
      });
      var text = 'Questions to ask anyone quoting for a booking system\n\n' + items.join('\n') + '\n\nFrom tailored-tools.com/behind-the-screens/';
      copyText(text).then(function () {
        btn.textContent = 'Copied';
        status.textContent = 'Copied. Paste it into a message or a note.';
        setTimeout(function () { btn.textContent = 'Copy the list'; }, 3000);
      }, function () {
        status.textContent = 'Copying didn\'t work in this browser. Press and hold the list to copy it instead.';
      });
    });
  }

  E.mount = mount;
  var stage = document.getElementById('bts');
  if (stage && SCREENS && SCENARIOS) mount(stage);
  wireCopy();
})();
