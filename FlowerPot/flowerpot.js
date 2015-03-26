'use strict';
exports.Pot = function(deviceIndex, flowerName) {
    var FlowerDatabase = require('./flower_database.js');
    var SerialPort = require("serialport").SerialPort
    var flowerHealth;        
    var recommendations = [];

    flowerName = typeof(flowerName) !== 'undefined' ? flowerName : 'general';

    if(typeof(deviceIndex)==='undefined') {
	console.error('Device index not defined. Exiting.');
	process.exit(1);
    }

    var port = new SerialPort('/dev/ttyACM' + deviceIndex, {
	 baudrate: 9600
    });

    var portLocked = false;

    var recommendedParameters = FlowerDatabase.recommendedParameters[flowerName];
    var updateVitalParameter = function(parameterName) {
	if(!portLocked) {
	    portLocked = true;
	    port.write('GET ' + parameterName +"\n", function(err, results) {
		flowerVitalParameters[parameterName].value = Number(results);
		portLocked = false;
	    });
	} else {
	    setTimeout(function(){
		updateVitalParameter(parameterName);
	    }, 50);
	}
    }

    var updateFlowerHealth = function() {
	var result = 5;
	recommendations = [];
	for (parameterName in flowerVitalParameters) {
	    var value = flowerVitalParameters[parameterName].value;
	    var unit =  flowerVitalParameters[parameterName].unit;
	    var humanReadable = flowerVitalParameters[parameterName].humanReadable;
	    if(value < recommendedParameters[parameterName].min) {
		recommendations.push({
		    message: humanReadable + " (" + value + unit + ") less than recommended (" + recommendedParameters[parameterName].min + unit + "). "
		})
		result = result - recommendedParameters[parameterName].weight;
	    } else if(value > recommendedParameters[parameterName].max) {
		recommendations.push({
		    message: humanReadable + " (" + value + unit + ") greater than recommended (" + recommendedParameters[parameterName].max + unit + "). "
		})
		result = result - recommendedParameters[parameterName].weight;
	    }
	}
	flowerHealth = result;
    }

    this.getFlowerName = function() {
	return flowerName;
    }
    
    this.getFlowerVitalParameter = function(name) {
	return flowerVitalParameters[name].value;
    }

    this.getFlowerVitalParameters = function() {
	return flowerVitalParameters;
    }

    this.getRecommendations = function() {
	return recommendations;
    }

    this.getFlowerHealth = function() {
	return flowerHealth;
    }

    var flowerVitalParameters = {
	'light': {
	    humanReadable: "Illuminance", 
	    unit: "%", 
	    value: 0, 
	    interval: 1000, 
	    update: function(){updateVitalParameter('light')}},
	'air_temperature': {
	    humanReadable: "Air temperature", 
	    unit: "C", 
	    value: 0, 
	    interval: 1000, 
	    update: function(){updateVitalParameter('air_temperature')}},
	'air_humidity': {
	    humanReadable: "Air humidity", 
	    unit: "%", 
	    value: 0, 
	    interval: 1000, 
	    update: function(){updateVitalParameter('air_humidity')}},
	'soil_humidity': {
	    humanReadable: "Soil humidity", 
	    unit: "%", 
	    value: 0, 
	    interval: 1000, 
	    update: function(){updateVitalParameter('soil_humidity')}}
    };

    if(typeof(deviceIndex)==='undefined') {
	console.error('Device index not defined. Exiting.');
	process.exit(1);
    }

    var port = new SerialPort('/dev/ttyACM' + deviceIndex, {
	 baudrate: 9600
    });

    var portLocked = false;

    for(var parameterName in flowerVitalParameters) {
	setInterval(flowerVitalParameters[parameterName].update, flowerVitalParameters[parameterName].interval)
    }	
    setInterval(updateFlowerHealth, 1000);
}


