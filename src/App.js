import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [selectedBody, setSelectedBody] = useState(null); // Pour garder la trace du corps céleste sélectionné
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunTexture = new THREE.TextureLoader().load('/sun.jpg');
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planets = [
      { name: 'Mercure', distance: 2, size: 0.2, texture: '/mercury.jpg' },
      { name: 'Venus', distance: 2.5, size: 0.3, texture: '/venus.jpg' },
      { name: 'Terre', distance: 3, size: 0.4, texture: '/earth.jpg' },
      { name: 'Mars', distance: 3.5, size: 0.3, texture: '/mars.jpg' },
      { name: 'Jupiter', distance: 4.5, size: 0.6, texture: '/jupiter.jpg' },
      { name: 'Saturne', distance: 5.5, size: 0.5, texture: '/saturn.jpg' },
      { name: 'Uranus', distance: 6.5, size: 0.4, texture: '/uranus.jpg' },
    ];

    const planetMeshes = planets.map((planet) => {
      const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
      const texture = new THREE.TextureLoader().load(planet.texture);
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return { name: planet.name, mesh, distance: planet.distance };
    });

    // Ajouter la Lune
    const moonGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const moonTexture = new THREE.TextureLoader().load('/moon.jpg');
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    // Position de la Lune
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
          // Remplacez par les données réelles des corps célestes
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
        const inclination = 0.25; // Inclinaison de 25%

        planet.mesh.position.x = Math.cos(theta) * planet.distance;
        planet.mesh.position.z = Math.sin(theta) * planet.distance;
        planet.mesh.position.y = Math.sin(theta) * inclination; // Inclinaison sur l'axe Y
      });

      // Position de la Lune
      const earthPosition = planetMeshes[earthIndex].mesh.position;
      const moonTheta = time * 2; // Vitesse de rotation de la Lune
      moon.position.x = earthPosition.x + Math.cos(moonTheta) * 1; // 1 unité pour l'orbite de la Lune
      moon.position.z = earthPosition.z + Math.sin(moonTheta) * 1;
      moon.position.y = earthPosition.y + Math.sin(moonTheta) * 0.3; // Inclinaison de la Lune

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
