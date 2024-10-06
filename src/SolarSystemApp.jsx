import React, { useState, useRef, startTransition } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import './App.css';

// Importer les textures pour le Soleil, la Terre, l'environnement spatial et les autres planètes
import sunTexture from './textures/2k_sun.jpg';
import earthTexture from './textures/earth.jpg';
import spaceEnvironment from './textures/space.jpg';
import mercuryTexture from './textures/mercury.jpg';
import venusTexture from './textures/2k_venus_atmosphere.jpg';
import marsTexture from './textures/2k_mars.jpg';
import jupiterTexture from './textures/2k_jupiter.jpg';
import saturnTexture from './textures/2k_saturn.jpg';
import uranusTexture from './textures/2k_uranus.jpg';
import neptuneTexture from './textures/2k_neptune.jpg';
import moonTexture from './textures/moon.jpg';

// Données des planètes
const planetData = [
  { name: "Mercure", a: 0.387, e: 0.206, texture: mercuryTexture, size: 0.488 },
  { name: "Vénus", a: 0.723, e: 0.007, texture: venusTexture, size: 1.210 },
  { name: "Terre", a: 1.000, e: 0.017, texture: earthTexture, size: 1.274, moon: true },
  { name: "Mars", a: 1.524, e: 0.093, texture: marsTexture, size: 0.678 },
  { name: "Jupiter", a: 5.203, e: 0.049, texture: jupiterTexture, size: 13.982 },
  { name: "Saturne", a: 9.537, e: 0.054, texture: saturnTexture, size: 11.646, hasRings: true },
  { name: "Uranus", a: 19.191, e: 0.047, texture: uranusTexture, size: 5.072, hasRings: true },
  { name: "Neptune", a: 30.069, e: 0.009, texture: neptuneTexture, size: 4.924 }
];

// Constantes pour la Lune
const moonSize = 0.347;
const moonDistanceFromEarth = 0.00257;

// Fonction pour calculer la position d'une planète
const calculatePosition = (a, e) => {
  if (!a || !e) return [0, 0, 0]; // Valeur par défaut
  const theta = Math.random() * 2 * Math.PI;
  const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
  return [r * Math.cos(theta) * 50, 0, r * Math.sin(theta) * 50]; // Échelle ajustée
};

// Sphère d'arrière-plan
const BackgroundSphere = () => {
  const texture = useLoader(THREE.TextureLoader, spaceEnvironment);
  return (
    <mesh>
      <sphereGeometry args={[500, 500, 500]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

// Fonction pour dessiner une orbite
const Orbit = ({ a }) => (
  <mesh rotation={[Math.PI / 2, 0, 0]}>
    <ringGeometry args={[a * 50 - 0.05, a * 50 + 0.05, 64]} />
    <meshBasicMaterial color="gray" side={THREE.DoubleSide} />
  </mesh>
);

// Fonction pour dessiner les anneaux
const Rings = ({ planet }) => {
  if (!planet.hasRings) return null;

  const ringSizes = {
    Saturne: [planet.size + 2, planet.size + 5],
    Uranus: [planet.size + 1, planet.size + 2]
  };

  const size = ringSizes[planet.name];
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size[0], size[1], 64]} />
      <meshBasicMaterial color="gray" side={THREE.DoubleSide} />
    </mesh>
  );
};

// Fonction pour dessiner la Lune
const Moon = ({ earthPosition }) => {
  const moonPosition = calculatePosition(moonDistanceFromEarth, 0.054);
  const texture = useLoader(THREE.TextureLoader, moonTexture);
  
  return (
    <mesh position={[earthPosition[0] + moonPosition[0], earthPosition[1], earthPosition[2] + moonPosition[2]]}>
      <sphereGeometry args={[moonSize, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

// Fonction pour dessiner les astéroïdes
const Asteroids = ({ earthPosition, count = 50 }) => {
  const asteroids = [];
  
  for (let i = 0; i < count; i++) {
    const distance = moonDistanceFromEarth * (1 + Math.random());
    const angle = Math.random() * 2 * Math.PI;
    const x = earthPosition[0] + distance * Math.cos(angle);
    const z = earthPosition[2] + distance * Math.sin(angle);
    const y = earthPosition[1] + (Math.random() * 0.01 - 0.005);

    asteroids.push(
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[0.01, 16, 16]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }
  
  return <>{asteroids}</>;
};

// Fonction pour représenter chaque planète
const Planet = ({ position, texture, name, size, onClick }) => {
  const planetTexture = useLoader(THREE.TextureLoader, texture);

  return (
    <mesh position={position} onClick={() => startTransition(() => onClick(position))}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial map={planetTexture} />

      {name === 'Terre' && <Moon earthPosition={position} />}
      {name === 'Terre' && <Asteroids earthPosition={position} />}

      <Html position={[0, size + 0.5, 0]}>
        <div style={{ color: 'white', textAlign: 'center', cursor: 'pointer' }}>
          {name}
        </div>
      </Html>
    </mesh>
  );
};

// Composant principal pour le système solaire
const SolarSystem = () => {
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(true);

  const handlePlanetClick = (position) => {
    if (Array.isArray(position) && position.length >= 3 && controlsRef.current) {
      controlsRef.current.target.set(position[0], position[1], position[2]);
      controlsRef.current.update();
    } else {
      console.error("Position ou controlsRef est indéfini", position);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} castShadow />
        <pointLight position={[10, 10, 10]} intensity={0.8} distance={100} />

        <BackgroundSphere />

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[13.982, 32, 32]} />
          <meshStandardMaterial map={useLoader(THREE.TextureLoader, sunTexture)} />
        </mesh>

        {planetData.map((planet, index) => (
          <React.Fragment key={index}>
            <Orbit a={planet.a} />
            <Planet
              position={calculatePosition(planet.a, planet.e)}
              texture={planet.texture}
              name={planet.name}
              size={planet.size}
              onClick={handlePlanetClick}
            />
            {planet.hasRings && <Rings planet={planet} />}
          </React.Fragment>
        ))}

        <OrbitControls ref={controlsRef} autoRotate={autoRotate} autoRotateSpeed={0.5} />
      </Canvas>

      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        <Link to="/">
          <button>Quitter</button>
        </Link>
        <button onClick={() => setAutoRotate(!autoRotate)}>
          {autoRotate ? 'Pause Rotation' : 'Activer Rotation'}
        </button>
      </div>
    </div>
  );
};

export default SolarSystem;
