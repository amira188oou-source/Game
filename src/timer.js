
function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
    timerPaused = false;
    const timerEl = document.getElementById("timer");
    timerEl.classList.remove("active");
    timerEl.style.display = "none";
    // remove timer controls if present
    const tc = document.getElementById("timer-controls");
    if (tc) tc.remove();
    if (typeof saveAppState === "function") saveAppState();
}

function startTimer(minutes, onEnd) {
    stopTimer();
    timerRemaining = Math.round(minutes * 60);
    timerPaused = false;
    const timerEl = document.getElementById("timer");
    timerEl.classList.add("active");
    timerEl.style.display = "flex";

    // create timer-controls container (do not remove other buttons)
    // create timer-controls container (do not remove other buttons)
    let controls = document.getElementById("timer-controls");
    if (controls) controls.remove();
    controls = document.createElement("div");
    controls.id = "timer-controls";
    controls.style.cssText = "display:flex;gap:8px;margin-top:10px;justify-content:center;flex-wrap:wrap;";

    const pauseBtn = button("Pause", () => {
        timerPaused = !timerPaused;
        pauseBtn.innerText = timerPaused ? "Resume" : "Pause";
        if (typeof saveAppState === "function") saveAppState();
    });
    const skipBtn = button("Skip", () => {
        stopTimer();
        if (typeof onEnd === "function") onEnd("skipped");
        if (typeof saveAppState === "function") saveAppState();
    }, "secondary");
    controls.appendChild(pauseBtn);
    controls.appendChild(skipBtn);
    const buttonsWrapper = document.getElementById("buttons");
    if (buttonsWrapper) buttonsWrapper.appendChild(controls);

    let preEndPlayed = false;

    // Create circular SVG if not exists
    if (!timerEl.querySelector("svg")) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 200 200");

        // Background circle
        const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        bgCircle.setAttribute("cx", "100");
        bgCircle.setAttribute("cy", "100");
        bgCircle.setAttribute("r", "90");
        bgCircle.setAttribute("fill", "none");
        bgCircle.setAttribute("stroke", "rgba(77, 166, 255, 0.1)");
        bgCircle.setAttribute("stroke-width", "8");
        svg.appendChild(bgCircle);

        // Progress ring
        const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ring.setAttribute("cx", "100");
        ring.setAttribute("cy", "100");
        ring.setAttribute("r", "90");
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", "#4da6ff");
        ring.setAttribute("stroke-width", "8");
        ring.setAttribute("stroke-linecap", "round");
        ring.classList.add("timer-ring");
        ring.style.strokeDasharray = "565.48";
        ring.style.strokeDashoffset = "565.48";
        ring.style.transition = "stroke-dashoffset 1s linear";
        svg.appendChild(ring);

        timerEl.appendChild(svg);
    }

    // Create text container if not exists
    if (!timerEl.querySelector(".timer-text")) {
        const textDiv = document.createElement("div");
        textDiv.className = "timer-text";
        timerEl.appendChild(textDiv);
    }

    const totalSeconds = timerRemaining;
    const circumference = 565.48; // 2 * PI * 90
    const ring = timerEl.querySelector(".timer-ring");
    const textEl = timerEl.querySelector(".timer-text");

    const tick = () => {
        if (!timerPaused) {
            timerRemaining--;
        }
        textEl.innerText = formatMinSec(timerRemaining >= 0 ? timerRemaining : 0);

        // Update progress ring only when totalSeconds>0
        if (totalSeconds > 0) {
            const progress = Math.max(0, Math.min(1, (totalSeconds - Math.max(0, timerRemaining)) / totalSeconds));
            ring.style.strokeDashoffset = circumference * (1 - progress);
        }

        // Pre-end beep at 2 min
        if (timerRemaining === 120 && !preEndPlayed && appConfig.sound.notifications) {
            playNotification("preEnd");
            preEndPlayed = true;
        }

        if (timerRemaining < 0) {
            // finished normally
            stopTimer();
            timerEl.classList.add("timer-done");
            if (appConfig.sound.notifications) playAlarm();
            timerEl.style.animation = "pulse 0.5s ease-out";
            setTimeout(() => timerEl.style.animation = "", 500);
            // auto-hide visual done state
            setTimeout(() => {
                const el = document.getElementById("timer");
                if (el) el.style.display = "none";
            }, 2000);
            if (typeof onEnd === "function") onEnd("completed");
        }
    };

    tick();
    timer = setInterval(tick, 1000);
    if (typeof saveAppState === "function") saveAppState();
}

