cordova.define("com.msopentech.allJoyn.SessionOpts", function(require, exports, module) { 
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

/*global require, module*/

var checkArgs = require('cordova/argscheck').checkArgs;
var TransportMask = require('./TransportMask');

/* Traffic type. */
var TrafficType = {
    /*Session carries message traffic.*/
    TRAFFIC_MESSAGES: 1,
    /*Session carries an unreliable (lossy) byte stream.*/
    TRAFFIC_RAW_UNRELIABLE: 2,
    /*Session carries a reliable byte stream.*/
    TRAFFIC_RAW_RELIABLE: 4
};

var Proximity = {
    PROXIMITY_ANY: 255,
    PROXIMITY_PHYSICAL: 1,
    PROXIMITY_NETWORK: 2
};

/**
 * Construct a SessionOpts with specific parameters.
 * SessionOpts contains a set of parameters that define a Session's characteristics.
 * @param  {Number} traffic      Type of traffic. One of TrafficType values. TrafficType.TRAFFIC_MESSAGES by default.
 * @param  {Number} isMultipoint True iff session supports multipoint (greater than two endpoints). False by default.
 * @param  {Number} proximity    Proximity constraint bitmask. One of Proximity values. Proximity.PROXIMITY_ANY by default
 * @param  {Number} transports   Allowed transport types bitmask. TransportMask.TRANSPORT_ANY by default.
 * @return {Object} New SessionOpts object
 */
var SessionOpts = function (trafficType, isMultipoint, proximity, transports) {
    // boolean is not supported in TypeMap
    checkArgs('N*NN', 'SessionOpts', arguments);

    this.traffic = trafficType || TrafficType.TRAFFIC_MESSAGES;
    this.isMultipoint = isMultipoint || false;
    this.proximity = proximity || Proximity.PROXIMITY_ANY;
    this.transports = transports || TransportMask.TRANSPORT_ANY;
};

/**
 * Construct a SessionOpts with specific parameters, gained from unspecific object
 */
SessionOpts.create = function(rawObj) {
    rawObj = rawObj || {};
    return new SessionOpts(rawObj.traffic, rawObj.isMultipoint, rawObj.proximity, rawObj.transports);
};

SessionOpts.TrafficType = TrafficType;
SessionOpts.Proximity = Proximity;

SessionOpts.prototype.toString = function() {
    return {
        traffic: this.traffic,
        isMultipoint: this.isMultipoint,
        proximity: this.proximity,
        transports: this.transports
    }.toString();
};

module.exports = SessionOpts;

});
