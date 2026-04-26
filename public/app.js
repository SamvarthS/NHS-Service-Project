const questionInput = document.querySelector("#question");
const explainButton = document.querySelector("#explainButton");
const answerButton = document.querySelector("#answerButton");
const clearButton = document.querySelector("#clearButton");
const selfSolveButton = document.querySelector("#selfSolveButton");
const backButton = document.querySelector("#backButton");
const composeButton = document.querySelector("#composeButton");
const themeToggle = document.querySelector("#themeToggle");
const aboutButton = document.querySelector("#aboutButton");
const accessButton = document.querySelector("#accessButton");
const projectButton = document.querySelector("#projectButton");
const inputPill = document.querySelector("#inputPill");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const answerCard = document.querySelector("#answerCard");
const selfSolveMessage = document.querySelector("#selfSolveMessage");
const modeDescription = document.querySelector("#modeDescription");
const modePill = document.querySelector("#modePill");
const recentChats = document.querySelector("#recentChats");
const mathInputPanel = document.querySelector("#mathInputPanel");
const mathInputModeLabel = document.querySelector("#mathInputModeLabel");
const mathGrid = document.querySelector("#mathGrid");
const modalOverlay = document.querySelector("#modalOverlay");
const modalTitle = document.querySelector("#modalTitle");
const modalBody = document.querySelector("#modalBody");
const closeModalButton = document.querySelector("#closeModalButton");
const modeTabs = [...document.querySelectorAll(".mode-tab")];
const menuItems = [...document.querySelectorAll(".menu-item")];

const problemType = document.querySelector("#problemType");
const summary = document.querySelector("#summary");
const whatToNotice = document.querySelector("#whatToNotice");
const strategy = document.querySelector("#strategy");
const checkpoints = document.querySelector("#checkpoints");
const encouragement = document.querySelector("#encouragement");
const followUpQuestion = document.querySelector("#followUpQuestion");
const finalAnswer = document.querySelector("#finalAnswer");
const workedSolution = document.querySelector("#workedSolution");
const verification = document.querySelector("#verification");
const nextStep = document.querySelector("#nextStep");

const chatStorageKey = "nhs-math-tutor-recent-chats";
const themeStorageKey = "nhs-math-tutor-theme";
const maxRecentChats = 6;
const modeDetails = {
  "Math Tutor": {
    description:
      "Math Tutor is active. Ask any math question for guided help without revealing the final answer right away.",
    placeholder: "Type a math question here..."
  },
  Algebra: {
    description:
      "Algebra mode is active. Use this for equations, expressions, factoring, and solving for variables.",
    placeholder: "Example: Factor x^2 + 7x + 12"
  },
  Geometry: {
    description:
      "Geometry mode is active. Use this for angles, triangles, circles, area, perimeter, and proofs.",
    placeholder: "Example: Find the area of a triangle with base 12 and height 9"
  },
  Calculus: {
    description:
      "Calculus mode is active. Use this for derivatives, limits, integrals, and rate-of-change questions.",
    placeholder: "Example: Find the derivative of x^3 sin(x)"
  }
};
const mathKeysets = {
  "Math Tutor": [
    { label: "x^y", insert: "^" },
    { label: "√x", template: "sqrt" },
    { label: "a/b", template: "frac" },
    { label: "π", insert: "pi" },
    { label: "θ", insert: "theta" },
    { label: "∞", insert: "infinity" },
    { label: "≤", insert: "<=" },
    { label: "≥", insert: ">=" },
    { label: "≠", insert: "!=" },
    { label: "±", insert: "+/-" },
    { label: "×", insert: "*" },
    { label: "÷", insert: "/" }
  ],
  Algebra: [
    { label: "x", insert: "x" },
    { label: "y", insert: "y" },
    { label: "a/b", template: "frac" },
    { label: "x^y", insert: "^" },
    { label: "√x", template: "sqrt" },
    { label: "|x|", template: "abs" },
    { label: "sin", insert: "sin()" },
    { label: "cos", insert: "cos()" },
    { label: "tan", insert: "tan()" },
    { label: "≤", insert: "<=" },
    { label: "≥", insert: ">=" },
    { label: "≠", insert: "!=" }
  ],
  Geometry: [
    { label: "△", insert: "triangle " },
    { label: "∠", insert: "angle " },
    { label: "°", insert: " degrees" },
    { label: "π", insert: "pi" },
    { label: "r", insert: "r" },
    { label: "a/b", template: "frac" },
    { label: "√x", template: "sqrt" },
    { label: "sin", insert: "sin()" },
    { label: "cos", insert: "cos()" },
    { label: "tan", insert: "tan()" },
    { label: "⊥", insert: " perpendicular to " },
    { label: "∥", insert: " parallel to " }
  ],
  Calculus: [
    { label: "d/dx", template: "derivative" },
    { label: "∫", template: "integral" },
    { label: "lim", template: "limit" },
    { label: "Σ", template: "series" },
    { label: "Δx", insert: "delta x" },
    { label: "x→a", insert: "x->" },
    { label: "x^y", insert: "^" },
    { label: "e^x", insert: "e^()" },
    { label: "ln", insert: "ln()" },
    { label: "sin", insert: "sin()" },
    { label: "cos", insert: "cos()" },
    { label: "∞", insert: "infinity" }
  ]
};

