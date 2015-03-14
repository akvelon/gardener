using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Sharpduino;
using Sharpduino.Constants;
using System.Timers;
using System.IO.Ports;

namespace Gardener
{
    public class GardenerDevice: IGardenerDevice
    {
        private string portName;
        private SerialPort arduinoPort;

        public GardenerDevice(String portName)
        {
            this.portName = portName;
            try
            {
                arduinoPort = new SerialPort(portName, 9600, Parity.None, 8, StopBits.One);
                arduinoPort.NewLine = "\n";
                arduinoPort.Open();

            }
            catch (Exception)
            {
                Console.WriteLine("Error opening serial port {0}", portName);
                System.Environment.Exit(1);
            }
        }

        private String executeSerialCommand(String command)
        {
            if (!arduinoPort.IsOpen)
            {
                return "";
            }
            arduinoPort.Write(command + '\n');
            return arduinoPort.ReadLine();
        }

        private string setActuatorState(String actuatorName, Boolean state)
        {
            if (state)
            {
                return executeSerialCommand("ENABLE" + actuatorName);
            }
            else
            {
                return executeSerialCommand("DISABLE" + actuatorName);
            }
        }

        public int GetSensorValue(string sensorName)
        {
            String value = executeSerialCommand("GET " + sensorName); 
            if (value == "SENSOR NOT FOUND")
            {
                throw new Exception("Error. Unknown sensor name.");
            }
            else
            {
                return Convert.ToInt16(value);
            }
        }

        public bool EnableServo(string servoName, int timeout)
        {
            return setActuatorState(servoName, true) == "OK";
        }

        public bool DisableServo(string servoName, int timeout)
        {
            return setActuatorState(servoName, false) == "OK";
        }
    }
}
