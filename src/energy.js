/* ======================
   ACTIVITY POOLS
====================== */

const activityPools = {
  veryLow: [
    { text: "😂 Watch a short comedy video", img: "assets/images/pic1.jpg" },
    { text: "🎥 Watch a motivation video", img: "assets/images/motivation.jpg" }
  ],

  low: [
    { text: "🚿 Take a warm shower" },
    { text: "✍️ Write everything on your mind" },
    { text: "🎨 Draw anything you want" }
  ],

  good: [
    { text: "🕺 Dance to a song" },
    { text: "😂 Watch a short comedy video" }
  ],

  veryGood: [
    { text: "✍️ Write one page of your feeling" }
  ]
};

const activityCount = {
  veryLow: 6,
  low: 5,
  good: 3,
  veryGood: 1
};

/* ======================
   STATE
====================== */

let steps = [];
let index = 0;

const card = document.getElementById("activityCard");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("next");

/* ======================
   HELPERS
====================== */

function pickRandom(pool, count) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

function renderStep() {
  const step = steps[index];

  card.classList.remove("animate");
  void card.offsetWidth;

  card.innerHTML = `
    <div>${step.text}</div>
    ${step.img ? `<img src="${step.img}" class="activity-img">` : ""}
  `;

  card.classList.add("animate");

  nextBtn.textContent =
    index === steps.length - 1 ? "Done" : "Next";
}

/* ======================
   START
====================== */

choicesEl.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    const level = btn.dataset.level;

    choicesEl.style.display = "none";
    nextBtn.style.display = "block";

    steps = pickRandom(activityPools[level], activityCount[level]);
    index = 0;

    renderStep();
  });
});

/* ======================
   NEXT / FINISH
====================== */

nextBtn.addEventListener("click", () => {
  index++;

  if (index < steps.length) {
    renderStep();
  } else {
    card.innerHTML = "You did enough. Go back when ready 💙";
    nextBtn.style.display = "none";
    setTimeout(() => window.history.back(), 1200);
  }
});
