
/*jshint node: true*/

exports.Pot = function(onReady, flowerName) {
    var five = require('johnny-five');
    var board = new five.Board();
    var FlowerDatabase = require('./flower_database.js');
    var flowerHealth;
    var recommendations = [];

    flowerName = typeof(flowerName) !== 'undefined' ? flowerName : 'general';

    var updateVitalParameters = function() {
        for(var parameter in flowerVitalParameters) {
            flowerVitalParameters[parameter].pinObject.query(flowerVitalParameters[parameter].update);
        }
    };

    board.on('ready', function(){
        console.log('Flower pot initialized');

        for (var parameter in flowerVitalParameters) {
            flowerVitalParameters[parameter].pinObject = new five.Pin(flowerVitalParameters[parameter].pinName);
        }

        setInterval(updateVitalParameters, 1000);
        setInterval(updateFlowerHealth, 1000);

        if(typeof(onReady === 'function')) {
            onReady();
        }
    });

    var recommendedParameters = FlowerDatabase.recommendedParameters[flowerName];

    var updateFlowerHealth = function() {
        var result = 5;
        recommendations = [];
        for (var parameterName in flowerVitalParameters) {
            var value = flowerVitalParameters[parameterName].value;
            var unit =  flowerVitalParameters[parameterName].unit;
            var humanReadable = flowerVitalParameters[parameterName].humanReadable;
            if(value < recommendedParameters[parameterName].min) {
                recommendations.push({
                    message: humanReadable + " (" + value + unit + ") less than recommended (" + recommendedParameters[parameterName].min + unit + "). "
                });
                result = result - recommendedParameters[parameterName].weight;
            } else if(value > recommendedParameters[parameterName].max) {
                recommendations.push({
                    message: humanReadable + " (" + value + unit + ") greater than recommended (" + recommendedParameters[parameterName].max + unit + "). "
                });
                result = result - recommendedParameters[parameterName].weight;
            }
        }
        flowerHealth = result;
    };

    this.getFlowerName = function() {
        return flowerName;
    };

    this.getFlowerVitalParameter = function(name) {
        return flowerVitalParameters[name].value;
    };

    this.getFlowerVitalParameters = function() {
        return flowerVitalParameters;
    };

    this.getRecommendations = function() {
        return recommendations;
    };

    this.getFlowerHealth = function() {
        return flowerHealth;
    };

    var flowerVitalParameters = {
    'illuminance': {
        humanReadable: "Illuminance",
        unit: "%",
        pinName: "A1",
        update: function(state){
            flowerVitalParameters["illuminance"].value = 100 - state.value * 100 / 1024;
        }},
    'soil_humidity': {
        humanReadable: "Soil humidity",
        unit: "%",
        pinName: "A0",
        update: function(state){
            flowerVitalParameters["soil_humidity"].value = state.value * 100 / 950;
        }}
    };
};
