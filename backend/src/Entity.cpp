// backend/src/Entity.cpp
#include "Entity.h"

int Entity::s_nextId = 0;

Entity::Entity(EntityType type, const Vector2& position, float radius)
    : m_id(s_nextId++),
      m_type(type),
      m_position(position),
      m_velocity(0.0f, 0.0f),
      m_radius(radius),
      m_active(true) {
}

void Entity::update(float deltaTime) {
    m_position = m_position + m_velocity * deltaTime;
}

void Entity::handleCollision(Entity* other) {
    // Default collision behavior
    // Can be overridden by subclasses
}