// Declare the ZeroMQ Publisher class for sending data

#pragma once
#include <zmq.hpp>
#include <string>

class ZeroMQPublisher {
  public:
    ZeroMQPublisher(const std::string& address);
    void publish(const std::string& message);
  private:
    zmq::context_t context;
    zmq::socket_t publisher;
};