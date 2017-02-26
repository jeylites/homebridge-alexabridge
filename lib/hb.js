var request = require('request');
//require('request').debug = true
var mdns = require('mdns');
var discovered = [];
var log, pin, haBridgeUrl;

exports.discover = function() {
    //    log("DISCOVERED", discovered);
    return discovered;

}

// curl -X PUT http://127.0.0.1:51826/characteristics --header "Content-Type:Application/json"
// --header "authorization: 031-45-154" --data "{ \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }"



exports.discoverHap = function(_log, _pin, _haBridgeUrl) {
    log = _log;
    pin = _pin;
    haBridgeUrl = _haBridgeUrl;

    log("Starting HomeBridge Discovery", pin, haBridgeUrl);
    try {

        var sequence = [
            mdns.rst.DNSServiceResolve(),
            'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({
                families: [4]
            }),
            mdns.rst.makeAddressesUnique()
        ];
        var browser = mdns.createBrowser(mdns.tcp('hap'), {
            resolverSequence: sequence
        });
        browser.on('serviceUp', function(service) {
            log("Found HAP device: %s http://%s:%s", service.name, service.host, service.port);
            //            for (var i = 0; i < 5; i++) {
            getAccessories(service.name, service.port, service.name, function(err, data) {
                // Empty callback
            })
            //            }
        });
        browser.on('serviceDown', function(service) {
            log("HAP down: ", service.name);

        });
        browser.on('error', handleError);
        browser.start();
    } catch (ex) {
        handleError(ex);
    }

}

function getAccessories(host, port, hapname, callback) {

    var data = "";
    request({
        method: 'GET',
        url: 'http://' + host + ':' + port + '/accessories',
        timeout: 10000,
        json: true,
        headers: {
            "Content-Type": "Application/json",
            "authorization": pin,
            "connection": "keep-alive",
        },
    }, function(err, response, body) {
        // Response s/b 200 OK
        if (err || response.statusCode != 200) {
            if (err) {
                log("HAP Discover failed http://%s:%s error %s", host, port, err.code);
            } else {
                // Status code = 401 = homebridge not running in insecure mode
                log("HAP Discover failed http://%s:%s error code %s", host, port, response.statusCode);
                err = new Error("Http Err", response.statusCode);
            }
            callback(err);
        } else {
            //            log("RESPONSE",body,Object.keys(body.accessories).length);
            if (Object.keys(body.accessories).length > 0) {
                callback(null, parseHbtoHA_Bridge(host, port, hapname, body));
            } else {
                log.error("Short json data received http://%s:%s", host, port, JSON.stringify(body));
                callback(new Error("Short json data receivedh http://%s:%s", host, port));
            }
        }
    });
}

function handleError(err) {
    switch (err.errorCode) {
        case mdns.kDNSServiceErr_Unknown:
            console.warn(err);
            setTimeout(createBrowser, 5000);
            break;
        default:
            console.warn(err);
    }
}

