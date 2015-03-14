// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

namespace MSOpenTech.AllJoyn
{
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Runtime.InteropServices.WindowsRuntime;

    using MsgArg = AllJoynUnity.AllJoyn.MsgArg;
    using ProxyBusObject = AllJoynUnity.AllJoyn.ProxyBusObject;
    using QStatus = AllJoynUnity.AllJoyn.QStatus;

    // ReSharper disable once UnusedMember.Global
    public static partial class CordovaProxy
    {
        #region Proxy public methods
        // ReSharper disable UnusedMember.Global, InconsistentNaming

        public static void proxyBusObjectCreate(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var bus = args.GetBusAttachment();
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var service = args.GetArg(1);
            var path = args.GetArg(2);
            var sessionId = args.TryParse<UInt32>(3);
            var isSecure = args.TryParse<bool>(4);

            var result = new ProxyBusObject(bus, service, path, sessionId, isSecure);
            var resultId = Guid.NewGuid();

            Proxies.Add(resultId, result);
            successCB(resultId.ToString());
        }

        public static void proxyBusObjectIntrospectRemoteObject(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var proxy = args.GetProxyBusObject();
            if (proxy == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var result = proxy.IntrospectRemoteObject();
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(String.Empty);
        }

        public static void proxyBusObjectGetInterface(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var proxy = args.GetProxyBusObject();
            if (proxy == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var interfaceName = args.GetArg(1);
            var interfaceDesc = proxy.GetInterface(interfaceName);
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

        public static void proxyBusObjectAddInterface(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var proxy = args.GetProxyBusObject();
            if (proxy == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }
            
            var interfaceDesc = args.GetInterfaceDescription(1);
            if (interfaceDesc == null)
            {
                errorCB(QStatus.BUS_OBJECT_NO_SUCH_INTERFACE);
                return;
            }

            var result = proxy.AddInterface(interfaceDesc);
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(String.Empty);
        }

        public static void proxyBusObjectMethodCall(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var proxy = args.GetProxyBusObject();
            if (proxy == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var bus = args.GetBusAttachment(1);
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var interfaceName = args.GetArg(2);
            var methodName = args.GetArg(3);
            var obj = Utils.Deserialize(args.GetArg(4));
            var timeout = args.TryParse<uint>(5);

            object[] deserializedObj;
            try
            {
                deserializedObj = (object[])obj;
            }
            catch (InvalidCastException)
            {
                errorCB(QStatus.BAD_ARG_COUNT);
                return;
            }

            var methodArgs = new MsgArg(deserializedObj.Length);
            for (var i = 0; i < deserializedObj.Length; i++)
            {
                methodArgs[i].Set(deserializedObj[i]);
            }

            Debug.WriteLine("methodArgs created {0}: signature:{1} ", methodArgs, methodArgs.Signature);

            var reply = new AllJoynUnity.AllJoyn.Message(bus);
            var result = proxy.MethodCall(interfaceName, methodName, methodArgs, reply, timeout, 0);

            if (!result)
            {
                errorCB(result);
                return;
            }

            string json;
            try
            {
                var argObj = Utils.ParseMsgArg(reply.GetArgs());
                json = Utils.Serialize(argObj);
            }
            catch (InvalidDataException)
            {
                errorCB(QStatus.BUS_CANNOT_EXPAND_MESSAGE);
                return;
            }

            successCB(json);
        }

        public static void proxyBusObjectGetProperty(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var proxy = args.GetProxyBusObject();
            if (proxy == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var bus = args.GetBusAttachment(1);
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var interfaceName = args.GetArg(2);
            var propertyName = args.GetArg(3);
            var returnValue = new MsgArg();

            var result = proxy.GetProperty(interfaceName, propertyName, returnValue);
            if (!result)
            {
                errorCB(result);
                return;
            }

            string json;
            try
            {
                var argObj = Utils.ParseMsgArg(returnValue);
                json = Utils.Serialize(argObj);
            }
            catch (InvalidDataException)
            {
                errorCB(QStatus.BUS_CANNOT_EXPAND_MESSAGE);
                return;
            }

            successCB(json);
        }

        public static void proxyBusObjectGetAllProperties(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var proxy = args.GetProxyBusObject();
            if (proxy == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var bus = args.GetBusAttachment(1);
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var interfaceName = args.GetArg(2);
            var returnValue = new MsgArg();

            var result = proxy.GetAllProperties(interfaceName, returnValue);
            if (!result)
            {
                errorCB(result);
                return;
            }

            string json;
            try
            {
                var argObj = Utils.ParseMsgArg(returnValue);
                json = Utils.Serialize(argObj);
            }
            catch (InvalidDataException)
            {
                errorCB(QStatus.BUS_CANNOT_EXPAND_MESSAGE);
                return;
            }

            successCB(json);
        }

        public static void proxyBusObjectSetProperty(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var proxy = args.GetProxyBusObject();
            if (proxy == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var bus = args.GetBusAttachment(1);
            if (bus == null)
            {
                // TODO: refine error codes
                errorCB(QStatus.INVALID_GUID);
                return;
            }

            var interfaceName = args.GetArg(2);
            var propertyName = args.GetArg(3);

            object[] deserializedObj;
            try
            {
                deserializedObj = Utils.Deserialize<object[]>(args.GetArg(4));
            }
            catch (InvalidCastException)
            {
                errorCB(QStatus.BAD_ARG_COUNT);
                return;
            }

            var propertyValue = new MsgArg(deserializedObj.Length);
            for (var i = 0; i < deserializedObj.Length; i++)
            {
                propertyValue[i].Set(deserializedObj[i]);
            }

            Debug.WriteLine("propertyValue created {0}: signature:{1} ", propertyValue, propertyValue.Signature);

            var result = proxy.SetProperty(interfaceName, propertyName, propertyValue);
            if (!result)
            {
                errorCB(result);
                return;
            }

            successCB(string.Empty);
        }

        // ReSharper restore UnusedMember.Global, InconsistentNaming
        #endregion
    }
}
