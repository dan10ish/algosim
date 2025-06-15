#pragma once
#include "Order.h"
#include <functional>
#include <map>
#include <queue>

class OrderBook {
public:
  void add(const Order &order); // adding new order to the book

  // Bids: map from price (high to low) to a queue of orders
  std::map<double, std::queue<Order>, std::greater<double>>
      bids; // Queue for if multiple orders in the same time

  // Asks: map from price (low to high) to a queue of orders
  std::map<double, std::queue<Order>> asks; // Queue for if multiple orders in the same time
};
