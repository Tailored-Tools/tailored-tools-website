// Behind the screens: the page layer. Builds the stage inside #bts and draws screens.js into the phone(s).
// 900px and up: two phones in step, driven by the controller from engine-core.js on a 1.5 s timer.
// Below 900px: the one-screen story stage (spec section 14), driven by createStory from engine-core.js:
// one phone at a time with the other build peeking at the edge, swipe or buttons to flip, a caption card,
// one main button and a Pause button.
// Reduced motion: desktop shows each build's beats as numbered still frames; phones step by hand.
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
  var SWIPE = 50;   // px a sideways drag must travel to flip the phone
  var CARD_LINE = 20;   // px, the caption card's line height (bts.css)
  var PRIMARY = { step: 'Next step', flip: 'Now see it built properly', takes: 'What it takes', next: 'Next problem →' };
  var ICONS = '<svg viewBox="0 0 54 12" width="54" height="12" focusable="false"><g fill="currentColor">' +
    '<rect x="0" y="8" width="3" height="4" rx=".6"/><rect x="4.5" y="6" width="3" height="6" rx=".6"/><rect x="9" y="3.5" width="3" height="8.5" rx=".6"/><rect x="13.5" y="1" width="3" height="11" rx=".6"/>' +
    '<path d="M27 2.6a9 9 0 0 1 6.3 2.6l-1.1 1.1a7.4 7.4 0 0 0-10.4 0l-1.1-1.1A9 9 0 0 1 27 2.6zm0 3.2a5.8 5.8 0 0 1 4 1.7l-1.1 1.1a4.2 4.2 0 0 0-5.8 0L23 7.5a5.8 5.8 0 0 1 4-1.7zm0 3.2a2.6 2.6 0 0 1 1.8.7L27 11.5l-1.8-1.8A2.6 2.6 0 0 1 27 9z"/>' +
    '<rect x="37.5" y="1.5" width="14" height="9" rx="2.4" fill="none" stroke="currentColor"/><rect x="39" y="3" width="10" height="6" rx="1.3"/><rect x="52.3" y="4.5" width="1.4" height="3" rx=".6"/>' +
    '</g></svg>';
  var HOLD_ICON = '<svg class="bts-icon-pause" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><rect x="4" y="3" width="4" height="14" rx="1" fill="currentColor"/><rect x="12" y="3" width="4" height="14" rx="1" fill="currentColor"/></svg>' +
    '<svg class="bts-icon-play" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 3.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L7.5 2.6A1 1 0 0 0 6 3.5z" fill="currentColor"/></svg>';

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
      // Phones only: progress and the problem list
      '<div class="bts-top">' +
      '<p class="bts-progress"><span class="bts-progress-n"></span><span class="bts-progress-title"></span></p>' +
      '<button type="button" class="bts-btn bts-btn-small" data-action="sheet" aria-haspopup="dialog">Pick a problem</button>' +
      '</div>' +
      '<div class="bts-switch" role="group" aria-label="Which build to watch">' +
      '<button type="button" data-switch="demo" aria-pressed="true">' + LABEL.demo + '</button>' +
      '<button type="button" data-switch="proper" aria-pressed="false">' + LABEL.proper + '</button>' +
      '</div>' +
      '<div class="bts-track"><div class="bts-phones">' + phone('demo') + phone('proper') + '</div></div>' +
      // Phones only: the caption card and the story controls
      '<div class="bts-card">' +
      '<p class="bts-card-step"></p><p class="bts-card-caption"></p>' +
      '<div class="bts-card-takes" hidden><p class="bts-card-kicker">It takes:<span class="bts-card-size"></span></p>' +
      '<p class="bts-card-takes-line"></p></div>' +
      '</div>' +
      '<div class="bts-story-controls">' +
      '<button type="button" class="bts-btn bts-hold" data-action="hold">' + HOLD_ICON + '<span class="bts-sr">Pause</span></button>' +
      '<button type="button" class="bts-btn bts-primary" data-action="primary"></button>' +
      '</div>' +
      // Desktop only: controls under the two phones
      '<div class="bts-controls">' +
      '<button type="button" class="bts-btn" data-action="pause">Pause</button>' +
      '<button type="button" class="bts-btn" data-action="next">Next</button>' +
      '<button type="button" class="bts-btn" data-action="replay">Replay</button>' +
      '</div>' +
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
    document.documentElement.classList.add('bts-app');

    var mqDesktop = window.matchMedia(DESKTOP);
    var mqReduced = window.matchMedia(REDUCED);
    var ctl = E.createController(SCENARIOS);
    var story = E.createStory(ctl, SCENARIOS, { manual: mqReduced.matches });
    var desktop = mqDesktop.matches;
    var still = desktop && mqReduced.matches;   // desktop reduced motion: still frames
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
        frames: el.querySelector('.bts-frames'),
        drawn: ''
      };
    });
    var sw = q('.bts-switch');
    var track = q('.bts-track');
    var phonesEl = q('.bts-phones');
    var controls = q('.bts-controls');
    var pauseBtn = q('[data-action="pause"]');
    var nextBtn = q('[data-action="next"]');
    var replayBtn = q('[data-action="replay"]');
    var holdBtn = q('[data-action="hold"]');
    var primaryBtn = q('[data-action="primary"]');
    var takes = q('.bts-takes');
    var live = q('#bts-live');
    var nav = document.querySelector('nav');

    function framesHtml(beats) {
      return beats.map(function (beat, i) {
        return '<li class="bts-frame"><p class="bts-frame-n">Step ' + (i + 1) + ' of ' + beats.length + '</p>' +
          device(SCREENS[beat.screen](beat.state), ' is-still') +
          '<p class="bts-caption">' + esc(beat.caption) + '</p></li>';
      }).join('');
    }
    function draw(p, beat) {
      var key = beat.screen + '|' + JSON.stringify(beat.state);
      if (p.drawn !== key) { p.screen.innerHTML = SCREENS[beat.screen](beat.state); p.drawn = key; }
      p.caption.textContent = beat.caption;
      p.el.setAttribute('data-screen', beat.screen);
    }
    function showOutcome(p, out) {
      p.outcome.hidden = !out;
      p.outcome.setAttribute('data-outcome', out);
      p.outcome.textContent = out === 'survived' ? '✓ Survived' : out === 'broke' ? '✕ Broke' : '';
    }
    function fitLines(el, lines) {
      el.classList.remove('is-long');
      if (el.scrollHeight > lines * CARD_LINE + 1) el.classList.add('is-long');
      return el.scrollHeight <= lines * CARD_LINE + 1;
    }
    function announce(msg) {
      if (msg !== lastLive) { live.textContent = msg; lastLive = msg; }
    }
    function setSwitch(build, hidden) {
      sw.hidden = hidden;
      Array.prototype.forEach.call(sw.querySelectorAll('[data-switch]'), function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-switch') === build ? 'true' : 'false');
      });
    }

    // ── Desktop: two phones in step ──
    function renderDesktop(st) {
      var sc = ctl.scenario();
      root.setAttribute('data-mode', 'both');
      root.setAttribute('data-still', still ? 'true' : 'false');
      root.removeAttribute('data-build');
      setSwitch(st.build, true);

      BUILDS.forEach(function (b) {
        var p = phones[b];
        var beats = sc ? sc.beats[b] : null;
        p.el.hidden = false;
        p.el.removeAttribute('data-active');
        p.el.removeAttribute('aria-hidden');
        p.el.setAttribute('data-beat', String(st.beat));
        p.step.textContent = !sc ? '' : still ? st.total + ' steps' : 'Step ' + (st.beat + 1) + ' of ' + st.total;
        var showFrames = still && !!sc;
        p.live.hidden = showFrames;
        p.frames.hidden = !showFrames;
        if (showFrames) {
          if (lastFrames[b] !== sc.id) { p.frames.innerHTML = framesHtml(beats); lastFrames[b] = sc.id; }
          p.el.setAttribute('data-screen', beats[st.beat].screen);
        } else {
          draw(p, beats ? beats[st.beat] : { screen: 'book', state: REST, caption: PROMPT });
          p.device.classList.toggle('is-tappable', !!sc && !st.ended);
        }
        showOutcome(p, sc && st.ended ? sc.outcome[b] : '');
      });

      controls.hidden = still;
      pauseBtn.textContent = st.playing ? 'Pause' : 'Play';
      pauseBtn.disabled = !sc;
      nextBtn.disabled = !sc || st.ended;
      replayBtn.disabled = !sc;

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
        msg = sc.chip + '. Both builds, ' + st.total + ' steps shown as still pictures.';
      } else if (sc) {
        msg = 'Step ' + (st.beat + 1) + ' of ' + st.total + '. ' +
          LABEL.demo + ': ' + sc.beats.demo[st.beat].caption + ' ' + LABEL.proper + ': ' + sc.beats.proper[st.beat].caption;
      }
      announce(msg);
    }

    // ── Phones: the story stage ──
    function renderStory(s) {
      var sc = ctl.scenario();
      if (!sc) return;
      root.setAttribute('data-mode', 'single');
      root.setAttribute('data-still', 'false');
      root.setAttribute('data-build', s.build);
      setSwitch(s.build, false);

      BUILDS.forEach(function (b) {
        var p = phones[b];
        var active = b === s.build;
        var beat = active ? s.beat : 0;   // the peeking build waits on its first step
        p.el.hidden = false;
        p.el.setAttribute('data-active', active ? 'true' : 'false');
        if (active) p.el.removeAttribute('aria-hidden'); else p.el.setAttribute('aria-hidden', 'true');
        p.el.setAttribute('data-beat', String(beat));
        p.live.hidden = false;
        p.frames.hidden = true;
        p.step.textContent = 'Step ' + (beat + 1) + ' of ' + s.beats;
        draw(p, sc.beats[b][beat]);
        p.device.classList.toggle('is-tappable', active);
        showOutcome(p, active && s.ended ? sc.outcome[b] : '');
      });

      q('.bts-progress-n').textContent = 'Problem ' + s.number + ' of ' + s.total;
      q('.bts-progress-title').textContent = sc.chip;

      var caption = sc.beats[s.build][s.beat].caption;
      q('.bts-card-step').hidden = s.takes;
      q('.bts-card-caption').hidden = s.takes;
      q('.bts-card-takes').hidden = !s.takes;
      q('.bts-card-step').textContent = LABEL[s.build] + ' · Step ' + (s.beat + 1) + ' of ' + s.beats;
      q('.bts-card-caption').textContent = caption;
      q('.bts-card-takes-line').textContent = sc.takes.line;
      // The card keeps one height so the phone never resizes: text that needs more than three lines
      // gets a smaller size, and a caption that still needs four drops its step line for that beat.
      var cardEl = q('.bts-card');
      cardEl.classList.remove('is-full');
      if (!fitLines(q(s.takes ? '.bts-card-takes-line' : '.bts-card-caption'), 3) && !s.takes) cardEl.classList.add('is-full');
      q('.bts-card-size').textContent = sc.takes.size;

      primaryBtn.textContent = s.step === 'next' && s.nextNumber === 1 ? 'Back to problem 1 →' : PRIMARY[s.step];
      primaryBtn.classList.toggle('is-next', s.step === 'next');
      holdBtn.hidden = s.manual || s.step === 'next';
      holdBtn.classList.toggle('is-held', s.held);
      holdBtn.querySelector('.bts-sr').textContent = s.held ? 'Play' : 'Pause';

      announce(s.takes
        ? 'What it takes to build it properly: ' + sc.takes.line + ' Size: ' + sc.takes.size + '.'
        : (s.beat === 0 && s.build === 'demo' ? 'Problem ' + s.number + ' of ' + s.total + ': ' + sc.chip + '. ' : '') +
          LABEL[s.build] + ', step ' + (s.beat + 1) + ' of ' + s.beats + '. ' + caption);
    }

    function render() {
      if (desktop) renderDesktop(ctl.state()); else renderStory(story.state());
    }
    function schedule() {
      clearTimeout(timer);
      timer = null;
      if (desktop) {
        if (ctl.state().playing && !still) timer = setTimeout(function () { ctl.tick(); }, E.BEAT_MS);
      } else if (story.state().running) {
        timer = setTimeout(function () { story.tick(); }, E.BEAT_MS);
      }
    }
    function setHash(id) {
      if (id && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    }

    // Desktop actions (v1)
    function choose(id) {
      if (!ctl.select(id)) return false;
      if (still) ctl.finish();
      setHash(id);
      return true;
    }
    function bringIntoView() {
      if (root.getBoundingClientRect().top < 0) root.scrollIntoView({ block: 'start' });
    }
    // Phone actions
    function startStory(id) {
      if (story.start(id)) setHash(id);
    }

    function idFromHash() {
      return location.hash.replace(/^#/, '');
    }
    function measureNav() {
      if (nav) document.documentElement.style.setProperty('--bts-nav', Math.round(nav.getBoundingClientRect().height) + 'px');
    }
    function onMedia() {
      desktop = mqDesktop.matches;
      still = desktop && mqReduced.matches;
      story.setManual(mqReduced.matches);
      ctl.setMode(desktop ? 'both' : 'single');
      var st = ctl.state();
      if (desktop) {
        if (still && st.id && !st.ended) ctl.finish();
      } else if (!st.id) {
        story.start(SCENARIOS[0].id);
      }
      measureNav();
      render();
      schedule();
    }

    ctl.subscribe(function () { if (desktop) { render(); schedule(); } });
    story.subscribe(function () { if (!desktop) { render(); schedule(); } });

    // Swipe the phone sideways to flip builds (Pointer Events). touch-action: pan-y in bts.css leaves
    // up-and-down scrolling to the browser, so a vertical drag ends in pointercancel and never flips.
    var drag = null;
    var dragged = false;   // the last press moved: the click that follows is not a tap
    track.addEventListener('pointerdown', function (e) {
      dragged = false;
      if (desktop || (e.pointerType === 'mouse' && e.button !== 0)) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, axis: '' };
    });
    track.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      var dy = e.clientY - drag.y;
      if (!drag.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        dragged = true;
        if (drag.axis === 'x') {
          if (track.setPointerCapture) track.setPointerCapture(e.pointerId);
          phonesEl.classList.add('is-dragging');
        }
      }
      if (drag.axis !== 'x') return;
      drag.dx = dx;
      var build = story.state().build;
      var pastEnd = (build === 'demo' && dx > 0) || (build === 'proper' && dx < 0);
      phonesEl.style.setProperty('--drag', (pastEnd ? dx / 4 : dx) + 'px');
    });
    function endDrag(e, cancelled) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (d.axis !== 'x') return;
      phonesEl.classList.remove('is-dragging');
      phonesEl.style.removeProperty('--drag');
      if (cancelled) return;
      if (d.dx <= -SWIPE) story.flip('proper');
      else if (d.dx >= SWIPE) story.flip('demo');
    }
    track.addEventListener('pointerup', function (e) { endDrag(e, false); });
    track.addEventListener('pointercancel', function (e) { endDrag(e, true); });

    root.addEventListener('click', function (e) {
      var chip = e.target.closest('.bts-chip');
      if (chip) { if (choose(chip.getAttribute('data-id'))) bringIntoView(); return; }
      var swBtn = e.target.closest('[data-switch]');
      if (swBtn) { story.flip(swBtn.getAttribute('data-switch')); return; }
      var action = e.target.closest('[data-action]');
      if (action) {
        var a = action.getAttribute('data-action');
        if (a === 'pause') { if (ctl.state().playing) ctl.pause(); else ctl.play(); }
        else if (a === 'next') ctl.next();
        else if (a === 'replay') ctl.replay();
        else if (a === 'hold') story.toggle();
        else if (a === 'primary') {
          var was = story.state().id;
          story.act();
          if (story.state().id !== was) setHash(story.state().id);
        }
        return;
      }
      if (desktop) {
        if (!still && e.target.closest('.bts-live-view .bts-device')) ctl.next();
        return;
      }
      var ph = e.target.closest('.bts-track .bts-phone');
      if (!ph || dragged) return;
      if (ph.getAttribute('data-active') === 'true') { if (e.target.closest('.bts-device')) story.tap(); }
      else story.flip(ph.getAttribute('data-build'));   // tapping the peeking phone brings it in
    });

    window.addEventListener('hashchange', function () {
      var id = idFromHash();
      if (!ctl.has(id) || id === ctl.state().id) return;
      if (desktop) { if (choose(id)) root.scrollIntoView({ block: 'start' }); }
      else startStory(id);
    });
    window.addEventListener('resize', measureNav);
    onMediaChange(mqDesktop, onMedia);
    onMediaChange(mqReduced, onMedia);

    ctl.setMode(desktop ? 'both' : 'single');
    var first = idFromHash();
    if (ctl.has(first)) {
      if (desktop) { choose(first); root.scrollIntoView({ block: 'start' }); }
      else story.start(first);
    }
    onMedia();
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
