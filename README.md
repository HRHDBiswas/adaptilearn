# AdaptiLearn — AI-Based Adaptive Quiz Interface

AdaptiLearn is a small, self-contained web app built for the HCI course
assignment on AI-based adaptive human-computer interaction. It is a quiz
on HCI fundamentals whose **difficulty** and whose **layout** both adapt
at runtime to the individual user, with no page reload and no server.

## Run it

No build step and no dependencies. Open `index.html` in any modern
browser, or serve the folder locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## How the adaptation works

### 1. Content-level adaptation (which question is asked)

`app.js` implements a lightweight **Elo rating system** — the same
mathematical model used for chess ratings (Elo, 1978) and, in spirit,
by computerized adaptive testing systems. Every question starts with a
difficulty rating; the user starts with an ability rating of 1200. After
each answer:

- Both ratings move toward each other or apart, depending on whether the
  result was "surprising" (e.g., a correct answer on a question much
  harder than the user's current rating moves the user's rating up a
  lot; a correct answer on an easy question barely moves it).
- The next question is chosen to be as close as possible to the user's
  *current* rating, so the quiz gets harder or easier in real time.

This mirrors the probabilistic user-modeling idea behind Intelligent
Tutoring Systems' knowledge tracing (Corbett & Anderson, 1995), simplified
down to one scalar per user and per item so it is auditable in a few
lines of code.

### 2. Interface-level adaptation (how the question is presented)

Independent of *which* question is shown, the app watches two behavioral
signals as a proxy for cognitive load:

- a streak of consecutive wrong answers, and
- a response-time spike relative to the user's own rolling average.

When either crosses a threshold, the interface switches into **Focus
Mode**: the statistics side panel disappears, option buttons grow, and
font sizes increase — reducing the amount the user has to process at
once. When the user is on a strong correct streak and has a high ability
rating, the interface switches into **Expert Mode** and surfaces more
information density instead. This is the layer that corresponds to
"adaptive graphical user interfaces" in the HCI literature (Gajos et al.,
2006; Findlater & Gajos, 2009) — the chrome of the interface itself
changes, not just its content.

### 3. Persistence

Both the ability rating and the per-question difficulty ratings are
saved to `localStorage`, so the "model" of the user survives a page
reload. This is what makes it a system that adapts over time rather
than a one-off randomized quiz.

## Project structure

```
adaptilearn/
├── index.html      UI shell
├── style.css       Styling + the two adaptive layout states
├── questions.js     The question bank, with initial Elo ratings
├── app.js          Elo engine, mode inference, rendering, persistence
└── README.md
```

## Disclosure of AI-based tool use

In keeping with the assignment requirement to disclose AI assistance:

- **Claude (Anthropic), Sonnet 5, accessed November 2026**, was used
  to help plan the project's architecture, scaffold the HTML/CSS/JS
  files, and draft portions of the in-code comments and this README.
  The adaptive-engine design (which signals to track, how to combine a
  difficulty-tracking loop with a separate interface-density loop) was
  specified by the author and implemented with Claude's assistance; no
  third-party question-bank content, textbook exercises, or copyrighted
  source code were copied in. All quiz questions were written originally
  for this assignment.
- No other AI code-generation tool (e.g., GitHub Copilot) was used.

## References

Corbett, A. T., & Anderson, J. R. (1995). Knowledge tracing: Modeling the
acquisition of procedural knowledge. *User Modeling and User-Adapted
Interaction, 4*(4), 253–278. https://doi.org/10.1007/BF01099821

Elo, A. E. (1978). *The rating of chess players, past and present*. Arco
Publishing.

Findlater, L., & Gajos, K. Z. (2009). Design space and evaluation
challenges of adaptive graphical user interfaces. *AI Magazine, 30*(4),
68–73. https://doi.org/10.1609/aimag.v30i4.2271

Gajos, K. Z., Czerwinski, M., Tan, D. S., & Weld, D. S. (2006). Exploring
the design space for adaptive graphical user interfaces. *Proceedings of
the Working Conference on Advanced Visual Interfaces (AVI '06)*, 201–208.
https://doi.org/10.1145/1133265.1133306
