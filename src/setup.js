// ===============================
// Profile and Setup screens setup.js
// ===============================

function askProfile(onDone) {
    render({
        text: "👋 Welcome! Let's personalize your day.",
        subtext: "These details help adjust timings and suggestions."
    });

    const c = document.getElementById("checklist");
    const row = document.createElement("div");
    row.className = "grid2";

    row.innerHTML = `
    <div class="field">
      <label>Your name (optional)</label>
      <input type="text" id="name">
    </div>

    <div class="field">
      <label>Energy level now (1-10)</label>
      <input type="number" id="energy" min="1" max="10" value="6">
    </div>

    <div class="field">
      <label>Total focus hours for main block</label>
      <input type="number" id="focusHours" min="1" max="10" value="4">
    </div>

    <div class="field">
      <label>How are you feeling today?</label>
      <select id="mood-select">
        <option value="">-- Select mood --</option>
        <option value="energetic">⚡ Energetic</option>
        <option value="calm">🧘 Calm</option>
        <option value="focused">🎯 Focused</option>
        <option value="tired">😴 Tired</option>
        <option value="overwhelmed">😰 Overwhelmed</option>
      </select>
    </div>

    <div class="field">
      <label>How does your body feel?</label>
      <select id="body-select">
        <option value="healthy">🙂 Healthy / fine</option>
         <option value="tiredBody">😓 Tired / heavy</option>
        <option value="headache">🤕 Headache / sensitive</option>
        <option value="coldFlu">🤒 Cold / flu</option>
        <option value="soreMuscles">🦵 Sore muscles</option>
        <option value="injured">🩹 Injured / recovering</option>
      </select>
    </div>
  `;
    c.appendChild(row);
    // Boost Energy button
    document.getElementById("buttons").appendChild(
    button("⚡ Boost Energy", () => {
        window.location.href = "src/energy.html";
    }, "secondary")
);

    document.getElementById("buttons").appendChild(
        button("Continue", () => {
            const name = (document.getElementById("name").value || "").trim();
            const energy = Number(document.getElementById("energy").value || 6);
            const fh = Number(document.getElementById("focusHours").value || 4);
            const moodVal = (document.getElementById("mood-select").value || "").trim();
            const bodyVal = (document.getElementById("body-select").value || "healthy").trim();

            if (!moodVal) {
                alert("Please select a mood to continue");
                return;
            }


            focusHours = Math.max(1, Math.min(10, fh));
            dayMeta.userProfile = { name, energy };
            dayMeta.focusHours = focusHours;
            dayMeta.mood = moodVal;
            dayMeta.bodyCondition = bodyVal;             // Apply mood theme immediately

            if (typeof applyMoodTheme === "function") applyMoodTheme(moodVal);
            if (typeof applyBodyCondition === "function") applyBodyCondition(bodyVal);


            addNote({
                type: "profile",
                title: "Profile",
                content: dayMeta.userProfile
            });

            onDone && onDone();
        })
    );
}

