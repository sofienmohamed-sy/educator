import type { FigureSpec } from "../lib/types";

interface Props {
  spec: FigureSpec;
}

export default function GeometryFigure({ spec }: Props) {
  const W = spec.width ?? 280;
  const H = spec.height ?? 190;

  const pts: Record<string, { x: number; y: number; dx?: number; dy?: number }> = {};
  spec.points.forEach((p) => {
    pts[p.id] = { x: p.x * W, y: p.y * H, dx: p.dx, dy: p.dy };
  });

  // Centroid used to push segment labels outward from the figure's interior
  const cx = spec.points.reduce((s, p) => s + p.x * W, 0) / spec.points.length;
  const cy = spec.points.reduce((s, p) => s + p.y * H, 0) / spec.points.length;

  return (
    <figure style={{ textAlign: "center", margin: "0.75rem auto" }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          background: "#fafafa",
          border: "1px solid #e5e7eb",
          borderRadius: 4,
          maxWidth: "100%",
          display: "block",
          margin: "0 auto",
        }}
      >
        {/* Segments */}
        {spec.segments.map((seg, i) => {
          const p1 = pts[seg.p1];
          const p2 = pts[seg.p2];
          if (!p1 || !p2) return null;

          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;

          // Push label away from centroid so it lands outside the shape
          const ox = mx - cx;
          const oy = my - cy;
          const olen = Math.sqrt(ox * ox + oy * oy) || 1;
          const lx = mx + (ox / olen) * 16;
          const ly = my + (oy / olen) * 14;

          return (
            <g key={i}>
              <line
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={seg.color ?? "#1f2937"}
                strokeWidth={1.5}
                strokeDasharray={seg.dashed ? "5,3" : undefined}
                strokeLinecap="round"
              />
              {seg.label && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="#374151"
                  fontFamily="serif"
                >
                  {seg.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Points */}
        {spec.points.map((p, i) => {
          const px = p.x * W;
          const py = p.y * H;

          // Auto label offset: push label away from centroid
          const ox = px - cx;
          const oy = py - cy;
          const olen = Math.sqrt(ox * ox + oy * oy) || 1;
          const defaultDx = (ox / olen) * 16;
          const defaultDy = (oy / olen) * 14;

          const dx = p.dx ?? defaultDx;
          const dy = p.dy ?? defaultDy;

          return (
            <g key={i}>
              <circle cx={px} cy={py} r={2.5} fill="#1f2937" />
              <text
                x={px + dx}
                y={py + dy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={13}
                fontStyle="italic"
                fontFamily="serif"
                fill="#1f2937"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
      {spec.caption && (
        <figcaption
          style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontStyle: "italic" }}
        >
          {spec.caption}
        </figcaption>
      )}
    </figure>
  );
}
