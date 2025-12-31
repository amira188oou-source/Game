/* ======================
   ACTIVITY POOLS
====================== */

const activityPools = {
  veryLow: [
    { text: "🚿 Take a warm shower",img: "../assets/images/shower.jpg"},
    { text: "✍️ Write everything on your mind",img: "../assets/images/write.jpg"},
    { text: "🎨 Draw anything you want",img: "../assets/images/draw.png"},
    { text: "🚶 Go out, slow walk and eat something you love",img: "../assets/images/out.jpg"},
    { text: "🕺 Dance to a song",img: "../assets/images/dance.jpg"},
    { text: "😂 Watch a short comedy video",img: "../assets/images/watch.jpg"},
    { text: "📞 Talk to a friend you love",img: "../assets/images/talk.jpg"},
    { text: "🌬️ Deep breathing for 3 min",img: "../assets/images/deep.jpg"},
    { text: "🧍 Stand up and stretch your body",img: "../assets/images/body.jpg"},
    { text: "🎮 Play a relaxing game",img: "../assets/images/play.jpg"},
    { text: "📖 Read 6 pages of manga",img: "../assets/images/manga.jpg"},
    { text: "🎤 Try to sing",img: "../assets/images/sing.jpg"},
    { text: "🖍️ Coloring something relaxing",img: "../assets/images/coloring.jpg"},
    { text: "🎥 Watch a motivation video",img: "../assets/images/motivation.jpg"},
    { text: "📚 Make a fun story",img: "../assets/images/story.jpg"},
    { text: "🧖 Do a hair / face / hand mask",img: "../assets/images/skin.jpg"},
    { text: "😆 Laugh for 1 minute for no reason" ,img: "../assets/images/laugh.jpg"}
  ],

  low: [
    { text: "🚿 Take a warm shower",img: "../assets/images/shower.jpg"},
    { text: "✍️ Write everything on your mind",img: "../assets/images/write.jpg"},
    { text: "🎨 Draw anything you want",img: "../assets/images/draw.png"},
    { text: "🚶 Go out, slow walk and eat something you love",img: "../assets/images/out.jpg"},
    { text: "🕺 Dance to a song",img: "../assets/images/dance.jpg"},
    { text: "😂 Watch a short comedy video",img: "../assets/images/watch.jpg"},
    { text: "📞 Talk to a friend you love",img: "../assets/images/talk.jpg"},
    { text: "🌬️ Deep breathing for 3 min",img: "../assets/images/deep.jpg"},
    { text: "🧍 Stand up and stretch your body",img: "../assets/images/body.jpg"},
    { text: "🎮 Play a relaxing game",img: "../assets/images/play.jpg"},
    { text: "📖 Read 6 pages of manga",img: "../assets/images/manga.jpg"},
    { text: "🎤 Try to sing",img: "../assets/images/sing.jpg"},
    { text: "🖍️ Coloring something relaxing",img: "../assets/images/coloring.jpg"},
    { text: "🎥 Watch a motivation video",img: "../assets/images/motivation.jpg"},
    { text: "📚 Make a fun story",img: "../assets/images/story.jpg"},
    { text: "🧖 Do a hair / face / hand mask",img: "../assets/images/skin.jpg"},
    { text: "😆 Laugh for 1 minute for no reason" ,img: "../assets/images/laugh.jpg"}
  ],

  good: [
    { text: "✍️ Write one page of your feeling",img: "../assets/images/write.jpg"},
    { text: "🎨 Draw anything you want",img: "../assets/images/draw.png"},
    { text: "🕺 Dance to a song",img: "../assets/images/dance.jpg"},
    { text: "😂 Watch a short comedy video",img: "../assets/images/watch.jpg"},
    { text: "📞 Talk to a friend you love",img: "../assets/images/talk.jpg"},
    { text: "🌬️ Deep breathing for 1 min",img: "../assets/images/deep.jpg"},
    { text: "🧍 Stand up and stretch your body",img: "../assets/images/body.jpg"},
    { text: "🎮 Play a relaxing game",img: "../assets/images/play.jpg"},
    { text: "📖 Read 2 pages of manga",img: "../assets/images/manga.jpg"},
    { text: "🖍️ Coloring something relaxing",img: "../assets/images/coloring.jpg"},
    { text: "🎥 Watch a motivation video",img: "../assets/images/motivation.jpg"},
    { text: "📚 Make a fun story",img: "../assets/images/story.jpg"},
    { text: "😆 Laugh for 1 minute for no reason" ,img: "../assets/images/laugh.jpg"}
  ],

  veryGood: [
    { text: "✍️ Write one page of your feeling",img: "../assets/images/write.jpg"},
    { text: "😂 Watch a short comedy video",img: "../assets/images/watch.jpg"},
    { text: "🌬️ Deep breathing for 1 min",img: "../assets/images/deep.jpg"},
    { text: "🧍 Stand up and stretch your body",img: "../assets/images/body.jpg"},
    { text: "🎮 Play a relaxing game",img: "../assets/images/play.jpg"},
    { text: "📚 Make a fun story",img: "../assets/images/story.jpg"},
    { text: "🖍️ Coloring something relaxing",img: "../assets/images/coloring.jpg"}
  ]
};

const activityCount = {
  veryLow: 7,
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
const choices = document.getElementById("choices");
const nextBtn = document.getElementById("next");

/* ======================
   HELPERS
====================== */
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


function pickRandom(pool, count) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
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
    card.innerHTML = "You did enough. Go back you are ready 💙";
    nextBtn.style.display = "none";
    setTimeout(() => window.history.back(), 1200);
  }
};
