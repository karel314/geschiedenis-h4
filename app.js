// Geschiedenis H4 - Quiz App
'use strict';

// ── State ──
let db = null;
let allQuestions = [];
let quizQuestions = [];
let currentIndex = 0;
let answers = [];
let answered = false;
let selectedCount = 10;
let selectedLeerdoelen = [];
let multiSelectChoices = new Set();
let volgordeOrder = [];
let flashcards = [];
let flashIndex = 0;
let flashFlipped = false;

const STORAGE_KEY = 'gesch-h4-progress';
const LETTERS = 'ABCDEFGHIJ';

// ── Badge definitions ──
const BADGES = {
  1: { name: 'Pruikenmeester', emoji: '\u{1F451}' },
  2: { name: 'Standenkenner', emoji: '\u{269C}\uFE0F' },
  3: { name: 'Verlichtingsdenker', emoji: '\u{1F4A1}' },
  4: { name: 'Filosoof', emoji: '\u{1F4DC}' },
  5: { name: 'Revolutionair', emoji: '\u{1F3F4}' },
  6: { name: 'Politiek Strateeg', emoji: '\u{2696}\uFE0F' },
  7: { name: 'Geschiedenisheld', emoji: '\u{1F3AD}' },
  8: { name: 'Tijdreiziger', emoji: '\u{231B}' },
  9: { name: 'Woordenmeester', emoji: '\u{1F4D6}' }
};

// ── Encouragement messages ──
const CORRECT_MSGS = [
  'Lodewijk XIV zou jaloers zijn op jouw kennis!',
  'Je bent slimmer dan de hele derde stand bij elkaar!',
  'Voltaire zou je een applausje geven!',
  'Dat wist zelfs Montesquieu niet zo snel!',
  'Je hebt de Verlichting in je hoofd!',
  'Napoleon zou je tot generaal benoemen!',
  'Beter dan een pruik op je hoofd: kennis erin!',
  'De Encyclopedie had jou als bron moeten gebruiken!',
  'Robespierre is onder de indruk!',
  'Je maakt de derde stand trots!',
  'Historicus in wording!',
  'Dat was scherper dan de guillotine!',
  'Je scoort hoger dan de belasting op brood!',
  'Eise Eisinga zou je highfiven!',
  'Je bent een wandelende geschiedenisles!',
  'Zelfs de adel buigt voor jouw kennis!',
  'Je had zo in de Staten-Generaal gekund!',
  'De Bastille kan jou niet tegenhouden!',
  'Top! Je bent op weg naar een 10!',
  'Pruiken af voor jou!',
  'Je brein is verlicht!',
  'Daar kan geen revolutie tegenop!',
  'Je hebt meer kennis dan de hele eerste stand!',
  'Knaller! Ga zo door!',
  'Je loopt voor op de tijdlijn!',
  'Als een echte filosoof!',
  'Diderot zou je in de Encyclopedie zetten!',
  'Je weet meer dan de gemiddelde regent!',
  'Absolute power move!',
  'Je bent de Locke van deze quiz!',
  'Zo scherp als een verlichte geest!',
  'Beter dan een buitenhuis aan de Vecht!',
  'Je maakt geschiedenis!',
  'Wow, dat was razendsnel!',
  'Geen twijfel mogelijk, jij kent je stof!'
];

