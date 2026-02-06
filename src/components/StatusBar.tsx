import { Box, Stack } from "@mui/material";
import BlurCircularIcon from "@mui/icons-material/BlurCircular";
import type { StokesVector } from "../types";

interface StatusBarProps {
  inputPreset: string;
  outputStokes: StokesVector;
}

function fmtS(v: number): string {
  return v.toFixed(3);
}

export default function StatusBar({ inputPreset, outputStokes }: StatusBarProps) {
  return (
    <Box
      sx={{
        height: 22,
        bgcolor: "#007acc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1.5,
        color: "#fff",
        fontSize: "11px",
        userSelect: "none",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <BlurCircularIcon sx={{ fontSize: 12 }} />
          <span>Input: {inputPreset}</span>
        </Box>
      </Stack>
      <Stack direction="row" spacing={3} alignItems="center">
        <span>
          Output: [{fmtS(outputStokes[0])}, {fmtS(outputStokes[1])}, {fmtS(outputStokes[2])}, {fmtS(outputStokes[3])}]
        </span>
        <span>v0.1.0</span>
      </Stack>
    </Box>
  );
}
