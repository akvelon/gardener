using System;
using AllJoynUnity;

namespace Gardener
{
    class DeviceObject: AllJoyn.BusObject
    {
        private readonly AllJoyn.InterfaceDescription iface;
        private readonly IGardenerDevice device;

        public DeviceObject(AllJoyn.BusAttachment bus, IGardenerDevice device, string path, string interfaceName)
            : base(path, false)
        {
            this.device = device;
            iface = bus.GetInterface(interfaceName);

            var status = AddInterface(iface);
            if (!status)
            {
                Console.WriteLine("Failed to add interface {0}", status);
            }

            var members = iface.GetMembers();
            foreach (var member in members)
            {
                if (member.Name == "waterPumpOff")
                {
                    AddMethodHandler(member, (method, message) => device.DisableServo("water_pump", message.GetArg(0)));
                }

                if (member.Name == "waterPumpOn")
                {
                    AddMethodHandler(member, (method, message) => device.DisableServo("water_pump", message.GetArg(0)));
                }
            }
        }

        protected override void OnPropertyGet(string ifcName, string propName, AllJoyn.MsgArg val)
        {
            base.OnPropertyGet(ifcName, propName, val);

            if (ifcName != iface.Name) return;

            var value = device.GetSensorValue(propName);
            var prop = iface.GetProperty(propName);
            if (prop != null)
            {
                val.Set(prop.Signature, value);
            }
        }
    }
}
