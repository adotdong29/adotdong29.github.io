// backend/src/engine/GameEngine.cpp
#include "GameEngine.h"
#include <iostream>

GameEngine::GameEngine()
    : m_worldWidth(800.0f),
      m_worldHeight(600.0f),
      m_gravity(9.8f),
      m_initialized(false) {
}

GameEngine::~GameEngine() {
    shutdown();
}

bool GameEngine::initialize() {
    if (m_initialized) {
        return true; // Already initialized
    }
    
    // Initialize physics world
    try {
        m_physicsWorld = std::make_unique<PhysicsWorld>(m_gravity);
    } catch (const std::exception& e) {
        std::cerr << "Failed to initialize physics world: " << e.what() << std::endl;
        return false;
    }
    
    // Initialize audio manager
    try {
        m_audioManager = std::make_unique<AudioManager>();
        if (!m_audioManager->initialize()) {
            std::cerr << "Failed to initialize audio manager" << std::endl;
            return false;
        }
    } catch (const std::exception& e) {
        std::cerr << "Failed to initialize audio manager: " << e.what() << std::endl;
        return false;
    }
    
    // Initialize game
    try {
        m_game = std::make_unique<Game>();
        m_game->setWorldSize(m_worldWidth, m_worldHeight);
        m_game->initialize();
    } catch (const std::exception& e) {
        std::cerr << "Failed to initialize game: " << e.what() << std::endl;
        return false;
    }
    
    m_initialized = true;
    return true;
}

void GameEngine::update(float deltaTime) {
    if (!m_initialized) {
        return;
    }
    
    // Update physics
    m_physicsWorld->update(deltaTime);
    
    // Update game logic
    m_game->update(deltaTime);
    
    // Update audio
    m_audioManager->update(deltaTime);
}

void GameEngine::shutdown() {
    // Destroy in reverse order of creation
    m_game.reset();
    m_audioManager.reset();
    m_physicsWorld.reset();
    
    m_initialized = false;
}

void GameEngine::setWorldSize(float width, float height) {
    m_worldWidth = width;
    m_worldHeight = height;
    
    // Update game if already initialized
    if (m_game) {
        m_game->setWorldSize(width, height);
    }
}

void GameEngine::setGravity(float gravity) {
    m_gravity = gravity;
    
    // Update physics if already initialized
    if (m_physicsWorld) {
        m_physicsWorld->setGravity(gravity);
    }
}