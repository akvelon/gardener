const int waterPumpPin = 13;
const int soilHumiditySensorPin = A0;
const int lightSensorPin = A1;
const int soilTemperatureSensorPin = A2;

void setup() {
  Serial.begin(9600);
  pinMode(waterPumpPin, OUTPUT); 
}

String cmd = "";

int getLightSensor() {
  return 100 - (analogRead(lightSensorPin) * 100.0 / 1024.0);
}

int getSoilHumiditySensor() {
  return analogRead(soilHumiditySensorPin) * 100.0 / 950.0;
}

void loop() {
  while (Serial.available() > 0) {
    char newChar = Serial.read();
    if (newChar == '\n') {
      if (cmd  == "GET light") {
        Serial.print(getLightSensor());
        Serial.print("\n");
      } else  if (cmd  == "GET soil_humidity") {
        Serial.print(getSoilHumiditySensor());
        Serial.print("\n");
      } else {
        Serial.print("SENSOR NOT FOUND\n");
      }
      cmd = "";
    } else {
      cmd += newChar;
    }
  }
}








