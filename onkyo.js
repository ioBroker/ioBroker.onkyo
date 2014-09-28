/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

var eiscp = require('eiscp');


// you have to require the adapter module and pass a options object
var adapter = require(__dirname + '/../../lib/adapter.js')({

    // name has to be set and has to be equal to adapters folder name and main file name excluding extension
    name:           'onkyo',

    // is called if a subscribed object changes
    objectChange: function (id, obj) {
        // We not subscribed any objects
    },
    // is called if a subscribed state changes
    stateChange: function (id, state) {
        adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

        if(!state.ack)
        {
            // Determine whether it's a raw or high-level command.
            // Raw commands are all uppercase and have no "="
            if(state.val.match(/^[A-Z0-9]+$/))
                eiscp.raw(state.val);
            else
                eiscp.command(state.val);
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

    /*
     * We only care for one state "command"
     */
    ready: function () {
        adapter.subscribeStates('command');
        main();
    }

});

/*
 * Generate state notifications.
 * We convert "on"/"off" textual strings into bools
 */
function notifyCommand(cmdstring,value)
{
    // Convert into boolean?
    if(value=="on")
        value=true
    else if(value=="off")
        value=false

    adapter.setState(cmdstring,{val:value, ack:true});
}

function main() 
{
    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.info('Connecting to AVR ' + adapter.config.avrAddress + ":" +adapter.config.avrPort);
    eiscp.on("error",function(e){
        adapter.log.info("Error: "+e);
    });
    eiscp.on("connect",function(){
        adapter.log.info("Successfully connected to AVR");
        adapter.setState("connected",{val: true, ack: true})
    });
    eiscp.on("close",function(){
        adapter.log.info("AVR disconnected");
        adapter.setState("connected",{val: false, ack: true})
    });
    eiscp.on("data",function(cmd){
        adapter.log.info("Got message: "+JSON.stringify(cmd));
        if(cmd.command instanceof Array)
        {
            for(var cmdix in cmd.command)
                notifyCommand(cmd.command[cmdix],cmd.argument);
        }
        else
        {
            notifyCommand(cmd.command,cmd.argument);
        }
        notifyCommand("command",cmd.iscp_command);
    });

    eiscp.connect({host:adapter.config.avrAddress, port:adapter.config.avrPort});
}
