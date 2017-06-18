/**
 * Created by zahar on 18/06/17.
 */

var df = require('dateformat')
    , autonomy = require('../')
    , arDrone = require('ar-drone')
    , arDroneConstants = require('ar-drone/lib/constants')
    , mission  = autonomy.createMission()
;

function navdata_option_mask(c) {
    return 1 << c;
}

// From the SDK.
var navdata_options = (
    navdata_option_mask(arDroneConstants.options.DEMO)
    | navdata_option_mask(arDroneConstants.options.VISION_DETECT)
    | navdata_option_mask(arDroneConstants.options.MAGNETO)
    | navdata_option_mask(arDroneConstants.options.WIFI)
);

// Land on ctrl-c
var exiting = false;
process.on('SIGINT', function() {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        mission.control().disable();
        mission.client().land(function() {
            process.exit(0);
        });
    }
});

// Connect and configure the drone
mission.client().config('general:navdata_demo', true);
mission.client().config('general:navdata_options', navdata_options);
mission.client().config('video:video_channel', 1);
mission.client().config('detect:detect_type', 12);

mission.takeoff();

mission.client().config('general:navdata_demo', 'FALSE');
mission.client().on('navdata', console.log);

console.log("zero dat");
mission.zero();
console.log("/zero dat");

x();

function x(){
    setTimeout(function(){
        console.log("set dat");
        mission.setCurrentLocation({x : 2, y : 1, z : 2, yaw : 0});
        console.log("/set dat");
    }, 7000);
}

mission.go({x : 2.2, y : 1, z : 2, yaw : 0});

// Execute mission
mission.land();

mission.run(function (err, result) {
    if (err) {
        console.trace("Oops, something bad happened: %s", err.message);
        mission.client().stop();
        mission.client().land();
    } else {
        console.log("We are done!");
        process.exit(0);
    }
});

