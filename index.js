"use strict";

var spawn = require('child_process').spawn;
var hb = require('./lib/hb.js');

var log = console.log;

var pin = "031-45-154";
var haBridgePort = 8081;

var haBridgeUrl = "http://localhost:"+haBridgePort;


// Clean up prior to running ha-bridge

var cleanup = spawn("rm",["data/device.db"]);

// Start ha-bridge

var haBridge = spawn("java", ["-jar","-Dserver.port="+haBridgePort, "java/ha-bridge-4.1.4.jar"]);
haBridge.on('error', function(data) {
    log('HA Bridge Error',data);
});
haBridge.stdout.on('data', function(data) {
    log('HA Bridge',data.toString());
});
haBridge.stderr.on('data', function(data) {
    log('Err HA Bridge',data.toString());
});
haBridge.on('close', function(code) {
    log('ha-bridge Process ended. Code: ' + code);
});

// Discover HomeBridge Devices after 5 seconds

setTimeout(function() {
  hb.discoverHap(log, pin,haBridgeUrl);
}, 5000);
