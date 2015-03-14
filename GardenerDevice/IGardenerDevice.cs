using System;

namespace Gardener
{
    interface IGardenerDevice
    {
        int GetSensorValue(String sensorName);

        bool EnableServo(String servoName, int timeout);

        bool DisableServo(String servoName, int timeout);
    }
}
