cordova.define("com.msopentech.allJoyn.BusAttachment", function(require, exports, module) { 
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

/*global module, require*/

var exec = require('cordova/exec');
var checkArgs = require('cordova/argscheck').checkArgs;

var SessionOpts = require('./SessionOpts');
var InterfaceDescription = require('./InterfaceDescription');

var ALLJOYN_PROXY = 'AllJoyn';

var BUS_LISTENER_EVENTS = [
    "listenerRegistered",
    "listenerUnregistered",
    "foundAdvertisedName",
    "lostAdvertisedName",
    "nameOwnerChanged",
    "busStopping",
    "busDisconnected"
];

var SESSION_LISTENER_EVENTS = [
    "sessionLost",
    "sessionMemberAdded",
    "sessionMemberRemoved"
];

/**
 * Checks if event name provided is an SessionListener event name
 * @param  {String}  event Event name to check
 * @return {Boolean}       True if event name provided is an SessionListener event name
 */
var isSessionEvent = function(event) {
    return SESSION_LISTENER_EVENTS.indexOf(event) >= 0;
};

/**
 * Checks if event name provided is a BusListener event name
 * @param  {String}  event Event name to check
 * @return {Boolean}       True if event name provided is a BusListener event name
 */
var isBusEvent = function (event) {
    return BUS_LISTENER_EVENTS.indexOf(event) >= 0;
};

/**
 * BusAttachment constructor. Only for internal use. For creating
 * new BusAttachment object use BusAttachment.create() method
 * @param {String} name Name of busAttachment to create
 */
var BusAttachment = function (name) {
    this.uniqueName = name;
    this._id = null;
    this.isConnected = false;
    this.isStarted = false;
    this.uniqueName = "";
};

/**
 * Start the process of spinning up the independent threads used in the bus attachment, preparing it for action.
 * This method only begins the process of starting the bus. Sending and receiving messages cannot begin until the bus is Connected.
 *
 * @param  {Function} successCallback Success callback that accepts new BusAttachment object
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_BUS_ALREADY_STARTED if already started
 *                                        * Other error status codes indicating a failure
 */
BusAttachment.prototype.start = function (successCallback, errorCallback) {
    checkArgs('FF', 'BusAttachment.start', arguments);

    var that = this;
    var success = function() {
        that.isStarted = true;
        successCallback();
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'busAttachmentStart', [this._id]);
};

/**
 * Ask the threading subsystem in the bus attachment to begin the process of ending the execution of its threads.
 * It asks the BusAttachment to begin shutting down its various threads of execution, but does not wait for any threads to exit.
 * @param  {Function} successCallback Success callback
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 */
BusAttachment.prototype.stop = function (successCallback, errorCallback) {
    checkArgs('FF', 'BusAttachment.stop', arguments);

    var that = this;
    var success = function () {
        that.isStarted = false;
        successCallback();
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'busAttachmentStop', [this._id]);
};

/**
 * Connect to an AllJoyn router at a specific connectSpec destination.
 * If there is no router present at the given connectSpec or if the router at the connectSpec has an incompatible AllJoyn version,
 * or if connectSpec is not specified this method will attempt to use a bundled router if one exists.
 *
 * @param  {Function} successCallback Success callback that accepts an unique name for connected BusAttachment
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 * @param  {String}   connectSpec     A transport connection spec string of the form: "<transport>:<param1>=<value1>,<param2>=<value2>...[;]".
 *                                    If not specified this method will attempt to use a bundled router if one exists.
 */
BusAttachment.prototype.connect = function (successCallback, errorCallback, connectSpec) {
    checkArgs('FFS', 'BusAttachment.connect', arguments);

    var that = this;
    var success = function (uniqueName) {
        that.isConnected = true;
        this.uniqueName = uniqueName;
        successCallback();
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'busAttachmentConnect', [this._id, connectSpec || ""]);
};

/**
 * Disconnect a remote bus address connection.
 *
 * @param  {Function} successCallback Success callback that accepts an unique name for connected BusAttachment
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation.
 *                                        * ER_BUS_BUS_NOT_STARTED if the bus is not started
 *                                        * ER_BUS_NOT_CONNECTED if the BusAttachment is not connected to the bus
 *                                        * Other error status codes indicating a failure
 *
 * @param  {String}   connectSpec     The transport connection spec used to connect.
 */
BusAttachment.prototype.disconnect = function (successCallback, errorCallback, connectSpec) {
    checkArgs('FFS', 'BusAttachment.disconnect', arguments);

    var that = this;
    var success = function () {
        that.isConnected = false;
        this.uniqueName = "";
        successCallback();
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'busAttachmentDisconnect', [this._id, connectSpec]);
};

/**
 * Binds listeners to various Bus events
 *
 * @param {String}   event     Event name to bind listener to. Valid event names are:
 *                                 * From BusListener: listenerRegistered, listenerUnregistered, foundAdvertisedName,
 *                                                lostAdvertisedName, nameOwnerChanged, busStopping, busDisconnected
 *                                 * From SessionListener: sessionLost, sessionMemberAdded, sessionMemberRemoved
 *
 * @param {Function} listener  Listener function that accepts various params for specific event. Param set is depends on event.
 *                             For listener params see:
 *                                 * BusListener (https://allseenalliance.org/docs/api/cpp/classajn_1_1_bus_listener.html) documentation
 *                                 * SessionListener (https://allseenalliance.org/docs/api/cpp/classajn_1_1_session_listener.html) documentation
 *
 * @param {Number}   sessionId Optional parameter. Should be passes for SessionListener events.
 */
BusAttachment.prototype.addEventListener = function (event, listener, sessionId) {
    checkArgs('sfN', 'BusAttachment.addEventListener', arguments);

    this.listenerObj = this.listenerObj || {};

    var eventName = event;
    // If event specified is session event, construct eventName from event and sessionId parameters
    if (isSessionEvent(event)) {
        eventName = event + '_' + sessionId;
    }

    if (!(this.listenerObj[eventName] instanceof Array)) {
        this.listenerObj[eventName] = [listener];
    } else {
        if (this.listenerObj[eventName].indexOf(listener) >= 0) {
            // if specified listener is already bound to current event
            // then no action required
            return;
        }

        this.listenerObj[eventName].push(listener);
    }

    if (isBusEvent(event)) {
        if (!this.isBusListenerAttached) {
            this.isBusListenerAttached = true;
            exec(this.listenerProxy.bind(this), null, ALLJOYN_PROXY, 'busAttachmentRegisterBusListener', [this._id]);
        }

    } else if (isSessionEvent(event)) {
        if (!this.isSessionListenerAttached) {
            this.isSessionListenerAttached = true;
            exec(this.listenerProxy.bind(this), null, ALLJOYN_PROXY, 'busAttachmentRegisterSessionListener', [this._id, sessionId]);
        }
    }
};

/**
 * Removes already bound listeners
 * @param  {String}   event    Event name to unbind listener from. For list of events see addEventListener documentation
 * @param  {Function} listener Listener to unbind
 */
BusAttachment.prototype.removeEventListener = function (event, listener) {
    checkArgs('sf', 'BusAttachment.addEventListener', arguments);

    if (!this.listenerObj || !this.listenerObj[event] || !(this.listenerObj[event] instanceof Array)) {
        return;
    }

    var listenerIndex = this.listenerObj[event].indexOf(listener);
    if (listenerIndex > -1) {
        this.listenerObj[event].splice(listenerIndex, 1);
    }
};

/**
 * Method used internally to dispatch events from Proxy to existing listeners. Should not be used explicitly.
 * @param  {Object} evt Event to dispatch
 */
BusAttachment.prototype.listenerProxy = function (evt) {

    var eventName = evt.eventName;
    var eventParams = JSON.parse(evt.eventParams);

    if (isSessionEvent(evt.eventName)) {
        eventName = eventName + '_' + eventParams[0];
    }

    if (this.listenerObj.hasOwnProperty(eventName) && this.listenerObj[eventName] instanceof Array) {
        var that = this;
        this.listenerObj[eventName].forEach(function(listener) {
            listener.apply(that, eventParams);
        });
    }
};

/**
 * Register interest in a well-known name prefix for the purpose of discovery over specified transports.
 * @param  {Function} successCallback Success callback
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_NOT_CONNECTED if a connection has not been made with a local bus.
 *                                        * Other error status codes indicating a failure.
 *
 * @param  {String}   serviceName     Well-known name that application is interested in receiving notifications about.
 * @param  {Number}   transport       Transports over which to do well-known name discovery. One of allJoyn.TransportMask members.
 *                                    If not specified, TRANSPORTS_ANY will be used.
 */
BusAttachment.prototype.findAdvertisedName = function (successCallback, errorCallback, serviceName, transport) {
    checkArgs('FFsN', 'BusAttachment.findAdvertisedName', arguments);

    var nativeArgs = [this._id, serviceName];
    if (!!transport) {
        nativeArgs.push(transport.toString());
    }

    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'busAttachmentFindAdvertisedName', nativeArgs);
};

/**
 * Cancel interest in a well-known name prefix that was previously registered with FindAdvertisedName.
 * @param  {Function} successCallback Success callback
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_NOT_CONNECTED if a connection has not been made with a local bus.
 *                                        * Other error status codes indicating a failure.
 *
 * @param  {String}   serviceName     Well-known name that application is no longer interested in receiving notifications about.
 * @param  {Number}   transport       Transports over which to cancel well-known name discovery. One of allJoyn.TransportMask members.
 *                                    If not specified, TRANSPORTS_ANY will be used.
 */
BusAttachment.prototype.cancelFindAdvertisedName = function (successCallback, errorCallback, serviceName, transport) {
    checkArgs('FFsN', 'BusAttachment.cancelFindAdvertisedName', arguments);

    var nativeArgs = [this._id, serviceName];
    if (!!transport) {
        nativeArgs.push(transport.toString());
    }

    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'busAttachmentCancelFindAdvertisedName', nativeArgs);
};


