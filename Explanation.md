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

#### ZeroMQPublisher.h

- **Publisher**: The publisher is like a radio station announcer. It broadcasts messages on a specific channel (e.g., "Channel 5555"). It doesn't know or care if anyone is listening. It just sends the data out. Your `ZeroMQPublisher` class is this announcer.
- **Subscriber**: A subscriber is like someone with a radio. They can tune into a specific channel (e.g., "Channel 5555") and will receive every message broadcast on it. You could have many subscribers listening to the same publisher. Your Python code will likely be a subscriber.

This is powerful because your C++ engine can publish market data without knowing anything about the Python service that might be listening to it. This is called **decoupling**.

This file declares a class that encapsulates, or wraps up, all the logic needed to be a ZeroMQ publisher.

- `#include <zmq.hpp>`: This includes the official C++ header for ZeroMQ. The `.hpp` file provides a much nicer, easier-to-use C++ interface (`zmq::context_t`, `zmq::socket_t`) over the base C library (`zmq.h`).

- `class ZeroMQPublisher { ... };`: This defines your class. The goal is to hide the complexity of ZeroMQ behind a simple interface.

- `public:` Members: The `public` section is the "user interface" of your class. It's how other parts of your code will interact with the publisher.

  - **`ZeroMQPublisher(const std::string& address);`**: This is the **constructor**. It's a special function that is called automatically when you create a `ZeroMQPublisher` object. Its job is to set up the publisher.

    - `const std::string& address`: It takes a single argument: the "address" to publish on. This is like the radio frequency. It's a string that can be:
      - `"tcp://*:5555"`: Publish on TCP port 5555, accepting connections from any network interface (`*`).
      - `"tcp://127.0.0.1:5555"`: Publish only on your local machine's port 5555.
      - `"ipc:///tmp/algosim.ipc"`: Use Inter-Process Communication (IPC). This is like a file on your system. It's faster than TCP but only works for programs running on the same machine.

  - **`void publish(const std::string& message);`**
    This is the main action method. Once the publisher is set up, you call this function to broadcast a message to all subscribers.

- `private:` Members: The `private` section contains the internal machinery of the class. Code outside of this class cannot access these members directly.

  - **`zmq::context_t context;`**: This is the **most important** ZeroMQ object. Think of the context as the **environment or factory** that manages all ZeroMQ sockets within your program. It handles the background I/O work.

    - You typically create **only one context** in your entire application and share it.
    - When the `ZeroMQPublisher` object is created, this `context` member is automatically initialized.

  - **`zmq::socket_t publisher;`**: This is a ZeroMQ **socket**. It's not a regular network socket; it's a far more advanced object that knows how to behave based on a pattern.
    - In the constructor's implementation (in the `.cpp` file), you will create this socket from the `context` and tell it to be a `ZMQ_PUB` (publisher) type socket.
    - You will also use the `bind` method on this socket to attach it to the address you provided.
    - The `publish` method will then use this socket object to send out messages.

#### MatchingEngine.h

A **Matching Engine** is the core component of any electronic exchange. It's a piece of software that matches buy (bid) and sell (ask) orders to execute trades. Your `MatchingEngine` class is the C++ implementation of this concept. It doesn't store the orders itself; it uses the `OrderBook` for that. And it doesn't handle communication; it uses the `ZeroMQPublisher` for that. It's the orchestrator.

- Included Headers

  - **`#include "OrderBook.h"`**: The engine needs to know what an `OrderBook` is because it will contain one. This gives it access to the `bids` and `asks` maps to find matching orders.
  - **`#include "ZeroMQPublisher.h"`**: The engine needs to publish information about executed trades (e.g., "Trade occurred: 10 shares at $150.50"). Including this file allows the engine to use the publisher you created earlier.

- The `MatchingEngine` Class

- `public:` Members: The `public` section is the external interface of the engine. This is how other parts of your program (like your `main` function) will interact with it.

  - **`MatchingEngine(ZeroMQPublisher& publisher);`**: This is the **constructor**. It's called when you create a `MatchingEngine` object.

    - `ZeroMQPublisher& publisher`: This is a very important concept called **Dependency Injection**.
      - Instead of the `MatchingEngine` creating its _own_ `ZeroMQPublisher`, it receives a reference (`&`) to an _existing_ one.
      - **Why is this good?** It decouples the engine from the publisher's setup. Your `main` function can create one publisher with a specific address (e.g., `"tcp://*:5555"`) and then pass it, or "inject" it, into the `MatchingEngine`. This makes your code much more flexible and easier to test.

  - **`void process(const Order& order);`**: This is the main entry point for new orders into the system. When your application receives a new order from the outside world, it will call this function.
    - The implementation of this function (in the `.cpp` file) will likely first add the `order` to the `OrderBook` and then immediately call the internal `match()` function to see if this new order can be matched with any existing ones.

- `private:` Members: The `private` section contains the internal implementation details that the outside world doesn't need to know about.

  - **`void match();`**: This is a private helper function. It will contain the **core matching algorithm**. Its job is to look at the top of the order book (the best bid and the best ask) and see if a trade is possible.

    - **Logic inside `match()`**: It will check if the highest bid price in the `OrderBook` is greater than or equal to the lowest ask price. If it is, a match occurs. It will then determine the trade price and quantity, update the orders in the book (or remove them if they are fully filled), and generate a trade notification message.
    - Making it `private` is good design. The outside world just needs to `process` an order; it doesn't need to know _how_ the matching is done.

  - **`OrderBook book;`**: This declares that every `MatchingEngine` object has its own `OrderBook` object as a member variable. This `book` will hold the current state of all active buy and sell orders. When an order comes into `process()`, it gets added to this `book`.

  - **`ZeroMQPublisher& zmq_publisher;`**: This is the private member that holds on to the publisher that was passed into the constructor.
    - It's a reference (`&`), not a full object. This means it's just a pointer to the original `ZeroMQPublisher` object that was created outside the engine. It doesn't create a copy.
    - When the `match()` function successfully executes a trade, it will use this `zmq_publisher` to call the `publish()` method, broadcasting the trade details to any listening subscribers (like your Python service).

- How It All Works Together: A Step-by-Step Flow

  1.  In your `main()` function, you create a `ZeroMQPublisher` object.
  2.  You then create a `MatchingEngine` object, passing the publisher to its constructor.
  3.  An external event happens (e.g., a user clicks a button), creating a new `Order`.
  4.  Your code calls `engine.process(new_order);`.
  5.  Inside `process()`, the `new_order` is added to the private `book` member.
  6.  `process()` then calls the private `match()` function.
  7.  `match()` looks at the `book`'s `bids` and `asks`.
  8.  **If a match is found**:

  - A trade is created.
  - The orders in the `book` are updated.
  - A message describing the trade is created (e.g., a JSON string).
  - `zmq_publisher.publish(trade_message);` is called to broadcast the trade.

  9.  The `process()` function then finishes. The engine is now ready for the next order.
