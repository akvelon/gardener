using System;

namespace Gardener
{
    public class GardenerDevice: IGardenerDevice
    {
        private string portName;

        public GardenerDevice(String portName)
        {
            this.portName = portName;
        }

        public int GetSensorValue(string sensorName)
        {
            return new Random().Next();
        }

        public bool EnableServo(string servoName, int timeout)
        {
            return true;
        }

        public bool DisableServo(string servoName, int timeout)
        {
            return true;
        }
    }
}
