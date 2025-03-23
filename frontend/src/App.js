// src/App.js
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver', 'win'
  
  // Canvas size
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // Player properties
  const [player, setPlayer] = useState({
    x: 100,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 15,
    color: '#36f9f6', // Bright cyan like n-gon
    grounded: false,
    jumping: false
  });
  
  // Platforms
  const [platforms, setPlatforms] = useState([
    { x: 0, y: 550, width: canvasSize.width, height: 50, color: '#444' },
    { x: 200, y: 450, width: 200, height: 20, color: '#444' },
    { x: 500, y: 350, width: 200, height: 20, color: '#444' },
    { x: 100, y: 250, width: 200, height: 20, color: '#444' }
  ]);
  
  // Doors
  const [doors, setDoors] = useState({
    start: { x: 50, y: 480, width: 40, height: 70, color: '#2ecc71' },
    end: { x: canvasSize.width - 90, y: 280, width: 40, height: 70, color: '#e74c3c' }
  });
  
  // Drones
  const [drones, setDrones] = useState([
    { id: 1, x: 300, y: 200, vx: 1, vy: 0, radius: 12, color: '#f55', type: 'patroller', timer: 0 },
    { id: 2, x: 600, y: 100, vx: 0, vy: 1, radius: 12, color: '#f5f', type: 'shooter', timer: 0, shootTimer: 0 },
    { id: 3, x: 500, y: 300, vx: 1, vy: 0, radius: 12, color: '#ff5', type: 'chaser', timer: 0 }
  ]);
  
  // Projectiles
  const [projectiles, setProjectiles] = useState([]);
  
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
  
  // Physics constants
  const gravity = 0.5;
  const friction = 0.8;
  const jumpForce = -12;
  const moveSpeed = 5;
  
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
      
      // Update platforms and doors when canvas size changes
      setPlatforms(prev => [
        { ...prev[0], width: width }, // Ground
        prev[1], 
        prev[2], 
        prev[3]
      ]);
      
      setDoors(prev => ({
        start: prev.start,
        end: { ...prev.end, x: width - 90 }
      }));
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
            // Start game
            setGameState('playing');
            resetGame();
          } else if (gameState === 'gameOver' || gameState === 'win') {
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
  }, [gameState]);
  
  // Reset game
  const resetGame = () => {
    setPlayer({
      x: doors.start.x + doors.start.width / 2,
      y: doors.start.y - 20,
      vx: 0,
      vy: 0,
      radius: 15,
      color: '#36f9f6',
      grounded: false,
      jumping: false
    });
    
    setDrones([
      { id: 1, x: 300, y: 200, vx: 1, vy: 0, radius: 12, color: '#f55', type: 'patroller', timer: 0 },
      { id: 2, x: 600, y: 100, vx: 0, vy: 1, radius: 12, color: '#f5f', type: 'shooter', timer: 0, shootTimer: 0 },
      { id: 3, x: 500, y: 300, vx: 1, vy: 0, radius: 12, color: '#ff5', type: 'chaser', timer: 0 }
    ]);
    
    setProjectiles([]);
    setHealth(100);
  };
  
  // Collision detection utility
  const checkCollision = (circle, rect) => {
    // Find the closest point to the circle within the rectangle
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate the distance between the circle's center and the closest point
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    
    // If the distance is less than the circle's radius, an intersection occurs
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared < circle.radius * circle.radius;
  };
  
  // Circle-Circle collision
  const checkCircleCollision = (circle1, circle2) => {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  };
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let animationFrameId;
    let lastTime = 0;
    
    const gameLoop = (time) => {
      if (gameState !== 'playing') return;
      
      // Delta time in seconds
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      
      // Update player
      setPlayer(prevPlayer => {
        let newPlayer = { ...prevPlayer };
        
        // Apply gravity
        newPlayer.vy += gravity;
        
        // Apply horizontal movement
        if (keys.left) {
          newPlayer.vx = -moveSpeed;
        } else if (keys.right) {
          newPlayer.vx = moveSpeed;
        } else {
          newPlayer.vx *= friction;
        }
        
        // Apply jump
        if (keys.up && newPlayer.grounded && !newPlayer.jumping) {
          newPlayer.vy = jumpForce;
          newPlayer.grounded = false;
          newPlayer.jumping = true;
        }
        
        // Update position
        newPlayer.x += newPlayer.vx;
        newPlayer.y += newPlayer.vy;
        
        // Check platform collisions
        newPlayer.grounded = false;
        
        for (const platform of platforms) {
          if (checkCollision(newPlayer, platform)) {
            // Collision response
            const closestX = Math.max(platform.x, Math.min(newPlayer.x, platform.x + platform.width));
            const closestY = Math.max(platform.y, Math.min(newPlayer.y, platform.y + platform.height));
            
            const distanceX = newPlayer.x - closestX;
            const distanceY = newPlayer.y - closestY;
            
            // Determine collision direction
            if (Math.abs(distanceX) > Math.abs(distanceY)) {
              // Horizontal collision
              if (distanceX > 0) {
                newPlayer.x = platform.x + platform.width + newPlayer.radius;
              } else {
                newPlayer.x = platform.x - newPlayer.radius;
              }
              newPlayer.vx = 0;
            } else {
              // Vertical collision
              if (distanceY > 0) {
                newPlayer.y = platform.y + platform.height + newPlayer.radius;
                newPlayer.vy = 0;
              } else {
                newPlayer.y = platform.y - newPlayer.radius;
                newPlayer.vy = 0;
                newPlayer.grounded = true;
                newPlayer.jumping = false;
              }
            }
          }
        }
        
        // Keep player within bounds
        if (newPlayer.x - newPlayer.radius < 0) {
          newPlayer.x = newPlayer.radius;
          newPlayer.vx = 0;
        } else if (newPlayer.x + newPlayer.radius > canvasSize.width) {
          newPlayer.x = canvasSize.width - newPlayer.radius;
          newPlayer.vx = 0;
        }
        
        if (newPlayer.y - newPlayer.radius < 0) {
          newPlayer.y = newPlayer.radius;
          newPlayer.vy = 0;
        } else if (newPlayer.y + newPlayer.radius > canvasSize.height) {
          newPlayer.y = canvasSize.height - newPlayer.radius;
          newPlayer.vy = 0;
          newPlayer.grounded = true;
          newPlayer.jumping = false;
        }
        
        // Check if player reached end door
        if (checkCollision(newPlayer, doors.end)) {
          setGameState('win');
        }
        
        return newPlayer;
      });
      
      // Update drones
      setDrones(prevDrones => {
        return prevDrones.map(drone => {
          const newDrone = { ...drone };
          newDrone.timer += 1;
          
          // Different behavior based on drone type
          switch (newDrone.type) {
            case 'patroller':
              // Patrol back and forth
              if (newDrone.timer > 100) {
                newDrone.vx *= -1;
                newDrone.timer = 0;
              }
              break;
            
            case 'chaser':
              // Chase player
              const dx = player.x - newDrone.x;
              const dy = player.y - newDrone.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < 200) {
                newDrone.vx = dx / dist * 2;
                newDrone.vy = dy / dist * 2;
              } else {
                // Random movement when player is far
                if (newDrone.timer > 50) {
                  newDrone.vx = (Math.random() - 0.5) * 2;
                  newDrone.vy = (Math.random() - 0.5) * 2;
                  newDrone.timer = 0;
                }
              }
              break;
            
            case 'shooter':
              // Shoot at player periodically
              newDrone.shootTimer = (newDrone.shootTimer || 0) + 1;
              
              if (newDrone.shootTimer > 60) {
                newDrone.shootTimer = 0;
                
                // Create projectile
                const dx = player.x - newDrone.x;
                const dy = player.y - newDrone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 300) {
                  setProjectiles(prev => [
                    ...prev,
                    {
                      x: newDrone.x,
                      y: newDrone.y,
                      vx: dx / dist * 5,
                      vy: dy / dist * 5,
                      radius: 5,
                      color: '#ff0',
                      timer: 0
                    }
                  ]);
                }
              }
              
              // Move randomly
              if (newDrone.timer > 30) {
                newDrone.vx = (Math.random() - 0.5) * 2;
                newDrone.vy = (Math.random() - 0.5) * 2;
                newDrone.timer = 0;
              }
              break;
            
            default:
              break;
          }
          
          // Apply movement
          newDrone.x += newDrone.vx;
          newDrone.y += newDrone.vy;
          
          // Keep drones within bounds
          if (newDrone.x - newDrone.radius < 0) {
            newDrone.x = newDrone.radius;
            newDrone.vx *= -1;
          } else if (newDrone.x + newDrone.radius > canvasSize.width) {
            newDrone.x = canvasSize.width - newDrone.radius;
            newDrone.vx *= -1;
          }
          
          if (newDrone.y - newDrone.radius < 0) {
            newDrone.y = newDrone.radius;
            newDrone.vy *= -1;
          } else if (newDrone.y + newDrone.radius > canvasSize.height) {
            newDrone.y = canvasSize.height - newDrone.radius;
            newDrone.vy *= -1;
          }
          
          // Check collision with player
          if (checkCircleCollision(newDrone, player)) {
            setHealth(prev => {
              const newHealth = prev - 5;
              if (newHealth <= 0) {
                setGameState('gameOver');
                return 0;
              }
              return newHealth;
            });
          }
          
          // Collision with platforms
          for (const platform of platforms) {
            if (checkCollision(newDrone, platform)) {
              // Simple bounce behavior
              if (Math.abs(newDrone.vx) > Math.abs(newDrone.vy)) {
                newDrone.vx *= -1;
              } else {
                newDrone.vy *= -1;
              }
            }
          }
          
          return newDrone;
        });
      });
      
      // Update projectiles
      setProjectiles(prevProjectiles => {
        const updatedProjectiles = prevProjectiles.map(projectile => {
          const newProjectile = { ...projectile };
          
          // Move projectile
          newProjectile.x += newProjectile.vx;
          newProjectile.y += newProjectile.vy;
          
          // Increase timer
          newProjectile.timer += 1;
          
          return newProjectile;
        });
        
        // Remove projectiles that are out of bounds or too old
        const filteredProjectiles = updatedProjectiles.filter(projectile => {
          // Remove if out of bounds
          if (
            projectile.x < -projectile.radius ||
            projectile.x > canvasSize.width + projectile.radius ||
            projectile.y < -projectile.radius ||
            projectile.y > canvasSize.height + projectile.radius ||
            projectile.timer > 120
          ) {
            return false;
          }
          
          // Check collision with player
          if (checkCircleCollision(projectile, player)) {
            setHealth(prev => {
              const newHealth = prev - 10;
              if (newHealth <= 0) {
                setGameState('gameOver');
                return 0;
              }
              return newHealth;
            });
            return false;
          }
          
          // Check collision with platforms
          for (const platform of platforms) {
            if (checkCollision(projectile, platform)) {
              return false;
            }
          }
          
          return true;
        });
        
        return filteredProjectiles;
      });
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, keys, player, platforms, doors, canvasSize.width, canvasSize.height, gravity, friction, jumpForce, moveSpeed]);
  
  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw based on game state
    if (gameState === 'menu') {
      // Draw title
      ctx.fillStyle = '#36f9f6'; // Bright cyan
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('DODGEBALL', canvas.width / 2, canvas.height / 3);
      
      // Draw instructions
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
      
      ctx.font = '18px Arial';
      ctx.fillText('Use ARROW KEYS or WASD to move', canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText('Reach the red door to win', canvas.width / 2, canvas.height / 2 + 70);
    } else if (gameState === 'playing' || gameState === 'gameOver' || gameState === 'win') {
      // Draw platforms
      platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      });
      
      // Draw doors
      ctx.fillStyle = doors.start.color;
      ctx.fillRect(doors.start.x, doors.start.y, doors.start.width, doors.start.height);
      
      ctx.fillStyle = doors.end.color;
      ctx.fillRect(doors.end.x, doors.end.y, doors.end.width, doors.end.height);
      
      // Draw projectiles
      projectiles.forEach(projectile => {
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw drones
      drones.forEach(drone => {
        // Draw drone body
        ctx.fillStyle = drone.color;
        ctx.beginPath();
        ctx.arc(drone.x, drone.y, drone.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add detail based on drone type
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        
        if (drone.type === 'shooter') {
          // Draw shooter detail
          ctx.beginPath();
          ctx.arc(drone.x, drone.y, drone.radius * 0.7, 0, Math.PI * 2);
          ctx.stroke();
        } else if (drone.type === 'chaser') {
          // Draw chaser detail
          const angle = Math.atan2(player.y - drone.y, player.x - drone.x);
          ctx.beginPath();
          ctx.moveTo(drone.x, drone.y);
          ctx.lineTo(
            drone.x + Math.cos(angle) * drone.radius,
            drone.y + Math.sin(angle) * drone.radius
          );
          ctx.stroke();
        } else if (drone.type === 'patroller') {
          // Draw patroller detail - hexagon shape
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x = drone.x + Math.cos(angle) * (drone.radius * 0.7);
            const y = drone.y + Math.sin(angle) * (drone.radius * 0.7);
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.stroke();
        }
      });
      
      // Draw player
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add detail to player
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      
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
      } else if (gameState === 'win') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE!', canvas.width / 2, canvas.height / 3);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to Play Again', canvas.width / 2, canvas.height / 2);
      }
    }
  }, [gameState, platforms, doors, player, drones, projectiles, health, canvasSize.width, canvasSize.height]);
  
  return (
    <div style={{ 
      color: 'white', 
      backgroundColor: '#111', 
      padding: '20px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <header>
        <h1 style={{ color: '#36f9f6', margin: '0 0 20px 0', fontFamily: 'monospace' }}>DODGEBALL</h1>
      </header>
      
      <main>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            backgroundColor: '#111',
            borderRadius: '5px',
            boxShadow: '0 0 20px rgba(54, 249, 246, 0.3)' // Cyan glow
          }}
        />
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button 
            style={{
              padding: '8px 15px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#36f9f6',
              color: '#111',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
            onClick={() => {
              setGameState('playing');
              resetGame();
            }}
          >
            START GAME
          </button>
        </div>
      </main>
      
      <footer style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '20px', fontFamily: 'monospace' }}>
        <p>Use arrow keys or WASD to move and jump. Reach the red door to win.</p>
      </footer>
    </div>
  );
}

export default App;