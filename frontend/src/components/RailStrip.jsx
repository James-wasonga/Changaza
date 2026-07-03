import { RAILS } from "../data/rails";

export default function RailStrip({ centered = false }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${centered ? "justify-center" : ""}`}>
      {RAILS.map((r) => (
        <div
          key={r.id}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            r.status === "live"
              ? "border-gold-dim bg-gold/10 text-gold-bright"
              : "border-pitch-line text-mute"
          }`}
        >
          <span>{r.flag}</span>
          <span>{r.label}</span>
          <span className={`ml-1 text-[10px] uppercase tracking-wide ${r.status === "live" ? "text-gold" : "text-mute/70"}`}>
            {r.status === "live" ? "Live" : "Soon"}
          </span>
        </div>
      ))}
    </div>
  );
}
