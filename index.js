//var wemore = require('wemore');
var hb = require('./lib/hb.js');
var devices = [];

var log = console.log;

this.pin = "031-45-154";

hb.discoverHap(log, this.pin);





//devices[0] = { friendlyName: "TV", port: 9001};
//devices[1] = { friendlyName: "Door", port: 9002};

//for ( i = 0; i < devices.length; i++ )
//  {
//    var device = wemore.Emulate( devices[i] );
//    device.on('on', function(data) {
//        console.log("TV turned on",data.friendlyName);
//    });

//    device.on('off', function(data) {
//        console.log("TV turned off",data.friendlyName);
//    });
//  }
