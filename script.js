const questions = [
  {
    id: "birth_season",
    label: "The First Thread",
    text: "What season were you born into this world?",
    type: "choice",
    options: ["Spring — when things begin", "Summer — when things burn", "Autumn — when things fall", "Winter — when things hide"]
  },
  {
    id: "current_feeling",
    label: "The Second Thread",
    text: "Right now, deep beneath your surface, you feel...",
    type: "choice",
    options: ["Restless. Like something is coming.", "Calm, but uncertain of tomorrow.", "Tired, yet quietly hopeful.", "On the edge of something enormous."]
  },
  {
    id: "door_choice",
    label: "The Third Thread",
    text: "Two doors stand before you. One is slightly open — warm light spills through. The other is sealed shut, and something stirs behind it. You reach for...",
    type: "choice",
    options: ["The open door", "The sealed door"],
    single: true
  },
  {
    id: "one_word",
    label: "The Fourth Thread",
    text: "Without thinking — type the first word that rises in your mind.",
    type: "text",
    placeholder: "let it come..."
  },
  {
    id: "biggest_fear",
    label: "The Fifth Thread",
    text: "What shadow follows you most closely?",
    type: "choice",
    options: ["Being forgotten by those you love", "Running out of time for what matters", "Choosing the wrong path entirely", "Never finding where you truly belong"]
  },
  {
    id: "moon_phase",
    label: "The Sixth Thread",
    text: "Which moon calls to you?",
    type: "choice",
    options: ["New moon — dark sky, new starts", "Full moon — everything revealed", "Crescent — slow becoming", "Waning — the art of letting go"]
  }
];

let current = 0;
let answers = {};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  void el.offsetWidth;
}

function startQuiz() {
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = questions[current];
  const fill = ((current) / questions.length) * 100;
  document.getElementById('progress-fill').style.width = fill + '%';
  document.getElementById('progress-label').textContent = (current + 1) + ' / ' + questions.length;
  document.getElementById('next-btn').disabled = true;
  document.getElementById('next-label').textContent = current === questions.length - 1 ? 'Reveal My Fate' : 'Continue';

  let inner = `<p class="q-label">${q.label}</p><p class="q-text">${q.text}</p>`;

  if (q.type === 'choice') {
    const cls = q.single ? 'options single' : 'options';
    inner += `<div class="${cls}">` + q.options.map(o =>
      `<button class="opt-btn" onclick="selectOpt(this,'${o.replace(/'/g,"&#39;")}')">${o}</button>`
    ).join('') + '</div>';
  } else {
    inner += `<input class="text-field" type="text" placeholder="${q.placeholder}" id="txt" maxlength="40" oninput="onText(this.value)" autofocus />`;
  }

  const wrap = document.getElementById('question-wrap');
  wrap.style.opacity = '0';
  wrap.style.transform = 'translateY(10px)';
  wrap.innerHTML = inner;
  setTimeout(() => {
    wrap.style.transition = 'all 0.35s ease';
    wrap.style.opacity = '1';
    wrap.style.transform = 'translateY(0)';
  }, 30);
}

function selectOpt(btn, val) {
  document.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  answers[questions[current].id] = val;
  document.getElementById('next-btn').disabled = false;
}

function onText(val) {
  answers[questions[current].id] = val.trim();
  document.getElementById('next-btn').disabled = val.trim().length === 0;
}

function nextQuestion() {
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    showScreen('loading');
    cycleLoadingText();
    getProphecy();
  }
}

const loadingLines = [
  "The oracle peers through the veil...",
  "Reading the threads of your fate...",
  "The stars align for your reading...",
  "The mists part slowly...",
  "Your path comes into focus..."
];
let loadingIdx = 0;
let loadingTimer;

function cycleLoadingText() {
  const el = document.getElementById('loading-line');
  loadingTimer = setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      loadingIdx = (loadingIdx + 1) % loadingLines.length;
      el.textContent = loadingLines[loadingIdx];
      el.style.transition = 'opacity 0.5s';
      el.style.opacity = '1';
    }, 300);
  }, 2200);
}

async function getProphecy() {
  const summary = questions.map(q => `${q.text}\n→ ${answers[q.id]}`).join('\n\n');
  const prompt = `You are a mysterious, poetic oracle who speaks in atmospheric, lyrical language. Based on these answers, write a deeply personal prophecy. Be dramatic, cryptic yet meaningful — 4 short paragraphs, each separated by a blank line. Address them as "you". Make it feel genuinely personal to their specific answers. Weave their exact words and choices into the reading. Use imagery, metaphor, and a tone of ancient knowing. No titles, no sign-offs, just the prophecy itself.

Their answers:
${summary}`;

  try {
    const res = await fetch('/api/prophecy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    clearInterval(loadingTimer);
    showScreen('prophecy');
    typewriterReveal(data.prophecy || "The oracle is silent tonight. Return when the moon shifts.");
  } catch (e) {
    clearInterval(loadingTimer);
    showScreen('prophecy');
    typewriterReveal("The veil between worlds is thick tonight. The oracle cannot speak.\n\nReturn when the stars are clearer.");
  }
}

function typewriterReveal(text) {
  const el = document.getElementById('prophecy-text');
  el.textContent = '';
  let i = 0;
  const speed = 18;
  function type() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

function restart() {
  current = 0;
  answers = {};
  showScreen('quiz');
  renderQuestion();
}

// generate stars
(function() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 0.5;
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      --d: ${2 + Math.random() * 4}s;
      --delay: ${Math.random() * 5}s;
      --op: ${0.3 + Math.random() * 0.6};
    `;
    container.appendChild(star);
  }
})();
