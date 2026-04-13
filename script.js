/* ── HARVEST USER DATA ── */
const userData = {
  time: new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'}),
  hour: new Date().getHours(),
  date: new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
  os: getOS(),
  screen: `${window.screen.width}×${window.screen.height}`,
  lang: navigator.language || 'unknown',
  battery: null,
  isReturning: !!localStorage.getItem('oracle_visited'),
  lastVisit: localStorage.getItem('oracle_last_visit') || null,
  prevAnswers: JSON.parse(localStorage.getItem('oracle_answers') || 'null'),
  hesitations: 0,
  tabSwitches: 0,
  timeOnSite: Date.now()
};

function getOS() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Win/.test(ua)) return 'Windows';
  if (/Mac/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'unknown OS';
}

function getTimeContext() {
  const h = userData.hour;
  if (h >= 0 && h < 4) return 'the dead of night';
  if (h >= 4 && h < 6) return 'before dawn';
  if (h >= 6 && h < 9) return 'early morning';
  if (h >= 9 && h < 12) return 'the morning';
  if (h >= 12 && h < 17) return 'the afternoon';
  if (h >= 17 && h < 20) return 'the evening';
  if (h >= 20 && h < 23) return 'late at night';
  return 'the witching hour';
}

// Battery API
if (navigator.getBattery) {
  navigator.getBattery().then(b => {
    userData.battery = Math.round(b.level * 100);
    userData.charging = b.charging;
  });
}

// Track tab switches
document.addEventListener('visibilitychange', () => {
  if (document.hidden) userData.tabSwitches++;
});

// Track hesitation on answers
let lastInteraction = Date.now();
document.addEventListener('click', () => {
  const gap = Date.now() - lastInteraction;
  if (gap > 4000) userData.hesitations++;
  lastInteraction = Date.now();
});

/* ── BOOT SEQUENCE ── */
const bootLines = [
  '> INITIALIZING SIGNAL INTERCEPT…',
  '> LOCATING ORIGIN…',
  `> SOURCE DETECTED: ${() => userData.timezone}`,
  '> SCANNING DEVICE…',
  '> PROFILE MATCH: 94.7%',
  '> CROSS-REFERENCING BEHAVIORAL PATTERNS…',
  '> WARNING: VISITOR FLAGGED',
  '> LOADING INTERFACE…',
  '> ████████████████ 100%',
  '> ACCESS GRANTED.'
];

async function runBoot() {
  const log = document.getElementById('boot-log');
  for (let i = 0; i < bootLines.length; i++) {
    const line = typeof bootLines[i] === 'function' ? bootLines[i]() : bootLines[i];
    await typeText(log, line + '\n', i < 6 ? 22 : 8);
    await sleep(i === bootLines.length - 1 ? 600 : 120);
  }
  await sleep(500);
  showScreen('warning');
  buildWarning();
}

