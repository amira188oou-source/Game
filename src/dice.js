// Dice allocation and sessions dice.js
function allocatePercents(subjects) {
    const w = subjects.map(() => Math.random() + 0.1);
    const sum = w.reduce((a, b) => a + b, 0);
    const raw = w.map(x => x / sum * 100);
    const ints = raw.map(x => Math.floor(x));
    let rem = 100 - ints.reduce((a, b) => a + b, 0);
    const frac = raw.map((x, i) => ({ i, f: x - ints[i] })).sort((a, b) => b.f - a.f);
    for (let k = 0; k < rem; k++) { ints[frac[k % frac.length].i]++; }
    for (let i = 0; i < ints.length; i++) { if (ints[i] === 0) ints[i] = 1; }
    let total = ints.reduce((a, b) => a + b, 0);
    while (total > 100) { for (let i = 0; i < ints.length && total > 100; i++) { if (ints[i] > 1) { ints[i]--; total--; } } }
    return ints;
}
function clampSessionMinutes(mins) {
    const out = [];
    if (mins <= 25) { out.push(25); return out; }
    if (mins <= 50) { out.push(mins); return out; }
    let remaining = mins;
    while (remaining > 50) { out.push(50); remaining -= 50; }
    if (remaining > 0) out.push(Math.max(25, remaining));
    return out;
}
function buildSessionsFromDice() {
    const base = appConfig.baseSubjectsEditable;
    const all = [...base, ...dayMeta.customSubjects];
    const perc = allocatePercents(all);
    sessions = []; sessionIdCounter = 1;
    dayMeta.dice = {};
    
    // Get mood boost multiplier
    const moodBoost = dayMeta.mood ? MOOD_THEMES[dayMeta.mood].activityBoost : 1.0;
    
    for (let i = 0; i < all.length; i++) {
        const p = perc[i];
        dayMeta.dice[all[i].name] = p;
        const totalMins = Math.round(dayMeta.focusHours * 60 * p / 100 * moodBoost);
        const chunks = clampSessionMinutes(totalMins);
        chunks.forEach(m => sessions.push({ id: sessionIdCounter++, name: all[i].name, checklist: all[i].checklist, minutes: m }));
    }
    // Shuffle sessions randomly so order is not predictable
    for (let i = sessions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sessions[i], sessions[j]] = [sessions[j], sessions[i]];
    }
}
function distributeWaves() {
    waves = { morning: [], afternoon: [], night: [] };
    const ifFasting = appConfig.fasting;
    // When fasting, bias more slots toward morning (0) and limit long night sessions
    const bias = ifFasting ? [0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 1, 0] // more morning slots
        : [0, 1, 2, 0, 1, 2, 0, 1, 2];
    sessions.forEach((s, idx) => {
        const slot = bias[idx % bias.length];
        if (slot === 0) waves.morning.push(s);
        else if (slot === 1) waves.afternoon.push(s);
        else waves.night.push(s);
    });
    if (ifFasting) { waves.night.forEach(ss => { ss.minutes = Math.min(ss.minutes, 25); }); }
}
