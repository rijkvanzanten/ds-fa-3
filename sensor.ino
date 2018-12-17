#include "Particle.h"

int zInput = A1;
const int sendPeriodMS = 50;
const int sampleSize = 30;

IPAddress serverAddress(45, 55, 56, 77);
const int serverPort = 3001;

// Finite state machine states
enum { CONNECT_STATE, SEND_DATA_STATE };

TCPClient client;
unsigned long lastSend = 0;
int state = CONNECT_STATE;

int lastRead = 0;

void setup() {
    Serial.begin(9600);
    pinMode(zInput, INPUT);
}

void loop() {
  switch(state) {
      case CONNECT_STATE:
        Serial.println("connecting...");
        if (client.connect(serverAddress, serverPort)) {
          state = SEND_DATA_STATE;
          Serial.println("connected");
        } else {
          Serial.println("connection failed");
          delay(15000);
        }
        break;
    
      case SEND_DATA_STATE:
        if (client.connected()) {
          // Discard any incoming data; there shouldn't be any
          while(client.available()) {
            client.read();
          }
    
          // Send data up to the server
          if (millis() - lastSend >= sendPeriodMS) {
            lastSend = millis();
            int read = ReadAxis(zInput);
            
            if (read != lastRead) {
                client.write(String(read) + ".");
                Serial.println(read);
                lastRead = read;
            }
          }
        }
        else {
          // Disconnected
          Serial.println("disconnected...");
          client.stop();
          state = CONNECT_STATE;
          delay(5000);
        }
        break;
  }
}

int ReadAxis(int axisPin) {
    long reading = 0;
    delay(1);
    for (int i = 0; i < sampleSize; i++) {
        reading += analogRead(axisPin);
    }
    int result = reading / sampleSize;

    return round(result);
}

signed char roundDelta[5] = {0, -1, -2, 2, 1};
int round(int in) {
  return in + roundDelta[in%5];
}
