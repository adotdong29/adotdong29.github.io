// backend/libs/box2d/Box2D.h
// This is a simplified version of the Box2D physics engine header for the project
#pragma once

#include <cmath>
#include <vector>
#include <memory>
#include <functional>

namespace box2d {

// Forward declarations
class b2World;
class b2Body;
class b2Fixture;
class b2Shape;
class b2Contact;
class b2ContactListener;

// 2D vector
struct b2Vec2 {
    float x, y;
    
    b2Vec2() : x(0.0f), y(0.0f) {}
    b2Vec2(float x_, float y_) : x(x_), y(y_) {}
    
    float Length() const {
        return std::sqrt(x * x + y * y);
    }
    
    void Normalize() {
        float len = Length();
        if (len > 1e-6f) {
            x /= len;
            y /= len;
        }
    }
    
    b2Vec2 operator+(const b2Vec2& v) const {
        return b2Vec2(x + v.x, y + v.y);
    }
    
    b2Vec2 operator-(const b2Vec2& v) const {
        return b2Vec2(x - v.x, y - v.y);
    }
    
    b2Vec2 operator*(float s) const {
        return b2Vec2(x * s, y * s);
    }
};

// Shapes
enum b2ShapeType {
    e_circle = 0,
    e_edge = 1,
    e_polygon = 2,
    e_chain = 3,
    e_typeCount = 4
};

class b2Shape {
public:
    b2ShapeType m_type;
    float m_radius;
    
    b2Shape() : m_type(e_typeCount), m_radius(0.0f) {}
    virtual ~b2Shape() {}
};

class b2CircleShape : public b2Shape {
public:
    b2Vec2 m_p;
    
    b2CircleShape() {
        m_type = e_circle;
        m_radius = 0.0f;
        m_p.x = 0.0f;
        m_p.y = 0.0f;
    }
};

// Body types
enum b2BodyType {
    b2_staticBody = 0,
    b2_kinematicBody = 1,
    b2_dynamicBody = 2
};

// Body definition
struct b2BodyDef {
    b2BodyType type;
    b2Vec2 position;
    float angle;
    b2Vec2 linearVelocity;
    float angularVelocity;
    float linearDamping;
    float angularDamping;
    bool allowSleep;
    bool awake;
    bool fixedRotation;
    bool bullet;
    bool active;
    void* userData;
    
    b2BodyDef() {
        type = b2_staticBody;
        position.x = 0.0f;
        position.y = 0.0f;
        angle = 0.0f;
        linearVelocity.x = 0.0f;
        linearVelocity.y = 0.0f;
        angularVelocity = 0.0f;
        linearDamping = 0.0f;
        angularDamping = 0.0f;
        allowSleep = true;
        awake = true;
        fixedRotation = false;
        bullet = false;
        active = true;
        userData = nullptr;
    }
};

// Fixture definition
struct b2FixtureDef {
    const b2Shape* shape;
    void* userData;
    float friction;
    float restitution;
    float density;
    bool isSensor;
    
    b2FixtureDef() {
        shape = nullptr;
        userData = nullptr;
        friction = 0.2f;
        restitution = 0.0f;
        density = 0.0f;
        isSensor = false;
    }
};

// Body
class b2Body {
public:
    b2BodyType GetType() const { return m_type; }
    const b2Vec2& GetPosition() const { return m_position; }
    float GetAngle() const { return m_angle; }
    const b2Vec2& GetLinearVelocity() const { return m_linearVelocity; }
    float GetAngularVelocity() const { return m_angularVelocity; }
    
    void SetTransform(const b2Vec2& position, float angle) {
        m_position = position;
        m_angle = angle;
    }
    
    void SetLinearVelocity(const b2Vec2& velocity) {
        m_linearVelocity = velocity;
    }
    
    void SetAngularVelocity(float velocity) {
        m_angularVelocity = velocity;
    }
    
    void ApplyForceToCenter(const b2Vec2& force, bool wake) {
        m_linearVelocity.x += force.x;
        m_linearVelocity.y += force.y;
    }
    
    void ApplyLinearImpulseToCenter(const b2Vec2& impulse, bool wake) {
        m_linearVelocity.x += impulse.x;
        m_linearVelocity.y += impulse.y;
    }
    
