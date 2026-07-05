import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, Share2, Trophy, Users } from "lucide-react";
import { getPool, settlePool } from "../services/blockchainService";
import { useToast } from "../context/ToastContext";
import PoolTicket from "../components/PoolTicket";

function maskPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return `••• ••${digits.slice(-3)}`;
}

const RESULTS = [
  { id: "HOME", label: (fx) => fx?.home },
  { id: "DRAW", label: () => "Draw" },
  { id: "AWAY", label: (fx) => fx?.away },
];

export default function PoolLobby() {
  const { code } = useParams();
  const { push } = useToast();
  const [pool, setPool] = useState(null);
  const [error, setError] = useState("");
  const [settling, setSettling] = useState(false);

  async function refresh() {
    try {
      const p = await getPool(code);
      setPool(p);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSettle(result) {
    setSettling(true);
    try {
      const updated = await settlePool(code, result);
      setPool(updated);
      push("Pool settled — payouts sent on-chain.", "success");
    } catch (err) {
      push(err.message, "error");
    } finally {
      setSettling(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard?.writeText(url);
    push("Invite link copied to clipboard.", "success");
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-coral font-semibold">{error}</p>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-mute">Loading pool…</div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-10 pb-28 md:pb-16 space-y-8">
      <PoolTicket pool={pool} highlight />

      <div className="flex gap-2">
        <button onClick={copyLink} className="btn-secondary flex-1 flex items-center justify-center gap-2 !py-3 text-sm">
          <Share2 size={16} /> Share invite link
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(code);
            push("Pool code copied.", "success");
          }}
          className="btn-secondary !py-3 !px-4 flex items-center gap-2 text-sm"
        >
          <Copy size={16} />
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-gold" />
          <h2 className="font-display text-lg tracking-wide">
            Participants ({pool.participants.length})
          </h2>
        </div>
        {pool.participants.length === 0 ? (
          <p className="text-mute text-sm">No one's joined yet — share the code above.</p>
        ) : (
          <div className="space-y-2">
            {pool.participants.map((p) => (
              <div
                key={p.phone}
                className="flex items-center justify-between rounded-xl border border-pitch-line bg-pitch-card/50 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{p.flag}</span>
                  <span className="font-mono text-sm text-chalk">{maskPhone(p.phone)}</span>
                </div>
                <span className="text-xs font-semibold text-gold-bright uppercase tracking-wide">
                  {p.pick === "HOME" ? pool.fixture?.home : p.pick === "AWAY" ? pool.fixture?.away : "Draw"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {pool.status === "settled" ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-gold" />
            <h2 className="font-display text-lg tracking-wide">Payouts</h2>
          </div>
          <div className="space-y-2">
            {pool.payouts.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-pitch-line bg-pitch-card/50 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{p.flag}</span>
                  <span className="font-mono text-sm text-chalk">{maskPhone(p.phone)}</span>
                </div>
                <div className="text-right">
                  <p className="scoreboard-num text-sm font-semibold text-gold-bright">
                    {pool.currency} {p.amount}
                  </p>
                  <p className="text-[10px] text-mute font-mono">tx {p.txHash.slice(0, 10)}…</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-pitch-line bg-pitch-card/40 p-5">
          <p className="text-xs uppercase tracking-widest text-mute font-semibold mb-1">
            Oracle / demo control
          </p>
          <p className="text-mute text-xs mb-4 leading-relaxed">
            In production, the <code className="text-gold-bright font-mono">oracle/</code>{" "}
            settlement worker watches live match results and calls this automatically. For
            this demo, mark the result yourself to see settlement run end to end.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {RESULTS.map((r) => (
              <button
                key={r.id}
                disabled={settling || pool.participants.length === 0}
                onClick={() => handleSettle(r.id)}
                className="btn-secondary !py-2.5 text-xs truncate"
              >
                {r.label(pool.fixture)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
