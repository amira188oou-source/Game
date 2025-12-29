// Main flow main.js
function next() {
    if (mainFlowLocked) return;
    mainFlowLocked = true;
    setTimeout(() => mainFlowLocked = false, 150);

    stopTimer();
    stepIndex++;
    setProgress();

    switch (stepIndex) {

        // Morning / Ground
        case 1: {
            const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
            if (appConfig.fasting) {
                // When fasting, avoid drink-water prompt — do a quick grounding instead
                render({ text: `🧘‍♀️ Grounding${her}`, subtext: `<span class="pill">2 minutes</span>` });
                startTimer(2, next);
            } else {
                render({ text: `💧 Drink water${her}`, subtext: `<span class="pill">2 minutes</span>` });
                startTimer(2, next);

            }
            break;
        }

        case 2:
            render({ text: "🧘‍♀️ Sit silently", subtext: `<span class="pill">2 minutes</span>` });
            startTimer(2, next);
            break;

        case 3:
            render({
                text: "🌬️ Deep breathing (6 times)",
                subtext: `<span class="note">Inhale 4, hold 2, exhale 6.</span>`,
                buttons: [{ label: "Done", action: next }]
            });
            break;

        case 4: {
            render({ text: "🚶‍♀️ Morning walk or sit quietly", subtext: `<span class="pill">15–25 minutes</span>` });
            document.getElementById("buttons").appendChild(button("Walk 15 min", () => startTimer(15, next)));
            document.getElementById("buttons").appendChild(button("Walk 25 min", () => startTimer(25, next)));
            document.getElementById("buttons").appendChild(button("Sit quietly", next, "secondary"));
            break;
        }

        case 5:
            if (currentAffirmationIx < affirmationsArabic.length) {
                showAffirmations(next);
            } else {
                next();
            }
            break;

        case 6:
            render({ text: "🎧 Morning calm audio", subtext: `<span class="pill">5 minutes</span>` });
            startTimer(5, next);
            break;
        
        // Mini break after afternoon wave — random order & mood-based
        case 7: // (or wherever you want dynamic breaks between waves)
            const moodMsg = getTransitionMessageByMood();
            render({ 
                text: moodMsg, 
                buttons: [{ label: "Continue", action: next }] 
            });
            break;

        // Spiritual
        case 8:
            render({ text: "📖 Quran memorization", subtext: `<span class="pill">15 minutes</span>` });
            startTimer(15, next);
            break;

        case 9:
            render({ text: "📖 Quran reading + Adkar Sabah", subtext: `<span class="pill">15 minutes</span>` });
            startTimer(15, () => askReflection("morning", next));
            break;

        // Planning + Dice
        case 10:
            loadMoodTheme(); // Load saved mood if any
            render({ text: "🌅 How are you feeling?", subtext: `This adjusts your day's activities` });
            showMoodSelector(() => {
                next();
            });
            break;

        case 11:
            render({
                text: "🎲 Split the focus block",
                subtext: `Using your configured subjects`,
                showDice: true,
                buttons: [{
                    label: "Roll Dice",
                    action: () => {
                        buildSessionsFromDice();
                        distributeWaves();
                        const moodBoost = dayMeta.mood ? MOOD_THEMES[dayMeta.mood].activityBoost : 1.0;
                        const adjustedHours = (dayMeta.focusHours * moodBoost).toFixed(1);
                        const alloc = Object.keys(dayMeta.dice).map(n => {
                            const cat = categoryFor(n);
                            return `<span class="pill">${dayMeta.dice[n]}%</span> <span class="cat ${categoryClass(cat)}">${n}</span>`;
                        }).join(" ");
                        const moodLabel = dayMeta.mood ? MOOD_THEMES[dayMeta.mood].label : "Neutral";
                        render({
                            text: "✅ Dice results saved",
                            resultHTML: `<div class="kpi">${alloc}<span class="pill">Mood: ${moodLabel}</span><span class="pill">Adjusted hours: ${adjustedHours}h</span></div>`,
                            buttons: [{ label: "Continue", action: next }]
                        });
                    }
                }]
            });
            break;

        // Wave 1: Morning focus
        case 12:
            if (waves.morning.length === 0) { next(); break; }
            runWave(waves.morning, next);
            break;

         // Mini break (case 12) — now uses mood-based duration + activity
        case 13:
            const breakDur = getBreakDurationByMood();
            const breakActivity = pickActivityByMood("break") || randomEnergy();
            render({ 
                text: breakActivity, 
                subtext: `<span class="pill">${breakDur} minutes</span>`,
                buttons: [{ label: "Start", action: () => startTimer(breakDur, next) }, { label: "Skip", variant: "secondary", action: next }]
            });
            break;

        // Lunch
        case 14:
            if (appConfig.fasting && isBeforeIftar()) {
                render({ text: "🧘 Midday reset", subtext: `<span class="pill">10 minutes</span>`, buttons: [{ label: "Start 10 min", action: () => startTimer(10, next) }] });
            } else {
                render({
                    text: "🍽️ Lunch break", subtext: `<span class="pill">20–30 minutes</span>`, buttons: [
                        { label: "Start 25 min", action: () => startTimer(25, next) },
                        { label: "Skip", variant: "secondary", action: next }
                    ]
                });
            }
            break;

        // Wave 2: Afternoon focus + reflection
        case 15:
            if (waves.afternoon.length === 0) {
                askReflection("afternoon", next);
                break;
            }
            runWave(waves.afternoon, () => askReflection("afternoon", next));
            break;

        // Writing + research
        case 16:
            render({ text: "✍️ Writing: reflect on people who look down on themselves", subtext: `<span class="pill">25–50 minutes</span>` });
            startTimer(30, next);
            break;

        case 17:
            render({ text: "💻 Research", subtext: `<span class="pill">25–50 minutes</span>` });
            startTimer(30, next);
            break;

        // Mood changer (case 17) — dynamic pause activities
        case 18:
            const pauseDur = getPauseDurationByMood();
            const pauseActivity = pickActivityByMood("pause") || "🌬️ Breathe";
            render({ 
                text: pauseActivity, 
                subtext: `<span class="pill">${pauseDur} minutes</span>` 
            });
            startTimer(pauseDur, next);
            break;


        
        // Case 18 — energy reset with mood + body awareness
        case 19:
            if (appConfig.fasting && isBeforeIftar()) {
                render({ 
                    text: "🌬️ Light energy reset", 
                    subtext: `<span class="note">${pickActivityByMood("pause") || randomEnergy()}</span>`, 
                    buttons: [{ label: "Done", action: next }] 
                });
            } else {
                const bodyActivity = pickBodyAwareActivity("break") || pickActivityByMood("break") || "🍎 Fruit + water";
                render({ 
                    text: bodyActivity, 
                    buttons: [{ label: "Done", action: next }] 
                });
            }
            break;

        case 20:
            // Move Quran/faith and gentle energy activities to evening when fasting
            if (appConfig.fasting) {
                render({ text: "📖 Quran reading & Adkar", subtext: `<span class="pill">15 minutes</span>` });
                document.getElementById("buttons").appendChild(button("Start 15 min", () => startTimer(15, next)));
                document.getElementById("buttons").appendChild(button("Or do an energy reset", next, "secondary"));
            } else {
                render({ text: "🎧 Listen to relaxing audio or podcast", buttons: [{ label: "Done", action: next }] });
            } break;

        // Wave 3: Night focus
        case 21:
            if (waves.night.length === 0) { next(); break; }
            runWave(waves.night, next);
            break;

        case 22: {
            const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
            render({ text: `✨ Affirmation review${her}`, buttons: [{ label: "Done", action: next }] });
            break;
        }

        // Journaling & Closing
        case 23:
            render({ text: "📝 Journal: one challenge and solution" });
            journalingForm("One challenge and solution", next);
            break;

        case 24:
            render({ text: "📝 Journal: 3 things done well today" });
            journalingForm("3 things done well", next);
            break;

        case 25:
            render({ text: "📝 Reflection: mood, resistance, energy levels" });
            journalingForm("Mood, resistance, energy", next);
            break;

        case 26: {
            const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
            render({ text: `🎉 Congratulate yourself for completing focus sessions${her}`, buttons: [{ label: "Done", action: next }] });
            break;
        }

        case 27:
            render({ text: "🌑 End-of-day message & self-reflection: gratitude / lessons / plan tomorrow" });
            endOfDayForm(() => showDownload());
            break;

        default:
            showDownload();
            break;
    }
}

