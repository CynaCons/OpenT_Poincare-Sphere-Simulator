import { Box, Divider, Typography } from "@mui/material";
import InputStateSelector from "./InputStateSelector";
import RetardanceSlider from "./RetardanceSlider";
import StokesDisplay from "./StokesDisplay";
import PolarizationEllipse from "./PolarizationEllipse";
import JacobianPanel from "./JacobianPanel";
import type { StokesVector, SimulationResult } from "../types";

const PLATE_COLORS = ["#81c784", "#ffb74d", "#e57373", "#ba68c8"];
const PLATE_LABELS = ["Plate 1 (0°)", "Plate 2 (+45°)", "Plate 3 (-45°)", "Plate 4 (0°)"];

interface ControlPanelProps {
  mode: "manual" | "jacobian";
  inputPreset: string;
  inputStokes: StokesVector;
  customStokes: StokesVector;
  retardances: [number, number, number, number];
  simulation: SimulationResult;
  onPresetChange: (preset: string) => void;
  onCustomStokesChange: (stokes: StokesVector) => void;
  onRetardanceChange: (index: number, value: number) => void;
  onRetardancesUpdate: (retardances: [number, number, number, number]) => void;
}

export default function ControlPanel({
  mode,
  inputPreset,
  inputStokes,
  customStokes,
  retardances,
  simulation,
  onPresetChange,
  onCustomStokesChange,
  onRetardanceChange,
  onRetardancesUpdate,
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

      {mode === "manual" ? (
        <>
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
        </>
      ) : (
        <JacobianPanel
          inputStokes={inputStokes}
          onRetardancesUpdate={onRetardancesUpdate}
        />
      )}

      <Divider />

      <StokesDisplay states={simulation.states} />

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Polarization Ellipse
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
          <PolarizationEllipse
            stokes={simulation.states[0]}
            label="Input"
            color="#4fc3f7"
            size={130}
          />
          <PolarizationEllipse
            stokes={simulation.states[simulation.states.length - 1]}
            label="Output"
            color="#ba68c8"
            size={130}
          />
        </Box>
      </Box>
    </Box>
  );
}
