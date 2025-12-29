// ===============================
// Helpers utils.js
// ===============================

function setProgress() {
    document.getElementById("progress").innerText =
        `Step ${Math.min(stepIndex, 26)} / 26`;
}

function clearUI() {
    document.getElementById("text").innerHTML = "";
    document.getElementById("subtext").innerHTML = "";
    document.getElementById("timer").innerHTML = "";
    document.getElementById("dice").innerHTML = "";

    const res = document.getElementById("result");
    if (res) {
        res.style.display = "none";
        res.innerHTML = "";
    }

    document.getElementById("checklist").innerHTML = "";
    document.getElementById("buttons").innerHTML = "";
}

function formatMinSec(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function addNote(entry) {
    notes.push({
        ts: new Date().toISOString(),
        step: stepIndex,
        ...entry
    });
}

function randomCuriosity() {
    return curiosityPrompts[
        Math.floor(Math.random() * curiosityPrompts.length)
    ];
}

function randomMoodMini() {
    return moodMiniTasks[
        Math.floor(Math.random() * moodMiniTasks.length)
    ];
}

function randomKnowledgeQuestion() {
    return knowledgeQuestions[
        Math.floor(Math.random() * knowledgeQuestions.length)
    ];
}

function timeStrToDate(t) {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
}

function nowHHMM() {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
}

function isBeforeIftar() {
    if (!appConfig.fasting) return false;

    const [h, m] = appConfig.iftarTime.split(":").map(Number);
    const iftar = new Date();
    iftar.setHours(h, m, 0, 0);

    return new Date() < iftar;
}

function categoryFor(name) {
    return appConfig.categories[name] ||
        (name.includes("Quran") ? "faith" : "focus");
}

function categoryClass(cat) {
    return ({
        morning: "cat-morning",
        afternoon: "cat-afternoon",
        night: "cat-night",
        faith: "cat-faith",
        focus: "cat-focus",
        health: "cat-health",
        learning: "cat-learning"
    })[cat] || "cat-focus";
}

function timeStrToDate(t) {
    const [h, m] = String(t || "00:00").split(":").map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
}

function minutesUntil(fromDate, toDate) {
    // returns minutes from "fromDate" until "toDate" (positive when toDate > fromDate)
    return Math.round((toDate - fromDate) / 60000);
}

function formatDurationMinutes(mins) {
    mins = Math.max(0, Math.round(mins));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function nextUpcomingMeal() {
    const now = new Date();

    // fasting: time until iftar (next occurrence)
    if (appConfig.fasting) {
        const iftar = timeStrToDate(appConfig.iftarTime);
        iftar.setSeconds(0,0);
        if (iftar <= now) iftar.setDate(iftar.getDate() + 1);
        return { fasting: true, label: "Iftar", time: appConfig.iftarTime, inMin: minutesUntil(now, iftar), targetDate: iftar };
    }

    // Non-fasting: compute next meal occurrence (treat past times as tomorrow)
    const candidates = (appConfig.meals || []).map((m, idx) => {
        const t = timeStrToDate(m.time);
        t.setSeconds(0,0);
        if (t <= now) t.setDate(t.getDate() + 1);
        return { idx, label: m.label, time: m.time, targetDate: t };
    }).filter(c => !mealStatus[c.idx]?.done);

    if (!candidates.length) return null;
    candidates.sort((a,b) => a.targetDate - b.targetDate);
    const n = candidates[0];
    return { fasting: false, label: n.label, time: n.time, inMin: minutesUntil(now, n.targetDate), targetDate: n.targetDate };
}

// Show chips only for meals within future window and not done
function upcomingMealChips() {
    if (!appConfig.showMealChipsInFocus) return "";
    const now = new Date();
    const windowMin = appConfig.mealChipWindowMinutes || 20;
    const chips = appConfig.meals
        .map((m, idx) => ({ m, idx }))
        .filter(({ m, idx }) => {
            if (mealStatus[idx]?.done) return false;
            if (appConfig.fasting && isBeforeIftar()) {
                const t = timeStrToDate(m.time);
                const iftar = timeStrToDate(appConfig.iftarTime);
                if (t < iftar) return false;
            }
            const t = timeStrToDate(m.time);
            return isFutureWithinWindow(t, now, windowMin);
        })
        .map(({ m }) => `<span class="pill">${m.label} ${m.time}</span>`);
    return chips.join(" ");
}


function minutesUntil(fromDate, toDate) {
    // returns minutes from "fromDate" until "toDate" (positive when toDate > fromDate)
    return Math.round((toDate - fromDate) / 60000);
}

function isFutureWithinWindow(tDate, now, windowMin) {
    // now should be first arg
    const diffMin = minutesUntil(now, tDate);
    return diffMin >= 0 && diffMin <= windowMin;
}

function nextUpcomingMeal() {
    const now = new Date();

    // Fasting: show time until iftar
    if (appConfig.fasting) {
        const iftar = timeStrToDate(appConfig.iftarTime);
        iftar.setSeconds(0,0);
        // if already past today, move to tomorrow
        if (iftar <= now) iftar.setDate(iftar.getDate() + 1);
        const mins = minutesUntil(now, iftar);
        return { fasting: true, label: `Iftar`, time: appConfig.iftarTime, inMin: mins, targetDate: iftar };
    }

    // Non-fasting: consider meals not done and pick the soonest future occurrence
    const candidates = (appConfig.meals || []).map((m, idx) => {
        const t = timeStrToDate(m.time);
        t.setSeconds(0,0);
        // if time is earlier than now treat as tomorrow
        if (t <= now) t.setDate(t.getDate() + 1);
        return { idx, label: m.label, time: m.time, targetDate: t };
    }).filter(c => !mealStatus[c.idx]?.done);

    if (candidates.length === 0) return null;
    candidates.sort((a,b) => a.targetDate - b.targetDate);
    const n = candidates[0];
    return { fasting: false, label: n.label, time: n.time, inMin: minutesUntil(now, n.targetDate), targetDate: n.targetDate };
}

// top-left notification UI
function showNextMealNotification() {
    // create or update floating notification
    const info = nextUpcomingMeal();
    const existing = document.getElementById("top-notif-meal");
    if (!info) {
        if (existing) existing.remove();
        return;
    }

    const text = info.fasting
        ? `Time until iftar: ${formatDurationMinutes(info.inMin)} (${info.time})`
        : `Next meal: ${info.label} at ${info.time} (in ${formatDurationMinutes(info.inMin)})`;

    let el = existing;
    if (!el) {
        el = document.createElement("div");
        el.id = "top-notif-meal";
        el.className = "top-notif";
        el.innerHTML = `<div class="content"></div><button class="close" aria-label="close">✕</button>`;
        document.body.appendChild(el);
        el.querySelector(".close").onclick = () => el.remove();
    }
    el.querySelector(".content").innerText = text;
}

function formatDurationMinutes(mins) {
    mins = Math.max(0, Math.round(mins));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}


// Friendly “upcoming meals” line
function upcomingMealsText() {
    // When fasting show time until iftar instead of upcoming meal chips
    if (appConfig?.fasting) {
        try {
            const now = new Date();
            const iftarDate = timeStrToDate(appConfig.iftarTime);
            if (!iftarDate) return "";
            let mins = minutesUntil(now, iftarDate);
            // if already passed today, try tomorrow's iftar (add 24h)
            if (mins <= 0) {
                iftarDate.setDate(iftarDate.getDate() + 1);
                mins = minutesUntil(now, iftarDate);
            }
            if (mins <= 0) return "Iftar is soon";
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            const parts = [];
            if (h) parts.push(`${h}h`);
            if (m) parts.push(`${m}m`);
            return `Time until iftar: ${parts.join(" ")}`;
        } catch (e) {
            return "";
        }
    }    // Non-fasting: show next meal (display hours when >= 60 min)
    try {
        const now = new Date();
        const futureMeals = (appConfig.meals || [])
            .map(m => {
                const d = timeStrToDate(m.time);
                let mins = minutesUntil(now, d);
                if (mins <= 0) { d.setDate(d.getDate() + 1); mins = minutesUntil(now, d); }
                return Object.assign({}, m, { mins, _date: d });
            })
            .filter(m => m.mins > 0)
            .sort((a, b) => a.mins - b.mins);

        if (!futureMeals.length) return "";
        const next = futureMeals[0];
        const mins = Math.round(next.mins);
        if (mins >= 60) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `Next meal: ${next.label} at ${next.time} (in ${h}h ${m}m)`;
        } else {
            return `Next meal: ${next.label} at ${next.time} (in ${mins} min)`;
        }
    } catch (e) {
        return "";
    }
}



// ===============================
// Fasting-aware energy
// ===============================

function randomEnergy() {
    if (appConfig.fasting && isBeforeIftar()) {
        const alt = [
            "🌬️ Guided breathing 2 min",
            "🧘 Posture reset + shoulder rolls",
            "🚶 2–5 minutes slow walk",
            "👀 20s eye break + distant focus"
        ];
        return alt[Math.floor(Math.random() * alt.length)];
    }

    return energyStops[
        Math.floor(Math.random() * energyStops.length)
    ];
}
