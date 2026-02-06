import { Box, Slider, Typography } from "@mui/material";

interface RetardanceSliderProps {
  index: number;
  label: string;
  value: number;
  color: string;
  onChange: (index: number, value: number) => void;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export default function RetardanceSlider({
  index,
  label,
  value,
  color,
  onChange,
}: RetardanceSliderProps) {
  return (
    <Box sx={{ px: 0.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography variant="caption" sx={{ color, fontWeight: 600, fontSize: 11 }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11 }}>
          {radToDeg(value).toFixed(1)}°
        </Typography>
      </Box>
      <Slider
        value={value}
        min={0}
        max={Math.PI}
        step={0.01}
        onChange={(_, v) => onChange(index, v as number)}
        sx={{
          color,
          "& .MuiSlider-thumb": {
            "&:hover, &.Mui-focusVisible": {
              boxShadow: `0 0 0 8px ${color}33`,
            },
          },
        }}
      />
    </Box>
  );
}