async function typeText(el, text, speed=20) {
  for (const ch of text) {
    el.textContent += ch;
    await sleep(speed);
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildWarning() {
  document.getElementById('arrival-time').textContent = userData.time;

  const strip = document.getElementById('data-strip');
  const batteryStr = userData.battery !== null
    ? `<span class="data-val">${userData.battery}%${userData.charging ? ' (charging)' : userData.battery < 20 ? ' — <span class="data-highlight">critically low</span>' : ''}</span>`
    : '<span class="data-val">unknown</span>';

  const returningStr = userData.isReturning
    ? `<span class="data-highlight">YES — last seen ${userData.lastVisit || 'recently'}</span>`
    : '<span class="data-val">first time (you think)</span>';

  strip.innerHTML = `
    <div><span class="data-key">TIME .................. </span>${userData.time} — <span class="data-val">${getTimeContext()}</span></div>
    <div><span class="data-key">LOCATION .............. </span><span class="data-val">${userData.timezone}</span></div>
    <div><span class="data-key">DEVICE ................ </span><span class="data-val">${userData.os} / ${userData.device}</span></div>
    <div><span class="data-key">SCREEN ................ </span><span class="data-val">${userData.screen}</span></div>
    <div><span class="data-key">BATTERY ............... </span>${batteryStr}</div>
    <div><span class="data-key">RETURNING VISITOR ..... </span>${returningStr}</div>
  `;

  // store visit
  localStorage.setItem('oracle_visited', 'true');
  localStorage.setItem('oracle_last_visit', new Date().toLocaleDateString());
}

/* ── QUESTIONS ── */
const questions = [
  {
    id: 'sleep',
    label: 'QUERY_001',
    text: `You opened this at ${() => userData.time}. When did you last sleep properly?`,
    opts: ['Last night — though not well', 'Two or three days ago, honestly', 'Sleep finds me when it wants to', 'I don\'t track it anymore']
  },
  {
    id: 'thought',
    label: 'QUERY_002',
    text: 'What were you actually thinking about before you found this?',
    type: 'text',
    placeholder: 'type it. we already know.'
  },
  {
    id: 'hiding',
    label: 'QUERY_003',
    text: 'Something you have not told anyone. Which category?',
    opts: ['A feeling I can\'t explain', 'A decision I regret', 'Something I want that scares me', 'Nothing. I hide nothing.']
  },
  {
    id: 'lie',
    label: 'QUERY_004',
    text: 'Have you lied today?',
    opts: ['No', 'A small one', 'Yes, to someone who trusted me', 'I don\'t consider it lying'],
    solo: true
  },
  {
    id: 'fear',
    label: 'QUERY_005',
    text: 'The thing you would never say out loud — which is closest?',
    opts: ['I am more alone than anyone knows', 'I am not sure I am a good person', 'I am running out of time', 'I am waiting for something to end']
  },
  {
    id: 'choice',
    label: 'QUERY_006 — FINAL',
    text: 'You had a choice today. A small one. What did you choose?',
    type: 'text',
    placeholder: 'you remember it.'
  }
];

let cur = 0, answers = {};

const intrusionMsgs = [
  [`Your ${userData.device} screen is always on. Even when you sleep.`, 1],
  [`We noticed the hesitation.`, 2],
  [`${userData.timezone}. We know exactly where.`, 3],
  [`You almost closed the tab just now.`, 4],
  ['This is the last question. For now.', 5]
];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  triggerGlitch();
}

function triggerGlitch() {
  document.body.classList.add('glitch-active');
  setTimeout(() => document.body.classList.remove('glitch-active'), 200);
}

function startQuiz() { showScreen('quiz'); renderQ(); }

function renderQ() {
  const q = questions[cur];
  const pct = (cur / questions.length * 100);
  document.getElementById('q-fill').style.width = pct + '%';
  document.getElementById('q-counter').textContent =
    String(cur + 1).padStart(2,'0') + ' / ' + String(questions.length).padStart(2,'0');
  document.getElementById('next-btn').disabled = true;

  const label = typeof q.label === 'function' ? q.label() : q.label;

  let html = `<p class="q-label-txt">${label}</p>`;

  // returning visitor twist
  let questionText = typeof q.text === 'function' ? q.text() : q.text;
  if (userData.isReturning && cur === 0) {
    questionText = `You came back. We thought you might. — ` + questionText;
  }
  if (userData.prevAnswers && cur === 2) {
    const prev = userData.prevAnswers['hiding'];
    if (prev) questionText = `Last time you said: "${prev}". Was that true? — ${questionText}`;
  }
  html += `<p class="q-question">${questionText}</p>`;

  if (q.type === 'text') {
    html += `<input class="txt-q" type="text" id="tval" placeholder="${q.placeholder}" maxlength="60" oninput="onTxt(this.value)" autofocus/>`;
  } else {
    html += `<div class="opts${q.solo ? ' solo' : ''}">` +
      q.opts.map(o => `<button class="opt" onclick="pick(this,'${o.replace(/'/g,"&#39;")}')">${o}</button>`).join('') +
      '</div>';
  }

  const body = document.getElementById('q-body');
  body.style.opacity = '0';
  body.innerHTML = html;
  setTimeout(() => {
    body.style.transition = 'opacity 0.35s ease';
    body.style.opacity = '1';
  }, 60);

  // intrusion message
  const msg = document.getElementById('intrusion-msg');
  msg.classList.remove('show');
  const found = intrusionMsgs.find(m => m[1] === cur);
  if (found) {
    setTimeout(() => {
      msg.textContent = found[0];
      msg.classList.add('show');
    }, 2200);
  } else {
    msg.textContent = '';
  }
}

function pick(btn, val) {
  document.querySelectorAll('.opt').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  answers[questions[cur].id] = val;
  document.getElementById('next-btn').disabled = false;
}

function onTxt(val) {
  answers[questions[cur].id] = val.trim();
  document.getElementById('next-btn').disabled = val.trim().length === 0;
}

function nextQ() {
  if (cur < questions.length - 1) { cur++; renderQ(); }
  else {
    localStorage.setItem('oracle_answers', JSON.stringify(answers));
    showScreen('processing');
    runProcessing();
    fetchProphecy();
  }
}

/* ── PROCESSING ── */
const procLines = [
  'CROSS-REFERENCING…',
  'PATTERN DETECTED…',
  'BUILDING PROFILE…',
  'CALCULATING TRAJECTORY…',
  'TRANSMISSION READY…'
];
const procSubs = [
  '', 'behavioral markers isolated.', 'identity confirmed.',
  `origin: ${userData.timezone}`, 'do not look away.'
];

async function runProcessing() {
  const bar = document.getElementById('proc-bar');
  const txt = document.getElementById('proc-text');
  const sub = document.getElementById('proc-sub');
  for (let i = 0; i <= 100; i++) {
    bar.style.width = i + '%';
    if (procLines[Math.floor(i / 22)]) txt.textContent = procLines[Math.floor(i / 22)];
    if (procSubs[Math.floor(i / 22)]) sub.textContent = procSubs[Math.floor(i / 22)];
    await sleep(30);
  }
}

/* ── FETCH PROPHECY ── */
async function fetchProphecy() {
  const timeCtx = getTimeContext();
  const batteryNote = userData.battery !== null
    ? `Their battery is at ${userData.battery}%${userData.battery < 20 ? ' — almost dead' : userData.charging ? ' and charging' : ''}.`
    : '';
  const returningNote = userData.isReturning ? 'This is not their first visit. They came back.' : 'This is their first visit.';
  const hesNote = userData.hesitations > 0 ? `They hesitated ${userData.hesitations} time(s) before answering.` : '';
  const tabNote = userData.tabSwitches > 0 ? `They switched away from this tab ${userData.tabSwitches} time(s).` : '';

  const qSummary = questions.map(q => {
    const text = typeof q.text === 'function' ? q.text() : q.text;
    return `"${text}"\n→ ${answers[q.id] || '(no answer)'}`;
  }).join('\n\n');

  const prompt = `You are watching someone. You know real things about them.

What you know:
- They opened this at ${userData.time} — ${timeCtx}.
- Location: ${userData.timezone}. Device: ${userData.os} on ${userData.device}.
- Screen: ${userData.screen}.
${batteryNote}
- ${returningNote}
${hesNote}
${tabNote}

Their answers:
${qSummary}

Write their prophecy. 4 short paragraphs. Weave in the real data naturally — the time, device, battery, timezone — so it feels like you've been watching. Not threatening. Just deeply, uncomfortably aware. Fractured sentence rhythm. Start mid-observation, like you've been watching for a while. No title. No sign-off. Just the transmission.`;

  try {
    const res = await fetch('/api/prophecy', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({prompt})
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    await waitForProcessing();
    showScreen('prophecy');
    const timeSpent = Math.round((Date.now() - userData.timeOnSite) / 1000);
    document.getElementById('prop-footer').textContent =
      `you have been here ${timeSpent} seconds. we have been here longer.`;
    typeReveal(data.prophecy || 'The signal was lost. But we still have what we need.');
  } catch(e) {
    await waitForProcessing();
    showScreen('prophecy');
    document.getElementById('prop-footer').textContent = 'connection severed. data retained.';
    typeReveal(`${userData.time}. ${userData.timezone}. We know.\n\nThe signal broke before the message completed.\n\nBut we already have what we came for.\n\nYou can close the tab now.`);
  }
}

async function waitForProcessing() {
  await sleep(3200);
}

function typeReveal(text) {
  const el = document.getElementById('prop-text');
  el.textContent = '';
  let i = 0;
  const t = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      // occasional glitch stutter
      if (Math.random() < 0.004) { setTimeout(t, 120); return; }
      setTimeout(t, 14);
    }
  };
  t();
}

function restart() {
  cur = 0; answers = {};
  userData.hesitations = 0; userData.tabSwitches = 0;
  userData.isReturning = true;
  showScreen('boot');
  document.getElementById('boot-log').textContent = '';
  runBoot();
}

/* ── INIT ── */
window.addEventListener('load', runBoot);
