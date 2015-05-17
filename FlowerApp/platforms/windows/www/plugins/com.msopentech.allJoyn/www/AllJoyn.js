cordova.define("com.msopentech.allJoyn.AllJoyn", function(require, exports, module) { 
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

/*global module, require*/

module.exports = {
    BusAttachment: require('./BusAttachment'),
    ProxyBusObject: require('./ProxyBusObject'),
    InterfaceDescription: require('./InterfaceDescription'),
    SessionOpts: require('./SessionOpts'),
    TransportMask: require('./TransportMask'),
    Status: require('./Status'),
    getVersion: function() {
        throw new Error('Not implemented yet');
    },

    /* Read Access type. */
    PROP_ACCESS_READ: 1,
    /* Write Access type. */
    PROP_ACCESS_WRITE: 2,
    /* Read-Write Access type. */
    PROP_ACCESS_RW: 3
};

});
