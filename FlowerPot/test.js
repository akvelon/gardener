'use strict';
var flowerPot = require("./flowerpot.js");
var pot1 = new flowerPot.Pot(0);

setInterval(function(){	
    console.log("Flower name: " + pot1.getFlowerName());
    console.log("Flower health: " + pot1.getFlowerHealth());
    console.log("Vital parameters: ");
    var vitalParameters = pot1.getFlowerVitalParameters();
    var recommendations = pot1.getRecommendations();
    for(var parameterName in vitalParameters) {
	console.log(parameterName + " = " + vitalParameters[parameterName].value);
    }
    for(var index in recommendations) {
	console.log(recommendations[index].message);
    }
}, 1000);