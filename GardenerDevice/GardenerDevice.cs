using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Sharpduino;
using Sharpduino.Constants;
using System.Timers;
namespace Gardener
{
    public class GardenerDevice: IGardenerDevice
    {
        private string portName;
        private ArduinoUno arduino;
        private const ArduinoUnoPins waterPumpPin = ArduinoUnoPins.D13;
        private const ArduinoUnoAnalogPins lightSensorPin = ArduinoUnoAnalogPins.A0;
        private const ArduinoUnoAnalogPins soilHumiditySensorPin = ArduinoUnoAnalogPins.A1;
        private const ArduinoUnoAnalogPins soilTemperatureSensorPin = ArduinoUnoAnalogPins.A2;
        private const ArduinoUnoAnalogPins airTemperatureSensorPin = ArduinoUnoAnalogPins.A3;
        private const ArduinoUnoAnalogPins airHumiditySensorPin = ArduinoUnoAnalogPins.A4;
        private static Timer offTimer;

        public GardenerDevice(String portName)
        {
            this.portName = portName;
            arduino = new ArduinoUno(portName);
            arduino.SetPinMode(waterPumpPin, PinModes.Output);
        }

        public int GetSensorValue(string sensorName)
        {
            if (sensorName == "light")
            {
                return (int)Math.Ceiling((arduino.ReadAnalog(lightSensorPin)));
            } 
            else if(sensorName == "soil_humidity")
            {
                return (int)Math.Ceiling(arduino.ReadAnalog(soilHumiditySensorPin));
            } 
            else if(sensorName == "soil_temperature")
            {
                return (int)Math.Ceiling(arduino.ReadAnalog(airTemperatureSensorPin));
            } 
            else if(sensorName == "air_humidity")
            {
                return (int)Math.Ceiling(arduino.ReadAnalog(airHumiditySensorPin));
            }
            else if (sensorName == "air_temperature")
            {
                return (int)Math.Ceiling(arduino.ReadAnalog(airTemperatureSensorPin));
            }
            else
            {
                throw new Exception("Unknown sensor name");
            }
        }

        private void onDisableServo(object sender, ElapsedEventArgs e, string servoName)
        {
            DisableServo(servoName, 0);
        }

        public bool EnableServo(string servoName, int timeout)
        {
            if (servoName == "water_pump")
            {
                if (timeout > 0)
                {
                    Timer timer = new Timer(timeout);
                    timer.Elapsed += new ElapsedEventHandler((sender, e) => onDisableServo(sender, e, servoName));
                    timer.Enabled = true;
                }
                arduino.SetDO(waterPumpPin, true);
                return true;
            }
            else
            {
                return false;
            }
        }

        public bool DisableServo(string servoName, int timeout)
        {
            if (servoName == "water_pump")
            {
                arduino.SetDO(waterPumpPin, false);
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
