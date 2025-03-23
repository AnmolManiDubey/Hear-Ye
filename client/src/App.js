import React from 'react';
import AudioProcessor from './AudioProcessor';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hear-Ye</h1>
      </header>
      <main>
        <AudioProcessor />
      </main>
    </div>
  );
}

export default App;