    b2Fixture* CreateFixture(const b2FixtureDef* def) {
        // Simplified implementation
        return new b2Fixture();
    }
    
    b2Fixture* CreateFixture(const b2Shape* shape, float density) {
        b2FixtureDef def;
        def.shape = shape;
        def.density = density;
        return CreateFixture(&def);
    }
    
    void DestroyFixture(b2Fixture* fixture) {
        delete fixture;
    }
    
    b2Body* GetNext() { return m_next; }
    
private:
    b2BodyType m_type;
    b2Vec2 m_position;
    float m_angle;
    b2Vec2 m_linearVelocity;
    float m_angularVelocity;
    b2Body* m_next;
    
    friend class b2World;
};

// Fixture
class b2Fixture {
public:
    b2Fixture() : m_body(nullptr), m_shape(nullptr) {}
    ~b2Fixture() {}
    
    b2Body* GetBody() { return m_body; }
    const b2Shape* GetShape() { return m_shape; }
    
private:
    b2Body* m_body;
    const b2Shape* m_shape;
    
    friend class b2Body;
};

// Contact
class b2Contact {
public:
    b2Fixture* GetFixtureA() { return m_fixtureA; }
    b2Fixture* GetFixtureB() { return m_fixtureB; }
    
private:
    b2Fixture* m_fixtureA;
    b2Fixture* m_fixtureB;
};

// Contact listener
class b2ContactListener {
public:
    virtual ~b2ContactListener() {}
    
    virtual void BeginContact(b2Contact* contact) {}
    virtual void EndContact(b2Contact* contact) {}
    virtual void PreSolve(b2Contact* contact) {}
    virtual void PostSolve(b2Contact* contact) {}
};

// World
class b2World {
public:
    b2World(const b2Vec2& gravity) : m_gravity(gravity), m_contactListener(nullptr) {}
    ~b2World() {
        // Clean up all bodies
        b2Body* body = m_bodyList;
        while (body) {
            b2Body* next = body->GetNext();
            delete body;
            body = next;
        }
    }
    
    b2Body* CreateBody(const b2BodyDef* def) {
        b2Body* body = new b2Body();
        body->m_type = def->type;
        body->m_position = def->position;
        body->m_angle = def->angle;
        body->m_linearVelocity = def->linearVelocity;
        body->m_angularVelocity = def->angularVelocity;
        
        // Add to body list
        body->m_next = m_bodyList;
        m_bodyList = body;
        
        return body;
    }
    
    void DestroyBody(b2Body* body) {
        // Remove from body list
        if (body == m_bodyList) {
            m_bodyList = body->m_next;
        } else {
            b2Body* node = m_bodyList;
            while (node && node->m_next != body) {
                node = node->m_next;
            }
            if (node) {
                node->m_next = body->m_next;
            }
        }
        
        delete body;
    }
    
    void Step(float timeStep, int velocityIterations, int positionIterations) {
        // Simple physics update - move bodies based on velocity
        b2Body* body = m_bodyList;
        while (body) {
            body->m_position.x += body->m_linearVelocity.x * timeStep;
            body->m_position.y += body->m_linearVelocity.y * timeStep;
            body->m_angle += body->m_angularVelocity * timeStep;
            body = body->m_next;
        }
    }
    
    void SetContactListener(b2ContactListener* listener) {
        m_contactListener = listener;
    }
    
    void SetGravity(const b2Vec2& gravity) {
        m_gravity = gravity;
    }
    
    b2Body* GetBodyList() { return m_bodyList; }
    
private:
    b2Vec2 m_gravity;
    b2Body* m_bodyList = nullptr;
    b2ContactListener* m_contactListener;
};

} // namespace box2d

// Include aliases for easier use with existing code
using b2World = box2d::b2World;
using b2Body = box2d::b2Body;
using b2Fixture = box2d::b2Fixture;
using b2Shape = box2d::b2Shape;
using b2CircleShape = box2d::b2CircleShape;
using b2BodyDef = box2d::b2BodyDef;
using b2FixtureDef = box2d::b2FixtureDef;
using b2Vec2 = box2d::b2Vec2;
using b2Contact = box2d::b2Contact;
using b2ContactListener = box2d::b2ContactListener;