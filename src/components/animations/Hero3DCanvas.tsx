"use client";

import React, { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

class CanvasErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ArchitecturalWireframeSculpture({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particlePositions = useMemo(() => {
    const count = 48;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (((Math.sin(i * 12.9898) * 43758.5453) % 1) - 0.5) * 14;
      arr[i * 3 + 1] = (((Math.cos(i * 78.233) * 12345.678) % 1) - 0.5) * 7;
      arr[i * 3 + 2] = (((Math.sin(i * 45.164) * 98765.432) % 1) - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    if (groupRef.current) {
      groupRef.current.rotation.y += clampedDelta * 0.07;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouseRef.current.y * 0.12,
        0.04
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        -mouseRef.current.x * 0.06,
        0.04
      );
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.12;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= clampedDelta * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 8, 5]} intensity={1.0} color="#E0C796" />

      <group ref={groupRef} position={[2.8, 0, -1.5]}>
        <mesh position={[-0.9, -0.2, 0]}>
          <boxGeometry args={[1.1, 3.4, 1.1]} />
          <meshStandardMaterial color="#C6A66C" wireframe transparent opacity={0.26} />
        </mesh>
        <mesh position={[0.45, 0.35, -0.4]}>
          <boxGeometry args={[1.25, 4.5, 1.25]} />
          <meshStandardMaterial color="#E0C796" wireframe transparent opacity={0.32} />
        </mesh>
        <mesh position={[1.7, -0.55, 0.3]}>
          <boxGeometry args={[0.95, 2.7, 0.95]} />
          <meshStandardMaterial color="#C6A66C" wireframe transparent opacity={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[0.3, 0.1, 0]}>
          <torusGeometry args={[2.5, 0.012, 12, 56]} />
          <meshBasicMaterial color="#C6A66C" transparent opacity={0.3} />
        </mesh>
      </group>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#E0C796"
          size={0.045}
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>
    </>
  );
}

export default function Hero3DCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || window.innerWidth < 1024) return;

    // Defer WebGL mount slightly after first paint so initial load never stalls
    const timer = window.setTimeout(() => setReady(true), 250);

    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onDocVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onDocVis);

    const host = hostRef.current;
    let observer: IntersectionObserver | null = null;
    const onVisibilityState = (event: Event) => {
      const skipped = (event as Event & { skipped?: boolean }).skipped;
      setActive(!skipped && !document.hidden);
    };

    if (host) {
      if ("contentVisibility" in document.documentElement.style) {
        host.addEventListener("contentvisibilityautostatechange", onVisibilityState);
      } else {
        observer = new IntersectionObserver(
          (entries) => {
            setActive(entries.some((entry) => entry.isIntersecting) && !document.hidden);
          },
          { rootMargin: "120px" }
        );
        observer.observe(host);
      }
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onDocVis);
      if (host) {
        host.removeEventListener("contentvisibilityautostatechange", onVisibilityState);
      }
      observer?.disconnect();
    };
  }, []);

  if (!ready) return null;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="gr-canvas-host pointer-events-none absolute inset-0 z-[2] hidden lg:block"
    >
      <CanvasErrorBoundary>
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={1}
          camera={{ position: [0, 0, 7.5], fov: 42 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "low-power",
            stencil: false,
          }}
        >
          <ArchitecturalWireframeSculpture mouseRef={mouseRef} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
