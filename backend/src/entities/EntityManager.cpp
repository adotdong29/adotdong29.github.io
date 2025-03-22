// backend/src/entities/EntityManager.cpp
#include "EntityManager.h"
#include <algorithm>

EntityManager::EntityManager() {
}

EntityManager::~EntityManager() {
    clear();
}

void EntityManager::removeEntity(Entity* entity) {
    if (!entity) {
        return;
    }
    
    m_entities.erase(
        std::remove_if(m_entities.begin(), m_entities.end(),
            [entity](const std::shared_ptr<Entity>& e) {
                return e.get() == entity;
            }),
        m_entities.end()
    );
}

void EntityManager::removeEntity(const std::shared_ptr<Entity>& entity) {
    if (!entity) {
        return;
    }
    
    m_entities.erase(
        std::remove(m_entities.begin(), m_entities.end(), entity),
        m_entities.end()
    );
}

void EntityManager::removeInactiveEntities() {
    m_entities.erase(
        std::remove_if(m_entities.begin(), m_entities.end(),
            [](const std::shared_ptr<Entity>& entity) {
                return !entity->isActive();
            }),
        m_entities.end()
    );
}

void EntityManager::registerEntityType(const std::string& typeName, EntityFactory factory) {
    m_entityFactories[typeName] = factory;
}

std::shared_ptr<Entity> EntityManager::createEntityByType(const std::string& typeName, const Vector2& position) {
    auto it = m_entityFactories.find(typeName);
    if (it == m_entityFactories.end()) {
        return nullptr;
    }
    
    // Call factory function to create entity
    auto entity = it->second(position);
    
    // Add to entity list
    if (entity) {
        m_entities.push_back(entity);
    }
    
    return entity;
}

void EntityManager::updateAll(float deltaTime) {
    for (auto& entity : m_entities) {
        if (entity->isActive()) {
            entity->update(deltaTime);
        }
    }
}

void EntityManager::clear() {
    m_entities.clear();
}