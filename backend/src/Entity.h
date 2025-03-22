// backend/include/Entity.h
#pragma once

#include <string>
#include <vector>
#include <memory>
#include "Vector2.h"

enum class EntityType {
    PLAYER,
    DRONE,
    PROJECTILE,
    POWERUP
};

class Entity {
public:
    Entity(EntityType type, const Vector2& position, float radius);
    virtual ~Entity() = default;
    
    virtual void update(float deltaTime);
    virtual void handleCollision(Entity* other);
    
    // Getters and setters
    EntityType getType() const { return m_type; }
    Vector2 getPosition() const { return m_position; }
    void setPosition(const Vector2& position) { m_position = position; }
    Vector2 getVelocity() const { return m_velocity; }
    void setVelocity(const Vector2& velocity) { m_velocity = velocity; }
    float getRadius() const { return m_radius; }
    bool isActive() const { return m_active; }
    void setActive(bool active) { m_active = active; }
    int getId() const { return m_id; }
    
protected:
    static int s_nextId;
    
    int m_id;
    EntityType m_type;
    Vector2 m_position;
    Vector2 m_velocity;
    float m_radius;
    bool m_active;
};
