export default function ForgeLogo({ className = "w-8 h-8" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 ${className} p-0.5 rounded-lg bg-surface/10 border border-outline-variant/30`}
    >
      <img
        src="/forge_logo.png"
        alt="Forge"
        className="w-full h-full object-contain drop-shadow"
      />
    </div>
  );
}
