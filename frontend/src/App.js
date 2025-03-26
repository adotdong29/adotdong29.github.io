// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './styles/App.css';

// Battle information and descriptions
const battleDescriptions = {
  "Ia Drang Valley": {
    title: "Battle of Ia Drang Valley",
    year: "1965",
    description:
      "The first major engagement between the U.S. and the North Vietnamese Army, the fight was a win for the U.S., as there were 250 casualties and another 250 wounded, but an estimated 600-1200 North Vietnamese soldiers were killed. This battle significantly changed strategies for the North Vietnamese Army.",
    gameplay: "Navigate through dense terrian while using terrain as cover."
  },
  "Khe Sanh": {
    title: "Battle of Khe Sanh",
    year: "1968",
    description:
      "A major and brutal battle in the Tet Offensive, this fight took place in the city of Hue, where the North Vietnamese Army had initially captured the city, but were forced out by the U.S. and South Vietnamese forces. The battle lasted a whopping month and two days filled with brutal fighting from both sides. The U.S. and South Vietnamese forces suffered around 600 deaths, while the North Vietnamese Army suffered around 1000-5000 deaths.",
    gameplay:
      "Jump between scattered platforms representing the isolated hilltops of Khe Sanh. Time your movements carefully between the moving platforms while managing your shield against frequent enemy fire."
  },
  "Hamburger Hill": {
    title: "Battle of Hamburger Hill",
    year: "1969",
    description:
      "A ten-day long battle for Ap Bia Mountain, which was heavily fortified by the North Vietnamese Army. It was a brutal uphill battle for the U.S., but Hamburger Hill was conquered. This was a blow against support for the war, because even though the soldiers had worked so hard in order to capture Hamburger Hill, it was quickly abandoned due to having low strategic value. It was called Battle of Hamburger Hill because the nature of this fight was pretty similar to another fight in the Korean War, called Battle of Pork Chop Hill.",
    gameplay: "Move through cave-like structures to reach the endpoint."
  },
  "Hue City": {
    title: "Battle of Hue",
    year: "1968",
    description:
      "A major and brutal battle in the Tet Offensive, this fight took place in the city of Hue, where the North Vietnamese Army had initially captured the city, but were forced out by the U.S. and South Vietnamese forces. The battle lasted a whopping month and two days filled with brutal fighting from both sides. The U.S. and South Vietnamese forces suffered around 600 deaths, while the North Vietnamese Army suffered around 1000-5000 deaths.",
    gameplay: "..."
  },
  "Tet Offensive": {
    title: "Tet Offensive",
    year: "1968",
    description:
      "The Tet Offensive was a series of battles started by the PAVN (North Vietnamese Army) during the Vietnamese New Year, which is called Tet, in 1968. Overall, the PAVN was repelled, but American support for the war was weakened by these battles.",
    gameplay: "..."
  }
};

// Battle images mapping (files placed in your public folder)
const battleImages = {
  "Ia Drang Valley": "/images/IaDrang.jpeg",
  "Khe Sanh": "/images/KheSanh.jpeg",
  "Hamburger Hill": "/images/HamburgerHill.jpeg",
  "Hue City": "/images/HueCity.jpeg",
  "Tet Offensive": "/images/TetOffensive.jpeg"
};

// Battle music tracks mapping
const battleMusic = {
  "Ia Drang Valley": "EveOfDestructionReal.mp3",
  "Khe Sanh": "FortunateSonreal.mp3",
  "Hamburger Hill": "GimmeShelter.mp3",
  "Hue City": "McDonald.mp3",
  "Tet Offensive": "WeGottaGetOutOfThisPlace.mp3"
};

