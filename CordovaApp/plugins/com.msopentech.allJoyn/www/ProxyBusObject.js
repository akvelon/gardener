
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

/*global module, require*/

var ALLJOYN_PROXY = 'AllJoyn';

var exec = require('cordova/exec');
var checkArgs = require('cordova/argscheck').checkArgs;
var InterfaceDescription = require('./InterfaceDescription');

var ProxyBusObject = function (service, path, sessionId, isSecure) {
    this._id = null;
    this._busId = null;
    this.uniqueName = service;
    this.serviceName = service;
    this.path = path;
    this.sessionId = sessionId;
    this.isSecure = isSecure;
};

/**
 * Static method to create new ProxyBusObject object.
 * @param successCallback   Function that accepts newly created ProxyBusObject
 * @param errorCallback     Optional error callback
 * @param name              New ProxyBusObject object name
 * @returns                 Newly created ProxyBusObject object
 */
ProxyBusObject.create = function (successCallback, errorCallback, busAttachment, service, path, sessionId, secure) {
    checkArgs('fFossnB', 'ProxyBusObject.create', arguments);

    if (!busAttachment || !busAttachment._id) {
        // TODO: refine error code here
        errorCallback();
        return;
    }

    var isSecure = !!secure;
    var success = function (proxyBusGuid) {
        var proxy = new ProxyBusObject(service, path, sessionId, isSecure);
        proxy._id = proxyBusGuid;
        proxy._busId = busAttachment._id;

        successCallback(proxy);
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'proxyBusObjectCreate', [busAttachment._id, service, path, sessionId.toString(), isSecure.toString()]);
};

/**
 * Query the remote object on the bus to determine the interfaces and children that exist.
 * Use this information to populate this proxy's interfaces and children.
 * @param  {[type]} successCallback Success callback
 * @param  {[type]} errorCallback   Error callback
 */
ProxyBusObject.prototype.introspectRemoteObject = function (successCallback, errorCallback) {
    checkArgs('fF', 'ProxyBusObject.introspectRemoteObject', arguments);
    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'proxyBusObjectIntrospectRemoteObject', [this._id]);
};

/**
 * Retrieve an existing InterfaceDescription.
 * @param  {Function} successCallback Success callback that accepts retrieved InterfaceDescription object
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 * @param  {String}   interfaceName   Interface name to retrieve
 */
ProxyBusObject.prototype.getInterface = function (successCallback, errorCallback, interfaceName) {
    checkArgs('fFs', 'ProxyBusObject.getInterface', arguments);

    var success = function (interfaceId) {
        var interfaceDesc = new InterfaceDescription(interfaceName);
        interfaceDesc._id = interfaceId;
        successCallback(interfaceDesc);
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'proxyBusObjectGetInterface', [this._id, interfaceName]);
};

/**
 * Add an interface to this ProxyBusObject. Occasionally, AllJoyn library user may wish to call
 * a method on a ProxyBusObject that was not reported during introspection of the remote object.
 * When this happens, the InterfaceDescription will have to be registered with the Bus manually
 * and the interface will have to be added to the ProxyBusObject using this method.
 *
 * @param {Function} successCallback      Success callback.
 * @param {Function} errorCallback        Error callback that accepts error code for this operation.
 * @param {Object}   interfaceDescription The interface to add to this object. Must come from Bus.GetInterface().
 */
ProxyBusObject.prototype.addInterface = function (successCallback, errorCallback, interfaceDescription) {
    checkArgs('fFo', 'ProxyBusObject.addInterface', arguments);

    if (!interfaceDescription || !interfaceDescription._id) {
        // TODO: refine error code here
        errorCallback();
        return;
    }

    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'proxyBusObjectAddInterface', [this._id, interfaceDescription._id]);
};

/**
 * Get a property from an interface on the remote object.
 * @param  {Function} successCallback Success callback that accepts property retrieved from specific interface.
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_OBJECT_NO_SUCH_INTERFACE if the specified interfaces does not exist on the remote object.
 *                                        * ER_BUS_NO_SUCH_PROPERTY if the property does not exist
 * @param  {String}   interfaceName   Name of interface to retrieve property from.
 * @param  {String}   propertyName    Name of property to retrieve.
 */
ProxyBusObject.prototype.getProperty = function (successCallback, errorCallback, interfaceName, propertyName) {
    checkArgs('fFss', 'ProxyBusObject.getProperty', arguments);

    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'proxyBusObjectGetProperty', [this._id, this._busId, interfaceName, propertyName]);
};

/**
 * Get all properties from an interface on the remote object.
 * @param  {Function} successCallback Success callback that accepts array of properties, retrieved from specific interface.
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_OBJECT_NO_SUCH_INTERFACE if the specified interfaces does not exist on the remote object.
 *                                        * ER_BUS_NO_SUCH_PROPERTY if the property does not exist
 * @param  {String}   interfaceName   Name of interface to retrieve all properties from.
 */
ProxyBusObject.prototype.getAllProperties = function (successCallback, errorCallback, interfaceName) {
    checkArgs('fFs', 'ProxyBusObject.getAllProperties', arguments);

    var success = function(jsonResult) {
        var result;
        try {
            result = JSON.parse(jsonResult);
        } catch (err) {
            // TODO: report error code here
            errorCallback();
            return;
        }
        successCallback(result);
    };

    exec(success, errorCallback, ALLJOYN_PROXY, 'proxyBusObjectGetAllProperties', [this._id, this._busId, interfaceName]);
};

/**
 * Set a property on an interface on the remote object.
 * @param  {Function} successCallback Success callback.
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_OBJECT_NO_SUCH_INTERFACE if the specified interfaces does not exist on the remote object.
 *                                        * ER_BUS_NO_SUCH_PROPERTY if the property does not exist
 *
 * @param  {String}   interfaceName   Name of interface.
 * @param  {String}   propertyName    Name of property.
 * @param  {Any}      value           The value to set.
 */
ProxyBusObject.prototype.setProperty = function (successCallback, errorCallback, interfaceName, propertyName, value) {
    checkArgs('fFss*', 'ProxyBusObject.setProperty', arguments);

    value = value || [];
    if (!(value instanceof Array)) {
        value = [value];
    }

    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'proxyBusObjectSetProperty', [this._id, this._busId, interfaceName, propertyName, JSON.stringify(value)]);
};

/**
 * Make a method call from this object.
 * @param  {Function} successCallback Success callback that accepts JSON array with data, returned by method.
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_REPLY_IS_ERROR_MESSAGE if the reply message type is MESSAGE_ERROR
 * @param  {String}   interfaceName   Name of interface.
 * @param  {String}   methodName      Name of method.
 * @param  {String[]} args            Array of arguments that will be passed to remote method.
 * @param  {Number}   timeout         Timeout specified in milliseconds to wait for a reply. ProxyBusObject.DefaultCallTimeout by default.
 */
ProxyBusObject.prototype.methodCall = function (successCallback, errorCallback, interfaceName, methodName, args, timeout) {
    checkArgs('fFssAN', 'ProxyBusObject.methodCall', arguments);

    timeout = timeout || ProxyBusObject.DefaultCallTimeout;
    args = args || [];
    if (!(args instanceof Array)) {
        args = [args];
    }

    exec(successCallback, errorCallback, ALLJOYN_PROXY, 'proxyBusObjectMethodCall', [this._id, this._busId, interfaceName, methodName, JSON.stringify(args), timeout.toString()]);
};

/* The default timeout for method calls (25 seconds) */
ProxyBusObject.DefaultCallTimeout = 25000;

module.exports = ProxyBusObject;
