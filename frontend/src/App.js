// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './styles/App.css';

function App() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver', 'win'
  
  // Add a level state to track current level
  const [currentLevel, setCurrentLevel] = useState(0);
  
  // Camera/viewport settings
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  
  // World size - much larger than viewport
  const worldSize = { width: 3000, height: 2000 };
  
  // Canvas/viewport size
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  
  // Player properties
  const [player, setPlayer] = useState({
    x: 100,
    y: 700,
    vx: 0,
    vy: 0,
    radius: 15,
    color: '#36f9f6', // Bright cyan like n-gon
    grounded: false,
    jumping: false
  });
  
  // Mouse state for shield
  const [mouse, setMouse] = useState({
    down: false,
    x: 0,
    y: 0
  });
  
  // Energy for shield - depletes when holding shield
  const [energy, setEnergy] = useState(100);
  
  // Platforms - now set by level configuration
  const [platforms, setPlatforms] = useState([]);
  
  // Doors - now set by level configuration
  const [doors, setDoors] = useState({
    start: { x: 50, y: 1730, width: 40, height: 70, color: '#2ecc71' },
    end: { x: 2420, y: 380, width: 40, height: 70, color: '#e74c3c' }
  });
  
  // Drones - now set by level configuration
  const [drones, setDrones] = useState([]);
  
  // Projectiles
  const [projectiles, setProjectiles] = useState([]);
  
  // Power-ups - now set by level configuration
  const [powerUps, setPowerUps] = useState([]);
  
  // Health
  const [health, setHealth] = useState(100);
  
  // Player stats for power-ups
  const [playerStats, setPlayerStats] = useState({
    speed: 5,
    shield: false
  });
  
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
  
  // Define level configurations
  const levels = [
    // Level 1 - Ia Drang Valley
    {
      name: "Ia Drang Valley",
      platforms: [
        // Starting area
        { x: 0, y: 1800, width: 400, height: 50, color: '#444' },
        
        // Path 1 - going right
        { x: 500, y: 1750, width: 150, height: 20, color: '#ff55ee' },
        { x: 750, y: 1700, width: 120, height: 20, color: '#55ffee' },
        { x: 950, y: 1650, width: 180, height: 20, color: '#444' },
        
        // Path 2 - going up
        { x: 1200, y: 1600, width: 100, height: 20, color: '#ffff55' },
        { x: 1100, y: 1500, width: 120, height: 20, color: '#444' },
        { x: 1250, y: 1400, width: 150, height: 20, color: '#ff5555' },
        
        // Path 3 - going left
        { x: 1050, y: 1300, width: 180, height: 20, color: '#55ff55' },
        { x: 800, y: 1250, width: 150, height: 20, color: '#444' },
        { x: 550, y: 1200, width: 170, height: 20, color: '#5555ff' },
        
        // Path 4 - going up and right
        { x: 600, y: 1100, width: 120, height: 20, color: '#444' },
        { x: 800, y: 1000, width: 130, height: 20, color: '#ff55ff' },
        { x: 1000, y: 900, width: 150, height: 20, color: '#ff5555' },
        
        // Path 5 - going far right
        { x: 1300, y: 850, width: 180, height: 20, color: '#444' },
        { x: 1600, y: 800, width: 200, height: 20, color: '#55ffff' },
        { x: 1900, y: 750, width: 150, height: 20, color: '#ffff55' },
        
        // Path 6 - going down
        { x: 2200, y: 800, width: 120, height: 20, color: '#444' },
        { x: 2150, y: 900, width: 130, height: 20, color: '#ff5555' },
        { x: 2250, y: 1000, width: 140, height: 20, color: '#5555ff' },
        
        // Path 7 - going left
        { x: 2050, y: 1050, width: 150, height: 20, color: '#444' },
        { x: 1800, y: 1100, width: 170, height: 20, color: '#55ff55' },
        { x: 1550, y: 1150, width: 160, height: 20, color: '#ff55ff' },
        
        // Path 8 - final approach
        { x: 1600, y: 1000, width: 140, height: 20, color: '#444' },
        { x: 1750, y: 850, width: 120, height: 20, color: '#ffff55' },
        { x: 1900, y: 700, width: 130, height: 20, color: '#ff5555' },
        { x: 2050, y: 550, width: 150, height: 20, color: '#444' },
        { x: 2300, y: 450, width: 200, height: 50, color: '#55ffff' },
        
        // Moving platforms
        { x: 350, y: 1650, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 350, maxX: 500 },
        { x: 900, y: 1400, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 900, maxX: 1050 },
        { x: 1400, y: 950, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 4, minX: 1300, maxX: 1500 }
      ],
      doors: {
        start: { x: 50, y: 1730, width: 40, height: 70, color: '#2ecc71' },
        end: { x: 2420, y: 380, width: 40, height: 70, color: '#e74c3c' }
      },
      drones: [
        // Starting area drone (just one)
        { id: 1, x: 200, y: 1700, vx: 1, vy: 0, radius: 12, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
        
        // Path 1 drone (reduced count)
        { id: 2, x: 650, y: 1650, vx: 0, vy: 1, radius: 14, color: '#f5f', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 60 },
        
        // Path 2 drone (spread out)
        { id: 3, x: 1150, y: 1450, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 30 },
        
        // Path 3 drone
        { id: 4, x: 750, y: 1250, vx: 1.2, vy: 0.8, radius: 15, color: '#f95', type: 'bouncer', timer: 0, shootTimer: 0, shootSpeed: 40 },
        
        // Path 4 drone
        { id: 5, x: 700, y: 1050, vx: 0, vy: 0, radius: 18, color: '#5f5', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 35 },
        
        // Path 5 drones (spread out)
        { id: 6, x: 1500, y: 800, vx: 1, vy: 0, radius: 13, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 7, x: 1850, y: 750, vx: 0, vy: 1, radius: 16, color: '#ff5', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 50 },
        
        // Path 6 & 7 drones (more spread)
        { id: 8, x: 2150, y: 850, vx: 0, vy: 0, radius: 20, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 25 },
        { id: 9, x: 1800, y: 1100, vx: 1.5, vy: 0, radius: 14, color: '#f95', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 45 },
        
        // Final approach drones (reduced number, more spread)
        { id: 10, x: 1750, y: 800, vx: 1, vy: 0, radius: 14, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 30 },
        { id: 11, x: 2000, y: 650, vx: 0, vy: 1, radius: 13, color: '#5f5', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 35 },
        
        // Boss drone near the exit
        { id: 12, x: 2300, y: 400, vx: 0.5, vy: 0.5, radius: 22, color: '#f55', type: 'boss', timer: 0, shootTimer: 0, health: 100, shootSpeed: 20 }
      ],
      powerUps: [
        { x: 150, y: 1600, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 950, y: 1600, radius: 10, type: 'energy', color: '#3498db', active: true },
        { x: 1200, y: 1350, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 700, y: 1150, radius: 10, type: 'energy', color: '#3498db', active: true },
        { x: 1500, y: 800, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 2000, y: 700, radius: 10, type: 'energy', color: '#3498db', active: true }
      ]
    },
    
    // Level 2 - Khe Sanh
    {
      name: "Khe Sanh",
      platforms: [
        // Starting area
        { x: 100, y: 1800, width: 300, height: 50, color: '#444' },
        
        // Scattered island-like platforms
        { x: 600, y: 1700, width: 200, height: 30, color: '#55ffee' },
        { x: 1000, y: 1600, width: 180, height: 30, color: '#ff55ee' },
        { x: 1400, y: 1500, width: 220, height: 30, color: '#ffff55' },
        { x: 800, y: 1400, width: 150, height: 30, color: '#444' },
        { x: 1200, y: 1300, width: 180, height: 30, color: '#55ff55' },
        { x: 1600, y: 1200, width: 200, height: 30, color: '#ff5555' },
        { x: 1000, y: 1100, width: 170, height: 30, color: '#5555ff' },
        { x: 1400, y: 1000, width: 190, height: 30, color: '#444' },
        { x: 1800, y: 900, width: 210, height: 30, color: '#ff55ff' },
        { x: 1500, y: 800, width: 180, height: 30, color: '#55ffff' },
        { x: 1900, y: 700, width: 200, height: 30, color: '#ffff55' },
        { x: 2200, y: 600, width: 220, height: 30, color: '#444' },
        
        // Moving platforms
        { x: 450, y: 1750, width: 100, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 450, maxX: 550 },
        { x: 850, y: 1500, width: 100, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 850, maxX: 950 },
        { x: 1300, y: 1100, width: 100, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 1300, maxX: 1400 },
        { x: 1700, y: 800, width: 100, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 1700, maxX: 1800 },
        { x: 2000, y: 650, width: 100, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 2000, maxX: 2100 }
      ],
      doors: {
        start: { x: 150, y: 1730, width: 40, height: 70, color: '#2ecc71' },
        end: { x: 2250, y: 530, width: 40, height: 70, color: '#e74c3c' }
      },
      drones: [
        { id: 1, x: 300, y: 1700, vx: 1, vy: 0, radius: 12, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 2, x: 800, y: 1650, vx: 0, vy: 1, radius: 14, color: '#f5f', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 60 },
        { id: 3, x: 1200, y: 1550, vx: 1.2, vy: 0.8, radius: 15, color: '#f95', type: 'bouncer', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 4, x: 900, y: 1350, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 30 },
        { id: 5, x: 1300, y: 1250, vx: 1, vy: 0, radius: 13, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 6, x: 1100, y: 1050, vx: 0, vy: 1, radius: 14, color: '#5f5', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 35 },
        { id: 7, x: 1600, y: 950, vx: 1.5, vy: 0, radius: 14, color: '#f95', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 45 },
        { id: 8, x: 1600, y: 750, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 25 },
        { id: 9, x: 2000, y: 650, vx: 1.2, vy: 0.8, radius: 15, color: '#55f', type: 'bouncer', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 10, x: 2300, y: 550, vx: 0.5, vy: 0.5, radius: 22, color: '#f55', type: 'boss', timer: 0, shootTimer: 0, health: 100, shootSpeed: 20 }
      ],
      powerUps: [
        { x: 250, y: 1750, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 700, y: 1650, radius: 10, type: 'energy', color: '#3498db', active: true },
        { x: 1100, y: 1550, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 900, y: 1350, radius: 10, type: 'energy', color: '#3498db', active: true },
        { x: 1500, y: 1150, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 1700, y: 850, radius: 10, type: 'energy', color: '#3498db', active: true },
        { x: 2100, y: 650, radius: 10, type: 'health', color: '#2ecc71', active: true }
      ]
    },
    
    // Level 3 - Hamburger Hill
    {
      name: "Hamburger Hill",
      platforms: [
        // Starting platform
        { x: 50, y: 1800, width: 250, height: 40, color: '#444' }, 
        
        // Cave-like structures with crystal platforms
        { x: 400, y: 1750, width: 120, height: 20, color: '#55ffee' },
        { x: 700, y: 1650, width: 150, height: 20, color: '#ff55ee' },
        
        // Stalactites and stalagmites
        { x: 550, y: 1680, width: 10, height: 80, color: '#444' }, // Stalactite
        { x: 650, y: 1680, width: 10, height: 100, color: '#444' }, // Stalactite
        { x: 900, y: 1600, width: 10, height: 60, color: '#444' }, // Stalactite
        
        // More platforms
        { x: 850, y: 1600, width: 180, height: 20, color: '#ff5555' },
        { x: 1100, y: 1550, width: 150, height: 20, color: '#55ff55' },
        
        // More stalactites
        { x: 1000, y: 1550, width: 10, height: 90, color: '#444' }, // Stalactite
        { x: 1200, y: 1550, width: 10, height: 70, color: '#444' }, // Stalactite
        
        // Continuing path
        { x: 1350, y: 1500, width: 130, height: 20, color: '#5555ff' },
        { x: 1600, y: 1450, width: 140, height: 20, color: '#444' },
        { x: 1850, y: 1400, width: 160, height: 20, color: '#ff55ff' },
        
        // Cave ceiling obstacles
        { x: 1500, y: 1400, width: 10, height: 60, color: '#444' }, // Stalactite
        { x: 1750, y: 1350, width: 10, height: 80, color: '#444' }, // Stalactite
        
        // Lower cave section
        { x: 1700, y: 1300, width: 150, height: 20, color: '#55ffff' },
        { x: 1400, y: 1200, width: 140, height: 20, color: '#ffff55' },
        { x: 1100, y: 1100, width: 130, height: 20, color: '#ff5555' },
        { x: 1300, y: 1000, width: 160, height: 20, color: '#444' },
        { x: 1600, y: 900, width: 170, height: 20, color: '#55ff55' },
        { x: 1900, y: 800, width: 180, height: 20, color: '#5555ff' },
        { x: 2200, y: 700, width: 200, height: 20, color: '#ff55ee' },
        { x: 2500, y: 600, width: 150, height: 20, color: '#55ffee' },
        
        // More ceiling formations
        { x: 1500, y: 950, width: 10, height: 70, color: '#444' }, // Stalactite
        { x: 1800, y: 850, width: 10, height: 90, color: '#444' }, // Stalactite
        { x: 2100, y: 750, width: 10, height: 60, color: '#444' }, // Stalactite
        { x: 2400, y: 650, width: 10, height: 80, color: '#444' }, // Stalactite
        
        // Moving platforms - crystal slabs
        { x: 300, y: 1700, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 300, maxX: 450 },
        { x: 950, y: 1550, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 950, maxX: 1100 },
        { x: 1500, y: 1350, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 1500, maxX: 1650 },
        { x: 1200, y: 1050, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 1200, maxX: 1350 },
        { x: 2000, y: 750, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 2000, maxX: 2150 },
        { x: 2350, y: 650, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 2350, maxX: 2500 }
      ],
      doors: {
        start: { x: 100, y: 1730, width: 40, height: 70, color: '#2ecc71' },
        end: { x: 2500, y: 530, width: 40, height: 70, color: '#e74c3c' }
      },
      drones: [
        { id: 1, x: 400, y: 1650, vx: 1, vy: 0, radius: 12, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 2, x: 750, y: 1550, vx: 0, vy: 1, radius: 14, color: '#f5f', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 60 },
        { id: 3, x: 1150, y: 1450, vx: 1.2, vy: 0.8, radius: 15, color: '#f95', type: 'bouncer', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 4, x: 1450, y: 1350, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 30 },
        { id: 5, x: 1750, y: 1250, vx: 1, vy: 0, radius: 13, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 6, x: 1500, y: 1100, vx: 0, vy: 1, radius: 14, color: '#5f5', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 35 },
        { id: 7, x: 1700, y: 850, vx: 1.5, vy: 0, radius: 14, color: '#f95', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 45 },
        { id: 8, x: 2100, y: 650, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 25 },
        { id: 9, x: 2400, y: 550, vx: 0.5, vy: 0.5, radius: 22, color: '#f55', type: 'boss', timer: 0, shootTimer: 0, health: 100, shootSpeed: 20 }
      ],
      powerUps: [
        { x: 450, y: 1700, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 800, y: 1600, radius: 10, type: 'energy', color: '#3498db', active: true },
        { x: 1200, y: 1500, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 1550, y: 1400, radius: 10, type: 'energy', color: '#3498db', active: true },
        { x: 1300, y: 1150, radius: 10, type: 'health', color: '#2ecc71', active: true },
        { x: 1800, y: 850, radius: 10, type: 'energy', color: '#3498db', active: true },
        { x: 2300, y: 650, radius: 10, type: 'health', color: '#2ecc71', active: true }
      ]
    },
    
    // Level 4 - Hue City
    {
      name: "Hue City",
      platforms: [
        // Starting platform
        { x: 150, y: 1800, width: 200, height: 30, color: '#444' },
        
        // Platforms arranged in a fortress-like structure
        // Outer walls
        { x: 450, y: 1750, width: 300, height: 20, color: '#55ffee' }, // Bottom wall
        { x: 450, y: 1650, width: 20, height: 100, color: '#55ffee' }, // Left wall
        { x: 730, y: 1650, width: 20, height: 100, color: '#55ffee' }, // Right wall
        
        // Inner fortress
        { x: 500, y: 1700, width: 200, height: 20, color: '#ff55ee' }, // Platform
        { x: 550, y: 1650, width: 100, height: 20, color: '#ff55ee' }, // Platform
        
        // Connection platform
        { x: 350, y: 1600, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 350, maxX: 450 },
        
        // Second fortress section
        { x: 850, y: 1600, width: 300, height: 20, color: '#ffff55' }, // Bottom wall
        { x: 850, y: 1500, width: 20, height: 100, color: '#ffff55' }, // Left wall
        { x: 1130, y: 1500, width: 20, height: 100, color: '#ffff55' }, // Right wall
        
        // Inner platforms
        { x: 900, y: 1550, width: 200, height: 20, color: '#ff5555' }, // Platform
        { x: 950, y: 1500, width: 100, height: 20, color: '#ff5555' }, // Platform
        
        // Connection platform
        { x: 750, y: 1550, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 750, maxX: 850 },
        
        // Third fortress section
        { x: 1250, y: 1450, width: 300, height: 20, color: '#55ff55' }, // Bottom wall
        { x: 1250, y: 1350, width: 20, height: 100, color: '#55ff55' }, // Left wall
        { x: 1530, y: 1350, width: 20, height: 100, color: '#55ff55' }, // Right wall
        
// Inner platforms
{ x: 1300, y: 1400, width: 200, height: 20, color: '#5555ff' }, // Platform
{ x: 1350, y: 1350, width: 100, height: 20, color: '#5555ff' }, // Platform

// Connection platform
{ x: 1150, y: 1400, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 1150, maxX: 1250 },

// Fourth fortress section
{ x: 1650, y: 1300, width: 300, height: 20, color: '#ff55ff' }, // Bottom wall
{ x: 1650, y: 1200, width: 20, height: 100, color: '#ff55ff' }, // Left wall
{ x: 1930, y: 1200, width: 20, height: 100, color: '#ff55ff' }, // Right wall

// Inner platforms
{ x: 1700, y: 1250, width: 200, height: 20, color: '#55ffff' }, // Platform
{ x: 1750, y: 1200, width: 100, height: 20, color: '#55ffff' }, // Platform

// Connection platform
{ x: 1550, y: 1250, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 1550, maxX: 1650 },

// Fifth fortress section
{ x: 2050, y: 1150, width: 300, height: 20, color: '#ffff55' }, // Bottom wall
{ x: 2050, y: 1050, width: 20, height: 100, color: '#ffff55' }, // Left wall
{ x: 2330, y: 1050, width: 20, height: 100, color: '#ffff55' }, // Right wall

// Inner platforms
{ x: 2100, y: 1100, width: 200, height: 20, color: '#ff5555' }, // Platform
{ x: 2150, y: 1050, width: 100, height: 20, color: '#ff5555' }, // Platform

// Connection platform
{ x: 1950, y: 1100, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 1950, maxX: 2050 },

// Final section with boss area
{ x: 2150, y: 900, width: 400, height: 20, color: '#55ff55' }, // Bottom platform
{ x: 2150, y: 750, width: 20, height: 150, color: '#55ff55' }, // Left wall
{ x: 2530, y: 750, width: 20, height: 150, color: '#55ff55' }, // Right wall
{ x: 2150, y: 750, width: 400, height: 20, color: '#55ff55' }, // Top wall
],
doors: {
start: { x: 200, y: 1730, width: 40, height: 70, color: '#2ecc71' },
end: { x: 2300, y: 780, width: 40, height: 70, color: '#e74c3c' }
},
drones: [
{ id: 1, x: 500, y: 1700, vx: 1, vy: 0, radius: 12, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
{ id: 2, x: 900, y: 1550, vx: 0, vy: 1, radius: 14, color: '#f5f', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 60 },
{ id: 3, x: 1300, y: 1400, vx: 1.2, vy: 0.8, radius: 15, color: '#f95', type: 'bouncer', timer: 0, shootTimer: 0, shootSpeed: 40 },
{ id: 4, x: 1700, y: 1250, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 30 },
{ id: 5, x: 2100, y: 1100, vx: 1, vy: 0, radius: 13, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
{ id: 6, x: 2200, y: 950, vx: 0, vy: 1, radius: 14, color: '#5f5', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 35 },
{ id: 7, x: 2400, y: 850, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 30 },
{ id: 8, x: 2300, y: 850, vx: 0.5, vy: 0.5, radius: 22, color: '#f55', type: 'boss', timer: 0, shootTimer: 0, health: 100, shootSpeed: 20 }
],
powerUps: [
{ x: 550, y: 1700, radius: 10, type: 'health', color: '#2ecc71', active: true },
{ x: 950, y: 1550, radius: 10, type: 'energy', color: '#3498db', active: true },
{ x: 1350, y: 1400, radius: 10, type: 'health', color: '#2ecc71', active: true },
{ x: 1750, y: 1250, radius: 10, type: 'energy', color: '#3498db', active: true },
{ x: 2150, y: 1100, radius: 10, type: 'health', color: '#2ecc71', active: true },
{ x: 2300, y: 900, radius: 10, type: 'energy', color: '#3498db', active: true }
]
},

// Level 5 - Tet Offensive
{
name: "Tet Offensive",
platforms: [
// Starting platform
{ x: 100, y: 1800, width: 300, height: 40, color: '#444' },

// Buildings with neon colors
// Building 1
{ x: 550, y: 1750, width: 100, height: 200, color: '#ff55ee' }, 
// Bridge 1
{ x: 400, y: 1700, width: 150, height: 15, color: '#ffff55' },

// Building 2
{ x: 750, y: 1700, width: 120, height: 250, color: '#55ffee' },
// Bridge 2
{ x: 650, y: 1650, width: 100, height: 15, color: '#ffff55' },

// Building 3
{ x: 950, y: 1650, width: 150, height: 300, color: '#ff5555' },
// Bridge 3
{ x: 870, y: 1600, width: 80, height: 15, color: '#ffff55' },

// Building 4
{ x: 1200, y: 1600, width: 130, height: 350, color: '#55ff55' },
// Bridge 4
{ x: 1100, y: 1550, width: 100, height: 15, color: '#ffff55' },

// Building 5
{ x: 1450, y: 1550, width: 120, height: 400, color: '#5555ff' },
// Bridge 5
{ x: 1330, y: 1500, width: 120, height: 15, color: '#ffff55' },

// Building 6
{ x: 1700, y: 1500, width: 140, height: 450, color: '#ff55ff' },
// Bridge 6
{ x: 1570, y: 1450, width: 130, height: 15, color: '#ffff55' },

// Building 7
{ x: 1950, y: 1450, width: 160, height: 500, color: '#55ffff' },
// Bridge 7
{ x: 1840, y: 1400, width: 110, height: 15, color: '#ffff55' },

// Building 8
{ x: 2200, y: 1400, width: 180, height: 550, color: '#ffff55' },
// Bridge 8
{ x: 2110, y: 1350, width: 90, height: 15, color: '#ffff55' },

// Building 9
{ x: 2450, y: 1350, width: 200, height: 600, color: '#ff5555' },
// Bridge 9
{ x: 2380, y: 1300, width: 70, height: 15, color: '#ffff55' },

// Moving platforms (elevators)
{ x: 600, y: 1500, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 600, maxX: 600, minY: 1500, maxY: 1700, vertical: true },
{ x: 800, y: 1450, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 800, maxX: 800, minY: 1450, maxY: 1650, vertical: true },
{ x: 1000, y: 1350, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 1000, maxX: 1000, minY: 1350, maxY: 1600, vertical: true },
{ x: 1250, y: 1250, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 1250, maxX: 1250, minY: 1250, maxY: 1550, vertical: true },
{ x: 1500, y: 1150, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 4, minX: 1500, maxX: 1500, minY: 1150, maxY: 1500, vertical: true },
{ x: 1750, y: 1050, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 4, minX: 1750, maxX: 1750, minY: 1050, maxY: 1450, vertical: true },
{ x: 2000, y: 950, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 5, minX: 2000, maxX: 2000, minY: 950, maxY: 1400, vertical: true },
{ x: 2250, y: 850, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 5, minX: 2250, maxX: 2250, minY: 850, maxY: 1350, vertical: true },
{ x: 2500, y: 750, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 6, minX: 2500, maxX: 2500, minY: 750, maxY: 1300, vertical: true },
],
doors: {
start: { x: 150, y: 1730, width: 40, height: 70, color: '#2ecc71' },
end: { x: 2500, y: 680, width: 40, height: 70, color: '#e74c3c' }
},
drones: [
{ id: 1, x: 600, y: 1650, vx: 1, vy: 0, radius: 12, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
{ id: 2, x: 850, y: 1600, vx: 0, vy: 1, radius: 14, color: '#f5f', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 60 },
{ id: 3, x: 1050, y: 1550, vx: 1.2, vy: 0.8, radius: 15, color: '#f95', type: 'bouncer', timer: 0, shootTimer: 0, shootSpeed: 40 },
{ id: 4, x: 1300, y: 1450, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 30 },
{ id: 5, x: 1550, y: 1350, vx: 1, vy: 0, radius: 13, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
{ id: 6, x: 1800, y: 1250, vx: 0, vy: 1, radius: 14, color: '#5f5', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 35 },
{ id: 7, x: 2050, y: 1150, vx: 1.5, vy: 0, radius: 14, color: '#f95', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 45 },
{ id: 8, x: 2300, y: 1050, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 25 },
{ id: 9, x: 2500, y: 850, vx: 0.5, vy: 0.5, radius: 22, color: '#f55', type: 'boss', timer: 0, shootTimer: 0, health: 100, shootSpeed: 20 }
],
powerUps: [
{ x: 600, y: 1600, radius: 10, type: 'health', color: '#2ecc71', active: true },
{ x: 900, y: 1550, radius: 10, type: 'energy', color: '#3498db', active: true },
{ x: 1200, y: 1450, radius: 10, type: 'health', color: '#2ecc71', active: true },
{ x: 1500, y: 1350, radius: 10, type: 'energy', color: '#3498db', active: true },
{ x: 1800, y: 1200, radius: 10, type: 'health', color: '#2ecc71', active: true },
{ x: 2100, y: 1100, radius: 10, type: 'energy', color: '#3498db', active: true },
{ x: 2400, y: 950, radius: 10, type: 'health', color: '#2ecc71', active: true },
{ x: 2550, y: 850, radius: 10, type: 'energy', color: '#3498db', active: true }
]
}
];

// Handle canvas resize based on window size
useEffect(() => {
const handleResize = () => {
const maxWidth = Math.min(window.innerWidth - 40, 1200);
const maxHeight = Math.min(window.innerHeight - 100, 800);

// Maintain aspect ratio
const aspectRatio = 3 / 2;
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
    // Start game
    startNewGame();
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
}, [gameState]);

// Handle mouse input for shield
useEffect(() => {
const canvas = canvasRef.current;
if (!canvas) return;

const handleMouseDown = () => {
setMouse(prev => ({ ...prev, down: true }));
};

const handleMouseUp = () => {
setMouse(prev => ({ ...prev, down: false }));
};

const handleMouseMove = (event) => {
const rect = canvas.getBoundingClientRect();
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;

setMouse(prev => ({ ...prev, x, y }));
};

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseleave', handleMouseUp);

// Touch events for mobile
const handleTouchStart = (event) => {
event.preventDefault();
setMouse(prev => ({ ...prev, down: true }));
};

const handleTouchEnd = (event) => {
event.preventDefault();
setMouse(prev => ({ ...prev, down: false }));
};

const handleTouchMove = (event) => {
event.preventDefault();
const rect = canvas.getBoundingClientRect();
const touch = event.touches[0];
const x = touch.clientX - rect.left;
const y = touch.clientY - rect.top;

setMouse(prev => ({ ...prev, x, y }));
};

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);
canvas.addEventListener('touchmove', handleTouchMove);

return () => {
canvas.removeEventListener('mousedown', handleMouseDown);
canvas.removeEventListener('mouseup', handleMouseUp);
canvas.removeEventListener('mousemove', handleMouseMove);
canvas.removeEventListener('mouseleave', handleMouseUp);
canvas.removeEventListener('touchstart', handleTouchStart);
canvas.removeEventListener('touchend', handleTouchEnd);
canvas.removeEventListener('touchmove', handleTouchMove);
};
}, []);

// Modified resetGame to handle level changes and persistent health/energy
const resetGame = (isFirstLevel = false) => {
// If it's the first level, randomly select a level to start with
if (isFirstLevel) {
const randomLevelIndex = Math.floor(Math.random() * levels.length);
setCurrentLevel(randomLevelIndex);
} else {
// Move to the next level or loop back to the first
const nextLevel = (currentLevel + 1) % levels.length;
setCurrentLevel(nextLevel);
}

// Get the level data
const levelData = levels[currentLevel];

// Reset player position to start door
setPlayer({
x: levelData.doors.start.x + levelData.doors.start.width / 2,
y: levelData.doors.start.y - 20,
vx: 0,
vy: 0,
radius: 15,
color: '#36f9f6',
grounded: false,
jumping: false
});

// Reset camera position
setCamera({
x: Math.max(0, levelData.doors.start.x - canvasSize.width / 2),
y: Math.max(0, levelData.doors.start.y - canvasSize.height / 2)
});

// Reset projectiles
setProjectiles([]);

// If it's the first level, reset health and energy
if (isFirstLevel) {
setHealth(100);
setEnergy(100);
}

// Set level data
setPlatforms(levelData.platforms);
setDoors(levelData.doors);
setDrones(levelData.drones);
setPowerUps(levelData.powerUps);
};

// Start a new game
const startNewGame = () => {
setGameState('playing');
resetGame(true); // Pass true to indicate it's the first level
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

// Automatially go to next level when winning
useEffect(() => {
if (gameState === 'win') {
// Short delay before loading the next level
const nextLevelTimer = setTimeout(() => {
setGameState('playing');
resetGame(false); // Pass false to indicate it's not the first level
}, 2000);

return () => clearTimeout(nextLevelTimer);
}
}, [gameState]);

// Game loop
useEffect(() => {
if (gameState !== 'playing') return;

let animationFrameId;
let lastTime = 0;

const gameLoop = (time) => {
if (gameState !== 'playing') return;

// Delta time in seconds
const deltaTime = Math.min((time - lastTime) / 1000, 0.1); // Cap at 0.1 to prevent huge jumps
lastTime = time;

// Update energy for shield
if (mouse.down && energy > 0) {
// Activate shield and drain energy at an extremely slow rate
setPlayerStats(prev => ({ ...prev, shield: true }));
setEnergy(prev => Math.max(0, prev - deltaTime * 4)); // Very slow drain
} else {
// Deactivate shield and regenerate energy
setPlayerStats(prev => ({ ...prev, shield: false }));
setEnergy(prev => Math.min(100, prev + deltaTime * 6)); 
}

// When energy is 0, drain health very slowly
if (energy <= 0) {
setHealth(prev => {
  const newHealth = prev - deltaTime * 2; // Very slow drain
  if (newHealth <= 0) {
    setGameState('gameOver');
    return 0;
  }
  return newHealth;
});
}

// Update moving platforms
setPlatforms(prevPlatforms => {
return prevPlatforms.map(platform => {
  if (platform.movingPlatform) {
    const newPlatform = { ...platform };
    
    if (platform.vertical) {
      // Move platform vertically
      newPlatform.y += platform.direction * platform.speed;
      
      // Change direction if reaching limits
      if (newPlatform.y <= platform.minY) {
        newPlatform.direction = 1;
      } else if (newPlatform.y >= platform.maxY) {
        newPlatform.direction = -1;
      }
    } else {
      // Move platform horizontally
      newPlatform.x += platform.direction * platform.speed;
      
      // Change direction if reaching limits
      if (newPlatform.x <= platform.minX) {
        newPlatform.direction = 1;
      } else if (newPlatform.x >= platform.maxX) {
        newPlatform.direction = -1;
      }
    }
    
    return newPlatform;
  }
  
  return platform;
});
});

// Update player
setPlayer(prevPlayer => {
let newPlayer = { ...prevPlayer };

// Apply gravity
newPlayer.vy += gravity;

// Apply horizontal movement
if (keys.left) {
  newPlayer.vx = -playerStats.speed;
} else if (keys.right) {
  newPlayer.vx = playerStats.speed;
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
let onPlatform = false;

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
        onPlatform = true;
        newPlayer.jumping = false;
        
        // If standing on a moving platform, move with it
        if (platform.movingPlatform) {
          if (platform.vertical) {
            newPlayer.y += platform.direction * platform.speed;
          } else {
            newPlayer.x += platform.direction * platform.speed;
          }
        }
      }
    }
  }
}

// Keep player within world bounds for x-axis
if (newPlayer.x - newPlayer.radius < 0) {
  newPlayer.x = newPlayer.radius;
  newPlayer.vx = 0;
} else if (newPlayer.x + newPlayer.radius > worldSize.width) {
  newPlayer.x = worldSize.width - newPlayer.radius;
  newPlayer.vx = 0;
}

// For y-axis, if player falls off platform, they die (n-gon style)
if (newPlayer.y + newPlayer.radius > worldSize.height) {
  // Player fell off the world
  setGameState('gameOver');
  return newPlayer;
}

// Upper world bound
if (newPlayer.y - newPlayer.radius < 0) {
  newPlayer.y = newPlayer.radius;
  newPlayer.vy = 0;
}

// Check if player reached end door
if (checkCollision(newPlayer, doors.end)) {
  setGameState('win');
}

// Check collision with power-ups
powerUps.forEach((powerUp, index) => {
  if (powerUp.active && checkCircleCollision(newPlayer, powerUp)) {
    // Apply power-up effect
    switch (powerUp.type) {
      case 'health':
        setHealth(prev => Math.min(prev + 25, 100));
        break;
      case 'energy':
        setEnergy(prev => Math.min(prev + 50, 100));
        break;
      default:
        break;
    }
    
    // Deactivate power-up
    setPowerUps(prev => {
      const newPowerUps = [...prev];
      newPowerUps[index].active = false;
      return newPowerUps;
    });
  }
});

// Update camera position to follow player
setCamera({
  x: Math.max(0, Math.min(newPlayer.x - canvasSize.width / 2, worldSize.width - canvasSize.width)),
  y: Math.max(0, Math.min(newPlayer.y - canvasSize.height / 2, worldSize.height - canvasSize.height))
});

return newPlayer;
});

// Update drones
setDrones(prevDrones => {
return prevDrones.map(drone => {
  const newDrone = { ...drone };
  newDrone.timer += 1;
  newDrone.shootTimer = (newDrone.shootTimer || 0) + 1;
  
  // All drones shoot at player
  if (newDrone.shootTimer > newDrone.shootSpeed) {
    newDrone.shootTimer = 0;
    
    // Calculate direction to player
    const dx = player.x - newDrone.x;
    const dy = player.y - newDrone.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Only shoot if player is within range
    if (dist < 500) {
      // Add projectile with slight randomization for difficulty tuning
      const accuracy = newDrone.type === 'boss' ? 0.05 : 0.15; // Boss is more accurate
      const spreadX = (Math.random() - 0.5) * 2 * accuracy;
      const spreadY = (Math.random() - 0.5) * 2 * accuracy;
      
      // Slower projectiles for better gameplay
      const projectileSpeed = newDrone.type === 'boss' ? 4 : 3;
      
      setProjectiles(prev => [
        ...prev,
        {
          x: newDrone.x,
          y: newDrone.y,
          vx: (dx / dist + spreadX) * projectileSpeed,
          vy: (dy / dist + spreadY) * projectileSpeed,
          radius: newDrone.type === 'boss' ? 8 : 5,
          color: newDrone.color,
          timer: 0,
          source: 'drone'
        }
      ]);
    }
  }
  
  // Different behavior based on drone type
  switch (newDrone.type) {
    case 'patroller':
      // Patrol back and forth
      if (newDrone.timer > 100) {
        newDrone.vx *= -1;
        newDrone.timer = 0;
      }
      break;
    
    case 'vertical':
      // Move up and down
      if (newDrone.timer > 80) {
        newDrone.vy *= -1;
        newDrone.timer = 0;
      }
      break;
    
    case 'chaser':
      // Chase player
      const dx = player.x - newDrone.x;
      const dy = player.y - newDrone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 300) {
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
    
    case 'turret':
      // Doesn't move, just shoots
      newDrone.vx = 0;
      newDrone.vy = 0;
      break;
      
    case 'bouncer':
      // Bounces around randomly and fast
      if (newDrone.timer > 30) {
        newDrone.vx = (Math.random() - 0.5) * 4;
        newDrone.vy = (Math.random() - 0.5) * 4;
        newDrone.timer = 0;
      }
      break;
      
    case 'boss':
      // Complex movement pattern
      if (newDrone.timer % 120 < 60) {
        // Circle motion
        const angle = newDrone.timer * 0.05;
        newDrone.vx = Math.cos(angle) * 2;
        newDrone.vy = Math.sin(angle) * 2;
      } else if (newDrone.timer % 120 < 90) {
        // Charge at player
        const dx = player.x - newDrone.x;
        const dy = player.y - newDrone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
          newDrone.vx = dx / dist * 3;
          newDrone.vy = dy / dist * 3;
        }
      } else {
        // Retreat
        const dx = player.x - newDrone.x;
        const dy = player.y - newDrone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 10) {
          newDrone.vx = -dx / dist * 2;
          newDrone.vy = -dy / dist * 2;
        }
      }
      break;
    
    default:
      break;
  }
  
  // Apply movement
  newDrone.x += newDrone.vx;
  newDrone.y += newDrone.vy;
  
  // Keep drones within world bounds
  if (newDrone.x - newDrone.radius < 0) {
    newDrone.x = newDrone.radius;
    newDrone.vx *= -1;
  } else if (newDrone.x + newDrone.radius > worldSize.width) {
    newDrone.x = worldSize.width - newDrone.radius;
    newDrone.vx *= -1;
  }
  
  if (newDrone.y - newDrone.radius < 0) {
    newDrone.y = newDrone.radius;
    newDrone.vy *= -1;
  } else if (newDrone.y + newDrone.radius > worldSize.height) {
    newDrone.y = worldSize.height - newDrone.radius;
    newDrone.vy *= -1;
  }
  
  // Check collision with player
  if (checkCircleCollision(newDrone, player)) {
    // If player has shield, NO damage at all
    if (!playerStats.shield) {
      setHealth(prev => {
        // Drastically reduce damage rate
        const newHealth = prev - 1; // Very low damage
        if (newHealth <= 0) {
          setGameState('gameOver');
          return 0;
        }
        return newHealth;
      });
      
      // Apply knockback to player (reduced)
      setPlayer(prevPlayer => {
        const knockbackX = prevPlayer.x - newDrone.x;
        const knockbackY = prevPlayer.y - newDrone.y;
        const knockbackDist = Math.sqrt(knockbackX * knockbackX + knockbackY * knockbackY);
        
        if (knockbackDist > 0) {
          return {
            ...prevPlayer,
            vx: knockbackX / knockbackDist * 5, // Reduced knockback
            vy: knockbackY / knockbackDist * 5
          };
        }
        
        return prevPlayer;
      });
    }
    // If shield is active, no damage and no knockback occurs
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
    projectile.x > worldSize.width + projectile.radius ||
    projectile.y < -projectile.radius ||
    projectile.y > worldSize.height + projectile.radius ||
    projectile.timer > 120
  ) {
    return false;
  }
  
  // Check collision with player for drone projectiles
  if (projectile.source === 'drone' && checkCircleCollision(projectile, player)) {
    // If player has shield, block projectile
    if (playerStats.shield) {
      return false; // Remove projectile without damage
    } else {
      // Much less damage from projectiles
      setHealth(prev => {
        const newHealth = prev - 2; // Reduced from 7 to 2
        if (newHealth <= 0) {
          setGameState('gameOver');
          return 0;
        }
        return newHealth;
      });
      
      return false;
    }
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
}, [gameState, keys, player, platforms, doors, powerUps, mouse, energy, playerStats, worldSize.width, worldSize.height, canvasSize.width, canvasSize.height, gravity, friction, jumpForce, currentLevel]);

// Render game
useEffect(() => {
const canvas = canvasRef.current;
if (!canvas) return;

const ctx = canvas.getContext('2d');

// Clear canvas with dark background for N-GON style
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
ctx.fillStyle = '#fff'; // White text for dark background
ctx.font = '24px Arial';
ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);

ctx.font = '18px Arial';
ctx.fillText('Use ARROW KEYS or WASD to move and jump', canvas.width / 2, canvas.height / 2 + 40);
ctx.fillText('HOLD MOUSE BUTTON for shield (drains energy)', canvas.width / 2, canvas.height / 2 + 70);
ctx.fillText('When energy is 0, health will drain!', canvas.width / 2, canvas.height / 2 + 100);
ctx.fillText('Don\'t fall off platforms - it\'s instant death!', canvas.width / 2, canvas.height / 2 + 130);
ctx.fillText('Reach the red door to win and progress to next level', canvas.width / 2, canvas.height / 2 + 160);
} else if (gameState === 'playing' || gameState === 'gameOver' || gameState === 'win') {
// Apply camera transformation
ctx.save();
ctx.translate(-camera.x, -camera.y);

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

// Draw power-ups
powerUps.forEach(powerUp => {
if (powerUp.active) {
  ctx.fillStyle = powerUp.color;
  ctx.beginPath();
  ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Add glow effect
  ctx.shadowColor = powerUp.color;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Add icon based on type
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '10px Arial';
  
  switch (powerUp.type) {
    case 'health':
      ctx.fillText('+', powerUp.x, powerUp.y);
      break;
    case 'energy':
      ctx.fillText('E', powerUp.x, powerUp.y);
      break;
    default:
      break;
  }
}
});

// Draw projectiles
projectiles.forEach(projectile => {
ctx.fillStyle = projectile.color;
ctx.beginPath();
ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
ctx.fill();

// Add trail effect
ctx.globalAlpha = 0.5;
ctx.beginPath();
ctx.arc(projectile.x - projectile.vx, projectile.y - projectile.vy, projectile.radius * 0.8, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 0.3;
ctx.beginPath();
ctx.arc(projectile.x - projectile.vx * 2, projectile.y - projectile.vy * 2, projectile.radius * 0.6, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1.0;
});

// Draw drones
drones.forEach(drone => {
// Draw drone body
ctx.fillStyle = drone.color;
ctx.beginPath();
ctx.arc(drone.x, drone.y, drone.radius, 0, Math.PI * 2);
ctx.fill();

// Add detail based on drone type
ctx.strokeStyle = '#000';
ctx.lineWidth = 1;

if (drone.type === 'shooter' || drone.type === 'turret') {
  // Draw shooter detail
  ctx.beginPath();
  ctx.arc(drone.x, drone.y, drone.radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw gun
  const angle = Math.atan2(player.y - drone.y, player.x - drone.x);
  ctx.beginPath();
  ctx.moveTo(drone.x, drone.y);
  ctx.lineTo(
    drone.x + Math.cos(angle) * drone.radius * 1.2,
    drone.y + Math.sin(angle) * drone.radius * 1.2
  );
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 1;
} else if (drone.type === 'chaser') {
  // Draw chaser detail
  const angle = Math.atan2(player.y - drone.y, player.x - drone.x);
  
  // Draw triangular shape pointing at player
  ctx.beginPath();
  ctx.moveTo(
    drone.x + Math.cos(angle) * drone.radius,
    drone.y + Math.sin(angle) * drone.radius
  );
  ctx.lineTo(
    drone.x + Math.cos(angle + 2.1) * drone.radius * 0.7,
    drone.y + Math.sin(angle + 2.1) * drone.radius * 0.7
  );
  ctx.lineTo(
    drone.x + Math.cos(angle - 2.1) * drone.radius * 0.7,
    drone.y + Math.sin(angle - 2.1) * drone.radius * 0.7
  );
  ctx.closePath();
  ctx.fillStyle = '#000';
  ctx.fill();
} else if (drone.type === 'patroller' || drone.type === 'vertical') {
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
} else if (drone.type === 'bouncer') {
  // Draw bouncer detail - pulsing circle
  const pulseSize = 0.5 + 0.2 * Math.sin(Date.now() / 200);
  ctx.beginPath();
  ctx.arc(drone.x, drone.y, drone.radius * pulseSize, 0, Math.PI * 2);
  ctx.stroke();
} else if (drone.type === 'boss') {
  // Draw boss detail
  ctx.beginPath();
  ctx.arc(drone.x, drone.y, drone.radius * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  
  // Draw spikes
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    ctx.beginPath();
    ctx.moveTo(drone.x, drone.y);
    ctx.lineTo(
      drone.x + Math.cos(angle) * drone.radius * 1.3,
      drone.y + Math.sin(angle) * drone.radius * 1.3
    );
    ctx.stroke();
  }
  
  // Draw health bar
  if (drone.health) {
    const healthWidth = drone.radius * 2;
    const healthHeight = 5;
    const healthX = drone.x - healthWidth / 2;
    const healthY = drone.y - drone.radius - 10;
    
    ctx.fillStyle = '#555';
    ctx.fillRect(healthX, healthY, healthWidth, healthHeight);
    
    ctx.fillStyle = '#f55';
    ctx.fillRect(healthX, healthY, healthWidth * (drone.health / 100), healthHeight);
  }
}

// All drones show targeting line when about to shoot
if (drone.shootTimer > (drone.shootSpeed || 60) * 0.8) {
  const angle = Math.atan2(player.y - drone.y, player.x - drone.x);
  ctx.strokeStyle = drone.color;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(drone.x, drone.y);
  ctx.lineTo(
    drone.x + Math.cos(angle) * 100,
    drone.y + Math.sin(angle) * 100
  );
  ctx.stroke();
  ctx.globalAlpha = 1.0;
}
});

// Draw player
ctx.fillStyle = player.color;
ctx.beginPath();
ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
ctx.fill();

// Add detail to player
ctx.strokeStyle = '#000';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(player.x, player.y, player.radius * 0.7, 0, Math.PI * 2);
ctx.stroke();

// Draw shield if active
if (playerStats.shield) {
ctx.strokeStyle = '#f1c40f';
ctx.lineWidth = 3;
ctx.globalAlpha = 0.7;
ctx.beginPath();
ctx.arc(player.x, player.y, player.radius * 1.3, 0, Math.PI * 2);
ctx.stroke();

// Add pulsing effect to shield
ctx.globalAlpha = 0.3;
ctx.fillStyle = '#f1c40f';
ctx.beginPath();
ctx.arc(player.x, player.y, player.radius * 1.3, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1.0;
}

// Reset camera transformation
ctx.restore();

// UI elements - drawn without camera transformation
// Draw level info
ctx.fillStyle = '#fff';
ctx.font = '18px Arial';
ctx.textAlign = 'center';
ctx.fillText(`Level: ${levels[currentLevel].name}`, canvas.width / 2, 30);

// Draw health bar
ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
ctx.fillRect(20, 20, 200, 20);

ctx.fillStyle = health > 50 ? '#2ecc71' : health > 25 ? '#f1c40f' : '#e74c3c';
ctx.fillRect(20, 20, health * 2, 20);

ctx.strokeStyle = '#fff';
ctx.lineWidth = 2;
ctx.strokeRect(20, 20, 200, 20);

// Health text
ctx.fillStyle = energy > 0 ? '#fff' : '#f55'; // Red text when energy is 0 to warn player
ctx.font = '16px Arial';
ctx.textAlign = 'left';
ctx.fillText(`Health: ${Math.floor(health)}%`, 25, 36);

// Energy bar
ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
ctx.fillRect(20, 50, 200, 20);

ctx.fillStyle = energy > 20 ? '#3498db' : '#e74c3c'; // Red when energy is low
ctx.fillRect(20, 50, energy * 2, 20);

ctx.strokeStyle = '#fff';
ctx.lineWidth = 2;
ctx.strokeRect(20, 50, 200, 20);

// Energy text
ctx.fillStyle = energy > 20 ? '#fff' : '#ffff00'; // Yellow warning text when low
ctx.font = '16px Arial';
ctx.textAlign = 'left';
ctx.fillText(`Energy: ${Math.floor(energy)}%`, 25, 66);

// Show warning when energy is depleted
if (energy <= 0) {
ctx.fillStyle = '#e74c3c';
ctx.font = 'bold 14px Arial';
ctx.fillText('WARNING: Health draining!', 25, 90);
}

// Mini-map (top-right corner)
const mapWidth = 150;
const mapHeight = 100;
const mapX = canvas.width - mapWidth - 20;
const mapY = 20;

// Draw mini-map background
ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
ctx.strokeStyle = '#000';
ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);

// Scale factors for the mini-map
const scaleX = mapWidth / worldSize.width;
const scaleY = mapHeight / worldSize.height;

// Draw player on mini-map
ctx.fillStyle = player.color;
ctx.beginPath();
ctx.arc(
mapX + player.x * scaleX,
mapY + player.y * scaleY,
3, 0, Math.PI * 2
);
ctx.fill();

// Draw start and end doors on mini-map
ctx.fillStyle = doors.start.color;
ctx.fillRect(
mapX + doors.start.x * scaleX,
mapY + doors.start.y * scaleY,
doors.start.width * scaleX,
doors.start.height * scaleY
);

ctx.fillStyle = doors.end.color;
ctx.fillRect(
mapX + doors.end.x * scaleX,
mapY + doors.end.y * scaleY,
doors.end.width * scaleX,
doors.end.height * scaleY
);

// Draw viewport rectangle on mini-map
ctx.strokeStyle = '#fff';
ctx.strokeRect(
mapX + camera.x * scaleX,
mapY + camera.y * scaleY,
canvasSize.width * scaleX,
canvasSize.height * scaleY
);

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
ctx.fillText(`Proceeding to ${levels[(currentLevel + 1) % levels.length].name}...`, canvas.width / 2, canvas.height / 2);
}
}
}, [gameState, platforms, doors, player, drones, projectiles, powerUps, health, energy, playerStats, camera, worldSize.width, worldSize.height, canvasSize.width, canvasSize.height, currentLevel, levels]);

return (
<div style={{ 
color: '#eee', 
backgroundColor: '#222',
padding: '20px',
minHeight: '100vh',
display: 'flex',
flexDirection: 'column',
alignItems: 'center'
}}>
<header>
<h1 style={{ color: '#36f9f6', margin: '0 0 20px 0', fontFamily: 'monospace', textShadow: '2px 2px #000' }}>DODGEBALL</h1>
</header>

<main>
<canvas
  ref={canvasRef}
  width={canvasSize.width}
  height={canvasSize.height}
  style={{
    backgroundColor: '#111',
    borderRadius: '5px',
    boxShadow: '0 0 20px rgba(54, 249, 246, 0.5)' // Enhanced cyan glow
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
    onClick={startNewGame}
  >
    START GAME
  </button>
</div>
</main>

<footer style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '20px', fontFamily: 'monospace' }}>
<p>Use arrow keys or WASD to move and jump. Hold mouse button for shield (drains energy).</p>
<p>When energy is depleted, health will drain! Don't fall off platforms!</p>
<p>Collect power-ups and reach the red door to win.</p>
</footer>
</div>
);
}

export default App;