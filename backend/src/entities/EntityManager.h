// backend/src/entities/EntityManager.h
#pragma once

#include <memory>
#include <vector>
#include <unordered_map>
#include <functional>
#include <string>
#include "../include/Entity.h"
#include "../include/Vector2.h"

// Entity factory function type
using EntityFactory = std::function<std::shared_ptr<Entity>(const Vector2&)>;

// Manager class for all game entities
class EntityManager {
public:
    EntityManager();
    ~EntityManager();
    
    // Entity creation
    template<typename T, typename... Args>
    std::shared_ptr<T> createEntity(Args&&... args) {
        auto entity = std::make_shared<T>(std::forward<Args>(args)...);
        m_entities.push_back(entity);
        return entity;
    }
    
    // Entity removal
    void removeEntity(Entity* entity);
    void removeEntity(const std::shared_ptr<Entity>& entity);
    void removeInactiveEntities();
    
    // Register factory function for entity type
    void registerEntityType(const std::string& typeName, EntityFactory factory);
    
    // Create entity from registered type
    std::shared_ptr<Entity> createEntityByType(const std::string& typeName, const Vector2& position);
    
    // Get all entities
    const std::vector<std::shared_ptr<Entity>>& getAllEntities() const { return m_entities; }
    
    // Get entities by type
    template<typename T>
    std::vector<std::shared_ptr<T>> getEntitiesByType() {
        std::vector<std::shared_ptr<T>> result;
        for (const auto& entity : m_entities) {
            auto typedEntity = std::dynamic_pointer_cast<T>(entity);
            if (typedEntity) {
                result.push_back(typedEntity);
            }
        }
        return result;
    }
    
    // Update all entities
    void updateAll(float deltaTime);
    
    // Clear all entities
    void clear();
    
private:
    // Entity list
    std::vector<std::shared_ptr<Entity>> m_entities;
    
    // Entity factory map
    std::unordered_map<std::string, EntityFactory> m_entityFactories;
};