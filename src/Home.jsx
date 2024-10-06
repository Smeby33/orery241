// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'


function App() {
  return (
    <div>



        <div className='budy'>
      <div className="navi">
        <div className="image">
          <img src="/Dernier Logo.png" alt="" />
        </div>
        <div className="nav1">
          <ul>
            <li><Link to="/">Acceuil</Link></li>
            <li><a href="#planets">Planets</a></li>
            <li><a href="#education">Education</a></li>
          </ul>
        </div>
      </div>

      <div className="section1" id='home'>
          <div className="home-container">
      <header className="home-header">
        <div className="blanc">
        <h1>Explorez les Merveilles de Notre Système Solaire</h1>
        <p style={{ color: 'white' }}>Bienvenue dans notre exploration fascinante du système solaire !
           Que vous soyez un novice ou simplement curieux, notre application 
           vous guidera à travers les merveilles célestes qui composent notre 
           environnement spatial. Apprenez à mieux comprendre les planètes qui 
           nous entourent, les astéroïdes géocroiseurs, et découvrez l’impact
            potentiel de ces objets mystérieux sur notre Terre.</p>
        </div>
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
        <div className="key-point" id='planets' >
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
        <Link to="/solar-system" className="explore-button">Commencez l'exploration</Link>
        
      </section>
      </div>
      </div>
      

      </div>
    </div>
  );
}

export default App;
