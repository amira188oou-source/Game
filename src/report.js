// Downloadable report report.js
function formatQA(title, qaArray){
  const lines = [];
  lines.push(title);
  qaArray.forEach(x=>{
    lines.push(`- Question: ${x.q}`);
    lines.push(`  Response: ${x.a || "(no response)"}`);
  });
  lines.push("");
  return lines.join("\n");
}

function buildTxtSummary(){
  const lines = [];
  lines.push("Dark Blue Reset – Day 1");
  lines.push(`Date: ${new Date().toLocaleString()}`);

  if (dayMeta.userProfile){
    lines.push("");
    lines.push("Profile");
    lines.push(`- Name: ${dayMeta.userProfile.name || "-"}`);
    lines.push(`- Energy: ${dayMeta.userProfile.energy ?? "-"}`);
    lines.push(`- Priority: ${dayMeta.userProfile.priority || "-"}`);
    lines.push(`- Focus Hours (planned): ${dayMeta.focusHours}`);
  }

  // Add mood section
  if (dayMeta.mood && MOOD_THEMES[dayMeta.mood]) {
    lines.push("");
    lines.push("Mood & Energy");
    const mood = MOOD_THEMES[dayMeta.mood];
    const boost = Math.round((mood.activityBoost - 1) * 100);
    lines.push(`- Selected Mood: ${mood.label}`);
    lines.push(`- Activity Adjustment: ${boost > 0 ? "+" : ""}${boost}% (${mood.activityBoost.toFixed(1)}x)`);
    lines.push(`- Description: ${mood.description}`);
  }

  if (dayMeta.customSubjects?.length){
    lines.push("");
    lines.push("Custom Subjects");
    dayMeta.customSubjects.forEach(s => 
      lines.push(`- ${s.name} (${s.checklist.length} checklist items)`)
    );
  }

  if (dayMeta.dice){
    lines.push("");
    lines.push("Focus Allocation (Dice)");
    Object.keys(dayMeta.dice).forEach(k => 
      lines.push(`- ${k}: ${dayMeta.dice[k]}%`)
    );
  }

  if (sessionLogs.length){
    lines.push("");
    lines.push("Focus Sessions (Planned vs Actual)");
    sessionLogs.forEach(s=>{
      const actualMin = (s.actualSeconds / 60).toFixed(1);
      lines.push(`- ${s.name}: planned ${s.plannedMinutes} min, actual ${actualMin} min (${s.status})`);
      if (s.notes) lines.push(`  Notes: ${s.notes}`);
      if (s.questions?.length) lines.push(`  Qs/Todos: ${s.questions.join(" | ")}`);
    });
  }
}
  // ... rest of existing code ...

function showDownload(){
  clearUI(); 
  setProgress();

  const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
  document.getElementById("text").innerHTML = `🌙 Bravo! Nhark kaml b wa3i${her}. Tsb7i 3la khir 🌙`;
  document.getElementById("subtext").innerHTML = "Download your daily report.";

  const content = buildTxtSummary();
  const blob = new Blob([content], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `dark-blue-reset-day1-${new Date().toISOString().slice(0,10)}.txt`;
  a.innerText = "⬇️ Download report (.txt)";
  a.className = "pill";
  a.style.display = "inline-block";
  a.style.margin = "8px auto";
  a.style.textAlign = "center";

  const res = document.getElementById("result");
  res.style.display = "block";
  res.appendChild(a);

  document.getElementById("buttons").appendChild(
    button("Restart", ()=>{
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
    }, "secondary")
  );
}
