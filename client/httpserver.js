var bb = require('bonescript');

setup = function() {
    var server = new bb.Server(6485, "http");
    server.begin();
};
