import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { getPool, joinPool } from "../services/blockchainService";
import { LIVE_RAIL } from "../data/rails";
import { useToast } from "../context/ToastContext";
import PoolTicket from "../components/PoolTicket";
import PaymentModal from "../components/PaymentModal";

const PICKS = [
  { id: "HOME", label: (fx) => fx?.home || "Home" },
  { id: "DRAW", label: () => "Draw" },
  { id: "AWAY", label: (fx) => fx?.away || "Away" },
];

export default function JoinPool() {
  const { code: codeParam } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [code, setCode] = useState(codeParam?.toUpperCase() || "");
  const [pool, setPool] = useState(null);
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [phone, setPhone] = useState("");
  const [pick, setPick] = useState("HOME");
  const [payOpen, setPayOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const rail = LIVE_RAIL;

  useEffect(() => {
    if (codeParam) lookup(codeParam);
  }, [codeParam]); // eslint-disable-line react-hooks/exhaustive-deps

  async function lookup(value) {
    const target = (value ?? code).trim().toUpperCase();
    if (!target) return;
    setLooking(true);
    setLookupError("");
    setPool(null);
    try {
      const p = await getPool(target);
      setPool(p);
    } catch (err) {
      setLookupError(err.message);
    } finally {
      setLooking(false);
    }
  }

  async function handleJoinSubmit(e) {
    e.preventDefault();
    if (!phone.trim()) {
      push("Enter your phone number to pay your entry.", "error");
      return;
    }
    setSubmitting(true);
    setPayOpen(true);
    setSubmitting(false);
  }

  async function handlePaySuccess(result) {
    try {
      const updated = await joinPool(pool.code, {
        phone,
        country: rail.country,
        flag: rail.flag,
        railId: rail.id,
        pick,
        receipt: result.receipt,
      });
      setPayOpen(false);
      push("You're in! Entry escrowed on-chain.", "success");
      navigate(`/pool/${updated.code}`);
    } catch (err) {
      setPayOpen(false);
      push(err.message || "Couldn't confirm your entry.", "error");
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-10 pb-28 md:pb-16">
      <h1 className="font-display text-3xl tracking-wide mb-2">Join a pool</h1>
      <p className="text-mute text-sm mb-8">Enter the 6-character code your friend shared with you.</p>

      <div className="flex gap-2 mb-8">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. 7XQK2P"
          maxLength={6}
          className="input-field font-mono tracking-[0.2em] text-lg"
        />
        <button
          onClick={() => lookup()}
          disabled={looking}
          className="btn-secondary shrink-0 !px-4 flex items-center gap-2"
        >
          <Search size={18} />
        </button>
      </div>

      {lookupError && <p className="text-coral text-sm mb-6">{lookupError}</p>}

      {pool && (
        <div className="space-y-6 animate-riseIn">
          <PoolTicket pool={pool} highlight />

          {pool.status === "settled" ? (
            <p className="text-mute text-sm">This pool has already been settled and can't accept new entries.</p>
          ) : (
            <form onSubmit={handleJoinSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-mute font-semibold mb-2">
                  Your prediction
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PICKS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPick(p.id)}
                      className={`rounded-xl border px-2 py-3 text-sm font-semibold transition truncate ${
                        pick === p.id
                          ? "border-gold bg-gold/10 text-gold-bright"
                          : "border-pitch-line text-mute"
                      }`}
                    >
                      {p.label(pool.fixture)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-mute font-semibold mb-2">
                  Pay with {rail.label} ({rail.flag} {rail.country})
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                Pay entry — {pool.currency} {pool.entryAmount}
              </button>
            </form>
          )}
        </div>
      )}

      {pool && (
        <PaymentModal
          open={payOpen}
          amount={pool.entryAmount}
          currency={pool.currency}
          rail={rail}
          phone={phone}
          onSuccess={handlePaySuccess}
          onClose={() => setPayOpen(false)}
        />
      )}
    </div>
  );
}
