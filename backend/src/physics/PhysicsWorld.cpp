// backend/src/physics/PhysicsWorld.cpp
#include "PhysicsWorld.h"
#include "../include/Entity.h"

// Contact listener implementation
PhysicsWorld::ContactListener::ContactListener(PhysicsWorld* physicsWorld)
    : m_physicsWorld(physicsWorld) {
}

void PhysicsWorld::ContactListener::BeginContact(b2Contact* contact) {
    // Get the entities from the fixtures' user data
    b2Body* bodyA = contact->GetFixtureA()->GetBody();
    b2Body* bodyB = contact->GetFixtureB()->GetBody();
    
    auto itA = m_physicsWorld->m_bodyEntityMap.find(bodyA);
    auto itB = m_physicsWorld->m_bodyEntityMap.find(bodyB);
    
    if (itA != m_physicsWorld->m_bodyEntityMap.end() && itB != m_physicsWorld->m_bodyEntityMap.end()) {
        Entity* entityA = itA->second;
        Entity* entityB = itB->second;
        
        // Notify entities of collision
        if (entityA && entityB) {
            entityA->handleCollision(entityB);
            entityB->handleCollision(entityA);
        }
    }
}

void PhysicsWorld::ContactListener::EndContact(b2Contact* contact) {
    // Handle end of contact if needed
}

// PhysicsWorld implementation
PhysicsWorld::PhysicsWorld(float gravity)
    : m_world(std::make_unique<b2World>(b2Vec2(0.0f, gravity))),
      m_timeStep(1.0f / 60.0f),
      m_velocityIterations(8),
      m_positionIterations(3) {
    
    // Set up contact listener
    m_contactListener = std::make_unique<ContactListener>(this);
    m_world->SetContactListener(m_contactListener.get());
}

PhysicsWorld::~PhysicsWorld() {
    // Clean up all bodies
    b2Body* body = m_world->GetBodyList();
    while (body) {
        b2Body* nextBody = body->GetNext();
        m_world->DestroyBody(body);
        body = nextBody;
    }
}

void PhysicsWorld::update(float deltaTime) {
    // Step the simulation
    m_world->Step(m_timeStep, m_velocityIterations, m_positionIterations);
    
    // Update entity positions from physics bodies
    for (auto& pair : m_bodyEntityMap) {
        b2Body* body = pair.first;
        Entity* entity = pair.second;
        
        if (body && entity) {
            updateEntityFromBody(entity, body);
        }
    }
}

void PhysicsWorld::setGravity(float gravity) {
    m_world->SetGravity(b2Vec2(0.0f, gravity));
}

b2Body* PhysicsWorld::createBody(Entity* entity, bool isDynamic) {
    if (!entity) {
        return nullptr;
    }
    
    // Create body definition
    b2BodyDef bodyDef;
    bodyDef.type = isDynamic ? b2_dynamicBody : b2_staticBody;
    bodyDef.position.Set(entity->getPosition().x, entity->getPosition().y);
    bodyDef.linearDamping = 0.5f;
    bodyDef.angularDamping = 0.5f;
    
    // Create body
    b2Body* body = m_world->CreateBody(&bodyDef);
    
    // Create circular fixture for the body
    b2CircleShape circleShape;
    circleShape.m_radius = entity->getRadius();
    
    b2FixtureDef fixtureDef;
    fixtureDef.shape = &circleShape;
    fixtureDef.density = 1.0f;
    fixtureDef.friction = 0.3f;
    fixtureDef.restitution = 0.5f; // Bouncy
    
    body->CreateFixture(&fixtureDef);
    
    // Store entity reference
    m_bodyEntityMap[body] = entity;
    
    return body;
}

void PhysicsWorld::removeBody(b2Body* body) {
    if (body) {
        // Remove from map
        m_bodyEntityMap.erase(body);
        
        // Destroy body
        m_world->DestroyBody(body);
    }
}

void PhysicsWorld::updateEntityFromBody(Entity* entity, b2Body* body) {
    if (entity && body) {
        // Update entity position from body
        b2Vec2 position = body->GetPosition();
        entity->setPosition(Vector2(position.x, position.y));
        
        // Update velocity
        b2Vec2 velocity = body->GetLinearVelocity();
        entity->setVelocity(Vector2(velocity.x, velocity.y));
    }
}

Vector2 PhysicsWorld::getBodyPosition(b2Body* body) const {
    if (body) {
        b2Vec2 position = body->GetPosition();
        return Vector2(position.x, position.y);
    }
    return Vector2();
}

void PhysicsWorld::setBodyPosition(b2Body* body, const Vector2& position) {
    if (body) {
        body->SetTransform(b2Vec2(position.x, position.y), body->GetAngle());
    }
}

Vector2 PhysicsWorld::getBodyVelocity(b2Body* body) const {
    if (body) {
        b2Vec2 velocity = body->GetLinearVelocity();
        return Vector2(velocity.x, velocity.y);
    }
    return Vector2();
}

void PhysicsWorld::setBodyVelocity(b2Body* body, const Vector2& velocity) {
    if (body) {
        body->SetLinearVelocity(b2Vec2(velocity.x, velocity.y));
    }
}

float PhysicsWorld::getBodyAngle(b2Body* body) const {
    if (body) {
        return body->GetAngle();
    }
    return 0.0f;
}

void PhysicsWorld::applyForce(b2Body* body, const Vector2& force) {
    if (body) {
        body->ApplyForceToCenter(b2Vec2(force.x, force.y), true);
    }
}

void PhysicsWorld::applyImpulse(b2Body* body, const Vector2& impulse) {
    if (body) {
        body->ApplyLinearImpulseToCenter(b2Vec2(impulse.x, impulse.y), true);
    }
}