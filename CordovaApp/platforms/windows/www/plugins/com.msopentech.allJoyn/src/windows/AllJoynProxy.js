cordova.define("com.msopentech.allJoyn.AllJoynProxy", function(require, exports, module) { 

/*global module, require, MSOpenTech*/

module.exports = {};
require("cordova/exec/proxy").add("AllJoyn", MSOpenTech.AllJoyn.CordovaProxy);

});
