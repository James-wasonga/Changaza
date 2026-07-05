# Changaza Settlement Oracle (reference implementation)

This is the piece that closes the loop: it watches for real match results and
calls `settle_pool` on-chain automatically, instead of you doing it by hand
from the Pool Lobby's demo panel.

**Read this before running it against real funds — see section 4.**

## 1. What it does

1. Reads `created` events emitted by the pool-escrow contract to discover
   every pool and which match (`match_id`) it's tied to — no separate
   database required, the chain is the source of truth.
2. Cross-references each open pool's match against the same live World Cup
   results feed (`openfootball/worldcup.json`) the frontend uses.
3. When a match finishes, signs and submits `settle_pool` with the real
   result.

## 2. Setup

```bash
cd oracle
npm install
```

Set three environment variables:

```bash
export CONTRACT_ID=C...          # from `make deploy` in ../contract
export ADMIN_SECRET=S...         # secret key for the admin address you
                                  # passed to __constructor at deploy time
export SOROBAN_RPC_URL=https://soroban-testnet.stellar.org   # optional, this is the default
```

Then:

```bash
npm start
```

It logs discovered pools and settlement submissions to the console, and
polls once a minute by default (`POLL_INTERVAL_MS`).

## 3. Where to run it

This needs to be a small, always-on process — not a Vercel serverless
function (those have execution time limits and don't stay running between
requests). Cheapest options that work well for this:

- **Railway** or **Render** — deploy this folder as a background worker,
  point it at your `CONTRACT_ID`/`ADMIN_SECRET` as secrets
- A **$5/mo VPS** (Hetzner, DigitalOcean) running it under `pm2` or `systemd`
- A scheduled **cron job** (e.g. GitHub Actions on a schedule) calling `tick()`
  once per invocation instead of running the `setInterval` loop, if you'd
  rather not keep a process alive continuously

## 4. Before this touches real money — read this

This file is intentionally a **reference implementation**, not a hardened
production service. Specifically:

- **Key management:** `ADMIN_SECRET` in an env var is fine for a hackathon
  demo. In production, this key can move money out of every open pool — it
  belongs in a proper secrets manager or, better, behind a multisig/HSM, not
  a `.env` file on a single server.
- **No persistent cursor:** if the process restarts, it re-scans roughly the
  last day of ledgers for `created` events. That's fine at hackathon scale;
  at real scale you'd persist `lastLedger` and the pool index to a small
  database so restarts don't redo work or risk missing a very old pool.
- **Retry handling:** failed settlement submissions are retried on the next
  tick (safe, since `settle_pool` is a no-op if a pool is already settled),
  but there's no alerting if something is failing repeatedly — add that
  before this runs unattended.
- **Result source reliability:** `openfootball/worldcup.json` is
  community-maintained and generally reliable, but it is not a contractually
  guaranteed real-time feed. For real money at stake, pair it with (or
  replace it with) a paid provider with an SLA — see the note in
  `../src/services/fixturesService.js` for what that swap looks like on the
  frontend side; the same idea applies here.

## 5. What "oracle" means here, precisely

This worker is the trust bridge between the real world and the contract: the
contract can't know who won a football match on its own, so something has to
tell it. Right now that "something" is one admin key backed by one data
source. That's honest and fine for launch — but it's worth being able to say
in a judge Q&A that you know the difference between "an oracle" and "a
*decentralized* oracle" (multiple independent data sources / signers with
disagreement resolution) and that this is deliberately the former, upgraded
to the latter as a post-launch step, not a launch-day requirement.
