import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Smartphone, Globe2 } from "lucide-react";
import { FIXTURES } from "../data/fixtures";
import RailStrip from "../components/RailStrip";
import Countdown from "../components/Countdown";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="pb-24 md:pb-16">
    {/* Hero */}
    <section className="max-w-4xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-12 flex flex-col items-center text-center">
        <p className="text-gold font-mono text-xs tracking-[0.25em] uppercase mb-5 animate-riseIn">
          Live for the World Cup · Built for everywhere
        </p>
        <h1
          className="font-display text-[12vw] leading-[0.95] sm:text-6xl md:text-7xl tracking-wide mb-6 animate-riseIn"
          style={{ animationDelay: "60ms" }}
        >
          Prediction pools
          <br />
          for <span className="text-gold">everyone</span>,
          <br />
          wherever you are.
        </h1>
        <p
          className="text-mute text-base md:text-lg max-w-xl mx-auto mb-9 animate-riseIn"
          style={{ animationDelay: "120ms" }}
        >
          Chip in with your local mobile money. Winnings settle transparently on-chain
          and land straight back on your phone no credit card, no crypto wallet, no house edge.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-3 mb-12 w-full sm:w-auto animate-riseIn"
          style={{ animationDelay: "180ms" }}
        >
          <Link to="/create" className="btn-primary inline-flex items-center justify-center gap-2">
            Create a pool <ArrowRight size={18} />
          </Link>
          <Link to="/join" className="btn-secondary inline-flex items-center justify-center gap-2">
            Join with a code
          </Link>
        </div>

        <div className="animate-riseIn flex flex-col items-center" style={{ animationDelay: "240ms" }}>
          <p className="text-xs uppercase tracking-widest text-mute mb-2.5 font-semibold">
            Payment rails
          </p>
          <RailStrip centered />
        </div>
      </section>

      <div className="stitch-divider max-w-5xl mx-auto" />

      {/* Fixtures */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-display text-2xl tracking-wide">Upcoming fixtures</h2>
          <span className="text-mute text-xs font-mono">{FIXTURES.length} live pools open</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {FIXTURES.map((fx) => (
            <button
              key={fx.id}
              onClick={() => navigate("/create", { state: { fixtureId: fx.id } })}
              className="text-left ticket p-5 hover:border-gold-dim transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-widest text-mute font-semibold">
                  {fx.stage}
                </span>
                <ArrowRight size={16} className="text-mute group-hover:text-gold-bright transition" />
              </div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{fx.homeFlag}</span>
                  <span className="font-display text-base tracking-wide">{fx.home}</span>
                </div>
                <span className="font-mono text-mute text-xs">VS</span>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <span className="text-2xl">{fx.awayFlag}</span>
                  <span className="font-display text-base tracking-wide">{fx.away}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mute text-xs">Kickoff in</span>
                <Countdown target={fx.kickoff} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="stitch-divider max-w-5xl mx-auto" />

      {/* Why */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12 grid sm:grid-cols-3 gap-6">
        {[
          {
            icon: Smartphone,
            title: "No wallet needed",
            body: "Pay in with the mobile money you already use. Winnings settle back the same way, in minutes.",
          },
          {
            icon: ShieldCheck,
            title: "Verifiable, not a black box",
            body: "Every pool is escrowed on-chain. Rules and payouts are checkable by anyone, not just trusted by faith.",
          },
          {
            icon: Globe2,
            title: "Built for everywhere",
            body: "M-Pesa is live today. UPI, GCash, Pix, and MTN MoMo are next — one architecture, any market.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <Icon size={22} className="text-gold mb-3" />
            <h3 className="font-display text-lg tracking-wide mb-1.5">{title}</h3>
            <p className="text-mute text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
