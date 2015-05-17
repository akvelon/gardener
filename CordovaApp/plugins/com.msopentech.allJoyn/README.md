Apache Cordova plugin for Office 365 Outlook Services
=============================
Provides JavaScript API to work with AllJoyn devices.

Instead of AllJoyn Thin Client library this plugin uses AllJoyn Core library.

####Supported Platforms####

- Windows (Windows 8.0, Windows 8.1, Windows 10)

## Sample usage ##
To access the AllJoyn devices on network you you need to    to acquire an access token and get the Outlook Services client. Then, you can send async queries to interact with mail data. Note: application ID, authorization and redirect URIs are assigned when you register your app with Microsoft Azure Active Directory.

```javascript
var BUS_NAME = "MyApp";
var SERVICE_NAME = "org.alljoyn.Bus.sample";

BusAttachment.create(function (busAttachment) {
    busAttachment.start(function () {
        busAttachment.connect(function () {
            busAttachment.addEventListener('foundAdvertisedName', someListener);
            busAttachment.findAdvertisedName(function() {
                console.log("BusAttachment  " + BUS_NAME + " created and connected successfully");
            }, function (error) {
                console.log("Failed to start search for " + SERVICE_NAME);
            }, SERVICE_NAME);
        }, function (error) {
            console.log("Failed to connect to bus " + BUS_NAME);
        }, CONNECT_SPEC);
    }, function (error) {
        console.log("Failed to start bus " + BUS_NAME);
    });
}, function (error) {
    console.log("Failed to create bus " + BUS_NAME);
}), BUS_NAME);
```
Complete example is available [here](samples/simple_client).

Samples directory contains also basic_service executable (under basic_service-original folder) which acts as a server for simple client and should be running during tests.

## Installation Instructions ##

Use [Apache Cordova CLI](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html) to create your app and add the plugin.

1. Make sure an up-to-date version of Node.js is installed, then type the following command to install the [Cordova CLI](https://github.com/apache/cordova-cli):

        npm install -g cordova

2. Create a project and add the platforms you want to support:

        cordova create alljoynApp
        cd alljoynApp
        cordova platform add windows

3. Add the plugin to your project:

        cordova plugin add https://github.com/MSOpenTech/cordova-plugin-alljoyn.git

4. Build and run, for example:

        cordova run windows

To learn more, read [Apache Cordova CLI Usage Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html).

## Copyrights ##
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
