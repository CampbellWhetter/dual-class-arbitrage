import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./HomePage"; // Your existing main page
import TradingSimulator from "./TradingSimulator"; // New simulator page

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-link" : "inactive-link")}
          >
            Home
          </NavLink>
          <NavLink
            to="/simulator"
            className={({ isActive }) => (isActive ? "active-link" : "inactive-link")}
          >
            Trading Simulator
          </NavLink>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/simulator" element={<TradingSimulator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