/**
 * Advertise the existence of a well-known name to other (possibly disconnected) AllJoyn routers.
 * It will request a well-known name as well.
 *
 * @param  {Function} successCallback Success callback
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_NOT_CONNECTED if a connection has not been made with a local bus.
 *                                        * Other error status codes indicating a failure.
 *
 * @param  {String}   serviceName     the well-known name to advertise. (Must be owned by the caller via RequestName).
 * @param  {Number}   transport       Set of transports to use for sending advertisement.
 */
BusAttachment.prototype.advertiseName = function (successCallback, errorCallback, serviceName, transport) {
    checkArgs('FFsN', 'BusAttachment.advertiseName', arguments);

    var nativeArgs = [this._id, serviceName];
    if (!!transport) {
        nativeArgs.push(transport.toString());
    }

    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'busAttachmentAdvertiseName', nativeArgs);
};

/**
 * Stop advertising the existence of a well-known name to other AllJoyn routers.
 * It will release a previously requested well-known name as well.
 *
 * @param  {Function} successCallback Success callback
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_NOT_CONNECTED if a connection has not been made with a local bus.
 *                                        * Other error status codes indicating a failure.
 *
 * @param  {String}   serviceName     A well-known name that was previously advertised via AdvertiseName.
 * @param  {Number}   transport       Set of transports whose name advertisement will be canceled.
 */

