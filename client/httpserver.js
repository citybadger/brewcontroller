var connect = require('connect');
var sio = require('socket.io');
var app = connect.createServer(
    connect.static('http')
).listen(8080);

var io = sio.listen(app);