const WRONG_MSGS = [
  'Zelfs Robespierre maakte fouten... oh wacht.',
  'Die had Voltaire ook niet geweten, denk ik.',
  'Niet getreurd, zelfs Napoleon verloor bij Waterloo!',
  'Oeps! Maar je leert ervan, net als de revolutionairen.',
  'Lodewijk XVI wist het ook niet altijd...',
  'Geen stress, de Verlichting begon ook met twijfel!',
  'Foutje! Maar hey, oefening baart kunst.',
  'Dat was een struikelpruik!',
  'De guillotine van het verkeerde antwoord!',
  'Niet erg, je bent nog steeds slimmer dan een pruik.',
  'Au! Maar de volgende gaat beter.',
  'Zelfs de beste historici slaan weleens de plank mis.',
  'Die kennis komt nog, beloofd!',
  'Hmm, dat was meer ancien regime dan revolutie.',
  'Nog eentje oefenen en je hebt het!',
  'Bijna! Net als de bijna-revolutie van 1787.',
  'De derde stand had het ook moeilijk, jij komt er wel!',
  'Dat antwoord had een pruik nodig om het te verbergen.',
  'Niet opgeven! De revolutie stopte ook niet na dag 1.',
  'Je leert sneller dan de Staten-Generaal vergaderde!',
  'Fout, maar je moed is groter dan de Bastille!',
  'Ach, morgen weet je het wel!',
  'Dat was een historische misser, maar je komt terug!',
  'Zelfs Kant moest nadenken, dus geen zorgen.',
  'Je zit op het verkeerde spoor, maar de trein rijdt door!',
  'Het goede antwoord was vlakbij, net als de revolutie!',
  'Oeps! Maar elke fout is een les.',
  'Die pruik zat even scheef, maar we gaan door!',
  'Niet het juiste antwoord, maar wel lef!',
  'De Encyclopedie had ook correcties nodig!',
  'Foutje bedankt! Lees de uitleg goed.',
  'Net niet! Maar je komt er dichterbij.',
  'Dat was een koninklijke blunder!',
  'Geen paniek, de volgende vraag is jouw revolutie!',
  'Mis! Maar je bent nog steeds in het spel.'
];

const RESULTS_MSGS = {
  perfect: [
    'Absoluut briljant! Je bent klaar voor het proefwerk!',
    'Perfecte score! De geschiedenisleraar gaat steil achterover!'
  ],
  great: [
    'Uitstekend! Je beheerst de stof als een echte historicus!',
    'Geweldig resultaat! Nog even de puntjes op de i.'
  ],
  good: [
    'Goed bezig! Nog een paar rondes en je zit op een 10!',
    'Prima score! Focus op de rode vragen en je bent er bijna.'
  ],
  okay: [
    'Een goede start! Herhaal de zwakke onderwerpen.',
    'Je bent op weg! Probeer de flashcards voor de moeilijke topics.'
  ],
  low: [
    'Niet getreurd! Rome is ook niet in een dag gebouwd.',
    'Dit is je startpunt. Gebruik de flashcards en probeer opnieuw!'
  ]
};

// ── Init ──
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const resp = await fetch('data/vragen.json');
    db = await resp.json();
    flattenQuestions();
    setupConfigScreen();
    updateBadgeShelf();
    updateHomeStats();
  } catch (e) {
    console.error('Failed to load questions:', e);
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  // Count selector
  document.querySelectorAll('#count-selector .btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#count-selector .btn-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedCount = parseInt(btn.dataset.count);
    });
  });
}

function flattenQuestions() {
  allQuestions = [];
  for (const ld of db.leerdoelen) {
    for (const sd of ld.subdoelen) {
      for (const v of sd.vragen) {
        allQuestions.push({
          ...v,
          leerdoel_id: ld.leerdoel_id,
          leerdoel_titel: ld.leerdoel_titel,
          subdoel_id: sd.subdoel_id,
          subdoel_titel: sd.subdoel_titel
        });
      }
    }
  }
}

// ── Progress helpers ──
function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultProgress();
  } catch { return defaultProgress(); }
}

