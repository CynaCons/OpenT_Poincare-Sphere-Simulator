import { Box, Divider, Typography } from "@mui/material";
import InputStateSelector from "./InputStateSelector";
import RetardanceSlider from "./RetardanceSlider";
import StokesDisplay from "./StokesDisplay";
import type { StokesVector, SimulationResult } from "../types";

const PLATE_COLORS = ["#81c784", "#ffb74d", "#e57373", "#ba68c8"];
const PLATE_LABELS = ["Plate 1 (0°)", "Plate 2 (+45°)", "Plate 3 (-45°)", "Plate 4 (0°)"];

interface ControlPanelProps {
  inputPreset: string;
  customStokes: StokesVector;
  retardances: [number, number, number, number];
  simulation: SimulationResult;
  onPresetChange: (preset: string) => void;
  onCustomStokesChange: (stokes: StokesVector) => void;
  onRetardanceChange: (index: number, value: number) => void;
}

export default function ControlPanel({
  inputPreset,
  customStokes,
  retardances,
  simulation,
  onPresetChange,
  onCustomStokesChange,
  onRetardanceChange,
}: ControlPanelProps) {
  return (
    <Box
      sx={{
        width: 340,
        bgcolor: "#252526",
        borderLeft: "1px solid #333333",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        p: 2,
        gap: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontSize: 13, color: "text.primary" }}>
        Polarization Controller
      </Typography>

      <InputStateSelector
        preset={inputPreset}
        customStokes={customStokes}
        onPresetChange={onPresetChange}
        onCustomStokesChange={onCustomStokesChange}
      />

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Retardance Plates
        </Typography>
        {retardances.map((val, i) => (
          <RetardanceSlider
            key={i}
            index={i}
            label={PLATE_LABELS[i]}
            value={val}
            color={PLATE_COLORS[i]}
            onChange={onRetardanceChange}
          />
        ))}
      </Box>

      <Divider />

      <StokesDisplay states={simulation.states} />
    </Box>
  );
}
