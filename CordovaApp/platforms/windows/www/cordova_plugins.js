cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.msopentech.allJoyn/www/BusAttachment.js",
        "id": "com.msopentech.allJoyn.BusAttachment"
    },
    {
        "file": "plugins/com.msopentech.allJoyn/www/ProxyBusObject.js",
        "id": "com.msopentech.allJoyn.ProxyBusObject"
    },
    {
        "file": "plugins/com.msopentech.allJoyn/www/InterfaceDescription.js",
        "id": "com.msopentech.allJoyn.InterfaceDescription"
    },
    {
        "file": "plugins/com.msopentech.allJoyn/www/SessionOpts.js",
        "id": "com.msopentech.allJoyn.SessionOpts"
    },
    {
        "file": "plugins/com.msopentech.allJoyn/www/TransportMask.js",
        "id": "com.msopentech.allJoyn.TransportMask"
    },
    {
        "file": "plugins/com.msopentech.allJoyn/www/Status.js",
        "id": "com.msopentech.allJoyn.Status"
    },
    {
        "file": "plugins/com.msopentech.allJoyn/www/AllJoyn.js",
        "id": "com.msopentech.allJoyn.AllJoyn",
        "clobbers": [
            "msopentech.alljoyn"
        ]
    },
    {
        "file": "plugins/com.msopentech.allJoyn/src/windows/AllJoynProxy.js",
        "id": "com.msopentech.allJoyn.AllJoynProxy",
        "runs": true
    },
    {
        "file": "plugins/org.apache.cordova.dialogs/www/notification.js",
        "id": "org.apache.cordova.dialogs.notification",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.dialogs/src/windows/NotificationProxy.js",
        "id": "org.apache.cordova.dialogs.NotificationProxy",
        "merges": [
            ""
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.msopentech.allJoyn": "0.0.1",
    "org.apache.cordova.dialogs": "0.3.1-dev"
}
// BOTTOM OF METADATA
});