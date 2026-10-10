// Behind the screens: the screen library. Twelve pure functions: state in, HTML string out.
// Juniper Studio is a made-up business; this is its booking app, drawn inside the phone.
// Allowed state keys and values: the "Screen state contract" in the plan. Missing keys get defaults.
// Every piece of text is escaped. Nothing in here is clickable: the phone is a picture.
(function (root) {
  'use strict';

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    return v === undefined || v === null ? '' : String(v).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }
  function own(map, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key); }
  function pick(v, allowed, fallback) { return allowed.indexOf(v) === -1 ? fallback : v; }
  function list(v) { return Array.isArray(v) ? v : []; }
  function str(v, fallback) { return typeof v === 'string' ? v : fallback; }
  function obj(v) { return v && typeof v === 'object' ? v : {}; }

  // "16:00" -> "4pm", "09:30" -> "9:30am". Anything else is shown as given.
  function clock(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(t));
    if (!m) return String(t);
    var h = Number(m[1]);
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m[2] === '00' ? '' : ':' + m[2]) + (h >= 12 ? 'pm' : 'am');
  }

  var TONES = ['ok', 'warn', 'bad'];
  var ICON = { ok: '✓', warn: '!', bad: '✕', info: 'i' };

  // Juniper Studio's mark: a juniper sprig with two berries.
  var MARK = '<svg class="jn-mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">' +
    '<path d="M12 22V5M12 8.5 8.5 5.5M12 8.5l3.5-3M12 12.5 7.5 9M12 12.5 16.5 9M12 16.5 8 13.5M12 16.5l4-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
    '<circle class="jn-berry" cx="7.6" cy="18.6" r="2"/><circle class="jn-berry" cx="16.4" cy="19.6" r="1.7"/></svg>';
  var LOCK = '<svg class="jn-lock" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7h1zm2 0h4V5a2 2 0 0 0-4 0v2z"/></svg>';
  var WIFI_OFF = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M14 10.3A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 4.5-2.8M10 5.1a15 15 0 0 1 12 4.4"/><circle cx="12" cy="20" r="1.3" fill="currentColor"/></svg>';

  function tag(tone, text) {
    return '<span class="jn-tag jn-tone-' + tone + '"><span aria-hidden="true">' + ICON[tone] + '</span> ' + esc(text) + '</span>';
  }
  function lines(arr) {
    return list(arr).map(function (l) { return '<p class="jn-line">' + esc(l) + '</p>'; }).join('');
  }
  function banner(b) {
    if (!b || typeof b !== 'object' || typeof b.text !== 'string') return '';
    var tone = pick(b.tone, ['ok', 'warn', 'bad', 'info'], 'info');
    return '<div class="jn-banner jn-tone-' + tone + '"><span aria-hidden="true">' + ICON[tone] + '</span><span>' + esc(b.text) + '</span></div>';
  }
  function appBar(title) {
    return '<div class="jn-bar">' + MARK + '<span class="jn-brand">Juniper Studio</span><span class="jn-bar-title">' + esc(title) + '</span></div>';
  }
  // Every screen: <div class="jn jn-NAME" data-...>[top][banner][bar]<div class="jn-body">...</div></div>
  function frame(name, s, attrs, bar, body, top) {
    return '<div class="jn jn-' + name + '"' + attrs + '>' + (top || '') + banner(s.banner) + (bar || '') +
      '<div class="jn-body">' + body + '</div></div>';
  }

  function book(state) {
    var s = obj(state);
    var slots = list(s.slots).length ? list(s.slots) : ['10:00', '12:00', '14:00', '16:00'];
    var taken = list(s.taken);
    var selected = typeof s.selected === 'string' ? s.selected : null;
    var held = typeof s.held === 'string' ? s.held : null;
    var grid = slots.map(function (t) {
      var cls = 'jn-slot';
      var note = '';
      if (t === held) { cls += ' is-held'; note = 'Held for someone paying'; }
      else if (taken.indexOf(t) !== -1) { cls += ' is-taken'; note = 'Taken'; }
      else if (t === selected) { cls += ' is-selected'; note = 'Your pick'; }
      return '<span class="' + cls + '"><b>' + esc(clock(t)) + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</span>';
    }).join('');
    var body =
      '<p class="jn-h">Book a session</p>' +
      '<dl class="jn-facts">' +
      '<div><dt>With</dt><dd>' + esc(str(s.practitioner, 'Ava')) + '</dd></div>' +
      '<div><dt>Session</dt><dd>' + esc(str(s.session, '60-minute session')) + '</dd></div>' +
      '<div><dt>Day</dt><dd>' + esc(str(s.day, 'Sat 24 Oct')) + '</dd></div>' +
      '</dl>' +
      '<p class="jn-label">Pick a time</p>' +
      '<div class="jn-slots">' + grid + '</div>' +
      '<span class="jn-cta' + (selected ? '' : ' is-off') + '">' + (selected ? 'Continue to pay' : 'Pick a time') + '</span>';
    return frame('book', s, '', appBar('Book online'), body);
  }

  var PAY = ['idle', 'processing', 'declined', 'paid', 'charged-twice'];
  function pay(state) {
    var s = obj(state);
    var status = pick(s.status, PAY, 'idle');
    var result = {
      'idle': '<span class="jn-cta">Pay now</span>',
      'processing': '<span class="jn-cta is-busy"><span class="jn-spin" aria-hidden="true"></span>Processing...</span>',
      'declined': tag('bad', 'Card declined') + '<span class="jn-cta">Pay now</span>',
      'paid': tag('ok', 'Payment taken'),
      'charged-twice': tag('bad', 'Charged twice') + '<p class="jn-line">The same payment went through two times.</p>'
    }[status];
    var save = s.saveCard === true
      ? '<div class="jn-check"><span class="jn-box" aria-hidden="true">✓</span><div><b>Save my card for no-show charges</b>' +
        '<small>I agree Juniper Studio can charge this card if I miss my appointment, as its booking policy says.</small></div></div>'
      : '';
    var body =
      '<p class="jn-h">Pay your deposit</p>' +
      '<div class="jn-sum"><span>Amount</span><b>' + esc(str(s.amount, '£18.00 deposit')) + '</b></div>' +
      '<div class="jn-card"><span class="jn-card-icon" aria-hidden="true"></span><span>' + esc(str(s.card, 'Visa •••• 4242')) + '</span></div>' +
      save +
      '<div class="jn-pay-result">' + result + '</div>' +
      (s.note ? '<p class="jn-note">' + esc(s.note) + '</p>' : '');
    return frame('pay', s, ' data-status="' + status + '"', appBar('Pay deposit'), body);
  }

  var BANK = {
    'asking': ['info', 'Waiting for you', 'Open your banking app to approve this payment.'],
    'approved': ['ok', 'Approved', 'Taking you back to Juniper Studio.'],
    'timed-out': ['bad', 'Timed out', 'The payment wasn\'t approved in time. Nothing was taken.'],
    'skipped': ['ok', 'No check needed', 'Your bank approved this payment without a check.']
  };
  function bankCheck(state) {
    var s = obj(state);
    var status = pick(s.status, Object.keys(BANK), 'asking');
    var b = BANK[status];
    var body =
      '<div class="jn-sheet">' +
      '<p class="jn-sheet-from">' + LOCK + '<span>' + esc(str(s.bank, 'Your bank')) + '</span></p>' +
      '<p class="jn-sheet-kicker">Security check (3D Secure)</p>' +
      '<p class="jn-h">Is this you paying Juniper Studio?</p>' +
      '<p class="jn-line">' + esc(b[2]) + '</p>' +
      '<div class="jn-sheet-status">' + (status === 'asking' ? '<span class="jn-spin" aria-hidden="true"></span>' : '') + tag(b[0], b[1]) + '</div>' +
      '</div>';
    return frame('bank-check', s, ' data-status="' + status + '"', '', body);
  }

  function confirmed(state) {
    var s = obj(state);
    var tone = pick(s.tone, TONES, 'ok');
    var body =
      '<div class="jn-result jn-tone-' + tone + '">' +
      '<span class="jn-big-icon" aria-hidden="true">' + ICON[tone] + '</span>' +
      '<p class="jn-h">' + esc(str(s.title, 'You\'re booked')) + '</p>' + lines(s.lines) +
      '</div>';
    return frame('confirmed', s, ' data-tone="' + tone + '"', appBar('Booking'), body);
  }

  function myBooking(state) {
    var s = obj(state);
    var tone = pick(s.tone, TONES, 'ok');
    var address = '<div class="jn-address">' + LOCK + '<span>' + esc(str(s.url, 'juniperstudio.example/booking')) + '</span></div>';
    var head = s.locked === true
      ? '<p class="jn-h">' + LOCK + ' Only you can see this booking</p>'
      : (s.name ? '<p class="jn-h">' + esc(s.name) + '</p>' : '') + (s.when ? '<p class="jn-when">' + esc(s.when) + '</p>' : '');
    var flag = tone === 'ok' ? '' : '<span class="jn-flag" aria-hidden="true">' + ICON[tone] + '</span>';
    var body = '<div class="jn-booking jn-tone-' + tone + '">' + flag + head + lines(s.lines) + '</div>';
    return frame('my-booking', s, ' data-tone="' + tone + '"', appBar('Your booking'), body, address);
  }

  var BUBBLE = {
    'sent': ['Sent', '✓'],
    'delivered': ['Delivered', '✓✓'],
    'read': ['Read', '✓✓'],
    'failed': ['Failed to send', '!'],
    'not-sent': ['Not sent', '✕']
  };
  function message(state) {
    var s = obj(state);
    var channel = pick(s.channel, ['text', 'whatsapp'], 'text');
    var to = str(s.to, 'Priya');
    var bubbles = list(s.bubbles).map(function (raw) {
      var b = obj(raw);
      var st = own(BUBBLE, b.status) ? b.status : 'sent';
      return '<div class="jn-msg is-' + st + '"><p class="jn-bubble">' + esc(b.text) + '</p>' +
        '<span class="jn-tick">' + BUBBLE[st][0] + ' <span aria-hidden="true">' + BUBBLE[st][1] + '</span></span></div>';
    }).join('');
    var head =
      '<div class="jn-chat-head"><span class="jn-avatar" aria-hidden="true">' + esc(to.charAt(0)) + '</span>' +
      '<div><b>' + esc(to) + '</b><small>' + (channel === 'whatsapp' ? 'WhatsApp' : 'Text message') + '</small></div></div>';
    var body = '<div class="jn-chat">' + bubbles + '</div>' + (s.cost ? '<p class="jn-cost">Cost: ' + esc(s.cost) + '</p>' : '');
    return frame('message', s, ' data-channel="' + channel + '"', head, body);
  }

  function email(state) {
    var s = obj(state);
    var tone = pick(s.tone, TONES, 'ok');
    var body =
      '<div class="jn-mail jn-tone-' + tone + '">' +
      '<p class="jn-h">' + esc(str(s.subject, '(no subject)')) + '</p>' +
      '<p class="jn-meta"><span>From</span> ' + esc(str(s.from, 'Juniper Studio')) + '</p>' +
      '<p class="jn-meta"><span>To</span> ' + esc(str(s.to, '')) + '</p>' +
      '<div class="jn-mail-body">' + lines(s.lines) + '</div>' +
      '</div>';
    return frame('email', s, ' data-tone="' + tone + '"', '<div class="jn-mail-bar"><span aria-hidden="true">‹</span> Inbox</div>', body);
  }

  var FLAG = { 'clash': ['bad', 'Clash'], 'moved': ['info', 'Moved'], 'cancelled': ['warn', 'Cancelled'], 'new': ['ok', 'New'] };
  function diary(state) {
    var s = obj(state);
    var cols = list(s.columns).map(function (raw) {
      var c = obj(raw);
      var off = c.off === true;
      var items = list(c.items).map(function (rawItem) {
        var it = obj(rawItem);
        var f = own(FLAG, it.flag) ? FLAG[it.flag] : null;
        return '<li' + (f ? ' class="is-' + it.flag + '"' : '') + '><b>' + esc(clock(it.time)) + '</b><span>' + esc(it.name) + '</span>' + (f ? tag(f[0], f[1]) : '') + '</li>';
      }).join('');
      return '<div class="jn-col' + (off ? ' is-off' : '') + '">' +
        '<p class="jn-who">' + esc(c.who) + (off ? ' ' + tag('warn', 'Off sick') : '') + '</p>' +
        (items ? '<ul>' + items + '</ul>' : '<p class="jn-empty">No bookings</p>') + '</div>';
    }).join('');
    var body =
      '<p class="jn-h">' + esc(str(s.day, 'Sat 24 Oct')) + '</p>' +
      '<div class="jn-cols">' + cols + '</div>' +
      (s.note ? '<p class="jn-note">' + esc(s.note) + '</p>' : '');
    return frame('diary', s, '', appBar('Diary'), body);
  }

  function owner(state) {
    var s = obj(state);
    var rows = list(s.rows).map(function (raw) {
      var r = obj(raw);
      var tone = pick(r.tone, TONES, '');
      return '<li class="jn-row' + (tone ? ' jn-tone-' + tone : '') + '"><span>' + esc(r.label) + '</span>' +
        '<b>' + (tone ? '<span aria-hidden="true">' + ICON[tone] + '</span> ' : '') + esc(r.value) + '</b></li>';
    }).join('');
    var body =
      '<p class="jn-h">' + esc(str(s.title, 'Today')) + '</p>' +
      (rows ? '<ul class="jn-rows">' + rows + '</ul>' : '<p class="jn-empty">Nothing to show</p>');
    return frame('owner', s, '', appBar('Owner'), body);
  }

  function team(state) {
    var s = obj(state);
    var people = list(s.people).map(function (raw) {
      var p = obj(raw);
      var on = pick(p.access, ['on', 'off'], 'on') === 'on';
      return '<li class="' + (on ? 'is-on' : 'is-off') + '">' +
        '<span class="jn-avatar" aria-hidden="true">' + esc(str(p.name, '?').charAt(0)) + '</span>' +
        '<div><b>' + esc(p.name) + '</b><small>' + esc(p.role) + '</small></div>' +
        '<span class="jn-switch"><span class="jn-knob" aria-hidden="true"></span>' + (on ? 'Access on' : 'Access off') + '</span></li>';
    }).join('');
    return frame('team', s, '', appBar('Team'), '<p class="jn-h">Who can log in</p><ul class="jn-people">' + people + '</ul>');
  }

  var ERROR_ICON = {
    'blank': '',
    'spinner': '<span class="jn-spin jn-spin-big" aria-hidden="true"></span>',
    'server': '<span class="jn-big-icon jn-tone-bad" aria-hidden="true">!</span>',
    'offline': '<span class="jn-big-icon jn-tone-warn" aria-hidden="true">' + WIFI_OFF + '</span>'
  };
  function error(state) {
    var s = obj(state);
    var kind = pick(s.kind, Object.keys(ERROR_ICON), 'server');
    var body =
      (s.clock ? '<p class="jn-clock">' + esc(s.clock) + '</p>' : '') +
      '<div class="jn-error-main">' + ERROR_ICON[kind] +
      '<p class="jn-h">' + esc(str(s.title, 'Something went wrong')) + '</p>' + lines(s.lines) + '</div>';
    return frame('error', s, ' data-kind="' + kind + '"', kind === 'blank' ? '' : appBar(''), body);
  }

  var DATA_ROW = { 'found': ['ok', 'Found'], 'missing': ['bad', 'Not found'], 'removed': ['ok', 'Deleted'], 'kept': ['warn', 'Kept'] };
  function dataRequest(state) {
    var s = obj(state);
    var asks = pick(s.asks, ['copy', 'delete'], 'copy');
    var rows = list(s.rows).map(function (raw) {
      var r = obj(raw);
      var d = own(DATA_ROW, r.status) ? DATA_ROW[r.status] : null;
      return '<li class="jn-row"><span>' + esc(r.label) + '</span>' + (d ? tag(d[0], d[1]) : '') + '</li>';
    }).join('');
    var body =
      '<p class="jn-h">' + esc(str(s.from, 'Priya')) + (asks === 'copy' ? ' wants a copy of their data' : ' wants their data deleted') + '</p>' +
      '<ul class="jn-rows">' + rows + '</ul>' +
      (s.due ? '<p class="jn-due">' + esc(s.due) + '</p>' : '');
    return frame('data-request', s, ' data-asks="' + asks + '"', appBar('Data request'), body);
  }

  root.BTS_SCREENS = {
    'book': book,
    'pay': pay,
    'bank-check': bankCheck,
    'confirmed': confirmed,
    'my-booking': myBooking,
    'message': message,
    'email': email,
    'diary': diary,
    'owner': owner,
    'team': team,
    'error': error,
    'data-request': dataRequest
  };
})(typeof window !== 'undefined' ? window : globalThis);