function defaultProgress() {
  return { questionHistory: {}, badges: {}, totalAnswered: 0, totalCorrect: 0 };
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function resetProgress() {
  if (!confirm('Weet je zeker dat je alle voortgang wilt wissen? Dit kan niet ongedaan worden.')) return;
  localStorage.removeItem(STORAGE_KEY);
  updateBadgeShelf();
  updateHomeStats();
  renderProgressScreen();
}

function getQuestionPriority(qId) {
  const p = getProgress();
  const hist = p.questionHistory[qId];
  if (!hist || hist.length === 0) return 0;
  const recent = hist.slice(-3);
  const rate = recent.filter(Boolean).length / recent.length;
  if (rate < 0.34) return 1;
  if (rate < 0.67) return 2;
  return 3;
}

function getLeerdoelMastery(leerdoelId) {
  const p = getProgress();
  const questions = allQuestions.filter(q => q.leerdoel_id === leerdoelId);
  if (questions.length === 0) return { pct: 0, seen: 0, total: 0 };
  let seen = 0, correctRecent = 0, totalRecent = 0;
  for (const q of questions) {
    const hist = p.questionHistory[q.id];
    if (hist && hist.length > 0) {
      seen++;
      const recent = hist.slice(-3);
      correctRecent += recent.filter(Boolean).length;
      totalRecent += recent.length;
    }
  }
  const pct = totalRecent > 0 ? Math.round((correctRecent / totalRecent) * 100) : 0;
  return { pct, seen, total: questions.length };
}

// ── Screen navigation ──
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);
  if (name === 'home') { updateBadgeShelf(); updateHomeStats(); }
  if (name === 'progress') renderProgressScreen();
}

// ── Config screen ──
function setupConfigScreen() {
  const container = document.getElementById('leerdoel-filter');
  container.innerHTML = '';
  for (const ld of db.leerdoelen) {
    const label = document.createElement('label');
    label.className = 'leerdoel-cb';
    label.innerHTML = `
      <input type="checkbox" value="${ld.leerdoel_id}">
      <span class="leerdoel-cb-check">&#10003;</span>
      <span class="leerdoel-cb-text">${ld.leerdoel_titel} <span class="leerdoel-cb-par">&sect;${ld.paragraaf}</span></span>
    `;
    const cb = label.querySelector('input');
    label.addEventListener('click', (e) => {
      if (e.target === cb) return;
      cb.checked = !cb.checked;
      label.classList.toggle('checked', cb.checked);
    });
    cb.addEventListener('change', () => label.classList.toggle('checked', cb.checked));
    container.appendChild(label);
  }
}

// ── Start quiz ──
function startQuiz() {
  const checked = [...document.querySelectorAll('#leerdoel-filter input:checked')].map(cb => parseInt(cb.value));
  selectedLeerdoelen = checked.length > 0 ? checked : db.leerdoelen.map(ld => ld.leerdoel_id);

  const pool = allQuestions.filter(q => selectedLeerdoelen.includes(q.leerdoel_id));
  // Sort by priority (weak first), random tiebreak
  const scored = pool.map(q => ({ q, priority: getQuestionPriority(q.id), rand: Math.random() }));
  scored.sort((a, b) => a.priority - b.priority || a.rand - b.rand);
  quizQuestions = scored.slice(0, selectedCount).map(s => s.q);
  // Shuffle for variety
  for (let i = quizQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quizQuestions[i], quizQuestions[j]] = [quizQuestions[j], quizQuestions[i]];
  }

  currentIndex = 0;
  answers = [];
  showScreen('quiz');
  renderQuestion();
}

// ── Exit quiz ──
function exitQuiz() {
  if (answers.length > 0) {
    if (!confirm('Wil je de quiz stoppen? Je voortgang wordt opgeslagen.')) return;
    saveQuizProgress();
  }
  showScreen('home');
}

// ── Render question ──
function renderQuestion() {
  answered = false;
  multiSelectChoices = new Set();
  const q = quizQuestions[currentIndex];
  const total = quizQuestions.length;

  // Progress bar
  document.getElementById('quiz-progress-text').textContent = `${currentIndex + 1} / ${total}`;
  document.getElementById('quiz-progress-fill').style.width = `${((currentIndex) / total) * 100}%`;
  document.getElementById('quiz-leerdoel-badge').textContent = q.leerdoel_titel;

  // Question
  document.getElementById('question-text').textContent = q.vraag;

  // Type badge
  const typeLabels = { multiple_choice: 'Meerkeuze', choose_all_that_apply: 'Meerdere antwoorden', invullen: 'Invullen', volgorde: 'Volgorde' };
  document.getElementById('question-type-badge').textContent = typeLabels[q.type] || q.type;

  // Render options by type
  const container = document.getElementById('options-container');
  container.innerHTML = '';

  if (q.type === 'multiple_choice') renderMC(q, container);
  else if (q.type === 'choose_all_that_apply') renderCATA(q, container);
  else if (q.type === 'invullen') renderInvullen(q, container);
  else if (q.type === 'volgorde') renderVolgorde(q, container);

  // Hide feedback
  document.getElementById('feedback-panel').style.display = 'none';
}

