import clsx from "clsx";

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card glass-card-hover", className)} {...props} />;
}

export function GlassPill({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("glass-pill", className)} {...props} />;
}

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="mb-4">
      {kicker && <div className="kicker mb-1">{kicker}</div>}
      <h2 className="font-display text-2xl">{title}</h2>
    </div>
  );
}

