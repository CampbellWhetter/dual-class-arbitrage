import React, { useState, useEffect } from "react";
import "./LiveResults.css";

const LiveResults = () => {
  // State to store live results data fetched from the API
  const [liveResults, setLiveResults] = useState(null);

  useEffect(() => {
    // Function to fetch live results from the backend API
    const fetchLiveResults = async () => {
      try {
        const response = await fetch(`/api/live-results`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json(); // Parse the JSON response
        setLiveResults(data); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching live results:", error); // Log any errors
      }
    };

    // Initial fetch when the component is mounted
    fetchLiveResults();

    // Set up an interval to refresh live results every minute
    const interval = setInterval(fetchLiveResults, 60000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures the effect runs only once after the component mounts

  // Display a loading message if live results have not yet been fetched
  if (!liveResults) return <div style={{ color: "white" }}>Loading live results...</div>;

  // Extract runtime statistics from the live results data
  const runtimeStats = liveResults.runtimeStatistics || {};

  return (
    <div class="text">
      <h2>Dual-Class Arbitrage Strategy</h2>
      {/* Display key live results */}
      <p><strong>Status:</strong> {liveResults.status}</p>
      <p><strong>Equity:</strong> {runtimeStats.Equity}</p>
      <p><strong>Fees:</strong> {runtimeStats.Fees}</p>
      <p><strong>Net Profit:</strong> {runtimeStats["Net Profit"]}</p>
      <p><strong>Return:</strong> {runtimeStats.Return}</p>
      <p><strong>Unrealized P/L:</strong> {runtimeStats.Unrealized}</p>
    </div>
  );
};

export default LiveResults;