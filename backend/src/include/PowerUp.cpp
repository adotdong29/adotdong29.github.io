// backend/src/PowerUp.cpp
#include "PowerUp.h"

PowerUp::PowerUp(const Vector2& position, PowerUpType type)
    : Entity(EntityType::POWERUP, position, 10.0f),
      m_powerUpType(type),
      m_lifetime(0.0f),
      m_maxLifetime(10.0f), // Power-ups disappear after 10 seconds
      m_pulseTime(0.0f),
      m_growing(true) {
    
    // Set value based on power-up type
    switch (m_powerUpType) {
        case PowerUpType::HEALTH:
            m_value = 25.0f; // Restore 25 health
            break;
        case PowerUpType::SPEED:
            m_value = 1.5f; // 50% speed boost
            break;
        case PowerUpType::SHIELD:
            m_value = 3.0f; // Shield for 3 seconds
            break;
        case PowerUpType::DAMAGE_BOOST:
            m_value = 2.0f; // Double damage
            break;
    }
}

void PowerUp::update(float deltaTime) {
    // Update lifetime
    m_lifetime += deltaTime;
    
    // Check if lifetime exceeded
    if (m_lifetime >= m_maxLifetime) {
        setActive(false);
        return;
    }
    
    // Pulse animation (grow and shrink)
    m_pulseTime += deltaTime;
    
    if (m_growing) {
        m_radius += 0.1f * deltaTime;
        if (m_radius >= 12.0f) { // Max size
            m_growing = false;
        }
    } else {
        m_radius -= 0.1f * deltaTime;
        if (m_radius <= 8.0f) { // Min size
            m_growing = true;
        }
    }
    
    // No movement for power-ups
}

void PowerUp::handleCollision(Entity* other) {
    // Only interact with player
    if (other->getType() == EntityType::PLAYER) {
        // Power-up is collected
        setActive(false);
    }
}