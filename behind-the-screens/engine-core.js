// Behind the screens: the playback controller. Pure logic: no DOM, no timers, no storage.
// engine-dom.js calls tick() every BEAT_MS while playing; the tests call it by hand.
// Modes: 'single' (phones under 900px: one build at a time) and 'both' (two phones in step).
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

  root.BTS_ENGINE = root.BTS_ENGINE || {};
  root.BTS_ENGINE.BEAT_MS = 1500;
  root.BTS_ENGINE.BUILDS = BUILDS;
  root.BTS_ENGINE.createController = createController;
})(typeof window !== 'undefined' ? window : globalThis);
