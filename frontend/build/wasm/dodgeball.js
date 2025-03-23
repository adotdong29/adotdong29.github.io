// frontend/public/wasm/dodgeball.js
// Placeholder for WebAssembly module

var DodgeballModule = (function() {
  'use strict';
  
  var Module = {
    onRuntimeInitialized: function() {
      console.log("Dodgeball WebAssembly module initialized");
    }
  };
  
  // Entity data structure
  var entities = [
    { id: 1, type: 0, x: 400, y: 300, radius: 15 }, // Player
    { id: 2, type: 1, x: 200, y: 100, radius: 12 }, // Drone
    { id: 3, type: 1, x: 600, y: 100, radius: 12 }, // Drone
    { id: 4, type: 1, x: 300, y: 500, radius: 12 }  // Drone
  ];
  
  // Game state: 0 = MENU, 1 = PLAYING, 2 = GAME_OVER
  var gameState = 0;
  
  // Player health
  var playerHealth = 100;
  
  // Mock WebAssembly exports
  Module['_initGame'] = function() {
    console.log("Game initialized");
    gameState = 0;
    playerHealth = 100;
    entities = [
      { id: 1, type: 0, x: 400, y: 300, radius: 15 }, // Player
      { id: 2, type: 1, x: 200, y: 100, radius: 12 }, // Drone
      { id: 3, type: 1, x: 600, y: 100, radius: 12 }, // Drone
      { id: 4, type: 1, x: 300, y: 500, radius: 12 }  // Drone
    ];
    return 0;
  };
  
  Module['_updateGame'] = function(deltaTime) {
    // Update entities based on game state
    if (gameState === 1) { // PLAYING
      // Move drones randomly
      for (var i = 1; i < entities.length; i++) {
        if (entities[i].type === 1) { // Drone
          entities[i].x += (Math.random() - 0.5) * 5;
          entities[i].y += (Math.random() - 0.5) * 5;
          
          // Keep within bounds
          entities[i].x = Math.max(entities[i].radius, Math.min(800 - entities[i].radius, entities[i].x));
          entities[i].y = Math.max(entities[i].radius, Math.min(600 - entities[i].radius, entities[i].y));
        }
      }
      
      // Check collisions
      var player = entities[0];
      for (var i = 1; i < entities.length; i++) {
        var drone = entities[i];
        var dx = player.x - drone.x;
        var dy = player.y - drone.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.radius + drone.radius) {
          // Collision - reduce health
          playerHealth -= 0.5;
          
          // Push player away
          var pushX = dx / distance * 5;
          var pushY = dy / distance * 5;
          player.x += pushX;
          player.y += pushY;
          
          // Game over if health reaches 0
          if (playerHealth <= 0) {
            gameState = 2; // GAME_OVER
            playerHealth = 0;
          }
        }
      }
      
      // Keep player within bounds
      player.x = Math.max(player.radius, Math.min(800 - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(600 - player.radius, player.y));
    }
    
    return 0;
  };
  
  Module['_handleInput'] = function(inputCode, pressed) {
    if (gameState === 0 && inputCode === 4 && pressed) {
      // Start game from menu
      gameState = 1;
    } else if (gameState === 2 && inputCode === 4 && pressed) {
      // Restart from game over
      gameState = 0;
      playerHealth = 100;
    } else if (gameState === 1 && entities.length > 0) {
      // Handle player movement
      var speed = 5;
      var player = entities[0];
      
      switch (inputCode) {
        case 0: // UP
          if (pressed) player.y -= speed;
          break;
        case 1: // DOWN
          if (pressed) player.y += speed;
          break;
        case 2: // LEFT
          if (pressed) player.x -= speed;
          break;
        case 3: // RIGHT
          if (pressed) player.x += speed;
          break;
      }
    }
    
    return 0;
  };
  
  Module['_getGameState'] = function() {
    return gameState;
  };
  
  Module['_getEntityCount'] = function() {
    return entities.length;
  };
  
  Module['_getEntityData'] = function(dataPtr, maxCount) {
    // In a real WebAssembly module, this would copy data to the provided pointer
    // For this mock version, we just return 0 (success)
    return 0;
  };
  
  Module['_getPlayerHealth'] = function() {
    return playerHealth;
  };
  
  Module['_malloc'] = function(size) {
    // Mock memory allocation - just return a non-zero value
    return 1024;
  };
  
  Module['_free'] = function(ptr) {
    // Mock memory deallocation - no-op
  };
  
  // Mock WebAssembly memory
  Module.memory = {
    buffer: new ArrayBuffer(1024 * 1024) // 1MB mock memory
  };
  
  // Function to get entity data (for JavaScript access)
  Module.getEntities = function() {
    return entities;
  };
  
  return Module;
})();

// Export for use with ES modules
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = DodgeballModule;
}