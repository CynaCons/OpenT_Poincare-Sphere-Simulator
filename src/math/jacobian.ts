import type { StokesVector } from "../types";
import { applyWavePlate } from "./mueller";

/** Fixed plate orientations for the BATi Acrobat PCM */
const PLATE_THETAS = [0, Math.PI / 4, -Math.PI / 4, 0];

/** Target states */
export const TARGETS = {
  RHC: [1, 0, 0, 1] as StokesVector,
  LHC: [1, 0, 0, -1] as StokesVector,
};

/** Compute output Stokes vector for given input and retardances */
export function computeOutput(
  input: StokesVector,
  retardances: [number, number, number, number]
): StokesVector {
  let state = input;
  for (let i = 0; i < 4; i++) {
    state = applyWavePlate(state, retardances[i], PLATE_THETAS[i]);
  }
  return state;
}

/**
 * Compute the 3x4 Jacobian matrix dS_out/d_retardances numerically.
 * Each column is the partial derivative of [S1, S2, S3]_out with respect
 * to retardance[i], estimated via central finite differences.
 */
export function computeJacobian(
  input: StokesVector,
  retardances: [number, number, number, number],
  epsilon: number = 1e-4
): number[][] {
  const J: number[][] = [[], [], []]; // 3 rows (S1, S2, S3), 4 columns (plates)

  for (let i = 0; i < 4; i++) {
    const rPlus: [number, number, number, number] = [...retardances];
    const rMinus: [number, number, number, number] = [...retardances];
    rPlus[i] += epsilon;
    rMinus[i] -= epsilon;

    const sPlus = computeOutput(input, rPlus);
    const sMinus = computeOutput(input, rMinus);

    for (let j = 0; j < 3; j++) {
      J[j].push((sPlus[j + 1] - sMinus[j + 1]) / (2 * epsilon));
    }
  }

  return J;
}

/**
 * Compute the pseudo-inverse of a 3x4 matrix using the formula:
 * J+ = J^T (J J^T)^{-1}
 * Returns a 4x3 matrix.
 */
function pseudoInverse3x4(J: number[][]): number[][] {
  // J is 3x4, J^T is 4x3, J*J^T is 3x3
  const JJt: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 4; k++) {
        JJt[i][j] += J[i][k] * J[j][k];
      }
    }
  }

  // Invert 3x3 matrix
  const inv = invert3x3(JJt);
  if (!inv) return [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]; // fallback

  // J+ = J^T * inv(J*J^T) -> 4x3
  const Jp: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const row: number[] = [];
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += J[k][i] * inv[k][j]; // J^T[i][k] = J[k][i]
      }
      row.push(sum);
    }
    Jp.push(row);
  }

  return Jp;
}

/** Invert a 3x3 matrix. Returns null if singular. */
function invert3x3(m: number[][]): number[][] | null {
  const [a, b, c] = [m[0][0], m[0][1], m[0][2]];
  const [d, e, f] = [m[1][0], m[1][1], m[1][2]];
  const [g, h, i] = [m[2][0], m[2][1], m[2][2]];

  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-12) return null;

  const invDet = 1 / det;
  return [
    [(e * i - f * h) * invDet, (c * h - b * i) * invDet, (b * f - c * e) * invDet],
    [(f * g - d * i) * invDet, (a * i - c * g) * invDet, (c * d - a * f) * invDet],
    [(d * h - e * g) * invDet, (b * g - a * h) * invDet, (a * e - b * d) * invDet],
  ];
}

/** Clamp retardances to [0, pi] */
function clampRetardances(r: [number, number, number, number]): [number, number, number, number] {
  return r.map((v) => Math.max(0, Math.min(Math.PI, v))) as [number, number, number, number];
}

/** Stokes error (Euclidean distance in S1,S2,S3 space) */
export function stokesError(current: StokesVector, target: StokesVector): number {
  const d1 = current[1] - target[1];
  const d2 = current[2] - target[2];
  const d3 = current[3] - target[3];
  return Math.sqrt(d1 * d1 + d2 * d2 + d3 * d3);
}

export interface JacobianStepResult {
  retardances: [number, number, number, number];
  output: StokesVector;
  error: number;
}

/**
 * Perform one iteration of the local Jacobian gradient-projection method.
 *
 * Update: delta_phi = mu * J+ * (S_target - S_current)
 *
 * where J+ is the Moore-Penrose pseudo-inverse of the 3x4 Jacobian.
 */
export function jacobianStep(
  input: StokesVector,
  currentRetardances: [number, number, number, number],
  target: StokesVector,
  mu: number = 0.5
): JacobianStepResult {
  const currentOutput = computeOutput(input, currentRetardances);

  // Error in Stokes space
  const dS = [
    target[1] - currentOutput[1],
    target[2] - currentOutput[2],
    target[3] - currentOutput[3],
  ];

  // Compute Jacobian and its pseudo-inverse
  const J = computeJacobian(input, currentRetardances);
  const Jp = pseudoInverse3x4(J);

  // Compute update: delta_phi = mu * J+ * dS
  const dPhi: [number, number, number, number] = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      dPhi[i] += Jp[i][j] * dS[j];
    }
    dPhi[i] *= mu;
  }

  // Apply update
  const newRetardances: [number, number, number, number] = [
    currentRetardances[0] + dPhi[0],
    currentRetardances[1] + dPhi[1],
    currentRetardances[2] + dPhi[2],
    currentRetardances[3] + dPhi[3],
  ];

  const clamped = clampRetardances(newRetardances);
  const newOutput = computeOutput(input, clamped);

  return {
    retardances: clamped,
    output: newOutput,
    error: stokesError(newOutput, target),
  };
}

/** Generate random retardances in [0, pi] */
export function randomRetardances(): [number, number, number, number] {
  return [
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  ];
}
