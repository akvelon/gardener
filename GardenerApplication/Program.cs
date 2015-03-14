using Gardener;

namespace GardenerApplication
{
    class Program
    {
        static void Main(string[] args)
        {
            var device = new GardenerDevice("COM2");
            var service = new GardenerService(device);
        }
    }
}
