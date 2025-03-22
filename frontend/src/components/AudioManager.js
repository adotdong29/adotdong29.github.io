// frontend/src/components/AudioManager.js
import { useEffect, useRef, useState } from 'react';

const AudioManager = () => {
  const [initialized, setInitialized] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const audioContext = useRef(null);
  const musicSource = useRef(null);
  const soundBuffers = useRef({});
  const gainNodes = useRef({});
  
  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext.current = new AudioContext();
        
        // Create gain nodes
        gainNodes.current.master = audioContext.current.createGain();
        gainNodes.current.music = audioContext.current.createGain();
        gainNodes.current.sound = audioContext.current.createGain();
        
        // Connect gain nodes
        gainNodes.current.music.connect(gainNodes.current.master);
        gainNodes.current.sound.connect(gainNodes.current.master);
        gainNodes.current.master.connect(audioContext.current.destination);
        
        // Set initial volumes
        gainNodes.current.master.gain.value = 1.0;
        gainNodes.current.music.gain.value = 0.5;
        gainNodes.current.sound.gain.value = 0.7;
        
        // Load background music
        await loadBackgroundMusic();
        
        // Load sound effects
        await Promise.all([
          loadSound('collision', '/sounds/collision.mp3'),
          loadSound('shoot', '/sounds/shoot.mp3'),
          loadSound('explosion', '/sounds/explosion.mp3'),
          loadSound('powerup', '/sounds/powerup.mp3')
        ]);
        
        setInitialized(true);
        console.log('Audio system initialized');
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };
    
    initAudio();
    
    return () => {
      // Clean up audio context on unmount
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close();
      }
    };
  }, []);
  
  // Load background music
  const loadBackgroundMusic = async () => {
    try {
      const response = await fetch('/sounds/background.mp3');
      if (!response.ok) {
        console.warn('Background music file not found, using fallback');
        return;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      
      soundBuffers.current['background'] = audioBuffer;
      
      if (musicEnabled) {
        playMusic('background', true);
      }
    } catch (error) {
      console.error('Error loading background music:', error);
    }
  };
  
  // Load sound effect
  const loadSound = async (name, url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Sound file for ${name} not found, using fallback`);
        return;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      
      soundBuffers.current[name] = audioBuffer;
      console.log(`Loaded sound: ${name}`);
      
      return true;
    } catch (error) {
      console.error(`Error loading sound ${name}:`, error);
      return false;
    }
  };
  
  // Play sound effect
  const playSound = (name) => {
    if (!initialized || !soundEnabled || !soundBuffers.current[name]) {
      return;
    }
    
    try {
      // Resume audio context if it's suspended
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
      
      const source = audioContext.current.createBufferSource();
      source.buffer = soundBuffers.current[name];
      source.connect(gainNodes.current.sound);
      source.start(0);
      
      return source;
    } catch (error) {
      console.error(`Error playing sound ${name}:`, error);
      return null;
    }
  };
  
  // Play music
  const playMusic = (name, loop = true) => {
    if (!initialized || !musicEnabled || !soundBuffers.current[name]) {
      return;
    }
    
    try {
      // Stop current music if playing
      if (musicSource.current) {
        musicSource.current.stop();
      }
      
      // Resume audio context if it's suspended
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }
      
      const source = audioContext.current.createBufferSource();
      source.buffer = soundBuffers.current[name];
      source.loop = loop;
      source.connect(gainNodes.current.music);
      source.start(0);
      
      musicSource.current = source;
      
      return source;
    } catch (error) {
      console.error(`Error playing music ${name}:`, error);
      return null;
    }
  };
  
  // Stop music
  const stopMusic = () => {
    if (musicSource.current) {
      try {
        musicSource.current.stop();
        musicSource.current = null;
      } catch (error) {
        console.error('Error stopping music:', error);
      }
    }
  };
  
  // Toggle music on/off
  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    
    if (newState) {
      // Turn music on
      if (soundBuffers.current['background']) {
        playMusic('background', true);
      }
    } else {
      // Turn music off
      stopMusic();
    }
  };
  
  // Toggle sound effects on/off
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Set master volume
  const setMasterVolume = (volume) => {
    if (gainNodes.current.master) {
      gainNodes.current.master.gain.value = Math.max(0, Math.min(1, volume));
    }
  };
  
  // Set music volume
  const setMusicVolume = (volume) => {
    if (gainNodes.current.music) {
      gainNodes.current.music.gain.value = Math.max(0, Math.min(1, volume));
    }
  };
  
  // Set sound effects volume
  const setSoundVolume = (volume) => {
    if (gainNodes.current.sound) {
      gainNodes.current.sound.gain.value = Math.max(0, Math.min(1, volume));
    }
  };
  
  return {
    initialized,
    musicEnabled,
    soundEnabled,
    playSound,
    playMusic,
    stopMusic,
    toggleMusic,
    toggleSound,
    setMasterVolume,
    setMusicVolume,
    setSoundVolume
  };
};

export default AudioManager;