// src/hooks/useGameLoop.js
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