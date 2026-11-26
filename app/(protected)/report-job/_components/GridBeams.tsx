// Lucian UX/UI Prompt #226 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#226
"use client";

import { useEffect, useRef } from "react";

// 제목 뒤 배경: 옅은 격자 위로 빛줄기가 격자선을 따라 흐르고, 커서 주변 격자만 밝아진다.
// 배경색 없이 격자만 깔고(색은 분석 버튼의 #1D5466 · #2BB3A3), 빛줄기는 핫핑크를 섞는다. 전부 canvas 에 그린다.
// 모션 줄이기를 켜면 격자만 보여준다.

const CELL = 34;
const SPOT = 130; // 커서 주변이 밝아지는 반지름
// 분석 버튼에 쓰는 색
const DEEP = "29,84,102"; // #1D5466
const MINT = "43,179,163"; // #2BB3A3
const LINE = `rgba(${DEEP},.1)`;
const SPOT_LINE = MINT;
const BEAM_COLORS = [DEEP, MINT, "244,114,182"];
const MAX_BEAMS = 14;
const SPAWN_EVERY = 0.28; // 초

interface Beam {
  vertical: boolean;
  line: number; // 따라가는 격자선 위치
  head: number;
  dir: 1 | -1;
  speed: number;
  length: number;
  color: string;
}

export default function GridBeams({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let beams: Beam[] = [];
    let cursor: { x: number; y: number } | null = null;
    let raf = 0;
    let last = 0;
    let waited = 0;
    let visible = true;

    const spawn = (): Beam => {
      const vertical = Math.random() < 0.5;
      const across = vertical ? width : height;
      const dir = Math.random() < 0.5 ? 1 : -1;
      return {
        vertical,
        line: (1 + Math.floor(Math.random() * Math.max(1, across / CELL - 1))) * CELL,
        head: dir > 0 ? -60 : (vertical ? height : width) + 60,
        dir,
        speed: 110 + Math.random() * 90,
        length: 60 + Math.random() * 60,
        color: BEAM_COLORS[Math.floor(Math.random() * BEAM_COLORS.length)],
      };
    };

    const grid = (style: string | CanvasGradient) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += CELL) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }
      for (let y = 0; y <= height; y += CELL) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      grid(LINE);

      if (cursor) {
        const spot = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, SPOT);
        spot.addColorStop(0, `rgba(${SPOT_LINE},.85)`);
        spot.addColorStop(1, `rgba(${SPOT_LINE},0)`);
        grid(spot);
      }

      for (const b of beams) {
        const tail = b.head - b.dir * b.length;
        const x0 = b.vertical ? b.line : tail;
        const y0 = b.vertical ? tail : b.line;
        const x1 = b.vertical ? b.line : b.head;
        const y1 = b.vertical ? b.head : b.line;
        const trail = ctx.createLinearGradient(x0, y0, x1, y1);
        trail.addColorStop(0, `rgba(${b.color},0)`);
        trail.addColorStop(1, `rgba(${b.color},.95)`);
        ctx.strokeStyle = trail;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0 + 0.5, y0 + 0.5);
        ctx.lineTo(x1 + 0.5, y1 + 0.5);
        ctx.stroke();

        ctx.fillStyle = `rgb(${b.color})`;
        ctx.shadowColor = `rgb(${b.color})`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x1 + 0.5, y1 + 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      waited += dt;
      if (waited > SPAWN_EVERY && beams.length < MAX_BEAMS) {
        waited = 0;
        beams.push(spawn());
      }
      for (const b of beams) b.head += b.dir * b.speed * dt;
      beams = beams.filter((b) => {
        const end = (b.vertical ? height : width) + b.length + 70;
        return b.dir > 0 ? b.head < end : b.head > -b.length - 70;
      });
      draw();
      raf = requestAnimationFrame(frame);
    };

    const run = () => {
      if (raf || !visible || reduce) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };

    // 배경이 아래 요소의 클릭을 막지 않도록, 커서 위치는 창 전체에서 받는다
    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) * width) / r.width;
      const y = ((e.clientY - r.top) * height) / r.height;
      cursor = x >= 0 && x <= width && y >= 0 && y <= height ? { x, y } : null;
      if (reduce) draw();
    };
    const onPointerLeave = () => {
      cursor = null;
      if (reduce) draw();
    };

    resize();
    if (!reduce) {
      // 처음부터 빛줄기 몇 개가 보이게 둔다
      beams = Array.from({ length: 5 }, (_, i) => {
        const b = spawn();
        b.head = (b.vertical ? height : width) * (0.15 + i * 0.17);
        return b;
      });
    }
    draw();
    run();

    const sizes = new ResizeObserver(resize);
    sizes.observe(canvas);
    const views = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    views.observe(canvas);
    window.addEventListener("pointermove", onPointerMove);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      sizes.disconnect();
      views.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none [mask-image:radial-gradient(closest-side,#000_45%,transparent)] ${className}`}
    />
  );
}
