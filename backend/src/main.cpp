#include "algosim/MatchingEngine.h"
#include "algosim/ZeroMQPublisher.h"
#include <chrono>
#include <cstdint>
#include <exception>
#include <iostream>
#include <random>
#include <thread>

int main() {
  try {
    // Create a ZeroMQ publisher that binds to al network interfaces on port
    // 5555
    ZeroMQPublisher publisher("tcp://*:5555");
    std::cout << "Publisher bound to tcp://*:5555" << std::endl;

    // Create matching engine, passing publisher to it
    MatchingEngine engine(publisher);

    // Set up a random number generator for simulating order data
    std::random_device rd;  // Obtains random number from hardware
    std::mt19937 gen(rd()); // Seeds Mersenne Twister engine
    std::uniform_real_distribution<> price_dist(
        99.0, 101.0); // Distribution for price, centered around 100.0
    std::uniform_int_distribution<> qty_dist(1,
                                             100); // Distribution for quantity
    uint64_t order_id_counter = 0; // Counter for generating unique order IDs

    std::cout << "Starting order simulation..." << std::endl;

    // Infinite loop to continuously generate and process orders
    while (true) {
      Order new_order;
      new_order.id = ++order_id_counter;
      // Alternate between buy and seel orders
      new_order.side =
          (order_id_counter % 2 == 0) ? OrderSide::BUY : OrderSide::SELL;
      // Generate random price and round it to 2 decimal places
      new_order.price = std::round(price_dist(gen) * 100.0) / 100.0;
      new_order.quantity = qty_dist(gen);
      new_order.timestamp = std::chrono::system_clock::now();

      // Log new order to console
      std::cout << "NEW ORDER: ID " << new_order.id
                << (new_order.side == OrderSide::BUY ? " BUY " : " SELL ")
                << new_order.quantity << " @ " << new_order.price << std::endl;

      // Process new order in matching engine
      engine.process(new_order);

      // Pause for a short duration to simulate a real-world order flow
      std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }
  } catch (const zmq::error_t &e) {
    // Catch and report ZeroMQ specific errors
    std::cerr << "ZeroMQ error: " << e.what() << std::endl;
    return 1;
  } catch (const std::exception &e) {
    // Catch and reprt any other standard exceptions
    std::cerr << "Error: " << e.what() << std::endl;
    return 1;
  }

  return 0;
}
