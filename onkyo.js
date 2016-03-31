/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

var eiscp = require('eiscp');

// you have to require the adapter module and pass a options object
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils

var objects = {};

var adapter = utils.adapter({    // name has to be set and has to be equal to adapters folder name and main file name excluding extension
    name:  'onkyo',
    // is called if a subscribed state changes
    stateChange: function (id, state) {
        adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

        if (!state.ack) {
            var ids = id.split(".");
            ids = ids[ids.length - 1];

            if (ids == 'command') {
                // Determine whether it's a raw or high-level command.
                // Raw commands are all uppercase and digits and
                // notably have no "="
                if (state.val.match(/^[A-Z0-9\-+]+$/)) {
                    eiscp.raw(state.val);
                } else {
                    eiscp.command(state.val);
                }
            } else {
                // Assume it's a high-level command
                var newVal = state.val;
                if (newVal === true || newVal === 'true' || newVal === '1' || newVal === 1) {
                    newVal = "on";
                } else if (newVal === false || newVal === 'false' || newVal === '0' || newVal === 0) {
                	if (ids === 'system-power' || ids === 'power') {
				newVal = "standby";
			} else {
		    	newVal = "off";
			}
                }
                if (!objects[id]) {
                    adapter.log.error('Unknown object: ' + id + ' or no connection');
                } else {
                    if (!objects[id].native || !objects[id].native.command) {
                        adapter.log.warn('non controllable state: ' + id);
                    } else {
                        eiscp.command(objects[id].native.command + "=" + newVal);
                    }
                }
            }
        }
    },

    // is called when adapter shuts down - callback has to be called under any circumstances!
    unload: function (callback) {
        try {
            eiscp.close();
        } finally {
            callback();
        }
    },

    ready: function () {
        adapter.subscribeStates('*');
        main();
    }
});

/*
 * Generate state notifications.
 * We convert "on"/"off" textual strings into bools
 */
function notifyCommand(cmdstring, value) {
    if (!cmdstring) {
        adapter.log.error('Empty command string! (value: ' + value + ')');
        return;
    } else {
        adapter.log.debug('Received: ' + cmdstring + '[' + value + ']');
    }

    // Convert into boolean
    if (value == "on") {
        value = true;
    } else if (value == "off") {
        value = false;
    }

    var found = false;
    for (var id in objects) {
        if (objects[id].native && objects[id].native.command == cmdstring) {
            adapter.setState(id, {val: value, ack: true});
            found = true;
            break;
        }
    }

    if (!found) {
        var role;
        // detect automatically type of state
        if (cmdstring.indexOf('volume') != -1) {
            role = 'media.volume';
        } else if (cmdstring.indexOf('power') != -1) {
            role = 'button';
        } else if (cmdstring.indexOf('source') != -1) {
            role = 'media.source';
        } else {
            role = 'media';
        }
	if(zone === 'zone2'){
		cmdstring = 'zone2.'+ cmdstring;
	}
	if(zone === 'zone3'){
		cmdstring = 'zone3.'+ cmdstring;
	}

        adapter.log.info('Create new object: ' + adapter.namespace + '.' + cmdstring + ', role = ' + role);

        objects[adapter.namespace + '.' + cmdstring] = {
            _id: adapter.namespace + '.' + cmdstring,
            common: {
                name: cmdstring,
                role: role,
                type: 'number'
            },
            native: {
                command: cmdstring
            },
            type: 'state'
        };

        adapter.setObject(cmdstring, objects[adapter.namespace + '.' + cmdstring], function (err, obj) {
            adapter.setState(cmdstring, {val: value, ack: true});
        });
    }
}

function main() {
    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    eiscp.on("error", function (e) {
        adapter.log.error("Error: " + e);
    });

    // Try to read all states
    adapter.getStatesOf(function (err, objs) {
        if (objs) {
            for (var i = 0; i < objs.length; i++) {
                objects[objs[i]._id] = objs[i];
            }
        }

        var options = {reconnect: true, verify_commands: false};

        if (adapter.config.avrAddress) {
            adapter.log.info('Connecting to AVR ' + adapter.config.avrAddress + ':' + adapter.config.avrPort);
            options.host = adapter.config.avrAddress;
            options.port = adapter.config.avrPort;
        } else {
            adapter.log.info('Starting AVR discovery');
        }

        // Connect to receiver
        eiscp.connect(options);
    });

    eiscp.on('connect', function () {
        adapter.log.info('Successfully connected to AVR');
        adapter.setState('connected', {val: true, ack: true});

        // Query some initial information
        /*eiscp.raw('PWRQSTN'); // Returns Power State
        eiscp.raw('MVLQSTN'); // Returns master volume
        eiscp.raw('SLIQSTN'); // Returns Current Input
        eiscp.raw('SLAQSTN'); // Returns Current Audio Selection
        eiscp.raw('LMDQSTN'); // Returns Current Listening Mode*/

        eiscp.get_commands('main', function (err, cmds) {
            cmds.forEach(function (cmd) {
				eiscp.command(cmd + "=query"); // Create for every command the object
                eiscp.get_command(cmd, function (err, values) {
                    adapter.log.debug('Please send following info to developer: ' + cmd + ', ' + JSON.stringify(values));
                });
            });
        });
	eiscp.get_commands('zone2', function (err, cmds) {
            cmds.forEach(function (cmd) {
			cmd = 'zone2.' + cmd;
				eiscp.command(cmd + "=query"); // Create for every command the object
                eiscp.get_command(cmd, function (err, values) {
                    adapter.log.debug('Please send following info to developer: ' + cmd + ', ' + JSON.stringify(values));
                });
            });
        });
	eiscp.get_commands('zone3', function (err, cmds) {
            cmds.forEach(function (cmd) {
			cmd = 'zone3.' + cmd;
				eiscp.command(cmd + "=query"); // Create for every command the object
                eiscp.get_command(cmd, function (err, values) {
                    adapter.log.debug('Please send following info to developer: ' + cmd + ', ' + JSON.stringify(values));
                });
            });
        });
	
        setTimeout(function () {
            // Try to read initial values
            for (var id in objects) {
                if (objects[id].native && objects[id].native.values && objects[id].native.values.indexOf('query') != -1) {
                    adapter.log.info('Initial query: ' + objects[id].native.command);
                    eiscp.command(objects[id].native.command + "=query");
                }
            }
        }, 5000);
    });

    eiscp.on('close', function () {
        adapter.log.info("AVR disconnected");
        adapter.setState("connected", {val: false, ack: true});
    });

    eiscp.on("data", function (cmd) {
        adapter.log.info('Got message: ' + JSON.stringify(cmd));
        if (cmd.command instanceof Array) {
            for (var cmdix = 0; cmdix < cmd.command.length; cmdix++) {
                notifyCommand(cmd.command[cmdix], cmd.argument);
            }
        } else {
            notifyCommand(cmd.command, cmd.argument);
        }
        notifyCommand('command', cmd.iscp_command);
    });

    eiscp.on("debug", function (message) {
        adapter.log.debug(message);
    });
}
