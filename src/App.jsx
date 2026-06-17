import { useState, useEffect } from "react";
// Button replaced with native elements
import { motion, AnimatePresence } from "framer-motion";

/* Safe localStorage — works on server (Vercel SSR) and client */
const ls = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v !== null ? v : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch {} },
  remove: (key) => { try { localStorage.removeItem(key); } catch {} },
  getJSON: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      if (parsed === null || typeof parsed !== "object") return fallback;
      return parsed;
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  },
};


/* ============================================================
   SATURN ROBOTICS — Full Course App
   Screens: landing → signup → onboarding → dashboard → courses
   ============================================================ */

const ALL_COURSES = [
  { id: "arduino", title: "Arduino Basics", emoji: "🤖", bg: "#6C4DFF", accent: "#6C4DFF", tag: "START HERE",
    desc: "Perfect starting point. Learn the fundamentals of microcontrollers with the world's most beginner-friendly board." },
  { id: "esp32",   title: "ESP32",           emoji: "📡", bg: "#111111", accent: "#F2C94C", tag: "INTERMEDIATE",
    desc: "Take your builds wireless. WiFi, Bluetooth, and IoT on a fast dual-core chip." },
  { id: "teensy",  title: "Teensy 4.1",      emoji: "⚡", bg: "#1A1A2E", accent: "#E0AA3E", tag: "ADVANCED",
    desc: "600 MHz ARM powerhouse. Real-time audio, high-speed USB, and serious robotics." },
  { id: "motors",  title: "Motors & Actuators", emoji: "⚙️", bg: "#0F4C35", accent: "#2ECC71", tag: "HANDS-ON",
    desc: "Make things move. Servos, DC motors, steppers, actuators — the muscles of any robot." },
];

const ONBOARDING_QUESTIONS = [
  {
    id: "experience",
    question: "How much experience do you have with electronics?",
    options: [
      { label: "Total beginner 🌱", value: "beginner" },
      { label: "I've done a few projects", value: "some" },
      { label: "Comfortable with Arduino", value: "arduino" },
      { label: "Pretty experienced", value: "advanced" },
    ],
  },
  {
    id: "goal",
    question: "What do you want to build?",
    options: [
      { label: "Robots & automation 🤖", value: "robots" },
      { label: "Smart home / IoT 🏠", value: "iot" },
      { label: "Drones & RC vehicles 🚁", value: "drones" },
      { label: "Not sure yet, just exploring", value: "explore" },
    ],
  },
  {
    id: "board",
    question: "Do you already own a board?",
    options: [
      { label: "Arduino Uno / Nano", value: "arduino" },
      { label: "ESP32", value: "esp32" },
      { label: "Teensy", value: "teensy" },
      { label: "I don't have one yet", value: "none" },
    ],
  },
  {
    id: "time",
    question: "How much time can you dedicate per week?",
    options: [
      { label: "Just 15–30 mins", value: "casual" },
      { label: "About an hour", value: "regular" },
      { label: "A few hours", value: "dedicated" },
      { label: "As much as it takes 🔥", value: "intense" },
    ],
  },
];

function getRecommendations(answers) {
  const recommended = new Set();
  const { experience, goal, board } = answers;

  if (experience === "beginner" || experience === "some") recommended.add("arduino");
  if (experience === "arduino" || experience === "advanced") {
    recommended.add("esp32");
    recommended.add("motors");
  }
  if (experience === "advanced") recommended.add("teensy");
  if (goal === "iot") recommended.add("esp32");
  if (goal === "robots" || goal === "drones") { recommended.add("motors"); recommended.add("arduino"); }
  if (board === "arduino") recommended.add("arduino");
  if (board === "esp32") recommended.add("esp32");
  if (board === "teensy") recommended.add("teensy");
  if (board === "none" || experience === "beginner") recommended.add("arduino");

  return [...recommended];
}

export default function App() {
  const [screen, setScreen] = useState(() => {
    const user = ls.getJSON("saturn_user");
    return user ? "dashboard" : "landing";
  });
  const [user, setUser] = useState(() => ls.getJSON("saturn_user"));
  const [addedCourses, setAddedCourses] = useState(() => {
    const saved = ls.getJSON("saturn_courses");
    return Array.isArray(saved) ? saved : [];
  });
  const [onboardAnswers, setOnboardAnswers] = useState({});
  const [onboardStep, setOnboardStep] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [unlocked, setUnlocked] = useState(() => {
    try { const saved = ls.get("unlockedLessons"); return saved ? Number(saved) : 1; }
    catch { return 1; }
  });

  useEffect(() => { ls.set("unlockedLessons", unlocked); }, [unlocked]);
  useEffect(() => { ls.set("saturn_courses", JSON.stringify(addedCourses)); }, [addedCourses]);

  const arduinoLessons = [
    { id: 1, title: "Ardui-What?!" },
    { id: 2, title: "LEDs are EZ" },
    { id: 3, title: "Wired Up" },
  ];

  const openLesson = (id) => {
    if (id <= unlocked) { setCurrentLesson(id); setScreen("lesson"); }
  };

  const handleSignup = (userData) => {
    setUser(userData);
    ls.set("saturn_user", JSON.stringify(userData));
    setScreen("onboarding");
  };

  const handleOnboardAnswer = (qId, value) => {
    const newAnswers = { ...onboardAnswers, [qId]: value };
    setOnboardAnswers(newAnswers);
    if (onboardStep < ONBOARDING_QUESTIONS.length - 1) {
      setOnboardStep(onboardStep + 1);
    } else {
      const recs = getRecommendations(newAnswers);
      setScreen("recommendations");
    }
  };

  const handleAddCourse = (courseId) => {
    if (!addedCourses.includes(courseId)) {
      setAddedCourses(prev => [...prev, courseId]);
    }
  };

  const handleRemoveCourse = (courseId) => {
    setAddedCourses(prev => prev.filter(id => id !== courseId));
  };

  const handleLogout = () => {
    ls.remove("saturn_user");
    setUser(null);
    setScreen("landing");
    setAddedCourses([]);
    setOnboardAnswers({});
    setOnboardStep(0);
  };

  /* ---- SCREENS ---- */

  if (screen === "landing") return <LandingScreen onSignup={() => setScreen("signup")} onLogin={() => setScreen("login")} />;
  if (screen === "signup") return <SignupScreen onSubmit={handleSignup} onBack={() => setScreen("landing")} />;
  if (screen === "login") return <LoginScreen onSubmit={(u) => { setUser(u); ls.set("saturn_user", JSON.stringify(u)); setScreen("dashboard"); }} onBack={() => setScreen("landing")} />;
  if (screen === "onboarding") return <OnboardingScreen questions={ONBOARDING_QUESTIONS} step={onboardStep} onAnswer={handleOnboardAnswer} userName={user?.name} />;
  if (screen === "recommendations") return (
    <RecommendationsScreen
      recommendations={getRecommendations(onboardAnswers)}
      allCourses={ALL_COURSES}
      addedCourses={addedCourses}
      onAdd={handleAddCourse}
      onRemove={handleRemoveCourse}
      onDone={() => setScreen("dashboard")}
    />
  );

  if (screen === "dashboard") return (
    <DashboardScreen
      user={user}
      addedCourses={addedCourses}
      allCourses={ALL_COURSES}
      onOpenCourse={(courseId) => {
        if (courseId === "arduino") setScreen("arduinoPath");
        if (courseId === "esp32") setScreen("esp32Path");
        if (courseId === "teensy") setScreen("teensyPath");
        if (courseId === "motors") setScreen("motorsPath");
      }}
      onAddCourse={handleAddCourse}
      onRemoveCourse={handleRemoveCourse}
      onLogout={handleLogout}
    />
  );

  if (screen === "arduinoPath") return (
    <PathScreen lessons={arduinoLessons} unlocked={unlocked} openLesson={openLesson}
      title="Arduino Basics 🤖" accentColor="#6C4DFF" onBack={() => setScreen("dashboard")} />
  );
  if (screen === "esp32Path") return <ESP32PathScreen setScreen={setScreen} onBack={() => setScreen("dashboard")} />;
  if (screen === "teensyPath") return <TeensyPathScreen setScreen={setScreen} onBack={() => setScreen("dashboard")} />;
  if (screen === "motorsPath") return <MotorsPathScreen setScreen={setScreen} onBack={() => setScreen("dashboard")} />;

  if (screen === "complete") return (
    <Completion goPath={() => setScreen("arduinoPath")} goNext={() => setScreen("arduinoPath")} hasNext={false} accentColor="#6C4DFF" />
  );

  return (
    <LessonFlow
      lessonId={currentLesson}
      lessons={arduinoLessons}
      finishLesson={() => { if (currentLesson === unlocked) setUnlocked((u) => u + 1); setScreen("complete"); }}
      goPath={() => setScreen("arduinoPath")}
      goNext={() => { setCurrentLesson((id) => id + 1); setScreen("lesson"); }}
    />
  );
}

/* ============================================================
   LANDING SCREEN
   ============================================================ */

function LandingScreen({ onSignup, onLogin }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Subtle grid bg */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 text-center max-w-xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span style={{ fontSize: "2.5rem" }}>🪐</span>
          <span style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>SATURN</span>
        </div>

        <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
          Learn robotics the way nobody taught you
        </h1>
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.55)", marginBottom: "2.5rem", lineHeight: 1.6 }}>
          Real boards. Real projects. Lessons that go beyond Arduino.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
            onClick={onSignup}
            style={{ background: "#6C4DFF", color: "#fff", border: "none", padding: "14px 32px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
          >
            Get started free
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
            onClick={onLogin}
            style={{ background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)", padding: "14px 32px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
          >
            Log in
          </motion.button>
        </div>

        {/* Mini course preview cards */}
        <div className="flex gap-3 justify-center flex-wrap mt-12">
          {ALL_COURSES.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              style={{ background: c.bg, borderRadius: "16px", padding: "14px 18px", minWidth: "120px", textAlign: "center", border: `1px solid ${c.accent}33` }}>
              <div style={{ fontSize: "1.6rem", marginBottom: "4px" }}>{c.emoji}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#fff", opacity: 0.9 }}>{c.title}</div>
              <div style={{ fontSize: "10px", color: c.accent, marginTop: "3px", fontWeight: 600 }}>{c.tag}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   SIGNUP SCREEN
   ============================================================ */

function SignupScreen({ onSubmit, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) return setError("What should we call you?");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      return setError("Enter a valid email.");
    onSubmit({ name: name.trim(), email: trimmedEmail });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "13px", marginBottom: "2rem", padding: 0 }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "2rem" }}>🪐</span>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginTop: "8px" }}>Create your account</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Free forever. No credit card needed.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "6px" }}>Your name</label>
            <input
              value={name} onChange={e => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Alex"
              style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "14px", outline: "none" }}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "6px" }}>Email</label>
            <input
              type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com"
              style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "14px", outline: "none" }}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
          </div>
          {error && <p style={{ fontSize: "12px", color: "#f87171" }}>{error}</p>}
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={submit}
            style={{ background: "#6C4DFF", color: "#fff", border: "none", padding: "13px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginTop: "4px" }}
          >
            Create account →
          </motion.button>
        </div>

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>Log in</button>
        </p>
      </motion.div>
    </div>
  );
}

