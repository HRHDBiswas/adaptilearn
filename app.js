/**
 * app.js
 * AdaptiLearn — AI-Based Adaptive Quiz Interface
 *
 * -------------------------------------------------------------------
 * WHAT MAKES THIS "ADAPTIVE" AND "AI-BASED"
 * -------------------------------------------------------------------
 * Two separate adaptation loops run on top of each other:
 *
 * 1. CONTENT-LEVEL ADAPTATION (item selection)
 *    A lightweight Elo rating system (the same mathematical model
 *    used in chess ratings and in several computerized adaptive
 *    testing systems) maintains a running "ability estimate" for the
 *    user and a "difficulty estimate" for every question. After each
 *    answer, both numbers are updated based on how surprising the
 *    result was. The next question is then chosen to be close to the
 *    user's current estimated ability -- this is a simple, auditable
 *    stand-in for the kind of probabilistic user model used in
 *    Intelligent Tutoring Systems (Corbett & Anderson, 1995).
 *
 * 2. INTERFACE-LEVEL ADAPTATION (layout / density)
 *    Independently of what question is shown, the app watches two
 *    behavioral signals -- an incorrect-answer streak and a drop in
 *    response speed -- as a proxy for rising cognitive load. When
 *    both cross a threshold, the UI switches into "Focus Mode": the
 *    side panel disappears, buttons grow, and visual noise drops.
 *    When the user is doing unusually well, the UI switches into
 *    "Expert Mode" and surfaces more information density. This is
 *    the layer most directly comparable to the adaptive GUIs
 *    described by Gajos et al. (2006) and Findlater & Gajos (2009):
 *    the interface itself -- not just the content -- reorganizes in
 *    response to inferred user state.
 *
 * All state is persisted to localStorage, so the "model" the app has
 * of the user survives a page reload, which is what makes this an
 * adaptive SYSTEM rather than a one-off quiz.
 * -------------------------------------------------------------------
 */

const STORAGE_KEY = "adaptilearn_profile_v1";
const K_FACTOR = 32; // Elo sensitivity constant

/** Default profile shape. */
function defaultProfile() {
  return {
    rating: 1200,
    answered: 0,
    correct: 0,
    streakCorrect: 0,
    streakWrong: 0,
    lastAnswerMs: null,
    avgAnswerMs: null,
    seenIds: [],
    itemRatings: {}, // per-question rating overrides, learned over time
    mode: "standard",
  };
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw);
    return { ...defaultProfile(), ...parsed };
  } catch (e) {
    console.warn("AdaptiLearn: could not read saved profile, starting fresh.", e);
    return defaultProfile();
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("AdaptiLearn: could not persist profile.", e);
  }
}

let profile = loadProfile();
let currentQuestion = null;
let questionStartTime = null;

/** Returns the working difficulty rating for a question (learned override, else bank default). */
function ratingFor(question) {
  return profile.itemRatings[question.id] ?? question.rating;
}

