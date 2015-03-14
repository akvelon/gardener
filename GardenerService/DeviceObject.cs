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
                if (member.Name == "waterPumpOff" || member.Name == " waterPumpOn")
                {
                    AddMethodHandler(member, (method, message) => {


                        bool res = device.DisableServo("water_pump", -1);
                        AllJoyn.MsgArg outArgs = new AllJoyn.MsgArg();
                        outArgs = res;

                        status = MethodReply(message, outArgs);
                    });
                }

                if (member.Name == "humidity" || member.Name == "solarFlow")
                {
                    AddMethodHandler(member, (method, message) =>
                    {
                        var value = device.GetSensorValue(member.Name);
                        var valAsString = Convert.ToDouble(value);
                        AllJoyn.MsgArg outArgs = new AllJoyn.MsgArg();
                        outArgs = valAsString;
                        //outArgs.Set("s", valAsString);
                        
                        status = MethodReply(message, outArgs);
                    });
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
