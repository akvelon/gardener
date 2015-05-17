namespace MSOpenTech.AllJoyn
{
    using System;
    using System.Diagnostics;
    using Windows.ApplicationModel.Core;
    using Windows.UI.Core;

    // ReSharper disable once UnusedMember.Global
    public static partial class CordovaProxy
    {
        private class BusEventDispatcher : AllJoynUnity.AllJoyn.BusListener
        {
            private Guid busId;
            private readonly CordovaEventCallback callback;

            internal BusEventDispatcher(Guid busId, CordovaEventCallback callback)
            {
                this.busId = busId;
                this.callback = callback;
            }

            private async void DispatchEvent(string eventName, string[] eventParams)
            {
                var window = CoreApplication.MainView.CoreWindow;
                var dispatcher = window.Dispatcher;

                await dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
                {
                    try
                    {
                        callback(new EventCallbackData { eventName = eventName, eventParams = Utils.Serialize(eventParams) },
                            new CordovaCallbackOptions { keepCallback = true });
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine("Exception occured: " + ex.Message);
                    }
                });

            }

            protected override void ListenerRegistered(AllJoynUnity.AllJoyn.BusAttachment busAttachment)
            {
                Debug.WriteLine("ListenerRegistered {0}:", busId);

                DispatchEvent("listenerRegistered", new[] { busId.ToString() });
            }

            protected override void ListenerUnregistered()
            {
                Debug.WriteLine("ListenerRegistered {0}:", busId);
                DispatchEvent("listenerUnregistered", new[] { busId.ToString() });
            }

            protected override void FoundAdvertisedName(string name, AllJoynUnity.AllJoyn.TransportMask transport, string namePrefix)
            {
                Debug.WriteLine("FoundAdvertisedName {0}: name:{1} transport:{2} namePrefix:{3}", busId, name,
                    transport.ToString(), namePrefix);

                DispatchEvent("foundAdvertisedName", new[] { name, transport.ToString(), namePrefix });
            }

            protected override void LostAdvertisedName(string name, AllJoynUnity.AllJoyn.TransportMask transport, string namePrefix)
            {
                DispatchEvent("lostAdvertisedName", new[] { name, transport.ToString(), namePrefix });
            }

            protected override void NameOwnerChanged(string busName, string previousOwner, string newOwner)
            {
                Debug.WriteLine("NameOwnerChanged {0}: previousOwner:{1} newOwner:{2}", busId, previousOwner, newOwner);

                DispatchEvent("nameOwnerChanged", new[] { busName, previousOwner, newOwner });

            }

            protected override void BusStopping()
            {
                Debug.WriteLine("BusStopping {0}:", busId);

                DispatchEvent("busStopping", new string[] { });
            }

            protected override void BusDisconnected()
            {
                Debug.WriteLine("BusDisconnected {0}:", busId);

                DispatchEvent("busDisconnected", new string[] { });
            }
        }

        private class SessionEventDispatcher : AllJoynUnity.AllJoyn.SessionListener
    {
        private readonly Guid busId;
        private readonly CordovaEventCallback callback;

        public SessionEventDispatcher(Guid busId, CordovaEventCallback listenerCallback)
        {
            this.busId = busId;
            callback = listenerCallback;
        }

        private async void DispatchEvent(string eventName, string[] eventParams)
        {
            var window = CoreApplication.MainView.CoreWindow;
            var dispatcher = window.Dispatcher;

            await dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                try
                {
                    callback(new EventCallbackData { eventName = eventName, eventParams = Utils.Serialize(eventParams) },
                        new CordovaCallbackOptions { keepCallback = true });
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Exception occured: " + ex.Message);
                }
            });

        }

        protected override void SessionLost(uint sessionId, SessionLostReason reason)
        {
            Debug.WriteLine("SessionLost {0}:", busId);

            DispatchEvent("sessionLost", new[] { sessionId.ToString(), ((int)reason).ToString() });
        }

        protected override void SessionMemberAdded(uint sessionId, string uniqueName)
        {
            Debug.WriteLine("SessionMemberAdded {0}:", busId);

            DispatchEvent("sessionMemberAdded", new[] { sessionId.ToString(), uniqueName });
        }

        protected override void SessionMemberRemoved(uint sessionId, string uniqueName)
        {
            Debug.WriteLine("SessionMemberRemoved {0}:", busId);

            DispatchEvent("sessionMemberRemoved", new[] { sessionId.ToString(), uniqueName });
        }
    }
    }


}
