import { useState, useMemo, useCallback } from "react";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import TitleBar from "./components/TitleBar";
import StatusBar from "./components/StatusBar";
import PoincareSphere from "./components/PoincareSphere";
import ControlPanel from "./components/ControlPanel";
import { PRESETS, normalizeStokes } from "./math/stokes";
import { createPlates, simulatePlateChain } from "./math/simulation";
import type { StokesVector } from "./types";
import "./App.css";

export default function App() {
  const [inputPreset, setInputPreset] = useState("Linear H (0°)");
  const [customStokes, setCustomStokes] = useState<StokesVector>([1, 1, 0, 0]);
  const [retardances, setRetardances] = useState<[number, number, number, number]>([0, 0, 0, 0]);

  const inputStokes = useMemo<StokesVector>(() => {
    if (inputPreset === "Custom") {
      return normalizeStokes(customStokes);
    }
    const found = PRESETS.find((p) => p.label === inputPreset);
    return found ? found.stokes : PRESETS[0].stokes;
  }, [inputPreset, customStokes]);

  const plates = useMemo(() => createPlates(retardances), [retardances]);

  const simulation = useMemo(
    () => simulatePlateChain(inputStokes, plates),
    [inputStokes, plates]
  );

  const outputStokes = simulation.states[simulation.states.length - 1];

  const handleRetardanceChange = useCallback((index: number, value: number) => {
    setRetardances((prev) => {
      const next: [number, number, number, number] = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handlePresetChange = useCallback((preset: string) => {
    setInputPreset(preset);
  }, []);

  const handleCustomStokesChange = useCallback((stokes: StokesVector) => {
    setCustomStokes(stokes);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#1e1e1e" }}>
        <TitleBar />

        <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* 3D Viewport */}
          <Box sx={{ flex: 1, position: "relative" }}>
            <PoincareSphere simulation={simulation} />
          </Box>

          {/* Control Panel */}
          <ControlPanel
            inputPreset={inputPreset}
            customStokes={customStokes}
            retardances={retardances}
            simulation={simulation}
            onPresetChange={handlePresetChange}
            onCustomStokesChange={handleCustomStokesChange}
            onRetardanceChange={handleRetardanceChange}
          />
        </Box>

        <StatusBar inputPreset={inputPreset} outputStokes={outputStokes} />
      </Box>
    </ThemeProvider>
  );
}
