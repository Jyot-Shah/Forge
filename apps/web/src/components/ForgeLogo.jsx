export default function ForgeLogo({ className = "w-8 h-8" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 ${className}`}
    >
      <img
        src="/static/forge_logo.png"
        alt="Forge"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
