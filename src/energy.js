let anim = null;
let steps = [];
let index = 0;

/* Lottie routines */
const routines = {
  veryLow: [
    { text: "Stand up", anim: "https://assets3.lottiefiles.com/packages/lf20_kyu7xb1v.json" },
    { text: "Drink water", anim: "https://assets10.lottiefiles.com/packages/lf20_q5pk6p1k.json" },
    { text: "Deep breathing", anim: "https://assets2.lottiefiles.com/packages/lf20_bhw1ul4g.json" },
    { text: "Slow walk", anim: "https://assets7.lottiefiles.com/packages/lf20_jcikwtux.json" }
  ],
  low: [
    { text: "Stretch", anim: "https://assets1.lottiefiles.com/packages/lf20_touohxv0.json" },
    { text: "Light movement", anim: "https://assets9.lottiefiles.com/packages/lf20_dvaw4k9n.json" },
    { text: "Normal walk", anim: "https://assets6.lottiefiles.com/packages/lf20_kkflmtur.json" }
  ],
  good: [
    { text: "Confident walk", anim: "https://assets7.lottiefiles.com/packages/lf20_jcikwtux.json" },
    { text: "Focused", anim: "https://assets4.lottiefiles.com/packages/lf20_myejiggj.json" }
  ],
  veryGood: [
    { text: "Run!", anim: "https://assets6.lottiefiles.com/packages/lf20_kkflmtur.json" },
    { text: "Hype jump", anim: "https://assets8.lottiefiles.com/packages/lf20_kkflmtur.json" },
    { text: "GO WORK!", anim: "https://assets3.lottiefiles.com/packages/lf20_kkflmtur.json" }
  ]
};

/* DOM refs */
const choicesEl = document.getElementById("choices");
const textEl = document.getElementById("text");
const animEl = document.getElementById("anim");
const nextBtn = document.getElementById("next");

/* Attach choice handlers */
choicesEl.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    startRoutine(btn.dataset.level);
  });
});

nextBtn.addEventListener("click", nextStep);

function startRoutine(level) {
  choicesEl.style.display = "none";
  nextBtn.style.display = "block";
  steps = routines[level] || [];
  index = 0;
  playStep();
}

function playStep() {
  if (!steps[index]) return;

  if (anim) anim.destroy();

  textEl.textContent = steps[index].text;

  anim = lottie.loadAnimation({
    container: animEl,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: steps[index].anim
  });
}

function nextStep() {
  index++;
  if (index < steps.length) {
    playStep();
  } else {
    finish();
  }
}

function finish() {
  if (anim) anim.destroy();
  textEl.textContent = "Done. Now go work 💪";
  nextBtn.style.display = "none";

  // 🔜 later: send result back to main app
  // localStorage.setItem("energyBoostResult", "done");
}
