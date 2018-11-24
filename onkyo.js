/* jshint -W097 */
/* jshint strict: false *7
/*jslint node: true */
'use strict';

const eiscp = require('eiscp');

// you have to require the adapter module and pass a options object
const utils = require(__dirname + '/lib/utils'); // Get common adapter utils

const objects = {};
const volume = {};

const adapter = new utils.adapter('onkyo');    // name has to be set and has to be equal to adapters folder name and main file name excluding extension
// is called if a subscribed state changes
adapter.on('stateChange', (id, state) => {
    adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
    let _zone;
    if (!state.ack) {
        let ids = id.split('.');
        if (ids.indexOf('zone2') !== -1 || ids.indexOf('zone3') !== -1) {
            ids = ids[ids.length - 2] + '.' + ids[ids.length - 1];
            _zone = ids[ids.length - 2];
        } else {
            ids = ids[ids.length - 1];
            _zone = 'main';
        }

        if (ids === 'command') {
            // Determine whether it's a raw or high-level command.
            // Raw commands are all uppercase and digits and
            // notably have no '='
            if (state.val.match(/^[A-Z0-9\-+]+$/)) {
                eiscp.raw(state.val);
            } else {
                eiscp.command(state.val);
            }
        } else {
            // Assume it's a high-level command
            let newVal = state.val;
            if (newVal === true || newVal === 'true' || newVal === '1' || newVal === 1) {
                newVal = 'on';
            } else if (newVal === false || newVal === 'false' || newVal === '0' || newVal === 0) {
                if (ids.indexOf('power') !== -1) { //To support different zones
                    newVal = 'standby';
                } else {
                    newVal = 'off';
                }
            }
            if (!objects[id]) {
                adapter.log.error('Unknown object: ' + id + ' or no connection');
            } else {
                if (!objects[id].native || !objects[id].native.command) {
                    adapter.log.warn('non controllable state: ' + id);
                } else {
                    if (ids.indexOf('volume') !== -1) {
                        setIntervalVol(id, newVal, _zone);
                    } else {
                        eiscp.command(objects[id].native.command + '=' + newVal);
                    }
                }
            }
        }
    }
});

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', callback => {
    try {
        eiscp.close();
    } finally {
        callback();
    }
});

adapter.on('ready', main);

function setIntervalVol(id, newVal, _zone) {
    if (newVal >= volume[_zone] + 10) {
        let vol = volume[_zone];
        const interval = setInterval(() => {
            vol = vol + 2;
            if (vol >= newVal) {
                vol = newVal;
                clearInterval(interval);
            }
            eiscp.command(objects[id].native.command + '=' + vol);
        }, 500);
    } else {
        eiscp.command(objects[id].native.command + '=' + newVal);
    }
}

/*
 * Generate state notifications.
 * We convert 'on'/'off' textual strings into bools
 */
function notifyCommand(cmdstring, value, zone) {
    if (cmdstring === 'volume') {
        volume[zone] = value;
    }
    if (!cmdstring) {
        adapter.log.error('Empty command string! (value: ' + value + ')');
        return;
    } else {
        if (zone !== 'main' && cmdstring !== 'command') {
            cmdstring = zone + '.' + cmdstring;
        }
        adapter.log.debug('Received: ' + cmdstring + '[' + value + ']');
    }

    // Convert into boolean
    if (value === 'on') {
        value = true;
    } else if (value === 'off') {
        value = false;
    } else if (value === 'standby') {
        value = false;
    }

    let found = false;
    for (const id in objects) {
        if (objects.hasOwnProperty(id) && objects[id].native && objects[id].native.command === cmdstring) {
            adapter.setState(id, {val: value, ack: true});
            found = true;
            break;
        }
    }

    if (!found) {
        let role;
        // detect automatically type of state
        if (cmdstring.indexOf('volume') !== -1) {
            role = 'media.volume';
        } else if (cmdstring.indexOf('power') !== -1) {
            role = 'button';
        } else if (cmdstring.indexOf('source') !== -1) {
            role = 'media.source';
        } else {
            role = 'media';
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

        adapter.setObject(cmdstring, objects[adapter.namespace + '.' + cmdstring], (err, obj) => {
            adapter.setState(cmdstring, {val: value, ack: true});
        });
    }
}

function main() {
    adapter.subscribeStates('*');

    adapter.setState('info.connection', {val: false, ack: true});
    // The adapters config (in the instance object everything under the attribute 'native') is accessible via
    // adapter.config:
    eiscp.on('error', e => adapter.log.error('Error: ' + e));

    // Try to read all states
    adapter.getStatesOf((err, objs) => {
        if (objs) {
            for (let i = 0; i < objs.length; i++) {
                objects[objs[i]._id] = objs[i];
            }
        }

        const options = {reconnect: true, verify_commands: false};

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

    eiscp.on('connect', () => {
        adapter.log.info('Successfully connected to AVR');
        adapter.setState('info.connection', {val: true, ack: true});

        // Query some initial information
        /*eiscp.raw('PWRQSTN'); // Returns Power State
        eiscp.raw('MVLQSTN'); // Returns master volume
        eiscp.raw('SLIQSTN'); // Returns Current Input
        eiscp.raw('SLAQSTN'); // Returns Current Audio Selection
        eiscp.raw('LMDQSTN'); // Returns Current Listening Mode */

        eiscp.get_commands('main', (err, cmds) => {
            cmds.forEach(cmd => {
                eiscp.command(cmd + '=query'); // Create for every command the object
                eiscp.get_command(cmd, (err, values) => {
                    adapter.log.debug('Please send following info to developer: ' + cmd + ', ' + JSON.stringify(values));
                });
            });
        });

        eiscp.get_commands('zone2', (err, cmds) => {
            cmds.forEach(cmd => {
                cmd = 'zone2.' + cmd;
                eiscp.command(cmd + '=query'); // Create for every command the object
                eiscp.get_command(cmd, (err, values) => {
                    adapter.log.debug('Please send following info to developer: ' + cmd + ', ' + JSON.stringify(values));
                });
            });
        });

        eiscp.get_commands('zone3', (err, cmds) => {
            cmds.forEach(cmd => {
                cmd = 'zone3.' + cmd;
                eiscp.command(cmd + '=query'); // Create for every command the object
                eiscp.get_command(cmd, (err, values) => {
                    adapter.log.debug('Please send following info to developer: ' + cmd + ', ' + JSON.stringify(values));
                });
            });
        });

        setTimeout(() => {
            // Try to read initial values
            for (const id in objects) {
                if (objects.hasOwnProperty(id) && objects[id].native && objects[id].native.values && objects[id].native.values.indexOf('query') !== -1) {
                    adapter.log.info('Initial query: ' + objects[id].native.command);
                    eiscp.command(objects[id].native.command + '=query');
                }
            }
        }, 5000);
    });

    eiscp.on('close', () => {
        adapter.log.info('AVR disconnected');
        adapter.setState('info.connection', {val: false, ack: true});
    });

    eiscp.on('data', cmd => {
        adapter.log.debug('Got message: ' + JSON.stringify(cmd));
        if (cmd.command instanceof Array) {
            for (let cmdix = 0; cmdix < cmd.command.length; cmdix++) {
                notifyCommand(cmd.command[cmdix], cmd.argument, cmd.zone);
            }
        } else {
            notifyCommand(cmd.command, cmd.argument, cmd.zone);
        }
        notifyCommand('command', cmd.iscp_command, cmd.zone);
    });

    eiscp.on('debug', message => adapter.log.debug(message));
}
