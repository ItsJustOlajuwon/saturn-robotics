export function Button({ children, className="", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-xl bg-black text-white hover:opacity-80 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}