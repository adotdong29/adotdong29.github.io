// src/wasm/wasmModule.js
// This file handles loading and interfacing with the WebAssembly module

const wasmModule = {
  instance: null,
  initialized: false,
  entityData: [],
  
  // Initialize WebAssembly module
  async init() {
    try {
      // Load WebAssembly module
      const response = await fetch('/wasm/dodgeball.wasm');
      const wasmBytes = await response.arrayBuffer();
      
      // Load the JavaScript glue code
      // We're using the global DodgeballModule that was created in public/wasm/dodgeball.js
      if (typeof DodgeballModule !== 'undefined') {
        this.instance = DodgeballModule;
        this.initialized = true;
        console.log('WebAssembly module loaded successfully');
        return true;
      } else {
        console.error('DodgeballModule not found');
        
        // Set up fallback implementation
        this.setupFallbackImplementation();
        return false;
      }
    } catch (error) {
      console.error('Failed to load WebAssembly module:', error);
      
      // Fallback to JavaScript implementation for development
      this.setupFallbackImplementation();
      
      return false;
    }
  },
  
  // Setup fallback implementation for development
  setupFallbackImplementation() {
    console.log('Using JavaScript fallback implementation');
    
    // Mock entities
    this.mockEntities = [
      { id: 1, type: 0, x: 400, y: 300, radius: 15 }, // Player
      { id: 2, type: 1, x: 200, y: 100, radius: 12 }, // Drone
      { id: 3, type: 1, x: 600, y: 100, radius: 12 }, // Drone
      { id: 4, type: 1, x: 300, y: 500, radius: 12 }  // Drone
    ];
    
    // Mock game state
    this.mockGameState = 0; // MENU
    
    // Mock player health
    this.mockPlayerHealth = 100;
    
    // Override WebAssembly functions with JavaScript implementations
    this.instance = {
      _initGame: () => {
        this.mockGameState = 0;
        this.mockPlayerHealth = 100;
        console.log('Initialized mock game');
        return 0;
      },
      
      _updateGame: (deltaTime) => {
        // Update mock entities
        if (this.mockGameState === 1) { // PLAYING
          // Move player
          const playerEntity = this.mockEntities.find(e => e.type === 0);
          
          // Move drones
          this.mockEntities.forEach(entity => {
            if (entity.type === 1) { // Drone
              // Simple movement
              entity.x += (Math.random() - 0.5) * 5;
              entity.y += (Math.random() - 0.5) * 5;
              
              // Keep within bounds
              entity.x = Math.max(entity.radius, Math.min(800 - entity.radius, entity.x));
              entity.y = Math.max(entity.radius, Math.min(600 - entity.radius, entity.y));
              
              // Check collision with player
              if (playerEntity) {
                const dx = playerEntity.x - entity.x;
                const dy = playerEntity.y - entity.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < playerEntity.radius + entity.radius) {
                  // Collision - reduce health
                  this.mockPlayerHealth -= 0.5;
                  
                  // Push player away
                  const pushX = dx / distance * 5;
                  const pushY = dy / distance * 5;
                  playerEntity.x += pushX;
                  playerEntity.y += pushY;
                  
                  // Keep player within bounds
                  playerEntity.x = Math.max(playerEntity.radius, Math.min(800 - playerEntity.radius, playerEntity.x));
                  playerEntity.y = Math.max(playerEntity.radius, Math.min(600 - playerEntity.radius, playerEntity.y));
                  
                  // Game over if health reaches 0
                  if (this.mockPlayerHealth <= 0) {
                    this.mockGameState = 2; // GAME_OVER
                    this.mockPlayerHealth = 0;
                  }
                }
              }
            }
          });
        }
        return 0;
      },
      
      _handleInput: (inputCode, pressed) => {
        // Handle input in mock implementation
        const playerEntity = this.mockEntities.find(e => e.type === 0);
        
        if (pressed && inputCode === 4) { // FIRE
          if (this.mockGameState === 0) { // MENU
            this.mockGameState = 1; // PLAYING
          } else if (this.mockGameState === 2) { // GAME_OVER
            this.mockGameState = 0; // MENU
          }
        }
        
        if (this.mockGameState === 1 && playerEntity) { // PLAYING
          const speed = 5;
          
          switch (inputCode) {
            case 0: // UP
              if (pressed) playerEntity.y -= speed;
              break;
            case 1: // DOWN
              if (pressed) playerEntity.y += speed;
              break;
            case 2: // LEFT
              if (pressed) playerEntity.x -= speed;
              break;
            case 3: // RIGHT
              if (pressed) playerEntity.x += speed;
              break;
          }
          
          // Keep player within bounds
          playerEntity.x = Math.max(playerEntity.radius, Math.min(800 - playerEntity.radius, playerEntity.x));
          playerEntity.y = Math.max(playerEntity.radius, Math.min(600 - playerEntity.radius, playerEntity.y));
        }
        return 0;
      },
      
      _getGameState: () => {
        return this.mockGameState;
      },
      
      _getEntityCount: () => {
        return this.mockEntities.length;
      },
      
      _getPlayerHealth: () => {
        return this.mockPlayerHealth;
      }
    };
    
    this.initialized = true;
  },
  
  // Update game state
  update(deltaTime) {
    if (!this.initialized) {
      return;
    }
    
    this.instance._updateGame(deltaTime);
    this.updateEntityData();
  },
  
  // Handle input
  handleInput(inputCode, pressed) {
    if (!this.initialized) {
      return;
    }
    
    this.instance._handleInput(inputCode, pressed);
  },
  
  // Get current game state
  getGameState() {
    if (!this.initialized) {
      return 0;
    }
    
    return this.instance._getGameState();
  },
  
  // Update entity data
  updateEntityData() {
    if (!this.initialized) {
      return;
    }
    
    // If we have mock entities, use those
    if (this.mockEntities) {
      this.entityData = [...this.mockEntities];
      return;
    }
    
    // In a real implementation, this would get data from WebAssembly
    const entityCount = this.instance._getEntityCount();
    
    // We'll use our mock implementation for now
    if (!this.entityData || this.entityData.length === 0) {
      this.entityData = [
        { id: 1, type: 0, x: 400, y: 300, radius: 15 }, // Player
        { id: 2, type: 1, x: 200, y: 100, radius: 12 }, // Drone
        { id: 3, type: 1, x: 600, y: 100, radius: 12 }, // Drone
        { id: 4, type: 1, x: 300, y: 500, radius: 12 }  // Drone
      ];
    }
  },
  
  // Get player health
  getPlayerHealth() {
    if (!this.initialized) {
      return 0;
    }
    
    return this.instance._getPlayerHealth();
  },
  
  // Get all entity data
  getEntities() {
    return this.entityData;
  }
};

export default wasmModule;