(function init() {
    const h = new Date().getHours();
    const title = document.getElementById("title");
    if (h < 12) title.innerHTML = "Reset – Morning";
    else if (h < 18) title.innerHTML = "Reset – Afternoon";
    else title.innerHTML = "Reset – Night";

    // Create persistent restart button (visible on all pages)
    if (typeof createRestartButton === "function") createRestartButton();

    // Restore last saved state for today (if any)
    const saved = (typeof loadAppState === "function") ? loadAppState() : null;
    console.log("Saved state:", saved);

    if (saved) {
        if (typeof saved.dayMeta === "object") dayMeta = Object.assign(dayMeta, saved.dayMeta);
        if (Array.isArray(saved.sessions)) sessions = saved.sessions;
        if (saved.waves) waves = saved.waves;
        if (Array.isArray(saved.sessionLogs)) sessionLogs = saved.sessionLogs;
        if (Array.isArray(saved.mealStatus)) mealStatus = saved.mealStatus;
        if (typeof saved.stepIndex === "number") {
            stepIndex = saved.stepIndex;
        }
        if (typeof saved.timerRemaining === "number") {
            timerRemaining = saved.timerRemaining;
            console.log("Restored timerRemaining:", timerRemaining);
        }
    }

    loadMealStatus();
    if (typeof showNextMealNotification === "function") showNextMealNotification();

    // If state was restored, jump directly to the saved step — skip profile/setup
    if (saved && saved.stepIndex > 0) {
        console.log("Calling renderCurrentStep with stepIndex:", stepIndex, "timerRemaining:", timerRemaining);
        renderCurrentStep();
    } else {
        // First time: show profile → setup → flow
        askProfile(() => {
            showSetup(() => {
                if (stepIndex <= 0) stepIndex = 0;
                next();
            });
        });
    }
})();

