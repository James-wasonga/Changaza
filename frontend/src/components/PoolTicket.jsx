import Countdown from "./Countdown";

function Barcode({ seed = "CHANGAZA" }) {
  // Deterministic pseudo-barcode derived from the pool code — purely visual,
  // reinforces the "verifiable, scannable" feel of the ticket.
  const bars = Array.from(seed).map((c) => (c.charCodeAt(0) % 3) + 1);
  return (
    <div className="barcode">
      {bars.map((w, i) => (
        <span key={i} style={{ width: `${w}px`, opacity: 0.5 + (w / 3) * 0.5 }} />
      ))}
    </div>
  );
}

export default function PoolTicket({ pool, highlight }) {
  const { fixture, entryAmount, currency, code, participants = [], poolType, status, result } = pool;
  const pot = entryAmount * (participants.length || 1);

  return (
    <div className={`ticket flex flex-col sm:flex-row ${highlight ? "ring-1 ring-gold/50" : ""}`}>
      {/* Main stub */}
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] uppercase tracking-widest text-mute font-semibold">
            {fixture?.stage || "Custom pool"}
          </span>
          <span
            className={`text-[11px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
              status === "settled" ? "bg-teal/30 text-gold-bright" : "bg-gold/15 text-gold-bright"
            }`}
          >
            {status === "settled" ? `Settled · ${result}` : "Open"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl">{fixture?.homeFlag}</span>
            <span className="font-display text-lg tracking-wide truncate">{fixture?.home}</span>
          </div>
          <span className="font-mono text-mute text-xs shrink-0">VS</span>
          <div className="flex items-center gap-2 min-w-0 flex-row-reverse text-right">
            <span className="text-2xl">{fixture?.awayFlag}</span>
            <span className="font-display text-lg tracking-wide truncate">{fixture?.away}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <p className="text-mute text-xs mb-0.5">Entry</p>
            <p className="scoreboard-num text-gold-bright font-semibold">
              {currency} {entryAmount}
            </p>
          </div>
          <div>
            <p className="text-mute text-xs mb-0.5">Pool</p>
            <p className="scoreboard-num text-chalk font-semibold">
              {currency} {pot} · {participants.length} in
            </p>
          </div>
          <div>
            <p className="text-mute text-xs mb-0.5">Type</p>
            <p className="text-chalk font-semibold capitalize">{poolType?.replace("-", " ")}</p>
          </div>
          {fixture?.kickoff && status !== "settled" && (
            <div>
              <p className="text-mute text-xs mb-0.5">Kicks off in</p>
              <Countdown target={fixture.kickoff} />
            </div>
          )}
        </div>
      </div>

      {/* Stub */}
      <div className="ticket-perf sm:w-40 shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-5 sm:p-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-mute mb-1">Pool code</p>
          <p className="font-mono text-xl font-semibold tracking-[0.15em] text-gold-bright">{code}</p>
        </div>
        <Barcode seed={code} />
      </div>
    </div>
  );
}