BusAttachment.prototype.cancelAdvertiseName = function (successCallback, errorCallback, serviceName, transport) {
    checkArgs('FFsN', 'BusAttachment.cancelAdvertiseName', arguments);

    var nativeArgs = [this._id, serviceName];
    if (!!transport) {
        nativeArgs.push(transport.toString());
    }

    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'busAttachmentCancelAdvertiseName', nativeArgs);
};

/**
 * Join a session.
 * @param  {Function} successCallback Success callback that accepts joined session Id
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_NOT_CONNECTED if a connection has not been made with a local bus.
 *                                        * Other error status codes indicating a failure.
 *
 * @param  {Number}   host            Bus name of attachment that is hosting the session to be joined.
 * @param  {Number}   port            SessionPort of sessionHost to be joined.
 * @param  {Object}   options         Session options. Should be a SessionOpts object or compatible
 */
BusAttachment.prototype.joinSession = function (successCallback, errorCallback, host, port, options) {
    checkArgs('fFsnO', 'BusAttachment.joinSession', arguments);
    var opts = SessionOpts.create(options);
    exec(function() { successCallback(parseInt(arguments[0])); }, errorCallback, ALLJOYN_PROXY, 'busAttachmentJoinSession', [this._id, host.toString(), port.toString(), JSON.stringify(opts)]);
};

/**
 * Leave an existing session.
 * @param  {Function} successCallback Success callback
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_NOT_CONNECTED if a connection has not been made with a local bus.
 *                                        * ER_BUS_NO_SESSION if session did not exist.
 *                                        * Other error status codes indicating a failure.
 *
 * @param  {Number}   sessionId       Session Id to leave
 */
BusAttachment.prototype.leaveSession = function (successCallback, errorCallback, sessionId) {
    checkArgs('fFn', 'BusAttachment.leaveSession', arguments);
    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'busAttachmentLeaveSession', [this._id, sessionId.toString()]);
};

