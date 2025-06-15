#include "algosim/ZeroMQPublisher.h"

ZeroMQPublisher::ZeroMQPublisher(const std::string &address)
    // Initializer list:
    // 1. Create a ZeroMQ context with 1 I/O thread
    : context(1),
      // 2. Create a publisher socket within that context
      publisher(context, zmq::socket_type::pub) {
  // Bind the publisher socket to the given network address
  publisher.bind(address);
}

// Publish method implementation
void ZeroMQPublisher::publish(const std::string &message) {
  // Send messge over the socket
  // zmq::buffer create message buffer from string data
  // Publisher sends to all connected subscribers
  publisher.send(zmq::buffer(message), zmq::send_flags::none);
}

