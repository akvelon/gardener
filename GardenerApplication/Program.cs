using Gardener;
using System;

namespace GardenerServiceApplication
{
    static class GardenerServiceApplication
    {
        private const bool emulateDevice = false;

        private const string devicePort = "COM6";

        static void Main(string[] args)
        {
            IGardenerDevice device;

            if (emulateDevice)
            {
                device = new FakeDevice(devicePort);
            }
            else
            {
                device = new GardenerDevice(devicePort);

            }

            var service = new GardenerService(device);

            Console.WriteLine("Press key for exit...");
            Console.ReadKey();
        }
    }
}
