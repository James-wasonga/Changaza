import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/create", label: "Create Pool" },
  { to: "/join", label: "Join Pool" },
  { to: "/transparency", label: "How it works" },
];

export default function TopNav() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-pitch-line/70 bg-pitch-black/85 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" aria-label="Changaza home">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                pathname === l.to
                  ? "text-gold-bright bg-pitch-card"
                  : "text-mute hover:text-chalk"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/create" className="hidden md:inline-flex btn-primary !py-2 !px-4 text-sm">
          Create Pool
        </Link>
      </div>
    </header>
  );
}
