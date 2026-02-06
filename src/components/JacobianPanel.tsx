import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Slider,
  Select,
  MenuItem,
  Divider,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { StokesVector } from "../types";
import {
  TARGETS,
  jacobianStep,
  randomRetardances,
  computeOutput,
  stokesError,
} from "../math/jacobian";

interface JacobianPanelProps {
  inputStokes: StokesVector;
  onRetardancesUpdate: (retardances: [number, number, number, number]) => void;
}

interface HistoryEntry {
  step: number;
  error: number;
}

export default function JacobianPanel({
  inputStokes,
  onRetardancesUpdate,
}: JacobianPanelProps) {
  const [target, setTarget] = useState<"RHC" | "LHC">("RHC");
  const [mu, setMu] = useState(0.5);
  const [running, setRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [currentError, setCurrentError] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [converged, setConverged] = useState(false);

  const retardancesRef = useRef<[number, number, number, number]>([0, 0, 0, 0]);
  const runningRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetStokes = TARGETS[target];

  const handleReset = useCallback(() => {
    setRunning(false);
    runningRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const r = randomRetardances();
    retardancesRef.current = r;
    onRetardancesUpdate(r);

    const output = computeOutput(inputStokes, r);
    const err = stokesError(output, targetStokes);
    setCurrentError(err);
    setStepCount(0);
    setHistory([{ step: 0, error: err }]);
    setConverged(false);
  }, [inputStokes, targetStokes, onRetardancesUpdate]);

  const doStep = useCallback(() => {
    const result = jacobianStep(
      inputStokes,
      retardancesRef.current,
      targetStokes,
      mu
    );

    retardancesRef.current = result.retardances;
    onRetardancesUpdate(result.retardances);
    setCurrentError(result.error);
    setStepCount((prev) => {
      const next = prev + 1;
      setHistory((h) => {
        const newH = [...h, { step: next, error: result.error }];
        return newH.length > 200 ? newH.slice(-200) : newH;
      });
      return next;
    });

    if (result.error < 0.01) {
      setConverged(true);
      setRunning(false);
      runningRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [inputStokes, targetStokes, mu, onRetardancesUpdate]);

  const handleStartStop = useCallback(() => {
    if (running) {
      setRunning(false);
      runningRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // If not initialized, do a reset first
      if (stepCount === 0 && history.length === 0) {
        handleReset();
      }
      setRunning(true);
      runningRef.current = true;
    }
  }, [running, stepCount, history.length, handleReset]);

  // Run the iteration loop
  useEffect(() => {
    if (running && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        if (runningRef.current) {
          doStep();
        }
      }, 80); // ~12.5 steps per second for visible animation
    }
    return () => {
      if (intervalRef.current && !running) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, doStep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleTargetChange = (e: SelectChangeEvent) => {
    setTarget(e.target.value as "RHC" | "LHC");
    handleReset();
  };

  // Mini error chart
  const chartHeight = 60;
  const chartWidth = 280;
  const maxError = 2;

  const chartPath = history.length > 1
    ? history
        .map((h, i) => {
          const x = (i / (history.length - 1)) * chartWidth;
          const y = chartHeight - (Math.min(h.error, maxError) / maxError) * chartHeight;
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ")
    : "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        Jacobian Convergence
      </Typography>

      <FormControl size="small" fullWidth>
        <InputLabel>Target</InputLabel>
        <Select value={target} label="Target" onChange={handleTargetChange} disabled={running}>
          <MenuItem value="RHC">Right Circular (RHC)</MenuItem>
          <MenuItem value="LHC">Left Circular (LHC)</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ px: 0.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11 }}>
            Step size (mu)
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11 }}>
            {mu.toFixed(2)}
          </Typography>
        </Box>
        <Slider
          value={mu}
          min={0.05}
          max={1.0}
          step={0.05}
          onChange={(_, v) => setMu(v as number)}
          disabled={running}
          sx={{ color: "#4fc3f7" }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={running ? <StopIcon /> : <PlayArrowIcon />}
          onClick={handleStartStop}
          sx={{
            flex: 1,
            bgcolor: running ? "#c62828" : "#2e7d32",
            "&:hover": { bgcolor: running ? "#b71c1c" : "#1b5e20" },
            fontSize: 11,
          }}
        >
          {running ? "Stop" : "Start"}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          disabled={running}
          sx={{ fontSize: 11 }}
        >
          Reset
        </Button>
      </Box>

      <Divider />

      {/* Status */}
      <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Step: <span style={{ color: "#e7e7e7" }}>{stepCount}</span>
        </Typography>
        <Typography variant="caption" sx={{ color: converged ? "#81c784" : "#e57373" }}>
          Error: {currentError.toFixed(4)}
        </Typography>
      </Box>

      {converged && (
        <Typography
          variant="caption"
          sx={{ color: "#81c784", fontWeight: 600, textAlign: "center", fontSize: 11 }}
        >
          Converged to {target}
        </Typography>
      )}

      {/* Error chart */}
      {history.length > 1 && (
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 10 }}>
            Error vs. Iteration
          </Typography>
          <svg
            width={chartWidth}
            height={chartHeight + 4}
            viewBox={`0 -2 ${chartWidth} ${chartHeight + 4}`}
            style={{ display: "block" }}
          >
            <rect x={0} y={-2} width={chartWidth} height={chartHeight + 4} fill="#1a1a1a" rx={3} />
            {/* Threshold line */}
            <line
              x1={0}
              y1={chartHeight - (0.01 / maxError) * chartHeight}
              x2={chartWidth}
              y2={chartHeight - (0.01 / maxError) * chartHeight}
              stroke="#81c784"
              strokeWidth={0.5}
              strokeDasharray="4,2"
              opacity={0.4}
            />
            {/* Error curve */}
            <path d={chartPath} fill="none" stroke="#e57373" strokeWidth={1.5} />
          </svg>
        </Box>
      )}
    </Box>
  );
}