function playAlarm() {
    try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);

        // Triple beep pattern
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(600, now + 0.15);
        osc.frequency.setValueAtTime(800, now + 0.3);

        osc.start(now);
        osc.stop(now + 1);
    } catch (e) {
        console.log("Alarm sound failed:", e);
    }
}

function notifyBeep(type) {
    playNotification(type);
}

function resumeTimer(onEnd) {
    // Resume an existing timer without restarting it
    if (timerRemaining <= 0) {
        return;
    }

    const timerEl = document.getElementById("timer");
    timerEl.classList.add("active");
    timerEl.style.display = "flex";
    
    // Clear any old content
    timerEl.innerHTML = "";

    // Recreate SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    
    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", "100");
    bgCircle.setAttribute("cy", "100");
    bgCircle.setAttribute("r", "90");
    bgCircle.setAttribute("fill", "none");
    bgCircle.setAttribute("stroke", "rgba(77, 166, 255, 0.1)");
    bgCircle.setAttribute("stroke-width", "8");
    svg.appendChild(bgCircle);
    
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("cx", "100");
    ring.setAttribute("cy", "100");
    ring.setAttribute("r", "90");
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "#4da6ff");
    ring.setAttribute("stroke-width", "8");
    ring.setAttribute("stroke-linecap", "round");
    ring.classList.add("timer-ring");
    ring.style.strokeDasharray = "565.48";
    ring.style.strokeDashoffset = "565.48";
    ring.style.transition = "stroke-dashoffset 1s linear";
    svg.appendChild(ring);
    
    timerEl.appendChild(svg);
    
    // Recreate text
    const textDiv = document.createElement("div");
    textDiv.className = "timer-text";
    timerEl.appendChild(textDiv);

    // Recreate controls
    let controls = document.getElementById("timer-controls");
    if (controls) controls.remove();
    controls = document.createElement("div");
    controls.id = "timer-controls";
    controls.style.cssText = "display:flex;gap:8px;margin-top:10px;justify-content:center;flex-wrap:wrap;";
    
    const pauseBtn = button("Pause", () => {
        timerPaused = !timerPaused;
        pauseBtn.innerText = timerPaused ? "Resume" : "Pause";
        if (typeof saveAppState === "function") saveAppState();
    });
    const skipBtn = button("Skip", () => {
        stopTimer();
        if (typeof onEnd === "function") onEnd("skipped");
        if (typeof saveAppState === "function") saveAppState();
    }, "secondary");
    controls.appendChild(pauseBtn);
    controls.appendChild(skipBtn);
    const buttonsWrapper = document.getElementById("buttons");
    if (buttonsWrapper) buttonsWrapper.appendChild(controls);

    let preEndPlayed = false;
    const totalSeconds = timerRemaining;
    const circumference = 565.48;
    const ringEl = timerEl.querySelector(".timer-ring");
    const textEl = timerEl.querySelector(".timer-text");

    const tick = () => {
        if (!timerPaused) {
            timerRemaining--;
        }
        textEl.innerText = formatMinSec(timerRemaining >= 0 ? timerRemaining : 0);

        if (totalSeconds > 0) {
            const progress = Math.max(0, Math.min(1, (totalSeconds - Math.max(0, timerRemaining)) / totalSeconds));
            ringEl.style.strokeDashoffset = circumference * (1 - progress);
        }

        if (timerRemaining === 120 && !preEndPlayed && appConfig.sound.notifications) {
            playNotification("preEnd");
            preEndPlayed = true;
        }

        if (timerRemaining < 0) {
            stopTimer();
            timerEl.classList.add("timer-done");
            if (appConfig.sound.notifications) playAlarm();
            timerEl.style.animation = "pulse 0.5s ease-out";
            setTimeout(() => timerEl.style.animation = "", 500);
            setTimeout(() => {
                const el = document.getElementById("timer");
                if (el) el.style.display = "none";
            }, 2000);
            if (typeof onEnd === "function") onEnd("completed");
        }
    };

    tick();
    timer = setInterval(tick, 1000);
    if (typeof saveAppState === "function") saveAppState();
}