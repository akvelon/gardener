
// Copyright (c) Microsoft Open Technologies, Inc.  All rights reserved.  Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.

/*global module*/
/*jshint bitwise: false*/

/*Bitmask of all transport types.*/
var TransportMask = {
};

/*no transports */
TransportMask.TRANSPORT_NONE = 0x0000;
/*Local (same device) transport. */
TransportMask.TRANSPORT_LOCAL = 0x0001;
/*Transport using TCP (same as TRANSPORT_WLAN) */
TransportMask.TRANSPORT_TCP = 0x0004;
/*Wireless local-area network transport (same as TRANSPORT_TCP) */
TransportMask.TRANSPORT_WLAN = 0x0004;
/*Wireless wide-area network transport. */
TransportMask.TRANSPORT_WWAN = 0x0008;
/*Wired local-area network transport. */
TransportMask.TRANSPORT_LAN = 0x0010;
/*Transport using Wi-Fi Direct transport (currently unused) */
TransportMask.TRANSPORT_WFD = 0x0080;
/*Transport using the AllJoyn Reliable Datagram Protocol (flavor of reliable UDP) */
TransportMask.TRANSPORT_UDP = 0x0100;
/*A constant indicating that any transport is acceptable. */
TransportMask.TRANSPORT_ANY = (0xFFFF & ~TransportMask.TRANSPORT_WFD);
/*A constant indicating that literally any transport is acceptable. */
TransportMask.TRANSPORT_ALL = 0xFFFF;
/*A constant indicating that any IP-based transport is acceptable. */
TransportMask.TRANSPORT_IP = (TransportMask.TRANSPORT_TCP | TransportMask.TRANSPORT_UDP);

module.exports = TransportMask;