function showSetup(onDone) {
    clearUI();
    render({
        text: "⚙️ Setup your day",
        subtext: "Configure fasting, meals, and main focus subjects."
    });

    const c = document.getElementById("checklist");

    // --- Fasting toggle ---
    const f1 = document.createElement("div");
    f1.className = "field";
    f1.innerHTML = `
        <label>Fasting today?</label>
        <select id="cfg-fasting" onchange="document.getElementById('meals-section').style.display = this.value === 'false' ? 'block' : 'none';">
            <option value="false"${!appConfig.fasting ? " selected" : ""}>No</option>
            <option value="true"${appConfig.fasting ? " selected" : ""}>Yes (Ramadan)</option>
        </select>
    `;
    c.appendChild(f1);

    // --- Iftar/Suhoor times (only show if fasting) ---
    const f2 = document.createElement("div");
    f2.className = "field";
    f2.innerHTML = `
        <label>Iftar time (HH:MM)</label>
        <input type="text" id="cfg-iftar" value="${appConfig.iftarTime || "18:30"}" placeholder="18:30">
    `;
    c.appendChild(f2);

    const f3 = document.createElement("div");
    f3.className = "field";
    f3.innerHTML = `
        <label>Suhoor time (HH:MM)</label>
        <input type="text" id="cfg-suhoor" value="${appConfig.suhoorTime || "05:30"}" placeholder="05:30">
    `;
    c.appendChild(f3);

    // --- Meals list (HIDDEN IF FASTING) ---
    const f4 = document.createElement("div");
    f4.className = "field";
    f4.id = "meals-section";
    f4.style.display = appConfig.fasting ? "none" : "block";
    f4.innerHTML = `<label>Meals (time and macros)</label>`;
    const mealsList = document.createElement("div");
    mealsList.id = "meals-list";
    mealsList.style = "display:flex;flex-direction:column;gap:6px;";

    (appConfig.meals || []).forEach(m => {
        const row = document.createElement("div");
        row.style = "display:flex;gap:6px;align-items:center;";
        row.innerHTML = `
            <input data-k="label" type="text" placeholder="Meal name" value="${m.label || ""}" style="flex:1;">
            <input data-k="time" type="text" placeholder="HH:MM" value="${m.time || ""}" style="flex:0.5;">
            <input data-k="macro" type="text" placeholder="Macro" value="${m.macro || ""}" style="flex:1;">
        `;
        mealsList.appendChild(row);
    });

    f4.appendChild(mealsList);
    c.appendChild(f4);

    // --- Focus subjects editor ---
    renderSubjectsEditor(c);

    // --- Save button ---
    document.getElementById("buttons").appendChild(
        button("Save & Continue", () => {
            const fastingVal = document.getElementById("cfg-fasting").value === "true";
            appConfig.fasting = !!fastingVal;
            appConfig.iftarTime = (document.getElementById("cfg-iftar").value || appConfig.iftarTime).trim();
            appConfig.suhoorTime = (document.getElementById("cfg-suhoor").value || appConfig.suhoorTime).trim();

            // Save meals (only if not fasting)
            if (!appConfig.fasting) {
                const newMeals = [];
                Array.from(mealsList.children).forEach(row => {
                    const label = (row.querySelector('input[data-k="label"]').value || "").trim();
                    const time = (row.querySelector('input[data-k="time"]').value || "").trim();
                    const macro = (row.querySelector('input[data-k="macro"]').value || "").trim();
                    if (label && time) newMeals.push({ label, time, macro });
                });
                if (newMeals.length) appConfig.meals = newMeals;
            }

            collectAndSaveSubjects();
            onDone && onDone();
        })
    );
}

function renderSubjectsEditor(container) {
    const wrapper = document.createElement("div");
    wrapper.id = "setup-subjects";
    wrapper.className = "field";
    wrapper.innerHTML = `<label>Main focus subjects (edit name, category and checklist — one item per line)</label>`;
    const list = document.createElement("div");
    list.id = "subjects-list";
    list.style = "display:flex;flex-direction:column;gap:8px;";

    const renderRow = (sub, idx) => {
        const row = document.createElement("div");
        row.className = "subject-row field";
        row.dataset.idx = idx;
        const catVal = (appConfig.categories && appConfig.categories[sub.name]) || "focus";
        row.innerHTML = `
            <input data-k="name" type="text" placeholder="Subject name" value="${(sub.name || "").replace(/"/g, '&quot;')}">
            <select data-k="cat">
                <option value="focus"${catVal === "focus" ? " selected" : ""}>Focus</option>
                <option value="learning"${catVal === "learning" ? " selected" : ""}>Learning</option>
                <option value="faith"${catVal === "faith" ? " selected" : ""}>Faith</option>
                <option value="health"${catVal === "health" ? " selected" : ""}>Health</option>
            </select>
            <textarea data-k="tasks" placeholder="Checklist (one per line)">${(sub.checklist || []).join("\n")}</textarea>
            <div style="display:flex;gap:6px;margin-top:6px;">
              <button type="button" data-action="remove">Remove</button>
            </div>
        `;
        row.querySelector('[data-action="remove"]').onclick = () => {
            list.removeChild(row);
        };
        return row;
    };

    (appConfig.baseSubjectsEditable || []).forEach((s, i) => {
        list.appendChild(renderRow(s, i));
    });

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.innerText = "+ Add subject";
    addBtn.onclick = () => {
        list.appendChild(renderRow({ name: "New subject", checklist: [] }, list.children.length));
    };

    wrapper.appendChild(list);
    wrapper.appendChild(addBtn);
    container.appendChild(wrapper);
}

function collectAndSaveSubjects() {
    const list = document.getElementById("subjects-list");
    if (!list) return;
    const rows = Array.from(list.querySelectorAll(".subject-row"));
    const newBase = [];
    rows.forEach(r => {
        const name = (r.querySelector('input[data-k="name"]').value || "").trim();
        if (!name) return;
        const cat = r.querySelector('select[data-k="cat"]').value || "focus";
        const tasks = (r.querySelector('textarea[data-k="tasks"]').value || "")
            .split("\n").map(s => s.trim()).filter(Boolean);
        newBase.push({ name, checklist: tasks });
        appConfig.categories = appConfig.categories || {};
        appConfig.categories[name] = cat;
    });
    if (newBase.length) {
        appConfig.baseSubjectsEditable = JSON.parse(JSON.stringify(newBase));
    }
}

