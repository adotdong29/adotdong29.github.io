// backend/src/Player.cpp
#include "Player.h"

Player::Player(const Vector2& position)
    : Entity(EntityType::PLAYER, position, 15.0f),
      m_speed(200.0f),
      m_health(100.0f),
      m_score(0) {
    // Initialize input map
    m_inputs[PlayerInput::UP] = false;
    m_inputs[PlayerInput::DOWN] = false;
    m_inputs[PlayerInput::LEFT] = false;
    m_inputs[PlayerInput::RIGHT] = false;
    m_inputs[PlayerInput::FIRE] = false;
}

void Player::update(float deltaTime) {
    // Handle movement based on input
    Vector2 direction(0.0f, 0.0f);
    
    if (m_inputs[PlayerInput::UP]) {
        direction.y -= 1.0f;
    }
    if (m_inputs[PlayerInput::DOWN]) {
        direction.y += 1.0f;
    }
    if (m_inputs[PlayerInput::LEFT]) {
        direction.x -= 1.0f;
    }
    if (m_inputs[PlayerInput::RIGHT]) {
        direction.x += 1.0f;
    }
    
    // Normalize direction if moving diagonally
    if (direction.lengthSquared() > 0.0f) {
        direction.normalize();
    }
    
    // Set velocity based on direction and speed
    m_velocity = direction * m_speed;
    
    // Call parent update to apply movement
    Entity::update(deltaTime);
}

void Player::handleCollision(Entity* other) {
    if (other->getType() == EntityType::DRONE) {
        // Handle collision with drone
        m_health -= 10.0f;
        if (m_health <= 0.0f) {
            setActive(false);
        }
    } else if (other->getType() == EntityType::POWERUP) {
        // Handle power-up collection
    }
}

void Player::setInput(PlayerInput input, bool pressed) {
    m_inputs[input] = pressed;
}

void Player::reset() {
    m_health = 100.0f;
    m_score = 0;
    setActive(true);
}
