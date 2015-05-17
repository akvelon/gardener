using System;
using AllJoynUnity;

namespace Gardener
{
    class ServiceSessionPortListener: AllJoyn.SessionPortListener
    {
        private readonly ushort sessionPort;

        public ServiceSessionPortListener(ushort sessionPort)
        {
            this.sessionPort = sessionPort;
        }

        protected override bool AcceptSessionJoiner(ushort sessionPort, string joiner, AllJoyn.SessionOpts opts)
        {
            if (sessionPort != this.sessionPort)
            {
                Console.WriteLine("Rejecting join attempt on unexpected session port {0}", sessionPort);
                return false;
            }

            Console.WriteLine("Accepting join session request from {0} (opts.proximity={1}, opts.traffic={2}, opts.transports={3})",
                joiner, opts.Proximity, opts.Traffic, opts.Transports);

            return true;
        }
    }
}