let currentQuestion = "";
let currentMode = "Math Tutor";
let recentChatItems = loadRecentChats();
let isMathInputOpen = false;

initialize();

explainButton.addEventListener("click", async () => {
  const question = questionInput.value.trim();

  if (!question) {
    setStatus("Please type a math problem first.", true);
    questionInput.focus();
    return;
  }

  setLoadingState(true);
  selfSolveMessage.classList.add("hidden");
  answerCard.classList.add("hidden");

  try {
    const data = await postJson("/api/tutor/explain", { question: `[${currentMode}] ${question}` });
    currentQuestion = question;
    renderExplanation(data);
    saveRecentChat(question);
    setStatus("Method ready. Choose whether you want the answer or want to solve it yourself.");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setLoadingState(false);
  }
});

answerButton.addEventListener("click", async () => {
  if (!currentQuestion) {
    setStatus("Ask for an explanation first so the tutor knows which problem to solve.", true);
    return;
  }

  answerButton.disabled = true;
  answerButton.textContent = "Getting Answer...";

  try {
    const data = await postJson("/api/tutor/answer", {
      question: `[${currentMode}] ${currentQuestion}`
    });
    renderAnswer(data);
    setStatus("Answer revealed.");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    answerButton.disabled = false;
    answerButton.textContent = "Show Me The Answer";
  }
});

selfSolveButton.addEventListener("click", () => {
  selfSolveMessage.classList.remove("hidden");
  answerCard.classList.add("hidden");
  setStatus("You've got this. Try solving it, then come back if you want the answer.");
});

clearButton.addEventListener("click", () => {
  resetComposer("Ready when you are.");
});

composeButton.addEventListener("click", () => {
  resetComposer("Started a new tutor session.");
});

backButton.addEventListener("click", () => {
  if (recentChatItems.length === 0) {
    setStatus("There isn't a previous chat to reopen yet.", true);
    return;
  }

  loadChat(recentChatItems[0].question, recentChatItems[0].mode);
  setStatus("Loaded your most recent tutor session.");
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("theme-light") ? "dark" : "light";
  applyTheme(nextTheme);
  localStorage.setItem(themeStorageKey, nextTheme);
});

aboutButton.addEventListener("click", () => {
  openModal(
    "About This Project",
    "This tutor was built for the Samvarth Seegehalli NHS service project. It explains how to solve a problem first, then lets Jasper High School students decide whether to reveal the answer."
  );
});

accessButton.addEventListener("click", () => {
  openModal(
    "Student Access",
    "This app is intended only for Jasper High School students. Use it for guided learning, check your understanding, and reveal answers only when you are ready."
  );
});

projectButton.addEventListener("click", () => {
  openModal(
    "NHS Service Project",
    "The goal of this project is to support students with clearer math help: concept first, strategy second, answer last."
  );
});

inputPill.addEventListener("click", () => {
  isMathInputOpen = !isMathInputOpen;
  syncMathInputPanel();
});

closeModalButton.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setMode(tab.dataset.mode || "Math Tutor");
  });
});

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    activateMenu(item.dataset.menu || "sessions");
  });
});

questionInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    explainButton.click();
  }
});

function renderExplanation(data) {
  results.classList.remove("hidden");

  problemType.textContent = data.problemType;
  summary.textContent = data.summary;
  encouragement.textContent = data.encouragement;
  followUpQuestion.textContent = data.followUpQuestion;

  renderList(whatToNotice, data.whatToNotice);
  renderList(strategy, data.strategy);
  renderList(checkpoints, data.checkpoints);
}

function renderAnswer(data) {
  answerCard.classList.remove("hidden");
  selfSolveMessage.classList.add("hidden");

  finalAnswer.textContent = data.finalAnswer;
  nextStep.textContent = data.nextStep;

  renderList(workedSolution, data.workedSolution);
  renderList(verification, data.verification);
}

function renderList(element, items) {
  element.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}

function setLoadingState(isLoading) {
  explainButton.disabled = isLoading;
  answerButton.disabled = isLoading;
  explainButton.textContent = isLoading ? "Thinking..." : "Explain First";
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#b42318" : "";
}

function initialize() {
  applyTheme(localStorage.getItem(themeStorageKey) || "dark");
  renderRecentChats();
  setMode(currentMode);
  syncMathInputPanel();
  setStatus("");
}

function resetComposer(message) {
  questionInput.value = "";
  currentQuestion = "";
  results.classList.add("hidden");
  answerCard.classList.add("hidden");
  selfSolveMessage.classList.add("hidden");
  setStatus(message);
  questionInput.focus();
}

