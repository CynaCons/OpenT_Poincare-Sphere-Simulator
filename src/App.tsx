import { useState, useMemo, useCallback } from "react";
import { Box, ThemeProvider, CssBaseline, ToggleButtonGroup, ToggleButton } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import theme from "./theme";
import TitleBar from "./components/TitleBar";
import StatusBar from "./components/StatusBar";
import PoincareSphere from "./components/PoincareSphere";
import ControlPanel from "./components/ControlPanel";
import { PRESETS, normalizeStokes } from "./math/stokes";
import { createPlates, simulatePlateChain } from "./math/simulation";
import type { StokesVector } from "./types";
import "./App.css";

type AppMode = "manual" | "jacobian";

export default function App() {
  const [mode, setMode] = useState<AppMode>("manual");
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

  const handleRetardancesUpdate = useCallback((r: [number, number, number, number]) => {
    setRetardances(r);
  }, []);

  const handleModeChange = useCallback((_: React.MouseEvent<HTMLElement>, newMode: AppMode | null) => {
    if (newMode !== null) {
      setMode(newMode);
      if (newMode === "manual") {
        setRetardances([0, 0, 0, 0]);
      }
    }
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
            {/* Mode toggle overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 10,
              }}
            >
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleModeChange}
                size="small"
                sx={{
                  bgcolor: "rgba(30,30,30,0.9)",
                  border: "1px solid #444",
                  "& .MuiToggleButton-root": {
                    color: "#999",
                    fontSize: 11,
                    py: 0.3,
                    px: 1.5,
                    "&.Mui-selected": {
                      color: "#fff",
                      bgcolor: "rgba(55,148,255,0.2)",
                    },
                  },
                }}
              >
                <ToggleButton value="manual">
                  <TuneIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Manual
                </ToggleButton>
                <ToggleButton value="jacobian">
                  <AutoFixHighIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Jacobian
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Control Panel */}
          <ControlPanel
            mode={mode}
            inputPreset={inputPreset}
            inputStokes={inputStokes}
            customStokes={customStokes}
            retardances={retardances}
            simulation={simulation}
            onPresetChange={handlePresetChange}
            onCustomStokesChange={handleCustomStokesChange}
            onRetardanceChange={handleRetardanceChange}
            onRetardancesUpdate={handleRetardancesUpdate}
          />
        </Box>

        <StatusBar inputPreset={inputPreset} outputStokes={outputStokes} />
      </Box>
    </ThemeProvider>
  );
}
