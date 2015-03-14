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
        private const bool ALLOW_REMOTE_MESSAGES = true;

        private GardenerDevice device;
        private AllJoyn.BusAttachment attachment;

        public GardenerService(GardenerDevice device)
        {
            this.device = device;

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

            attachment.BindSessionPort(SERVICE_PORT, sessionOpts, new DefaultSessionListener());

            if (attachment.AdvertiseName(SERVICE_NAME, AllJoyn.TransportMask.Any))
            {
                while (true)
                {
                    System.Threading.Thread.Sleep(1);
                }
            }


        }

        class GardenerDeviceObject : AllJoyn.BusObject
        {
            public GardenerDeviceObject(AllJoyn.BusAttachment bus, string path)
                : base(path, false)
			{
				var exampleIntf = bus.GetInterface(INTERFACE_NAME);
				var status = AddInterface(exampleIntf);
				if(!status)
				{
					Console.WriteLine("Failed to add interface {0}", status);
				}

				var catMember = exampleIntf.GetMember("cat");
				status = AddMethodHandler(catMember, this.Cat);
				if(!status)
				{
					Console.WriteLine("Failed to add method handler {0}", status);
				}
			}
        }
    }
}
