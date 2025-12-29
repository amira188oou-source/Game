const content = document.getElementById("content");
const title = document.getElementById("title");

const routines = {
  veryLow: [
    "Stand up slowly",
    "Drink water",
    "Deep breathing",
    "Slow walk"
  ],
  low: [
    "Stretch",
    "Light movement",
    "Normal walk"
  ],
  good: [
    "Confident walk",
    "Focus posture"
  ],
  veryGood: [
    "Run!",
    "Hype jump",
    "GO WORK!"
  ]
};

// STEP 1 — show energy choices
function showChoices() {
  content.innerHTML = "";
  title.textContent = "How is your energy right now?";

  [
    ["😴 Very Low", "veryLow"],
    ["😞 Low", "low"],
    ["🙂 Good", "good"],
    ["⚡ Very Good", "veryGood"]
  ].forEach(([label, level]) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = () => startRoutine(level);
    content.appendChild(btn);
  });
}

// STEP 2 — run routine
function startRoutine(level) {
  let i = 0;
  title.textContent = "Energy Boost";

  function nextStep() {
    if (i >= routines[level].length) {
      finish(level);
      return;
    }

    content.innerHTML = `
      <div class="step">${routines[level][i]}</div>
      <button id="next">Next</button>
    `;

    document.getElementById("next").onclick = () => {
      i++;
      nextStep();
    };
  }

  nextStep();
}

// STEP 3 — finish
function finish(level) {
  // Save result (main page will read this later)
  localStorage.setItem("energyBoostResult", level);
  localStorage.setItem("energyBoostTime", Date.now());

  title.textContent = "Done 💪";
  content.innerHTML = `
    <div class="step">Energy boosted. Go back to your day.</div>
    <button onclick="goBack()">Return</button>
  `;
}

// TEMP: go back (we will connect later)
function goBack() {
  // for now, just reload or close
  window.location.href = "index.html";
}

// INIT
showChoices();
