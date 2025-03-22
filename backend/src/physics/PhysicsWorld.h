// backend/src/physics/PhysicsWorld.h
#pragma once

#include <box2d/box2d.h>
#include <memory>
#include <unordered_map>
#include "../include/Vector2.h"

class Entity;

class PhysicsWorld {
public:
    PhysicsWorld(float gravity = 9.8f);
    ~PhysicsWorld();
    
    void update(float deltaTime);
    void setGravity(float gravity);
    
    b2Body* createBody(Entity* entity, bool isDynamic);
    void removeBody(b2Body* body);
    void updateEntityFromBody(Entity* entity, b2Body* body);
    
    Vector2 getBodyPosition(b2Body* body) const;
    void setBodyPosition(b2Body* body, const Vector2& position);
    Vector2 getBodyVelocity(b2Body* body) const;
    void setBodyVelocity(b2Body* body, const Vector2& velocity);
    float getBodyAngle(b2Body* body) const;
    
    void applyForce(b2Body* body, const Vector2& force);
    void applyImpulse(b2Body* body, const Vector2& impulse);
    
private:
    std::unique_ptr<b2World> m_world;
    std::unordered_map<b2Body*, Entity*> m_bodyEntityMap;
    float m_timeStep;
    int m_velocityIterations;
    int m_positionIterations;
    
    // Contact listener for collision callbacks
    class ContactListener : public b2ContactListener {
    public:
        ContactListener(PhysicsWorld* physicsWorld);
        
        virtual void BeginContact(b2Contact* contact) override;
        virtual void EndContact(b2Contact* contact) override;
        
    private:
        PhysicsWorld* m_physicsWorld;
    };
    
    std::unique_ptr<ContactListener> m_contactListener;
};