// ── Multiple Choice ──
function renderMC(q, container) {
  q.opties.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-letter">${LETTERS[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => submitMC(i));
    container.appendChild(btn);
  });
}

function submitMC(index) {
  if (answered) return;
  answered = true;
  const q = quizQuestions[currentIndex];
  const isCorrect = index === q.juiste_antwoord;
  const btns = document.querySelectorAll('#options-container .option-btn');
  btns.forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === q.juiste_antwoord) btn.classList.add('correct');
    if (i === index && !isCorrect) btn.classList.add('wrong');
    if (i !== index && i !== q.juiste_antwoord) btn.classList.add('dimmed');
  });
  recordAnswer(isCorrect, q);
  showFeedback(isCorrect, q);
}

// ── Choose All That Apply ──
function renderCATA(q, container) {
  const hint = document.createElement('div');
  hint.className = 'cata-hint';
  hint.textContent = 'Selecteer alle juiste antwoorden';
  container.appendChild(hint);

  q.opties.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="check-box">&#10003;</span><span>${opt}</span>`;
    btn.addEventListener('click', () => toggleCATA(i, btn));
    container.appendChild(btn);
  });

  const submit = document.createElement('button');
  submit.className = 'btn-submit-multi';
  submit.textContent = 'Controleer';
  submit.addEventListener('click', () => submitCATA());
  container.appendChild(submit);
}

function toggleCATA(index, btn) {
  if (answered) return;
  if (multiSelectChoices.has(index)) {
    multiSelectChoices.delete(index);
    btn.classList.remove('selected');
  } else {
    multiSelectChoices.add(index);
    btn.classList.add('selected');
  }
  const submit = document.querySelector('.btn-submit-multi');
  submit.classList.toggle('active', multiSelectChoices.size > 0);
}

function submitCATA() {
  if (answered || multiSelectChoices.size === 0) return;
  answered = true;
  const q = quizQuestions[currentIndex];
  const correctSet = new Set(q.juiste_antwoorden);
  const isCorrect = correctSet.size === multiSelectChoices.size &&
    [...correctSet].every(i => multiSelectChoices.has(i));

  const btns = document.querySelectorAll('#options-container .option-btn');
  btns.forEach((btn, i) => {
    btn.classList.add('disabled');
    if (correctSet.has(i)) btn.classList.add('correct');
    if (multiSelectChoices.has(i) && !correctSet.has(i)) btn.classList.add('wrong');
    if (!correctSet.has(i) && !multiSelectChoices.has(i)) btn.classList.add('dimmed');
  });
  document.querySelector('.btn-submit-multi').style.display = 'none';

  recordAnswer(isCorrect, q);
  showFeedback(isCorrect, q);
}

// ── Invullen ──
function renderInvullen(q, container) {
  const div = document.createElement('div');
  div.className = 'invul-container';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'invul-input';
  input.placeholder = 'Typ je antwoord...';
  input.autocomplete = 'off';
  input.autocapitalize = 'off';

  const submit = document.createElement('button');
  submit.className = 'invul-submit';
  submit.textContent = 'OK';

  const doSubmit = () => submitInvullen(input);
  submit.addEventListener('click', doSubmit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });

  div.appendChild(input);
  div.appendChild(submit);
  container.appendChild(div);
  setTimeout(() => input.focus(), 100);
}

function normalize(str) {
  return str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0));
  return d[m][n];
}

function checkInvullen(userAnswer, correctAnswer) {
  const u = normalize(userAnswer);
  const c = normalize(correctAnswer);
  if (u === c) return true;
  // For single words, allow Levenshtein 1
  if (!c.includes(' ') && !u.includes(' ')) return levenshtein(u, c) <= 1;
  // Multi-word: also try without "en"/"of" differences and minor variations
  return false;
}

