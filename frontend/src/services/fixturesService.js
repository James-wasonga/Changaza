// --- fixturesService ---
// Fetches real World Cup 2026 fixtures and results from openfootball's
// free, no-API-key, public dataset. It's community-maintained (updated by
// people, not a sub-second live-odds feed), so treat it as "genuinely live
// schedule and results data," not a millisecond-accurate scoreboard. For a
// production deployment wanting true real-time in-play scores, swap
// SOURCE_URL + parseFeed() for a paid provider (API-Football, Sportmonks,
// TheStatsAPI) — every other function in this file stays the same, since
// they all operate on the normalized `Fixture` shape below, not the raw feed.

import { flagFor } from "../data/countryFlags";

const SOURCE_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const CACHE_KEY = "changaza_fixtures_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — enough to avoid hammering
// GitHub's raw CDN on every page load, short enough that scores/fixtures
// feel current during a live event.

function hasDigit(str) {
  return /\d/.test(str);
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Combines the feed's "HH:MM UTC±N" local kickoff time into a real UTC Date. */
function parseKickoff(dateStr, timeStr) {
  const match = /(\d{2}):(\d{2})\s*UTC([+-]\d+)/.exec(timeStr || "");
  if (!match) {
    // Fallback: no offset given, assume the time is already UTC.
    return new Date(`${dateStr}T${(timeStr || "00:00").slice(0, 5)}:00Z`);
  }
  const [, hh, mm, offset] = match;
  const asIfUtc = new Date(`${dateStr}T${hh}:${mm}:00Z`);
  asIfUtc.setUTCHours(asIfUtc.getUTCHours() - parseInt(offset, 10));
  return asIfUtc;
}


function outcomeFromScore(score) {
  if (!score || !Array.isArray(score.ft)) return null;
  const [home, away] = score.ft;
  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}

function normalize(raw) {
  return (raw.matches || [])
    .filter((m) => m.team1 && m.team2 && !hasDigit(m.team1) && !hasDigit(m.team2))
    .map((m) => {
      const kickoff = parseKickoff(m.date, m.time);
      return {
        id: `${m.date}-${slugify(m.team1)}-${slugify(m.team2)}`,
        home: m.team1,
        away: m.team2,
        homeFlag: flagFor(m.team1),
        awayFlag: flagFor(m.team2),
        stage: [m.group, m.round].filter(Boolean).join(" · "),
        ground: m.ground || null,
        kickoff: kickoff.toISOString(),
        played: Boolean(m.score),
        score: m.score || null,
        result: outcomeFromScore(m.score),
      };
    });
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { fetchedAt, fixtures } = JSON.parse(raw);
    if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return fixtures;
  } catch {
    return null;
  }
}

function writeCache(fixtures) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), fixtures }));
  } catch {
    // Storage full or unavailable — non-fatal, just skip caching.
  }
}

/**
 * Returns upcoming fixtures (kickoff within the last 3 hours or later, so
 * matches that just started still show up), soonest first.
 */
export async function fetchUpcomingFixtures(limit = 8) {
  const all = await fetchAllFixtures();
  const cutoff = Date.now() - 3 * 60 * 60 * 1000;
  return all
    .filter((f) => new Date(f.kickoff).getTime() > cutoff)
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
    .slice(0, limit);
}

/** Returns every fixture in the feed, played and unplayed, cached client-side. */
export async function fetchAllFixtures() {
  const cached = readCache();
  if (cached) return cached;

  const res = await fetch(SOURCE_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Fixture feed returned ${res.status}`);
  }
  const raw = await res.json();
  const fixtures = normalize(raw);
  writeCache(fixtures);
  return fixtures;
}

/** Looks up one fixture by its stable id (date + team slugs) — used by the
 * settlement oracle to check whether a specific pool's match has finished. */
export async function getFixtureById(id) {
  const all = await fetchAllFixtures();
  return all.find((f) => f.id === id) || null;
}