import { useEffect, useRef } from "react";

export function Confetti() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let running = false;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
    };
    const particles = () =>
      new Array(80).fill(0).map(() => ({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 1 + 1,
        r: Math.random() * 4 + 2,
        a: 1,
        c: ["#FF9C0A", "#FFD466", "#FFAF70", "#FFE59A"][Math.floor(Math.random() * 4)]
      }));

    let ps = particles();

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        p.a -= 0.004;
        ctx.globalAlpha = Math.max(0, p.a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ps = ps.filter(p => p.a > 0 && p.y < canvas.height + 10);
      raf = requestAnimationFrame(draw);
    };

    const onBurst = () => {
      running = true;
      ps.push(...particles());
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
      setTimeout(() => {
        running = false;
        cancelAnimationFrame(raf);
      }, 1200);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("confetti", onBurst);
    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("confetti", onBurst);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 w-full h-full" aria-hidden />;
}

