// Declare the ZeroMQ Publisher class for sending data

#pragma once
#include <string>
#include <zmq.hpp>

class ZeroMQPublisher {
public:
  // Constructor bind publisher to specific network address
  ZeroMQPublisher(const std::string &address);
  // Publishes a message string to all subscribers
  void publish(const std::string &message);

private:
  zmq::context_t context;  // Manages ZeroMQ environment
  zmq::socket_t publisher; // Socket for publishing messages
};