function renderCurrentStep() {
    const step = stepIndex;
    const wasTimerRunning = timerRemaining > 0;

    switch (step) {

        // Morning / Ground
        case 1: {
            const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
            if (appConfig.fasting) {
                // When fasting, avoid drink-water prompt — do a quick grounding instead
                render({ text: `🧘‍♀️ Grounding${her}`, subtext: `<span class="pill">2 minutes</span>` });
                startTimer(2, next);
            } else {
                render({ text: `💧 Drink water${her}`, subtext: `<span class="pill">2 minutes</span>` });
                startTimer(2, next);

            }
            break;
        }

        case 2:
            render({ text: "🧘‍♀️ Sit silently", subtext: `<span class="pill">2 minutes</span>` });
            startTimer(2, next);
            break;

        case 3:
            render({
                text: "🌬️ Deep breathing (6 times)",
                subtext: `<span class="note">Inhale 4, hold 2, exhale 6.</span>`,
                buttons: [{ label: "Done", action: next }]
            });
            break;

        case 4: {
            render({ text: "🚶‍♀️ Morning walk or sit quietly", subtext: `<span class="pill">15–25 minutes</span>` });
            document.getElementById("buttons").appendChild(button("Walk 15 min", () => startTimer(15, next)));
            document.getElementById("buttons").appendChild(button("Walk 25 min", () => startTimer(25, next)));
            document.getElementById("buttons").appendChild(button("Sit quietly", next, "secondary"));
            break;
        }

        case 5:
            if (currentAffirmationIx < affirmationsArabic.length) {
                showAffirmations(next);
            } else {
                next();
            }
            break;

        case 6:
            render({ text: "🎧 Morning calm audio", subtext: `<span class="pill">5 minutes</span>` });
            startTimer(5, next);
            break;
        
        // Mini break after afternoon wave — random order & mood-based
        case 7: // (or wherever you want dynamic breaks between waves)
            const moodMsg = getTransitionMessageByMood();
            render({ 
                text: moodMsg, 
                buttons: [{ label: "Continue", action: next }] 
            });
            break;

        // Spiritual
        case 8:
            render({ text: "📖 Quran memorization", subtext: `<span class="pill">15 minutes</span>` });
            startTimer(15, next);
            break;

        case 9:
            render({ text: "📖 Quran reading + Adkar Sabah", subtext: `<span class="pill">15 minutes</span>` });
            startTimer(15, () => askReflection("morning", next));
            break;

        // Planning + Dice
        case 10:
            loadMoodTheme(); // Load saved mood if any
            render({ text: "🌅 How are you feeling?", subtext: `This adjusts your day's activities` });
            showMoodSelector(() => {
                next();
            });
            break;

        case 11:
            render({
                text: "🎲 Split the focus block",
                subtext: `Using your configured subjects`,
                showDice: true,
                buttons: [{
                    label: "Roll Dice",
                    action: () => {
                        buildSessionsFromDice();
                        distributeWaves();
                        const moodBoost = dayMeta.mood ? MOOD_THEMES[dayMeta.mood].activityBoost : 1.0;
                        const adjustedHours = (dayMeta.focusHours * moodBoost).toFixed(1);
                        const alloc = Object.keys(dayMeta.dice).map(n => {
                            const cat = categoryFor(n);
                            return `<span class="pill">${dayMeta.dice[n]}%</span> <span class="cat ${categoryClass(cat)}">${n}</span>`;
                        }).join(" ");
                        const moodLabel = dayMeta.mood ? MOOD_THEMES[dayMeta.mood].label : "Neutral";
                        render({
                            text: "✅ Dice results saved",
                            resultHTML: `<div class="kpi">${alloc}<span class="pill">Mood: ${moodLabel}</span><span class="pill">Adjusted hours: ${adjustedHours}h</span></div>`,
                            buttons: [{ label: "Continue", action: next }]
                        });
                    }
                }]
            });
            break;

        // Wave 1: Morning focus
        case 12:
            if (waves.morning.length === 0) { next(); break; }
            runWave(waves.morning, next);
            break;

         // Mini break (case 12) — now uses mood-based duration + activity
        case 13:
            const breakDur = getBreakDurationByMood();
            const breakActivity = pickActivityByMood("break") || randomEnergy();
            render({ 
                text: breakActivity, 
                subtext: `<span class="pill">${breakDur} minutes</span>`,
                buttons: [{ label: "Start", action: () => startTimer(breakDur, next) }, { label: "Skip", variant: "secondary", action: next }]
            });
            break;

        // Lunch
        case 14:
            if (appConfig.fasting && isBeforeIftar()) {
                render({ text: "🧘 Midday reset", subtext: `<span class="pill">10 minutes</span>`, buttons: [{ label: "Start 10 min", action: () => startTimer(10, next) }] });
            } else {
                render({
                    text: "🍽️ Lunch break", subtext: `<span class="pill">20–30 minutes</span>`, buttons: [
                        { label: "Start 25 min", action: () => startTimer(25, next) },
                        { label: "Skip", variant: "secondary", action: next }
                    ]
                });
            }
            break;

        // Wave 2: Afternoon focus + reflection
        case 15:
            if (waves.afternoon.length === 0) {
                askReflection("afternoon", next);
                break;
            }
            runWave(waves.afternoon, () => askReflection("afternoon", next));
            break;

        // Writing + research
        case 16:
            render({ text: "✍️ Writing: reflect on people who look down on themselves", subtext: `<span class="pill">25–50 minutes</span>` });
            startTimer(30, next);
            break;

        case 17:
            render({ text: "💻 Research", subtext: `<span class="pill">25–50 minutes</span>` });
            startTimer(30, next);
            break;

        // Mood changer (case 17) — dynamic pause activities
        case 18:
            const pauseDur = getPauseDurationByMood();
            const pauseActivity = pickActivityByMood("pause") || "🌬️ Breathe";
            render({ 
                text: pauseActivity, 
                subtext: `<span class="pill">${pauseDur} minutes</span>` 
            });
            startTimer(pauseDur, next);
            break;


        
        // Case 18 — energy reset with mood + body awareness
        case 19:
            if (appConfig.fasting && isBeforeIftar()) {
                render({ 
                    text: "🌬️ Light energy reset", 
                    subtext: `<span class="note">${pickActivityByMood("pause") || randomEnergy()}</span>`, 
                    buttons: [{ label: "Done", action: next }] 
                });
            } else {
                const bodyActivity = pickBodyAwareActivity("break") || pickActivityByMood("break") || "🍎 Fruit + water";
                render({ 
                    text: bodyActivity, 
                    buttons: [{ label: "Done", action: next }] 
                });
            }
            break;

        case 20:
            // Move Quran/faith and gentle energy activities to evening when fasting
            if (appConfig.fasting) {
                render({ text: "📖 Quran reading & Adkar", subtext: `<span class="pill">15 minutes</span>` });
                document.getElementById("buttons").appendChild(button("Start 15 min", () => startTimer(15, next)));
                document.getElementById("buttons").appendChild(button("Or do an energy reset", next, "secondary"));
            } else {
                render({ text: "🎧 Listen to relaxing audio or podcast", buttons: [{ label: "Done", action: next }] });
            } break;

        // Wave 3: Night focus
        case 21:
            if (waves.night.length === 0) { next(); break; }
            runWave(waves.night, next);
            break;

        case 22: {
            const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
            render({ text: `✨ Affirmation review${her}`, buttons: [{ label: "Done", action: next }] });
            break;
        }

        // Journaling & Closing
        case 23:
            render({ text: "📝 Journal: one challenge and solution" });
            journalingForm("One challenge and solution", next);
            break;

        case 24:
            render({ text: "📝 Journal: 3 things done well today" });
            journalingForm("3 things done well", next);
            break;

        case 25:
            render({ text: "📝 Reflection: mood, resistance, energy levels" });
            journalingForm("Mood, resistance, energy", next);
            break;

        case 26: {
            const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
            render({ text: `🎉 Congratulate yourself for completing focus sessions${her}`, buttons: [{ label: "Done", action: next }] });
            break;
        }

        case 27:
            render({ text: "🌑 End-of-day message & self-reflection: gratitude / lessons / plan tomorrow" });
            endOfDayForm(() => showDownload());
            break;

        default:
            showDownload();
            break;
    }
}