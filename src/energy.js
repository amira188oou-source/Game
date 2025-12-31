/* ======================
   ACTIVITY POOLS
====================== */

const activityPools = {
  veryLow: [
    { text: "😂 Watch a short comedy video", img: "../assets/images/pic1.jpg" },
    { text: "🎥 Watch a motivation video", img: "../assets/images/motivation.jpg" }
  ],
  low: [
    { text: "🚿 Take a warm shower" },
    { text: "🕺 Dance to a song" },
    { text: "📞 Talk to a friend you love" }
  ],
  good: [
    { text: "✍️ Write one page of your feeling" },
    { text: "😂 Watch a short comedy video" }
  ],
  veryGood: [
    { text: "🔥 Go work with full focus!" }
  ]
};

const activityCount = {
  veryLow: 2,
  low: 2,
  good: 1,
  veryGood: 1
};

/* ======================
   STATE
====================== */

let steps = [];
let index = 0;

const card = document.getElementById("activityCard");
const choices = document.getElementById("choices");
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
  nextBtn.textContent = index === steps.length - 1 ? "Done" : "Next";
}

/* ======================
   START
====================== */

document.querySelectorAll("#choices button").forEach(btn => {
  btn.onclick = () => {
    const level = btn.dataset.level;

    choices.style.display = "none";
    nextBtn.style.display = "block";

    steps = pickRandom(activityPools[level], activityCount[level]);
    index = 0;
    renderStep();
  };
});

/* ======================
   NEXT / FINISH
====================== */

nextBtn.onclick = () => {
  index++;
  if (index < steps.length) {
    renderStep();
  } else {
    card.innerHTML = "You did enough. Go back when ready 💙";
    nextBtn.style.display = "none";
    setTimeout(() => window.history.back(), 1200);
  }
};
