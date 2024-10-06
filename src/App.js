// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SolarSystemApp from './SolarSystemApp';
import EarthScene from './EarthScene'; // Exemple d'une autre scène
import Home from './Home';

function App() {
  return (
    <Router>
      <div style={{ height: '100vh', width: '100vw' }}>


        {/* Définition des routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solar-system" element={<SolarSystemApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
