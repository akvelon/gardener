using Gardener;
using System;

namespace GardenerServiceApplication
{
    static class GardenerServiceApplication
    {
        static void Main(string[] args)
        {
            var device = new FakeDevice("COM2");
            var service = new GardenerService(device);

            Console.WriteLine("Press key for exit...");
            Console.ReadKey();
        }
    }
}
