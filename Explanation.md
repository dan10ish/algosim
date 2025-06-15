#### CMakeLists.txt

- A plain `txt` file that tells `CMake` what your project looks liek and how to build it.
- **Cross Platform**: One `CMakeLists.txt` file will help `CMake` generate correct build files for diffferent OS (Windows, macOS, Linux)
- **Dependencies**: `CMake` automatically finds external libraries on your system and link them to your project.

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

#### Order.h

- `#pragma once`: This is a directive that tells the compiler to only include this file **one time**, even if multiple other files try to `#include` it. This prevents errors from re-declaring the same things over and over. It's a standard and highly recommended practice.

- `enum class OrderSide { BUY, SELL };`: This line declares a **scoped enumeration** `enum class`.

  - **`enum`**: It's a custom data type that can only hold a limited set of constant values. Here, a variable of type `OrderSide` can either be `BUY` or `SELL`.
  - **`class`**: The `class` keyword makes it "scoped." This is a modern C++ feature that makes your code safer and clearer. It means you must refer to the values as `OrderSide::BUY` and `OrderSide::SELL`, which avoids naming conflicts with other potential `BUY` or `SELL` variables in your code.

- `struct Order { ... };`: This declares a **structure** named `Order`. A `struct` is a way to group several related variables into a single, convenient package. It acts as a blueprint for creating "Order" objects. Let's look at its members:

  - **`uint64_t id;`**: This is a 64-bit **u**nsigned **int**eger for the order's unique ID. Using fixed-size integers from `<cstdint>` like `uint64_t` is good practice because it guarantees the variable will be the same size on any computer, which is crucial for systems programming.
  - **`OrderSide side;`**: This will hold the side of the order, and its value must be either `OrderSide::BUY` or `OrderSide::SELL`.
  - **`double price;`**: A double-precision floating-point number to store the order's price.
  - **`uint32_t quantity;`**: A 32-bit unsigned integer for the number of shares or contracts in the order.
  - **`std::chrono::system_clock::time_point timestamp;`**: This is a sophisticated type from the `<chrono>` library that represents a specific point in time. It's perfect for timestamping when an order was created or received, with very high precision.

#### OrderBook.h

- `<map>`: This includes `std::map`, a container that stores key-value pairs in a sorted order based on the key. It's the perfect choice for an order book, where the key is the price and the value is a list of orders at that price.
- `<queue>`: This includes std::queue, a "First-In, First-Out" (FIFO) container. When multiple orders are placed at the same exact price, they must be executed in the order they were received. A queue is the natural data structure for enforcing this time priority rule.
- `<functional>`: This includes std::greater, a function object that will be used to make a map sort in descending order.
- Example: If you have buy orders at $100, $101, and $102, the bids map will be structured internally like this:
  - Key: 102.0 -> Value: Queue of orders at $102
  - Key: 101.0 -> Value: Queue of orders at $101
  - Key: 100.0 -> Value: Queue of orders at $100
