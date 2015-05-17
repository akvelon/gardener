
/*jshint node: true*/

var events = require('events');
var util = require('util');

function Board() {
    events.EventEmitter.call(this);
    var that = this;
    setTimeout(function () {
        that.emit('ready');
    }, 2000);
}

util.inherits(Board, events.EventEmitter);

function Pin (name) {
    return {
        query:function (callback) {
            var value = {
                value: Math.random() * 100
            };
            callback && callback(value);
        }
    };
}

module.exports.Board = Board;
module.exports.Pin = Pin;