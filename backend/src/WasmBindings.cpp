// backend/src/wasm/WasmBindings.cpp
#include <emscripten.h>
#include <emscripten/bind.h>
#include "Game.h"
#include <vector>
#include <memory>

// Global game instance
static std::unique_ptr<Game> g_game;

// Struct for entity data to be passed to JavaScript
struct EntityData {
    int id;
    int type;
    float x;
    float y;
    float radius;
};

// Initialize game
extern "C" EMSCRIPTEN_KEEPALIVE void initGame() {
    g_game = std::make_unique<Game>();
    g_game->initialize();
}

// Update game state
extern "C" EMSCRIPTEN_KEEPALIVE void updateGame(float deltaTime) {
    if (g_game) {
        g_game->update(deltaTime);
    }
}

// Handle input
extern "C" EMSCRIPTEN_KEEPALIVE void handleInput(int inputCode, bool pressed) {
    if (g_game) {
        g_game->handleInput(static_cast<PlayerInput>(inputCode), pressed);
    }
}

// Get game state
extern "C" EMSCRIPTEN_KEEPALIVE int getGameState() {
    if (g_game) {
        return static_cast<int>(g_game->getState());
    }
    return 0;
}

// Get entity data for rendering
extern "C" EMSCRIPTEN_KEEPALIVE int getEntityCount() {
    if (g_game) {
        return static_cast<int>(g_game->getEntities().size());
    }
    return 0;
}

// Fill array with entity data
extern "C" EMSCRIPTEN_KEEPALIVE void getEntityData(EntityData* data, int maxCount) {
    if (!g_game) return;
    
    const auto& entities = g_game->getEntities();
    int count = std::min(static_cast<int>(entities.size()), maxCount);
    
    for (int i = 0; i < count; ++i) {
        const auto& entity = entities[i];
        data[i].id = entity->getId();
        data[i].type = static_cast<int>(entity->getType());
        data[i].x = entity->getPosition().x;
        data[i].y = entity->getPosition().y;
        data[i].radius = entity->getRadius();
    }
}

// Get player health
extern "C" EMSCRIPTEN_KEEPALIVE float getPlayerHealth() {
    if (g_game && g_game->getPlayer()) {
        // This would need an accessor in Player class
        return 100.0f; // Placeholder
    }
    return 0.0f;
}

// Using Emscripten's embind for more complex data
EMSCRIPTEN_BINDINGS(dodgeball_module) {
    emscripten::value_object<EntityData>("EntityData")
        .field("id", &EntityData::id)
        .field("type", &EntityData::type)
        .field("x", &EntityData::x)
        .field("y", &EntityData::y)
        .field("radius", &EntityData::radius);
    
    emscripten::enum_<EntityType>("EntityType")
        .value("PLAYER", EntityType::PLAYER)
        .value("DRONE", EntityType::DRONE)
        .value("PROJECTILE", EntityType::PROJECTILE)
        .value("POWERUP", EntityType::POWERUP);
    
    emscripten::enum_<PlayerInput>("PlayerInput")
        .value("UP", PlayerInput::UP)
        .value("DOWN", PlayerInput::DOWN)
        .value("LEFT", PlayerInput::LEFT)
        .value("RIGHT", PlayerInput::RIGHT)
        .value("FIRE", PlayerInput::FIRE);
}