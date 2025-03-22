# Dodgeball - A Physics-Based Game 

This project is a 2D physics-based game using C++ for the backend, WebAssembly as the bridge, and React.js for the frontend. The game features geometric shapes, drone-like enemies, and physics-based movement

## Features

- Physics-based gameplay
- Geometric drone enemies
- Player movement using arrow keys or WASD
- Background music support
- WebAssembly integration for high performance
- Responsive React.js frontend

## Project Structure

The project is organized into two main parts:

- **Backend** (C++ and WebAssembly)
- **Frontend** (React.js)

### Backend Structure

```
backend/
├── src/                  # Source files
│   ├── engine/           # Game engine core
│   ├── physics/          # Physics implementation
│   ├── entities/         # Game entities
│   ├── audio/            # Audio system
│   └── wasm/             # WebAssembly bindings
├── include/              # Header files
├── libs/                 # Third-party libraries
│   └── box2d/            # Physics library
├── tests/                # Unit tests
├── CMakeLists.txt        # CMake build configuration
└── Makefile              # Makefile for building
```

### Frontend Structure

```
frontend/
├── public/               # Static assets
│   ├── wasm/             # Compiled WebAssembly files
│   ├── sounds/           # Game sound effects and music
│   └── images/           # Game images and sprites
├── src/                  # React source code
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── utils/            # Utility functions
│   ├── styles/           # CSS/SCSS styles
│   ├── wasm/             # WebAssembly interface
│   └── App.js            # Main React application
├── package.json          # NPM dependencies
└── webpack.config.js     # Webpack configuration
```

## Prerequisites

To build and run this project, you'll need:

1. **Emscripten SDK** - For compiling C++ to WebAssembly
2. **CMake** - For building the C++ code
3. **Node.js and npm** - For the React.js frontend
4. **Git** - For version control

## Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/adotdong29/dodgeball.git
cd dodgeball
```

### 2. Set Up Emscripten

If you don't have Emscripten installed:

```bash
# Clone the Emscripten repository
git clone https://github.com/emscripten-core/emsdk.git

# Enter the newly created directory
cd emsdk

# Download and install the latest SDK tools
./emsdk install latest

# Activate the latest SDK
./emsdk activate latest

# Set up environment variables
source ./emsdk_env.sh  # On Linux/macOS
emsdk_env.bat          # On Windows

# Go back to the project directory
cd ..
```

### 3. Build the C++ Backend

```bash
cd backend

# Configure CMake to use Emscripten
emcmake cmake .

# Build the project
emmake make

# This will generate WebAssembly files in frontend/public/wasm/
```

### 4. Set Up the React.js Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## Development Workflow

### Modifying the C++ Backend

1. Make changes to the C++ code in the `backend/` directory
2. Recompile using Emscripten:
   ```bash
   cd backend
   emcmake cmake .
   emmake make
   ```
3. The compiled WebAssembly files will automatically be placed in the frontend's public directory

### Modifying the React.js Frontend

1. Make changes to the React code in the `frontend/src/` directory
2. The development server will automatically reload with your changes if it's running

## Game Controls

- **Movement**: Arrow keys or WASD
- **Start Game**: Space bar
- **Restart Game**: Space bar (when game over)

## Adding Custom Sound

The game supports background music and sound effects. To add your own:

1. Place audio files in `frontend/public/sounds/`
2. Update the `loadBackgroundMusic` and `loadSound` functions in `frontend/src/components/AudioManager.js`

## Extending the Game

### Adding New Entity Types

1. Create a new entity class that inherits from `Entity` in the backend
2. Add rendering logic for the new entity type in `GameCanvas.js`
3. Update the entity type enum in both the C++ and JavaScript code

### Adding Power-ups

1. Create a `Powerup` class in the backend
2. Implement power-up effects in the `Player` class
3. Add rendering and collection logic

### Adding Levels

1. Create a `Level` class in the backend
2. Implement level loading and progression logic
3. Add visual transitions between levels

## Performance Optimization

### WebAssembly Optimization

- Use `-O3` optimization flag in Emscripten for release builds
- Minimize data transfer between JavaScript and WebAssembly
- Use direct memory access where possible

### Rendering Optimization

- Implement object pooling for frequently created/destroyed entities
- Use canvas layers for static elements
- Consider implementing culling for off-screen entities

## Troubleshooting

### Common Issues

#### WebAssembly Module Not Loading

- Ensure the `.wasm` file is correctly built and placed in `frontend/public/wasm/`
- Check browser console for specific errors
- Verify that your server is configured to serve `.wasm` files with the correct MIME type

#### Build Errors

- Make sure Emscripten is properly installed and environment variables are set
- Check for C++ syntax errors or missing dependencies
- Ensure CMake is configured correctly for WebAssembly output

## Resources

- [WebAssembly Official Website](https://webassembly.org/)
- [Emscripten Documentation](https://emscripten.org/docs/index.html)
- [React.js Documentation](https://reactjs.org/docs/getting-started.html)
- [Box2D Physics Engine](https://box2d.org/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with React.js, WebAssembly, and C++
