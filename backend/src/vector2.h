// backend/include/Vector2.h
#pragma once

#include <cmath>

class Vector2 {
public:
    float x, y;
    
    Vector2() : x(0.0f), y(0.0f) {}
    Vector2(float x, float y) : x(x), y(y) {}
    
    // Vector operations
    Vector2 operator+(const Vector2& v) const { return Vector2(x + v.x, y + v.y); }
    Vector2 operator-(const Vector2& v) const { return Vector2(x - v.x, y - v.y); }
    Vector2 operator*(float scalar) const { return Vector2(x * scalar, y * scalar); }
    Vector2 operator/(float scalar) const { return Vector2(x / scalar, y / scalar); }
    
    // Vector utilities
    float length() const { return std::sqrt(x * x + y * y); }
    float lengthSquared() const { return x * x + y * y; }
    void normalize() {
        float len = length();
        if (len > 0) {
            x /= len;
            y /= len;
        }
    }
    
    Vector2 normalized() const {
        Vector2 result = *this;
        result.normalize();
        return result;
    }
    
    static float distance(const Vector2& a, const Vector2& b) {
        return (b - a).length();
    }
    
    static float dot(const Vector2& a, const Vector2& b) {
        return a.x * b.x + a.y * b.y;
    }
};