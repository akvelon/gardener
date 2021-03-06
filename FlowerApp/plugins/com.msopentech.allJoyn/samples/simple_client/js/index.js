﻿/*
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
var BUS_NAME = "MyApp";
var SERVICE_PATH = "/sample";
var SERVICE_PORT = 25;
var METHOD_NAME = "cat";

var CONNECT_SPEC = "tcp:addr=127.0.0.1,port=9955";

/*global msopentech*/

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        var BusAttachment = msopentech.alljoyn.BusAttachment;

        BusAttachment.create(function (busAttachment) {
            app.createInterface(busAttachment, function () {
                app.startBusAndConnect(busAttachment, null, app.fail("Failed to start/connect BusAttachment"));
            }, app.fail("Failed to create intreface at local BusAttachment"));
        }, app.fail("Failed to create bus " + BUS_NAME), BUS_NAME);
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
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

    // Creates interface, adds necessary methods and activates it
    createInterface: function (busAttachment, successCallback, errorCallback) {
        busAttachment.createInterface(function (interfaceDesc) {
            app.log("Created interface " + INTERFACE_NAME + " for current BusAttachment");
            interfaceDesc.addMethod(METHOD_NAME, "ss", "s", "inStr1,inStr2,outStr");
            interfaceDesc.activate(function () {
                app.log("Interface " + INTERFACE_NAME + " Activated successfully");
                successCallback(interfaceDesc);
            }, errorCallback);
        }, errorCallback, INTERFACE_NAME);
    },

    // Starts created busAttachment, connects to existing bus and tries to find existing services
    startBusAndConnect: function (busAttachment, successCallback, errorCallback) {
        busAttachment.start(function () {
            busAttachment.connect(function () {
                busAttachment.addEventListener('foundAdvertisedName', app.advertisedNameFound(busAttachment));
                busAttachment.advertiseName(function() {
                    app.log("Started advertising own name");
                    busAttachment.cancelAdvertiseName(function() {
                        busAttachment.findAdvertisedName(function() {
                            app.log("BusAttachment  " + BUS_NAME + " created and connected successfully");
                        }, errorCallback, SERVICE_NAME);
                    }, errorCallback, 'org.alljoyn.Bus.sample.NewRegisteredName');
                }, errorCallback, 'org.alljoyn.Bus.sample.NewRegisteredName');
            }, errorCallback, CONNECT_SPEC);
        }, errorCallback);
    },

    // Event handler for foundAdvertisedName event. Joins an existing session if any, and tries to call a remote method
    advertisedNameFound: function (busAttachment) {

        // Initialize shortcuts to AllJoyn objects
        var SessionOpts = msopentech.alljoyn.SessionOpts;
        var TransportMask = msopentech.alljoyn.TransportMask;

        var opts = new SessionOpts(SessionOpts.TrafficType.TRAFFIC_MESSAGES,
            false, SessionOpts.Proximity.PROXIMITY_ANY, TransportMask.TRANSPORT_ANY);

        var advertisedNameFoundHandler = function advertisedNameFoundHandler(host) {

            busAttachment.removeEventListener('foundAdvertisedName', advertisedNameFoundHandler);

            busAttachment.joinSession(function (sessionId) {
                busAttachment.addEventListener('sessionLost', function (sessionId, reason) {
                    app.log("Lost session " + sessionId + ", reason: " + reason);
                }, sessionId);

                app.log('Joined session ' + sessionId);
                app.createProxyBusObject(busAttachment, sessionId, function(proxyBusObject) {
                    proxyBusObject.methodCall(function (result) {
                        app.log('Successfully called ' + METHOD_NAME + ', got: ' + result);
                            busAttachment.leaveSession(function() {
                                app.log("Successfully disconnected from session " + sessionId);
                            }, app.fail("Failed to leave session " + sessionId), sessionId);
                        }, app.fail("Failed to call remote method " + METHOD_NAME + " at interface " + INTERFACE_NAME),
                    INTERFACE_NAME, METHOD_NAME, ["hello", "World!"]);
                });
            }, app.fail("Failed to join session"), host, SERVICE_PORT, opts);
        };

        // return actual handler for advertisedNameFound event
        return advertisedNameFoundHandler;
    },

    // Creates a proxy object and adds the existing interface to it
    createProxyBusObject: function (busAttachment, sessionId, successCallback, errorCallback) {

        // Initialize shortcuts to AllJoyn objects
        var ProxyBusObject = msopentech.alljoyn.ProxyBusObject;

        ProxyBusObject.create(function (proxy) {
            busAttachment.getInterfaces(function(interfaces) {
                var remoteInterface = interfaces.filter(function (iface) {
                    return iface.name === INTERFACE_NAME;
                })[0];

                proxy.addInterface(function () {
                    app.log("Successfully added interface to proxy");
                    successCallback(proxy);
                }, errorCallback, remoteInterface);

            }, errorCallback);
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
    }
};

app.initialize();
