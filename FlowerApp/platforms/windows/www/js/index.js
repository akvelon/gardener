/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var INTERFACE_NAME = "org.alljoyn.Bus.sample";
var SERVICE_NAME = "org.alljoyn.Bus.sample";

var BUS_NAME = "cordova.gardener." + cordova.platformId;
var SERVICE_PATH = "/sample";
var SERVICE_PORT = 25;
var CONNECT_SPEC = null;//"tcp:addr=gardener,port=9955";

var app = {
    busAttachment: null,
    proxyBusObject: null,

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        var BusAttachment = msopentech.alljoyn.BusAttachment;

        BusAttachment.create(function (busAttachment) {
            app.busAttachment = busAttachment;
            app.createInterface(function () {
                app.startBusAndConnect(null, app.fail("Failed to start/connect BusAttachment"));
            }, app.fail("Failed to create intreface at local BusAttachment"));
        }, app.fail("Failed to create bus " + BUS_NAME), BUS_NAME);
    },

    // Creates interface, adds necessary methods and activates it
    createInterface: function (successCallback, errorCallback) {
        app.busAttachment.createInterface(function (interfaceDesc) {
            app.log("Created interface " + INTERFACE_NAME + " for current BusAttachment");
        	interfaceDesc.addMethod("getParamValue", "s", "s", "paramName,paramValue");
            interfaceDesc.activate(function () {
                app.log("Interface " + INTERFACE_NAME + " Activated successfully");
                successCallback(interfaceDesc);
            }, errorCallback);
        }, errorCallback, INTERFACE_NAME);
    },

    // Starts created busAttachment, connects to existing bus and tries to find existing services
    startBusAndConnect: function (successCallback, errorCallback) {
        app.busAttachment.start(function () {
            app.busAttachment.connect(function () {
                app.busAttachment.addEventListener('foundAdvertisedName', app.advertisedNameFound(app.busAttachment));
                app.busAttachment.findAdvertisedName(function () {
                    app.log("BusAttachment  " + BUS_NAME + " created, looking for advertised name: " + INTERFACE_NAME);
                }, errorCallback, INTERFACE_NAME);
            }, errorCallback, CONNECT_SPEC);
        }, errorCallback);
    },

    // Event handler for foundAdvertisedName event. Joins an existing session if any, and tries to call a remote method
    advertisedNameFound: function (busAttachment) {

        var advertisedNameFoundHandler = function advertisedNameFoundHandler(host) {
            busAttachment.removeEventListener('foundAdvertisedName', advertisedNameFoundHandler);
            console.log('Advertised name has been found: ' + host);
            console.log('Ready to poll service.');
            app.SERVICE = host;
            app.busAttachment.getInterfaces(function (interfaces) {
                app.remoteInterface = interfaces
                .filter(function (iface) {
                    return iface.name === INTERFACE_NAME;
                })[0];


                app.receivedEvent('deviceready');
            }, app.fail('Failed to get remote interfaces'));
        };

        // return actual handler for advertisedNameFound event
        return advertisedNameFoundHandler;
    },

    // Creates a proxy object and adds the existing interface to it
    createProxyBusObject: function (busAttachment, sessionId, successCallback, errorCallback) {

        // Initialize shortcuts to AllJoyn objects
        var ProxyBusObject = msopentech.alljoyn.ProxyBusObject;

        ProxyBusObject.create(function (proxy) {
            proxy.addInterface(function () {
                app.log("Successfully added interface to proxy");
                successCallback(proxy);
            }, errorCallback, app.remoteInterface);
        }, errorCallback, busAttachment, SERVICE_NAME, SERVICE_PATH, sessionId);
    },

    // Generic failure handler
    fail: function(message) {

        // Initialize shortcuts to AllJoyn objects
        var Status = msopentech.alljoyn.Status;

        return function (err) {
            var status = new Status(err);
            app.log(status);
            message && app.log(message);
        };
    },

    // Generic log method
    log: function (data) {
        console.log(data);
        if (!app.logArea) {
            app.logArea = document.getElementById('log');
        }

        if (app.logArea) {
            app.logArea.textContent += data.toString() + '\n';
        }
    },

    pollStatus: function () {
        // Initialize shortcuts to AllJoyn objects
        var SessionOpts = msopentech.alljoyn.SessionOpts;
        var TransportMask = msopentech.alljoyn.TransportMask;

        var opts = new SessionOpts(SessionOpts.TrafficType.TRAFFIC_MESSAGES,
            false, SessionOpts.Proximity.PROXIMITY_ANY, TransportMask.TRANSPORT_ANY);

        setInterval(function () {
            app.busAttachment.joinSession(function (sessionId) {
                app.log('Joined session ' + sessionId);
                app.createProxyBusObject(app.busAttachment, sessionId, function (proxyBusObject) {
                    app.proxyBusObject = proxyBusObject;
                    app.proxyBusObject.methodCall(function (res) {
                        console.log('Currrent humidity: ' + JSON.stringify(res));
                        app.busAttachment.leaveSession(function () {
                            app.log('Left session');
                        }, app.fail("Failed to left session"), sessionId);
                    }, app.fail("Failed to call remote method "), INTERFACE_NAME, 'getParamValue', ['soil_humidity']);
                }, app.fail("Failed to create proxyBusObject"));
            }, app.fail("Failed to join session"), app.SERVICE, SERVICE_PORT, opts);
        }, 2000);
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        //app.pollStatus();
    }
};

app.initialize();