function App() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver', 'win', 'info'
  const [currentLevel, setCurrentLevel] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [infoText, setInfoText] = useState(null);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const worldSize = { width: 3000, height: 2000 };
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [player, setPlayer] = useState({
    x: 100,
    y: 700,
    vx: 0,
    vy: 0,
    radius: 15,
    color: '#36f9f6',
    grounded: false,
    jumping: false
  });
  const [mouse, setMouse] = useState({ down: false, x: 0, y: 0 });
  const [energy, setEnergy] = useState(100);
  const [platforms, setPlatforms] = useState([]);
  const [doors, setDoors] = useState({
    start: { x: 50, y: 1730, width: 40, height: 70, color: '#2ecc71' },
    end: { x: 2420, y: 380, width: 40, height: 70, color: '#e74c3c' }
  });
  const [drones, setDrones] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [health, setHealth] = useState(100);
  const [playerStats, setPlayerStats] = useState({ speed: 5, shield: false });
  const [keys, setKeys] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
  });

  const gravity = 0.5;
  const friction = 0.8;
  const jumpForce = -12;

  // === Levels Configuration ===
  const levels = [
    // Level 1 - Ia Drang Valley
    {
      name: "Ia Drang Valley",
      platforms: [
        { x: 0, y: 1800, width: 400, height: 50, color: '#444' },
        { x: 500, y: 1750, width: 150, height: 20, color: '#ff55ee' },
        { x: 750, y: 1700, width: 120, height: 20, color: '#55ffee' },
        { x: 950, y: 1650, width: 180, height: 20, color: '#444' },
        { x: 1200, y: 1600, width: 100, height: 20, color: '#ffff55' },
        { x: 1100, y: 1500, width: 120, height: 20, color: '#444' },
        { x: 1250, y: 1400, width: 150, height: 20, color: '#ff5555' },
        { x: 1050, y: 1300, width: 180, height: 20, color: '#55ff55' },
        { x: 800, y: 1250, width: 150, height: 20, color: '#444' },
        { x: 550, y: 1200, width: 170, height: 20, color: '#5555ff' },
        { x: 600, y: 1100, width: 120, height: 20, color: '#444' },
        { x: 800, y: 1000, width: 130, height: 20, color: '#ff55ff' },
        { x: 1000, y: 900, width: 150, height: 20, color: '#ff5555' },
        { x: 1300, y: 850, width: 180, height: 20, color: '#444' },
        { x: 1600, y: 800, width: 200, height: 20, color: '#55ffff' },
        { x: 1900, y: 750, width: 150, height: 20, color: '#ffff55' },
        { x: 2200, y: 800, width: 120, height: 20, color: '#444' },
        { x: 2150, y: 900, width: 130, height: 20, color: '#ff5555' },
        { x: 2250, y: 1000, width: 140, height: 20, color: '#5555ff' },
        { x: 2050, y: 1050, width: 150, height: 20, color: '#444' },
        { x: 1800, y: 1100, width: 170, height: 20, color: '#55ff55' },
        { x: 1550, y: 1150, width: 160, height: 20, color: '#ff55ff' },
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
        { id: 1, x: 200, y: 1700, vx: 1, vy: 0, radius: 12, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 2, x: 650, y: 1650, vx: 0, vy: 1, radius: 14, color: '#f5f', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 60 },
        { id: 3, x: 1150, y: 1450, vx: 0, vy: 0, radius: 18, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 30 },
        { id: 4, x: 750, y: 1250, vx: 1.2, vy: 0.8, radius: 15, color: '#f95', type: 'bouncer', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 5, x: 700, y: 1050, vx: 0, vy: 0, radius: 18, color: '#5f5', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 35 },
        { id: 6, x: 1500, y: 800, vx: 1, vy: 0, radius: 13, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 40 },
        { id: 7, x: 1850, y: 750, vx: 0, vy: 1, radius: 16, color: '#ff5', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 50 },
        { id: 8, x: 2150, y: 850, vx: 0, vy: 0, radius: 20, color: '#5ff', type: 'turret', timer: 0, shootTimer: 0, shootSpeed: 25 },
        { id: 9, x: 1800, y: 1100, vx: 1.5, vy: 0, radius: 14, color: '#f95', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 45 },
        { id: 10, x: 1750, y: 800, vx: 1, vy: 0, radius: 14, color: '#f55', type: 'patroller', timer: 0, shootTimer: 0, shootSpeed: 30 },
        { id: 11, x: 2000, y: 650, vx: 0, vy: 1, radius: 13, color: '#5f5', type: 'vertical', timer: 0, shootTimer: 0, shootSpeed: 35 },
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
        { x: 100, y: 1800, width: 300, height: 50, color: '#444' },
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
        { x: 50, y: 1800, width: 250, height: 40, color: '#444' },
        { x: 400, y: 1750, width: 120, height: 20, color: '#55ffee' },
        { x: 700, y: 1650, width: 150, height: 20, color: '#ff55ee' },
        { x: 550, y: 1680, width: 10, height: 80, color: '#444' },
        { x: 650, y: 1680, width: 10, height: 100, color: '#444' },
        { x: 900, y: 1600, width: 10, height: 60, color: '#444' },
        { x: 850, y: 1600, width: 180, height: 20, color: '#ff5555' },
        { x: 1100, y: 1550, width: 150, height: 20, color: '#55ff55' },
        { x: 1000, y: 1550, width: 10, height: 90, color: '#444' },
        { x: 1200, y: 1550, width: 10, height: 70, color: '#444' },
        { x: 1350, y: 1500, width: 130, height: 20, color: '#5555ff' },
        { x: 1600, y: 1450, width: 140, height: 20, color: '#444' },
        { x: 1850, y: 1400, width: 160, height: 20, color: '#ff55ff' },
        { x: 1500, y: 1400, width: 10, height: 60, color: '#444' },
        { x: 1750, y: 1350, width: 10, height: 80, color: '#444' },
        { x: 1700, y: 1300, width: 150, height: 20, color: '#55ffff' },
        { x: 1400, y: 1200, width: 140, height: 20, color: '#ffff55' },
        { x: 1100, y: 1100, width: 130, height: 20, color: '#ff5555' },
        { x: 1300, y: 1000, width: 160, height: 20, color: '#444' },
        { x: 1600, y: 900, width: 170, height: 20, color: '#55ff55' },
        { x: 1900, y: 800, width: 180, height: 20, color: '#5555ff' },
        { x: 2200, y: 700, width: 200, height: 20, color: '#ff55ee' },
        { x: 2500, y: 600, width: 150, height: 20, color: '#55ffee' },
        { x: 1500, y: 950, width: 10, height: 70, color: '#444' },
        { x: 1800, y: 850, width: 10, height: 90, color: '#444' },
        { x: 2100, y: 750, width: 10, height: 60, color: '#444' },
        { x: 2400, y: 650, width: 10, height: 80, color: '#444' },
        // Moving platforms
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
        { x: 150, y: 1800, width: 200, height: 30, color: '#444' },
        { x: 450, y: 1750, width: 300, height: 20, color: '#55ffee' },
        { x: 450, y: 1650, width: 20, height: 100, color: '#55ffee' },
        { x: 730, y: 1650, width: 20, height: 100, color: '#55ffee' },
        { x: 500, y: 1700, width: 200, height: 20, color: '#ff55ee' },
        { x: 550, y: 1650, width: 100, height: 20, color: '#ff55ee' },
        { x: 350, y: 1600, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 350, maxX: 450 },
        { x: 850, y: 1600, width: 300, height: 20, color: '#ffff55' },
        { x: 850, y: 1500, width: 20, height: 100, color: '#ffff55' },
        { x: 1130, y: 1500, width: 20, height: 100, color: '#ffff55' },
        { x: 900, y: 1550, width: 200, height: 20, color: '#ff5555' },
        { x: 950, y: 1500, width: 100, height: 20, color: '#ff5555' },
        { x: 750, y: 1550, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 750, maxX: 850 },
        { x: 1250, y: 1450, width: 300, height: 20, color: '#55ff55' },
        { x: 1250, y: 1350, width: 20, height: 100, color: '#55ff55' },
        { x: 1530, y: 1350, width: 20, height: 100, color: '#55ff55' },
        { x: 1300, y: 1400, width: 200, height: 20, color: '#5555ff' },
        { x: 1350, y: 1350, width: 100, height: 20, color: '#5555ff' },
        { x: 1150, y: 1400, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 1150, maxX: 1250 },
        { x: 1650, y: 1300, width: 300, height: 20, color: '#ff55ff' },
        { x: 1650, y: 1200, width: 20, height: 100, color: '#ff55ff' },
        { x: 1930, y: 1200, width: 20, height: 100, color: '#ff55ff' },
        { x: 1700, y: 1250, width: 200, height: 20, color: '#55ffff' },
        { x: 1750, y: 1200, width: 100, height: 20, color: '#55ffff' },
        { x: 1550, y: 1250, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 2, minX: 1550, maxX: 1650 },
        { x: 2050, y: 1150, width: 300, height: 20, color: '#ffff55' },
        { x: 2050, y: 1050, width: 20, height: 100, color: '#ffff55' },
        { x: 2330, y: 1050, width: 20, height: 100, color: '#ffff55' },
        { x: 2100, y: 1100, width: 200, height: 20, color: '#ff5555' },
        { x: 2150, y: 1050, width: 100, height: 20, color: '#ff5555' },
        { x: 1950, y: 1100, width: 80, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 3, minX: 1950, maxX: 2050 },
        { x: 2150, y: 900, width: 400, height: 20, color: '#55ff55' },
        { x: 2150, y: 750, width: 20, height: 150, color: '#55ff55' },
        { x: 2530, y: 750, width: 20, height: 150, color: '#55ff55' },
        { x: 2150, y: 750, width: 400, height: 20, color: '#55ff55' }
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
        { x: 100, y: 1800, width: 300, height: 40, color: '#444' },
        { x: 550, y: 1750, width: 100, height: 200, color: '#ff55ee' },
        { x: 400, y: 1700, width: 150, height: 15, color: '#ffff55' },
        { x: 750, y: 1700, width: 120, height: 250, color: '#55ffee' },
        { x: 650, y: 1650, width: 100, height: 15, color: '#ffff55' },
        { x: 950, y: 1650, width: 150, height: 300, color: '#ff5555' },
        { x: 870, y: 1600, width: 80, height: 15, color: '#ffff55' },
        { x: 1200, y: 1600, width: 130, height: 350, color: '#55ff55' },
        { x: 1100, y: 1550, width: 100, height: 15, color: '#ffff55' },
        { x: 1450, y: 1550, width: 120, height: 400, color: '#5555ff' },
        { x: 1330, y: 1500, width: 120, height: 15, color: '#ffff55' },
        { x: 1700, y: 1500, width: 140, height: 450, color: '#ff55ff' },
        { x: 1570, y: 1450, width: 130, height: 15, color: '#ffff55' },
        { x: 1950, y: 1450, width: 160, height: 500, color: '#55ffff' },
        { x: 1840, y: 1400, width: 110, height: 15, color: '#ffff55' },
        { x: 2200, y: 1400, width: 180, height: 550, color: '#ffff55' },
        { x: 2110, y: 1350, width: 90, height: 15, color: '#ffff55' },
        { x: 2450, y: 1350, width: 200, height: 600, color: '#ff5555' },
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
        { x: 2500, y: 750, width: 50, height: 15, color: '#ff9500', movingPlatform: true, direction: 1, speed: 6, minX: 2500, maxX: 2500, minY: 750, maxY: 1300, vertical: true }
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

  // === AUDIO FUNCTIONS (inside the component) ===
  const playLevelMusic = (levelName) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    stopMusic();
    const musicTrack = battleMusic[levelName];
    if (musicTrack) {
      audioRef.current.src = `${process.env.PUBLIC_URL}/sounds/${musicTrack}`;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio playback was prevented:", error);
        });
      }
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Manage music based on gameState
  useEffect(() => {
    if (gameState === 'playing' || gameState === 'info') {
      const levelName = levels[currentLevel].name;
      playLevelMusic(levelName);
    } else {
      stopMusic();
    }
    return () => {
      stopMusic();
    };
  }, [gameState, currentLevel, levels]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 1200);
      const maxHeight = Math.min(window.innerHeight - 100, 800);
      const aspectRatio = 3 / 2;
      let width = maxWidth;
      let height = width / aspectRatio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      setCanvasSize({ width, height });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
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
        case ' ':
          setKeys(prev => ({ ...prev, space: true }));
          if (gameState === 'menu') {
            startNewGame();
          } else if (gameState === 'gameOver') {
            setGameState('menu');
          } else if (gameState === 'info') {
            setShowInfo(false);
            setGameState('playing');
            playLevelMusic(levels[currentLevel].name);
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
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
        case ' ':
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
  }, [gameState, currentLevel, levels]);

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

  // Modified resetGame to include the level key for image lookup
  const resetGame = (isFirstLevel = false) => {
    if (isFirstLevel) {
      const randomLevelIndex = Math.floor(Math.random() * levels.length);
      setCurrentLevel(randomLevelIndex);
    } else {
      const nextLevel = (currentLevel + 1) % levels.length;
      setCurrentLevel(nextLevel);
    }
    const levelData = levels[currentLevel];
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
    setCamera({
      x: Math.max(0, levelData.doors.start.x - canvasSize.width / 2),
      y: Math.max(0, levelData.doors.start.y - canvasSize.height / 2)
    });
    setProjectiles([]);
    if (isFirstLevel) {
      setHealth(100);
      setEnergy(100);
    }
    setPlatforms(levelData.platforms);
    setDoors(levelData.doors);
    setDrones(levelData.drones);
    setPowerUps(levelData.powerUps);
    // Pass the level key with the battle description
    setInfoText({ ...battleDescriptions[levelData.name], level: levelData.name });
    setShowInfo(true);
    setGameState('info');
  };

  const startNewGame = () => {
    resetGame(true);
  };

  // Utility collision functions
  const checkCollision = (circle, rect) => {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared < circle.radius * circle.radius;
  };

  const checkCircleCollision = (circle1, circle2) => {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  };

  // Automatically move to the next level when winning
  useEffect(() => {
    if (gameState === 'win') {
      stopMusic();
      const nextLevelTimer = setTimeout(() => {
        setGameState('playing');
        resetGame(false);
      }, 2000);
      return () => clearTimeout(nextLevelTimer);
    }
  }, [gameState]);

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    let animationFrameId;
    let lastTime = 0;
    const gameLoop = (time) => {
      if (gameState !== 'playing') return;
      const deltaTime = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      if (mouse.down && energy > 0) {
        setPlayerStats(prev => ({ ...prev, shield: true }));
        setEnergy(prev => Math.max(0, prev - deltaTime * 4));
      } else {
        setPlayerStats(prev => ({ ...prev, shield: false }));
        setEnergy(prev => Math.min(100, prev + deltaTime * 6));
      }
      if (energy <= 0) {
        setHealth(prev => {
          const newHealth = prev - deltaTime * 2;
          if (newHealth <= 0) {
            setGameState('gameOver');
            stopMusic();
            return 0;
          }
          return newHealth;
        });
      }
      setPlatforms(prevPlatforms => {
        return prevPlatforms.map(platform => {
          if (platform.movingPlatform) {
            const newPlatform = { ...platform };
            if (platform.vertical) {
              newPlatform.y += platform.direction * platform.speed;
              if (newPlatform.y <= platform.minY) {
                newPlatform.direction = 1;
              } else if (newPlatform.y >= platform.maxY) {
                newPlatform.direction = -1;
              }
            } else {
              newPlatform.x += platform.direction * platform.speed;
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
      setPlayer(prevPlayer => {
        let newPlayer = { ...prevPlayer };
        newPlayer.vy += gravity;
        if (keys.left) {
          newPlayer.vx = -playerStats.speed;
        } else if (keys.right) {
          newPlayer.vx = playerStats.speed;
        } else {
          newPlayer.vx *= friction;
        }
        if (keys.up && newPlayer.grounded && !newPlayer.jumping) {
          newPlayer.vy = jumpForce;
          newPlayer.grounded = false;
          newPlayer.jumping = true;
        }
        newPlayer.x += newPlayer.vx;
        newPlayer.y += newPlayer.vy;
        newPlayer.grounded = false;
        let onPlatform = false;
        for (const platform of platforms) {
          if (checkCollision(newPlayer, platform)) {
            const closestX = Math.max(platform.x, Math.min(newPlayer.x, platform.x + platform.width));
            const closestY = Math.max(platform.y, Math.min(newPlayer.y, platform.y + platform.height));
            const distanceX = newPlayer.x - closestX;
            const distanceY = newPlayer.y - closestY;
            if (Math.abs(distanceX) > Math.abs(distanceY)) {
              if (distanceX > 0) {
                newPlayer.x = platform.x + platform.width + newPlayer.radius;
              } else {
                newPlayer.x = platform.x - newPlayer.radius;
              }
              newPlayer.vx = 0;
            } else {
              if (distanceY > 0) {
                newPlayer.y = platform.y + platform.height + newPlayer.radius;
                newPlayer.vy = 0;
              } else {
                newPlayer.y = platform.y - newPlayer.radius;
                newPlayer.vy = 0;
                newPlayer.grounded = true;
                onPlatform = true;
                newPlayer.jumping = false;
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
        if (newPlayer.x - newPlayer.radius < 0) {
          newPlayer.x = newPlayer.radius;
          newPlayer.vx = 0;
        } else if (newPlayer.x + newPlayer.radius > worldSize.width) {
          newPlayer.x = worldSize.width - newPlayer.radius;
          newPlayer.vx = 0;
        }
        if (newPlayer.y + newPlayer.radius > worldSize.height) {
          setGameState('gameOver');
          stopMusic();
          return newPlayer;
        }
        if (newPlayer.y - newPlayer.radius < 0) {
          newPlayer.y = newPlayer.radius;
          newPlayer.vy = 0;
        }
        if (checkCollision(newPlayer, doors.end)) {
          setGameState('win');
        }
        powerUps.forEach((powerUp, index) => {
          if (powerUp.active && checkCircleCollision(newPlayer, powerUp)) {
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
            setPowerUps(prev => {
              const newPowerUps = [...prev];
              newPowerUps[index].active = false;
              return newPowerUps;
            });
          }
        });
        setCamera({
          x: Math.max(0, Math.min(newPlayer.x - canvasSize.width / 2, worldSize.width - canvasSize.width)),
          y: Math.max(0, Math.min(newPlayer.y - canvasSize.height / 2, worldSize.height - canvasSize.height))
        });
        return newPlayer;
      });
      setDrones(prevDrones => {
        return prevDrones.map(drone => {
          const newDrone = { ...drone };
          newDrone.timer += 1;
          newDrone.shootTimer = (newDrone.shootTimer || 0) + 1;
          if (newDrone.shootTimer > newDrone.shootSpeed) {
            newDrone.shootTimer = 0;
            const dx = player.x - newDrone.x;
            const dy = player.y - newDrone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 500) {
              const accuracy = newDrone.type === 'boss' ? 0.05 : 0.15;
              const spreadX = (Math.random() - 0.5) * 2 * accuracy;
              const spreadY = (Math.random() - 0.5) * 2 * accuracy;
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
          switch (newDrone.type) {
            case 'patroller':
              if (newDrone.timer > 100) {
                newDrone.vx *= -1;
                newDrone.timer = 0;
              }
              break;
            case 'vertical':
              if (newDrone.timer > 80) {
                newDrone.vy *= -1;
                newDrone.timer = 0;
              }
              break;
            case 'chaser':
              const dx = player.x - newDrone.x;
              const dy = player.y - newDrone.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 300) {
                newDrone.vx = (dx / dist) * 2;
                newDrone.vy = (dy / dist) * 2;
              } else {
                if (newDrone.timer > 50) {
                  newDrone.vx = (Math.random() - 0.5) * 2;
                  newDrone.vy = (Math.random() - 0.5) * 2;
                  newDrone.timer = 0;
                }
              }
              break;
            case 'turret':
              newDrone.vx = 0;
              newDrone.vy = 0;
              break;
            case 'bouncer':
              if (newDrone.timer > 30) {
                newDrone.vx = (Math.random() - 0.5) * 4;
                newDrone.vy = (Math.random() - 0.5) * 4;
                newDrone.timer = 0;
              }
              break;
            case 'boss':
              if (newDrone.timer % 120 < 60) {
                const angle = newDrone.timer * 0.05;
                newDrone.vx = Math.cos(angle) * 2;
                newDrone.vy = Math.sin(angle) * 2;
              } else if (newDrone.timer % 120 < 90) {
                const dx = player.x - newDrone.x;
                const dy = player.y - newDrone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 10) {
                  newDrone.vx = (dx / dist) * 3;
                  newDrone.vy = (dy / dist) * 3;
                }
              } else {
                const dx = player.x - newDrone.x;
                const dy = player.y - newDrone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 10) {
                  newDrone.vx = (-dx / dist) * 2;
                  newDrone.vy = (-dy / dist) * 2;
                }
              }
              break;
            default:
              break;
          }
          newDrone.x += newDrone.vx;
          newDrone.y += newDrone.vy;
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
          if (checkCircleCollision(newDrone, player)) {
            if (!playerStats.shield) {
              setHealth(prev => {
                const newHealth = prev - 1;
                if (newHealth <= 0) {
                  setGameState('gameOver');
                  stopMusic();
                  return 0;
                }
                return newHealth;
              });
              setPlayer(prevPlayer => {
                const knockbackX = prevPlayer.x - newDrone.x;
                const knockbackY = prevPlayer.y - newDrone.y;
                const knockbackDist = Math.sqrt(knockbackX * knockbackX + knockbackY * knockbackY);
                if (knockbackDist > 0) {
                  return {
                    ...prevPlayer,
                    vx: (knockbackX / knockbackDist) * 5,
                    vy: (knockbackY / knockbackDist) * 5
                  };
                }
                return prevPlayer;
              });
            }
          }
          for (const platform of platforms) {
            if (checkCollision(newDrone, platform)) {
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
      setProjectiles(prevProjectiles => {
        const updatedProjectiles = prevProjectiles.map(projectile => {
          const newProjectile = { ...projectile };
          newProjectile.x += newProjectile.vx;
          newProjectile.y += newProjectile.vy;
          newProjectile.timer += 1;
          return newProjectile;
        });
        const filteredProjectiles = updatedProjectiles.filter(projectile => {
          if (
            projectile.x < -projectile.radius ||
            projectile.x > worldSize.width + projectile.radius ||
            projectile.y < -projectile.radius ||
            projectile.y > worldSize.height + projectile.radius ||
            projectile.timer > 120
          ) {
            return false;
          }
          if (projectile.source === 'drone' && checkCircleCollision(projectile, player)) {
            if (playerStats.shield) {
              return false;
            } else {
              setHealth(prev => {
                const newHealth = prev - 2;
                if (newHealth <= 0) {
                  setGameState('gameOver');
                  stopMusic();
                  return 0;
                }
                return newHealth;
              });
              return false;
            }
          }
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
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, keys, player, platforms, doors, powerUps, mouse, energy, playerStats, worldSize.width, worldSize.height, canvasSize.width, canvasSize.height, gravity, friction, jumpForce, currentLevel]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (gameState === 'menu') {
      ctx.fillStyle = '#36f9f6';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VIET-GON', canvas.width / 2, canvas.height / 3);
      ctx.fillStyle = '#f55';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Vietnam War Battles', canvas.width / 2, canvas.height / 3 + 40);
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
      ctx.font = '18px Arial';
      ctx.fillText('Use ARROW KEYS or WASD to move and jump', canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText('HOLD MOUSE BUTTON for shield (drains energy)', canvas.width / 2, canvas.height / 2 + 70);
      ctx.fillText('When energy is 0, health will drain!', canvas.width / 2, canvas.height / 2 + 100);
      ctx.fillText("Don't fall off platforms - it's instant death!", canvas.width / 2, canvas.height / 2 + 130);
      ctx.fillText('Reach the red door to win and progress to next level', canvas.width / 2, canvas.height / 2 + 160);
    } else if (gameState === 'info') {
      if (infoText) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#36f9f6';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(infoText.title, canvas.width / 2, 100);
        ctx.fillStyle = '#f55';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(infoText.year, canvas.width / 2, 140);
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        const maxWidth = canvas.width - 100;
        const lineHeight = 30;
        const words = infoText.description.split(' ');
        let line = '';
        let y = 200;
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth) {
            ctx.fillText(line, canvas.width / 2, y);
            line = words[i] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);
        ctx.fillStyle = '#ffff55';
        ctx.font = 'italic 18px Arial';
        y += lineHeight * 2;
        const gameplayWords = infoText.gameplay.split(' ');
        line = '';
        for (let i = 0; i < gameplayWords.length; i++) {
          const testLine = line + gameplayWords[i] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth) {
            ctx.fillText(line, canvas.width / 2, y);
            line = gameplayWords[i] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to Begin Battle', canvas.width / 2, canvas.height - 100);
        const battleName = infoText.level;
        if (battleName && battleImages[battleName]) {
          const img = new Image();
          img.src = `${process.env.PUBLIC_URL}${battleImages[battleName]}`;
          img.onload = () => {
            ctx.globalAlpha = 0.3;
            ctx.drawImage(img, canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 300);
            ctx.globalAlpha = 1.0;
          };
          img.onerror = (e) => {
            console.error('Error loading image:', e);
            ctx.fillStyle = 'rgba(255, 85, 85, 0.2)';
            ctx.fillRect(canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 300);
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText('Image not available', canvas.width / 2, canvas.height / 2);
          };
        }
      }
    } else if (gameState === 'playing' || gameState === 'gameOver' || gameState === 'win') {
      ctx.save();
      ctx.translate(-camera.x, -camera.y);
      platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      });
      ctx.fillStyle = doors.start.color;
      ctx.fillRect(doors.start.x, doors.start.y, doors.start.width, doors.start.height);
      ctx.fillStyle = doors.end.color;
      ctx.fillRect(doors.end.x, doors.end.y, doors.end.width, doors.end.height);
      powerUps.forEach(powerUp => {
        if (powerUp.active) {
          ctx.fillStyle = powerUp.color;
          ctx.beginPath();
          ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = powerUp.color;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
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
      projectiles.forEach(projectile => {
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();
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
      drones.forEach(drone => {
        ctx.fillStyle = drone.color;
        ctx.beginPath();
        ctx.arc(drone.x, drone.y, drone.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        if (drone.type === 'shooter' || drone.type === 'turret') {
          ctx.beginPath();
          ctx.arc(drone.x, drone.y, drone.radius * 0.7, 0, Math.PI * 2);
          ctx.stroke();
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
          const angle = Math.atan2(player.y - drone.y, player.x - drone.x);
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
          const pulseSize = 0.5 + 0.2 * Math.sin(Date.now() / 200);
          ctx.beginPath();
          ctx.arc(drone.x, drone.y, drone.radius * pulseSize, 0, Math.PI * 2);
          ctx.stroke();
        } else if (drone.type === 'boss') {
          ctx.beginPath();
          ctx.arc(drone.x, drone.y, drone.radius * 0.8, 0, Math.PI * 2);
          ctx.stroke();
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
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      if (playerStats.shield) {
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 1.3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      ctx.restore();
      ctx.fillStyle = '#fff';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(20, 20, 200, 20);
      ctx.fillStyle = health > 50 ? '#2ecc71' : health > 25 ? '#f1c40f' : '#e74c3c';
      ctx.fillRect(20, 20, health * 2, 20);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 200, 20);
      ctx.fillStyle = energy > 0 ? '#fff' : '#f55';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Health: ${Math.floor(health)}%`, 25, 36);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(20, 50, 200, 20);
      ctx.fillStyle = energy > 20 ? '#3498db' : '#e74c3c';
      ctx.fillRect(20, 50, energy * 2, 20);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 50, 200, 20);
      ctx.fillStyle = energy > 20 ? '#fff' : '#ffff00';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Energy: ${Math.floor(energy)}%`, 25, 66);
      if (energy <= 0) {
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('WARNING: Health draining!', 25, 90);
      }
      const mapWidth = 150;
      const mapHeight = 100;
      const mapX = canvas.width - mapWidth - 20;
      const mapY = 20;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);
      const scaleX = mapWidth / worldSize.width;
      const scaleY = mapHeight / worldSize.height;
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(mapX + player.x * scaleX, mapY + player.y * scaleY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = doors.start.color;
      ctx.fillRect(mapX + doors.start.x * scaleX, mapY + doors.start.y * scaleY, doors.start.width * scaleX, doors.start.height * scaleY);
      ctx.fillStyle = doors.end.color;
      ctx.fillRect(mapX + doors.end.x * scaleX, mapY + doors.end.y * scaleY, doors.end.width * scaleX, doors.end.height * scaleY);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(mapX + camera.x * scaleX, mapY + camera.y * scaleY, canvasSize.width * scaleX, canvasSize.height * scaleY);
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
  }, [gameState, platforms, doors, player, drones, projectiles, powerUps, health, energy, playerStats, camera, worldSize.width, worldSize.height, canvasSize.width, canvasSize.height, currentLevel, levels, infoText, showInfo]);

  return (
    <div
      style={{
        color: '#eee',
        backgroundColor: '#222',
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <header>
        <h1
          style={{
            color: '#36f9f6',
            margin: '0 0 20px 0',
            fontFamily: 'monospace',
            textShadow: '2px 2px #000'
          }}
        >
          VIET-GON
        </h1>
        <h2
          style={{
            color: '#f55',
            margin: '-15px 0 20px 0',
            fontFamily: 'monospace',
            fontSize: '18px'
          }}
        >
          Vietnam War Battles
        </h2>
      </header>
      <main>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            backgroundColor: '#111',
            borderRadius: '5px',
            boxShadow: '0 0 20px rgba(54, 249, 246, 0.5)'
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
          <button
            style={{
              padding: '8px 15px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#f55',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
            onClick={() => {
              if (gameState === 'playing') {
                stopMusic();
                setGameState('menu');
              }
            }}
          >
            MENU
          </button>
        </div>
      </main>
      <footer
        style={{
          fontSize: '0.9rem',
          color: '#aaa',
          marginTop: '20px',
          fontFamily: 'monospace'
        }}
      >
        <p>Use arrow keys or WASD to move and jump. Hold mouse button for shield (drains energy).</p>
        <p>When energy is depleted, health will drain! Don't fall off platforms!</p>
        <p>Collect power-ups and reach the red door to win.</p>
        <p style={{ color: '#f55' }}>
          Experience legendary battles of the Vietnam War in this n-gon style platformer.
        </p>
      </footer>
    </div>
  );
}

export default App;
