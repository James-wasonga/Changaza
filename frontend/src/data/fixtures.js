// Demo World Cup fixture data. Swap for a live fixtures API post-hackathon.
export const FIXTURES = [
  {
    id: "fx-1",
    home: "Canada",
    homeFlag: "",
    away: "Morocco",
    awayFlag: "",
    stage: "Group C · Matchday 2",
    kickoff: offsetFromNow(1, 12),
  },
  {
    id: "fx-2",
    home: "Brazil",
    homeFlag: "🇧🇷",
    away: "Norway",
    awayFlag: "",
    stage: "Group A · Matchday 2",
    kickoff: offsetFromNow(1, 18),
  },
  {
    id: "fx-3",
    home: "Paraguay",
    homeFlag: "",
    away: "France",
    awayFlag: "",
    stage: "Group F · Matchday 1",
    kickoff: offsetFromNow(1, 18),
  },
  {
    id: "fx-4",
    home: "Mexico",
    homeFlag: "",
    away: "England",
    awayFlag: "",
    stage: "Group D · Matchday 2",
    kickoff: offsetFromNow(2, 20),
  },
];

function offsetFromNow(days, hours) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours, 0, 0, 0);
  return d.toISOString();
}
