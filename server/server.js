var bone = require('bonescript');
require('/usr/lib/node_modules/bonescript/node_modules/socket.io');

var lowerLimit=7;
var upperLimit=11;

var switchPin = bone.P8_3;
var onboardLed = bone.USR3;
var listeningPort = 8009;

try {
bone.pinMode(switchPin, bone.OUTPUT);
bone.pinMode(onboardLed, bone.OUTPUT);

bone.digitalWrite(switchPin, bone.LOW);
bone.digitalWrite(onboardLed, bone.LOW);
} catch (e) {
}

var io = require('socket.io').listen(listeningPort);
var sensorConfig=require('./sensors');
var fs = require('fs');
var readCycleTime = 1000; // ms between sensor read requests
var switchStatus = -1; // Start as neither high nor low;
var controlMode = "auto";

console.log('Started Listening on port',listeningPort);

function switchOff(socket) {
  if (switchStatus!=LOW) socket.emit('switchStateChange','off');
  switchStatus=LOW;
  bone.digitalWrite(switchPin, LOW);
  bone.digitalWrite(onboardLed, LOW);
}

function switchOn(socket) {
  if (switchStatus!=HIGH) socket.emit('switchStateChange','on');
  switchStatus=HIGH;
  bone.digitalWrite(switchPin, HIGH);
  bone.digitalWrite(onboardLed, HIGH);
}

io.sockets.on('connection', function (socket) {
 console.log("Connection made");
 socket.emit("controlMode",controlMode);
  socket.emit('upperlimit',upperLimit);
  socket.emit('lowerlimit',lowerLimit);
  var tempInterval=setInterval(function(){
      fs.readFile(sensorConfig.temp2Config.file,"utf8",function(err,rawTempData) {
        if (!err) {
          var tempData=rawTempData.substr(rawTempData.length-6,5)/sensorConfig.temp2Config.scale;
          socket.emit('temp2', tempData);
          
          if (tempData>upperLimit && controlMode=="auto") switchOn(socket);
          else if (tempData<lowerLimit && controlMode=="auto") switchOff(socket);
        }
        else console.log("Error reading sensor");
      });
  },readCycleTime);

  socket.on('controlMode', function(newControlMode) {
    controlMode=newControlMode;
    if (controlMode=='manualOff') switchOff(socket);
    if (controlMode=='manualOn') switchOn(socket);
    socket.emit("controlMode",controlMode);
    
  });
  
  socket.on('upperlimit', function(upper) {
     console.log("New Upper Limit");
    upperLimit=upper;
    socket.emit('upperlimit',upper);
  });
 
  socket.on('lowerlimit', function(lower) {
      console.log("New Lower Limit");
    lowerLimit=lower;
    socket.emit('lowerlimit',lower);
  }); 
});
