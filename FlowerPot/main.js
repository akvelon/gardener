#!/usr/bin/env node
var alljoyn = require('alljoyn');
var AppInsights = require("applicationinsights");
var flowerPot = require("./lib/flowerpot.js");

var sessionId = 0;
var portNumber = 25;
var advertisedName = 'org.alljoyn.Bus.sample';
var interfaceName = 'org.alljoyn.Bus.sample';
var interfacePath = '/sample';

var DEBUG_MODE = process.argv.indexOf('--debug') > 0;

// Instrumentation key for ApplicationInsights service
var INSTRUMENTATION_KEY = 'dcce6d5d-0048-4276-84e5-de12ea72f5dc';

function getParamValue(paramName, chatObject, msg) {
  console.log('getParamValue("' + paramName + '")');
  var paramValue = pot1.getFlowerVitalParameter(paramName);
  console.log('value  = ' + JSON.stringify(paramValue));
  chatObject.reply(msg, paramValue);
  // setTimeout(function(){
  //   chatObject.reply(msg, paramValue);
  // }, 0);
}

console.log('Starting service ' + advertisedName);

var bus = alljoyn.BusAttachment("host");
var inter = alljoyn.InterfaceDescription();

var listener = alljoyn.BusListener(
  function(name){
    console.log("FoundAdvertisedName", name);
    sessionId = bus.joinSession(name, portNumber, 0);
    console.log("JoinSession "+sessionId);
  },
  function(name){
    console.log("LostAdvertisedName", name);
  },
  function(name){
    console.log("NameOwnerChanged", name);
  }
);

var portListener = alljoyn.SessionPortListener(
  function(port, joiner){
    console.log("AcceptSessionJoiner", port, joiner);
    return port == portNumber;
  },
  function(port, sId, joiner){
    sessionId = sId;
    console.log("SessionJoined", port, sessionId, joiner);
  }
);

var pot1 = new flowerPot.Pot(function(){

    console.log("CreateInterface "+ bus.createInterface(interfaceName, inter));
    console.log("Add method " + inter.addMethod("getParamValue", "s",  "s", "paramName,paramValue", 0));

    bus.registerBusListener(listener);

    console.log("Start "+bus.start());
    var chatObject = alljoyn.BusObject(interfacePath);
    console.log("chat.AddInterface "+chatObject.addInterface(inter));

    console.log("chat.addMethodHandler "+chatObject.addMethodHandler(inter, 'getParamValue', function(args, msg){
      getParamValue(args['0'], chatObject, msg);
    }));

    console.log("RegisterBusObject "+bus.registerBusObject(chatObject));
    console.log("Connect "+bus.connect());

    console.log("RequestName "+bus.requestName(advertisedName));
    console.log("BindSessionPort "+bus.bindSessionPort(portNumber, portListener));
    console.log("AdvertiseName "+bus.advertiseName(advertisedName));

    // Added Chat to example
    var stdin = process.stdin;

    // without this, we would only get streams once enter is pressed
    stdin.setRawMode( true );

    // resume stdin in the parent process (node app won't quit all by itself
    // unless an error or process.exit() happens)
    stdin.resume();

    // i don't want binary, do you?
    stdin.setEncoding( 'utf8' );

    // on any data into stdin
    stdin.on( 'data', function(/*key*/){
      // ctrl-c ( end of text )
      //if ( key === '\u0003' ) {
      process.exit();
      //}
      //process.stdout.write( key + '\n' );
    });

    // Setup and start Application Insights client
    AppInsights
        .setup(INSTRUMENTATION_KEY)
        .start();

    // Track flower metric to Application Insights client
    setInterval(function(){
        var flowerHealth = pot1.getFlowerHealth();
        AppInsights.client.trackMetric('flowerHealth', flowerHealth);
        DEBUG_MODE && console.log('flowerHealth: ', flowerHealth);

        var vitalParameters = pot1.getFlowerVitalParameters();
        for(var parameterName in vitalParameters) {
            if (vitalParameters.hasOwnProperty(parameterName)) {
                AppInsights.client.trackMetric(parameterName, vitalParameters[parameterName].value);
                DEBUG_MODE && console.log(parameterName, ': ', vitalParameters[parameterName].value);
            }
        }
    }, 2000);
});
