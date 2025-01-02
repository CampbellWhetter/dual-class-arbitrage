import React, { useState, useEffect, useRef } from "react";
import "./SearchBar.css";

const SearchBar = ({ options, onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Filter suggestions based on input and limit to 4 suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value) {
      const filteredSuggestions = Object.keys(options)
        .filter((key) => key.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 4); // Limit to 4 suggestions
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion); // Set input to the selected suggestion
    setSuggestions([]); // Hide suggestions
    onSearch(suggestion); // Trigger search
    setQuery(""); // Clear the text box
  };

  // Close suggestions when clicking outside the input box
  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setSuggestions([]);
      setQuery(""); // Clear the text box
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={inputRef}
      style={{ position: "relative", margin: "0 auto", textAlign: "center" }}
    >
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
        style={{
          fontFamily: "DM Sans",
          color: "white",
          width: "300px",
          padding: "10px",
          fontSize: "16px",
          backgroundColor: "black",
          border: "2px solid white",
          borderRadius: "10px 10px 0 0",
          outline: "none", // Removes the blue border
          margin: "0 auto",
        }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
            border: "2px solid white",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            backgroundColor: "black",
            listStyle: "none",
            margin: 0,
            padding: 0,
            zIndex: 1000,
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #333",
                color: "white",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.target.style.textDecoration = "underline", e.target.style.backgroundColor = "#333")}
              onMouseLeave={(e) => (e.target.style.textDecoration = "none", e.target.style.backgroundColor = "black")}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;