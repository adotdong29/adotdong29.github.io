// backend/src/audio/AudioManager.h
#pragma once

#include <string>
#include <unordered_map>
#include <memory>
#include <vector>

// Simple audio manager for web and WebAssembly
class AudioManager {
public:
    AudioManager();
    ~AudioManager();
    
    bool initialize();
    void shutdown();
    
    // Main update function
    void update(float deltaTime);
    
    // Sound controls
    void playSound(const std::string& name);
    void stopSound(const std::string& name);
    void stopAllSounds();
    
    // Background music
    void playMusic(const std::string& name, bool loop = true);
    void stopMusic();
    
    // Volume controls
    void setSoundVolume(float volume);
    void setMusicVolume(float volume);
    float getSoundVolume() const { return m_soundVolume; }
    float getMusicVolume() const { return m_musicVolume; }
    
    // Mute controls
    void muteSounds(bool mute);
    void muteMusic(bool mute);
    bool areSoundsMuted() const { return m_soundsMuted; }
    bool isMusicMuted() const { return m_musicMuted; }
    
    // Resource management
    bool loadSound(const std::string& name, const std::string& filePath);
    bool loadMusic(const std::string& name, const std::string& filePath);
    
private:
    // Sound resource
    struct SoundResource {
        std::string filePath;
        // In a real implementation, this would contain audio buffer data
        // or references to Web Audio API nodes
        bool loaded;
    };
    
    // Active sound instance
    struct SoundInstance {
        std::string name;
        float volume;
        bool loop;
        float playbackPosition;
        bool isPlaying;
    };
    
    // Sound resources
    std::unordered_map<std::string, SoundResource> m_soundResources;
    
    // Active sound instances
    std::vector<SoundInstance> m_activeSounds;
    
    // Currently playing music
    SoundInstance m_currentMusic;
    
    // Volume settings
    float m_soundVolume;
    float m_musicVolume;
    
    // Mute settings
    bool m_soundsMuted;
    bool m_musicMuted;
    
    // Initialization state
    bool m_initialized;
};