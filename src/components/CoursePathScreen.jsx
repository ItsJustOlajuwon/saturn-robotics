import { useState } from "react";
import { motion } from "framer-motion";
import { ls } from "../utils/storage";
import { BackButton } from "./ui/BackButton";

/**
 * Generic course path screen that renders a vertical list of lesson bubbles
 * with unlock tracking and delegates to LessonTemplate when a lesson is selected.
 *
 * @param {object}   props
 * @param {string}   props.title          Course title (e.g. "ESP32 📡")
 * @param {string}   [props.subtitle]     Optional subtitle text
 * @param {string}   [props.tag]          Optional tag above title (e.g. "Advanced")
 * @param {string}   props.accentColor    Theme accent color
 * @param {string}   props.darkBg         Dark background color for lesson bubbles
 * @param {Array}    props.lessons        Array of { id, title, pages, interactive, questions }
 * @param {string}   [props.storageKey]   localStorage key for unlock tracking (omit to unlock all)
 * @param {Function} props.onBack         Called when user navigates back
 * @param {Function} props.LessonTemplate The lesson template component to render
 */
export function CoursePathScreen({
  title,
  subtitle,
  tag,
  accentColor,
  darkBg,
  lessons,
  storageKey,
  onBack,
  LessonTemplate,
}) {
  const [lessonId, setLessonId] = useState(null);
  const [unlocked, setUnlocked] = useState(() => {
    if (!storageKey) return lessons.length;
    try {
      return parseInt(ls.get(storageKey) || "1");
    } catch {
      return 1;
    }
  });

  const selected = lessons.find((l) => l.id === lessonId);

  if (lessonId !== null && selected) {
    return (
      <LessonTemplate
        title={selected.title}
        pages={selected.pages}
        interactive={selected.interactive}
        questions={selected.questions}
        accentColor={accentColor}
        darkBg={darkBg}
        finishLesson={() => {
          if (storageKey && lessonId === unlocked) {
            const next = unlocked + 1;
            setUnlocked(next);
            ls.set(storageKey, next);
          }
          setLessonId(null);
        }}
        goPath={() => setLessonId(null)}
        goNext={() =>
          setLessonId((id) => Math.min(id + 1, lessons.length))
        }
        hasNext={lessonId < lessons.length}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-10 py-12 px-4">
      <div className="text-center">
        {tag && (
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {tag}
          </span>
        )}
        <h1 className="text-4xl font-bold text-black mt-1">{title}</h1>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-col gap-8 items-center">
        {lessons.map((lesson, i) => {
          const locked = lesson.id > unlocked;
          return (
            <div
              key={lesson.id}
              className="flex flex-col items-center gap-2"
            >
              <motion.button
                onClick={() => !locked && setLessonId(lesson.id)}
                initial={{ opacity: 0, scale: 0.4, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: i * 0.12,
                }}
                whileHover={
                  !locked
                    ? {
                        scale: 1.13,
                        boxShadow: `0 8px 32px ${accentColor}59`,
                      }
                    : {}
                }
                whileTap={!locked ? { scale: 0.95 } : {}}
                className="w-32 h-32 rounded-full shadow-xl text-sm font-bold flex items-center justify-center text-center p-4 border-4"
                style={
                  locked
                    ? {
                        background: "#e5e7eb",
                        color: "#9ca3af",
                        borderColor: "#d1d5db",
                        cursor: "default",
                      }
                    : {
                        background: darkBg,
                        color: "#ffffff",
                        borderColor: accentColor,
                        cursor: "pointer",
                      }
                }
              >
                {locked && (
                  <span
                    style={{
                      fontSize: "1.1rem",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    🔒
                  </span>
                )}
                <span
                  style={{
                    color: locked ? "#9ca3af" : "#ffffff",
                    fontSize: "11px",
                    lineHeight: 1.3,
                  }}
                >
                  {lesson.title}
                </span>
              </motion.button>
              {i < lessons.length - 1 && (
                <motion.div
                  className="w-0.5 bg-gray-200"
                  initial={{ height: 0 }}
                  animate={{ height: 24 }}
                  transition={{
                    delay: i * 0.12 + 0.1,
                    duration: 0.2,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <BackButton onClick={onBack} />
    </div>
  );
}
