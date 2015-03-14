using Gardener;

namespace GardenerServiceApplication
{
    static class GardenerServiceApplication
    {
        static void Main(string[] args)
        {
            var device = new FakeDevice("COM2");
            var service = new GardenerService(device);

            while (true)
            {
                System.Threading.Thread.Sleep(1);
            }
        }
    }
}
