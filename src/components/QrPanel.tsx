import { THEME } from "@/theme";
import { useEffect, useRef, useState } from "react";

// Draw a QR for the main CTA. You can change target via ?url=
export function QrPanel() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [target, setTarget] = useState(() => {
    const u = new URL(location.href);
    return u.searchParams.get("url") || (location.origin + "/#adventure");
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const QR = await import("qrcode");
      if (!mounted || !ref.current) return;
      await QR.toCanvas(ref.current, target, { margin: 1, scale: 10 });
    })();
    return () => { mounted = false; };
  }, [target]);

  return (
    <section className={`${THEME.layout.padX} py-12`}>
      <div className={`${THEME.layout.maxW} mx-auto grid gap-4 place-items-center`}>
        <h1 className="font-display text-2xl">Scan to start your micro adventure</h1>
        <canvas ref={ref} className="bg-white p-3 rounded-3xl shadow-soft" />
        <p className="text-clay/70 break-all text-center">{target}</p>
      </div>
    </section>
  );
}


