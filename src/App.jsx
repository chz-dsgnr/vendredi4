import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Gltf, ScrollControls, useScroll } from "@react-three/drei";
import { AxesHelper } from "three";
import { getProject, val } from "@theatre/core";
import studio from "@theatre/studio";
import theatreState from "./theatreState.json";

import {
  SheetProvider,
  PerspectiveCamera,
  useCurrentSheet,
} from "@theatre/r3f";

// Initialize Theatre.js studio
studio.initialize();

export default function App() {
  const sheet = getProject("Fly Through", { state: theatreState }).sheet(
    "Scene"
  );

  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} shadows>
      <ScrollControls pages={5}>
        <SheetProvider sheet={sheet}>
          <Scene />
        </SheetProvider>
      </ScrollControls>
    </Canvas>
  );
}

function Scene() {
  const sheet = useCurrentSheet();
  const scroll = useScroll();
  const lightRef = React.useRef();

  useFrame(({ camera }) => {
    const sequenceLength = val(sheet.sequence.pointer.length);
    sheet.sequence.position = scroll.offset * sequenceLength;

    if (lightRef.current) {
      lightRef.current.position.set(camera.position.x, camera.position.y + 5, camera.position.z);
    }
  });

  const bgColor = "#040404";

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" color={"black"} near={-4} far={4} />
      <directionalLight
        ref={lightRef}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={10}
      />
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={1.5} />
      {/* Vérification et application de l'émission */}
      <Gltf
        src="public/scenev4.glb"
        castShadow
        receiveShadow
        onLoad={(gltf) => {
          gltf.scene.traverse((node) => {
            if (node.isMesh && node.material) {
              node.material.emissive = node.material.emissive || new THREE.Color(0x000000);
              node.material.emissiveIntensity = 4; // Ajustez l'intensité
            }
          });
        }}
      />
      <PerspectiveCamera
        theatreKey="Camera"
        makeDefault
        position={[0, 0, 0]}
        scale={1}
        fov={50}
        near={0.1}
        far={4}
      />
      <primitive object={new AxesHelper(5)} />
    </>
  );
}