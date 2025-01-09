import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Analyze from "./Analyze"; // Component for analyzing securities
import LiveResults from "./LiveResults"; // Component for displaying live results

const App = () => {
  return (
    <Router>
      <div>
        {/* Navigation bar for routing between pages */}
        <nav>
          {/* NavLink for navigating to the Analyze page */}
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-link" : "inactive-link")}
          >
            Analyze Securities
          </NavLink>

          {/* NavLink for navigating to the Live Results page */}
          <NavLink
            to="/live-results"
            className={({ isActive }) => (isActive ? "active-link" : "inactive-link")}
          >
            Live Results
          </NavLink>
        </nav>

        <main>
          {/* Define routes for the application */}
          <Routes>
            {/* Route for the Analyze component (default page) */}
            <Route path="/" element={<Analyze />} />

            {/* Route for the Live Results component */}
            <Route path="/live-results" element={<LiveResults />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;