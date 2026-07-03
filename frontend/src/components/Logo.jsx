export default function Logo({ size = "md" }) {
  const cls = size === "lg" ? "text-4xl md:text-5xl" : "text-xl";
  return (
    <div className={`font-display tracking-wide ${cls} inline-flex items-baseline gap-0.5 select-none`}>
      <span className="text-chalk">CHANGA</span>
      <span className="text-gold">ZA</span>
    </div>
  );
}