function setMode(mode) {
  currentMode = modeDetails[mode] ? mode : "Math Tutor";
  const details = modeDetails[currentMode];

  modeDescription.textContent = details.description;
  modePill.textContent = `Mode: ${currentMode}`;
  questionInput.placeholder = details.placeholder;
  renderMathKeys();

  modeTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mode === currentMode);
  });
}

function activateMenu(menu) {
  menuItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.menu === menu);
  });

  if (menu === "sessions") {
    setStatus("Tutor Sessions selected. Ask a problem or reopen a recent chat.");
    questionInput.focus();
    return;
  }

  if (menu === "practice") {
    setMode("Algebra");
    questionInput.value = "Give me a practice problem on solving linear equations.";
    setStatus("Practice Sets selected. I filled in a starter prompt you can send.");
    questionInput.focus();
  }
}

function saveRecentChat(question) {
  const entry = {
    id: crypto.randomUUID(),
    question,
    mode: currentMode,
    timestamp: Date.now()
  };

  recentChatItems = [
    entry,
    ...recentChatItems.filter((item) => item.question !== question)
  ].slice(0, maxRecentChats);

  localStorage.setItem(chatStorageKey, JSON.stringify(recentChatItems));
  renderRecentChats();
}

function renderRecentChats() {
  if (recentChatItems.length === 0) {
    recentChats.innerHTML = '<p class="sidebar-muted">No chats yet</p>';
    return;
  }

  recentChats.innerHTML = "";

  recentChatItems.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-chat-button";
    button.innerHTML = `
      <span class="recent-chat-title">${escapeHtml(truncate(item.question, 42))}</span>
      <span class="recent-chat-meta">${escapeHtml(item.mode)} • ${formatTime(item.timestamp)}</span>
    `;
    button.addEventListener("click", () => {
      loadChat(item.question, item.mode);
      setStatus("Recent chat loaded.");
    });
    recentChats.appendChild(button);
  });
}

function loadChat(question, mode = currentMode) {
  setMode(mode);
  questionInput.value = question;
  questionInput.focus();
}

function syncMathInputPanel() {
  mathInputPanel.classList.toggle("hidden", !isMathInputOpen);
  inputPill.classList.toggle("is-active", isMathInputOpen);
}

function renderMathKeys() {
  const keyset = mathKeysets[currentMode] || mathKeysets["Math Tutor"];
  mathInputModeLabel.textContent = `${currentMode} symbols`;
  mathGrid.innerHTML = "";

  keyset.forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "math-key";
    button.textContent = key.label;
    button.addEventListener("click", () => {
      handleMathKeyClick(key);
    });
    mathGrid.appendChild(button);
  });
}

function insertAtCursor(text) {
  const start = questionInput.selectionStart ?? questionInput.value.length;
  const end = questionInput.selectionEnd ?? questionInput.value.length;
  const before = questionInput.value.slice(0, start);
  const after = questionInput.value.slice(end);

  questionInput.value = `${before}${text}${after}`;
  const cursorPosition = start + text.length;
  questionInput.focus();
  questionInput.setSelectionRange(cursorPosition, cursorPosition);
}

function moveCursorBy(offset) {
  const position = (questionInput.selectionStart ?? questionInput.value.length) + offset;
  questionInput.setSelectionRange(position, position);
  questionInput.focus();
}

function normalizeInsertValue(value) {
  const mapping = {
    pi: "pi",
    theta: "theta",
    infinity: "infinity",
    "<=": "<=",
    ">=": ">=",
    "!=": "!=",
    "+/-": "+/-",
    "*": "*",
    "/": "/",
    "^": "^"
  };

  return mapping[value] || value;
}

function handleMathKeyClick(key) {
  if (key.template === "sqrt") {
    insertAtCursor("sqrt()");
    moveCursorBy(-1);
    return;
  }

  if (key.template === "frac") {
    insertAtCursor("()/()");
    moveCursorBy(-4);
    return;
  }

  if (key.template === "abs") {
    insertAtCursor("abs()");
    moveCursorBy(-1);
    return;
  }

  if (key.template === "derivative") {
    insertAtCursor("d/dx ()");
    moveCursorBy(-1);
    return;
  }

  if (key.template === "integral") {
    insertAtCursor("integral(, x)");
    moveCursorBy(-4);
    return;
  }

  if (key.template === "limit") {
    insertAtCursor("limit(x->, )");
    moveCursorBy(-4);
    return;
  }

  if (key.template === "series") {
    insertAtCursor("sum(n=1 to infinity, )");
    moveCursorBy(-1);
    return;
  }

  insertAtCursor(normalizeInsertValue(key.insert || ""));
}

function loadRecentChats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(chatStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("theme-light", isLight);
  document.body.classList.toggle("theme-dark", !isLight);
  themeToggle.textContent = isLight ? "Dark Mode" : "Light Mode";
}

function openModal(title, body) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modalOverlay.classList.remove("hidden");
}

function closeModal() {
  modalOverlay.classList.add("hidden");
}

function truncate(value, maxLength) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(timestamp);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}