function parseHbtoHA_Bridge(host, port, hapname, hb) {

    //  {
    //  "name" : "bedroom light",
    //  "deviceType" : "switch",
    //  "uniqueid":"00:17:88:5E:D3:04-04",
    //    "onUrl":"[{\"item\":\"http://penny:51826/characteristics\",\"type\":\"httpDevice\",\"httpVerb\":\"PUT\",\"httpBody\":\"{ \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 1}] }\",\"httpHeaders\":\"[{\"name\":\"authorization\",\"value\":\"031-45-154\"}]\",\"contentType\":\"application/json\"}]"
    //    "offUrl":"[{\"item\":\"http://penny:51826/characteristics\",\"httpVerb\":\"PUT\",\"httpBody\":\"{ \"characteristics\": [{ \"aid\": 2, \"iid\": 9, \"value\": 0}] }\",\"httpHeaders\":\"[{\"name\":\"authorization\",\"value\":\"031-45-154\"}]\",\"contentType\":\"application/json\",\"type\":\"httpDevice\"}]"
    //  }

    for (var accessory in hb.accessories) {

        // Accessory
        var aid = hb.accessories[accessory].aid;
        var device = hb.accessories[accessory];
        var iid, name, description, model, manufacturer;
        var onUrl, offUrl, dimUrl;
        onUrl = "";
        offUrl = "";
        dimUrl = "";

        for (var service in device.services) {
            //            name = "";
            var serviceType = device.services[service].type;
            var additionalApplianceDetails = {};

            //            log("Service=", aid, serviceType);
            //            log("Object: %s", JSON.stringify(device.services[service], null, 2));
            // Switch or Outlet
            if (serviceType.startsWith("00000043") || serviceType.startsWith("00000047") ||
                serviceType.startsWith("00000049") || serviceType.startsWith("0000003E")) {
                for (var id in device.services[service].characteristics) {
                    //      log("ID=",id);
                    var characteristic = device.services[service].characteristics[id];
                    var type = characteristic.type;
                    var iid = characteristic.iid;
                    //                name = characteristic.value;

                    if (type.startsWith("00000020")) {
                        // Accessory Model
                        manufacturer = characteristic.value;
                    }
                    if (type.startsWith("00000021")) {
                        // Accessory Model
                        model = characteristic.value;
                    }
                    if (type.startsWith("00000023")) {
                        // Accessory Name
                        name = characteristic.value;
                        description = characteristic.description;
                    }

                    if (type.startsWith("00000025")) {
                        // Accessory On/Off
                        //                        log("Accessory ( Switch )= ", aid, iid, name, description);
                        onUrl = '[{"item":"http://' + host + ':' + port + '/characteristics",\"type\":\"httpDevice\",\"httpVerb\":\"PUT\",\"httpBody\":\"{ \\\"characteristics\\\": [{\\"aid\\":' +
                            parseInt(aid) + ',\\"iid\\":' + parseInt(iid) + ',\\"value\\":1}] }\",\"httpHeaders\":\"[{\\"name\\":\\"authorization\\",\\"value\\":\\"031-45-154\\"}]\",\"contentType\":\"application/json\"}]';
                        offUrl = '[{"item":"http://' + host + ':' + port + '/characteristics",\"type\":\"httpDevice\",\"httpVerb\":\"PUT\",\"httpBody\":\"{ \\\"characteristics\\\": [{\\"aid\\":' +
                            parseInt(aid) + ',\\"iid\\":' + parseInt(iid) + ',\\"value\\":0}] }\",\"httpHeaders\":\"[{\\"name\\":\\"authorization\\",\\"value\\":\\"031-45-154\\"}]\",\"contentType\":\"application/json\"}]';

                    }

                    if (type.startsWith("00000008")) {
                        // Accessory Bright/Dim
                        dimUrl = '[{"item":"http://' + host + ':' + port + '/characteristics",\"type\":\"httpDevice\",\"httpVerb\":\"PUT\",\"httpBody\":\"{ \\\"characteristics\\\": [{\\"aid\\":' +
                            parseInt(aid) + ',\\"iid\\":' + parseInt(iid) + ',\\"value\\":${intensity.percent} }] }\",\"httpHeaders\":\"[{\\"name\\":\\"authorization\\",\\"value\\":\\"031-45-154\\"}]\",\"contentType\":\"application/json\"}]';

                    }

                }
            }
        }

        // Accessory parse complete

        if (onUrl) {

            // Controlable device
            if (dimUrl) {
                var device = {
                    "name": name,
                    "deviceType": "switch",
                    "id": null,
                    "mapType": null,
                    "onUrl": onUrl,
                    "offUrl": offUrl,
                    "dimUrl": dimUrl
                };
                //            log("Alexa, Turn On %s", name);
                //            log("Alexa, Turn Off %s", name);
                //            log("Alexa, Turn the %s to %", name);
            } else {
                var device = {
                    "name": name,
                    "deviceType": "switch",
                    "id": null,
                    "mapType": null,
                    "onUrl": onUrl,
                    "offUrl": offUrl
                };
                //          log("Alexa, Turn On %s", name);
                //          log("Alexa, Turn Off %s", name);

            }
            log("Adding Device: %s", name);
            //            log("Adding Device: %s", name, JSON.stringify(device));


            addHABridgeDevice(haBridgeUrl, name, JSON.stringify(device));

        }

    }

}


function addHABridgeDevice(url, name, device) {

    request({
        method: 'POST',
        url: url + '/api/devices',
        timeout: 10000,
        headers: {
            "Content-Type": "Application/json"
        },
        body: device
    }, function(err, response) {
        // Response s/b 200 OK

        if (err ) {
            log("HA Bridge Add Device failed %s %s:%s", name, url, err);

        } else if (response.statusCode != 201) {
            log("HA Bridge Add Device failed %s %s:%s", name, url, response.statusCode);
        } else {
            try {
                json = JSON.parse(response.body);
                log("Added Device: %s", name);
            } catch (ex) {
                //                log.error(ex);
                log("HA Bridge Add Device Failed %s %s:%s", name, url, response.statusCode, response.statusMessage);
                log("HA Bridge Add Device Failed %s %s:%s", name, url, response.body);

            }

        }
    });


}
