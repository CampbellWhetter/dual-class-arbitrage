import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Analyze from "./Analyze";
import LiveResults from "./LiveResults";

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-link" : "inactive-link")}
          >
            Analyze Securities
          </NavLink>
          <NavLink
            to="/live-results"
            className={({ isActive }) => (isActive ? "active-link" : "inactive-link")}
          >
            Live Results
          </NavLink>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Analyze />} />
            <Route path="/live-results" element={<LiveResults />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;