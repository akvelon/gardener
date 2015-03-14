cordova.define("com.msopentech.allJoyn.InterfaceDescription", function(require, exports, module) { 
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

/*global module, require, msopentech*/

var ALLJOYN_PROXY = 'AllJoyn';

var exec = require('cordova/exec');
var checkArgs = require('cordova/argscheck').checkArgs;

/**
 * Class for describing message bus interfaces.
 * InterfaceDescription objects describe the methods, signals and properties of a BusObject or ProxyBusObject.
 * @param {[type]} name [description]
 */
var InterfaceDescription = function(name) {
    this.name = name;
    this._methods = [];
    this._properties = [];
};

/**
 * Add a method call member to the interface.
 * @param {String} name         Name of method call member.
 * @param {String} inSignature  Signature of input parameters or NULL for none.
 * @param {String} outSignature Signature of output parameters or NULL for none.
 * @param {String} argNames     Comma separated list of input and then output arg names used in annotation XML.
 * @param {Number} annotation   Annotation flags.
 */
InterfaceDescription.prototype.addMethod = function (name, inSignature, outSignature, argNames, annotation) {
    checkArgs('sSSSN', 'InterfaceDescription.addMethod', arguments);
    this._methods.push({
        name: name,
        inSig: inSignature || "",
        outSig: outSignature || "",
        argNames: argNames || "",
        annotation: annotation || 0
    });
};

/**
 * Add a property to the interface.
 * @param {String} name         Name of property.
 * @param {String} signature    Property type.
 * @param {Number} accessFlag   Access permission requirements on this call. One of
 *                                  msopentech.alljoyn.PROP_ACCESS_READ, msopentech.alljoyn.PROP_ACCESS_WRITE
 *                                  or msopentech.alljoyn.PROP_ACCESS_RW
 */
InterfaceDescription.prototype.addProperty = function (name, signature, accessFlag) {
    checkArgs('sSN', 'InterfaceDescription.addProperty', arguments);
    this._properties.push({
        name: name,
        sig: signature || "",
        access: accessFlag || msopentech.alljoyn.PROP_ACCESS_READ
    });
};

/**
 * Activate this interface. An interface must be activated before it can be used.
 * Activating an interface locks the interface so that is can no longer be modified.
 * @param  {Function} successCallback Success callback
 * @param  {Function} errorCallback   Error callback that accepts error code for this operation
 *                                        * ER_BUS_PROPERTY_ALREADY_EXISTS if the property can not be added because it already exists.
 *                                        * ER_BUS_MEMBER_ALREADY_EXISTS if member already exists
 */
InterfaceDescription.prototype.activate = function (successCallback, errorCallback) {
    checkArgs('fF', 'InterfaceDescription.activate', arguments);

    var that = this;

    var activate = function() {
        exec(successCallback, errorCallback, ALLJOYN_PROXY, 'interfaceDescriptionActivate', [that._id]);
    };

    if (that._methods.length > 0) {
        exec(function() {
            if (that._properties.length > 0) {
                exec(activate, errorCallback, ALLJOYN_PROXY, 'interfaceDescriptionAddProperties', [that._id, JSON.stringify(that._properties)]);
                return;
            }
            activate();
        }, errorCallback, ALLJOYN_PROXY, 'interfaceDescriptionAddMethods', [that._id, JSON.stringify(that._methods)]);
        return;
    }
    activate();
};

module.exports = InterfaceDescription;

});
