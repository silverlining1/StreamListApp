import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import StreamListPage from './components/StreamList';
import Movies from './components/Movies';
import Cart from './components/Cart';
import About from './components/About';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import { register } from "./serviceWorkerRegistration";

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<StreamListPage />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

register();

export default App;