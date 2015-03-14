// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

namespace MSOpenTech.AllJoyn
{
    using System;
    using System.Collections.Generic;

    using BusAttachment = AllJoynUnity.AllJoyn.BusAttachment;
    using InterfaceDescription = AllJoynUnity.AllJoyn.InterfaceDescription;
    using ProxyBusObject = AllJoynUnity.AllJoyn.ProxyBusObject;

    // ReSharper disable NotAccessedField.Global, InconsistentNaming
    public struct CordovaCallbackOptions
    {
        public Boolean keepCallback;
    };

    public struct EventCallbackData
    {
        public String eventName;
        public String eventParams;
    };
    // ReSharper restore InconsistentNaming, NotAccessedField.Global

    public delegate void CordovaSuccessCallback(string data);

    public delegate void CordovaEventCallback(EventCallbackData data, CordovaCallbackOptions callbackOptions);

    public delegate void CordovaErrorCallback(int code);

    public static partial class WindowsRuntimeProxy
    {
        internal static Dictionary<Guid, BusAttachment> attachments = new Dictionary<Guid, BusAttachment>();
        internal static Dictionary<Guid, InterfaceDescription> interfaces = new Dictionary<Guid, InterfaceDescription>();
        internal static Dictionary<Guid, ProxyBusObject> proxies = new Dictionary<Guid, ProxyBusObject>();
    };
}
