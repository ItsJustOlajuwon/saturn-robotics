import { motion } from "framer-motion";

export function AuthLayout({ onBack, children }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: "13px",
            marginBottom: "2rem",
            padding: 0,
          }}
        >
          ← Back
        </button>
        {children}
      </motion.div>
    </div>
  );
}
