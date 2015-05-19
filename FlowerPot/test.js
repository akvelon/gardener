#!/usr/bin/env node
'use strict';
var flowerPot = require("./lib/flowerpot.js");
var AppInsights = require("applicationinsights");

var INSTRUMENTATION_KEY = 'dcce6d5d-0048-4276-84e5-de12ea72f5dc';

AppInsights
    .setup(INSTRUMENTATION_KEY)
    .start();

var pot1 = new flowerPot.Pot(function(){
        setInterval(function(){
            console.log("Flower name: " + pot1.getFlowerName());
            var flowerHealth = pot1.getFlowerHealth();
            console.log("Flower health: " + flowerHealth);
            AppInsights.client.trackMetric('flowerHealth', flowerHealth);
            console.log("Vital parameters: ");
            var vitalParameters = pot1.getFlowerVitalParameters();
            var recommendations = pot1.getRecommendations();

            for(var parameterName in vitalParameters) {
                if (vitalParameters.hasOwnProperty(parameterName)) {
            	    console.log(parameterName + " = " + vitalParameters[parameterName].value);
                    AppInsights.client.trackMetric(parameterName, vitalParameters[parameterName].value);
                }
            }

            for(var index in recommendations) {
                console.log(recommendations[index].message);
            }
        }, 1000);
    }
);

