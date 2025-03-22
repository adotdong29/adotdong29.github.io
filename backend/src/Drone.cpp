// backend/src/Drone.cpp
#include "Drone.h"
#include "Game.h"

Drone::Drone(const Vector2& position, DroneType droneType)
    : Entity(EntityType::DRONE, position, 12.0f),
      m_droneType(droneType),
      m_fireTimer(0.0f) {
    
    // Set properties based on drone type
    switch (m_droneType) {
        case DroneType::CHASER:
            m_speed = 150.0f;
            m_fireRate = 0.0f; // Doesn't shoot
            break;
        case DroneType::PATROLLER:
            m_speed = 100.0f;
            m_fireRate = 2.0f; // Shoots every 2 seconds
            break;
        case DroneType::SHOOTER:
            m_speed = 50.0f;
            m_fireRate = 1.0f; // Shoots every second
            break;
    }
}

void Drone::update(float deltaTime) {
    // Update based on drone type
    switch (m_droneType) {
        case DroneType::CHASER:
            chasePlayer(deltaTime);
            break;
        case DroneType::PATROLLER:
            patrol(deltaTime);
            if (m_fireRate > 0.0f) {
                shoot(deltaTime);
            }
            break;
        case DroneType::SHOOTER:
            // Shooter drones mostly stay in place but may move occasionally
            if (m_fireRate > 0.0f) {
                shoot(deltaTime);
            }
            break;
    }
    
    // Call parent update to apply movement
    Entity::update(deltaTime);
}

void Drone::handleCollision(Entity* other) {
    if (other->getType() == EntityType::PROJECTILE) {
        // Handle getting hit by player projectile
        setActive(false);
    }
}

void Drone::chasePlayer(float deltaTime) {
    // This would be implemented with access to the player position
    // For now, just a placeholder
    m_velocity = Vector2(1.0f, 0.0f) * m_speed;
}

void Drone::patrol(float deltaTime) {
    // Simple patrol behavior - move back and forth
    static float patrolTimer = 0.0f;
    patrolTimer += deltaTime;
    
    if (patrolTimer > 2.0f) {
        m_velocity.x = -m_velocity.x;
        patrolTimer = 0.0f;
    }
    
    if (m_velocity.lengthSquared() < 0.1f) {
        m_velocity = Vector2(1.0f, 0.0f) * m_speed;
    }
}

void Drone::shoot(float deltaTime) {
    // Decrement fire timer
    m_fireTimer -= deltaTime;
    
    if (m_fireTimer <= 0.0f) {
        // Reset timer
        m_fireTimer = m_fireRate;
        
        // Shooting logic would go here
        // Would need access to the game to add projectiles
    }
}