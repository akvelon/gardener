// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

namespace MSOpenTech.AllJoyn
{
    using System;
    using System.Collections.Generic;

    using BusAttachment = AllJoynUnity.AllJoyn.BusAttachment;
    using InterfaceDescription = AllJoynUnity.AllJoyn.InterfaceDescription;
    using ProxyBusObject = AllJoynUnity.AllJoyn.ProxyBusObject;

    #pragma warning disable 169
    public struct CordovaCallbackOptions
    {
        // ReSharper disable once InconsistentNaming
        public bool keepCallback;
    };

    public struct EventCallbackData
    {
        // ReSharper disable InconsistentNaming
        public string eventName;
        public string eventParams;
        // ReSharper restore InconsistentNaming
    };
    #pragma warning restore 169

    public delegate void CordovaSuccessCallback(string data);

    public delegate void CordovaEventCallback(EventCallbackData data, CordovaCallbackOptions callbackOptions);

    public delegate void CordovaErrorCallback(int code);

    public static partial class CordovaProxy
    {
        internal static readonly Dictionary<Guid, BusAttachment> Attachments = new Dictionary<Guid, BusAttachment>();
        internal static readonly Dictionary<Guid, InterfaceDescription> Interfaces = new Dictionary<Guid, InterfaceDescription>();
        internal static readonly Dictionary<Guid, ProxyBusObject> Proxies = new Dictionary<Guid, ProxyBusObject>();
    };
}
