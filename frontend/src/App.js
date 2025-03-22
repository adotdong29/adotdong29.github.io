// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import GameControls from './components/GameControls';
import useGameInput from './hooks/useGameInput';
import AudioManager from './components/AudioManager';
import './styles/App.css';

function App() {
  const [audioManagerInstance, setAudioManagerInstance] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // Set up game input
  useGameInput();
  
  // Initialize audio manager
  useEffect(() => {
    const manager = AudioManager();
    setAudioManagerInstance(manager);
  }, []);
  
  // Adjust canvas size based on window size
  useEffect(() => {
    const handleResize = () => {
      // Limit canvas size to window size
      const maxWidth = Math.min(window.innerWidth - 40, 1200);
      const maxHeight = Math.min(window.innerHeight - 100, 800);
      
      // Maintain aspect ratio
      const aspectRatio = 4 / 3;
      let width = maxWidth;
      let height = width / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      setCanvasSize({ width, height });
    };
    
    // Set initial size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Dodgeball</h1>
      </header>
      
      <main className="app-main">
        <GameCanvas 
          width={canvasSize.width} 
          height={canvasSize.height} 
          audioManager={audioManagerInstance} 
        />
        
        {audioManagerInstance && (
          <GameControls audioManager={audioManagerInstance} />
        )}
      </main>
      
      <footer className="app-footer">
        <p>Use arrow keys or WASD to move. Avoid or destroy geometric shapes.</p>
      </footer>
    </div>
  );
}

export default App;