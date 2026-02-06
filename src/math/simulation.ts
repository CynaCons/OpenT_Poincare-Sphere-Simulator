import type { StokesVector, PlateDef, SimulationResult } from "../types";
import { applyWavePlate } from "./mueller";
import { stokesToCartesian } from "./stokes";

/** The 4 fixed plate orientations for the BATi Acrobat PCM */
export function createPlates(retardances: [number, number, number, number]): PlateDef[] {
  return [
    { theta: 0,              delta: retardances[0], label: "Plate 1 (0°)" },
    { theta: Math.PI / 4,    delta: retardances[1], label: "Plate 2 (+45°)" },
    { theta: -Math.PI / 4,   delta: retardances[2], label: "Plate 3 (-45°)" },
    { theta: 0,              delta: retardances[3], label: "Plate 4 (0°)" },
  ];
}

/** Simulate the 4-plate chain, returning 5 states and 4 arcs */
export function simulatePlateChain(
  input: StokesVector,
  plates: PlateDef[]
): SimulationResult {
  const states: StokesVector[] = [input];
  const arcs: [number, number, number][][] = [];

  let current = input;
  for (const plate of plates) {
    const next = applyWavePlate(current, plate.delta, plate.theta);
    states.push(next);
    arcs.push(computeArcPoints(current, plate.delta, plate.theta));
    current = next;
  }

  return { states, arcs };
}

/**
 * Compute interpolated arc points on the Poincare sphere between two states.
 * The arc follows the rotation induced by a wave plate at the given orientation.
 */
export function computeArcPoints(
  from: StokesVector,
  delta: number,
  theta: number,
  numPoints: number = 48
): [number, number, number][] {
  if (Math.abs(delta) < 1e-10) {
    // No rotation, just return the start point
    return [stokesToCartesian(from)];
  }

  const points: [number, number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const partialDelta = delta * t;
    const intermediate = applyWavePlate(from, partialDelta, theta);
    points.push(stokesToCartesian(intermediate));
  }

  return points;
}
