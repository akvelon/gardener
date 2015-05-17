// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

namespace MSOpenTech.AllJoyn
{
    using System;
    using System.Collections.Generic;
    using System.Runtime.InteropServices.WindowsRuntime;
    using System.Runtime.Serialization;

    using BusAttachment = AllJoynUnity.AllJoyn.BusAttachment;
    using InterfaceDescription = AllJoynUnity.AllJoyn.InterfaceDescription;
    using QStatus = AllJoynUnity.AllJoyn.QStatus;
    using SessionOpts = AllJoynUnity.AllJoyn.SessionOpts;
    using TransportMask = AllJoynUnity.AllJoyn.TransportMask;

    // ReSharper disable once UnusedMember.Global
    public static partial class CordovaProxy
    {
        [DataContract]
        private struct SessionOptsContract
        {
            // ReSharper disable InconsistentNaming
            #pragma warning disable 649

            [DataMember]
            public SessionOpts.TrafficType traffic;

            [DataMember]
            public bool isMultipoint;

            [DataMember]
            public SessionOpts.ProximityType proximity;

            [DataMember]
            public TransportMask transports;

            #pragma warning restore 649
            // ReSharper restore InconsistentNaming
        }

        #region Proxy public methods
        // ReSharper disable UnusedMember.Global, InconsistentNaming

        public static void busAttachmentCreate(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            // No need to check for null here since this already done by JS side
            var busName = args.GetArg(0);

            var result = new BusAttachment(busName, true);
            result.EnableConcurrentCallbacks();

            var resultId = Guid.NewGuid();
            Attachments.Add(resultId, result);

            successCB(resultId.ToString());
        }

        public static void busAttachmentStart(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var result = bus.Start();
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(String.Empty);
        }

        public static void busAttachmentStop(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var result = bus.Stop();
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(String.Empty);
        }

        public static void busAttachmentConnect(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var connectSpec = args.GetArg(1);
            var result = string.IsNullOrEmpty(connectSpec) ? bus.Connect() : bus.Connect(connectSpec);
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(bus.UniqueName);
        }

        public static void busAttachmentDisconnect(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var connectSpec = args.GetArg(1);
            var result = string.IsNullOrEmpty(connectSpec) ? bus.Disconnect() : bus.Disconnect(connectSpec);
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(String.Empty);
        }

        public static void busAttachmentRegisterBusListener(CordovaEventCallback listenerCallback, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var busId = args.GetGuid();
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            bus.RegisterBusListener(new BusEventDispatcher(busId, listenerCallback));
        }

        public static void busAttachmentRegisterSessionListener(CordovaEventCallback listenerCallback, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var busId = args.GetGuid();
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var sessionId = uint.Parse(args.GetArg(1));
            bus.SetSessionListener(new SessionEventDispatcher(busId, listenerCallback), sessionId);
        }

        public static void busAttachmentFindAdvertisedName(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var namePrefix = args.GetArg(1);
            var transports = args.GetArg(2);

            var result = transports == null
                ? bus.FindAdvertisedName(namePrefix)
                : bus.FindAdvertisedNameByTransport(namePrefix, (TransportMask)int.Parse(transports));

            if (!result)
            {
                errorCB(result);
                return;
            }
            successCB(String.Empty);
        }

        public static void busAttachmentCancelFindAdvertisedName(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var namePrefix = args.GetArg(1);
            var transports = args.GetArg(2);

            var result = transports == null
                ? bus.CancelFindAdvertisedName(namePrefix)
                : bus.CancelFindAdvertisedNameByTransport(namePrefix, (TransportMask)int.Parse(transports));

            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(String.Empty);
        }

        public static void busAttachmentAdvertiseName(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var namePrefix = args.GetArg(1);
            var transports = args.GetArg(2);

            var result = bus.RequestName(namePrefix, AllJoynUnity.AllJoyn.DBus.NameFlags.AllowReplacement);
            if (!result)
            {
                errorCB(result);
                return;
            }

            result = transports == null
                ? bus.AdvertiseName(namePrefix, TransportMask.Any)
                : bus.AdvertiseName(namePrefix, (TransportMask)int.Parse(transports));

            if (!result)
            {
                errorCB(result);
                return;
            }
            successCB(String.Empty);
        }

