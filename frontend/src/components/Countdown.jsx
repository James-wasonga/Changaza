import { useEffect, useState } from "react";

function getParts(target) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { diff, d, h, m, s };
}

export default function Countdown({ target, className = "" }) {
  const [parts, setParts] = useState(() => getParts(target));

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (parts.diff <= 0) {
    return <span className={`text-coral font-mono text-sm font-semibold ${className}`}>Kickoff started</span>;
  }

  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className={`flex items-center gap-1.5 scoreboard-num text-sm ${className}`}>
      {parts.d > 0 && (
        <>
          <span className="text-gold-bright">{parts.d}d</span>
          <span className="text-mute">:</span>
        </>
      )}
      <span className="text-gold-bright">{pad(parts.h)}</span>
      <span className="text-mute">:</span>
      <span className="text-gold-bright">{pad(parts.m)}</span>
      <span className="text-mute">:</span>
      <span className="text-gold-bright animate-pulseSoft">{pad(parts.s)}</span>
    </div>
  );
}
