// backend/src/Projectile.cpp
#include "Projectile.h"

Projectile::Projectile(const Vector2& position, const Vector2& direction, float speed, ProjectileType type)
    : Entity(EntityType::PROJECTILE, position, 5.0f),
      m_projectileType(type),
      m_lifetime(0.0f),
      m_maxLifetime(2.0f),
      m_sourceId(-1) {
    
    // Set velocity based on direction and speed
    m_velocity = direction.normalized() * speed;
}

void Projectile::update(float deltaTime) {
    // Update lifetime
    m_lifetime += deltaTime;
    
    // Check if lifetime exceeded
    if (m_lifetime >= m_maxLifetime) {
        setActive(false);
        return;
    }
    
    // Call parent update to apply movement
    Entity::update(deltaTime);
}

void Projectile::handleCollision(Entity* other) {
    // Skip collision with source entity
    if (other->getId() == m_sourceId) {
        return;
    }
    
    // Handle collision based on projectile type
    if (m_projectileType == ProjectileType::PLAYER) {
        // Player projectiles damage drones but not the player
        if (other->getType() == EntityType::DRONE) {
            setActive(false);
        }
    } else if (m_projectileType == ProjectileType::ENEMY) {
        // Enemy projectiles damage the player but not drones
        if (other->getType() == EntityType::PLAYER) {
            setActive(false);
        }
    }
}