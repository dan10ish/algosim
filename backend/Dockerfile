# --- Stage 1: The Builder ---
# Use a base image that includes the GCC compiler suite and standard build tools.
FROM gcc:12 AS builder

# Set the working directory inside the container.
WORKDIR /app

# Install dependencies required for building: cmake and the ZeroMQ development library (libzmq3-dev).
RUN apt-get update && apt-get install -y cmake libzmq3-dev

# Copy all source code from the local 'backend-cpp' directory into the container's /app directory.
COPY . .

# Create a build directory to keep build artifacts separate from source code.
RUN mkdir build

# Run CMake to configure the project. It reads CMakeLists.txt and generates build files (Makefiles) in the 'build' directory.
# CMAKE_BUILD_TYPE=Release enables optimizations for the final executable.
RUN cmake -S. -B build -DCMAKE_BUILD_TYPE=Release

# Run the build command. This compiles the source code and creates the executable in the 'build' directory.
RUN cmake --build build

# --- Stage 2: The Final Runtime Image ---
# Use a more recent base image that has compatible glibc versions
FROM debian:bookworm-slim
WORKDIR /app

# Install only the runtime dependency: the ZeroMQ shared library (libzmq5).
# Since we're using the same base image, libzmq3-dev is already available, but we still need the runtime lib
RUN apt-get update && apt-get install -y libzmq5 && rm -rf /var/lib/apt/lists/*

# Copy only the compiled executable from the 'builder' stage into the final image.
COPY --from=builder /app/build/algosim_engine .

# Set the default command to run when the container starts.
CMD ["./algosim_engine"]
