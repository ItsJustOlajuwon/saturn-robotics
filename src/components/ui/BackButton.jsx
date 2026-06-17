import { motion } from "framer-motion";

const STYLE = {
  background: "transparent",
  border: "1.5px solid #e5e7eb",
  borderRadius: "10px",
  padding: "8px 20px",
  fontSize: "13px",
  color: "#6b7280",
  cursor: "pointer",
  fontWeight: 500,
};

export function BackButton({ onClick, label = "← Back" }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={STYLE}
    >
      {label}
    </motion.button>
  );
}
