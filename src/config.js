// Static source data and defaults config.js
const affirmationsArabic = [
    "Ana kafiya b rassi.", "Ma khasnich nkon kamla bach nkon mzyana.",
    "Kan9der ndir li 9drit lyom.", "Chwiya chwiya rah mzyana.", "Rassi kaystahal l7nan."
];
const affirmationsEnglish = [
    "You are enough as you are.", "Your worth is not based on others.",
    "You are capable of achieving your goals.", "Progress is progress, no matter how small.",
    "Be kind to yourself today."
];
const energyStops = ["🍎 Kouli fakiha", "🥜 Kouli chwiya nuts", "💧 Chrbi lma", "🌬️ Tanfos 3 dqaye9"];
const baseFocusSubjects = [
    {
        name: "🔵 Job Search", checklist: [
            "Explore Moroccan freelancing platforms and profiles",
            "See how BI/data engineers promote their skills",
            "Identify 1–2 projects to work on for portfolio",
            "Check LinkedIn/Indeed for job postings / required skills"
        ]
    },
    {
        name: "🟣 Skill Improvement", checklist: [
            "Review job description for BI/data engineer",
            "Identify 1–2 key skills to learn",
            "Small hands-on task (SQL, Python, visualization)",
            "Document what you learned"
        ]
    },
    {
        name: "🟢 Problem Solving (DSA)", checklist: [
            "Pick 1 DSA problem", "Understand problem requirements",
            "Plan brute-force solution", "Optimize solution", "Note confusion points"
        ]
    }
];
const knowledgeQuestions = [
    "Why do databases use indexes and how do they speed up queries?",
    "What’s the difference between synchronous and asynchronous programming?",
    "Explain normalization vs denormalization with examples.",
    "What is a RESTful API and how does it differ from RPC?",
    "What does Big O notation tell you about an algorithm?",
    "What’s the difference between a JOIN and a UNION in SQL?",
    "What is a cache? Give 2 real-world examples in software.",
    "What is the difference between structured, semi-structured, and unstructured data?",
    "How do you handle missing values in a dataset?",
    "What is the difference between a primary key and a foreign key in a database?",
    "What is data normalization, and why is it important?",
    "How would you detect outliers in a dataset?",
    "What is the difference between OLAP and OLTP?",
    "How would you choose KPIs for a sales dashboard?",
    "What is a star schema, and why is it used in BI?",
    "How can data visualization improve decision-making?",
    "Explain the difference between a bar chart, line chart, and heatmap — when to use each."
];
const curiosityPrompts = [
    "What would happen if humans could photosynthesize like plants?",
    "Why do some animals see colors differently than humans?",
    "How do trees “talk” to each other underground ?",
    "Pick a random tech acronym you saw today. What does it stand for and why does it matter?"
];
const reflectionQuestions = [
    "How did you feel (energy, focus, emotion)?",
    "What worked well? What would you change next time?",
    "Any blockers? How will you unblock them tomorrow?"
];
const moodMiniTasks = [
    "👀 Look away from screen for 20 seconds",
    "🧘 3 deep breaths",
    "🚰 Sip water",
    "🤸 Quick shoulder roll",
    "🙂 Smile for 10 seconds"
];

// Default app-wide config (editable in Setup)
let appConfig = {
    fasting: false,
    iftarTime: "18:30",
    suhoorTime: "05:30",
    meals: [
        { label: "Breakfast", time: "08:30", macro: "Protein + fiber + fruit" },
        { label: "Lunch", time: "13:30", macro: "Lean protein + complex carbs + veggies" },
        { label: "Dinner", time: "19:30", macro: "Balanced plate; hydrate well" }
    ],
    foodChallenges: ["2 fruits", "2 bottles water", "No refined sugar at lunch"],
    categories: {
        "🔵 Job Search": "focus",
        "🟣 Skill Improvement": "learning",
        "🟢 Problem Solving (DSA)": "focus",
        "📖 Quran memorization": "faith",
        "📖 Quran reading + Adkar Sabah": "faith"
    },
    sound: {
        notifications: true,
        preEndSeconds: 120,
        volume: 0.5
    },
    bgAudio: {
        enabled: true,
        mode: "none",
        volume: 0.35,
        playlists: { light: [], hype: [], jazz: [], podcast: [] }
    },
    baseSubjectsEditable: JSON.parse(JSON.stringify(baseFocusSubjects))
};