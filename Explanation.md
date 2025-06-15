#### CMakeLists.txt
```CMake
# backend-cpp/CMakeLists.txt

# Minimum CMake version
# You're telling CMake that your script requires at least version 3.22.
# This is good because FetchContent has improved in recent versions.
cmake_minimum_required(VERSION 3.22)

# Project definition
# You're defining a C++ (CXX) project named AlgoSim.
project(AlgoSim CXX)

# Set C++ standard to C++17
# You are enforcing the C++17 standard for your project. The `REQUIRED ON`
# part ensures that if a compiler doesn't support C++17, CMake will stop with an error.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include FetchContent for dependency management
# This command makes the FetchContent module's functions (like FetchContent_Declare) available.
include(FetchContent)

# Declare and fetch ZeroMQ library (libzmq)
# Here you are defining where to get the libzmq library from.
# FetchContent_Declare just sets up the information.
FetchContent_Declare(
  libzmq
  GIT_REPOSITORY https://github.com/zeromq/libzmq.git
  GIT_TAG        v4.3.5 # You're locking it to a specific version, which is great for stability.
)
# This is the command that actually downloads the source code and makes it
# available for your project to use (by running its own CMakeLists.txt).
FetchContent_MakeAvailable(libzmq)

# Declare and fetch C++ wrapper for ZeroMQ (cppzmq)
# You're doing the same for cppzmq, which is the C++ "wrapper" that makes
# libzmq easier to use in modern C++.
FetchContent_Declare(
  cppzmq
  GIT_REPOSITORY https://github.com/zeromq/cppzmq.git
  GIT_TAG        v4.10.0
)
FetchContent_MakeAvailable(cppzmq)

# Add the 'include' directory to the project's include paths
# This tells the compiler to look for header files in the 'include' folder
# relative to your CMakeLists.txt. This is how it will find files like
# "Order.h", "OrderBook.h", etc. when compiling your .cpp files.
include_directories(include)

# Add the source files to create the executable
# You are defining an executable program named 'algosim_engine' and listing
# all the source files required to build it.
add_executable(algosim_engine
  src/main.cpp
  src/Order.cpp
  src/OrderBook.cpp
  src/MatchingEngine.cpp
  src/ZeroMQPublisher.cpp
)

# Link the executable against the ZeroMQ library
# Your program uses functions from libzmq, so you need to "link" it. This tells
# the compiler to connect the compiled code from libzmq to your final executable.
# PRIVATE means this dependency is private to algosim_engine.
target_link_libraries(algosim_engine PRIVATE libzmq)

# Add include directories from dependencies to our executable
# cppzmq is a header-only library, meaning it doesn't need to be compiled and linked
# like libzmq. However, your project needs to know where to find its header files
# (specifically zmq.hpp). This line adds the cppzmq source directory to the
# include path for your executable.
target_include_directories(algosim_engine PRIVATE
  ${cppzmq_SOURCE_DIR}
)
```
