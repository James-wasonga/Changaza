// --- blockchainService ---
// Abstraction over the on-chain escrow + settlement layer. Every function here
// mirrors a real Soroban contract call (createPool, joinPool, settlePool,
// getPoolState). Internals currently persist to localStorage so the app is
// fully demoable offline; swap the body of each function for a stellar-sdk /
// Soroban RPC client call and nothing else in the app needs to change.

const STORE_KEY = "changaza_chain_state_v1";
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeStore(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function genTxHash() {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 24; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
}

function genPoolCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/** Simulated contract call: create a new escrow pool. */
export async function createPool({ fixture, entryAmount, currency, poolType }) {
  await delay(650);
  const state = readStore();
  const code = genPoolCode();
  const pool = {
    code,
    fixture,
    entryAmount: Number(entryAmount),
    currency,
    poolType, // 'winner-take-all' | 'split'
    createdAt: new Date().toISOString(),
    createTxHash: genTxHash(),
    participants: [],
    status: "open",
    result: null,
    payouts: [],
  };
  state[code] = pool;
  writeStore(state);
  return pool;
}

/** Simulated contract call: join an existing pool, funds already captured off-chain. */
export async function joinPool(code, { phone, country, flag, railId, pick, receipt }) {
  await delay(650);
  const state = readStore();
  const pool = state[code];
  if (!pool) throw new Error("This pool code doesn't exist. Double-check and try again.");
  if (pool.status !== "open") throw new Error("This pool is already settled.");
  if (pool.participants.some((p) => p.phone === phone)) {
    throw new Error("This phone number already has an entry in this pool.");
  }
  const participant = {
    phone,
    country,
    flag,
    railId,
    pick, // 'HOME' | 'DRAW' | 'AWAY'
    receipt,
    txHash: genTxHash(),
    joinedAt: new Date().toISOString(),
  };
  pool.participants.push(participant);
  state[code] = pool;
  writeStore(state);
  return pool;
}

/** Simulated contract call: read current pool state. */
export async function getPool(code) {
  await delay(250);
  const state = readStore();
  const pool = state[code?.toUpperCase()];
  if (!pool) throw new Error("Pool not found.");
  return pool;
}

/**
 * Simulated contract call: settle the pool against a result.
 * Splits the pot evenly among everyone who picked correctly.
 * If nobody picked correctly, every entry is refunded in full — the
 * contract never keeps funds it can't attribute to a winner.
 */
export async function settlePool(code, result) {
  await delay(900);
  const state = readStore();
  const pool = state[code];
  if (!pool) throw new Error("Pool not found.");
  if (pool.status === "settled") return pool;

  const pot = pool.entryAmount * pool.participants.length;
  const winners = pool.participants.filter((p) => p.pick === result);
  const payoutBase = winners.length > 0 ? winners : pool.participants; // refund all if no winners
  const share = payoutBase.length > 0 ? +(pot / payoutBase.length).toFixed(2) : 0;

  pool.result = result;
  pool.status = "settled";
  pool.settledAt = new Date().toISOString();
  pool.pot = pot;
  pool.payouts = payoutBase.map((p) => ({
    phone: p.phone,
    flag: p.flag,
    amount: share,
    refund: winners.length === 0,
    txHash: genTxHash(),
  }));

  state[code] = pool;
  writeStore(state);
  return pool;
}

/** List pools, most recent first — used for the "recent pools" demo strip. */
export async function listPools() {
  await delay(150);
  const state = readStore();
  return Object.values(state).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
