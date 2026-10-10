// Behind the screens: the playback controller. Pure logic: no DOM, no timers, no storage.
// engine-dom.js calls tick() every BEAT_MS while playing; the tests call it by hand.
// Modes: 'single' (phones under 900px: one build at a time) and 'both' (two phones in step).
// createStory (below) adds story mode on top of a 'single' controller for the phone-sized stage.
(function (root) {
  'use strict';

  var BUILDS = ['demo', 'proper'];

  function createController(scenarios, options) {
    var list = Array.isArray(scenarios) ? scenarios : [];
    var byId = {};
    list.forEach(function (s) { byId[s.id] = s; });

    var s = {
      id: null,
      build: 'demo',
      mode: options && options.mode === 'both' ? 'both' : 'single',
      beat: 0,
      playing: false,
      ended: false
    };
    var played = { demo: {}, proper: {} };   // distinct scenario ids played to the end, per build
    var listeners = [];

    function has(id) { return typeof id === 'string' && Object.prototype.hasOwnProperty.call(byId, id); }
    function current() { return s.id ? byId[s.id] : null; }
    function total() { var sc = current(); return sc ? sc.beats.demo.length : 0; }
    function snapshot() {
      return { id: s.id, build: s.build, mode: s.mode, beat: s.beat, total: total(), playing: s.playing, ended: s.ended };
    }
    function emit() {
      var snap = snapshot();
      listeners.slice().forEach(function (fn) { fn(snap); });
    }
    function start() { s.beat = 0; s.ended = false; s.playing = true; }
    function reachEnd() {
      s.beat = total() - 1;
      s.playing = false;
      s.ended = true;
      (s.mode === 'both' ? BUILDS : [s.build]).forEach(function (b) { played[b][s.id] = true; });
    }
    // Moves on one beat. Returns false when there is nothing to move.
    function step() {
      if (!s.id || s.ended) return false;
      s.beat += 1;
      if (s.beat >= total() - 1) reachEnd();
      return true;
    }
    function count(build) {
      var ids = Object.keys(played[build]);
      return {
        played: ids.length,
        survived: ids.filter(function (id) { return byId[id].outcome[build] === 'survived'; }).length
      };
    }

    return {
      state: snapshot,
      scenario: current,
      has: has,
      select: function (id) {
        if (!has(id)) return false;
        s.id = id;
        start();
        emit();
        return true;
      },
      play: function () {
        if (!s.id || s.playing) return;
        if (s.ended) start(); else s.playing = true;
        emit();
      },
      pause: function () {
        if (!s.playing) return;
        s.playing = false;
        emit();
      },
      next: function () { if (step()) emit(); },
      tick: function () { if (s.playing && step()) emit(); },
      replay: function () {
        if (!s.id) return;
        start();
        emit();
      },
      finish: function () {
        if (!s.id) return;
        reachEnd();
        emit();
      },
      setBuild: function (build) {
        if (BUILDS.indexOf(build) === -1) return;
        s.build = build;
        if (s.id) start();
        emit();
      },
      setMode: function (mode) {
        var m = mode === 'both' ? 'both' : 'single';
        if (m === s.mode) return;
        s.mode = m;
        emit();
      },
      isPlayed: function (id) { return has(id) && !!(played.demo[id] || played.proper[id]); },
      tally: function () {
        var any = {};
        BUILDS.forEach(function (b) { Object.keys(played[b]).forEach(function (id) { any[id] = true; }); });
        return { total: list.length, played: Object.keys(any).length, demo: count('demo'), proper: count('proper') };
      },
      subscribe: function (fn) {
        listeners.push(fn);
        return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
      }
    };
  }

  // Story mode, for the phone-sized stage (spec section 14). It drives a 'single' controller one
  // problem at a time: the quick build plays, it flips by itself to built properly, then shows
  // what it takes, then waits on "Next problem". Each tick() is one beat; engine-dom.js calls it
  // every BEAT_MS while state().running. The main button (act) always does the next of these:
  // 'step' (next beat), 'flip' (to built properly), 'takes' (what it takes), 'next' (next problem).
  // Manual mode (reduced motion) never moves by itself. The sheet and the offer hold playback.
  var TABS = [['money', 'Money'], ['bookings', 'Bookings'], ['data', 'Your data'], ['running', 'Running it']];
  var OFFER_AFTER = 3;

  function createStory(ctl, scenarios, options) {
    var ids = (Array.isArray(scenarios) ? scenarios : []).map(function (sc) { return sc.id; });
    var tabs = TABS.map(function (t) { return t[0]; });
    var st = {
      manual: !!(options && options.manual),
      held: false,       // paused by the visitor
      flipped: false,    // this problem has been on built properly (or flipped by hand): no automatic flip
      takes: false,      // this problem has shown what it takes
      sheet: false,
      tab: tabs[0],
      offer: false,
      offerShown: false
    };
    var listeners = [];

    function index() { var id = ctl.state().id; return id ? ids.indexOf(id) : -1; }
    function step() {
      var c = ctl.state();
      if (!c.id) return 'none';
      if (!c.ended) return 'step';
      if (c.build === 'demo' && !st.flipped) return 'flip';
      if (!st.takes) return 'takes';
      return 'next';
    }
    function running() {
      var p = step();
      return !st.manual && !st.held && !st.sheet && !st.offer && (p === 'step' || p === 'flip' || p === 'takes');
    }
    function snapshot() {
      var c = ctl.state();
      var i = index();
      return {
        id: c.id, number: i + 1, total: ids.length, nextNumber: ids.length ? ((i + 1) % ids.length) + 1 : 0,
        build: c.build, beat: c.beat, beats: c.total, ended: c.ended,
        step: step(), running: running(), held: st.held, manual: st.manual, takes: step() === 'next',
        sheet: st.sheet, tab: st.tab, offer: st.offer, offerShown: st.offerShown, played: ctl.tally().played
      };
    }
    function emit() {
      if (!st.offerShown && !st.sheet && step() === 'next' && ctl.tally().played >= OFFER_AFTER) {
        st.offer = true;
        st.offerShown = true;
      }
      var snap = snapshot();
      listeners.slice().forEach(function (fn) { fn(snap); });
    }
    function start(id) {
      if (!ctl.has(id)) return false;
      st.flipped = false;
      st.takes = false;
      st.held = false;
      st.sheet = false;
      ctl.select(id);
      if (ctl.state().build !== 'demo') ctl.setBuild('demo');
      emit();
      return true;
    }
    function advance() {
      var p = step();
      if (p === 'step') ctl.next();
      else if (p === 'flip') { st.flipped = true; st.held = false; ctl.setBuild('proper'); }
      else if (p === 'takes') st.takes = true;
      else if (p === 'next') { start(ids[(index() + 1) % ids.length]); return; }
      else return;
      emit();
    }
    function toggle() {
      var p = step();
      if (st.manual || p === 'next' || p === 'none') return;
      st.held = !st.held;
      emit();
    }
    function setTab(tab) {
      if (tabs.indexOf(tab) === -1 || tab === st.tab) return;
      st.tab = tab;
      emit();
    }

    return {
      state: snapshot,
      start: start,
      tick: function () { if (running()) advance(); },
      act: advance,
      flip: function (build) {
        var c = ctl.state();
        if (!c.id || BUILDS.indexOf(build) === -1 || build === c.build) return;
        st.flipped = true;
        st.held = false;
        ctl.setBuild(build);
        emit();
      },
      toggle: toggle,
      tap: function () {
        if (!st.manual) { toggle(); return; }
        if (step() === 'step') advance();
      },
      openSheet: function () {
        var sc = ctl.scenario();
        st.sheet = true;
        st.offer = false;
        st.tab = sc && tabs.indexOf(sc.group) !== -1 ? sc.group : tabs[0];
        emit();
      },
      closeSheet: function () {
        if (!st.sheet) return;
        st.sheet = false;
        emit();
      },
      setTab: setTab,
      shiftTab: function (by) {
        var i = Math.max(0, Math.min(tabs.length - 1, tabs.indexOf(st.tab) + by));
        setTab(tabs[i]);
      },
      pick: function (id) { return ctl.has(id) ? start(id) : false; },
      openOffer: function () {
        st.offer = true;
        st.offerShown = true;
        st.sheet = false;
        emit();
      },
      closeOffer: function () {
        if (!st.offer) return;
        st.offer = false;
        emit();
      },
      setManual: function (manual) {
        st.manual = !!manual;
        if (st.manual) st.held = false;
        emit();
      },
      subscribe: function (fn) {
        listeners.push(fn);
        return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
      }
    };
  }

  root.BTS_ENGINE = root.BTS_ENGINE || {};
  root.BTS_ENGINE.BEAT_MS = 1500;
  root.BTS_ENGINE.BUILDS = BUILDS;
  root.BTS_ENGINE.createController = createController;
  root.BTS_ENGINE.createStory = createStory;
  root.BTS_ENGINE.TABS = TABS;
  root.BTS_ENGINE.OFFER_AFTER = OFFER_AFTER;
})(typeof window !== 'undefined' ? window : globalThis);
