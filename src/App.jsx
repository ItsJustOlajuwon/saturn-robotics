import { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/* ============================================================
   SATURN ROBOTICS — Full Course App
   Courses: Arduino Basics · ESP32 · Teensy 4.1
   ============================================================ */

export default function App() {
  const [screen, setScreen] = useState("home");
  const [currentLesson, setCurrentLesson] = useState(null);
  const [unlocked, setUnlocked] = useState(() => {
    const saved = localStorage.getItem("unlockedLessons");
    return saved ? Number(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem("unlockedLessons", unlocked);
  }, [unlocked]);

  const arduinoLessons = [
    { id: 1, title: "Ardui-What?!" },
    { id: 2, title: "LEDs are EZ" },
    { id: 3, title: "Wired Up" },
  ];

  const courses = [
    {
      id: "arduino",
      title: "Arduino Basics",
      emoji: "🤖",
      bg: "#6C4DFF",
      accent: "#6C4DFF",
      tag: "START HERE",
      lessons: arduinoLessons,
    },
    {
      id: "esp32",
      title: "ESP32",
      emoji: "📡",
      bg: "#111111",
      accent: "#F2C94C",
      tag: "INTERMEDIATE",
      lessons: [
        { id: 1, title: "Introduction" },
        { id: 2, title: "How to Use GPIO" },
        { id: 3, title: "PWM + Motors" },
      ],
    },
    {
      id: "teensy",
      title: "Teensy 4.1",
      emoji: "⚡",
      bg: "#1A1A2E",
      accent: "#E0AA3E",
      tag: "ADVANCED",
      lessons: [
        { id: 1, title: "What is Teensy 4.1?" },
        { id: 2, title: "GPIO Deep Dive" },
        { id: 3, title: "PWM & Audio" },
      ],
    },
  ];

  const openLesson = (id) => {
    if (id <= unlocked) {
      setCurrentLesson(id);
      setScreen("lesson");
    }
  };

  if (screen === "home") {
    return (
      <CourseScreen
        courses={courses}
        openCourse={(courseId) => {
          if (courseId === "arduino") setScreen("arduinoPath");
          if (courseId === "esp32") setScreen("esp32Path");
          if (courseId === "teensy") setScreen("teensyPath");
        }}
      />
    );
  }

  if (screen === "arduinoPath") {
    return (
      <PathScreen
        lessons={arduinoLessons}
        unlocked={unlocked}
        openLesson={openLesson}
        title="Arduino Basics 🤖"
        accentColor="#6C4DFF"
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "esp32Path") {
    return <ESP32PathScreen setScreen={setScreen} />;
  }

  if (screen === "teensyPath") {
    return <TeensyPathScreen setScreen={setScreen} />;
  }

  if (screen === "complete") {
    return (
      <Completion
        goPath={() => setScreen("arduinoPath")}
        goNext={() => setScreen("arduinoPath")}
        hasNext={false}
        accentColor="#6C4DFF"
      />
    );
  }

  return (
    <LessonFlow
      lessonId={currentLesson}
      lessons={arduinoLessons}
      finishLesson={() => {
        if (currentLesson === unlocked) setUnlocked((u) => u + 1);
        setScreen("complete");
      }}
      goPath={() => setScreen("arduinoPath")}
      goNext={() => {
        setCurrentLesson((id) => id + 1);
        setScreen("lesson");
      }}
    />
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
        <Button variant="outline" onClick={onBack}>← Back</Button>
      )}
    </div>
  );
}

/* ============================================================
   ESP32 PATH SCREEN (self-contained)
   ============================================================ */

function ESP32PathScreen({ setScreen }) {
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

      <Button variant="outline" onClick={() => setScreen("home")}>← Back</Button>
    </div>
  );
}

/* ============================================================
   TEENSY 4.1 PATH SCREEN (self-contained)
   ============================================================ */

function TeensyPathScreen({ setScreen }) {
  const [lessonId, setLessonId] = useState(null);
  const [unlockedTeensy, setUnlockedTeensy] = useState(() =>
    parseInt(localStorage.getItem("teensy_unlocked") || "1")
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
            localStorage.setItem("teensy_unlocked", next);
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

      <Button variant="outline" onClick={() => setScreen("home")}>← Back</Button>
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
        <Button
          className="flex-1"
          style={{ background: "#1A1A2E", color: "#E0AA3E", border: "1px solid #E0AA3E" }}
          onClick={() => setUsed((u) => Math.min(u + 15, 100))}
        >
          + Load buffer
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setUsed((u) => Math.max(u - 15, 5))}>
          - Free buffer
        </Button>
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
      <Button
        className="w-full"
        style={{ background: "#1A1A2E", color: "#E0AA3E", border: "1px solid #E0AA3E" }}
        onClick={() => setOn(!on)}
      >
        Toggle Pin
      </Button>
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
      <Button className="w-full bg-[#6C4DFF]" onClick={() => setConnected(!connected)}>
        {connected ? "Disconnect" : "Connect"}
      </Button>
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
      <Button className="w-full bg-[#6C4DFF]" onClick={() => setLed(!led)}>Toggle</Button>
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
        <Button className="w-full mt-4" style={btnStyle} onClick={() => setStep(step + 1)}>
          Continue →
        </Button>
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
        <Button className="w-full mt-4" style={btnStyle} onClick={() => setStep(step + 1)}>
          Continue to Quiz →
        </Button>
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
            <Button
              className="w-full"
              style={btnStyle}
              onClick={() => { setQuizIndex(quizIndex + 1); setResult(null); setShowWhy(false); }}
            >
              Next →
            </Button>
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
      <Card className="w-full max-w-xl border-4 overflow-hidden" style={{ borderColor: accentColor, ...style }}>
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: accentColor }}
          />
        </div>
        <CardContent className="p-6 space-y-4">
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
        </CardContent>
      </Card>
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
      <Button className="w-full bg-[#6C4DFF]" onClick={() => setUploaded(!uploaded)}>
        {uploaded ? "Reset" : "⬆ Upload Sketch"}
      </Button>
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
      <Button className="w-full bg-[#6C4DFF]" onClick={() => setOn(!on)}>
        digitalWrite(13, {on ? "LOW)" : "HIGH)"}
      </Button>
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
   COMPLETION SCREEN
   ============================================================ */

function Completion({ goPath, goNext, hasNext, accentColor = "#6C4DFF" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="p-8 text-center border-4 max-w-sm w-full" style={{ borderColor: accentColor }}>
        <CardContent className="space-y-4">
          <div className="text-5xl">🎉</div>
          <h1 className="text-3xl font-bold" style={{ color: accentColor }}>YOU DID IT!</h1>
          <p className="text-gray-500 text-sm">Lesson complete</p>
          <div className="space-y-2 pt-2">
            {hasNext && (
              <Button className="w-full" style={{ background: accentColor, color: "#fff", border: "none" }} onClick={goNext}>
                Next Lesson →
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={goPath}>
              Back to Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
