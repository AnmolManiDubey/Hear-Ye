import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    // Fetch the current time from the Flask backend
    fetch('/time')
      .then((res) => res.json())
      .then((data) => setCurrentTime(data.time))
      .catch((err) => console.error('Error fetching time:', err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Transer Project Demo</h1>
        {currentTime ? (
          <p>Current time from Flask API: {currentTime}</p>
        ) : (
          <p>Loading...</p>
        )}
      </header>
    </div>
  );
}

export default App;
