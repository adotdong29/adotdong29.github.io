// backend/include/PowerUp.h
#pragma once

#include "Entity.h"

enum class PowerUpType {
    HEALTH,
    SPEED,
    SHIELD,
    DAMAGE_BOOST
};

class PowerUp : public Entity {
public:
    PowerUp(const Vector2& position, PowerUpType type);
    virtual void update(float deltaTime) override;
    virtual void handleCollision(Entity* other) override;
    
    PowerUpType getPowerUpType() const { return m_powerUpType; }
    float getValue() const { return m_value; }
    
private:
    PowerUpType m_powerUpType;
    float m_value;
    float m_lifetime;
    float m_maxLifetime;
    float m_pulseTime;
    bool m_growing;
};