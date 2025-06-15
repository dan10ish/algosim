cmake_minimum_required(VERSION 3.22)

project(AlgoSim)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)

FetchContent_Declare(
  libzmq
  GIT_REPOSITORY https://github.com/zeromq/libzmq.git
  GIT_TAG        v4.3.5
)
FetchContent_MakeAvailable(libzmq)

FetchContent_Declare(
  cppzmq
  GIT_REPOSITORY https://github.com/zeromq/cppzmq.git
  GIT_TAG        v4.10.0
)
FetchContent_MakeAvailable(cppzmq)

include_directories(include)

add_executable(algosim_engine
  src/main.cpp
  src/Order.cpp
  src/OrderBook.cpp
  src/MatchingEngine.cpp
  src/ZeroMQPublisher.cpp
)

target_link_libraries(algosim_engine PRIVATE libzmq)

target_include_directories(algosim_engine PRIVATE
  ${cppzmq_SOURCE_DIR}
)