/* ============================================================
   LOGIN SCREEN
   ============================================================ */

function LoginScreen({ onSubmit, onBack }) {
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "13px", marginBottom: "2rem", padding: 0 }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "2rem" }}>🪐</span>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginTop: "8px" }}>Welcome back</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "14px", outline: "none" }}
          />
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => email && onSubmit({ name: email.split("@")[0], email })}
            style={{ background: "#6C4DFF", color: "#fff", border: "none", padding: "13px", borderRadius: "10px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
          >
            Log in →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   ONBOARDING QUIZ SCREEN
   ============================================================ */

function OnboardingScreen({ questions, step, onAnswer, userName }) {
  const q = questions[step];
  const progress = ((step) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
        {/* Progress */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>Question {step + 1} of {questions.length}</span>
            {step === 0 && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>👋 Hey {userName}!</span>}
          </div>
          <div style={{ height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "99px", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: "100%", background: "#6C4DFF", borderRadius: "99px" }} />
          </div>
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "1.75rem", lineHeight: 1.3 }}>{q.question}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.options.map((opt, i) => (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02, borderColor: "#6C4DFF" }} whileTap={{ scale: 0.97 }}
              onClick={() => onAnswer(q.id, opt.value)}
              style={{ padding: "14px 18px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "15px", fontWeight: 500, cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   RECOMMENDATIONS SCREEN
   ============================================================ */

function RecommendationsScreen({ recommendations, allCourses, addedCourses, onAdd, onRemove, onDone }) {
  const recommended = allCourses.filter(c => recommendations.includes(c.id));
  const rest = allCourses.filter(c => !recommendations.includes(c.id));

  return (
    <div className="min-h-screen bg-black flex flex-col items-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "2.5rem" }}>🎯</span>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginTop: "12px" }}>Here's your path</h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginTop: "6px" }}>Based on your answers, we recommend these courses. Add what looks good.</p>
        </div>

        {/* Recommended */}
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#6C4DFF", letterSpacing: "0.1em", marginBottom: "10px" }}>RECOMMENDED FOR YOU</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {recommended.map((c, i) => (
            <CourseAddCard key={c.id} course={c} added={addedCourses.includes(c.id)} onAdd={onAdd} onRemove={onRemove} delay={i * 0.08} recommended />
          ))}
        </div>

        {/* Rest */}
        {rest.length > 0 && <>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: "10px" }}>OTHER COURSES</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {rest.map((c, i) => (
              <CourseAddCard key={c.id} course={c} added={addedCourses.includes(c.id)} onAdd={onAdd} onRemove={onRemove} delay={(recommended.length + i) * 0.08} />
            ))}
          </div>
        </>}

        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onDone}
          disabled={addedCourses.length === 0}
          style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: addedCourses.length > 0 ? "#6C4DFF" : "rgba(255,255,255,0.1)", color: addedCourses.length > 0 ? "#fff" : "rgba(255,255,255,0.3)", fontSize: "15px", fontWeight: 600, cursor: addedCourses.length > 0 ? "pointer" : "default" }}
        >
          {addedCourses.length > 0 ? `Start learning with ${addedCourses.length} course${addedCourses.length > 1 ? "s" : ""} →` : "Add at least one course"}
        </motion.button>
      </motion.div>
    </div>
  );
}

function CourseAddCard({ course: c, added, onAdd, onRemove, delay = 0, recommended, dark = true }) {
  const titleColor = dark ? "#fff" : "#111827";
  const descColor  = dark ? "rgba(255,255,255,0.45)" : "#6b7280";
  const borderColor = added ? c.accent : dark ? "rgba(255,255,255,0.12)" : "#e5e7eb";
  const bgColor     = added ? `${c.bg}33` : dark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const btnBorder   = added ? c.accent : dark ? "rgba(255,255,255,0.25)" : "#d1d5db";
  const btnBg       = added ? c.accent : "transparent";
  const btnColor    = added ? "#fff" : dark ? "rgba(255,255,255,0.5)" : "#6b7280";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "14px", border: `1.5px solid ${borderColor}`, background: bgColor, transition: "all 0.2s" }}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
        {c.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: titleColor }}>{c.title}</span>
          {recommended && <span style={{ fontSize: "10px", fontWeight: 700, background: "#6C4DFF22", color: "#6C4DFF", padding: "2px 7px", borderRadius: "99px" }}>Recommended</span>}
        </div>
        <p style={{ fontSize: "12px", color: descColor, marginTop: "3px", lineHeight: 1.4 }}>{c.desc}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
        onClick={() => added ? onRemove(c.id) : onAdd(c.id)}
        style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "50%", border: `2px solid ${btnBorder}`, background: btnBg, color: btnColor, fontSize: "18px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
      >
        {added ? "✓" : "+"}
      </motion.button>
    </motion.div>
  );
}

/* ============================================================
   DASHBOARD SCREEN
   ============================================================ */

function DashboardScreen({ user, addedCourses, allCourses, onOpenCourse, onAddCourse, onRemoveCourse, onLogout }) {
  const [showAdd, setShowAdd] = useState(false);
  const myCourses = allCourses.filter(c => addedCourses.includes(c.id));
  const available = allCourses.filter(c => !addedCourses.includes(c.id));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.4rem" }}>🪐</span>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>SATURN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#6C4DFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <button onClick={onLogout} style={{ background: "none", border: "none", fontSize: "12px", color: "#9ca3af", cursor: "pointer" }}>Log out</button>
        </div>
      </div>

      <div style={{ padding: "28px 24px 40px" }}>
        {/* Greeting */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111" }}>Hey {user?.name?.split(" ")[0]} 👋</h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            {myCourses.length > 0 ? "Pick up where you left off." : "Add a course below to get started."}
          </p>
        </div>

        {/* My courses */}
        {myCourses.length > 0 && (
          <>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#6C4DFF", letterSpacing: "0.1em", marginBottom: "12px" }}>MY COURSES</p>
            <div className="flex gap-4 flex-wrap" style={{ marginBottom: "32px" }}>
              {myCourses.map((course, i) => (
                <motion.button
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.6, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 16, delay: i * 0.1 }}
                  whileHover={{ scale: 1.08, boxShadow: "0 12px 36px rgba(0,0,0,0.18)" }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onOpenCourse(course.id)}
                  style={{ background: course.bg, width: "148px", height: "148px", borderRadius: "24px", border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}
                >
                  <motion.span style={{ fontSize: "2rem" }} whileHover={{ rotate: [0,-10,10,-6,6,0], transition:{duration:0.5} }}>{course.emoji}</motion.span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{course.title}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, background: "rgba(255,255,255,0.2)", color: "#fff", padding: "3px 10px", borderRadius: "99px", letterSpacing: "0.06em" }}>{course.tag}</span>
                </motion.button>
              ))}

              {/* Add course tile */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowAdd(true)}
                style={{ width: "148px", height: "148px", borderRadius: "24px", border: "3px dashed #d1d5db", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", color: "#9ca3af" }}
              >
                <span style={{ fontSize: "1.8rem" }}>+</span>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>Add course</span>
              </motion.button>
            </div>
          </>
        )}

        {/* Empty state */}
        {myCourses.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "40px 20px", border: "2px dashed #e5e7eb", borderRadius: "20px", marginBottom: "32px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🚀</div>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>No courses yet</p>
            <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "20px" }}>Add a course to start your robotics journey</p>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowAdd(true)}
              style={{ background: "#6C4DFF", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              Browse courses
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px", width: "100%", maxWidth: "520px" }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Add a course</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: "32px", height: "32px", fontSize: "16px", cursor: "pointer", color: "#6b7280" }}>✕</button>
              </div>

              {available.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#6b7280", textAlign: "center", padding: "20px 0" }}>You've added all available courses! 🎉</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {available.map(c => (
                    <CourseAddCard key={c.id} course={c} added={false} onAdd={(id) => { onAddCourse(id); }} onRemove={() => {}} delay={0} dark={false} />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   HOME / COURSE SELECTION SCREEN
   ============================================================ */

function CourseScreen({ courses, openCourse }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-10 px-4 py-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-black tracking-tight">SATURN Robotics</h1>
        <p className="text-gray-500 mt-2 text-base">Choose your next board. Start building.</p>
      </div>

      <div className="flex gap-6 flex-wrap justify-center">
        {courses.map((course, i) => (
          <motion.button
            key={course.id}
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 16, delay: i * 0.13 }}
            whileHover={{ scale: 1.1, boxShadow: "0 16px 48px rgba(0,0,0,0.22)" }}
            whileTap={{ scale: 0.93 }}
            onClick={() => openCourse(course.id)}
            style={{ background: course.bg, color: "#ffffff" }}
            className="w-56 h-44 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-2"
          >
            <motion.span
              style={{ fontSize: "2rem", display: "block" }}
              whileHover={{ rotate: [0, -10, 10, -6, 6, 0], transition: { duration: 0.5 } }}
            >
              {course.emoji}
            </motion.span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>{course.title}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", color: "#ffffff", padding: "3px 12px", borderRadius: 99, letterSpacing: "0.08em" }}>
              {course.tag}
            </span>
          </motion.button>
        ))}
      </div>

      <button className="border-4 border-dashed border-[#6C4DFF] text-[#6C4DFF] px-8 py-4 rounded-2xl font-bold hover:bg-[#F4F4F6] transition">
        + Add Course
      </button>
    </div>
  );
}

/* ============================================================
   GENERIC PATH SCREEN (used by Arduino)
   ============================================================ */

