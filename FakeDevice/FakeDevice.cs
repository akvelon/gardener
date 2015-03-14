using System;
using System.Timers;

namespace Gardener
{
    public class FakeDevice : IGardenerDevice
    {
        public FakeDevice(String portName)
        {
        }

        public int GetSensorValue(string sensorName)
        {
            if (sensorName == "light")
            {
                return new Random().Next();
            }
            else if (sensorName == "soil_humidity")
            {
                return new Random().Next();
            } 
            else if (sensorName == "humidity")
            {
                return new Random().Next();
            }
            else if (sensorName == "solarFlow")
            {
                return new Random().Next();
            }
            else if (sensorName == "soil_temperature")
            {
                return new Random().Next();
            }
            else if (sensorName == "air_humidity")
            {
                return new Random().Next();
            }
            else if (sensorName == "air_temperature")
            {
                return new Random().Next();
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
            return true;
            //if (servoName == "water_pump")
            //{
            //    if (timeout > 0)
            //    {
            //        var timer = new Timer(timeout);
            //        timer.Elapsed += (sender, e) => onDisableServo(sender, e, servoName);
            //        timer.Enabled = true;
            //    }
            //    return true;
            //}

            //return false;
        }

        public bool DisableServo(string servoName, int timeout)
        {
            //return servoName == "water_pump";

            return true;
        }
    }
}