function submitInvullen(input) {
  if (answered) return;
  const userAnswer = input.value.trim();
  if (!userAnswer) return;
  answered = true;
  const q = quizQuestions[currentIndex];
  const isCorrect = checkInvullen(userAnswer, q.juiste_antwoord);

  input.classList.add(isCorrect ? 'correct' : 'wrong');
  input.disabled = true;
  document.querySelector('.invul-submit').disabled = true;

  if (!isCorrect) {
    const correctDiv = document.createElement('div');
    correctDiv.className = 'invul-correct-answer';
    correctDiv.textContent = `Juiste antwoord: ${q.juiste_antwoord}`;
    document.getElementById('options-container').appendChild(correctDiv);
  }

  recordAnswer(isCorrect, q);
  showFeedback(isCorrect, q);
}

// ── Volgorde ──
function renderVolgorde(q, container) {
  // Shuffle the options
  volgordeOrder = [...q.opties];
  // Fisher-Yates shuffle
  for (let i = volgordeOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [volgordeOrder[i], volgordeOrder[j]] = [volgordeOrder[j], volgordeOrder[i]];
  }
  renderVolgordeItems(container);

  const submit = document.createElement('button');
  submit.className = 'btn-submit-volgorde';
  submit.textContent = 'Controleer volgorde';
  submit.addEventListener('click', () => submitVolgorde());
  container.appendChild(submit);
}

function renderVolgordeItems(container) {
  // Remove existing list if any
  const existing = container.querySelector('.volgorde-list');
  if (existing) existing.remove();

  const list = document.createElement('div');
  list.className = 'volgorde-list';
  volgordeOrder.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'volgorde-item';
    div.innerHTML = `
      <span class="volgorde-num">${i + 1}</span>
      <span class="volgorde-text">${item}</span>
      <span class="volgorde-arrows">
        <button onclick="moveVolgorde(${i}, -1)" ${i === 0 ? 'disabled' : ''}>&uarr;</button>
        <button onclick="moveVolgorde(${i}, 1)" ${i === volgordeOrder.length - 1 ? 'disabled' : ''}>&darr;</button>
      </span>
    `;
    list.appendChild(div);
  });
  // Insert before submit button
  const submitBtn = container.querySelector('.btn-submit-volgorde');
  if (submitBtn) container.insertBefore(list, submitBtn);
  else container.appendChild(list);
}

function moveVolgorde(index, dir) {
  if (answered) return;
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= volgordeOrder.length) return;
  [volgordeOrder[index], volgordeOrder[newIndex]] = [volgordeOrder[newIndex], volgordeOrder[index]];
  renderVolgordeItems(document.getElementById('options-container'));
}

function submitVolgorde() {
  if (answered) return;
  answered = true;
  const q = quizQuestions[currentIndex];
  const isCorrect = volgordeOrder.every((item, i) => item === q.juiste_volgorde[i]);

  // Color items
  const items = document.querySelectorAll('.volgorde-item');
  items.forEach((item, i) => {
    if (volgordeOrder[i] === q.juiste_volgorde[i]) item.classList.add('correct-pos');
    else item.classList.add('wrong-pos');
    item.querySelectorAll('button').forEach(b => b.disabled = true);
  });
  document.querySelector('.btn-submit-volgorde').style.display = 'none';

  // Show correct order if wrong
  if (!isCorrect) {
    const correctDiv = document.createElement('div');
    correctDiv.className = 'invul-correct-answer';
    correctDiv.textContent = 'Juiste volgorde: ' + q.juiste_volgorde.map((s, i) => `${i + 1}. ${s}`).join(' → ');
    correctDiv.style.marginTop = '8px';
    correctDiv.style.fontSize = '0.85rem';
    correctDiv.style.lineHeight = '1.5';
    document.getElementById('options-container').appendChild(correctDiv);
  }

  recordAnswer(isCorrect, q);
  showFeedback(isCorrect, q);
}

