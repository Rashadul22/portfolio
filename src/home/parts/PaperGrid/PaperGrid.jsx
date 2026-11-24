import { useEffect, useRef } from 'react';
import './PaperGrid.css';

/*
 * PaperGrid: ECG paper grid on one canvas; lines bend away from the cursor like pressed paper.
 * Idea inspired by React Bits "Dot Grid" (reactbits.dev/backgrounds/dot-grid, MIT + Commons Clause).
 * Own implementation, no code copied.
 * Place inside a position:relative parent; it fills it, z-index 0 (content needs z-index >= 1).
 */
const MINOR = 8, MAJOR = 40, STEP = 8;

export default function PaperGrid({ strength = 10, radius = 140 }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const parent = root && root.parentElement;
    if (!root || !parent) return undefined;
    const canvas = document.createElement('canvas');
    canvas.className = 'pg-canvas';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return undefined; }

    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqTouch = window.matchMedia('(hover: none), (pointer: coarse)');
    let w = 0, h = 0, dpr = 1, raf = 0, onScreen = true;
    let colMinor = '', colMajor = '';
    // cursor target (tx,ty), smoothed position (x,y), amplitude a with spring velocity va
    const s = { tx: 0, ty: 0, x: 0, y: 0, a: 0, va: 0, target: 0 };
    const animated = () => !mqReduce.matches && !mqTouch.matches;

    const readColours = () => {
      const cs = getComputedStyle(root);
      colMinor = cs.getPropertyValue('--pg-minor').trim();
      colMajor = cs.getPropertyValue('--pg-major').trim();
    };

    // displacement of point (px,py): pushed away from the cursor, smoothstep falloff to 0 at radius
    const disp = (px, py, out) => {
      const dx = px - s.x, dy = py - s.y, d = Math.hypot(dx, dy);
      if (d >= radius || d < 0.001 || s.a < 0.001) { out[0] = 0; out[1] = 0; return; }
      const t = 1 - d / radius, m = strength * s.a * t * t * (3 - 2 * t);
      out[0] = (dx / d) * m; out[1] = (dy / d) * m;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      const bend = s.a >= 0.001, o = [0, 0], pad = radius + strength;
      const pass = (major, col) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += MINOR) {
          if ((x % MAJOR === 0) !== major) continue;
          const px = x + 0.5;
          if (!bend || Math.abs(px - s.x) > pad) { ctx.moveTo(px, 0); ctx.lineTo(px, h); continue; }
          const y0 = Math.max(0, s.y - pad), y1 = Math.min(h, s.y + pad);
          ctx.moveTo(px, 0); ctx.lineTo(px, y0);
          for (let y = y0; y < y1 + STEP / 2; y += STEP / 2) {
            const yy = Math.min(y, y1); disp(px, yy, o); ctx.lineTo(px + o[0], yy + o[1]);
          }
          ctx.lineTo(px, h);
        }
        for (let y = 0; y <= h; y += MINOR) {
          if ((y % MAJOR === 0) !== major) continue;
          const py = y + 0.5;
          if (!bend || Math.abs(py - s.y) > pad) { ctx.moveTo(0, py); ctx.lineTo(w, py); continue; }
          const x0 = Math.max(0, s.x - pad), x1 = Math.min(w, s.x + pad);
          ctx.moveTo(0, py); ctx.lineTo(x0, py);
          for (let x = x0; x < x1 + STEP / 2; x += STEP / 2) {
            const xx = Math.min(x, x1); disp(xx, py, o); ctx.lineTo(xx + o[0], py + o[1]);
          }
          ctx.lineTo(w, py);
        }
        ctx.strokeStyle = col; ctx.stroke();
      };
      pass(false, colMinor);
      pass(true, colMajor);
      root.classList.add('pg-live');
    };

    const tick = () => {
      raf = 0;
      // cursor eases to target; amplitude is a damped spring toward 0 or 1 (slight overshoot = spring back)
      s.x += (s.tx - s.x) * 0.35; s.y += (s.ty - s.y) * 0.35;
      s.va += (s.target - s.a) * 0.12; s.va *= 0.78; s.a += s.va;
      if (s.a < 0) s.a = 0;
      const moving = Math.abs(s.tx - s.x) > 0.3 || Math.abs(s.ty - s.y) > 0.3 ||
        Math.abs(s.target - s.a) > 0.002 || Math.abs(s.va) > 0.002;
      if (!moving && s.target === 0) { s.a = 0; s.va = 0; }
      draw();
      if (moving && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick); };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    const resize = () => {
      const r = parent.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      draw();
    };

    const onMove = (e) => {
      if (!onScreen || !animated()) return;
      const r = parent.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const inside = x >= -radius && x <= r.width + radius && y >= -radius && y <= r.height + radius;
      if (inside) {
        if (s.target === 0 && s.a < 0.001) { s.x = x; s.y = y; } // appear at the cursor, no sweep
        s.tx = x; s.ty = y; s.target = 1;
      } else s.target = 0;
      kick();
    };
    const onLeave = () => { s.target = 0; kick(); };

    readColours(); resize();
    const ro = new ResizeObserver(resize); ro.observe(parent);
    const io = new IntersectionObserver((es) => {
      onScreen = es[es.length - 1].isIntersecting;
      if (onScreen) { draw(); kick(); } else stop();
    });
    io.observe(parent);
    const mo = new MutationObserver(() => { readColours(); draw(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const onVis = () => { if (document.hidden) stop(); else kick(); };
    const onMq = () => { if (!animated()) { s.target = 0; s.a = 0; s.va = 0; draw(); } };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    mqReduce.addEventListener('change', onMq); mqTouch.addEventListener('change', onMq);

    return () => {
      stop();
      ro.disconnect(); io.disconnect(); mo.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      mqReduce.removeEventListener('change', onMq); mqTouch.removeEventListener('change', onMq);
      canvas.remove(); root.classList.remove('pg-live');
    };
  }, [strength, radius]);

  return <div ref={rootRef} className="pg-root" aria-hidden="true" />;
}
