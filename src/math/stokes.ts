import type { StokesVector, PolarizationPreset } from "../types";

/** Preset polarization states */
export const PRESETS: PolarizationPreset[] = [
  { label: "Linear H (0°)",    stokes: [1,  1,  0,  0] },
  { label: "Linear V (90°)",   stokes: [1, -1,  0,  0] },
  { label: "Linear +45°",      stokes: [1,  0,  1,  0] },
  { label: "Linear -45°",      stokes: [1,  0, -1,  0] },
  { label: "Right Circular",   stokes: [1,  0,  0,  1] },
  { label: "Left Circular",    stokes: [1,  0,  0, -1] },
];

/** Convert Stokes [S0,S1,S2,S3] to Cartesian [x,y,z] on unit Poincare sphere */
export function stokesToCartesian(s: StokesVector): [number, number, number] {
  const norm = Math.sqrt(s[1] * s[1] + s[2] * s[2] + s[3] * s[3]);
  if (norm < 1e-12) return [0, 0, 0];
  return [s[1] / norm, s[2] / norm, s[3] / norm];
}

/** Normalize a Stokes vector to lie on the unit Poincare sphere (S0=1) */
export function normalizeStokes(s: StokesVector): StokesVector {
  const norm = Math.sqrt(s[1] * s[1] + s[2] * s[2] + s[3] * s[3]);
  if (norm < 1e-12) return [1, 0, 0, 0];
  return [1, s[1] / norm, s[2] / norm, s[3] / norm];
}
