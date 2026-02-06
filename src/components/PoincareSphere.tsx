import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import type { SimulationResult } from "../types";
import { stokesToCartesian } from "../math/stokes";

/** Colors for input + 4 plate states */
const STATE_COLORS = ["#4fc3f7", "#81c784", "#ffb74d", "#e57373", "#ba68c8"];
const STATE_LABELS = ["Input", "After P1", "After P2", "After P3", "Output"];

interface PoincareSphereProps {
  simulation: SimulationResult;
}

/** Generate points for a circle in 3D */
function circlePoints(
  axis: "xy" | "xz" | "yz",
  segments: number = 96
): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    if (axis === "xy") points.push([c, s, 0]);
    else if (axis === "xz") points.push([c, 0, s]);
    else points.push([0, c, s]);
  }
  return points;
}

function WireframeSphere() {
  const geo = useMemo(() => new THREE.SphereGeometry(1, 32, 24), []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial
        color="#ffffff"
        wireframe
        transparent
        opacity={0.06}
      />
    </mesh>
  );
}

function AxisLine({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
}

function AxisLabel({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  return (
    <Text
      position={position}
      fontSize={0.12}
      color={color}
      anchorX="center"
      anchorY="middle"
      font={undefined}
    >
      {text}
    </Text>
  );
}

function ReferenceCircles() {
  // Equator: S3=0 plane (all linear states), which is y=0 in our mapping (xz plane)
  const equator = useMemo(() => circlePoints("xz"), []);
  // Meridian through H/V and R/L poles: S2=0 plane (z=0), xy plane
  const meridianS2zero = useMemo(() => circlePoints("xy"), []);
  // Meridian through +45/-45 and R/L poles: S1=0 plane (x=0), yz plane
  const meridianS1zero = useMemo(() => circlePoints("yz"), []);

  return (
    <>
      <Line points={equator} color="#555555" lineWidth={0.8} transparent opacity={0.3} />
      <Line points={meridianS2zero} color="#555555" lineWidth={0.5} transparent opacity={0.2} />
      <Line points={meridianS1zero} color="#555555" lineWidth={0.5} transparent opacity={0.2} />
    </>
  );
}

function StatePoint({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.07}
        color={color}
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

function ArcPath({ points, color }: { points: [number, number, number][]; color: string }) {
  if (points.length < 2) return null;
  return <Line points={points} color={color} lineWidth={2.5} />;
}

function Scene({ simulation }: PoincareSphereProps) {
  const statePositions = useMemo(
    () => simulation.states.map((s) => stokesToCartesian(s)),
    [simulation.states]
  );

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />

      <WireframeSphere />
      <ReferenceCircles />

      {/* S1 axis: H / V */}
      <AxisLine from={[-1.3, 0, 0]} to={[1.3, 0, 0]} color="#666666" />
      <AxisLabel position={[1.4, 0, 0]} text="H" color="#888888" />
      <AxisLabel position={[-1.4, 0, 0]} text="V" color="#888888" />

      {/* S2 axis: +45 / -45 */}
      <AxisLine from={[0, 0, -1.3]} to={[0, 0, 1.3]} color="#666666" />
      <AxisLabel position={[0, 0, 1.4]} text="+45" color="#888888" />
      <AxisLabel position={[0, 0, -1.4]} text="-45" color="#888888" />

      {/* S3 axis: R / L */}
      <AxisLine from={[0, -1.3, 0]} to={[0, 1.3, 0]} color="#666666" />
      <AxisLabel position={[0, 1.4, 0]} text="R" color="#888888" />
      <AxisLabel position={[0, -1.4, 0]} text="L" color="#888888" />

      {/* Arcs */}
      {simulation.arcs.map((arcPoints, i) => (
        <ArcPath key={i} points={arcPoints} color={STATE_COLORS[i + 1]} />
      ))}

      {/* State points */}
      {statePositions.map((pos, i) => (
        <StatePoint
          key={i}
          position={pos}
          color={STATE_COLORS[i]}
          label={STATE_LABELS[i]}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        makeDefault
      />
    </>
  );
}

export default function PoincareSphere({ simulation }: PoincareSphereProps) {
  return (
    <Canvas
      camera={{ position: [2, 1.5, 2], fov: 45 }}
      style={{ background: "#1a1a1a" }}
    >
      <Scene simulation={simulation} />
    </Canvas>
  );
}
