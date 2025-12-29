// Global mutable state state.js
let stepIndex = 0;
let timer = null, timerPaused = false, timerRemaining = 0;
let focusHours = 4;
let notes = [];

let dayMeta = {
    startTs: new Date().toISOString(),
    userProfile: {},
    focusHours: 4,
    customSubjects: [],
    dice: null,
    mood: null 
};

let currentAffirmationIx = 0;
let mainFlowLocked = false;

let sessions = []; // [{id,name,checklist,minutes}]
let waves = { morning: [], afternoon: [], night: [] };
let runningQueue = []; // sequence of sessions to run in a wave
let runningIndex = -1;
let blockAccumMinutes = 0;

let activeSession = null; // {id, name, startTs, plannedMinutes}
let activeSessionExtra = null; // {notesElId, qListRef, activityName}
let sessionLogs = []; // [{id,name,plannedMinutes,actualSeconds,status,notes,questions,carriedOver}]
let sessionIdCounter = 1;

// Backlogs for questions per activity
let questionsBacklog = {};

// Per-day meal completion (persisted per date)
let mealStatus = []; // [{label, time, done}]

function todayKey() { return new Date().toISOString().slice(0, 10); }

function loadMealStatus() {
    const key = `mealStatus_${todayKey()}`; // FIX: was "mealStatus - ${todayKey()}"
    const raw = localStorage.getItem(key);
    if (raw) {
        try { mealStatus = JSON.parse(raw) || []; } catch (e) { mealStatus = []; }
    }
    // If structure empty or meals changed, rebuild
    if (!Array.isArray(mealStatus) || mealStatus.length !== appConfig.meals.length) {
        mealStatus = appConfig.meals.map(m => ({ label: m.label, time: m.time, done: false }));
        saveMealStatus();
    }
}

function saveMealStatus() {
    const key = `mealStatus_${todayKey()}`; // FIX: was "mealStatus - ${todayKey()}"
    localStorage.setItem(key, JSON.stringify(mealStatus));
}

function resetMealStatusForToday() {
    mealStatus = appConfig.meals.map(m => ({ label: m.label, time: m.time, done: false }));
    saveMealStatus();
}

function todayKey() { return new Date().toISOString().slice(0, 10); }

// State persistence (per-day)
function stateStorageKey() {
    return `dbr_state_${todayKey()}`;
}

function saveAppState() {
    try {
        const payload = {
            stepIndex,
            dayMeta,
            sessions,
            waves,
            runningQueue,
            runningIndex,
            activeSession,
            sessionLogs,
            mealStatus,
            // timer snapshot (not exact running tick)
            timerRemaining,
            timerPaused
        };
        localStorage.setItem(stateStorageKey(), JSON.stringify(payload));
    } catch (e) { console.warn("saveAppState failed", e); }
}

function loadAppState() {
    try {
        const raw = localStorage.getItem(stateStorageKey());
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) { return null; }
}

function clearSavedState() {
    try { localStorage.removeItem(stateStorageKey()); } catch(e){}
}

// autosave on unload
window.addEventListener("beforeunload", () => {
    saveAppState();
});
