import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './App.css'

function App() {
  const [showInfo, setShowInfo] = useState(false);
  const [selectedBody, setSelectedBody] = useState(null); 
  const [bodyData, setBodyData] = useState({});
  const [rotationSpeed, setRotationSpeed] = useState(0.1); // Vitesse de rotation

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001d3d);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.target.set(0, 0, 0);

    // Lights
    const yellowLight = new THREE.PointLight(0xffff00, 1, 100);
    yellowLight.position.set(0, 0, 0);
    scene.add(yellowLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunTexture = new THREE.TextureLoader().load('/suny.jpg');
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets
    const planets = [
      { name: 'Mercure', distance: 2, size: 0.2, texture: '/mercur.jpg' },
      { name: 'Venus', distance: 2.5, size: 0.3, texture: '/ven.jpg' },
      { name: 'Terre', distance: 3, size: 0.4, texture: '/earth.jpg' },
      { name: 'Mars', distance: 3.5, size: 0.3, texture: '/mars.jpg' },
      { name: 'Jupiter', distance: 4.5, size: 0.6, texture: '/jupi.jpg' },
      { name: 'Saturne', distance: 5.5, size: 0.5, texture: '/saturne.jpg', hasRings: true },
      { name: 'Uranus', distance: 6.5, size: 0.4, texture: '/uranu.jpg', hasRings: true },
      { name: 'Neptune', distance: 7.5, size: 0.4, texture: '/neptunee.jpg' },
      { name: 'Pluton', distance: 8.5, size: 0.15, texture: '/plutonn.jpg', hasRings: true },
    ];

    const planetMeshes = planets.map((planet) => {
      const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
      const texture = new THREE.TextureLoader().load(planet.texture);
      const material = new THREE.MeshPhongMaterial({ map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Add rings for certain planets
      if (planet.hasRings) {
        const ringGeometry = new THREE.RingGeometry(planet.size * 2, planet.size * 3, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: planet.name === 'Saturne' ? 0xffe4c4 : 0x222222,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: planet.name === 'Saturne' ? 0.7 : 0.5,
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        scene.add(rings);
      }

      return { name: planet.name, mesh, distance: planet.distance };
    });

    const moonDistance = 1;  // Distance de la Lune à la Terre
    let moonTheta = 25;  // Angle initial de l'orbite de la Lune
  
    const moonGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const moonTexture = new THREE.TextureLoader().load('/moon.png');
    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    const earthIndex = planets.findIndex(p => p.name === 'Terre');

    // Handle clicks on celestial bodies
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
          focusOnBody(intersects[0].object);
        }
      } else {
        setShowInfo(false);
        setSelectedBody(null);
      }
    };

    // Function to focus on selected celestial body
    const focusOnBody = (body) => {
      const bodyPosition = body.position;
      controls.target.copy(bodyPosition);

      const targetPosition = new THREE.Vector3(bodyPosition.x + 5, bodyPosition.y + 5, bodyPosition.z + 5);
      const duration = 1;
      const start = camera.position.clone();
      const clock = new THREE.Clock();

      const animateCamera = () => {
        const elapsed = clock.getElapsedTime() / duration;
        if (elapsed < 1) {
          camera.position.lerpVectors(start, targetPosition, elapsed);
          controls.update();
          requestAnimationFrame(animateCamera);
        } else {
          camera.position.copy(targetPosition);
        }
      };

      animateCamera();
    };

    // Handle hover effects
    const handleObjectHover = (event) => {
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
        console.log(`Survol: ${bodyName}`);
      }
    };

    // Function to create stars in the background
    const createStars = (count) => {
      const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      
      for (let i = 0; i < count; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const [x, y, z] = [Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100];
        star.position.set(x, y, z);
        scene.add(star);
      }
    };

    // Event listeners
    window.addEventListener('click', handleObjectClick);
    window.addEventListener('mousemove', handleObjectHover);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      planetMeshes.forEach((planet, index) => {
        const theta = time * (rotationSpeed + index * 0.1);
        planet.mesh.position.x = planet.distance * Math.cos(theta);
        planet.mesh.position.z = planet.distance * Math.sin(theta);
        planet.mesh.rotation.y += rotationSpeed * 0.01;
      });
     

      // Update Moon's orbit around the Earth
    moonTheta += 0.01;  // Ajustez la vitesse d'orbite de la Lune ici
    moon.position.x = planetMeshes[earthIndex].mesh.position.x + moonDistance * Math.cos(moonTheta);
    moon.position.z = planetMeshes[earthIndex].mesh.position.z + moonDistance * Math.sin(moonTheta);
    moon.position.y = 0; 
    moon.rotation.y += 0.01; // 
    if (earthIndex !== -1) {
      const earthPosition = planetMeshes[earthIndex].mesh.position;
      moonTheta += 0.2; // Ajuster la vitesse de rotation
      const moonX = earthPosition.x + moonDistance * Math.cos(moonTheta);
      const moonZ = earthPosition.z + moonDistance * Math.sin(moonTheta);
      moon.position.set(moonX, 0, moonZ);
    }
      controls.update();
      renderer.render(scene, camera);
    };

    createStars(5000);
    animate();

    return () => {
      window.removeEventListener('click', handleObjectClick);
      window.removeEventListener('mousemove', handleObjectHover);
      document.body.removeChild(renderer.domElement);
    };
  }, [rotationSpeed]);

  // Fonction pour gérer le changement de vitesse de rotation
  const handleRotationSpeedChange = (event) => {
    setRotationSpeed(parseFloat(event.target.value));
  };

  return (
    <div className='budy'>
      <div className="navi">
          <ul>
            <li><a href="#home">Acceuil</a></li>
            <li><a href="#planets">Planets</a></li>
            <li><a href="#asteroids">Asteroids</a></li>
            <li><a href="#comets">Comets</a></li>
            <li><a href="#education">Education</a></li>
          </ul>
      </div>

      <div className="section1" id='home'>
          <div className="home-container">
      <header className="home-header">
        <h1>Explorez les Merveilles de Notre Système Solaire</h1>
        <p>Bienvenue dans notre exploration fascinante du système solaire !
           Que vous soyez un novice ou simplement curieux, notre application 
           vous guidera à travers les merveilles célestes qui composent notre 
           environnement spatial. Apprenez à mieux comprendre les planètes qui 
           nous entourent, les astéroïdes géocroiseurs, et découvrez l’impact
            potentiel de ces objets mystérieux sur notre Terre.</p>
      </header>
      <div className="h222">
      <h2>
      Pourquoi explorer le système solaire ?
      </h2>
      <h4>
        <em>
        L’exploration du système solaire n’est pas seulement une aventure fascinante,
         c’est aussi une quête pour comprendre notre place dans l'univers.
          Les astéroïdes et les comètes jouent un rôle clé dans l’évolution de notre planète,
           et certains d'entre eux peuvent même avoir un impact direct sur notre avenir.
            C’est pourquoi il est essentiel d’en apprendre davantage sur ces objets célestes,
             leurs trajectoires, et leur impact potentiel sur la Terre.
        </em>
      </h4>
      </div>
      <section className="key-points">
        <div className="key-point">
          <h2>Les Planètes</h2>
          <p>Découvrez les planètes de notre système solaire, leurs caractéristiques uniques et leurs mystères.</p>
        </div>
        <div className="key-point">
          <h2>Astéroïdes Géocroiseurs</h2>
          <p>Apprenez comment ces astéroïdes proches de la Terre sont surveillés et pourquoi ils sont importants.</p>
        </div>
        <div className="key-point">
          <h2>Comètes et Origines</h2>
          <p>Découvrez l'origine des comètes, ces voyageurs cosmiques qui illuminent notre ciel nocturne.</p>
        </div>
      </section>
      <section className="call-to-action">
        <p>Plongez dans cette aventure spatiale unique, explorez les corps célestes et préparez-vous à découvrir l’univers comme vous ne l’avez jamais vu !</p>
        <a href="#solar-system" className="explore-button">Commencez l'exploration</a>
      </section>
          </div>
      </div>

      <div className="section2" id='planets'   style={{ position: 'relative',}} >
          <div id='solar-system'  style={{ position: 'absolute', top: '10px', left: '10px', color: 'white' }}>
            <h3>Contrôle de la vitesse de rotation</h3>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={rotationSpeed}
              onChange={handleRotationSpeedChange}
            />
          </div>
          {showInfo && (
            <div style={{ position: 'absolute', top: '100px', left: '10px', color: 'white' }}>
              <h3>{selectedBody}</h3>
              <ul>
                {Object.entries(bodyData).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}

export default App;
