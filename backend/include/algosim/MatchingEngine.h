// receive orders -> use order book to check for potential trades -> publish
// results of the trade

#pragma once
#include "OrderBook.h"
#include "ZeroMQPublisher.h"
#include <cstdint>
#include <string>
#include <vector>

// Struct to represent executed trade
struct Trade {
  uint64_t buyOrderId;
  uint64_t sellOrderId;
  double price;
  uint32_t quantity;
};

class MatchingEngine {
public:
  // Constructor takes a reference to a ZeroMQ publisher to send updates
  MatchingEngine(ZeroMQPublisher &publisher);

  // Main entry point to process a new incoming order
  void process(const Order &order);

private:
  // Algo to attmept to match bids and asks
  void match();
  
  // Serializes the current order book state into a JSON string
  std::string serialize_book_update();
  
  // Serializes a single trade event to a JSON string
  std::string serialize_trade(const Trade& trade);
  
  OrderBook book; // instance of OrderBook
  ZeroMQPublisher &zmq_publisher; // Reference to publisher
};
