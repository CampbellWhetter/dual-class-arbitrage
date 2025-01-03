import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Popup from "./Popup";
import "./App.css";

// Dual-class stock data
const dualClassStocks = {
  "Alphabet": ["GOOGL", "GOOG"],
  "American Homes 4 Rent": ["AMH", "AMH-PG"],
  "Berkshire Hathaway": ["BRK-B", "BRK-A"],
  "Crawford & Company": ["CRD-A", "CRD-B"],
  "Gray Television": ["GTN", "GTN-A"], 
  "Haverty Furniture Companies": ["HVT", "HVT-A"],
  "Moog": ["MOG-A", "MOG-B"]
};

const HomePage = () => {
  const [stockData, setStockData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [popupStrategy, setPopupStrategy] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchTradingStrategy = (query, amount, updatePopup = false) => {
    const tickers = dualClassStocks[query];
    if (!tickers || tickers.length === 0) {
      console.error("No tickers found for the selected company.");
      return;
    }

    fetch("http://dual-c-publi-oulplybbu57e-835307635.ca-central-1.elb.amazonaws.com/api/trading-strategy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ security_name: query, investment_amount: amount }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (updatePopup) {
          setPopupStrategy(data);
        } else {
          setStockData(data);
          setPopupStrategy(data);
        }
        console.log("Trading Strategy:", data);
      })
      .catch((error) =>
        console.error("Error fetching trading strategy:", error)
      );
  };

  const handleSearch = (query) => {
    setSelectedCompany(query);
    fetchTradingStrategy(query, investmentAmount);
  };

  const handleInvestmentChange = (amount) => {
    setInvestmentAmount(amount);
    if (selectedCompany) {
      fetchTradingStrategy(selectedCompany, amount, true);
    }
  };

  return (
    <div>
      <SearchBar options={dualClassStocks} onSearch={handleSearch} />
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
      <Popup trigger={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
        <h2>Enter Investment Amount:</h2>
        <input
          onMouseEnter={(e) => (e.target.style.textDecoration = "none", e.target.style.borderColor = "black")}
          className="amount"
          type="number"
          value={investmentAmount}
          onChange={(e) => handleInvestmentChange(Number(e.target.value))}
        />
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

export default HomePage;