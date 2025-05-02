#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>  // <-- ADD this library (Install it from Arduino Library Manager)

const char* ssid = "TOPNET7E78AA1A";        
const char* password = "yessineisgold1925"; 

WiFiUDP udp;
unsigned int localUdpPort = 1234; // Port to listen on (must match Node.js)
char incomingPacket[512];         // Buffer for incoming UDP packets

// Horse LED pins
const int horse1LedPin = 2;  // Example GPIO2 for horse1
const int horse2LedPin = 4;  // Example GPIO4 for horse2
const int horse3LedPin = 5;  // Example GPIO5 for horse3

void setup() {
  Serial.begin(115200);
  Serial.println("✅ setup() started");

  // Setup LED pins
  pinMode(horse1LedPin, OUTPUT);
  pinMode(horse2LedPin, OUTPUT);
  pinMode(horse3LedPin, OUTPUT);

  digitalWrite(horse1LedPin, LOW);
  digitalWrite(horse2LedPin, LOW);
  digitalWrite(horse3LedPin, LOW);

  // Connect to Wi-Fi
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Connected to Wi-Fi");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Start UDP
  udp.begin(localUdpPort);
  Serial.printf("✅ Now listening for UDP packets on port %d\n", localUdpPort);
}

void loop() {
  int packetSize = udp.parsePacket();
  if (packetSize) {
    int len = udp.read(incomingPacket, sizeof(incomingPacket) - 1);
    if (len > 0) {
      incomingPacket[len] = 0;
    }
    Serial.printf("\n📩 Received UDP message: %s\n", incomingPacket);

    // Parse JSON
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, incomingPacket);

    if (error) {
      Serial.println("❌ Failed to parse incoming JSON");
      return;
    }

    const char* horse = doc["horse"];
    const char* status = doc["status"];

    Serial.printf("🐎 Horse: %s | Status: %s\n", horse, status);

    if (strcmp(status, "died") == 0 || strcmp(status, "euthanized") == 0) {
      // Light the correct LED based on horse ID
      if (strcmp(horse, "horse1") == 0) {
        digitalWrite(horse1LedPin, HIGH);
        delay(2000);
        digitalWrite(horse1LedPin, LOW);
      } else if (strcmp(horse, "horse2") == 0) {
        digitalWrite(horse2LedPin, HIGH);
        delay(2000);
        digitalWrite(horse2LedPin, LOW);
      } else if (strcmp(horse, "horse3") == 0) {
        digitalWrite(horse3LedPin, HIGH);
        delay(2000);
        digitalWrite(horse3LedPin, LOW);
      } else {
        Serial.println("⚠️ Unknown horse received");
      }
    } else {
      Serial.println("ℹ️ Status is not critical, no action needed");
    }
  }
}
