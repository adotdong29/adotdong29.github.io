// src/components/GameControls.js
import React from 'react';

const GameControls = ({ audioManager }) => {
  if (!audioManager) {
    return null;
  }

  return (
    <div className="game-controls">
      <button 
        onClick={audioManager.toggleMusic}
        className={`control-button ${audioManager.musicEnabled ? 'active' : 'inactive'}`}
      >
        {audioManager.musicEnabled ? 'Mute Music' : 'Enable Music'}
      </button>
      
      <button 
        onClick={audioManager.toggleSound}
        className={`control-button ${audioManager.soundEnabled ? 'active' : 'inactive'}`}
      >
        {audioManager.soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
      </button>
    </div>
  );
};

export default GameControls;