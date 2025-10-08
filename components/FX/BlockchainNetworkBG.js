"use client";
// Animated blockchain network background: nodes, links, transaction pulses.
// No libraries. Runs only on the client.

import { useEffect, useRef } from "react";

export default function BlockchainNetworkBG({
  hueA = 172,        // teal
  hueB = 268,        // violet
  density = 7000,    // lower = more nodes
  connectRadius = 170,
  speed = 0.28,
  pulseCount = 28,
  glow = true,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    // ensure full-screen canvas
    const DPR = Math.min(2, globalThis.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(DPR, DPR);
    };
    resize();

    // nodes
    const nodeCount = Math.max(
      120,
      Math.min(340, Math.floor((window.innerWidth * window.innerHeight) / density))
    );
    const R = connectRadius;
    const nodes = Array.from({ length: nodeCount }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: Math.random() * 1.2 + 0.6,
      h: lerp(hueA, hueB, Math.random()),
      rot: Math.random() * Math.PI * 2,
      rv: (Math.random() - 0.5) * 0.003,
    }));

    // pulses (transactions)
    const pulses = Array.from({ length: pulseCount }).map(() => newPulse());
    function newPulse() {
      const a = nodes[(Math.random() * nodes.length) | 0];
      let b = nodes[(Math.random() * nodes.length) | 0];
      if (a === b) b = nodes[(Math.random() * nodes.length) | 0];
      return { a, b, t: Math.random(), v: 0.006 + Math.random() * 0.006, hue: lerp(hueA, hueB, Math.random()) };
    }

    // parallax: gentle mouse attract/repel
    const mouse = { x: -9999, y: -9999 };
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // links layer (additive → brighter)
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        // mouse influence within 240px
        const dxm = a.x - mouse.x;
        const dym = a.y - mouse.y;
        const dm2 = dxm * dxm + dym * dym;
        if (dm2 < 240 * 240) {
          const f = 1 - Math.sqrt(dm2) / 240;
          const inv = 1 / (Math.sqrt(dm2) + 0.001);
          a.vx += (dxm * inv) * f * 0.01;
          a.vy += (dym * inv) * f * 0.01;
        }

        // movement & wrap
        a.x += a.vx; a.y += a.vy;
        a.vx *= 0.995; a.vy *= 0.995;
        if (a.x < -12) a.x = window.innerWidth + 12;
        if (a.x > window.innerWidth + 12) a.x = -12;
        if (a.y < -12) a.y = window.innerHeight + 12;
        if (a.y > window.innerHeight + 12) a.y = -12;
        a.rot += a.rv;

        // connect to near nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2);
            const alpha = 1 - d / R;
            const h = lerp(a.h, b.h, 0.5);
            ctx.strokeStyle = `hsla(${h}, 95%, 65%, ${0.45 * alpha})`;
            ctx.lineWidth = 1.6 * alpha;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

            if (glow) {
              ctx.strokeStyle = `hsla(${h}, 95%, 65%, ${0.12 * alpha})`;
              ctx.lineWidth = 7 * alpha;
              ctx.stroke();
            }
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 20);
        grad.addColorStop(0, `hsla(${n.h}, 95%, 65%, 0.95)`);
        grad.addColorStop(1, `hsla(${n.h}, 95%, 65%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rot);
        ctx.fillStyle = `hsla(${n.h}, 95%, 65%, 0.22)`;
        ctx.strokeStyle = `hsla(${n.h}, 95%, 65%, 0.45)`;
        ctx.lineWidth = 0.7;
        const s = 6;
        ctx.beginPath(); ctx.rect(-s/2, -s/2, s, s); ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      // pulses
      pulses.forEach((p, idx) => {
        p.t += p.v;
        if (p.t >= 1) { pulses[idx] = newPulse(); return; }
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
        g.addColorStop(0, `hsla(${p.hue},100%,70%, 0.95)`);
        g.addColorStop(1, `hsla(${p.hue},100%,70%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";

      // vignette
      const v = ctx.createRadialGradient(
        window.innerWidth / 2, window.innerHeight / 2, 0,
        window.innerWidth / 2, window.innerHeight / 2,
        Math.max(window.innerWidth, window.innerHeight) * 0.8
      );
      v.addColorStop(0, "rgba(6,8,14,0)");
      v.addColorStop(1, "rgba(6,8,14,0.8)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [hueA, hueB, density, connectRadius, speed, pulseCount, glow]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 -z-10" />;
}

function lerp(a, b, t) { return a + (b - a) * t; }
