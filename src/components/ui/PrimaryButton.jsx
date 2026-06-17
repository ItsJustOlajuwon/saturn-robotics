import { motion } from "framer-motion";

const BASE_STYLE = {
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
  padding: "10px 16px",
};

export function PrimaryButton({
  onClick,
  children,
  bg = "#6C4DFF",
  color = "#fff",
  disabled = false,
  style = {},
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...BASE_STYLE,
        background: disabled ? "rgba(255,255,255,0.1)" : bg,
        color: disabled ? "rgba(255,255,255,0.3)" : color,
        cursor: disabled ? "default" : "pointer",
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
