# CMakeLists.txt for Dodgeball Game with WebAssembly support

cmake_minimum_required(VERSION 3.13)
project(DodgeballGame)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Check if we're compiling with Emscripten
if(EMSCRIPTEN)
    # Emscripten specific settings
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
    
    # Add Emscripten-specific compiler and linker flags
    set(EMSCRIPTEN_FLAGS
        "-s WASM=1"
        "-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']"
        "-s EXPORTED_FUNCTIONS=['_malloc','_free','_initGame','_updateGame','_handleInput','_getGameState','_getEntityCount','_getEntityData','_getPlayerHealth']"
        "-s ALLOW_MEMORY_GROWTH=1"
        "-s MODULARIZE=1"
        "-s EXPORT_NAME='DodgeballModule'"
        "-s USE_ES6_IMPORT_META=0"
        "-s ENVIRONMENT='web'"
        "-O2"
    )
    
    string(REPLACE ";" " " EMSCRIPTEN_FLAGS_STR "${EMSCRIPTEN_FLAGS}")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${EMSCRIPTEN_FLAGS_STR}")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} ${EMSCRIPTEN_FLAGS_STR}")
    
    # Output the .wasm file to the frontend public directory
    set(WASM_OUTPUT_DIR "${CMAKE_SOURCE_DIR}/../frontend/public/wasm")
    file(MAKE_DIRECTORY ${WASM_OUTPUT_DIR})
    set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${WASM_OUTPUT_DIR})
else()
    # Native build settings for development and testing
    set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
endif()

# Include directories
include_directories(
    ${CMAKE_SOURCE_DIR}/include
    ${CMAKE_SOURCE_DIR}/libs
)

# Source files
file(GLOB_RECURSE SOURCES
    "src/*.cpp"
)

# Header files
file(GLOB_RECURSE HEADERS
    "include/*.h"
)

# Define the executable
add_executable(dodgeball ${SOURCES} ${HEADERS})

# If using WebAssembly, create a special target to copy the .wasm file
if(EMSCRIPTEN)
    add_custom_command(
        TARGET dodgeball POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
        ${WASM_OUTPUT_DIR}/dodgeball.wasm
        ${WASM_OUTPUT_DIR}/dodgeball.wasm
        COMMENT "Copying WebAssembly module to frontend directory"
    )
    
    add_custom_command(
        TARGET dodgeball POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
        ${WASM_OUTPUT_DIR}/dodgeball.js
        ${WASM_OUTPUT_DIR}/dodgeball.js
        COMMENT "Copying JavaScript glue code to frontend directory"
    )
endif()

# Print configuration summary
message(STATUS "Configuration summary:")
message(STATUS "  C++ Standard: ${CMAKE_CXX_STANDARD}")
if(EMSCRIPTEN)
    message(STATUS "  Building with Emscripten for WebAssembly")
    message(STATUS "  WebAssembly output directory: ${WASM_OUTPUT_DIR}")
    message(STATUS "  Emscripten flags: ${EMSCRIPTEN_FLAGS_STR}")
else()
    message(STATUS "  Building natively")
    message(STATUS "  Output directory: ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")
endif()