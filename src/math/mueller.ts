import type { StokesVector } from "../types";

/**
 * Mueller matrix for a linear retarder (wave plate).
 *
 * For the BATi Acrobat PCM, the 4 plates are at fixed orientations:
 *   Plate 1: theta = 0°    -> rotation about S1 axis
 *   Plate 2: theta = +45°  -> rotation about S2 axis
 *   Plate 3: theta = -45°  -> rotation about -S2 axis (= negative rotation about S2)
 *   Plate 4: theta = 0°    -> rotation about S1 axis
 *
 * On the Poincare sphere, a wave plate at orientation theta with retardance delta
 * acts as a rotation by angle delta about the axis at azimuth 2*theta on the equator.
 *
 * The general Mueller matrix for a wave plate at angle theta with retardance delta:
 *   M = R(-2*theta) * M_retarder(delta) * R(2*theta)
 *
 * where M_retarder(delta) for a retarder at 0°:
 *   [1,    0,         0,         0      ]
 *   [0,    1,         0,         0      ]
 *   [0,    0,    cos(delta), sin(delta)  ]
 *   [0,    0,   -sin(delta), cos(delta)  ]
 *
 * and R(angle) rotates S1/S2 in the Stokes plane.
 */

/** Apply Mueller matrix of a wave plate at orientation theta with retardance delta to a Stokes vector */
export function applyWavePlate(input: StokesVector, delta: number, theta: number): StokesVector {
  const c = Math.cos(delta);
  const s = Math.sin(delta);
  const c2 = Math.cos(2 * theta);
  const s2 = Math.sin(2 * theta);

  // Mueller matrix elements for general linear retarder
  const s0 = input[0];
  const s1 = input[1];
  const s2v = input[2];
  const s3 = input[3];

  const m11 = c2 * c2 + s2 * s2 * c;
  const m12 = c2 * s2 * (1 - c);
  const m13 = -s2 * s;
  const m21 = c2 * s2 * (1 - c);
  const m22 = s2 * s2 + c2 * c2 * c;
  const m23 = c2 * s;
  const m31 = s2 * s;
  const m32 = -c2 * s;
  const m33 = c;

  return [
    s0,
    m11 * s1 + m12 * s2v + m13 * s3,
    m21 * s1 + m22 * s2v + m23 * s3,
    m31 * s1 + m32 * s2v + m33 * s3,
  ];
}
