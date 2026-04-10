import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });
  return (
    <Sphere ref={meshRef} args={[1.8, 100, 100]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#00d4ff"
        attach="material"
        distort={0.45}
        speed={2}
        roughness={0.1}
        metalness={0.95}
        emissive="#003366"
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}

function WireframeRing({ radius, tilt, speed, color }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.x = tilt + state.clock.elapsedTime * speed * 0.3;
    ref.current.rotation.z = state.clock.elapsedTime * speed;
  });
  const geometry = useMemo(() => new THREE.TorusGeometry(radius, 0.01, 2, 120), [radius]);
  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
    </mesh>
  );
}

function FloatingParticles() {
  const count = 80;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00d4ff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function HeroThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: 'transparent' }} gl={{ alpha: true }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} color="#00d4ff" intensity={2} />
      <pointLight position={[-5, -5, -5]} color="#bd00ff" intensity={1.5} />
      <directionalLight position={[0, 10, 0]} color="#00ff9d" intensity={0.5} />

      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <FloatingParticles />
      <AnimatedSphere />

      <WireframeRing radius={2.8} tilt={Math.PI / 4} speed={0.3} color="#00d4ff" />
      <WireframeRing radius={3.4} tilt={-Math.PI / 3} speed={-0.2} color="#bd00ff" />
      <WireframeRing radius={4.0} tilt={Math.PI / 6} speed={0.15} color="#00ff9d" />
    </Canvas>
  );
}
