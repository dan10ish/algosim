#pragma once
#include <chrono>
#include <cstdint>
#include <string>

enum class OrderSide { BUY, SELL };

struct Order {
  uint64_t id;
  OrderSide side;    // Buy or Sell
  double price;      // Price of order
  uint32_t quantity; // number of units to be traded
  std::chrono::system_clock::time_point timestamp; // for time priority matching
};
