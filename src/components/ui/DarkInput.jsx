const STYLE = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1.5px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
};

export function DarkInput({ label, ...inputProps }) {
  return (
    <div>
      {label && (
        <label
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.5)",
            display: "block",
            marginBottom: "6px",
          }}
        >
          {label}
        </label>
      )}
      <input style={STYLE} {...inputProps} />
    </div>
  );
}
