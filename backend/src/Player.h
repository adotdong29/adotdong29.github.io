// backend/include/Player.h
#pragma once

#include "Entity.h"
#include <unordered_map>

enum class PlayerInput {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    FIRE
};

class Player : public Entity {
public:
    Player(const Vector2& position);
    virtual void update(float deltaTime) override;
    virtual void handleCollision(Entity* other) override;
    
    void setInput(PlayerInput input, bool pressed);
    void reset();
    
private:
    std::unordered_map<PlayerInput, bool> m_inputs;
    float m_speed;
    float m_health;
    int m_score;
};
