import { useEffect, useRef } from "react";
import type { GraphSpec } from "../lib/types";

interface Props {
  spec: GraphSpec;
  width?: number;
  height?: number;
}

const PALETTE = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed"];

function makeEvaluator(expr: string): (x: number) => number {
  try {
    const sanitized = expr
      .replace(/\^/g, "**")
      .replace(/(\d)\s*x/g, "$1*x")
      .replace(/x\s*(\d)/g, "x*$1");
    // new Function scope only exposes x and Math; "use strict" prevents global access
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function("x", "Math", `"use strict"; return +(${sanitized});`);
    return (x: number) => {
      try {
        const y = fn(x, Math) as number;
        return Number.isFinite(y) ? y : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

function niceStep(range: number, targetTicks: number): number {
  const rough = range / targetTicks;
  const exp = Math.floor(Math.log10(rough));
  const base = Math.pow(10, exp);
  for (const mult of [1, 2, 5, 10]) {
    if (base * mult >= rough) return base * mult;
  }
  return base * 10;
}

export default function FunctionGraph({ spec, width = 480, height = 300 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio ?? 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 20, bottom: 36, left: 44 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    const evaluators = spec.functions.map((f) => makeEvaluator(f.expression));
    const N = 600;
    const xs: number[] = Array.from({ length: N + 1 }, (_, i) => spec.xMin + (i / N) * (spec.xMax - spec.xMin));

    const ys = evaluators.flatMap((ev) => xs.map(ev)).filter(Number.isFinite);
    const rawYMin = ys.length ? Math.min(...ys) : -5;
    const rawYMax = ys.length ? Math.max(...ys) : 5;
    const yPad = Math.max((rawYMax - rawYMin) * 0.1, 0.5);
    const yMin = rawYMin - yPad;
    const yMax = rawYMax + yPad;

    const toX = (x: number) => pad.left + ((x - spec.xMin) / (spec.xMax - spec.xMin)) * plotW;
    const toY = (y: number) => pad.top + ((yMax - y) / (yMax - yMin)) * plotH;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Grid
    const xStep = niceStep(spec.xMax - spec.xMin, 8);
    const yStep = niceStep(yMax - yMin, 6);

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let x = Math.ceil(spec.xMin / xStep) * xStep; x <= spec.xMax + 1e-9; x += xStep) {
      ctx.beginPath(); ctx.moveTo(toX(x), pad.top); ctx.lineTo(toX(x), pad.top + plotH); ctx.stroke();
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) {
      ctx.beginPath(); ctx.moveTo(pad.left, toY(y)); ctx.lineTo(pad.left + plotW, toY(y)); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1.5;
    if (yMin <= 0 && 0 <= yMax) {
      ctx.beginPath(); ctx.moveTo(pad.left, toY(0)); ctx.lineTo(pad.left + plotW, toY(0)); ctx.stroke();
    }
    if (spec.xMin <= 0 && 0 <= spec.xMax) {
      ctx.beginPath(); ctx.moveTo(toX(0), pad.top); ctx.lineTo(toX(0), pad.top + plotH); ctx.stroke();
    }

    // Axis tick labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px system-ui, sans-serif";

    ctx.textAlign = "center";
    for (let x = Math.ceil(spec.xMin / xStep) * xStep; x <= spec.xMax + 1e-9; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue;
      ctx.fillText(Number(x.toPrecision(4)).toString(), toX(x), pad.top + plotH + 18);
    }

    ctx.textAlign = "right";
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue;
      ctx.fillText(Number(y.toPrecision(4)).toString(), pad.left - 5, toY(y) + 4);
    }

    // Curves
    evaluators.forEach((ev, fi) => {
      const color = spec.functions[fi].color ?? PALETTE[fi % PALETTE.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      let penDown = false;
      let prevY = NaN;
      for (let i = 0; i <= N; i++) {
        const x = xs[i];
        const y = ev(x);
        if (!Number.isFinite(y)) { penDown = false; prevY = NaN; continue; }
        // Break path on near-vertical asymptotes
        if (penDown && Math.abs(y - prevY) > (yMax - yMin) * 2) { penDown = false; }
        if (!penDown) { ctx.moveTo(toX(x), toY(y)); penDown = true; }
        else ctx.lineTo(toX(x), toY(y));
        prevY = y;
      }
      ctx.stroke();

      // Label near right end of curve
      const lbl = spec.functions[fi].label;
      if (lbl) {
        for (let i = N; i >= N * 0.85; i--) {
          const y = ev(xs[i]);
          if (Number.isFinite(y) && y >= yMin && y <= yMax) {
            ctx.fillStyle = color;
            ctx.font = "bold 13px system-ui, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(lbl, toX(xs[i]) + 4, toY(y) - 4);
            break;
          }
        }
      }
    });
  }, [spec, width, height]);

  return (
    <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
      <canvas
        ref={canvasRef}
        style={{ width, height, maxWidth: "100%", border: "1px solid #e5e7eb", borderRadius: "6px" }}
      />
      {spec.caption && (
        <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0.25rem 0 0" }}>
          {spec.caption}
        </p>
      )}
    </div>
  );
}
