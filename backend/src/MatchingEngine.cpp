#include "algosim/MatchingEngine.h"
#include <algorithm>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <sstream>

// Constructor: Initializes the engine with a reference to a publisher
MatchingEngine::MatchingEngine(ZeroMQPublisher &publisher)
    : zmq_publisher(publisher) {}

// Main processing funciton for new order
void MatchingEngine::process(const Order &order) {
  // Add new order to order book
  book.add(order);
  // Attempt to match orders now that the book has changed
  match();
  // After matching, publish teh updated state of the order book
  zmq_publisher.publish(serialize_book_update());
}

// Core matching algorithm
void MatchingEngine::match() {
  // Loop as long as there are both bids and ask in the book
  while (!book.bids.empty() && !book.asks.empty()) {
    // Get iterator to best bid and best ask
    auto best_bid_iter = book.bids.begin();
    auto best_ask_iter = book.asks.begin();

    // If highest bid is less than lowest ask, no trade is possible
    if (best_bid_iter->first < best_ask_iter->first) {
      break;
    }

    // Get reference to queues of orders at the best price levels
    auto &bid_queue = best_bid_iter->second;
    auto &ask_queue = best_ask_iter->second;

    // Get reference to orderes at front of queues
    Order &bid_order = bid_queue.front();
    Order &ask_order = ask_queue.front();

    // Determine quantity to trade: minim of two orders
    uint32_t trade_quantity = std::min(bid_order.quantity, ask_order.quantity);

    // Create trade record. Trade price is the price of the bid
    Trade trade = {bid_order.id, ask_order.id, bid_order.price, trade_quantity};

    // Log the trade to console and publish it via ZeroMQ
    std::cout << "TRADE: " << trade.quantity << " @ " << trade.price
              << std::endl;
    zmq_publisher.publish(serialize_trade(trade));

    // Update quantities of orders involved in trade
    bid_order.quantity -= trade_quantity;
    ask_order.quantity -= trade_quantity;

    // If an order is fully filled (quantity is 0), remove from its queue
    if (bid_order.quantity == 0) {
      bid_queue.pop();
    }
    if (ask_order.quantity == 0) {
      ask_queue.pop();
    }

    // If price level's queue is empty, remove entire price level
    if (bid_queue.empty()) {
      book.bids.erase(best_bid_iter);
    }
    if (ask_queue.empty()) {
      book.asks.erase(best_ask_iter);
    }
  }
}

// Helper functions

// Serialize order book state to JSON string
std::string MatchingEngine::serialize_book_update() {
  std::stringstream ss;
  ss << std::fixed << std::setprecision(2); // Format price to 2 decomatl places
  ss << "{\"type\": \"book\", \"payload\": {\"bids\": [";
  for (auto it = book.bids.begin(); it != book.bids.end(); ++it) {
    ss << "[\"" << it->first << "\", " << it->second.size() << "]";
    if (std::next(it) != book.asks.end())
      ss << ",";
  }
  ss << "]}}";
  return ss.str();
}

// Serialize single trade to a json string
std::string MatchingEngine::serialize_trade(const Trade &trade) {
  std::stringstream ss;
  ss << std::fixed << std::setprecision(2);
  ss << "{\"type\": \"trade\", \"payload\": {\"price\": " << trade.price
     << ", \"quantity\": " << trade.quantity << "}}";
  return ss.str();
}
