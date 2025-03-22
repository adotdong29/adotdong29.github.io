// backend/include/Game.h
#pragma once

#include <vector>
#include <memory>
#include "Entity.h"
#include "Player.h"
#include "Drone.h"

enum class GameState {
    MENU,
    PLAYING,
    GAME_OVER
};

class Game {
public:
    Game();
    ~Game();
    
    void initialize();
    void update(float deltaTime);
    void handleInput(PlayerInput input, bool pressed);
    
    // Getters
    GameState getState() const { return m_state; }
    const std::vector<std::shared_ptr<Entity>>& getEntities() const { return m_entities; }
    const Player* getPlayer() const { return m_player.get(); }
    
private:
    GameState m_state;
    std::vector<std::shared_ptr<Entity>> m_entities;
    std::shared_ptr<Player> m_player;
    
    float m_worldWidth;
    float m_worldHeight;
    
    void spawnDrone(DroneType type);
    void checkCollisions();
    void removeInactiveEntities();
};