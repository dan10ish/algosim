#pragma once
#include "Order.h"
#include <functional>
#include <map>
#include <queue>
#include <functional> // For std::greater

class OrderBook {
public:
  void add(const Order &order); // adding new order to appropriate side of the book

  // Bids: map from price (high to low) to a queue of orders
  std::map<double, std::queue<Order>, std::greater<double>>
      bids; // Queue for if multiple orders in the same time

  // Asks: map from price (low to high) to a queue of orders
  std::map<double, std::queue<Order>> asks; // Queue for if multiple orders in the same time
};
