// backend/include/Projectile.h
#pragma once

#include "Entity.h"

enum class ProjectileType {
    PLAYER,
    ENEMY
};

class Projectile : public Entity {
public:
    Projectile(const Vector2& position, const Vector2& direction, float speed, ProjectileType type);
    virtual void update(float deltaTime) override;
    virtual void handleCollision(Entity* other) override;
    
    ProjectileType getProjectileType() const { return m_projectileType; }
    int getSourceId() const { return m_sourceId; }
    void setSourceId(int id) { m_sourceId = id; }
    
private:
    ProjectileType m_projectileType;
    float m_lifetime;
    float m_maxLifetime;
    int m_sourceId; // ID of the entity that created this projectile
};