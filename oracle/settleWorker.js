// --- Changaza settlement oracle (reference implementation) ---
//
// What this does:
//   1. Reads on-chain `created` events from the pool-escrow contract to learn
//      which pools exist and which match (fixture id) each one is tied to.
//      No separate database needed — the chain itself is the source of truth
//      for "which pools are open."
//   2. Cross-references each open pool's fixture id against the same live
//      World Cup results feed the frontend uses.
//   3. For any fixture that's finished, calls `settle_pool` on-chain with the
//      real result, signed by the admin/oracle key.
//
// This is a STARTING POINT, not a hardened production service. Before
// running this against real funds, you'd want to add: persistent cursor
// storage (so restarts don't re-scan from genesis), retry/idempotency
// handling around failed submissions, alerting on repeated failures, and a
// securely managed signing key (KMS / HSM — not a .env file) since this key
// can move real money out of every open pool.
//
// Run with:  npm install && ADMIN_SECRET=S... CONTRACT_ID=C... npm start

import {
  Contract,
  Keypair,
  rpc,
  TransactionBuilder,
  Networks,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

const RPC_URL = process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;
const CONTRACT_ID = process.env.CONTRACT_ID;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const FIXTURES_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 60_000);

if (!CONTRACT_ID || !ADMIN_SECRET) {
  console.error("Set CONTRACT_ID and ADMIN_SECRET environment variables before running.");
  process.exit(1);
}

const server = new rpc.Server(RPC_URL);              
const adminKeypair = Keypair.fromSecret(ADMIN_SECRET);              
const contract = new Contract(CONTRACT_ID);            

// In-memory index of pool_id -> { matchId, settled }. A restart re-derives
// this from chain events, so it's disposable — swap for a small persistent 
// store (SQLite/Redis) once this runs continuously in production.    
const poolIndex = new Map();
let lastLedger = 0;

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function outcomeFromScore(score) {
  if (!score || !Array.isArray(score.ft)) return null;
  const [home, away] = score.ft;
  if (home > away) return "Home";
  if (away > home) return "Away";
  return "Draw";
}

async function fetchFinishedFixtures() {
  const res = await fetch(FIXTURES_URL);
  if (!res.ok) throw new Error(`Fixture feed returned ${res.status}`);
  const data = await res.json();
  const finished = new Map();
  for (const m of data.matches || []) {
    if (!m.team1 || !m.team2 || !m.score) continue;
    const id = `${m.date}-${slugify(m.team1)}-${slugify(m.team2)}`;
    const outcome = outcomeFromScore(m.score);
    if (outcome) finished.set(id, outcome);
  }
  return finished;
}

/** Scans new contract events since the last checkpoint and indexes any new pools. */
async function indexNewPools() {
  const latest = await server.getLatestLedger();
  const startLedger = lastLedger || Math.max(latest.sequence - 17_280, 1); // ~last day if cold start

  const { events } = await server.getEvents({
    startLedger,
    filters: [
      {
        type: "contract",
        contractIds: [CONTRACT_ID],
        topics: [["created"]],
      },
    ],
    limit: 200,
  });

  for (const event of events) {
    try {
      const poolIdTopic = event.topic[1];
      const poolId = scValToNative(poolIdTopic);
      const [matchId] = scValToNative(event.value);
      if (!poolIndex.has(poolId)) {
        poolIndex.set(poolId, { matchId, settled: false });
        console.log(`[index] discovered pool ${poolId} for match ${matchId}`);
      }
    } catch (err) {
      console.warn("[index] couldn't decode event, skipping:", err.message);
    }
  }

  lastLedger = latest.sequence;
}

/** Builds, signs, and submits a settle_pool invocation for one pool. */
async function settlePool(poolId, outcome) {
  const account = await server.getAccount(adminKeypair.publicKey());

  const op = contract.call(
    "settle_pool",
    nativeToScVal(poolId, { type: "symbol" }),
    nativeToScVal({ tag: outcome, values: undefined }, { type: "instance" })
  );

  let tx = new TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(60)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(adminKeypair);

  const result = await server.sendTransaction(tx);
  console.log(`[settle] ${poolId} -> ${outcome} :: submitted ${result.hash} (${result.status})`);
  return result;
}

async function tick() {
  try {
    await indexNewPools();
    const finished = await fetchFinishedFixtures();

    for (const [poolId, info] of poolIndex.entries()) {
      if (info.settled) continue;
      const outcome = finished.get(info.matchId);
      if (!outcome) continue; // match hasn't finished yet

      try {
        await settlePool(poolId, outcome);
        info.settled = true;
      } catch (err) {
        // Leave `settled` false so we retry next tick — settle_pool is
        // idempotent on-chain (re-settling an already-settled pool is a
        // no-op), so retrying safely here is fine.
        console.error(`[settle] failed for ${poolId}:`, err.message);
      }
    }
  } catch (err) {
    console.error("[tick] error:", err.message);
  }
}

console.log(`Changaza settlement oracle starting — polling every ${POLL_INTERVAL_MS / 1000}s`);
tick();
setInterval(tick, POLL_INTERVAL_MS);
