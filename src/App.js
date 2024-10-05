import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [selectedBody, setSelectedBody] = useState(null); 
  const [bodyData, setBodyData] = useState({});

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001d3d);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const yellowLight = new THREE.PointLight(0xffff00, 1, 100);
    yellowLight.position.set(0, 0, 0);
    scene.add(yellowLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Augmentation de l'intensité lumineuse
    scene.add(ambientLight);

    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunTexture = new THREE.TextureLoader().load('/sun.jpg');
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planets = [
      { name: 'Mercure', distance: 2, size: 0.2, texture: '/mercur.jpg' },
      { name: 'Venus', distance: 2.5, size: 0.3, texture: '/venus.jpg' },
      { name: 'Terre', distance: 3, size: 0.4, texture: '/earth.jpg' },
      { name: 'Mars', distance: 3.5, size: 0.3, texture: '/mars.jpg' },
      { name: 'Jupiter', distance: 4.5, size: 0.6, texture: '/jupiter.jpg' },
      { name: 'Saturne', distance: 5.5, size: 0.5, texture: '/saturne.jpg', hasRings: true },
      { name: 'Uranus', distance: 6.5, size: 0.4, texture: '/uranus.jpg', hasRings: true },
      { name: 'Neptune', distance: 7.5, size: 0.4, texture: '/neptunee.jpg' },
      { name: 'Pluton', distance: 8.5, size: 0.15, texture: '/plutonn.jpg', hasRings: true },
    ];

    const planetMeshes = planets.map((planet) => {
      const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
      const texture = new THREE.TextureLoader().load(planet.texture);
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      if (planet.hasRings) {
        const ringGeometry = new THREE.RingGeometry(planet.size * 2, planet.size * 3, 64);  // Augmenté pour plus de visibilité
        let ringMaterial;

        if (planet.name === 'Saturne') {
          ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffe4c4, // Jaune pâle
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,  // Opacité augmentée pour plus de visibilité
          });
        } else if (planet.name === 'Pluton') {
          ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x222222, // Gris foncé
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,  // Opacité augmentée pour plus de visibilité
          });
        }

        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        rings.position.y = 0.2;  // Légèrement décalé pour éviter le Z-Fighting
        scene.add(rings);

        rings.position.copy(mesh.position);
      }

      return { name: planet.name, mesh, distance: planet.distance };
    });

    const moonGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const moonTexture = new THREE.TextureLoader().load('/moon.png');
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    const earthIndex = planets.findIndex(p => p.name === 'Terre');
    
    const handleObjectClick = (event) => {
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects([...planetMeshes.map(p => p.mesh), moon]);

      if (intersects.length > 0) {
        const intersectedBody = intersects[0].object;
        const bodyName = planetMeshes.find(p => p.mesh === intersectedBody)?.name || 'Lune';
        if (selectedBody === bodyName) {
          setShowInfo(false);
          setSelectedBody(null);
        } else {
          setSelectedBody(bodyName);
          setShowInfo(true);

          const data = bodyName === 'Lune' ? {
            "Distance": "384,400 km",
            "Diamètre": "3,474.8 km",
          } : {
            "Distance au soleil": `${planetMeshes[earthIndex].distance} UA`,
            "Diamètre": "12,742 km",
          };
          setBodyData(data);
        }
      } else {
        setShowInfo(false);
        setSelectedBody(null);
      }
    };

    window.addEventListener('click', handleObjectClick);

    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      planetMeshes.forEach((planet, index) => {
        const theta = time * (0.2 + index * 0.1);
        const inclination = 0.25;

        planet.mesh.position.x = Math.cos(theta) * planet.distance;
        planet.mesh.position.z = Math.sin(theta) * planet.distance;
        planet.mesh.position.y = Math.sin(theta) * inclination;

        if (planet.hasRings) {
          // Synchroniser les anneaux avec la planète
          const rings = scene.children.find(r => r.geometry instanceof THREE.RingGeometry && r.position.equals(planet.mesh.position));
          if (rings) {
            rings.position.copy(planet.mesh.position);
          }
        }
      });

      const earthPosition = planetMeshes[earthIndex].mesh.position;
      const moonTheta = time * 2;
      moon.position.x = earthPosition.x + Math.cos(moonTheta) * 1;
      moon.position.z = earthPosition.z + Math.sin(moonTheta) * 1;
      moon.position.y = earthPosition.y + Math.sin(moonTheta) * 0.25;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('click', handleObjectClick);
      document.body.removeChild(renderer.domElement);
    };
  }, [selectedBody]);

  return (
    <>
      <div className="background-container"></div>
      {showInfo && (
        <div className="info-panel">
          <h2>Informations sur {selectedBody}</h2>
          {Object.entries(bodyData).map(([key, value]) => (
            <p key={key}>{key}: {value}</p>
          ))}
        </div>
      )}
    </>
  );
}

export default App;
