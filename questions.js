/**
 * questions.js
 *
 * Static question bank for AdaptiLearn. Each item carries an initial
 * Elo-style "rating" that represents the engine's starting belief about
 * the item's difficulty. These ratings move over time as real users
 * answer the questions (see app.js -> updateRatings()), so the bank
 * becomes more accurate the more it is used — the same self-improving
 * property that calibrated item banks in computerized adaptive testing
 * rely on (Corbett & Anderson, 1995).
 *
 * All question content below is original, written for this assignment.
 */

const QUESTION_BANK = [
  { id: "q1",  rating: 1000, text: "What does the acronym 'UI' stand for?",
    options: ["User Interface", "Unified Interaction", "Usability Index", "User Intelligence"], correct: 0 },

  { id: "q2",  rating: 1050, text: "An adaptive user interface changes mainly in response to:",
    options: ["The device's battery level only", "Observed user behavior and context", "A fixed schedule set by the developer", "Random selection at each load"], correct: 1 },

  { id: "q3",  rating: 1100, text: "Which of these is the best example of an 'adaptable' (not adaptive) interface?",
    options: ["A menu that reorders itself automatically based on usage", "A settings page where the user manually pins favorite tools", "A page that changes font size based on inferred reading speed", "A chatbot that rewrites its own answers without being asked"], correct: 1 },

  { id: "q4",  rating: 1150, text: "In HCI, 'cognitive load' refers to:",
    options: ["The electrical load on a device's CPU", "The amount of mental effort required to use an interface", "The number of pixels rendered per second", "The size of a database query"], correct: 1 },

  { id: "q5",  rating: 1200, text: "Which concept is most closely associated with Intelligent User Interfaces (IUIs)?",
    options: ["Static layout grids", "Reasoning about user goals and intent", "Fixed color palettes", "Manual-only configuration"], correct: 1 },

  { id: "q6",  rating: 1250, text: "A system that tracks a user's accuracy and speeds up or slows down question difficulty accordingly is using a technique most similar to:",
    options: ["A static FAQ page", "Computerized adaptive testing", "A print layout engine", "A spellchecker"], correct: 1 },

  { id: "q7",  rating: 1300, text: "Which of the following is a commonly cited RISK of adaptive interfaces?",
    options: ["They are always faster than static interfaces", "They can disorient users when layout changes unpredictably", "They eliminate the need for any user testing", "They cannot be personalized"], correct: 1 },

  { id: "q8",  rating: 1350, text: "In an Elo-style rating update, if a user answers a harder-than-expected question correctly, their rating should:",
    options: ["Decrease sharply", "Stay exactly the same", "Increase, by more than it would for an easy correct answer", "Reset to the default"], correct: 2 },

  { id: "q9",  rating: 1400, text: "Which pairing correctly matches an HCI term with its definition?",
    options: ["Affordance — a visual effect with no functional meaning", "Mixed-initiative interaction — both user and system can initiate actions", "Direct manipulation — interacting only through voice commands", "Heuristic evaluation — a method requiring real end users"], correct: 1 },

  { id: "q10", rating: 1450, text: "A key difference between personalization and adaptation is that personalization:",
    options: ["Always happens automatically with no user input", "Often relies on explicit user-provided preferences, while adaptation infers them", "Only applies to color themes", "Is a subtype of accessibility testing, not HCI"], correct: 1 },
];
