// backend/include/Drone.h
#pragma once

#include "Entity.h"
#include <vector>

enum class DroneType {
    CHASER,
    PATROLLER,
    SHOOTER
};

class Drone : public Entity {
public:
    Drone(const Vector2& position, DroneType droneType);
    virtual void update(float deltaTime) override;
    virtual void handleCollision(Entity* other) override;
    
    DroneType getDroneType() const { return m_droneType; }

private:
    DroneType m_droneType;
    float m_speed;
    float m_fireRate;
    float m_fireTimer;
    
    void chasePlayer(float deltaTime);
    void patrol(float deltaTime);
    void shoot(float deltaTime);
};