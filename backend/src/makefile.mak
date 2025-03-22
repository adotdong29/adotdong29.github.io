# Makefile for the Dodgeball game C++ backend

# Directories
SRC_DIR := src
INCLUDE_DIR := include
BUILD_DIR := build
WASM_OUTPUT_DIR := ../frontend/public/wasm

# Emscripten compiler and flags
EMCC := emcc
EMCMAKE := emcmake
EMMAKE := emmake

# Default target
all: wasm

# Create build directory
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

# Configure CMake for WebAssembly
configure: $(BUILD_DIR)
	cd $(BUILD_DIR) && $(EMCMAKE) cmake ..

# Build WebAssembly using Emscripten
wasm: configure
	cd $(BUILD_DIR) && $(EMMAKE) make

# Build natively (for testing without browser)
native:
	mkdir -p build_native
	cd build_native && cmake .. && make

# Clean build artifacts
clean:
	rm -rf $(BUILD_DIR) build_native
	rm -rf $(WASM_OUTPUT_DIR)/*.wasm $(WASM_OUTPUT_DIR)/*.js

# Create WebAssembly output directory in frontend
$(WASM_OUTPUT_DIR):
	mkdir -p $(WASM_OUTPUT_DIR)

# Create example wasm file (useful for testing)
test-wasm: $(WASM_OUTPUT_DIR)
	$(EMCC) $(SRC_DIR)/test.cpp -o $(WASM_OUTPUT_DIR)/test.js \
		-s WASM=1 \
		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
		-s MODULARIZE=1 \
		-s EXPORT_NAME="TestModule"

# Help target
help:
	@echo "Dodgeball Game Makefile"
	@echo ""
	@echo "Targets:"
	@echo "  all (default) - Build WebAssembly module"
	@echo "  configure     - Configure CMake for WebAssembly"
	@echo "  wasm          - Build WebAssembly module"
	@echo "  native        - Build natively (for testing)"
	@echo "  clean         - Clean build artifacts"
	@echo "  test-wasm     - Create a test WebAssembly file"
	@echo "  help          - Show this help message"

.PHONY: all configure wasm native clean test-wasm help