using System;
using AllJoynUnity;

namespace Gardener
{
    public class GardenerService :IDisposable
    {
        private const string SERVICE_NAME = "com.akvelon.gardener";
        private const string INTERFACE_NAME = "com.akvelon.gardener";
        private const string SERVICE_PATH = "/flowerpot";
        
        private const bool ALLOW_REMOTE_MESSAGES = true;
        private const AllJoyn.InterfaceDescription.SecurityPolicy DISABLE_SECURITY =
            AllJoyn.InterfaceDescription.SecurityPolicy.Off;

        private readonly ushort SERVICE_PORT = 1001;

        private readonly AllJoyn.BusAttachment ajAttachment;

        public GardenerService(IGardenerDevice device)
        {
            ajAttachment = new AllJoyn.BusAttachment("Gardener", ALLOW_REMOTE_MESSAGES);
            AllJoyn.InterfaceDescription iface;

            ajAttachment.CreateInterface(INTERFACE_NAME, DISABLE_SECURITY, out iface);

            //iface.AddProperty("humidity", "i", AllJoyn.InterfaceDescription.AccessFlags.Read);
            //iface.AddProperty("solarFlow", "i", AllJoyn.InterfaceDescription.AccessFlags.Read);


            iface.AddMethod("waterPumpOn", "i", "b", "interval,hasActivator");
            iface.AddMethod("waterPumpOff", "i", "b", "interval,hasActivator");

            iface.AddMethod("humidity", "", "d", "interval,hasActivator");
            iface.AddMethod("solarFlow", "", "d", "interval,hasActivator");


            iface.Activate();

            var busObject = new DeviceObject(ajAttachment, device, SERVICE_PATH, INTERFACE_NAME);

            ajAttachment.Start();
            ajAttachment.RegisterBusObject(busObject);
            var status = ajAttachment.Connect();

            Console.WriteLine("AllJOyn service Connect status: {0}", status);

            ajAttachment.RequestName(SERVICE_NAME,
                AllJoyn.DBus.NameFlags.ReplaceExisting | AllJoyn.DBus.NameFlags.DoNotQueue);

            var joinSessionListener = new ServiceSessionPortListener(SERVICE_PORT);
            var sessionOpts = new AllJoyn.SessionOpts(AllJoyn.SessionOpts.TrafficType.Messages, true,
                AllJoyn.SessionOpts.ProximityType.Any, AllJoyn.TransportMask.Any);

            ajAttachment.BindSessionPort(ref SERVICE_PORT, sessionOpts, joinSessionListener);
            
             status = ajAttachment.AdvertiseName(SERVICE_NAME, AllJoyn.TransportMask.Any);

            Console.WriteLine("AllJOyn service AdvertiseName status: {0}", status);
        }

        public void Dispose()
        {
            ajAttachment.Dispose();
        }
    }

}
