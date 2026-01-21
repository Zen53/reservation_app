import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import ResourcePage from './pages/ResourcePage/ResourcePage';
import ReservationPage from './pages/ReservationPage/ReservationPage';
import './index.css';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="app-nav">
          <div className="app-nav__inner">
            <Link to="/" className="app-logo">Réservation</Link>
          </div>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resources/:id" element={<ResourcePage />} />
            <Route path="/reservations/:id" element={<ReservationPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
