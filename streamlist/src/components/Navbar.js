import React from 'react';
import { NavLink } from 'react-router-dom';
import '../App.css';

function Navbar() {
    return (
        <nav className="navbar">
            <span className="nav-logo">StreamList</span>
            <div className="nav-links">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}>StreamList</NavLink>
                <NavLink to="/movies" className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}>Movies</NavLink>
                <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}>Cart</NavLink>
                <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-btn active' : 'nav-btn'}>About</NavLink>
            </div>
        </nav>
    );
}
export default Navbar;