// receive orders -> use order book to check for potential trades -> publish
// results of the trade

#pragma once
#include "OrderBook.h"
#include "ZeroMQPublisher.h"

class MatchingEngine {
public:
  MatchingEngine(ZeroMQPublisher &publisher); // Dependency injection
  void process(const Order &order);

private:
  void match();
  OrderBook book;
  ZeroMQPublisher &zmq_publisher;
};
