// frontend/src/wasm/wasmModule.js
// This file handles loading and interfacing with the WebAssembly module

const wasmModule = {
  instance: null,
  module: null,
  initialized: false,
  entityData: [],
  
  // Initialize WebAssembly module
  async init() {
    try {
      // Load WebAssembly module
      const response = await fetch('/wasm/dodgeball.wasm');
      const wasmBytes = await response.arrayBuffer();
      
      // Instantiate the WebAssembly module
      const results = await WebAssembly.instantiate(wasmBytes, this.getImportObject());
      this.module = results.module;
      this.instance = results.instance;
      
      // Initialize memory for entity data transfer
      this.setupMemory();
      
      // Call C++ initialization function
      this.instance.exports.initGame();
      this.initialized = true;
      
      console.log('WebAssembly module loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load WebAssembly module:', error);
      
      // Fallback to JavaScript implementation for development
      this.setupFallbackImplementation();
      
      return false;
    }
  },
  
  // Create import object for WebAssembly instantiation
  getImportObject() {
    return {
      env: {
        emscripten_notify_memory_growth: () => {},
        
        // Audio functions exposed to C++
        playSound: (soundIdPtr) => {
          const soundId = this.getStringFromPtr(soundIdPtr);
          console.log(`Playing sound: ${soundId}`);
        },
        
        stopSound: (soundIdPtr) => {
          const soundId = this.getStringFromPtr(soundIdPtr);
          console.log(`Stopping sound: ${soundId}`);
        },
        
        playMusic: (musicIdPtr, loop) => {
          const musicId = this.getStringFromPtr(musicIdPtr);
          console.log(`Playing music: ${musicId}, loop: ${loop}`);
        },
        
        stopMusic: () => {
          console.log('Stopping music');
        },
        
        // Debug logging from C++
        consoleLog: (messagePtr) => {
          const message = this.getStringFromPtr(messagePtr);
          console.log(`[WASM] ${message}`);
        }
      }
    };
  },
  
  // Setup memory for entity data transfer
  setupMemory() {
    if (!this.instance || !this.instance.exports.memory) {
      return;
    }
    
    // Initialize memory view
    this.memory = this.instance.exports.memory;
  },
  
  // Helper to get a JavaScript string from a pointer in WebAssembly memory
  getStringFromPtr(ptr) {
    if (!this.memory) {
      return '';
    }
    
    const memory = new Uint8Array(this.memory.buffer);
    let str = '';
    let i = ptr;
    
    while (memory[i] !== 0) {
      str += String.fromCharCode(memory[i]);
      i++;
    }
    
    return str;
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
      exports: {
        initGame: () => {
          this.mockGameState = 0;
          this.mockPlayerHealth = 100;
          console.log('Initialized mock game');
        },
        
        updateGame: (deltaTime) => {
          // Update mock entities
          if (this.mockGameState === 1) { // PLAYING
            this.mockEntities.forEach(entity => {
              if (entity.type === 1) { // Drone
                // Simple movement
                entity.x += (Math.random() - 0.5) * 5;
                entity.y += (Math.random() - 0.5) * 5;
              }
            });
          }
        },
        
        handleInput: (inputCode, pressed) => {
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
          }
        },
        
        getGameState: () => {
          return this.mockGameState;
        },
        
        getEntityCount: () => {
          return this.mockEntities.length;
        },
        
        getPlayerHealth: () => {
          return this.mockPlayerHealth;
        },
        
        // Mock memory allocation/deallocation
        malloc: (size) => {
          return 0; // Not needed in fallback
        },
        
        free: (ptr) => {
          // Not needed in fallback
        }
      }
    };
    
    this.initialized = true;
  },
  
  // Update game state
  update(deltaTime) {
    if (!this.initialized) {
      return;
    }
    
    this.instance.exports.updateGame(deltaTime);
    this.updateEntityData();
  },
  
  // Handle input
  handleInput(inputCode, pressed) {
    if (!this.initialized) {
      return;
    }
    
    this.instance.exports.handleInput(inputCode, pressed);
  },
  
  // Get current game state
  getGameState() {
    if (!this.initialized) {
      return 0;
    }
    
    return this.instance.exports.getGameState();
  },
  
  // Update entity data from WebAssembly
  updateEntityData() {
    if (!this.initialized) {
      // Return mock entities if using fallback
      if (this.mockEntities) {
        this.entityData = [...this.mockEntities];
        return;
      }
      
      this.entityData = [];
      return;
    }
    
    const entityCount = this.instance.exports.getEntityCount();
    
    // Skip if no entities
    if (entityCount <= 0) {
      this.entityData = [];
      return;
    }
    
    // Allocate memory in WebAssembly module for entity data
    const dataSize = entityCount * 5 * 4; // 5 fields per entity, 4 bytes per field
    const dataPtr = this.instance.exports.malloc(dataSize);
    
    if (!dataPtr) {
      console.error('Failed to allocate memory for entity data');
      return;
    }
    
    // Get entity data from WebAssembly
    this.instance.exports.getEntityData(dataPtr, entityCount);
    
    try {
      // Copy data from WebAssembly memory
      const dataView = new DataView(this.memory.buffer, dataPtr, dataSize);
      
      // Parse entity data
      this.entityData = [];
      for (let i = 0; i < entityCount; i++) {
        const offset = i * 5 * 4;
        
        this.entityData.push({
          id: dataView.getInt32(offset, true),
          type: dataView.getInt32(offset + 4, true),
          x: dataView.getFloat32(offset + 8, true),
          y: dataView.getFloat32(offset + 12, true),
          radius: dataView.getFloat32(offset + 16, true)
        });
      }
    } catch (error) {
      console.error('Error parsing entity data:', error);
    } finally {
      // Free allocated memory
      this.instance.exports.free(dataPtr);
    }
  },
  
  // Get player health
  getPlayerHealth() {
    if (!this.initialized) {
      return this.mockPlayerHealth || 0;
    }
    
    return this.instance.exports.getPlayerHealth();
  },
  
  // Get all entity data
  getEntities() {
    return this.entityData;
  }
};

export default wasmModule;