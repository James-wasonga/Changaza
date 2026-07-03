import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, TicketCheck, ShieldCheck } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/join", label: "Join", icon: TicketCheck },
  { to: "/create", label: "Create", icon: PlusCircle },
  { to: "/transparency", label: "Rules", icon: ShieldCheck },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-pitch-line bg-pitch-black/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {LINKS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold"
            >
              <Icon size={20} className={active ? "text-gold-bright" : "text-mute"} />
              <span className={active ? "text-gold-bright" : "text-mute"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
