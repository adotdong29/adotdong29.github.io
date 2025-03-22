// frontend/src/wasm/wasmModule.js
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
      
      // Instantiate the WebAssembly module
      const results = await WebAssembly.instantiate(wasmBytes, this.getImportObject());
      this.instance = results.instance;
      
      // Call C++ initialization function
      this.instance.exports.initGame();
      this.initialized = true;
      
      console.log('WebAssembly module loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load WebAssembly module:', error);
      return false;
    }
  },
  
  // Create import object for WebAssembly instantiation
  getImportObject() {
    return {
      env: {
        emscripten_notify_memory_growth: () => {},
        // Add any other required imports here
      }
    };
  },
  
  // Update game state
  update(deltaTime) {
    if (!this.initialized) return;
    
    this.instance.exports.updateGame(deltaTime);
    this.updateEntityData();
  },
  
  // Handle input
  handleInput(inputCode, pressed) {
    if (!this.initialized) return;
    
    this.instance.exports.handleInput(inputCode, pressed);
  },
  
  // Get current game state
  getGameState() {
    if (!this.initialized) return 0;
    
    return this.instance.exports.getGameState();
  },
  
  // Update entity data from WebAssembly
  updateEntityData() {
    if (!this.initialized) return;
    
    const entityCount = this.instance.exports.getEntityCount();
    
    // Skip if no entities
    if (entityCount <= 0) {
      this.entityData = [];
      return;
    }
    
    // Allocate memory in WebAssembly module for entity data
    const dataSize = entityCount * 5 * 4; // 5 fields per entity, 4 bytes per field
    const dataPtr = this.instance.exports.malloc(dataSize);
    
    // Get entity data from WebAssembly
    this.instance.exports.getEntityData(dataPtr, entityCount);
    
    // Copy data from WebAssembly memory
    const dataView = new DataView(this.instance.exports.memory.buffer, dataPtr, dataSize);
    
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
    
    // Free allocated memory
    this.instance.exports.free(dataPtr);
  },
  
  // Get player health
  getPlayerHealth() {
    if (!this.initialized) return 0;
    
    return this.instance.exports.getPlayerHealth();
  },
  
  // Get all entity data
  getEntities() {
    return this.entityData;
  }
};

export default wasmModule;