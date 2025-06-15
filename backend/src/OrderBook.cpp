#include "algosim/OrderBook.h"

// Add Method
void OrderBook::add(const Order &order) {
  // Check side of order
  if (order.side == OrderSide::BUY) {
    // Buy Order, add it to bids map
    bids[order.price].push(order);
  } else {
    // Sell order, add it to asks map
    asks[order.price].push(order);
  }
}