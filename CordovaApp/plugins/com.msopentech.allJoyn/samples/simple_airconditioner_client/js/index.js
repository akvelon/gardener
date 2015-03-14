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

var INTERFACE_NAME ="org.allseen.smarthome.device.airconditioner.AirConditionerInterface";
var SERVICE_NAME = "org.allseen.smarthome.device.airconditioner.mac0007A88A17AF";
var SERVICE_PATH = "/device/airconditioner/AirConditionerService";
var SERVICE_PORT = 69;

//var INTERFACE_NAME = "org.alljoyn.Bus.sample";
//var SERVICE_NAME = "org.alljoyn.Bus.sample";
//var SERVICE_PATH = "/sample";
//var SERVICE_PORT = 25;

var SESSION_ID = 0;

var CONNECT_SPEC = "tcp:addr=127.0.0.1,port=9955";
var APP_NAME = 'myApp';

/*global msopentech*/

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');

        var SessionOpts = msopentech.alljoyn.SessionOpts;
        var TransportMask = msopentech.alljoyn.TransportMask;
        var ProxyBusObject = msopentech.alljoyn.ProxyBusObject;
        var Status = msopentech.alljoyn.Status;
        var remoteIface;

        var fail = function (err) {
            var status = new Status(err);
            app.log(status);
        };

        msopentech.alljoyn.BusAttachment.create(function (busAttachment) {

            var foundCallback = function (host) { //DONE
                var opts = new SessionOpts(
                    SessionOpts.TrafficType.TRAFFIC_MESSAGES, false,
                    SessionOpts.Proximity.PROXIMITY_ANY,
                    TransportMask.TRANSPORT_ANY);

                busAttachment.joinSession(function (sessionId) {
                    SESSION_ID = sessionId;
                    console.log('joinSession success');
                    ProxyBusObject.create(function (proxy) {
                        proxy.addInterface(function() {

                            proxy.methodCall(function (result) {
                                console.log('RESULT: ' + result);
                            }, fail, INTERFACE_NAME, "cat", ["hello", "World!"]);

                            proxy.getProperty(function (value) {
                                console.log("GOT PROP TEMP1:" + value);
                            }, fail, INTERFACE_NAME, "Temp1");

                            proxy.getAllProperties(function (value) {
                                console.log("GOT PROPS:" + JSON.stringify(value));
                            }, fail, INTERFACE_NAME);

                            proxy.setProperty(function (value) {
                                console.log("SET PROP TEMP1 TO: " + value);
                            }, fail, INTERFACE_NAME, "Temp1", "Value");
                        }, fail, remoteIface);
                    }, fail, busAttachment, SERVICE_NAME, SERVICE_PATH, SESSION_ID);
                }, fail, host, SERVICE_PORT, opts);
            };

            busAttachment.createInterface(function (interfaceDesc) {
                remoteIface = interfaceDesc;
                // var PROP_ACCESS_READ = 1;
                var PROP_ACCESS_RW = 3;

                interfaceDesc.addMethod("cat", "ss", "s", "inStr1,inStr2,outStr");
                interfaceDesc.addProperty("Temp1", "s", PROP_ACCESS_RW);
                interfaceDesc.activate(function() {
                    busAttachment.start(function () {
                        busAttachment.connect(function () {
                            busAttachment.addEventListener('foundAdvertisedName', foundCallback);
                            busAttachment.findAdvertisedName(null, fail, SERVICE_NAME);
                        }, fail, CONNECT_SPEC);
                    }, fail);
                }, fail);
            }, fail, INTERFACE_NAME);
        }, fail, APP_NAME);
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    log: function (data) {
        console.log(data);
    }
};

app.initialize();
