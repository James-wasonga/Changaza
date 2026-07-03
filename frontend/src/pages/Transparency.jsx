import { ShieldCheck, Coins, RefreshCw, Globe2 } from "lucide-react";

const SECTIONS = [
  {
    icon: Coins,
    title: "Where your money goes",
    body: "When you pay your entry, funds are escrowed on-chain in a Soroban smart contract on Stellar — not held in a Changaza company account. Nobody, including us, can move that money outside the rules written into the contract.",
  },
  {
    icon: ShieldCheck,
    title: "How payouts are decided",
    body: "Each pool has a fixed rule set: winner-takes-all or split-among-correct-picks, decided when the pool is created and visible to everyone who joins. Once a result is recorded, the contract calculates payouts automatically — there's no manual step where an outcome could be changed after the fact.",
  },
  {
    icon: RefreshCw,
    title: "If nobody picks correctly",
    body: "The contract never keeps funds it can't attribute to a winner. If no one in a pool picked the right outcome, every entry is refunded in full, automatically.",
  },
  {
    icon: Globe2,
    title: "One set of rules, everywhere",
    body: "The same contract logic applies no matter which local payment rail brought your money in — M-Pesa today, UPI, GCash, Pix, and MTN MoMo as they come online. The rail changes how money enters and exits; it never changes how a pool is settled.",
  },
];

export default function Transparency() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-12 pb-28 md:pb-16">
      <p className="text-gold font-mono text-xs tracking-[0.25em] uppercase mb-3">Transparency</p>
      <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-4">
        Verifiable by anyone, anywhere.
      </h1>
      <p className="text-mute text-base leading-relaxed mb-10 max-w-xl">
        Changaza is built so you don't have to trust a company's word — you can check the rules
        yourself. Here's exactly how pools, escrow, and payouts work under the hood.
      </p>

      <div className="space-y-8">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold-dim flex items-center justify-center shrink-0">
              <Icon size={18} className="text-gold-bright" />
            </div>
            <div>
              <h2 className="font-display text-lg tracking-wide mb-1.5">{title}</h2>
              <p className="text-mute text-sm leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="stitch-divider my-10" />

      <div className="rounded-xl border border-pitch-line bg-pitch-card/50 p-5">
        <p className="text-xs uppercase tracking-widest text-mute font-semibold mb-2">
          For this demo build
        </p>
        <p className="text-mute text-xs leading-relaxed">
          Pool state and payments in this build run through a local simulation layer
          (<code className="text-gold-bright font-mono">blockchainService.js</code> and{" "}
          <code className="text-gold-bright font-mono">paymentService.js</code>) that mirrors the
          real Soroban contract calls and Safaricom Daraja STK Push flow one-to-one, so swapping in
          live infrastructure doesn't change anything about how the app behaves.
        </p>
      </div>
    </div>
  );
}
