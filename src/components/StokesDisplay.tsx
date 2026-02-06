import { Box, Typography } from "@mui/material";
import type { StokesVector } from "../types";

const STATE_COLORS = ["#4fc3f7", "#81c784", "#ffb74d", "#e57373", "#ba68c8"];
const STATE_LABELS = ["Input", "After P1", "After P2", "After P3", "Output"];

interface StokesDisplayProps {
  states: StokesVector[];
}

function fmtS(v: number): string {
  const s = v.toFixed(3);
  return v >= 0 ? ` ${s}` : s;
}

export default function StokesDisplay({ states }: StokesDisplayProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}
      >
        Stokes Vectors
      </Typography>

      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "70px repeat(4, 1fr)",
          gap: 0.5,
          fontSize: 10,
          color: "text.secondary",
          borderBottom: "1px solid #333",
          pb: 0.5,
        }}
      >
        <span></span>
        <span>S0</span>
        <span>S1</span>
        <span>S2</span>
        <span>S3</span>
      </Box>

      {/* Rows */}
      {states.map((s, i) => (
        <Box
          key={i}
          sx={{
            display: "grid",
            gridTemplateColumns: "70px repeat(4, 1fr)",
            gap: 0.5,
            fontSize: 11,
            fontFamily: '"JetBrains Mono", monospace',
            py: 0.25,
            borderBottom: i < states.length - 1 ? "1px solid #2a2a2a" : "none",
          }}
        >
          <Typography variant="caption" sx={{ color: STATE_COLORS[i], fontWeight: 600, fontSize: 10 }}>
            {STATE_LABELS[i]}
          </Typography>
          {s.map((val, j) => (
            <span key={j} style={{ color: "#d4d4d4" }}>{fmtS(val)}</span>
          ))}
        </Box>
      ))}
    </Box>
  );
}
