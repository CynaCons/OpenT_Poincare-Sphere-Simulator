import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import type { StokesVector } from "../types";

interface PolarizationEllipseProps {
  stokes: StokesVector;
  label: string;
  color: string;
  size?: number;
}

/**
 * Renders a 2D polarization ellipse from a Stokes vector.
 *
 * From the Stokes parameters:
 *   orientation angle: psi = 0.5 * atan2(S2, S1)
 *   ellipticity angle: chi = 0.5 * asin(S3 / S0)
 *   semi-major axis a, semi-minor axis b where tan(chi) = ±b/a
 *
 * The ellipse is drawn parametrically in the (Ex, Ey) plane.
 */
export default function PolarizationEllipse({ stokes, label, color, size = 120 }: PolarizationEllipseProps) {
  const pathData = useMemo(() => {
    const s1 = stokes[1];
    const s2 = stokes[2];
    const s3 = stokes[3];
    const norm = Math.sqrt(s1 * s1 + s2 * s2 + s3 * s3);
    if (norm < 1e-10) return "";

    // Orientation angle of the ellipse (angle of major axis from horizontal)
    const psi = 0.5 * Math.atan2(s2, s1);
    // Ellipticity angle: tan(chi) = b/a, sign gives handedness
    const chi = 0.5 * Math.asin(Math.max(-1, Math.min(1, s3 / norm)));

    const a = Math.cos(chi); // semi-major
    const b = Math.sin(chi); // semi-minor (signed: + = RHC, - = LHC)

    const margin = 10;
    const scale = (size / 2 - margin) * 0.85;

    // Generate ellipse points parametrically, then rotate by psi
    const points: string[] = [];
    const steps = 72;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      // Ellipse in its own frame
      const ex = a * Math.cos(t);
      const ey = b * Math.sin(t);
      // Rotate by psi
      const x = ex * Math.cos(psi) - ey * Math.sin(psi);
      const y = ex * Math.sin(psi) + ey * Math.cos(psi);
      // SVG coordinates (y-inverted)
      const sx = size / 2 + x * scale;
      const sy = size / 2 - y * scale;
      points.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
    }

    return points.join(" ");
  }, [stokes, size]);

  // Arrow showing handedness (rotation direction)
  const arrowData = useMemo(() => {
    const s1 = stokes[1];
    const s2 = stokes[2];
    const s3 = stokes[3];
    const norm = Math.sqrt(s1 * s1 + s2 * s2 + s3 * s3);
    if (norm < 1e-10) return null;

    const psi = 0.5 * Math.atan2(s2, s1);
    const chi = 0.5 * Math.asin(Math.max(-1, Math.min(1, s3 / norm)));
    const a = Math.cos(chi);
    const b = Math.sin(chi);

    const margin = 10;
    const scale = (size / 2 - margin) * 0.85;

    // Place arrow at t = pi/4
    const t = Math.PI / 4;
    const ex = a * Math.cos(t);
    const ey = b * Math.sin(t);
    const x = ex * Math.cos(psi) - ey * Math.sin(psi);
    const y = ex * Math.sin(psi) + ey * Math.cos(psi);

    // Tangent direction
    const dex = -a * Math.sin(t);
    const dey = b * Math.cos(t);
    const dx = dex * Math.cos(psi) - dey * Math.sin(psi);
    const dy = dex * Math.sin(psi) + dey * Math.cos(psi);
    const dLen = Math.sqrt(dx * dx + dy * dy);
    if (dLen < 1e-10) return null;

    const arrowLen = 8;
    const tipX = size / 2 + x * scale;
    const tipY = size / 2 - y * scale;
    const ndx = (dx / dLen);
    const ndy = (-dy / dLen); // y-inverted for SVG

    // Arrow head
    const perpX = -ndy;
    const perpY = ndx;
    const baseX = tipX - ndx * arrowLen;
    const baseY = tipY - ndy * arrowLen;

    return `M${tipX.toFixed(1)},${tipY.toFixed(1)} L${(baseX + perpX * 3).toFixed(1)},${(baseY + perpY * 3).toFixed(1)} M${tipX.toFixed(1)},${tipY.toFixed(1)} L${(baseX - perpX * 3).toFixed(1)},${(baseY - perpY * 3).toFixed(1)}`;
  }, [stokes, size]);

  const half = size / 2;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background */}
        <rect width={size} height={size} fill="#1a1a1a" rx={4} />

        {/* Axis cross */}
        <line x1={10} y1={half} x2={size - 10} y2={half} stroke="#333" strokeWidth={0.5} />
        <line x1={half} y1={10} x2={half} y2={size - 10} stroke="#333" strokeWidth={0.5} />

        {/* Axis labels */}
        <text x={size - 8} y={half - 4} fill="#555" fontSize={9} textAnchor="end">Ex</text>
        <text x={half + 5} y={14} fill="#555" fontSize={9}>Ey</text>

        {/* Ellipse */}
        {pathData && (
          <path d={pathData} fill="none" stroke={color} strokeWidth={2} />
        )}

        {/* Rotation arrow */}
        {arrowData && (
          <path d={arrowData} fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} />
        )}
      </svg>
      <Typography variant="caption" sx={{ color, fontSize: 10, fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}
