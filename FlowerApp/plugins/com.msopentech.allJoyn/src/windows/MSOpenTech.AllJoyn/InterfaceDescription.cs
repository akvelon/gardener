// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

namespace MSOpenTech.AllJoyn
{
    using System;
    using System.Runtime.InteropServices.WindowsRuntime;
    using System.Runtime.Serialization;

    using InterfaceDescription = AllJoynUnity.AllJoyn.InterfaceDescription;
    using QStatus = AllJoynUnity.AllJoyn.QStatus;

    // ReSharper disable once UnusedMember.Global
    public static partial class CordovaProxy
    {
        [DataContract]
        private struct MethodDescriptionContract
        {
            // ReSharper disable InconsistentNaming
            #pragma warning disable 649

            [DataMember]
            public string name;

            [DataMember]
            public string inSig;

            [DataMember]
            public string outSig;

            [DataMember]
            public string argNames;

            [DataMember]
            public InterfaceDescription.AnnotationFlags annotation;

            #pragma warning restore 649
        }

        [DataContract]
        private struct PropertyDescriptionContract
        {
            #pragma warning disable 649

            [DataMember]
            public string name;

            [DataMember]
            public string sig;

            [DataMember]
            public InterfaceDescription.AccessFlags access;

            #pragma warning restore 649
            // ReSharper restore InconsistentNaming
        }

        #region Proxy public methods
        // ReSharper disable UnusedMember.Global, InconsistentNaming
        
        public static void interfaceDescriptionAddMethods(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var interfaceDesc = args.GetInterfaceDescription();
            if (interfaceDesc == null)
            {
                errorCB(QStatus.BUS_OBJECT_NO_SUCH_INTERFACE);
                return;
            }
            
            var summaryResult = QStatus.OK;
            var methodDescriptions = Utils.Deserialize<MethodDescriptionContract[]>(args.GetArg(1));

            foreach (var m in methodDescriptions)
            {
                summaryResult = interfaceDesc.AddMethod(m.name, m.inSig, m.outSig, m.argNames, m.annotation);
            }

            if (summaryResult != QStatus.OK)
            {
                errorCB(summaryResult);
                return;
            }

            successCB(String.Empty);
        }

        public static void interfaceDescriptionAddProperties(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var interfaceDesc = args.GetInterfaceDescription();
            if (interfaceDesc == null)
            {
                errorCB(QStatus.BUS_OBJECT_NO_SUCH_INTERFACE);
                return;
            }

            var summaryResult = QStatus.OK;
            var propertyDescriptions = Utils.Deserialize<PropertyDescriptionContract[]>(args.GetArg(1));

            foreach (var p in propertyDescriptions)
            {
                summaryResult = interfaceDesc.AddProperty(p.name, p.sig, p.access);
            }

            if (summaryResult != QStatus.OK)
            {
                errorCB(summaryResult);
                return;
            }

            successCB(String.Empty);
        }

        public static void interfaceDescriptionActivate(CordovaSuccessCallback successCB, CordovaErrorCallback errorCB, [ReadOnlyArray] String[] args)
        {
            var interfaceDesc = args.GetInterfaceDescription();
            if (interfaceDesc == null)
            {
                errorCB(QStatus.BUS_OBJECT_NO_SUCH_INTERFACE);
                return;
            }

            interfaceDesc.Activate();
            successCB(String.Empty);
        }

        // ReSharper restore UnusedMember.Global, InconsistentNaming
        #endregion
    }
}
