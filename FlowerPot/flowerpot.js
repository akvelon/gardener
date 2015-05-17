
/*jshint node: true*/

var EMULATE_SENSORS = process.argv.indexOf('--emulate') > 0;

var Five = require('johnny-five');
if (EMULATE_SENSORS) {
    Five = require('./lib/johnny-five');
}
var FlowerDatabase = require('./flower_database.js');

function Pot(onReady, flowerName) {
    var board = new Five.Board();

    this.flowerHealth = undefined;
    this.flowerName = flowerName || 'general';
    this.flowerVitalParameters = {
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
            }
        }
    };
    this.recommendations = [];

    var updateVitalParameters = function() {
        for(var parameter in flowerVitalParameters) {
            flowerVitalParameters[parameter].pinObject.query(flowerVitalParameters[parameter].update);
        }
    };

    var that = this;
    var updateFlowerHealth = function() {
        var result = 5;
        that.recommendations = [];
        var recommendedParameters = FlowerDatabase.recommendedParameters[flowerName];
        for (var parameterName in that.flowerVitalParameters) {
            var vitalParam = that.flowerVitalParameters[parameterName];
            var recommendedParam = recommendedParameters[parameterName];

            var value = vitalParam.value;
            var unit =  vitalParam.unit;
            var humanReadable = vitalParam.humanReadable;
            if(value < recommendedParam.min) {
                that.recommendations.push({
                    message: humanReadable + " (" + value + unit + ") less than recommended (" + recommendedParam.min + unit + "). "
                });
                result = result - recommendedParam.weight;
            } else if(value > recommendedParam.max) {
                that.recommendations.push({
                    message: humanReadable + " (" + value + unit + ") greater than recommended (" + recommendedParam.max + unit + "). "
                });
                result = result - recommendedParam.weight;
            }
        }
        that.flowerHealth = result;
    };

    board.on('ready', function(){
        console.log('Flower pot initialized');

        // Bind parameters to sensors. Create Pin object for each parameter.
        for (var parameter in flowerVitalParameters) {
            flowerVitalParameters[parameter].pinObject = new Five.Pin(flowerVitalParameters[parameter].pinName);
        }

        setInterval(updateVitalParameters, 1000);
        setInterval(updateFlowerHealth, 1000);

        if(typeof(onReady === 'function')) {
            onReady();
        }
    });
}

Pot.prototype.getFlowerName = function() {
    return this.flowerName;
};

Pot.prototype.getFlowerVitalParameter = function(name) {
    return this.flowerVitalParameters[name].value;
};

Pot.prototype.getFlowerVitalParameters = function() {
    return this.flowerVitalParameters;
};

Pot.prototype.getRecommendations = function() {
    return this.recommendations;
};

Pot.prototype.getFlowerHealth = function() {
    return this.flowerHealth;
};

module.exports.Pot = Pot;
