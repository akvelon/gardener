using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AllJoynUnity;

namespace Gardener
{
    public class GardenerService
    {
        private const string SERVICE_NAME = "GardenerService";
        private const string INTERFACE_NAME = "com.akvelon.gardener";
        private const bool ALLOW_REMOTE_MESSAGES = true;
        private static ushort SERVICE_PORT = 1001;

        private static GardenerDevice activeDevice;

        private AllJoyn.BusAttachment attachment;

        public GardenerService(GardenerDevice device)
        {
            activeDevice = device;

            attachment = new AllJoyn.BusAttachment("Gardener", ALLOW_REMOTE_MESSAGES);
            
            AllJoyn.InterfaceDescription iface;
            attachment.CreateInterface("FlowerPot", AllJoyn.InterfaceDescription.SecurityPolicy.Off, out iface);

            iface.AddProperty("humidity", "d", AllJoyn.InterfaceDescription.AccessFlags.Read);
            iface.AddProperty("solarFlow", "i", AllJoyn.InterfaceDescription.AccessFlags.Read);

            iface.AddMethod("waterPumpOn", "i", "b", "interval,hasActivator");
            iface.AddMethod("waterPumpOf", "i", "b", "interval,hasActivator");

            iface.Activate();

            var busObject = new GardenerDeviceObject(attachment, SERVICE_NAME);

            attachment.Start();
            attachment.RegisterBusObject(busObject);
            attachment.Connect();
            attachment.RequestName(SERVICE_NAME, AllJoyn.DBus.NameFlags.ReplaceExisting | AllJoyn.DBus.NameFlags.DoNotQueue);

            var sessionOpts = new AllJoyn.SessionOpts(AllJoyn.SessionOpts.TrafficType.Messages, true,
                AllJoyn.SessionOpts.ProximityType.Any, AllJoyn.TransportMask.Any);

            attachment.BindSessionPort(ref SERVICE_PORT, sessionOpts, new DefaultSessionPortListener());

            if (attachment.AdvertiseName(SERVICE_NAME, AllJoyn.TransportMask.Any))
            {
                while (true)
                {
                    System.Threading.Thread.Sleep(1);
                }
            }
        }

        private class DefaultSessionPortListener : AllJoyn.SessionPortListener
        {
            protected override bool AcceptSessionJoiner(ushort sessionPort, string joiner, AllJoyn.SessionOpts opts)
            {
                if (sessionPort != SERVICE_PORT)
                {
                    Console.WriteLine("Rejecting join attempt on unexpected session port {0}", sessionPort);
                    return false;
                }
                Console.WriteLine("Accepting join session request from {0} (opts.proximity={1}, opts.traffic={2}, opts.transports={3})",
                    joiner, opts.Proximity, opts.Traffic, opts.Transports);
                return true;
            }
        }

        private class GardenerDeviceObject : AllJoyn.BusObject
        {

            private readonly AllJoyn.InterfaceDescription iface;

            public GardenerDeviceObject(AllJoyn.BusAttachment bus, string path)
                : base(path, false)
			{
				iface = bus.GetInterface(INTERFACE_NAME);
                var status = AddInterface(iface);
				if(!status)
				{
					Console.WriteLine("Failed to add interface {0}", status);
				}

                AddMethodHandler(iface.GetMember("waterPumpOff"),
                    (member, message) => activeDevice.DisableServo("waterPump", message.GetArg(0)));

                AddMethodHandler(iface.GetMember("waterPumpOn"),
                    (member, message) => activeDevice.EnableServo("waterPump", message.GetArg(0)));
			}

            protected override void OnPropertyGet(string ifcName, string propName, AllJoyn.MsgArg val)
            {
                base.OnPropertyGet(ifcName, propName, val);

                if (ifcName != iface.Name) return;

                var value = activeDevice.GetSensorValue(propName);
                var prop = iface.GetProperty(propName);
                if (prop != null)
                {
                    val.Set(prop.Signature, value);
                }
            }
        }
    }

}