/** Standard Elo expected-score formula. */
function expectedScore(a, b) {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

/**
 * Picks the next question whose current difficulty rating is closest
 * to the user's ability estimate, preferring items not seen recently.
 * This is a deliberately simple stand-in for the item-selection step
 * of a computerized adaptive test.
 */
function pickNextQuestion() {
  const unseen = QUESTION_BANK.filter(q => !profile.seenIds.includes(q.id));
  const pool = unseen.length > 0 ? unseen : QUESTION_BANK; // recycle once exhausted
  pool.sort((a, b) => Math.abs(ratingFor(a) - profile.rating) - Math.abs(ratingFor(b) - profile.rating));
  return pool[0];
}

/** Updates both the user's and the question's rating after an answer. */
function updateRatings(question, wasCorrect) {
  const qRating = ratingFor(question);
  const expected = expectedScore(profile.rating, qRating);
  const actual = wasCorrect ? 1 : 0;

  const newUserRating = Math.round(profile.rating + K_FACTOR * (actual - expected));
  const newItemRating = Math.round(qRating + K_FACTOR * ((1 - actual) - (1 - expected)));

  profile.rating = newUserRating;
  profile.itemRatings[question.id] = newItemRating;
}

/** Infers UI mode from behavioral signals. Pure function of profile state. */
function inferMode() {
  if (profile.streakWrong >= 2) return "focus";
  if (
    profile.avgAnswerMs &&
    profile.lastAnswerMs &&
    profile.lastAnswerMs > profile.avgAnswerMs * 1.6
  ) {
    return "focus";
  }
  if (profile.streakCorrect >= 3 && profile.rating > 1300) return "expert";
  return "standard";
}

function applyModeToDOM(mode) {
  const app = document.getElementById("app");
  const badge = document.getElementById("modeBadge");
  app.dataset.mode = mode;
  const labels = { standard: "Standard Mode", focus: "Focus Mode", expert: "Expert Mode" };
  badge.textContent = labels[mode] || "Standard Mode";
}

function renderStats() {
  document.getElementById("statRating").textContent = profile.rating;
  document.getElementById("statCount").textContent = profile.answered;
  const acc = profile.answered > 0 ? Math.round((profile.correct / profile.answered) * 100) : null;
  document.getElementById("statAccuracy").textContent = acc === null ? "—" : `${acc}%`;
  document.getElementById("statStreak").textContent =
    profile.streakCorrect > 0 ? `+${profile.streakCorrect}` : profile.streakWrong > 0 ? `-${profile.streakWrong}` : "0";
}

function renderQuestion(question) {
  currentQuestion = question;
  questionStartTime = performance.now();

  document.getElementById("difficultyLabel").textContent = `Difficulty: ${ratingFor(question)}`;
  document.getElementById("questionText").textContent = question.text;
  document.getElementById("feedback").textContent = "";
  document.getElementById("nextBtn").style.display = "none";

  const list = document.getElementById("optionsList");
  list.innerHTML = "";
  question.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optText;
    btn.addEventListener("click", () => handleAnswer(idx));
    list.appendChild(btn);
  });
}

function handleAnswer(selectedIdx) {
  const elapsed = performance.now() - questionStartTime;
  const wasCorrect = selectedIdx === currentQuestion.correct;

  // Lock options, show correctness.
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === currentQuestion.correct) btn.classList.add("correct");
    else if (idx === selectedIdx) btn.classList.add("incorrect");
  });

  // Update rolling response-time average (simple exponential moving average).
  profile.avgAnswerMs = profile.avgAnswerMs === null ? elapsed : profile.avgAnswerMs * 0.7 + elapsed * 0.3;
  profile.lastAnswerMs = elapsed;

  // Update accuracy + streak counters.
  profile.answered += 1;
  if (wasCorrect) {
    profile.correct += 1;
    profile.streakCorrect += 1;
    profile.streakWrong = 0;
  } else {
    profile.streakWrong += 1;
    profile.streakCorrect = 0;
  }

  // Content-level adaptation.
  updateRatings(currentQuestion, wasCorrect);
  if (!profile.seenIds.includes(currentQuestion.id)) profile.seenIds.push(currentQuestion.id);

  // Interface-level adaptation.
  const mode = inferMode();
  profile.mode = mode;
  applyModeToDOM(mode);

  const feedback = document.getElementById("feedback");
  feedback.textContent = wasCorrect
    ? "Correct. Ability estimate updated upward."
    : `Not quite. The correct answer was: "${currentQuestion.options[currentQuestion.correct]}"`;

  document.getElementById("nextBtn").style.display = "inline-block";
  renderStats();
  saveProfile(profile);
}

function nextQuestion() {
  const q = pickNextQuestion();
  renderQuestion(q);
}

function resetProfile() {
  profile = defaultProfile();
  saveProfile(profile);
  applyModeToDOM(profile.mode);
  renderStats();
  nextQuestion();
}

// ---- wire up ----
document.getElementById("nextBtn").addEventListener("click", nextQuestion);
document.getElementById("resetBtn").addEventListener("click", resetProfile);

applyModeToDOM(profile.mode);
renderStats();
nextQuestion();
