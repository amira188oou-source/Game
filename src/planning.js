// planning.js
function showPlanningForm(onDone){
    clearUI();
    setProgress();

    const moodBoost = dayMeta.mood ? MOOD_THEMES[dayMeta.mood].activityBoost : 1.0;
    
    document.getElementById("text").innerHTML = `⏱️ Gentle planning`;
    document.getElementById("subtext").innerHTML = `Check schedule, calculate time, reserve rest, choose focus sessions<br><span class="note">Activity duration adjusted for your mood (${Math.round(moodBoost * 100)}%)</span>`;

  const c = document.getElementById("checklist");

  const f1 = document.createElement("div");
  f1.className = "field";
  f1.innerHTML = `
    <label>Key commitments today (time blocks)</label>
    <textarea id="plan-commit"></textarea>
  `;

  const f2 = document.createElement("div");
  f2.className = "field";
  f2.innerHTML = `
    <label>Rest & breaks reserved (describe)</label>
    <textarea id="plan-rest"></textarea>
  `;

  const f3 = document.createElement("div");
  f3.className = "field";
  f3.innerHTML = `
    <label>Top 3 outcomes for today</label>
    <textarea id="plan-outcomes"></textarea>
  `;

  c.append(f1, f2, f3);

  const wrapper = document.createElement("div");
  wrapper.className = "field";
  wrapper.innerHTML = `<label>Add your focus subjects (optional)</label>`;

  const list = document.createElement("div");
  list.id = "custom-list";

  const addRow = document.createElement("div");
  addRow.className = "row";
  addRow.innerHTML = `
    <input type="text" id="cs-name" placeholder="Subject name (e.g., 🟡 Portfolio)">
    <textarea id="cs-tasks" placeholder="Checklist items, one per line"></textarea>
  `;

  const addBtn = button("Add Subject", () => {
    const name = (document.getElementById("cs-name").value || "").trim();
    const tasks = (document.getElementById("cs-tasks").value || "")
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    if (!name || tasks.length === 0) return;

    dayMeta.customSubjects.push({ name, checklist: tasks });
    renderCustomList(list);

    document.getElementById("cs-name").value = "";
    document.getElementById("cs-tasks").value = "";
  }, "secondary");

  const res = document.getElementById("result");
    res.style.display = "block";
    res.innerHTML = "";

  wrapper.append(addRow, addBtn, list);
  c.appendChild(wrapper);

  renderCustomList(list);

   document.getElementById("buttons").appendChild(
        button("Continue", () => {
            addNote({ type: "planning", title: "Planning completed", content: "Ready for focus sessions" });
            if (typeof saveAppState === "function") saveAppState();
            onDone && onDone();
        })
    );
}

function renderCustomList(container){
  container.innerHTML = "";

  if (dayMeta.customSubjects.length === 0) {
    container.innerHTML = `
      <div class="note">No custom subjects added yet.</div>
    `;
    return;
  }

  dayMeta.customSubjects.forEach((s, idx) => {
    const item = document.createElement("div");
    item.className = "checklist-item";
    item.innerHTML = `
      <span>${s.name} — ${s.checklist.length} items</span>
    `;

    const rm = button(
      "Remove",
      () => {
        dayMeta.customSubjects.splice(idx, 1);
        renderCustomList(container);
      },
      "ghost"
    );

    item.appendChild(rm);
    container.appendChild(item);
  });
}

function showMoodSelector(onDone) {
    clearUI();
    setProgress();

    document.getElementById("text").innerHTML = `🌅 How are you feeling today?`;
    document.getElementById("subtext").innerHTML = `<span class="note">This will adjust activities and break length throughout your day</span>`;

    const container = document.getElementById("result");
    container.style.display = "block";
    container.innerHTML = "";

    Object.entries(MOOD_THEMES).forEach(([key, mood]) => {
        const card = document.createElement("div");
        card.style.cssText = `
            padding: 16px;
            margin: 8px 0;
            border-radius: 12px;
            background: rgba(${hexToRgb(mood.primary).join(',')}, 0.1);
            border: 2px solid ${mood.primary};
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        card.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">${mood.emoji}</div>
            <div style="font-weight: bold; margin-bottom: 4px;">${mood.label}</div>
            <div style="font-size: 13px; color: var(--muted);">${mood.description}</div>
        `;
        card.onmouseover = () => card.style.transform = "scale(1.05)";
        card.onmouseout = () => card.style.transform = "scale(1)";
        card.onclick = () => {
            dayMeta.mood = key;
            applyMoodTheme(key);
            addNote({ type: "mood", title: "Mood selected", content: mood.label });
            if (typeof saveAppState === "function") saveAppState();
            
            // Continue to planning
            showPlanningForm(onDone);
        };
        container.appendChild(card);
    });
}

function applyMoodTheme(moodKey) {
    const mood = MOOD_THEMES[moodKey];
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty("--primary", mood.primary);
    root.style.setProperty("--accent", mood.accent);
    root.style.setProperty("--bg", mood.bg);
    root.style.setProperty("--card", mood.card);
    
    // Save to localStorage so theme persists
    localStorage.setItem("userMood", moodKey);
}

function loadMoodTheme() {
    const saved = localStorage.getItem("userMood");
    if (saved && MOOD_THEMES[saved]) {
        dayMeta.mood = saved;
        applyMoodTheme(saved);
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];
}
