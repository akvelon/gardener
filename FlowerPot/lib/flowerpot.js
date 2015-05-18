
/*jshint node: true*/

var EMULATE_SENSORS = process.argv.indexOf('--emulate') > 0;

var SPRINCLE_SERVO_PIN = 9;
var SPRINCLE_SERVO_MIN = 30;
var SPRINCLE_SERVO_MAX = 50;
var SPRINCLE_TIMEOUT = 2000;

var LED_LIGHT_PIN = 10;
var LED_R_PIN = 11;
var LED_G_PIN = 12;
var LED_B_PIN = 13;

var Five = require('johnny-five');
if (EMULATE_SENSORS) {
    Five = require('./johnny-five');
}
var flowerDatabase = require('./flower_database');

function Pot(onReady, flowerName) {
    var board = new Five.Board();

    var that = this;

    this.flowerHealth = undefined;
    this.flowerName = flowerName || 'general';
    this.flowerVitalParameters = {
        'illuminance': {
            humanReadable: "Illuminance",
            unit: "%",
            pinName: "A1",
            update: function(state){
                that.flowerVitalParameters["illuminance"].value = 100 - state.value * 100 / 1024;
            }},
        'soil_humidity': {
            humanReadable: "Soil humidity",
            unit: "%",
            pinName: "A0",
            update: function(state){
                that.flowerVitalParameters["soil_humidity"].value = state.value * 100 / 950;
            }
        }
    };
    this.recommendations = [];

    var updateVitalParameters = function() {
        for(var parameter in that.flowerVitalParameters) {
            that.flowerVitalParameters[parameter].pinObject.query(that.flowerVitalParameters[parameter].update);
        }
    };

    var updateFlowerHealth = function() {
        var result = 5;
        that.recommendations = [];
        var recommendedParameters = flowerDatabase[that.flowerName];
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

        that.sprincleServo = new Five.Servo(SPRINCLE_SERVO_PIN);
        that.sprincleServo.to(SPRINCLE_SERVO_MIN);

        that.ledLight = new Five.Led(LED_LIGHT_PIN);
        that.ledR = new Five.Led(LED_R_PIN);
        that.ledG = new Five.Led(LED_G_PIN);
        that.ledB = new Five.Led(LED_B_PIN);

        // Bind parameters to sensors. Create Pin object for each parameter.
        for (var parameter in that.flowerVitalParameters) {
            that.flowerVitalParameters[parameter].pinObject = new Five.Pin(that.flowerVitalParameters[parameter].pinName);
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

Pot.prototype.sprincleFlower = function() {
    var servo = this.sprincleServo;
    servo.to(SPRINCLE_SERVO_MAX);
    setTimeout(function(){
        servo.to(SPRINCLE_SERVO_MIN);
    }, SPRINCLE_TIMEOUT);
}

Pot.prototype.lightOn = function() {
    this.ledLight.on();
}

Pot.prototype.lightOff = function() {
    this.ledLight.off();
}

module.exports.Pot = Pot;
