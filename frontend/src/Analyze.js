import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Popup from "./Popup"; 
import "./App.css";

// Define dual-class stocks
const dualClassStocks = {
  "Alphabet": ["GOOGL", "GOOG"],
  "American Homes 4 Rent": ["AMH", "AMH-PG"],
  "Berkshire Hathaway": ["BRK-B", "BRK-A"],
  "Crawford & Company": ["CRD-A", "CRD-B"],
  "Gray Television": ["GTN", "GTN-A"], 
  "Haverty Furniture Companies": ["HVT", "HVT-A"],
  "Moog": ["MOG-A", "MOG-B"]
};

const Analyze = () => {
  // State variables to manage app state
  const [stockData, setStockData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [popupStrategy, setPopupStrategy] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Fetches trading strategy from the backend for a given company and investment amount
  const fetchTradingStrategy = (query, amount, updatePopup = false) => {
    const tickers = dualClassStocks[query];
    if (!tickers || tickers.length === 0) {
      console.error("No tickers found for the selected company.");
      return;
    }

    fetch(`/api/trading-strategy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ security_name: query, investment_amount: amount }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (updatePopup) {
          setPopupStrategy(data); // Update only the popup strategy
        } else {
          setStockData(data); // Update main stock data and popup strategy
          setPopupStrategy(data);
        }
        console.log("Trading Strategy:", data);
      })
      .catch((error) =>
        console.error("Error fetching trading strategy:", error)
      );
  };

  // Handles search input and fetches trading strategy for the selected company
  const handleSearch = (query) => {
    setSelectedCompany(query);
    fetchTradingStrategy(query, investmentAmount);
  };

  // Updates investment amount and fetches updated strategy if a company is selected
  const handleInvestmentChange = (amount) => {
    setInvestmentAmount(amount);
    if (selectedCompany) {
      fetchTradingStrategy(selectedCompany, amount, true);
    }
  };

  return (
    <div>
      {/* Search bar for selecting a company */}
      <SearchBar options={dualClassStocks} onSearch={handleSearch} />

      {/* Displays stock data and a button to calculate strategy */}
      {stockData && (
        <div className="info">
          <h2>Key Info</h2>
          <p>
            <strong>{stockData.strategy.ticker_long} Price:</strong> ${stockData.strategy.price_long?.toFixed(2) || "N/A"}
          </p>
          <p>
            <strong>{stockData.strategy.ticker_short} Price:</strong> ${stockData.strategy.price_short?.toFixed(2) || "N/A"}
          </p>
          <p>
            <strong>Spread:</strong> ${stockData.spread?.toFixed(2) || "N/A"}
          </p>
          <button type="button" onClick={() => setIsPopupOpen(true)}>
            <strong>Calculate Strategy</strong>
          </button>
        </div>
      )}

      {/* Popup for entering investment amount and displaying trading strategy */}
      <Popup trigger={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
        <h2>Enter Investment Amount:</h2>
        <input
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "none";
            e.target.style.borderColor = "black";
          }}
          onBlur={(e) => {
            // Reset to default if left empty
            if (e.target.value.trim() === "") {
              handleInvestmentChange(1000);
            }
          }}
          onKeyDown={(e) => {
            // Prevent leading zeros
            if (e.target.value.startsWith("0") && e.key !== "Backspace" && e.key !== ".") {
              e.target.value = e.target.value.replace(/^0+/, "");
            }
          }}
          className="amount"
          type="number"
          value={investmentAmount}
          onChange={(e) => handleInvestmentChange(Number(e.target.value))}
        />

        {/* Displays trading strategy details in the popup */}
        {popupStrategy && (
          <div style={{ marginTop: "20px" }}>
            <h3>Trading Strategy</h3>
            <p>
              <strong>Long:</strong> {popupStrategy.strategy.ticker_long}
            </p>
            <p>
              <strong>Short:</strong> {popupStrategy.strategy.ticker_short}
            </p>
            <p>
              <strong>Shares to Long:</strong> {popupStrategy.strategy.shares_long}
            </p>
            <p>
              <strong>Shares to Short:</strong> {popupStrategy.strategy.shares_short}
            </p>
            <p>
              <strong>Total Long Value:</strong> ${(popupStrategy.strategy.price_long * popupStrategy.strategy.shares_long).toFixed(2)}
            </p>
            <p>
              <strong>Total Short Value:</strong> ${(popupStrategy.strategy.price_short * popupStrategy.strategy.shares_short).toFixed(2)}
            </p>
            <p>
              <strong>Hedge Ratio:</strong> {popupStrategy.strategy.hedge_ratio?.toFixed(2) || "N/A"}
            </p>
          </div>
        )}
      </Popup>
    </div>
  );
};

export default Analyze;