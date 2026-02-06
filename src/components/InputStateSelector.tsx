import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Typography } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { PRESETS } from "../math/stokes";
import type { StokesVector } from "../types";

interface InputStateSelectorProps {
  preset: string;
  customStokes: StokesVector;
  onPresetChange: (preset: string) => void;
  onCustomStokesChange: (stokes: StokesVector) => void;
}

export default function InputStateSelector({
  preset,
  customStokes,
  onPresetChange,
  onCustomStokesChange,
}: InputStateSelectorProps) {
  const handlePresetChange = (e: SelectChangeEvent) => {
    onPresetChange(e.target.value);
  };

  const handleCustomChange = (index: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const next: StokesVector = [...customStokes];
    next[index] = num;
    onCustomStokesChange(next);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Input Polarization
      </Typography>
      <FormControl size="small" fullWidth>
        <InputLabel>Preset</InputLabel>
        <Select value={preset} label="Preset" onChange={handlePresetChange}>
          {PRESETS.map((p) => (
            <MenuItem key={p.label} value={p.label}>
              {p.label}
            </MenuItem>
          ))}
          <MenuItem value="Custom">Custom</MenuItem>
        </Select>
      </FormControl>

      {preset === "Custom" && (
        <Box sx={{ display: "flex", gap: 1 }}>
          {(["S1", "S2", "S3"] as const).map((label, i) => (
            <TextField
              key={label}
              label={label}
              size="small"
              type="number"
              inputProps={{ step: 0.1, min: -1, max: 1 }}
              value={customStokes[i + 1]}
              onChange={(e) => handleCustomChange(i + 1, e.target.value)}
              sx={{ flex: 1 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