function PathScreen({ lessons, unlocked, openLesson, title, accentColor = "#6C4DFF", onBack }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-10 py-12">
      <h1 className="text-4xl font-bold text-black">{title}</h1>

      <div className="flex flex-col gap-8 items-center">
        {lessons.map((l, i) => (
          <div key={l.id} className="flex flex-col items-center gap-2">
            <motion.button
              onClick={() => openLesson(l.id)}
              initial={{ opacity: 0, scale: 0.4, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.12 }}
              whileHover={l.id <= unlocked ? { scale: 1.13, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" } : {}}
              whileTap={l.id <= unlocked ? { scale: 0.95 } : {}}
              className="w-32 h-32 rounded-full shadow-xl text-sm font-bold flex items-center justify-center text-center p-4 border-4"
              style={l.id <= unlocked
                ? { background: accentColor, color: "#ffffff", borderColor: "#000000", cursor: "pointer" }
                : { background: "#e5e7eb", color: "#9ca3af", borderColor: "#d1d5db", cursor: "default" }
              }
            >
              {l.id > unlocked && <span className="text-lg mr-1">🔒</span>}
              {l.title}
            </motion.button>
            {i < lessons.length - 1 && (
              <motion.div
                className="w-0.5 bg-gray-200"
                initial={{ height: 0 }}
                animate={{ height: 24 }}
                transition={{ delay: i * 0.12 + 0.1, duration: 0.2 }}
              />
            )}
          </div>
        ))}
      </div>

      {onBack && (
        <button onClick={onBack} style={{background:"transparent",border:"1.5px solid #e5e7eb",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",color:"#6b7280",cursor:"pointer",fontWeight:500}}>← Back</button>
      )}
    </div>
  );
}

/* ============================================================
   ESP32 PATH SCREEN (self-contained)
   ============================================================ */

function ESP32PathScreen({ setScreen, onBack }) {
  const [lessonId, setLessonId] = useState(null);

  const esp32Lessons = [
    {
      id: 1,
      title: "Introduction",
      pages: [
        <p>ESP32 is a microcontroller with built-in WiFi + Bluetooth.</p>,
        <p>It is designed for IoT, robotics, and wireless systems.</p>,
        <p>Think of it as Arduino's smarter, internet-connected sibling.</p>,
      ],
      interactive: <ESP32IntroInteractive />,
      questions: [
        { q: "ESP32 is used for…", options: ["Cooking", "WiFi devices", "Drawing"], answer: 1, why: "It enables internet-connected systems." },
        { q: "ESP32 includes…", options: ["WiFi", "No power", "Only sensors"], answer: 0, why: "WiFi is built in." },
        { q: "Best use case?", options: ["IoT robots", "Paper writing", "Music only"], answer: 0, why: "It powers smart devices." },
      ],
    },
    {
      id: 2,
      title: "How to Use GPIO",
      pages: [
        <p>GPIO pins let ESP32 interact with the real world.</p>,
        <p>They can be inputs (reading sensors) or outputs (controlling devices).</p>,
        <p>This is how robots sense and react.</p>,
      ],
      interactive: <ESP32GPIOInteractive />,
      questions: [
        { q: "GPIO means…", options: ["Game Output", "General Purpose Input Output", "Ground Pin Output"], answer: 1, why: "That's the correct meaning." },
        { q: "Input pins…", options: ["Send data", "Receive data", "Store energy"], answer: 1, why: "They read signals." },
        { q: "Output pins…", options: ["Control devices", "Store files", "Charge board"], answer: 0, why: "They control hardware." },
      ],
    },
    {
      id: 3,
      title: "PWM + Motors",
      pages: [
        <p>PWM controls motor speed using rapid ON/OFF switching.</p>,
        <p>This creates smooth control instead of just ON or OFF.</p>,
        <p>Used in drones, robots, and RC systems.</p>,
      ],
      interactive: <ESP32PWMInteractive />,
      questions: [
        { q: "PWM controls…", options: ["Speed", "WiFi", "Memory"], answer: 0, why: "It adjusts power levels." },
        { q: "PWM works by…", options: ["Analog writing", "Rapid switching", "Bluetooth"], answer: 1, why: "It simulates power." },
        { q: "Used in…", options: ["Motors", "Only screens", "Passwords"], answer: 0, why: "It controls movement." },
      ],
    },
  ];

  const selected = esp32Lessons.find((l) => l.id === lessonId);

  if (lessonId !== null) {
    return (
      <LessonTemplate
        title={selected.title}
        pages={selected.pages}
        interactive={selected.interactive}
        questions={selected.questions}
        accentColor="#F2C94C"
        darkBg="#1a1a1a"
        finishLesson={() => setLessonId(null)}
        goPath={() => setLessonId(null)}
        goNext={() => setLessonId((id) => Math.min(id + 1, 3))}
        hasNext={lessonId < 3}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-10 py-12">
      <h1 className="text-4xl font-bold text-black">ESP32 📡</h1>

      <div className="flex flex-col gap-8 items-center">
        {esp32Lessons.map((lesson, i) => (
          <div key={lesson.id} className="flex flex-col items-center gap-2">
            <motion.button
              onClick={() => setLessonId(lesson.id)}
              initial={{ opacity: 0, scale: 0.4, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.12 }}
              whileHover={{ scale: 1.13, boxShadow: "0 8px 32px rgba(242,201,76,0.35)" }}
              whileTap={{ scale: 0.95 }}
              className="w-32 h-32 rounded-full shadow-xl text-sm font-bold flex items-center justify-center text-center p-4 border-4"
              style={{ background: "#111111", color: "#ffffff", borderColor: "#F2C94C", cursor: "pointer" }}
            >
              {lesson.title}
            </motion.button>
            {i < esp32Lessons.length - 1 && (
              <motion.div
                className="w-0.5 bg-gray-200"
                initial={{ height: 0 }}
                animate={{ height: 24 }}
                transition={{ delay: i * 0.12 + 0.1, duration: 0.2 }}
              />
            )}
          </div>
        ))}
      </div>

      <button onClick={() => onBack ? onBack() : setScreen("home")} style={{background:"transparent",border:"1.5px solid #e5e7eb",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",color:"#6b7280",cursor:"pointer",fontWeight:500}}>← Back</button>
    </div>
  );
}

/* ============================================================
   TEENSY 4.1 PATH SCREEN (self-contained)
   ============================================================ */

function TeensyPathScreen({ setScreen, onBack }) {
  const [lessonId, setLessonId] = useState(null);
  const [unlockedTeensy, setUnlockedTeensy] = useState(() =>
    (() => { try { return parseInt(ls.get("teensy_unlocked") || "1"); } catch { return 1; } })()
  );

  const teensyLessons = [
    {
      id: 1,
      title: "What is Teensy 4.1?",
      pages: [
        <p>The Teensy 4.1 runs on the NXP iMXRT1062 — a 600 MHz ARM Cortex-M7 processor. That's roughly <strong>30x faster</strong> than an Arduino Uno.</p>,
        <p>It packs 8 MB of flash, 1 MB RAM, and an optional MicroSD slot. It can even be expanded with soldered PSRAM chips for up to 16 MB of extra memory.</p>,
        <p>While Arduino targets simple control and ESP32 targets wireless IoT, Teensy 4.1 is built for real-time DSP, high-speed USB, audio processing, and complex robotics.</p>,
      ],
      interactive: <TeensyMemoryInteractive />,
      questions: [
        { q: "What processor does Teensy 4.1 use?", options: ["ATmega328P", "ARM Cortex-M7", "Xtensa LX6", "RISC-V"], answer: 1, why: "It uses the NXP iMXRT1062 — an ARM Cortex-M7 running at 600 MHz." },
        { q: "How does Teensy 4.1 compare in speed to Arduino Uno?", options: ["Same speed", "2x faster", "~30x faster", "Slower"], answer: 2, why: "600 MHz vs ~16 MHz is roughly a 30x clock speed advantage." },
        { q: "Teensy 4.1 is best suited for...", options: ["Blinking LEDs only", "Simple WiFi sensors", "Real-time audio + complex robotics", "Beginner sketches"], answer: 2, why: "Its speed and DSP hardware make it ideal for audio processing and high-performance robotics." },
      ],
    },
    {
      id: 2,
      title: "GPIO Deep Dive",
      pages: [
        <p>Teensy 4.1 exposes <strong>55 digital I/O pins</strong> — compare that to Arduino Uno's 14. Most pins support multiple roles: PWM, serial, SPI, I2C, CAN bus, and more.</p>,
        <p>⚠️ Critical: Teensy 4.1 GPIO operates at <strong>3.3V logic</strong>, not 5V like Arduino Uno. Connecting 5V signals directly can permanently damage the board. Always use a level shifter.</p>,
        <p>Pin switching on Teensy can happen in <strong>nanoseconds</strong> rather than microseconds. This makes it possible to bit-bang high-speed protocols that would be impossible on slower boards.</p>,
      ],
      interactive: <TeensyGPIOInteractive />,
      questions: [
        { q: "What voltage does Teensy 4.1 GPIO operate at?", options: ["5V", "3.3V", "1.8V", "12V"], answer: 1, why: "Teensy 4.1 is a 3.3V board. Applying 5V to pins without a level shifter can fry it permanently." },
        { q: "How many digital I/O pins does Teensy 4.1 have?", options: ["14", "30", "55", "8"], answer: 2, why: "Teensy 4.1 exposes 55 digital I/O pins across its headers." },
        { q: "To safely connect a 5V Arduino to Teensy, you need a...", options: ["Big resistor", "Level shifter", "Capacitor", "Nothing, it's fine"], answer: 1, why: "A bidirectional level shifter safely converts between 5V and 3.3V logic levels." },
      ],
    },
    {
      id: 3,
      title: "PWM & Audio",
      pages: [
        <p>Teensy 4.1 supports up to <strong>32 PWM output pins</strong> running at up to 4.6 MHz — compare Arduino Uno's 6 pins at ~490 Hz. This means incredibly precise motor and servo control.</p>,
        <p>The <strong>Teensy Audio Library</strong> by PJRC lets you route, mix, synthesize, and filter audio in real-time with zero external DSP hardware. Everything runs on-chip.</p>,
        <p>Audio "objects" chain together like synth nodes: oscillator → filter → mixer → output. The free Audio System Design Tool at pjrc.com lets you design visually and export code instantly.</p>,
      ],
      interactive: <TeensyPWMInteractive />,
      questions: [
        { q: "How many PWM pins does Teensy 4.1 support?", options: ["6", "12", "32", "4"], answer: 2, why: "Teensy 4.1 can run PWM on up to 32 pins simultaneously — far beyond Arduino's 6." },
        { q: "What does the Teensy Audio Library do?", options: ["Streams Spotify", "Real-time audio processing on-chip", "Stores audio files", "Downloads samples"], answer: 1, why: "It provides a full real-time audio pipeline — oscillators, filters, mixers — that runs entirely on the Teensy." },
        { q: "PWM frequency on Teensy 4.1 maxes out at...", options: ["490 Hz", "20 kHz", "~4.6 MHz", "1 GHz"], answer: 2, why: "Teensy 4.1 supports PWM up to ~4.6 MHz — about 10,000x faster than Arduino Uno's default." },
      ],
    },
  ];

  const selected = teensyLessons.find((l) => l.id === lessonId);

  if (lessonId !== null) {
    return (
      <LessonTemplate
        title={selected.title}
        pages={selected.pages}
        interactive={selected.interactive}
        questions={selected.questions}
        accentColor="#E0AA3E"
        darkBg="#1A1A2E"
        finishLesson={() => {
          if (lessonId === unlockedTeensy) {
            const next = unlockedTeensy + 1;
            setUnlockedTeensy(next);
            ls.set("teensy_unlocked", next);
          }
          setLessonId(null);
        }}
        goPath={() => setLessonId(null)}
        goNext={() => setLessonId((id) => Math.min(id + 1, teensyLessons.length))}
        hasNext={lessonId < teensyLessons.length}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-10 py-12">
      <div className="text-center">
        <span className="text-xs font-bold tracking-widest text-[#E0AA3E] uppercase">Advanced</span>
        <h1 className="text-4xl font-bold text-black mt-1">Teensy 4.1 ⚡</h1>
        <p className="text-gray-500 text-sm mt-1">600 MHz. Real-time. No more training wheels.</p>
      </div>

      <div className="flex flex-col gap-8 items-center">
        {teensyLessons.map((lesson, i) => {
          const locked = lesson.id > unlockedTeensy;
          return (
            <div key={lesson.id} className="flex flex-col items-center gap-2">
              <motion.button
                onClick={() => !locked && setLessonId(lesson.id)}
                initial={{ opacity: 0, scale: 0.4, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.12 }}
                whileHover={!locked ? { scale: 1.13, boxShadow: "0 8px 32px rgba(224,170,62,0.35)" } : {}}
                whileTap={!locked ? { scale: 0.95 } : {}}
                className="w-32 h-32 rounded-full shadow-xl text-sm font-bold flex items-center justify-center text-center p-4 border-4"
                style={locked
                  ? { background: "#e5e7eb", color: "#9ca3af", borderColor: "#d1d5db", cursor: "default" }
                  : { background: "#1A1A2E", color: "#ffffff", borderColor: "#E0AA3E", cursor: "pointer" }
                }
              >
                {locked && <span className="text-lg mr-1">🔒</span>}
                {lesson.title}
              </motion.button>
              {i < teensyLessons.length - 1 && (
                <motion.div
                  className="w-0.5 bg-gray-200"
                  initial={{ height: 0 }}
                  animate={{ height: 24 }}
                  transition={{ delay: i * 0.12 + 0.1, duration: 0.2 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => onBack ? onBack() : setScreen("home")} style={{background:"transparent",border:"1.5px solid #e5e7eb",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",color:"#6b7280",cursor:"pointer",fontWeight:500}}>← Back</button>
    </div>
  );
}

/* ============================================================
   TEENSY INTERACTIVE COMPONENTS
   ============================================================ */

function TeensyMemoryInteractive() {
  const [used, setUsed] = useState(35);
  return (
    <div className="space-y-4">
      <p className="font-semibold text-sm">RAM Usage Simulator — 1 MB total</p>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${used}%`, background: used > 80 ? "#ef4444" : "#E0AA3E" }}
        />
      </div>
      <p className="text-sm text-gray-500">{used}% used — {Math.round((1024 * used) / 100)} KB of 1024 KB</p>
      <div className="flex gap-2">
        <button onClick={() => setUsed((u) => Math.min(u + 15, 100))} style={{flex:1,padding:"8px",borderRadius:"8px",border:"none",background:"#1A1A2E",color:"#E0AA3E",fontWeight:600,fontSize:"13px",cursor:"pointer"}}>+ Load buffer</button>
        <button onClick={() => setUsed(u => Math.max(u-15,5))} style={{flex:1,padding:"8px",borderRadius:"8px",border:"1.5px solid #e5e7eb",background:"transparent",color:"#374151",fontWeight:500,fontSize:"13px",cursor:"pointer"}}>- Free buffer</button>
      </div>
      <p className="text-xs text-gray-400">Arduino Uno only has 2 KB. Teensy gives you 512x more.</p>
    </div>
  );
}

function TeensyGPIOInteractive() {
  const [on, setOn] = useState(false);
  return (
    <div className="space-y-4">
      <p className="font-semibold text-sm">GPIO Pin 13 — 3.3V Logic</p>
      <div
        className="h-20 rounded-xl flex items-center justify-center font-bold text-lg transition-all"
        style={{
          background: on ? "#1A1A2E" : "#f1f5f9",
          color: on ? "#E0AA3E" : "#94a3b8",
          border: `2px solid ${on ? "#E0AA3E" : "#e2e8f0"}`,
        }}
      >
        {on ? "HIGH — 3.3V ⚡" : "LOW — 0V"}
      </div>
      <button onClick={() => setOn(!on)} style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:"#1A1A2E",color:"#E0AA3E",fontWeight:600,fontSize:"14px",cursor:"pointer"}}>
        Toggle Pin</button>
      <p className="text-xs text-gray-400">⚠️ On Arduino Uno this would be 5V — different logic level!</p>
    </div>
  );
}

function TeensyPWMInteractive() {
  const [speed, setSpeed] = useState(50);
  const voltage = ((speed / 100) * 3.3).toFixed(1);
  return (
    <div className="space-y-4">
      <p className="font-semibold text-sm">PWM Duty Cycle — up to 32 pins simultaneously</p>
      <input
        type="range"
        min="0"
        max="100"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="w-full accent-yellow-500"
      />
      <div className="h-6 bg-gray-100 rounded-xl overflow-hidden">
        <div
          className="h-full rounded-xl transition-all duration-150"
          style={{ width: `${speed}%`, background: "#E0AA3E" }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-bold" style={{ color: "#E0AA3E" }}>{speed}% duty cycle</span>
        <span className="text-gray-500">~{voltage}V effective</span>
      </div>
      <p className="text-xs text-gray-400">Teensy PWM frequency: up to 4.6 MHz vs Arduino's ~490 Hz default</p>
    </div>
  );
}

/* ============================================================
   ESP32 INTERACTIVE COMPONENTS (unchanged)
   ============================================================ */

function ESP32IntroInteractive() {
  const [connected, setConnected] = useState(false);
  return (
    <div className="space-y-4">
      <p className="font-semibold">WiFi Connection Simulator</p>
<button onClick={() => setConnected(!connected)} style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:"#6C4DFF",color:"#fff",fontWeight:600,fontSize:"14px",cursor:"pointer"}}>{connected ? "Disconnect" : "Connect"}</button>
      <p>Status: {connected ? "Connected 📡" : "Offline ❌"}</p>
    </div>
  );
}

function ESP32GPIOInteractive() {
  const [led, setLed] = useState(false);
  return (
    <div className="space-y-4">
      <p className="font-semibold">GPIO LED Control</p>
      <div className={`h-20 flex items-center justify-center rounded-xl text-white ${led ? "bg-green-500" : "bg-gray-400"}`}>
        {led ? "ON 💡" : "OFF"}
      </div>
<button onClick={() => setLed(!led)} style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:"#6C4DFF",color:"#fff",fontWeight:600,fontSize:"14px",cursor:"pointer"}}>Toggle</button>
    </div>
  );
}

function ESP32PWMInteractive() {
  const [speed, setSpeed] = useState(0);
  return (
    <div className="space-y-4">
      <p className="font-semibold">Motor Speed (PWM)</p>
      <input type="range" min="0" max="100" value={speed} onChange={(e) => setSpeed(e.target.value)} className="w-full" />
      <div className="h-6 bg-black rounded-xl overflow-hidden">
        <div className="h-full bg-[#F2C94C] transition-all" style={{ width: `${speed}%` }} />
      </div>
      <p>Speed: {speed}%</p>
    </div>
  );
}

/* ============================================================
   SHARED LESSON TEMPLATE
   ============================================================ */

function LessonTemplate({ title, pages, interactive, questions, accentColor = "#6C4DFF", darkBg, finishLesson, goPath, goNext, hasNext }) {
  const [step, setStep] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [result, setResult] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const totalSteps = pages.length + 1 + questions.length;
  const currentProgress = step < pages.length
    ? step
    : step === pages.length
    ? pages.length
    : pages.length + 1 + quizIndex;
  const progressPct = Math.round((currentProgress / totalSteps) * 100);

  useEffect(() => {
    if (!completed && quizIndex >= questions.length) {
      setCompleted(true);
      finishLesson();
    }
  }, [quizIndex]);

  // Only set background on the card — never color, to avoid cascading into children
  const cardStyle = darkBg ? { background: darkBg, borderColor: accentColor } : {};
  // Text colors for elements sitting directly on the card background
  const headingColor = darkBg ? "#ffffff" : "#111827";
  const bodyColor    = darkBg ? "rgba(255,255,255,0.75)" : "#374151";
  const btnStyle     = { background: accentColor, color: darkBg ? darkBg : "#fff", border: "none" };

  if (step < pages.length) {
    return (
      <CenterCard title={title} titleColor={headingColor} style={cardStyle} accentColor={accentColor} progress={progressPct}
        onBack={() => setShowExitConfirm(true)} showExitConfirm={showExitConfirm}
        onConfirmExit={goPath} onCancelExit={() => setShowExitConfirm(false)}>
        <div className="text-sm mb-2" style={{ color: bodyColor, opacity: 0.7 }}>
          Page {step + 1} of {pages.length}
        </div>
        <div className="text-base leading-relaxed" style={{ color: bodyColor }}>
          {pages[step]}
        </div>
<button onClick={() => setStep(step+1)} style={{...btnStyle,width:"100%",padding:"10px 16px",borderRadius:"10px",border:"none",fontSize:"14px",fontWeight:600,cursor:"pointer",marginTop:"12px"}}>Continue →</button>
      </CenterCard>
    );
  }

  if (step === pages.length) {
    return (
      <CenterCard title="Try It" titleColor={headingColor} style={cardStyle} accentColor={accentColor} progress={progressPct}
        onBack={() => setShowExitConfirm(true)} showExitConfirm={showExitConfirm}
        onConfirmExit={goPath} onCancelExit={() => setShowExitConfirm(false)}>
        {/* Interactives always render on a white/light surface regardless of card theme */}
        <div className="bg-white rounded-xl p-4 text-gray-800">
          {interactive}
        </div>
<button onClick={() => setStep(step+1)} style={{...btnStyle,width:"100%",padding:"10px 16px",borderRadius:"10px",border:"none",fontSize:"14px",fontWeight:600,cursor:"pointer",marginTop:"12px"}}>Continue to Quiz →</button>
      </CenterCard>
    );
  }

  if (quizIndex < questions.length) {
    const q = questions[quizIndex];
    return (
      <CenterCard title="Quiz" titleColor={headingColor} style={cardStyle} accentColor={accentColor} progress={progressPct}
        onBack={() => setShowExitConfirm(true)} showExitConfirm={showExitConfirm}
        onConfirmExit={goPath} onCancelExit={() => setShowExitConfirm(false)}>
        <p className="font-semibold mb-4 text-base" style={{ color: headingColor }}>{q.q}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let optStyle = { background: "#ffffff", color: "#1f2937", borderColor: "#e5e7eb" };
            if (result !== null) {
              if (i === q.answer)
                optStyle = { background: "#dcfce7", color: "#166534", borderColor: "#86efac" };
              else if (i === result && result !== q.answer)
                optStyle = { background: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" };
            }
            return (
              <button
                key={i}
                onClick={() => result === null && setResult(i)}
                style={optStyle}
                className="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors hover:opacity-90"
              >
                {opt}
              </button>
            );
          })}
        </div>

        {result !== null && (
          <div className="mt-4 space-y-2">
            <p className="font-bold" style={{ color: result === q.answer ? "#16a34a" : "#dc2626" }}>
              {result === q.answer ? "✓ Correct!" : "✗ Not quite"}
            </p>
            <button
              onClick={() => setShowWhy(!showWhy)}
              style={{
                background: "transparent",
                border: `2px solid ${accentColor}`,
                color: accentColor,
                padding: "4px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              WHY?
            </button>
            {showWhy && (
              <div className="text-sm p-3 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                {q.why}
              </div>
            )}
            <button
              onClick={() => { setQuizIndex(quizIndex + 1); setResult(null); setShowWhy(false); }}
              style={{ borderRadius: "10px", border: "none", padding: "10px 16px", background: accentColor, color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer", width: "100%" }}
            >
              Next →
            </button>
          </div>
        )}
      </CenterCard>
    );
  }

  return <Completion goPath={goPath} goNext={goNext} hasNext={hasNext} accentColor={accentColor} />;
}

function CenterCard({ title, titleColor = "#111827", children, style = {}, accentColor = "#6C4DFF", progress = 0, onBack, showExitConfirm, onConfirmExit, onCancelExit }) {
  return (
    <div className="min-h-screen bg-[#F4F4F6] flex items-center justify-center p-4">
      <div style={{ width: "100%", maxWidth: "580px", borderRadius: "16px", border: `4px solid ${accentColor}`, overflow: "hidden", ...style }}>
        <div style={{ height: "6px", background: "#f3f4f6" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: accentColor, transition: "width 0.5s" }} />
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                onClick={onBack}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: titleColor, opacity: 0.5, fontSize: "13px", padding: "4px 0", display: "flex", alignItems: "center", gap: "4px" }}
              >
                ← Back
              </button>
              {showExitConfirm && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 50,
                  background: "#ffffff", border: "2px solid #e5e7eb", borderRadius: "12px",
                  padding: "12px 14px", width: "210px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
                    Leave this lesson?
                  </p>
                  <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px", lineHeight: 1.4 }}>
                    Your progress on this lesson will be lost.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={onConfirmExit}
                      style={{ flex: 1, padding: "6px 0", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                    >
                      Leave
                    </button>
                    <button
                      onClick={onCancelExit}
                      style={{ flex: 1, padding: "6px 0", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "transparent", color: "#374151", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                    >
                      Stay
                    </button>
                  </div>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold" style={{ color: titleColor }}>{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ARDUINO LESSON FLOW (preserves original structure)
   ============================================================ */

function LessonFlow({ lessonId, lessons, finishLesson, goPath, goNext }) {
  const lessonMap = {
    1: LessonArduino,
    2: LessonLED,
    3: LessonWires,
  };
  const LessonComponent = lessonMap[lessonId];
  return <LessonComponent finishLesson={finishLesson} goPath={goPath} goNext={goNext} hasNext={lessonId < lessons.length} />;
}

/* ============================================================
   ARDUINO LESSON STUBS (expand these with your real content)
   ============================================================ */

function LessonArduino({ finishLesson, goPath, goNext, hasNext }) {
  return (
    <LessonTemplate
      title="Ardui-What?!"
      accentColor="#6C4DFF"
      pages={[
        <p>Arduino is an open-source electronics platform based on easy-to-use hardware and software.</p>,
        <p>The most popular board is the Uno — an ATmega328P running at 16 MHz with 32 KB flash and 2 KB RAM.</p>,
        <p>You write code in the Arduino IDE using a simplified C++, then upload it over USB. That's it — no OS, no drivers, just code running on metal.</p>,
      ]}
      interactive={<ArduinoIntroInteractive />}
      questions={[
        { q: "What language does Arduino use?", options: ["Python", "Simplified C++", "JavaScript", "Rust"], answer: 1, why: "Arduino sketches are simplified C++ that compiles down to native AVR machine code." },
        { q: "How fast is Arduino Uno's processor?", options: ["600 MHz", "240 MHz", "16 MHz", "1 GHz"], answer: 2, why: "The ATmega328P on Arduino Uno runs at 16 MHz — great for beginners, limited for complex tasks." },
        { q: "How do you upload code to Arduino?", options: ["WiFi", "Bluetooth", "USB", "SD card"], answer: 2, why: "Arduino uses a USB connection and a bootloader to receive new sketches." },
      ]}
      finishLesson={finishLesson}
      goPath={goPath}
      goNext={goNext}
      hasNext={hasNext}
    />
  );
}

function LessonLED({ finishLesson, goPath, goNext, hasNext }) {
  return (
    <LessonTemplate
      title="LEDs are EZ"
      accentColor="#6C4DFF"
      pages={[
        <p>An LED (Light Emitting Diode) only lets current flow one way — get it backwards and it won't light up (but it also won't break).</p>,
        <p>Always use a resistor with an LED. Without one, too much current flows and the LED burns out instantly. A 220Ω resistor is the classic choice.</p>,
        <p>In Arduino code: <code>pinMode(13, OUTPUT)</code> sets pin 13 as output, and <code>digitalWrite(13, HIGH)</code> turns it on.</p>,
      ]}
      interactive={<LEDInteractive />}
      questions={[
        { q: "Why do you need a resistor with an LED?", options: ["To make it brighter", "To limit current", "To change color", "It's optional"], answer: 1, why: "Without a current-limiting resistor, the LED draws too much current and instantly burns out." },
        { q: "What does pinMode(13, OUTPUT) do?", options: ["Reads pin 13", "Sets pin 13 as output", "Deletes pin 13", "Reads voltage"], answer: 1, why: "pinMode() configures a pin as either INPUT or OUTPUT before using it." },
        { q: "What's a typical resistor value for LEDs?", options: ["10Ω", "1MΩ", "220Ω", "0Ω"], answer: 2, why: "220Ω is the standard starting value — it limits current while keeping the LED bright enough to see." },
      ]}
      finishLesson={finishLesson}
      goPath={goPath}
      goNext={goNext}
      hasNext={hasNext}
    />
  );
}

function LessonWires({ finishLesson, goPath, goNext, hasNext }) {
  return (
    <LessonTemplate
      title="Wired Up"
      accentColor="#6C4DFF"
      pages={[
        <p>A breadboard lets you prototype circuits without soldering. Rows are connected horizontally; the two long rails on the sides are power and ground.</p>,
        <p>Jumper wires connect your Arduino pins to components on the breadboard. Color coding helps: red = power (5V), black = ground (GND).</p>,
        <p>Getting a short circuit (accidentally connecting power directly to ground) won't necessarily break Arduino — it has built-in protection — but it's a habit to avoid.</p>,
      ]}
      interactive={<WiresInteractive />}
      questions={[
        { q: "How are breadboard rows connected?", options: ["Vertically", "Horizontally", "Diagonally", "Not at all"], answer: 1, why: "Each short row (5 holes) in the middle section is electrically connected horizontally." },
        { q: "What color is conventionally used for ground wires?", options: ["Red", "Blue", "Black", "Green"], answer: 2, why: "Black is the universal convention for ground/GND connections in electronics." },
        { q: "What is a short circuit?", options: ["A very short wire", "Power connected directly to ground", "A broken resistor", "A dim LED"], answer: 1, why: "A short circuit bypasses the load and connects power to ground directly, causing excess current flow." },
      ]}
      finishLesson={finishLesson}
      goPath={goPath}
      goNext={goNext}
      hasNext={hasNext}
    />
  );
}

/* ============================================================
   ARDUINO INTERACTIVE STUBS
   ============================================================ */

function ArduinoIntroInteractive() {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="space-y-4">
      <p className="font-semibold">Upload Simulator</p>
      <div className={`h-16 rounded-xl flex items-center justify-center font-mono text-sm transition-all ${uploaded ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
        {uploaded ? "✓ Sketch uploaded! Board is running." : "Sketch ready to upload..."}
      </div>
<button onClick={() => setUploaded(!uploaded)} style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:"#6C4DFF",color:"#fff",fontWeight:600,fontSize:"14px",cursor:"pointer",marginTop:"8px"}}>{uploaded ? "Reset" : "⬆ Upload Sketch"}</button>
    </div>
  );
}

function LEDInteractive() {
  const [on, setOn] = useState(false);
  return (
    <div className="space-y-4">
      <p className="font-semibold">LED Circuit Simulator</p>
      <div className={`h-20 rounded-xl flex items-center justify-center text-2xl transition-all ${on ? "bg-yellow-100" : "bg-gray-100"}`}>
        {on ? "💡 ON" : "⚫ OFF"}
      </div>
      <button onClick={() => setOn(!on)} style={{width:"100%",padding:"10px",borderRadius:"10px",border:"none",background:"#6C4DFF",color:"#fff",fontWeight:600,fontSize:"14px",cursor:"pointer"}}>
        digitalWrite(13, {on ? "LOW)" : "HIGH)"}</button>
    </div>
  );
}

function WiresInteractive() {
  const [connected, setConnected] = useState({ vcc: false, gnd: false, led: false });
  const all = connected.vcc && connected.gnd && connected.led;
  return (
    <div className="space-y-3">
      <p className="font-semibold">Build the circuit</p>
      {[
        { key: "vcc", label: "Connect 5V (red wire)" },
        { key: "gnd", label: "Connect GND (black wire)" },
        { key: "led", label: "Place LED + 220Ω resistor" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setConnected((c) => ({ ...c, [key]: !c[key] }))}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
            connected[key] ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-600"
          }`}
        >
          {connected[key] ? "✓" : "○"} {label}
        </button>
      ))}
      {all && <p className="text-green-600 font-bold text-sm text-center">🎉 Circuit complete! LED would light up.</p>}
    </div>
  );
}


/* ============================================================
   MOTORS & ACTUATORS PATH SCREEN
   ============================================================ */

function MotorsPathScreen({ setScreen, onBack }) {
  const [lessonId, setLessonId] = useState(null);
  const [unlockedMotors, setUnlockedMotors] = useState(() =>
    (() => { try { return parseInt(ls.get("motors_unlocked") || "1"); } catch { return 1; } })()
  );

  const ACCENT = "#2ECC71";
  const DARK   = "#0F4C35";

  const motorsLessons = [
    {
      id: 1,
      title: "Meet the Servo",
      pages: [
        <p>A <strong>servo motor</strong> is a motor with a built-in gearbox and a feedback sensor that lets you control its position precisely. Instead of spinning freely, it moves to a specific angle and holds there.</p>,
        <p>Most hobby servos rotate between <strong>0° and 180°</strong>. You command the angle by sending a PWM signal — typically a pulse between 1ms (0°) and 2ms (180°) repeated every 20ms.</p>,
        <p>On Arduino, the <code>Servo</code> library handles all the timing for you. Just call <code>myServo.attach(9)</code> to connect it to pin 9, then <code>myServo.write(90)</code> to move it to 90 degrees.</p>,
        <p>Servos have <strong>3 wires</strong>: red (5V power), brown/black (GND), and orange/yellow/white (signal). The signal wire is what carries the PWM angle command from your Arduino.</p>,
      ],
      interactive: <ServoAngleInteractive accentColor={ACCENT} darkBg={DARK} />,
      questions: [
        { q: "What does a servo motor control?", options: ["Speed only", "Position/angle precisely", "Voltage output", "WiFi signal"], answer: 1, why: "Servos use internal feedback to hold a precise angle — that's what makes them different from regular motors." },
        { q: "What signal does Arduino send to control a servo?", options: ["Analog voltage", "I2C data", "PWM pulse", "Serial text"], answer: 2, why: "A PWM pulse width between 1ms and 2ms tells the servo which angle to move to." },
        { q: "Which Arduino library controls servos?", options: ["Wire.h", "Servo.h", "Motor.h", "PWM.h"], answer: 1, why: "The built-in Servo library handles all PWM timing so you just call myServo.write(angle)." },
        { q: "How many wires does a hobby servo have?", options: ["2", "4", "3", "6"], answer: 2, why: "Power (red), ground (black/brown), and signal (orange/white/yellow)." },
      ],
    },
    {
      id: 2,
      title: "Servo in Action",
      pages: [
        <p>Your first real servo project: a <strong>door lock mechanism</strong>. The servo arm rotates to 0° to lock and 180° to unlock — simple, reliable, and a real-world use case.</p>,
        <p>The wiring is minimal: servo signal → pin 9, a push button → pin 2. When the button is pressed, the Arduino toggles the servo between locked and unlocked positions.</p>,
        <p><strong>Important:</strong> servos draw more current than an Arduino pin can safely supply. Always power the servo's red wire from the Arduino's 5V pin (or an external supply for larger servos), not from a GPIO pin.</p>,
        <p>For smoother movement, use <code>myServo.write()</code> inside a <code>for</code> loop with a small delay — sweeping from current angle to target angle one degree at a time instead of snapping instantly.</p>,
      ],
      interactive: <LockInteractive accentColor={ACCENT} darkBg={DARK} />,
      questions: [
        { q: "Why shouldn't you power a servo from a GPIO pin?", options: ["It's too slow", "GPIO pins can't supply enough current", "It changes the signal", "It drains the battery faster"], answer: 1, why: "GPIO pins are limited to ~40mA. Servos can draw 500mA+, which would damage the microcontroller." },
        { q: "How do you make a servo move smoothly instead of snapping?", options: ["Use faster code", "Sweep angle in a loop with delays", "Use a different library", "Increase voltage"], answer: 1, why: "Incrementing the angle one degree at a time with a small delay creates smooth, controlled movement." },
        { q: "In a door lock project, what triggers the servo?", options: ["Always on", "A push button input", "WiFi command", "Sensor only"], answer: 1, why: "A push button on a digital input pin tells the Arduino to toggle the servo position." },
        { q: "What range does a standard hobby servo cover?", options: ["0–90°", "0–360°", "0–180°", "45–135°"], answer: 2, why: "Standard hobby servos rotate between 0° and 180°. Continuous rotation servos are a different type." },
      ],
    },
    {
      id: 3,
      title: "What Are Actuators?",
      pages: [
        <p>An <strong>actuator</strong> is any device that converts energy into physical motion. A servo is one type of actuator — but the family is much bigger: solenoids, linear actuators, pneumatic cylinders, hydraulic rams, and more.</p>,
        <p>The key difference: a servo is a <em>smart</em> actuator — it has feedback and knows its position. Most other actuators are <em>dumb</em> — they just push or pull when powered, with no built-in position awareness.</p>,
        <p>In robotics, actuators are the "muscles" of your machine. Sensors tell the robot what's happening; the microcontroller decides what to do; actuators make it happen in the physical world.</p>,
        <p>Choosing the right actuator means matching <strong>force, speed, stroke length, and control precision</strong> to your application. A servo door lock needs precision. A pneumatic press needs raw force. A solenoid valve just needs on/off.</p>,
      ],
      interactive: <ActuatorCompareInteractive accentColor={ACCENT} darkBg={DARK} />,
      questions: [
        { q: "What does an actuator do?", options: ["Measures temperature", "Converts energy to physical motion", "Stores data", "Amplifies signals"], answer: 1, why: "Actuators are the 'output' side of a robotic system — they create movement in the real world." },
        { q: "What makes a servo different from most actuators?", options: ["It's louder", "It has built-in position feedback", "It uses more power", "It's wireless"], answer: 1, why: "A servo has an internal sensor that tells it its current position. Most actuators just move when powered." },
        { q: "In robotics, actuators are the machine's...", options: ["Brain", "Eyes", "Muscles", "Memory"], answer: 2, why: "Sensors are the eyes, the microcontroller is the brain, and actuators are the muscles that create motion." },
        { q: "Which factor matters LEAST when picking an actuator?", options: ["Force output", "Color", "Speed", "Precision"], answer: 1, why: "Color has zero bearing on actuator selection. Force, speed, stroke, and precision all matter." },
      ],
    },
    {
      id: 4,
      title: "Types of Actuators",
      pages: [
        <p><strong>Linear actuators</strong> push and pull in a straight line. Electric versions use a motor + leadscrew. They're used in adjustable desks, robotic arms, and CNC machines. Stroke length (how far it extends) is the key spec.</p>,
        <p><strong>Rotary actuators</strong> produce rotation — motors, servos, and pneumatic rotary actuators fall here. They're measured in torque (Nm) and RPM. Most joints in robot arms use rotary actuators.</p>,
        <p><strong>Solenoids</strong> are the simplest actuators — a coil of wire that creates a magnetic field when powered, pulling an iron plunger. They're either fully in or fully out. Used in door locks, pinball machines, and injection systems.</p>,
        <p><strong>Pneumatic and hydraulic actuators</strong> use compressed air or fluid pressure to generate massive force from a small controller signal. Pneumatics are fast and clean; hydraulics move heavier loads. Industrial robots and heavy equipment use these.</p>,
      ],
      interactive: <ActuatorTypesInteractive accentColor={ACCENT} darkBg={DARK} />,
      questions: [
        { q: "A linear actuator moves...", options: ["In a circle", "In a straight line", "Randomly", "Only backwards"], answer: 1, why: "Linear actuators produce straight-line push/pull motion, unlike rotary actuators which spin." },
        { q: "What is a solenoid's movement like?", options: ["Smooth and variable", "Only fully in or fully out", "360° rotation", "Spiral"], answer: 1, why: "Solenoids are binary — the plunger is either fully retracted or fully extended. No middle position." },
        { q: "Which actuator type generates the most raw force?", options: ["Solenoid", "Servo", "Hydraulic", "Stepper motor"], answer: 2, why: "Hydraulic actuators can generate enormous force using pressurized fluid — far beyond electrical actuators." },
        { q: "Pneumatic actuators use...", options: ["Electric current", "Compressed air", "Hydraulic fluid", "Magnets"], answer: 1, why: "Pneumatics use compressed air to drive pistons. Fast, clean, and widely used in industrial automation." },
      ],
    },
    {
      id: 5,
      title: "DC & Stepper Motors",
      pages: [
        <p>A <strong>DC motor</strong> spins continuously when voltage is applied. Speed is controlled by PWM (varying the average voltage), and direction is controlled by reversing polarity — which is why you need an <strong>H-bridge</strong> like the L298N chip to drive one from Arduino.</p>,
        <p>DC motors are fast and simple but have no position feedback. If you need to know where the motor shaft is, you add an <strong>encoder</strong> — a sensor that counts rotations. DC motors with encoders power most wheeled robots.</p>,
        <p>A <strong>stepper motor</strong> moves in precise discrete steps — typically 1.8° per step (200 steps = one full rotation). It does this by energizing coils in sequence. No encoder needed — each step is guaranteed, making steppers perfect for 3D printers and CNC machines.</p>,
        <p>The trade-off: steppers are <strong>slower and less power-efficient</strong> than DC motors, and they can "miss steps" under heavy load. DC motors are faster and stronger but need encoders for precision. Choose based on whether you need speed or exact position.</p>,
      ],
      interactive: <MotorCompareInteractive accentColor={ACCENT} darkBg={DARK} />,
      questions: [
        { q: "How do you control a DC motor's direction?", options: ["Change PWM frequency", "Reverse polarity via H-bridge", "Adjust voltage only", "Use I2C commands"], answer: 1, why: "An H-bridge circuit (like L298N) lets you reverse current flow through the motor to change direction." },
        { q: "How many degrees does a stepper motor move per step (typically)?", options: ["0.9°", "5°", "1.8°", "45°"], answer: 2, why: "Standard stepper motors move 1.8° per step, giving 200 steps per full revolution." },
        { q: "What does an encoder do on a DC motor?", options: ["Changes speed", "Provides position feedback", "Reduces noise", "Steps the voltage"], answer: 1, why: "An encoder counts shaft rotations so the controller knows exactly where the motor is — giving position awareness to a motor that otherwise has none." },
        { q: "Why are steppers used in 3D printers?", options: ["They're cheaper", "They're faster", "Each step is a guaranteed precise movement", "They run on AC power"], answer: 2, why: "Steppers move a guaranteed 1.8° per step with no encoder needed — perfect for the precise X/Y/Z positioning a 3D printer requires." },
      ],
    },
    {
      id: 6,
      title: "Your First Project",
      pages: [
        <p>Project: <strong>Automated Sorting Arm</strong>. A servo rotates a small arm left or right, a DC motor drives a conveyor belt, and a button triggers the sort. This ties together everything from the last 5 lessons.</p>,
        <p>The difference from your servo door lock: here the servo works <em>together</em> with a DC motor. The sequence matters — belt runs, object arrives, belt stops, arm sorts, arm resets, belt runs again. This is called a <strong>state machine</strong>.</p>,
        <p>Actuators vs Servos in one sentence: <strong>servos know where they are</strong> (position feedback), while most actuators like solenoids and linear actuators just move when told. In this project, the servo is the precise sorter; the DC motor is the dumb-but-fast belt driver.</p>,
        <p>Next steps: add a sensor (IR or ultrasonic) to detect when an object is present instead of using a button. That transforms this from a manually-triggered device into a <strong>fully autonomous sorting system</strong>.</p>,
      ],
      interactive: <SortingArmInteractive accentColor={ACCENT} darkBg={DARK} />,
      questions: [
        { q: "What is a state machine in robotics?", options: ["A machine made of metal", "A sequence of steps where each action depends on the current state", "A stepper motor controller", "A type of sensor"], answer: 1, why: "State machines define what happens next based on the current condition — e.g. 'if belt is running and object detected, stop belt and sort.'" },
        { q: "What's the key difference between a servo and a solenoid?", options: ["Servos are louder", "Servos have position feedback; solenoids are binary on/off", "Solenoids are more expensive", "Servos use AC power"], answer: 1, why: "A servo knows its exact angle. A solenoid is simply in or out — no middle ground, no position feedback." },
        { q: "What sensor would make the sorting arm autonomous?", options: ["Temperature sensor", "IR or ultrasonic distance sensor", "Gyroscope", "Barometer"], answer: 1, why: "An IR or ultrasonic sensor detects when an object is present, replacing the manual button trigger." },
        { q: "In the sorting arm project, what role does the DC motor play?", options: ["Precise angle positioning", "Driving the conveyor belt", "Reading sensor data", "Controlling the servo"], answer: 1, why: "The DC motor drives the belt — it doesn't need precision, just continuous rotation at a set speed." },
      ],
    },
  ];

  const selected = motorsLessons.find((l) => l.id === lessonId);

  if (lessonId !== null) {
    return (
      <LessonTemplate
        title={selected.title}
        pages={selected.pages}
        interactive={selected.interactive}
        questions={selected.questions}
        accentColor={ACCENT}
        darkBg={DARK}
        finishLesson={() => {
          if (lessonId === unlockedMotors) {
            const next = unlockedMotors + 1;
            setUnlockedMotors(next);
            ls.set("motors_unlocked", next);
          }
          setLessonId(null);
        }}
        goPath={() => setLessonId(null)}
        goNext={() => setLessonId((id) => Math.min(id + 1, motorsLessons.length))}
        hasNext={lessonId < motorsLessons.length}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-10 py-12 px-4">
      <div className="text-center">
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: ACCENT }}>Hands-On</span>
        <h1 className="text-4xl font-bold text-black mt-1">Motors & Actuators ⚙️</h1>
        <p className="text-gray-500 text-sm mt-1">Make things move in the real world.</p>
      </div>

      <div className="flex flex-col gap-8 items-center">
        {motorsLessons.map((lesson, i) => {
          const locked = lesson.id > unlockedMotors;
          return (
            <div key={lesson.id} className="flex flex-col items-center gap-2">
              <motion.button
                onClick={() => !locked && setLessonId(lesson.id)}
                initial={{ opacity: 0, scale: 0.4, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.1 }}
                whileHover={!locked ? { scale: 1.13, boxShadow: "0 8px 32px rgba(46,204,113,0.35)" } : {}}
                whileTap={!locked ? { scale: 0.95 } : {}}
                className="w-32 h-32 rounded-full shadow-xl text-sm font-bold flex items-center justify-center text-center p-4 border-4"
                style={locked
                  ? { background: "#e5e7eb", color: "#9ca3af", borderColor: "#d1d5db", cursor: "default" }
                  : { background: DARK, color: "#ffffff", borderColor: ACCENT, cursor: "pointer" }
                }
              >
                {locked && <span style={{ fontSize: "1.1rem", display: "block", marginBottom: "4px" }}>🔒</span>}
                <span style={{ color: locked ? "#9ca3af" : "#ffffff", fontSize: "11px", lineHeight: 1.3 }}>{lesson.title}</span>
              </motion.button>
              {i < motorsLessons.length - 1 && (
                <motion.div
                  className="w-0.5 bg-gray-200"
                  initial={{ height: 0 }}
                  animate={{ height: 24 }}
                  transition={{ delay: i * 0.1 + 0.1, duration: 0.2 }}
                />
              )}
            </div>
          );
        })}
      </div>
      <button onClick={() => onBack ? onBack() : setScreen("home")} style={{background:"transparent",border:"1.5px solid #e5e7eb",borderRadius:"10px",padding:"8px 20px",fontSize:"13px",color:"#6b7280",cursor:"pointer",fontWeight:500}}>← Back</button>
    </div>
  );
}

/* ============================================================
   MOTORS INTERACTIVE COMPONENTS
   ============================================================ */

function ServoAngleInteractive({ accentColor, darkBg }) {
  const [angle, setAngle] = useState(90);
  const rad = ((angle - 90) * Math.PI) / 180;
  const armX = 60 + Math.cos(rad) * 40;
  const armY = 60 - Math.sin(rad) * 40;
  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">Servo Angle Simulator</p>
      <div className="flex justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="28" fill={darkBg} stroke={accentColor} strokeWidth="3" />
          <circle cx="60" cy="60" r="6" fill={accentColor} />
          <line x1="60" y1="60" x2={armX} y2={armY} stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          <text x="60" y="100" textAnchor="middle" fill="#6b7280" fontSize="11">{angle}°</text>
        </svg>
      </div>
      <input type="range" min="0" max="180" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full" />
      <div className="flex justify-between text-xs text-gray-400">
        <span>0° (locked)</span><span>90° (center)</span><span>180° (open)</span>
      </div>
      <p className="text-xs text-gray-400 text-center">PWM pulse: ~{(1 + (angle / 180)).toFixed(2)}ms</p>
    </div>
  );
}

function LockInteractive({ accentColor, darkBg }) {
  const [locked, setLocked] = useState(true);
  const [sweeping, setSweeping] = useState(false);
  const angle = locked ? 0 : 180;

  const toggle = () => {
    if (sweeping) return;
    setSweeping(true);
    setTimeout(() => { setLocked(l => !l); setSweeping(false); }, 400);
  };

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">Door Lock — Servo Project</p>
      <div
        className="rounded-xl p-4 flex items-center justify-between transition-all duration-500"
        style={{ background: locked ? "#fee2e2" : "#dcfce7", border: `2px solid ${locked ? "#fca5a5" : "#86efac"}` }}
      >
        <div>
          <p className="font-bold text-sm" style={{ color: locked ? "#991b1b" : "#166534" }}>
            {sweeping ? "Moving..." : locked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </p>
          <p className="text-xs mt-1" style={{ color: locked ? "#dc2626" : "#16a34a" }}>Servo at {angle}°</p>
        </div>
        <svg width="50" height="50" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="28" fill={darkBg} stroke={accentColor} strokeWidth="4" />
          <circle cx="50" cy="50" r="6" fill={accentColor} />
          <line
            x1="50" y1="50"
            x2={50 + Math.cos(((angle - 90) * Math.PI) / 180) * 22}
            y2={50 - Math.sin(((angle - 90) * Math.PI) / 180) * 22}
            stroke={accentColor} strokeWidth="5" strokeLinecap="round"
          />
        </svg>
      </div>
      <button
        onClick={toggle}
        style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: darkBg, color: "#fff", fontWeight: 600, fontSize: "14px", cursor: sweeping ? "not-allowed" : "pointer", opacity: sweeping ? 0.6 : 1 }}
      >
        Press Button
      </button>
      <p className="text-xs text-gray-400 text-center">myServo.write({angle}) — digitalWrite(buttonPin, INPUT_PULLUP)</p>
    </div>
  );
}

function ActuatorCompareInteractive({ accentColor, darkBg }) {
  const [selected, setSelected] = useState(null);
  const items = [
    { name: "Servo", icon: "🔄", desc: "Precise angle, has feedback", type: "smart" },
    { name: "Solenoid", icon: "⚡", desc: "On/off only, very fast", type: "dumb" },
    { name: "Linear Actuator", icon: "↔️", desc: "Straight push/pull, strong", type: "dumb" },
    { name: "Pneumatic", icon: "💨", desc: "Air-powered, huge force", type: "dumb" },
  ];
  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">Tap an actuator to learn more</p>
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => (
          <button
            key={item.name}
            onClick={() => setSelected(selected?.name === item.name ? null : item)}
            style={{
              padding: "10px 8px", borderRadius: "10px", border: `2px solid ${selected?.name === item.name ? accentColor : "#e5e7eb"}`,
              background: selected?.name === item.name ? darkBg : "#f9fafb",
              color: selected?.name === item.name ? "#fff" : "#374151",
              cursor: "pointer", textAlign: "center", fontSize: "12px", fontWeight: 600
            }}
          >
            <div style={{ fontSize: "1.4rem" }}>{item.icon}</div>
            {item.name}
          </button>
        ))}
      </div>
      {selected && (
        <div style={{ background: "#f0fdf4", border: `1.5px solid ${accentColor}`, borderRadius: "10px", padding: "10px 12px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: darkBg }}>{selected.icon} {selected.name}</p>
          <p style={{ fontSize: "12px", color: "#374151", marginTop: "4px" }}>{selected.desc}</p>
          <span style={{ fontSize: "11px", fontWeight: 700, color: selected.type === "smart" ? "#2563eb" : "#6b7280", background: selected.type === "smart" ? "#dbeafe" : "#f3f4f6", padding: "2px 8px", borderRadius: 99, display: "inline-block", marginTop: "6px" }}>
            {selected.type === "smart" ? "Smart (has feedback)" : "Dumb (no position sense)"}
          </span>
        </div>
      )}
    </div>
  );
}

function ActuatorTypesInteractive({ accentColor, darkBg }) {
  const [active, setActive] = useState("linear");
  const types = [
    {
      id: "linear", label: "Linear", icon: "↔️",
      desc: "Extends and retracts in a straight line. Key spec: stroke length (how far it travels). Used in robotic arms, CNC, adjustable furniture.",
      visual: (p) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", padding: "12px 0" }}>
          <div style={{ width: "30px", height: "20px", background: darkBg, borderRadius: "4px" }} />
          <motion.div animate={{ width: p ? "80px" : "30px" }} transition={{ duration: 0.4 }} style={{ height: "12px", background: accentColor, borderRadius: "3px" }} />
          <div style={{ width: "12px", height: "24px", background: darkBg, borderRadius: "3px" }} />
        </div>
      )
    },
    {
      id: "rotary", label: "Rotary", icon: "🔄",
      desc: "Produces rotation. Servos, motors, and rotary actuators all fall here. Measured in torque (Nm) and speed (RPM).",
      visual: (p) => (
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <motion.div animate={{ rotate: p ? 360 : 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} style={{ width: "44px", height: "44px", borderRadius: "50%", background: darkBg, border: `3px solid ${accentColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "3px", height: "18px", background: accentColor, borderRadius: "2px" }} />
          </motion.div>
        </div>
      )
    },
    {
      id: "solenoid", label: "Solenoid", icon: "⚡",
      desc: "Magnetic coil pulls a plunger in when powered, spring pushes it out when off. Binary only — fully in or fully out. Super fast switching.",
      visual: (p) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", padding: "10px 0" }}>
          <div style={{ width: "40px", height: "28px", background: darkBg, border: `2px solid ${accentColor}`, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "10px", color: accentColor, fontWeight: 700 }}>COIL</div>
          </div>
          <motion.div animate={{ x: p ? 0 : 20 }} transition={{ duration: 0.2 }} style={{ width: "14px", height: "14px", background: accentColor, borderRadius: "2px" }} />
        </div>
      )
    },
    {
      id: "pneumatic", label: "Pneumatic", icon: "💨",
      desc: "Compressed air drives a piston for massive force. Fast, clean, used in industrial robots. Requires an air compressor and valves.",
      visual: (p) => (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center", padding: "10px 0" }}>
          <div style={{ width: "50px", height: "30px", border: `2px solid ${accentColor}`, borderRadius: "4px", display: "flex", alignItems: "center", overflow: "hidden", background: "#f9fafb" }}>
            <motion.div animate={{ width: p ? "42px" : "12px" }} transition={{ duration: 0.4 }} style={{ height: "100%", background: accentColor, opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: "16px" }}>💨</div>
        </div>
      )
    },
  ];

  const current = types.find(t => t.id === active);

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">Explore actuator types</p>
      <div className="grid grid-cols-4 gap-1">
        {types.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{ padding: "6px 4px", borderRadius: "8px", border: `2px solid ${active === t.id ? accentColor : "#e5e7eb"}`, background: active === t.id ? darkBg : "#f9fafb", color: active === t.id ? "#fff" : "#374151", cursor: "pointer", fontSize: "11px", fontWeight: 600, textAlign: "center" }}>
            <div style={{ fontSize: "1.1rem" }}>{t.icon}</div>
            {t.label}
          </button>
        ))}
      </div>
      {current.visual(true)}
      <div style={{ background: "#f0fdf4", border: `1.5px solid ${accentColor}`, borderRadius: "10px", padding: "10px 12px" }}>
        <p style={{ fontSize: "12px", color: "#374151", lineHeight: 1.5 }}>{current.desc}</p>
      </div>
    </div>
  );
}

function MotorCompareInteractive({ accentColor, darkBg }) {
  const [tab, setTab] = useState("dc");
  const [speed, setSpeed] = useState(60);
  const [step, setStep] = useState(0);

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">DC vs Stepper Motor</p>
      <div className="flex gap-2">
        {["dc", "stepper"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `2px solid ${tab === t ? accentColor : "#e5e7eb"}`, background: tab === t ? darkBg : "#f9fafb", color: tab === t ? "#fff" : "#374151", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            {t === "dc" ? "DC Motor" : "Stepper"}
          </button>
        ))}
      </div>

      {tab === "dc" ? (
        <div className="space-y-2">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 * (1 - speed / 120) + 0.1, repeat: Infinity, ease: "linear" }}
              style={{ width: "56px", height: "56px", borderRadius: "50%", background: darkBg, border: `3px solid ${accentColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <div style={{ width: "3px", height: "22px", background: accentColor, borderRadius: "2px" }} />
            </motion.div>
          </div>
          <input type="range" min="0" max="100" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full" />
          <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}>PWM: {speed}% — analogWrite(motorPin, {Math.round(speed * 2.55)})</p>
          <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>Continuous spin, speed via PWM, needs H-bridge for direction</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: darkBg, border: `3px solid ${accentColor}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${step * 1.8}deg)`, transition: "transform 0.1s" }}>
              <div style={{ width: "3px", height: "22px", background: accentColor, borderRadius: "2px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setStep(s => s + 1)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: darkBg, color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Step +1 →</button>
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `1.5px solid ${accentColor}`, background: "transparent", color: darkBg, fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>← Step -1</button>
          </div>
          <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}>Step {step} — {(step * 1.8).toFixed(1)}° — stepper.step(1)</p>
          <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>Each click = 1.8°, exact position, no encoder needed</p>
        </div>
      )}
    </div>
  );
}

function SortingArmInteractive({ accentColor, darkBg }) {
  const STATES = ["idle", "belt_running", "object_detected", "sorting_left", "sorting_right", "resetting"];
  const LABELS = { idle: "Idle", belt_running: "Belt Running 🔄", object_detected: "Object Detected! 📦", sorting_left: "Sorting Left ←", sorting_right: "Sorting Right →", resetting: "Resetting..." };
  const [state, setState] = useState("idle");
  const [beltSpeed, setBeltSpeed] = useState(0);
  const [armAngle, setArmAngle] = useState(90);
  const [log, setLog] = useState(["System ready."]);

  const addLog = (msg) => setLog(l => [...l.slice(-3), msg]);

  const advance = () => {
    if (state === "idle") { setState("belt_running"); setBeltSpeed(70); addLog("Belt started (DC motor 70% PWM)"); }
    else if (state === "belt_running") { setState("object_detected"); addLog("IR sensor triggered — object present!"); }
    else if (state === "object_detected") {
      const left = Math.random() > 0.5;
      setState(left ? "sorting_left" : "sorting_right");
      setArmAngle(left ? 30 : 150);
      setBeltSpeed(0);
      addLog(`Servo → ${left ? "30° (left bin)" : "150° (right bin)"}`);
    }
    else if (state === "sorting_left" || state === "sorting_right") { setState("resetting"); setArmAngle(90); addLog("Arm resetting to 90°..."); }
    else if (state === "resetting") { setState("idle"); setBeltSpeed(0); addLog("Ready for next object."); }
  };

  const rad = ((armAngle - 90) * Math.PI) / 180;

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">Sorting Arm State Machine</p>
      <div style={{ background: darkBg, borderRadius: "12px", padding: "12px", display: "flex", gap: "16px", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "4px" }}>SERVO ARM</p>
          <svg width="70" height="70" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="24" fill="#1f2937" stroke={accentColor} strokeWidth="3" />
            <circle cx="50" cy="50" r="5" fill={accentColor} />
            <line x1="50" y1="50" x2={50 + Math.cos(rad) * 22} y2={50 - Math.sin(rad) * 22} stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "4px" }}>DC BELT</p>
          <motion.div
            animate={{ rotate: beltSpeed > 0 ? 360 : 0 }}
            transition={{ duration: beltSpeed > 0 ? 0.6 : 0, repeat: beltSpeed > 0 ? Infinity : 0, ease: "linear" }}
            style={{ width: "44px", height: "44px", borderRadius: "50%", border: `3px solid ${beltSpeed > 0 ? accentColor : "#4b5563"}`, background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}
          >
            <div style={{ width: "3px", height: "18px", background: beltSpeed > 0 ? accentColor : "#4b5563", borderRadius: "2px" }} />
          </motion.div>
        </div>
      </div>
      <div style={{ background: "#f0fdf4", border: `1.5px solid ${accentColor}`, borderRadius: "10px", padding: "8px 12px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: darkBg }}>State: {LABELS[state]}</p>
        {log.map((l, i) => <p key={i} style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>› {l}</p>)}
      </div>
      <button onClick={advance} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: darkBg, color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer", borderTop: `3px solid ${accentColor}` }}>
        Next Step →
      </button>
    </div>
  );
}

/* ============================================================
   COMPLETION SCREEN
   ============================================================ */

function Completion({ goPath, goNext, hasNext, accentColor = "#6C4DFF" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div style={{ padding: "32px", textAlign: "center", border: `4px solid ${accentColor}`, maxWidth: "360px", width: "100%", borderRadius: "16px", background: "#fff" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="text-5xl">🎉</div>
          <h1 className="text-3xl font-bold" style={{ color: accentColor }}>YOU DID IT!</h1>
          <p className="text-gray-500 text-sm">Lesson complete</p>
          <div className="space-y-2 pt-2">
            {hasNext && (
              <button onClick={goNext} style={{width:"100%",padding:"12px",borderRadius:"10px",border:"none",background:accentColor,color:"#fff",fontWeight:600,fontSize:"14px",cursor:"pointer"}}>Next Lesson →</button>
            )}
            <button onClick={goPath} style={{width:"100%",padding:"12px",borderRadius:"10px",border:"1.5px solid #e5e7eb",background:"transparent",color:"#374151",fontWeight:600,fontSize:"14px",cursor:"pointer",marginTop:"8px"}}>Back to Course</button>
          </div>
        </div>
      </div>
    </div>
  );
}
