import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { FIXTURES } from "../data/fixtures";
import { RAILS, LIVE_RAIL } from "../data/rails";
import { createPool, joinPool } from "../services/blockchainService";
import { useToast } from "../context/ToastContext";
import PaymentModal from "../components/PaymentModal";
import PoolTicket from "../components/PoolTicket";

const PICKS = [
  { id: "HOME", label: (fx) => fx?.home || "Home" },
  { id: "DRAW", label: () => "Draw" },
  { id: "AWAY", label: (fx) => fx?.away || "Away" },
];

export default function CreatePool() {
  const location = useLocation();
  const navigate = useNavigate();
  const { push } = useToast();

  const preselected = location.state?.fixtureId;
  const [fixtureId, setFixtureId] = useState(preselected || FIXTURES[0].id);
  const [entryAmount, setEntryAmount] = useState(100);
  const [poolType, setPoolType] = useState("winner-take-all");
  const [phone, setPhone] = useState("");
  const [pick, setPick] = useState("HOME");
  const [rail] = useState(LIVE_RAIL);
  const [submitting, setSubmitting] = useState(false);
  const [pendingPool, setPendingPool] = useState(null);
  const [payOpen, setPayOpen] = useState(false);

  const fixture = FIXTURES.find((f) => f.id === fixtureId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phone.trim()) {
      push("Enter your phone number to fund the first entry.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const pool = await createPool({ fixture, entryAmount, currency: rail.currency, poolType });
      setPendingPool(pool);
      setPayOpen(true);
    } catch (err) {
      push(err.message || "Couldn't create the pool. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaySuccess(result) {
    try {
      await joinPool(pendingPool.code, {
        phone,
        country: rail.country,
        flag: rail.flag,
        railId: rail.id,
        pick,
        receipt: result.receipt,
      });
      setPayOpen(false);
      push("Pool created — funds escrowed on-chain.", "success");
      navigate(`/pool/${pendingPool.code}`);
    } catch (err) {
      push(err.message || "Something went wrong confirming your entry.", "error");
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-10 pb-28 md:pb-16">
      <h1 className="font-display text-3xl tracking-wide mb-2">Create a pool</h1>
      <p className="text-mute text-sm mb-8">
        You'll fund the first entry to open the pool, then share the code with others.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-mute font-semibold mb-2">
            Match
          </label>
          <div className="grid gap-2">
            {FIXTURES.map((fx) => (
              <button
                type="button"
                key={fx.id}
                onClick={() => setFixtureId(fx.id)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  fixtureId === fx.id
                    ? "border-gold bg-gold/10"
                    : "border-pitch-line hover:border-pitch-line/70"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span>{fx.homeFlag}</span> {fx.home} <span className="text-mute font-normal">vs</span>{" "}
                  {fx.away} <span>{fx.awayFlag}</span>
                </span>
                <span className="text-mute text-xs font-mono">{fx.stage}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-mute font-semibold mb-2">
              Entry amount ({rail.currency})
            </label>
            <input
              type="number"
              min="10"
              step="10"
              value={entryAmount}
              onChange={(e) => setEntryAmount(e.target.value)}
              className="input-field scoreboard-num"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-mute font-semibold mb-2">
              Pool type
            </label>
            <select
              value={poolType}
              onChange={(e) => setPoolType(e.target.value)}
              className="input-field"
            >
              <option value="winner-take-all">Winner takes all</option>
              <option value="split">Split among correct picks</option>
            </select>
          </div>
        </div>

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
                  pick === p.id ? "border-gold bg-gold/10 text-gold-bright" : "border-pitch-line text-mute"
                }`}
              >
                {p.label(fixture)}
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

        <div className="flex items-start gap-2.5 rounded-xl border border-pitch-line bg-pitch-card/60 px-4 py-3">
          <Info size={16} className="text-gold shrink-0 mt-0.5" />
          <p className="text-xs text-mute leading-relaxed">
            Your entry is escrowed in a Soroban smart contract on Stellar, not held by Changaza.
            Anyone can verify pool rules and payouts on the transparency page.
          </p>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Opening pool…" : `Fund entry — ${rail.currency} ${entryAmount || 0}`}
        </button>
      </form>

      {pendingPool && (
        <div className="mt-8">
          <p className="text-xs uppercase tracking-widest text-mute font-semibold mb-2">Preview</p>
          <PoolTicket pool={{ ...pendingPool, fixture }} />
        </div>
      )}

      {pendingPool && (
        <PaymentModal
          open={payOpen}
          amount={entryAmount}
          currency={rail.currency}
          rail={rail}
          phone={phone}
          onSuccess={handlePaySuccess}
          onClose={() => setPayOpen(false)}
        />
      )}
    </div>
  );
}
