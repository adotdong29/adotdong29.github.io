// frontend/src/components/GameCanvas.js
import React, { useRef, useEffect } from 'react';
import useGameLoop from '../hooks/useGameLoop';
import wasmModule from '../wasm/wasmModule';

// Game states
const GAME_STATE = {
  MENU: 0,
  PLAYING: 1,
  GAME_OVER: 2
};

// Entity types
const ENTITY_TYPE = {
  PLAYER: 0,
  DRONE: 1,
  PROJECTILE: 2,
  POWERUP: 3
};

const GameCanvas = ({ width, height, audioManager }) => {
  const canvasRef = useRef(null);
  
  // Initialize WebAssembly module
  useEffect(() => {
    const initWasm = async () => {
      await wasmModule.init();
    };
    
    initWasm();
  }, []);
  
  // Render function for the game
  const renderGame = (ctx, entities, gameState) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (gameState === GAME_STATE.MENU) {
      renderMenu(ctx);
      return;
    }
    
    if (gameState === GAME_STATE.GAME_OVER) {
      renderGameOver(ctx);
      return;
    }
    
    // Render all entities
    entities.forEach(entity => {
      switch (entity.type) {
        case ENTITY_TYPE.PLAYER:
          renderPlayer(ctx, entity);
          break;
        case ENTITY_TYPE.DRONE:
          renderDrone(ctx, entity);
          break;
        case ENTITY_TYPE.PROJECTILE:
          renderProjectile(ctx, entity);
          break;
        case ENTITY_TYPE.POWERUP:
          renderPowerup(ctx, entity);
          break;
        default:
          break;
      }
    });
    
    // Render UI
    renderUI(ctx);
  };
  
  // Render player
  const renderPlayer = (ctx, entity) => {
    ctx.fillStyle = '#4287f5';
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add details to player
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  };
  
  // Render drone
  const renderDrone = (ctx, entity) => {
    ctx.fillStyle = '#e74c3c';
    
    // Draw hexagon shape for drones
    ctx.beginPath();
    const sides = 6;
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) + Math.PI / 6;
      const x = entity.x + entity.radius * Math.cos(angle);
      const y = entity.y + entity.radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Add details
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  };
  
  // Render projectile
  const renderProjectile = (ctx, entity) => {
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Render powerup
  const renderPowerup = (ctx, entity) => {
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.rect(entity.x - entity.radius, entity.y - entity.radius, entity.radius * 2, entity.radius * 2);
    ctx.fill();
  };
  
  // Render UI
  const renderUI = (ctx) => {
    // Health bar
    const health = wasmModule.getPlayerHealth();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 20, 200, 20);
    
    ctx.fillStyle = health > 50 ? '#2ecc71' : health > 25 ? '#f1c40f' : '#e74c3c';
    ctx.fillRect(20, 20, health * 2, 20);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 200, 20);
    
    // Health text
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`Health: ${Math.floor(health)}%`, 25, 36);
  };
  
  // Render menu
  const renderMenu = (ctx) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DODGEBALL', width / 2, height / 3);
    
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to Start', width / 2, height / 2);
    
    ctx.font = '18px Arial';
    ctx.fillText('Use ARROW KEYS or WASD to move', width / 2, height * 2 / 3);
  };
  
  // Render game over
  const renderGameOver = (ctx) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', width / 2, height / 3);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to Restart', width / 2, height / 2);
  };
  
  // Game loop frame callback
  const frameCallback = (entities, gameState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    renderGame(ctx, entities, gameState);
    
    // Play sounds based on game events
    if (audioManager && audioManager.initialized) {
      // Example: play collision sound when player is hit
      // This would need to be triggered by game events from WebAssembly
    }
  };
  
  // Set up game loop
  useGameLoop(frameCallback);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid black' }}
    />
  );
};

export default GameCanvas;