/**
 * Create an interface description with a given name.
 * Typically, interfaces that are implemented by BusObjects are created here. Interfaces that are implemented by remote objects
 * are added automatically by the bus if they are not already present via ProxyBusObject::IntrospectRemoteObject().
 * Because interfaces are added both explicitly (via this method) and implicitly (via ProxyBusObject::IntrospectRemoteObject),
 * there is the possibility that creating an interface here will fail because the interface already exists.
 * If this happens, the ER_BUS_IFACE_ALREADY_EXISTS will be returned and NULL will be returned in the iface [OUT] parameter.
 * Interfaces created with this method need to be activated using InterfaceDescription::Activate() once all of the methods,
 * signals, etc have been added to the interface. The interface will be unaccessible (via BusAttachment::GetInterfaces() or
 * BusAttachment::GetInterface()) until it is activated.
 *
 * @param  {Function} successCallback Success callback that accepts created InterfaceDescription object
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_IFACE_ALREADY_EXISTS if requested interface already exists
 *
 * @param  {String}  interfaceName   The requested interface name.
 * @param  {Boolean} isSecure        If true the interface is secure and method calls and signals will be encrypted.
 */
BusAttachment.prototype.createInterface = function (successCallback, errorCallback, interfaceName, isSecure) {
    checkArgs('fFsB', 'BusAttachment.createInterface', arguments);

    var success = function (interfaceId) {
        var interfaceDesc = new InterfaceDescription(interfaceName);
        interfaceDesc._id = interfaceId;
        successCallback(interfaceDesc);
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'busAttachmentCreateInterface', [this._id, interfaceName, (!!isSecure).toString()]);
};

/**
 * Retrieve an existing activated InterfaceDescription.
 * @param  {Function} successCallback Success callback that accepts retrieved InterfaceDescription object
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 * @param  {String}   interfaceName   Interface name to retrieve
 */
BusAttachment.prototype.getInterface = function (successCallback, errorCallback, interfaceName) {
    checkArgs('fFs', 'BusAttachment.getInterface', arguments);

    var success = function(interfaceId) {
        var interfaceDesc = new InterfaceDescription(interfaceName);
        interfaceDesc._id = interfaceId;
        successCallback(interfaceDesc);
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'busAttachmentGetInterface', [this._id, interfaceName]);
};

/**
 * Returns the existing activated InterfaceDescriptions.
 * @param  {Function} successCallback Success callback that accepts array of retrieved InterfaceDescription objects
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 */
BusAttachment.prototype.getInterfaces = function (successCallback, errorCallback) {
    checkArgs('fF', 'BusAttachment.getInterfaces', arguments);

    var success = function (interfaceIds) {

        var interfaces = [];
        interfaceIds = JSON.parse(interfaceIds);

        for (var interfaceId in interfaceIds) {
            if (interfaceIds.hasOwnProperty(interfaceId)) {
                var interfaceDesc = new InterfaceDescription(interfaceIds[interfaceId]);
                interfaceDesc._id = interfaceId;

                interfaces.push(interfaceDesc);
            }
        }

        successCallback(interfaces);
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'busAttachmentGetInterfaces', [this._id]);
};

/**
 * Static method to create new BusAttachment object.
 * @param successCallback   Function that accepts newly created BusAttachment
 * @param errorCallback     Optional error callback
 * @param name              New BusAttachment object name
 * @returns                 Newly created BusAttachment object
 */
BusAttachment.create = function (successCallback, errorCallback, name) {
    checkArgs('fFs', 'BusAttachment.create', arguments);

    var success = function (busGuid) {
        var result = new BusAttachment(name);
        result._id = busGuid;
        successCallback(result);
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'busAttachmentCreate', [name]);
};

/**
 * Reason for the session being lost. Passed as a second parameter to sesionLost listener.
 */
BusAttachment.SessionLostReason = {
    /**< Invalid */
    ALLJOYN_SESSIONLOST_INVALID: 0x00,
    /**< Remote end called LeaveSession */
    ALLJOYN_SESSIONLOST_REMOTE_END_LEFT_SESSION: 0x01,
    /**< Remote end closed abruptly */
    ALLJOYN_SESSIONLOST_REMOTE_END_CLOSED_ABRUPTLY: 0x02,
    /**< Session binder removed this endpoint by calling RemoveSessionMember */
    ALLJOYN_SESSIONLOST_REMOVED_BY_BINDER: 0x03,
    /**< Link was timed-out */
    ALLJOYN_SESSIONLOST_LINK_TIMEOUT: 0x04,
    /**< Unspecified reason for session loss */
    ALLJOYN_SESSIONLOST_REASON_OTHER: 0x05
};

module.exports = BusAttachment;

});
