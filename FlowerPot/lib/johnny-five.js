
/*jshint node: true*/

var emitter = new require('events').EventEmitter();

function Board() {
    setTimeout(function () {
        emitter.emit('ready');
    }, 500);
}

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