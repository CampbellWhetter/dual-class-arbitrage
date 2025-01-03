import React, { useState, useEffect } from "react";
import "./TradingSimulator.css"

const TradingSimulator = () => {
  const [liveResults, setLiveResults] = useState(null);

  useEffect(() => {
    const fetchLiveResults = async () => {
      try {
        const response = await fetch("http://dual-c-publi-oulplybbu57e-835307635.ca-central-1.elb.amazonaws.com/api/live-results");
        const data = await response.json();
        setLiveResults(data);
      } catch (error) {
        console.error("Error fetching live results:", error);
      }
    };

    fetchLiveResults();
    const interval = setInterval(fetchLiveResults, 60000); // Refresh every minute
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  if (!liveResults) return <div style={{ color: "white" }}>Loading live results...</div>;

  const runtimeStats = liveResults.runtimeStatistics || {};
  return (
    <div class="text">
      <h2>Live Results</h2>
      <p><strong>Status:</strong> {liveResults.status}</p>
      <p><strong>Equity:</strong> {runtimeStats.Equity}</p>
      <p><strong>Return:</strong> {runtimeStats.Return}</p>
      <p><strong>Net Profit:</strong> {runtimeStats["Net Profit"]}</p>
      <p><strong>Unrealized P/L:</strong> {runtimeStats.Unrealized}</p>
    </div>
  );
};

export default TradingSimulator;