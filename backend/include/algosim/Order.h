#pragma once
#include <cstdint>
#include <string>
#include <chrono>

enum class OrderSide {BUY, SELL};

struct Order{
  uint64_t id;
  OrderSide side;
  double price;
  uint32_t quantity;
  std::chrono::system_clock::time_point timestamp;
};