// frontend/src/hooks/useGameInput.js
import { useEffect, useCallback } from 'react';
import wasmModule from '../wasm/wasmModule';

// Map keyboard keys to PlayerInput enum values
const InputMap = {
  ArrowUp: 0, // UP
  ArrowDown: 1, // DOWN
  ArrowLeft: 2, // LEFT
  ArrowRight: 3, // RIGHT
  ' ': 4, // FIRE (Space)
  
  // WASD alternative
  'w': 0, // UP
  's': 1, // DOWN
  'a': 2, // LEFT
  'd': 3, // RIGHT
};

export default function useGameInput() {
  const handleKeyDown = useCallback((event) => {
    const inputCode = InputMap[event.key];
    if (inputCode !== undefined) {
      wasmModule.handleInput(inputCode, true);
      event.preventDefault();
    }
  }, []);
  
  const handleKeyUp = useCallback((event) => {
    const inputCode = InputMap[event.key];
    if (inputCode !== undefined) {
      wasmModule.handleInput(inputCode, false);
      event.preventDefault();
    }
  }, []);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}

// frontend/src/hooks/useGameLoop.js
import { useRef, useEffect } from 'react';
import wasmModule from '../wasm/wasmModule';

export default function useGameLoop(frameCallback) {
  const requestIdRef = useRef(null);
  const previousTimeRef = useRef(0);
  
  const loop = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000.0;
      
      // Update WebAssembly game state
      wasmModule.update(deltaTime);
      
      // Call the frame callback with the game entities
      if (frameCallback) {
        frameCallback(wasmModule.getEntities(), wasmModule.getGameState());
      }
    }
    
    previousTimeRef.current = time;
    requestIdRef.current = requestAnimationFrame(loop);
  };
  
  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [frameCallback]);
}