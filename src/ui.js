// Rendering and buttons ui.js

// ...existing code...
function render({ text = "", subtext = "", buttons = [], showDice = false, resultHTML = null }) {
    clearUI();
    setProgress();

    // Use template strings for innerHTML
    document.getElementById("text").innerHTML = `<div class="fade-in">${text}</div>`;

    // Do NOT inject meal/iftar line into main subtext (we show it as top-left floating notification)
    document.getElementById("subtext").innerHTML = subtext ? `<div class="fade-in">${subtext}</div>` : "";

    // Ensure buttons array always has at least a Next fallback
    if (!Array.isArray(buttons) || buttons.length === 0) {
        buttons = [{ label: "Next", action: next }];
    }

    if (showDice) document.getElementById("dice").innerText = "🎲";
    else document.getElementById("dice").innerText = "";

    if (resultHTML) {
        const res = document.getElementById("result");
        res.style.display = "block";
        res.innerHTML = resultHTML;
    }

    renderMealBar(); // ensure floating meal bar is present (outside main area)

    const btnWrap = document.getElementById("buttons");
    btnWrap.innerHTML = ""; // ensure cleared
    buttons.forEach(b => {
        const btn = document.createElement("button");
        btn.innerText = b.label ?? "Action";
        if (b.variant === "secondary") btn.classList.add("secondary");
        if (b.variant === "ghost") btn.classList.add("ghost");
        btn.onclick = () => b.action && b.action();
        btnWrap.appendChild(btn);
    });
}

// Replace renderMealBar to render floating meals outside #app
function renderMealBar() {
    // Remove any old in-app bar if present
    const old = document.getElementById("mealbar");
    if (old && old.parentNode) old.parentNode.removeChild(old);

    // If fasting, hide floating meals (but still show iftar notification)
    const existingFloating = document.getElementById("top-mealbar");
    if (existingFloating) existingFloating.remove();

    // Create floating meal bar appended to body (shows meal pills and an X)
    // ...existing code...
    if (!appConfig.fasting && Array.isArray(appConfig.meals) && appConfig.meals.length) {
        const bar = document.createElement("div");
        bar.id = "top-mealbar";
        bar.className = "top-mealbar";
        const left = document.createElement("div");
        left.className = "tm-left";
        left.innerHTML = `<strong style="margin-right:8px;font-size:13px;color:var(--muted)">Meals</strong>`;
        appConfig.meals.forEach((m, idx) => {
            const done = !!(mealStatus[idx]?.done);
            const pill = document.createElement("span");
            pill.className = "pill";
            pill.style.marginRight = "8px";
            pill.style.opacity = done ? "0.5" : "1";
            pill.innerText = `${m.label} ${m.time}`;
            left.appendChild(pill);
        });
        const close = document.createElement("button");
        close.className = "top-meal-close ghost";
        close.innerText = "✕";
        close.onclick = () => {
            // Mark all upcoming meals as dismissed/done for today so notifications don't reappear
            if (!Array.isArray(mealStatus) || mealStatus.length !== appConfig.meals.length) {
                mealStatus = appConfig.meals.map(m => ({ label: m.label, time: m.time, done: true }));
            } else {
                mealStatus.forEach(ms => ms.done = true);
            }
            if (typeof saveMealStatus === "function") saveMealStatus();
            if (typeof saveAppState === "function") saveAppState();
            bar.remove();
            const notif = document.getElementById("top-notif-meal");
            if (notif) notif.remove();
        };

        bar.appendChild(left);
        bar.appendChild(close);
        document.body.appendChild(bar);
    }

    // refresh top-left next meal / iftar notification
    if (typeof showNextMealNotification === "function") showNextMealNotification();
}

function button(label, action, variant) {
    const b = document.createElement("button");
    b.innerText = label || "Action";
    b.classList.add("action-btn");
    if (variant === "secondary") b.classList.add("secondary");
    if (variant === "ghost") b.classList.add("ghost");
    b.onclick = action;
    return b;
}

// Create persistent restart button (called once at init)
function createRestartButton() {
    // Check if already exists
    if (document.getElementById("restart-btn")) return;

    const btn = document.createElement("button");
    btn.id = "restart-btn";
    btn.innerText = "🔄 Restart Day";
    btn.onclick = () => {
        if (confirm("Are you sure you want to restart? All progress will be lost.")) {
            // Clear all saved state
            if (typeof clearSavedState === "function") clearSavedState();

            // Reset all global variables
            stepIndex = 0;
            timerRemaining = 0;
            timerPaused = false;
            notes = [];
            currentAffirmationIx = 0;
            sessions = [];
            waves = { morning: [], afternoon: [], night: [] };
            runningQueue = [];
            runningIndex = -1;
            blockAccumMinutes = 0;
            activeSession = null;
            activeSessionExtra = null;
            sessionLogs = [];
            sessionIdCounter = 1;
            questionsBacklog = {};
            mealStatus = [];

            // Reset dayMeta
            dayMeta = {
                startTs: new Date().toISOString(),
                userProfile: {},
                focusHours: 4,
                customSubjects: [],
                dice: null
            };

            // Reload page to start fresh
            location.reload();
        }
    };
    document.body.appendChild(btn);
}
function createBoostEnergyButton() {
  if (document.getElementById("boost-btn")) return;

  const btn = document.createElement("button");
  btn.id = "boost-btn";
  btn.innerText = "⚡ Boost Energy";

  btn.style.position = "fixed";
  btn.style.zIndex = "9998";

  btn.onclick = () => {
    localStorage.setItem("forceStep0", "1");
    window.location.href = "src/energy.html";
  };

  document.body.appendChild(btn);
}

