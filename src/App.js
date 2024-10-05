import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable smooth damping
    controls.dampingFactor = 0.25; // Damping factor
    controls.enableZoom = true; // Allow zooming
    controls.target.set(0, 0, 0); // Set the initial focus point

    // Lights
    const yellowLight = new THREE.PointLight(0xffff00, 1, 100);
    yellowLight.position.set(0, 0, 0);
    scene.add(yellowLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunTexture = new THREE.TextureLoader().load('/sun.jpg');
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets
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

    // Moon
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
      controls.target.copy(bodyPosition); // Change the focus point

      const targetPosition = new THREE.Vector3(bodyPosition.x + 5, bodyPosition.y + 5, bodyPosition.z + 5);
      const duration = 1; // Duration of the animation in seconds
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
        console.log(`Survol: ${bodyName}`); // Can replace this with a UI display
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
    };;

    // Event listeners
    window.addEventListener('click', handleObjectClick);
    window.addEventListener('mousemove', handleObjectHover);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      planetMeshes.forEach((planet, index) => {
        const theta = time * (0.2 + index * 0.1);
        planet.mesh.position.set(planet.distance * Math.cos(theta), 0, planet.distance * Math.sin(theta));

        // Positioning the moon around the Earth
        if (index === earthIndex) {
          const moonDistance = 0.8; // Distance from Earth to the Moon
          moon.position.set(planet.mesh.position.x + moonDistance * Math.cos(time * 2), 0, planet.mesh.position.z + moonDistance * Math.sin(time * 2));
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    createStars(3000); // Create 100 stars
    animate();

    return () => {
      window.removeEventListener('click', handleObjectClick);
      window.removeEventListener('mousemove', handleObjectHover);
      renderer.dispose();
    };
  }, [selectedBody]);

  return (
    <div>
      {showInfo && (
        <div className="info">
          <h2>{selectedBody}</h2>
          <ul>
            {Object.entries(bodyData).map(([key, value]) => (
              <li key={key}>{key}: {value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
