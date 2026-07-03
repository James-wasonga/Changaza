# Changaza

**Chip in, win together.** Prediction pools for the World Cup (and beyond), joined with
local mobile money instead of a credit card or a crypto wallet. Entries are escrowed
in a transparent smart-contract layer; payouts land back on the winner's phone.

This is a fully working demo build: every screen, flow, and interaction works end to
end in the browser. Payments and blockchain calls run through a simulation layer built
to mirror the real APIs one-to-one, so plugging in live infrastructure later is a
service-file swap, not a rewrite.

---

## 1. What's inside

```
changaza/
├─ src/
│  ├─ pages/            Landing, CreatePool, JoinPool, PoolLobby, Transparency
│  ├─ components/       PoolTicket (signature UI), PaymentModal, Countdown, nav, etc.
│  ├─ services/
│  │   ├─ blockchainService.js   Mirrors Soroban contract calls (createPool, joinPool,
│  │   │                          settlePool, getPool). Swap the internals for a
│  │   │                          stellar-sdk client — the function signatures stay.
│  │   └─ paymentService.js      Mirrors the Safaricom Daraja STK Push + polling flow.
│  │                              Swap for real API calls to your backend.
│  ├─ data/              Demo fixtures + the pluggable payment-rail registry
│  └─ context/           Toast notifications
├─ public/               manifest.webmanifest, service worker, icon (PWA-ready)
└─ index.html
```

**Design language:** every pool renders as a "Pool Ticket" — a stylized matchday
ticket stub with a perforated edge and a barcode built from the pool code. It's the
one signature visual element the whole app is built around: scoreboard-style display
type for headlines and countdowns, warm gold for money/stakes, deep pitch-black base.

---

## 2. Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd changaza
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). That's it — everything
works without any backend, API keys, or wallet setup, because the payment and
blockchain layers are self-contained simulations.

**To build a production bundle:**

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally to double check it
```

---

## 3. Try the full flow yourself

1. **Home** — pick a fixture, or hit "Create a pool"
2. **Create a pool** — choose a match, set an entry amount, make your prediction,
   enter any phone number, hit "Fund entry." Watch the simulated M-Pesa STK push run
   (sent → waiting for PIN → confirming → done) — this is built to match the real
   Safaricom Daraja flow exactly
3. You land on the **Pool Lobby** with a shareable link and pool code
4. Open that link in a new tab (or send it to a friend) to **join** the same pool with
   a different phone number and a different prediction
5. Back in the lobby, use the **oracle / demo control** panel to mark a result — this
   simulates what a real match-result oracle would feed into the smart contract — and
   watch payouts calculate and display automatically, with masked phone numbers and
   simulated transaction hashes
6. Check the **Transparency** page for the plain-language rules explanation you can
   point judges to

---

## 4. Deploying it (for your submission link)

The fastest path is [Vercel](https://vercel.com) or [Netlify](https://netlify.com) —
both auto-detect Vite and need zero configuration:

```bash
npm install -g vercel
vercel
```

or drag-and-drop the `dist/` folder (after `npm run build`) into Netlify's deploy UI.

---

## 5. Wiring in the real infrastructure (post-hackathon roadmap)

Everything is already isolated so this is additive work, not a rewrite:

**Real M-Pesa (Daraja API):**
Replace the body of `initiatePayment()` and `pollPaymentStatus()` in
`src/services/paymentService.js` with calls to your backend, which talks to
Safaricom's STK Push and callback endpoints. The function signatures the rest of the
app calls (`initiatePayment({ railId, amount, phone })`) don't need to change.

**Real Soroban contract on Stellar:**
Replace the body of `createPool`, `joinPool`, `settlePool`, and `getPool` in
`src/services/blockchainService.js` with `stellar-sdk` / Soroban RPC calls against
your deployed contract, using the same pattern you used on ShambaChain and Auctora
(Freighter for signing, `scValToNative()` handling, polling for SUCCESS). Keep the
same function signatures and every page in the app keeps working unmodified.

**Adding a new payment rail (GCash, UPI, Pix, MTN MoMo):**
Add an entry to `src/data/rails.js` and a corresponding branch in
`paymentService.js`. No UI changes needed — `RailStrip` and the payment flow already
read from that registry.

**Match results:**
Swap the manual "oracle / demo control" panel in `PoolLobby.jsx` for a real oracle
feed or sports-data API call that triggers `settlePool()` automatically when a match
ends.

---

## 6. Talking points for your submission

- **Real problem, not a toy one:** 2B+ people worldwide transact primarily through
  local mobile money, not cards or crypto — every major prediction platform ignores
  them.
- **Working proof of concept, not just a pitch:** M-Pesa flow and pool logic run
  end-to-end in this build today.
- **Genuinely global architecture:** the payment-rail registry is data, not code —
  Kenya today, Philippines/India/Brazil/Nigeria next, same contract logic throughout.
- **Trust by design, not by promise:** funds are escrowed on-chain; refunds are
  automatic if no one wins; nothing about payouts depends on trusting Changaza.
