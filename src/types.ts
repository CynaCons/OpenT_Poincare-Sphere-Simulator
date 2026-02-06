/** Stokes vector: [S0, S1, S2, S3] */
export type StokesVector = [number, number, number, number];

/** A single wave plate definition */
export interface PlateDef {
  /** Orientation angle in radians */
  theta: number;
  /** Retardance in radians (0 to pi/2) */
  delta: number;
  /** Display label */
  label: string;
}

/** Result of simulating the 4-plate chain */
export interface SimulationResult {
  /** 5 states: input + 4 intermediate outputs */
  states: StokesVector[];
  /** 4 arcs, each an array of [x,y,z] points on the sphere */
  arcs: [number, number, number][][];
}

/** Preset polarization state */
export interface PolarizationPreset {
  label: string;
  stokes: StokesVector;
}