// ── Record answer & feedback ──
function recordAnswer(isCorrect, q) {
  answers.push({ question: q, correct: isCorrect });
  // Save immediately to progress
  const p = getProgress();
  if (!p.questionHistory[q.id]) p.questionHistory[q.id] = [];
  p.questionHistory[q.id].push(isCorrect);
  // Keep last 5
  if (p.questionHistory[q.id].length > 5) p.questionHistory[q.id] = p.questionHistory[q.id].slice(-5);
  p.totalAnswered++;
  if (isCorrect) p.totalCorrect++;
  saveProgress(p);
}

function showFeedback(isCorrect, q) {
  const panel = document.getElementById('feedback-panel');
  panel.style.display = 'block';

  const result = document.getElementById('feedback-result');
  result.textContent = isCorrect ? 'Goed!' : 'Helaas, fout!';
  result.className = 'feedback-result ' + (isCorrect ? 'correct' : 'wrong');

  const msgs = isCorrect ? CORRECT_MSGS : WRONG_MSGS;
  document.getElementById('feedback-encouragement').textContent = msgs[Math.floor(Math.random() * msgs.length)];
  document.getElementById('feedback-explanation').textContent = q.uitleg;

  const btn = document.getElementById('btn-next');
  btn.textContent = currentIndex < quizQuestions.length - 1 ? 'Volgende' : 'Bekijk resultaten';

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Next question / results ──
function nextQuestion() {
  currentIndex++;
  if (currentIndex < quizQuestions.length) {
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    showResults();
  }
}

// ── Save quiz progress on exit ──
function saveQuizProgress() {
  // Already saved per-question in recordAnswer, nothing extra needed
}

// ── Results ──
function showResults() {
  showScreen('results');
  const total = answers.length;
  const correct = answers.filter(a => a.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Score circle animation
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;
  const fg = document.getElementById('score-fg');
  fg.style.strokeDasharray = circumference;
  fg.style.strokeDashoffset = circumference;
  setTimeout(() => { fg.style.strokeDashoffset = offset; }, 50);

  // Color based on score
  if (pct >= 80) fg.style.stroke = 'var(--green)';
  else if (pct >= 50) fg.style.stroke = 'var(--orange)';
  else fg.style.stroke = 'var(--red)';

  document.getElementById('score-text').textContent = pct + '%';
  document.getElementById('results-summary').textContent = `${correct} van ${total} vragen goed`;

  // Encouragement
  let msgKey = 'low';
  if (pct === 100) msgKey = 'perfect';
  else if (pct >= 80) msgKey = 'great';
  else if (pct >= 60) msgKey = 'good';
  else if (pct >= 40) msgKey = 'okay';
  const msgs = RESULTS_MSGS[msgKey];
  document.getElementById('results-encouragement').textContent = msgs[Math.floor(Math.random() * msgs.length)];

  // Per-leerdoel breakdown
  const breakdown = document.getElementById('results-leerdoel-breakdown');
  breakdown.innerHTML = '';
  const leerdoelMap = {};
  for (const a of answers) {
    const lid = a.question.leerdoel_id;
    if (!leerdoelMap[lid]) leerdoelMap[lid] = { title: a.question.leerdoel_titel, correct: 0, total: 0 };
    leerdoelMap[lid].total++;
    if (a.correct) leerdoelMap[lid].correct++;
  }
  for (const [lid, data] of Object.entries(leerdoelMap)) {
    const p = Math.round((data.correct / data.total) * 100);
    const color = p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--orange)' : 'var(--red)';
    breakdown.innerHTML += `
      <div class="breakdown-row">
        <span class="breakdown-label">${data.title}</span>
        <div class="breakdown-bar"><div class="breakdown-bar-fill" style="width:${p}%;background:${color}"></div></div>
        <span class="breakdown-pct">${p}%</span>
      </div>
    `;
  }

  // Missed questions
  const missed = document.getElementById('results-missed-list');
  missed.innerHTML = '';
  const wrongAnswers = answers.filter(a => !a.correct);
  if (wrongAnswers.length === 0) {
    missed.innerHTML = '<div style="color:var(--green);font-weight:600;">Alles goed! Geen gemiste vragen.</div>';
  } else {
    for (const a of wrongAnswers) {
      let correctText = '';
      const q = a.question;
      if (q.type === 'multiple_choice') correctText = q.opties[q.juiste_antwoord];
      else if (q.type === 'choose_all_that_apply') correctText = q.juiste_antwoorden.map(i => q.opties[i]).join(', ');
      else if (q.type === 'invullen') correctText = q.juiste_antwoord;
      else if (q.type === 'volgorde') correctText = q.juiste_volgorde.join(' → ');
      missed.innerHTML += `
        <div class="missed-item">
          <div class="missed-q">${q.vraag}</div>
          <div class="missed-a">Antwoord: ${correctText}</div>
        </div>
      `;
    }
  }

  // Check for new badges
  checkNewBadges();

  // Confetti if good score
  if (pct >= 80) spawnConfetti();
}

// ── Badges ──
function checkNewBadges() {
  const p = getProgress();
  const newBadges = [];
  for (const ld of db.leerdoelen) {
    const m = getLeerdoelMastery(ld.leerdoel_id);
    const alreadyEarned = p.badges[ld.leerdoel_id]?.earned;
    if (!alreadyEarned && m.pct >= 80 && m.seen >= Math.ceil(m.total * 0.6)) {
      if (!p.badges[ld.leerdoel_id]) p.badges[ld.leerdoel_id] = {};
      p.badges[ld.leerdoel_id].earned = true;
      p.badges[ld.leerdoel_id].date = new Date().toISOString().slice(0, 10);
      newBadges.push(ld.leerdoel_id);
    }
  }
  if (newBadges.length > 0) {
    saveProgress(p);
    const container = document.getElementById('new-badges-container');
    const list = document.getElementById('new-badges-list');
    container.style.display = 'block';
    list.innerHTML = '';
    for (const bid of newBadges) {
      const b = BADGES[bid];
      list.innerHTML += `<div class="new-badge-item"><div class="new-badge-emoji">${b.emoji}</div><div class="new-badge-name">${b.name}</div></div>`;
    }
  } else {
    document.getElementById('new-badges-container').style.display = 'none';
  }
}

function updateBadgeShelf() {
  const p = getProgress();
  const shelf = document.getElementById('badge-shelf-list');
  shelf.innerHTML = '';
  for (const [id, b] of Object.entries(BADGES)) {
    const earned = p.badges[id]?.earned;
    shelf.innerHTML += `
      <div class="badge-item ${earned ? 'earned' : 'locked'}" ${earned ? `onclick="showBadgePopup(${id})"` : ''}>
        <span class="badge-emoji">${b.emoji}</span>
        <span class="badge-name">${b.name}</span>
      </div>
    `;
  }
}

function showBadgePopup(id) {
  const b = BADGES[id];
  const p = getProgress();
  document.getElementById('badge-popup-icon').textContent = b.emoji;
  document.getElementById('badge-popup-title').textContent = b.name;
  document.getElementById('badge-popup-desc').textContent = `Verdiend op ${p.badges[id]?.date || 'onbekend'}`;
  document.getElementById('badge-overlay').style.display = 'flex';
}

function closeBadgeOverlay() {
  document.getElementById('badge-overlay').style.display = 'none';
}

// ── Home stats ──
function updateHomeStats() {
  const p = getProgress();
  const el = document.getElementById('home-stats');
  if (p.totalAnswered === 0) {
    el.textContent = 'Begin met een quiz om je voortgang te zien!';
  } else {
    const pct = Math.round((p.totalCorrect / p.totalAnswered) * 100);
    const badgeCount = Object.values(p.badges).filter(b => b.earned).length;
    el.textContent = `${p.totalAnswered} vragen beantwoord \u2022 ${pct}% goed \u2022 ${badgeCount}/9 badges`;
  }
}

// ── Progress screen ──
function renderProgressScreen() {
  const p = getProgress();

  // Overall
  const overall = document.getElementById('overall-progress');
  if (p.totalAnswered === 0) {
    overall.innerHTML = '<div class="overall-pct">-</div><div class="overall-detail">Nog geen vragen beantwoord</div>';
  } else {
    const pct = Math.round((p.totalCorrect / p.totalAnswered) * 100);
    overall.innerHTML = `
      <div class="overall-pct">${pct}%</div>
      <div class="overall-detail">${p.totalCorrect} van ${p.totalAnswered} vragen goed</div>
    `;
  }

  // Per leerdoel
  const list = document.getElementById('leerdoel-progress-list');
  list.innerHTML = '';
  for (const ld of db.leerdoelen) {
    const m = getLeerdoelMastery(ld.leerdoel_id);
    const badge = BADGES[ld.leerdoel_id];
    const earned = p.badges[ld.leerdoel_id]?.earned;
    const color = m.pct >= 80 ? 'var(--green)' : m.pct >= 50 ? 'var(--orange)' : m.seen > 0 ? 'var(--red)' : 'var(--gray-border)';

    list.innerHTML += `
      <div class="progress-card">
        <div class="progress-card-header">
          <span class="progress-card-title">${ld.leerdoel_titel}</span>
          <span class="progress-card-badge">${earned ? badge.emoji : ''}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width:${m.pct}%;background:${color}"></div>
        </div>
        <div class="progress-card-detail">
          <span>${m.pct}% beheersing</span>
          <span>${m.seen}/${m.total} vragen gezien</span>
        </div>
      </div>
    `;
  }
}

// ── Flashcards ──
function startFlashcards() {
  // Build flashcards from weak leerdoelen
  flashcards = [];
  for (const ld of db.leerdoelen) {
    const m = getLeerdoelMastery(ld.leerdoel_id);
    // Show flashcards for leerdoelen that are not yet mastered (<80%) or never seen
    if (m.pct < 80 || m.seen === 0) {
      flashcards.push({
        front: ld.leerdoel_titel,
        back: ld.uitleg_tekst
      });
      // Also add subdoelen
      for (const sd of ld.subdoelen) {
        // Find a representative question for the subdoel
        const questions = allQuestions.filter(q => q.subdoel_id === sd.subdoel_id);
        if (questions.length > 0) {
          const weakQs = questions.filter(q => getQuestionPriority(q.id) < 3);
          if (weakQs.length > 0) {
            flashcards.push({
              front: sd.subdoel_titel,
              back: weakQs[0].uitleg
            });
          }
        }
      }
    }
  }

  showScreen('flashcards');
  if (flashcards.length === 0) {
    document.getElementById('flash-empty').style.display = 'block';
    document.getElementById('flashcard-container').style.display = 'none';
    document.querySelector('.flash-nav').style.display = 'none';
    document.getElementById('flash-hint').style.display = 'none';
    document.getElementById('flash-counter').textContent = '';
  } else {
    document.getElementById('flash-empty').style.display = 'none';
    document.getElementById('flashcard-container').style.display = 'block';
    document.querySelector('.flash-nav').style.display = 'flex';
    document.getElementById('flash-hint').style.display = 'block';
    flashIndex = 0;
    flashFlipped = false;
    renderFlashcard();
  }
}

function renderFlashcard() {
  const card = flashcards[flashIndex];
  document.getElementById('flashcard-front').textContent = card.front;
  document.getElementById('flashcard-back').textContent = card.back;
  document.getElementById('flashcard').classList.remove('flipped');
  flashFlipped = false;
  document.getElementById('flash-counter').textContent = `${flashIndex + 1} / ${flashcards.length}`;
  document.getElementById('btn-flash-prev').disabled = flashIndex === 0;
  document.getElementById('btn-flash-next').disabled = flashIndex === flashcards.length - 1;
}

function flipCard() {
  flashFlipped = !flashFlipped;
  document.getElementById('flashcard').classList.toggle('flipped', flashFlipped);
}

function nextFlashcard() {
  if (flashIndex < flashcards.length - 1) { flashIndex++; renderFlashcard(); }
}

function prevFlashcard() {
  if (flashIndex > 0) { flashIndex--; renderFlashcard(); }
}

// ── Confetti ──
function spawnConfetti() {
  const colors = ['#7c3aed', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    el.style.animationDelay = Math.random() * 0.5 + 's';
    el.style.width = (6 + Math.random() * 8) + 'px';
    el.style.height = (6 + Math.random() * 8) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}
