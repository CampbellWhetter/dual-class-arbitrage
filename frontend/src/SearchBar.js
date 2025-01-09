import React, { useState, useEffect, useRef } from "react";

/**
 * SearchBar Component
 * @param {object} options - List of options for suggestions, where keys represent search terms.
 * @param {function} onSearch - Callback function triggered when a suggestion is selected.
 */
const SearchBar = ({ options, onSearch }) => {
  // State to track the current input query
  const [query, setQuery] = useState("");
  
  // State to store the filtered suggestions
  const [suggestions, setSuggestions] = useState([]);
  
  // Ref to track the input box for detecting clicks outside
  const inputRef = useRef(null);

  /**
   * Updates the suggestions based on the input query.
   * Filters options to include only those matching the query and limits to 4 suggestions.
   */
  const handleInputChange = (e) => {
    const value = e.target.value; // Get the current input value
    setQuery(value);

    if (value) {
      // Filter options matching the query (case-insensitive) and limit results
      const filteredSuggestions = Object.keys(options)
        .filter((key) => key.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 4); // Limit to 4 suggestions
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]); // Clear suggestions if the input is empty
    }
  };

  /**
   * Handles the click event on a suggestion.
   * Updates the query, clears suggestions, and triggers the `onSearch` callback.
   */
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion); // Set the input to the selected suggestion
    setSuggestions([]); // Clear the suggestions
    onSearch(suggestion); // Trigger the search callback with the selected suggestion
    setQuery(""); // Clear the input field
  };

  /**
   * Hides suggestions and clears the input field when clicking outside the component.
   */
  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setSuggestions([]); // Hide suggestions
      setQuery(""); // Clear the input field
    }
  };

  /**
   * Adds an event listener to detect clicks outside the input box.
   * Cleans up the event listener when the component is unmounted.
   */
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
      {/* Input field for entering the search query */}
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
          outline: "none",
          margin: "0 auto",
        }}
      />
      
      {/* Display the list of suggestions if available */}
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
              onClick={() => handleSuggestionClick(suggestion)} // Triggered on suggestion click
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #333",
                color: "white",
                textAlign: "left",
              }}
              // Add hover effects to suggestions
              onMouseEnter={(e) => {
                e.target.style.textDecoration = "underline";
                e.target.style.backgroundColor = "#333";
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = "none";
                e.target.style.backgroundColor = "black";
              }}
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