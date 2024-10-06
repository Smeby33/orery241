import React, { useState, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Sprite } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Importer les textures pour la Terre, la Lune, et l'environnement
import earthTexture from './textures/earth.jpg';
import moonTexture from './textures/moon.jpg';
import spaceEnvironment from './textures/space.jpg';

const BackgroundSphere = () => {
  const texture = useLoader(THREE.TextureLoader, spaceEnvironment);

  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

const EarthScene = () => {
  const [earthColor, setEarthColor] = useState('#ffffff');
  const [moonColor, setMoonColor] = useState('#ffffff');
  const controlsRef = useRef();

  const earthMap = useLoader(THREE.TextureLoader, earthTexture);
  const moonMap = useLoader(THREE.TextureLoader, moonTexture);

  const handleClick = (position) => {
    controlsRef.current.target.set(...position);
    controlsRef.current.update();
  };

  return (
    <>
      <Canvas>
        {/* Lumières */}
        <ambientLight intensity={1} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} castShadow />
        <pointLight position={[10, 10, 10]} intensity={0.8} distance={100} />

        {/* Sphère d'arrière-plan */}
        <BackgroundSphere />

        {/* Terre */}
        <mesh
          position={[0, 0, 0]}
          onClick={() => handleClick([0, 0, 0])}
          onPointerOver={() => setEarthColor('#c0cbff')}
          onPointerOut={() => setEarthColor('#ffffff')}
          castShadow
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial map={earthMap} color={earthColor} />
        </mesh>

        {/* Lune */}
        <mesh
          position={[2, 0, 0]}
          onClick={() => handleClick([2, 0, 0])}
          onPointerOver={() => setMoonColor('#c0cbff')}
          onPointerOut={() => setMoonColor('#ffffff')}
          castShadow
        >
          <sphereGeometry args={[0.27, 32, 32]} />
          <meshStandardMaterial map={moonMap} color={moonColor} />
        </mesh>

        {/* Labels en utilisant Html */}
        <Html position={[0, 1.2, 0]}>
          <div style={{ color: 'white', fontSize: '1em', textAlign: 'center' }}>Terre</div>
        </Html>
        <Html position={[2, 0.5, 0]}>
          <div style={{ color: 'white', fontSize: '1em', textAlign: 'center' }}>Lune</div>
        </Html>

        {/* Contrôles de rotation avec auto-rotation */}
        <OrbitControls ref={controlsRef} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </>
  );
};

export default EarthScene;