        public static void busAttachmentCancelAdvertiseName(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var namePrefix = args.GetArg(1);
            var transports = args.GetArg(2);

            var result = transports == null
                ? bus.CancelAdvertisedName(namePrefix, TransportMask.Any)
                : bus.CancelAdvertisedName(namePrefix, (TransportMask)int.Parse(transports));

            if (!result)
            {
                errorCB(result);
                return;
            }

            result = bus.ReleaseName(namePrefix);
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(String.Empty);
        }

        private class TempSessionListener: AllJoynUnity.AllJoyn.SessionListener 
        {
            
            protected virtual void SessionLost(uint sessionId) {
            }
            protected virtual void SessionLost(uint sessionId, AllJoynUnity.AllJoyn.SessionListener.SessionLostReason reason) {
            }
            protected virtual void SessionMemberAdded(uint sessionId, string uniqueName) {
            }
            protected virtual void SessionMemberRemoved(uint sessionId, string uniqueName) {
            }
        }

        public static void busAttachmentJoinSession(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            bus.SetDaemonDebug("ALL", 7);

            var host = args.GetArg(1);
            var port = ushort.Parse(args.GetArg(2));
            var optsObj = args.GetArg(3);

            uint sessionId;
            var optsData = Utils.Deserialize<SessionOptsContract>(optsObj);

            bus.EnableConcurrentCallbacks();

			//optsData.isMultipoint = true;

			//var opts = new SessionOpts(optsData.traffic, optsData.isMultipoint, optsData.proximity, optsData.transports);

            var opts = new SessionOpts(SessionOpts.TrafficType.Messages, false, SessionOpts.ProximityType.Any, TransportMask.Any);

            //SessionOpts opts(SessionOpts::TRAFFIC_MESSAGES, false, SessionOpts::PROXIMITY_ANY, TRANSPORT_ANY);

            var result = bus.JoinSession(host, port, new TempSessionListener(), out sessionId, opts);

            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(sessionId.ToString());
        }

        public static void busAttachmentLeaveSession(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var sessionId = uint.Parse(args.GetArg(1));
            var result = bus.LeaveSession(sessionId);
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(string.Empty);
        }

        public static void busAttachmentCreateInterface(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var interfaceName = args.GetArg(1);
            var isSecure = bool.Parse(args.GetArg(2));
            var policy = isSecure
                ? InterfaceDescription.SecurityPolicy.Required
                : InterfaceDescription.SecurityPolicy.Off;

            InterfaceDescription interfaceDesc;
            var result = bus.CreateInterface(interfaceName, policy, out interfaceDesc);
            if (!result)
            {
                errorCB(result);
                return;
            }

            var interfaceId = Guid.NewGuid();
            Interfaces.Add(interfaceId, interfaceDesc);

            successCB(interfaceId.ToString());
        }

        public static void busAttachmentGetInterface(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var interfaceName = args.GetArg(1);
            var interfaceDesc = bus.GetInterface(interfaceName);
            if (interfaceDesc == null)
            {
                errorCB(QStatus.BUS_INTERFACE_MISSING);
                return;
            }

            var interfaceId = Interfaces.GetIdForInterfaceDescription(interfaceDesc);
            if (interfaceId == Guid.Empty)
            {
                interfaceId = Guid.NewGuid();
                Interfaces.Add(interfaceId, interfaceDesc);
            }

            successCB(interfaceId.ToString());
        }

        public static void busAttachmentGetInterfaces(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var interfaceDescs = bus.GetInterfaces();
            if (interfaceDescs == null || interfaceDescs.Length == 0)
            {
                errorCB(QStatus.BUS_INTERFACE_MISSING);
                return;
            }

            var interfacesIds = new Dictionary<string, string>();
            foreach (var interfaceDesc in interfaceDescs)
            {
                var interfaceId = Interfaces.GetIdForInterfaceDescription(interfaceDesc);
                if (interfaceId == Guid.Empty)
                {
                    interfaceId = Guid.NewGuid();
                    Interfaces.Add(interfaceId, interfaceDesc);
                }

                interfacesIds.Add(interfaceId.ToString(), interfaceDesc.Name);
            }

            successCB(Utils.Serialize(interfacesIds));
        }

        // ReSharper restore UnusedMember.Global, InconsistentNaming
        #endregion
    }
}
