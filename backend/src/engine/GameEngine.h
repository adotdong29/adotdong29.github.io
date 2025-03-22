// backend/src/engine/GameEngine.h
#pragma once

#include <memory>
#include <vector>
#include <string>
#include "Game.h"
#include "../physics/PhysicsWorld.h"
#include "../audio/AudioManager.h"

// Main game engine class that coordinates all systems
class GameEngine {
public:
    GameEngine();
    ~GameEngine();

    // Initialize the engine and all subsystems
    bool initialize();
    
    // Main update loop
    void update(float deltaTime);
    
    // Shutdown the engine and all subsystems
    void shutdown();
    
    // Get game instance
    Game* getGame() const { return m_game.get(); }
    
    // Get physics world
    PhysicsWorld* getPhysicsWorld() const { return m_physicsWorld.get(); }
    
    // Get audio manager
    AudioManager* getAudioManager() const { return m_audioManager.get(); }
    
    // Configuration methods
    void setWorldSize(float width, float height);
    void setGravity(float gravity);
    
    // Static singleton instance
    static GameEngine& getInstance() {
        static GameEngine instance;
        return instance;
    }

private:
    // Game systems
    std::unique_ptr<Game> m_game;
    std::unique_ptr<PhysicsWorld> m_physicsWorld;
    std::unique_ptr<AudioManager> m_audioManager;
    
    // Configuration
    float m_worldWidth;
    float m_worldHeight;
    float m_gravity;
    
    // Initialization state
    bool m_initialized;
};