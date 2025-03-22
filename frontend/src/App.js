// src/App.js
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver'
  
  // Canvas size
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // Player position
  const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 });
  
  // Drones
  const [drones, setDrones] = useState([
    { id: 1, x: 200, y: 100, radius: 12 },
    { id: 2, x: 600, y: 100, radius: 12 },
    { id: 3, x: 300, y: 500, radius: 12 }
  ]);
  
  // Health
  const [health, setHealth] = useState(100);
  
  // Key states
  const [keys, setKeys] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
  });
  
  // Handle canvas resize based on window size
  useEffect(() => {
    const handleResize = () => {
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
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch(event.key) {
        case 'ArrowUp':
        case 'w':
          setKeys(prev => ({ ...prev, up: true }));
          break;
        case 'ArrowDown':
        case 's':
          setKeys(prev => ({ ...prev, down: true }));
          break;
        case 'ArrowLeft':
        case 'a':
          setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
        case 'd':
          setKeys(prev => ({ ...prev, right: true }));
          break;
        case ' ': // Space
          setKeys(prev => ({ ...prev, space: true }));
          
          if (gameState === 'menu') {
            setGameState('playing');
            // Reset game
            setPlayerPos({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
            setHealth(100);
          } else if (gameState === 'gameOver') {
            setGameState('menu');
          }
          break;
        default:
          break;
      }
    };
    
    const handleKeyUp = (event) => {
      switch(event.key) {
        case 'ArrowUp':
        case 'w':
          setKeys(prev => ({ ...prev, up: false }));
          break;
        case 'ArrowDown':
        case 's':
          setKeys(prev => ({ ...prev, down: false }));
          break;
        case 'ArrowLeft':
        case 'a':
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
        case 'd':
          setKeys(prev => ({ ...prev, right: false }));
          break;
        case ' ': // Space
          setKeys(prev => ({ ...prev, space: false }));
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, canvasSize.width, canvasSize.height]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let lastTime = 0;
    const playerSpeed = 5;
    const playerRadius = 15;
    
    // Update player position based on keys
    const updatePlayerPosition = () => {
      let dx = 0;
      let dy = 0;
      
      if (keys.up) dy -= playerSpeed;
      if (keys.down) dy += playerSpeed;
      if (keys.left) dx -= playerSpeed;
      if (keys.right) dx += playerSpeed;
      
      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2);
        dx *= factor;
        dy *= factor;
      }
      
      // Update position
      let newX = playerPos.x + dx;
      let newY = playerPos.y + dy;
      
      // Keep player within bounds
      newX = Math.max(playerRadius, Math.min(canvasSize.width - playerRadius, newX));
      newY = Math.max(playerRadius, Math.min(canvasSize.height - playerRadius, newY));
      
      setPlayerPos({ x: newX, y: newY });
    };
    
    // Update drones
    const updateDrones = () => {
      setDrones(prevDrones => {
        return prevDrones.map(drone => {
          // Random movement
          const dx = (Math.random() - 0.5) * 3;
          const dy = (Math.random() - 0.5) * 3;
          
          // Update position
          let newX = drone.x + dx;
          let newY = drone.y + dy;
          
          // Keep drone within bounds
          newX = Math.max(drone.radius, Math.min(canvasSize.width - drone.radius, newX));
          newY = Math.max(drone.radius, Math.min(canvasSize.height - drone.radius, newY));
          
          // Check collision with player
          const distance = Math.sqrt(
            Math.pow(newX - playerPos.x, 2) + 
            Math.pow(newY - playerPos.y, 2)
          );
          
          if (distance < playerRadius + drone.radius) {
            // Collision - decrease health
            setHealth(prev => {
              const newHealth = prev - 0.5;
              
              // Game over if health reaches 0
              if (newHealth <= 0) {
                setGameState('gameOver');
                return 0;
              }
              
              return newHealth;
            });
            
            // Push drone away
            const angle = Math.atan2(newY - playerPos.y, newX - playerPos.x);
            newX = playerPos.x + Math.cos(angle) * (playerRadius + drone.radius + 5);
            newY = playerPos.y + Math.sin(angle) * (playerRadius + drone.radius + 5);
          }
          
          return { ...drone, x: newX, y: newY };
        });
      });
    };
    
    // Animation frame callback
    const gameLoop = (time) => {
      if (gameState !== 'playing') return;
      
      // Calculate delta time
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Update game state
      updatePlayerPosition();
      updateDrones();
      
      // Request next frame
      requestRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Start game loop
    const requestRef = { current: null };
    requestRef.current = requestAnimationFrame(gameLoop);
    
    // Clean up
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, keys, playerPos, canvasSize.width, canvasSize.height]);
  
  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw based on game state
    if (gameState === 'menu') {
      // Draw menu
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('DODGEBALL', canvas.width / 2, canvas.height / 3);
      
      ctx.font = '24px Arial';
      ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
      
      ctx.font = '18px Arial';
      ctx.fillText('Use ARROW KEYS or WASD to move', canvas.width / 2, canvas.height * 2 / 3);
    } else if (gameState === 'playing' || gameState === 'gameOver') {
      // Draw player
      ctx.fillStyle = '#4287f5';
      ctx.beginPath();
      ctx.arc(playerPos.x, playerPos.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Add details to player
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(playerPos.x, playerPos.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw drones
      drones.forEach(drone => {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(drone.x, drone.y, drone.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add details
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Draw health bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(20, 20, 200, 20);
      
      ctx.fillStyle = health > 50 ? '#2ecc71' : health > 25 ? '#f1c40f' : '#e74c3c';
      ctx.fillRect(20, 20, health * 2, 20);
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 200, 20);
      
      // Health text
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Health: ${Math.floor(health)}%`, 25, 36);
      
      // Game over overlay
      if (gameState === 'gameOver') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 3);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to Restart', canvas.width / 2, canvas.height / 2);
      }
    }
  }, [gameState, playerPos, drones, health, canvasSize.width, canvasSize.height]);
  
  return (
    <div style={{ 
      color: 'white', 
      backgroundColor: '#222', 
      padding: '20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <header>
        <h1 style={{ color: '#f1c40f', margin: '0 0 20px 0' }}>Dodgeball</h1>
      </header>
      
      <main>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            backgroundColor: '#000',
            borderRadius: '5px',
            boxShadow: '0 0 20px rgba(241, 196, 15, 0.3)'
          }}
        />
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button 
            style={{
              padding: '8px 15px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#3498db',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setGameState('playing')}
          >
            Start Game
          </button>
          
          <button
            style={{
              padding: '8px 15px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#3498db',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Toggle Music
          </button>
        </div>
      </main>
      
      <footer style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '20px' }}>
        <p>Use arrow keys or WASD to move. Space to start.</p>
      </footer>
    </div>
  );
}

export default App;