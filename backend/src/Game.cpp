// backend/src/Game.cpp
#include "Game.h"
#include <algorithm>
#include <cstdlib>
#include <ctime>

Game::Game()
    : m_state(GameState::MENU),
      m_worldWidth(800.0f),
      m_worldHeight(600.0f) {
    // Seed random number generator
    std::srand(static_cast<unsigned int>(std::time(nullptr)));
}

Game::~Game() = default;

void Game::initialize() {
    // Reset game state
    m_state = GameState::PLAYING;
    m_entities.clear();
    
    // Create player
    m_player = std::make_shared<Player>(Vector2(m_worldWidth / 2, m_worldHeight / 2));
    m_entities.push_back(m_player);
    
    // Spawn initial drones
    for (int i = 0; i < 5; ++i) {
        spawnDrone(static_cast<DroneType>(std::rand() % 3));
    }
}

void Game::update(float deltaTime) {
    if (m_state != GameState::PLAYING) {
        return;
    }
    
    // Update all entities
    for (auto& entity : m_entities) {
        entity->update(deltaTime);
    }
    
    // Check for collisions
    checkCollisions();
    
    // Remove inactive entities
    removeInactiveEntities();
    
    // Check game over condition
    if (!m_player->isActive()) {
        m_state = GameState::GAME_OVER;
    }
    
    // Spawn new drones periodically
    static float spawnTimer = 0.0f;
    spawnTimer += deltaTime;
    
    if (spawnTimer > 2.0f) {
        spawnTimer = 0.0f;
        spawnDrone(static_cast<DroneType>(std::rand() % 3));
    }
}

void Game::handleInput(PlayerInput input, bool pressed) {
    if (m_state == GameState::PLAYING && m_player) {
        m_player->setInput(input, pressed);
    } else if (m_state == GameState::MENU && input == PlayerInput::FIRE && pressed) {
        initialize();
    } else if (m_state == GameState::GAME_OVER && input == PlayerInput::FIRE && pressed) {
        m_state = GameState::MENU;
    }
}

void Game::spawnDrone(DroneType type) {
    // Random position at the edge of the screen
    Vector2 position;
    int side = std::rand() % 4;
    
    switch (side) {
        case 0: // Top
            position = Vector2(std::rand() % static_cast<int>(m_worldWidth), 0);
            break;
        case 1: // Right
            position = Vector2(m_worldWidth, std::rand() % static_cast<int>(m_worldHeight));
            break;
        case 2: // Bottom
            position = Vector2(std::rand() % static_cast<int>(m_worldWidth), m_worldHeight);
            break;
        case 3: // Left
            position = Vector2(0, std::rand() % static_cast<int>(m_worldHeight));
            break;
    }
    
    // Create and add drone
    auto drone = std::make_shared<Drone>(position, type);
    m_entities.push_back(drone);
}

void Game::checkCollisions() {
    // Simple collision detection between entities
    for (size_t i = 0; i < m_entities.size(); ++i) {
        for (size_t j = i + 1; j < m_entities.size(); ++j) {
            auto& a = m_entities[i];
            auto& b = m_entities[j];
            
            // Skip inactive entities
            if (!a->isActive() || !b->isActive()) {
                continue;
            }
            
            // Check distance between entities
            float distance = Vector2::distance(a->getPosition(), b->getPosition());
            float minDistance = a->getRadius() + b->getRadius();
            
            if (distance < minDistance) {
                // Handle collision
                a->handleCollision(b.get());
                b->handleCollision(a.get());
            }
        }
    }
}

void Game::removeInactiveEntities() {
    // Keep the player even if inactive
    auto playerIt = std::find(m_entities.begin(), m_entities.end(), m_player);
    if (playerIt != m_entities.end()) {
        m_entities.erase(
            std::remove_if(m_entities.begin(), m_entities.end(),
                [this](const std::shared_ptr<Entity>& entity) {
                    return entity != m_player && !entity->isActive();
                }),
            m_entities.end()
        );
    } else {
        m_entities.erase(
            std::remove_if(m_entities.begin(), m_entities.end(),
                [](const std::shared_ptr<Entity>& entity) {
                    return !entity->isActive();
                }),
            m_entities.end()
        );
    }
}