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
            if (ids.indexOf('zone2') != -1 || ids.indexOf('zone3') != -1){
				ids = ids[ids.length - 2] +'.'+ ids[ids.length - 1];
			} else {
				ids = ids[ids.length - 1];
			}
			
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
            		if (ids.indexOf('power') != -1) { //To support different zones
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
             
          // Here we go and send command from accepted Objects to command var
          if (adapter.config.fixedvars) {    
              // Volume Zone1
              if (ids == 'Volume_Zone1') {
              var new_val = parseInt(state.val);  //string to integer
              new_val = decimalToHex(state.val).toUpperCase();  //call function decimalToHex();
              new_val = 'MVL' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }
                  
              // Volume Zone2                    
              if (ids == 'Volume_Zone2') {
              var new_val = parseInt(state.val);  //string to integer
              new_val = decimalToHex(state.val).toUpperCase();  //call function decimalToHex();
              new_val = 'ZVL' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }

              // Audio_Mute_Zone1                    
              if (ids == 'Audio_Mute_Zone1') {
                  new_val = state.val;
              adapter.log.info('new_val: ' + new_val);
                  if (new_val == 'true' || new_val == true) {
                      new_val = '01';
                      }
              if  (new_val == 'false' || new_val == false) {
                    new_val = '00';
                      } 
              new_val = 'AMT' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }        

              // Audio_Mute_Zone2                    
              if (ids == 'Audio_Mute_Zone2') {
                  new_val = state.val;
                  if (new_val == 'true' || new_val == true) {
                      new_val = '01';
                      }
              if  (new_val == 'false' || new_val == false) {
                    new_val = '00';
                      } 
              new_val = 'ZMT' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }        
              
              // Input_Select_Zone1       SLI
              if (ids == 'Input_Select_Zone1') {
                  new_val = state.val;
                  new_val = 'SLI' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }        

              // Input_Select_Zone2       SLZ
              if (ids == 'Input_Select_Zone2') {
                  new_val = state.val;
                  new_val = 'SLZ' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }        
                          
              // Internet_Radio_Preset_Zone1   NPR                  
              if (ids == 'Internet_Radio_Preset_Zone1') {
              var new_val = parseInt(state.val);  //string to integer
              new_val = decimalToHex(state.val).toUpperCase();  //call function decimalToHex();
              new_val = 'NPR' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }

              // Internet_Radio_Preset_Zone2   NPZ
              if (ids == 'Internet_Radio_Preset_Zone2') {
              var new_val = parseInt(state.val);  //string to integer
              new_val = decimalToHex(state.val).toUpperCase();  //call function decimalToHex();
              new_val = 'NPZ' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }                          
              
              // Tuner_Preset_Zone1  PRS
              if (ids == 'Tuner_Preset_Zone1') {
              var new_val = parseInt(state.val);  //string to integer
              new_val = decimalToHex(state.val).toUpperCase();  //call function decimalToHex();
              new_val = 'PRS' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }                          

              // Tuner_Preset_Zone2  PRZ
              if (ids == 'Tuner_Preset_Zone2') {
              var new_val = parseInt(state.val);  //string to integer
              new_val = decimalToHex(state.val).toUpperCase();  //call function decimalToHex();
              new_val = 'PRZ' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }                          

              // Power_Zone1    PWR
              if (ids == 'Power_Zone1') {
                  new_val = state.val;
                  if (new_val == 'true' || new_val == true) {
                      new_val = '01';
                      }
              if  (new_val == 'false' || new_val == false) {
                    new_val = '00';
                      } 
              new_val = 'PWR' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
                  }        
 
              // Power_Zone2    ZPW
              if (ids == 'Power_Zone2') {
                  new_val = state.val;
                  if (new_val == 'true' || new_val == true) {
                      new_val = '01';
                      }
              if  (new_val == 'false' || new_val == false) {
                    new_val = '00';
                      } 
              new_val = 'ZPW' + new_val;
              adapter.log.info('new_val: ' + new_val);
              adapter.setState (adapter.namespace + '.' + 'command', {val: new_val, ack: false});
              adapter.setState (adapter.namespace + '.' + 'command', {val: 'ZVLQSTN', ack: false});
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

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}


/*
 * Generate state notifications.
 * We convert "on"/"off" textual strings into bools
 */
function notifyCommand(cmdstring, value, zone) {
    if (!cmdstring) {
        adapter.log.error('Empty command string! (value: ' + value + ')');
        return;
    } else {
    	if(zone !== 'main' && cmdstring !== 'command'){
			cmdstring = zone + '.'+ cmdstring;
		}
        adapter.log.debug('Received: ' + cmdstring + '[' + value + ']');
    }

    // Convert into boolean
    if (value == "on") {
        value = true;
    } else if (value == "off") {
        value = false;
    } else if (value == "standby") {
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

    // In this step the adapter creates variables from the received feedback from adapter
    if (!adapter.config.fixedvars) {
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
}        

function createObjects () {
      // Datenpunkte anlegen
      if (adapter.config.fixedvars) {
      var role = 'button';
      var value = '';
      var datapoints = new Array(
          'command',
          'Power_Zone1',
          'Power_Zone2',
          'NET/USB_Artist_Name_Info',
          'NET/USB_Title_Name',
          'NET/USB_Time_Info',
          'NET/USB_Album_Name_Info',
          'NET/USB_Track_Info',
          'NET_Play_Status',
          'NET_Repeat_Status',
          'NET_Shuffle_Status',
          'Volume_Zone1',
          'Volume_Zone2',
          'Tuning_Zone1',
          'Tuning_Zone2',
          'Internet_Radio_Preset_Zone1',
          'Internet_Radio_Preset_Zone2',
          'Input_Select_Zone1',
          'Input_Select_Zone2',
          'Audio_Mute_Zone1',
          'Audio_Mute_Zone2',
          'Tuner_Preset_Zone1',
          'Tuner_Preset_Zone2',
          'Listening_Mode',
          'Audio_Information',
          'Video_Information'
          );
      
      for ( var i=0 ; i < datapoints.length ; i++ )  {
          adapter.log.info('My array objects: ' + adapter.namespace + '.' + datapoints[i] + ', role = ' + role);        

      // Create DP command if not exist and config fixedvar active
            
      adapter.log.info('Create new object: ' + adapter.namespace + '.' + datapoints[i] + ', role = ' + role);
      
        objects[adapter.namespace + '.' + datapoints[i]] = {
            _id: adapter.namespace + '.' + datapoints[i],
            common: {
                name: datapoints[i],
                role: role,
                type: 'number'
            },
            native: {
                command: datapoints[i]
            },
            type: 'state'
        };

        adapter.setObject(datapoints[i], objects[adapter.namespace + '.' + datapoints[i]], function (err, obj) {
            adapter.setState(datapoints[i], {val: value, ack: true});
        });
    }
   }        
  };

function main() {
    // First create the objects
     createObjects();
     
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
        adapter.log.info('My Onkyo: ' + cmd.iscp_command);

    // Here we go to select the RAW feedback and take it to the right variable. The RAW is in cmd.iscp_command
    if (adapter.config.fixedvars) {

        var chunk = cmd.iscp_command.substr(0,3);
        var string = 	cmd.iscp_command.substr(3,80);
 
        adapter.log.info('chunk: ' + chunk);
        adapter.log.info('string: ' + string);   
   
     //Onkyo_Power_Zone1
    if (chunk == 'PWR')  {
      string = parseInt(string);                   //convert string to integer
    if (string == '1') {
      adapter.setState (adapter.namespace + '.' + 'Power_Zone1', {val: true, ack: true});
                        }
    if (string == '0') {
      adapter.setState (adapter.namespace + '.' + 'Power_Zone1', {val: false, ack: true});
                        }                                              
                    }
     //Onkyo_Power_Zone2
    if (chunk == 'ZPW')  {
      string = parseInt(string);                   //convert string to integer
    if (string == '1') {
      adapter.setState (adapter.namespace + '.' + 'Power_Zone2', {val: true, ack: true});
                        }
    if (string == '0') {
      adapter.setState (adapter.namespace + '.' + 'Power_Zone2', {val: false, ack: true});
                        } 
                    }
    //Audio information
      if (chunk == 'IFA')  {  
      adapter.setState (adapter.namespace + '.' + 'Audio_Information', {val: string, ack: true});
                    }                    
    //Net Play Status
      if (chunk == 'NST')  {
        var nst_play = string.substr(0,1);         //Play status    (S=Stop,P=Play,p=pause,F=FF,R=FR)
        var nst_repeat = string.substr(1,1);       //Repeat status  (-=Off,R=All,F=Folder,1=Repeat 1)
        var nst_shuffle = string.substr(2,1);      //Shuffle status (-=Off,S=All,A=Album,F=Folder)
        adapter.setState (adapter.namespace + '.' + 'NET_Play_Status', {val: nst_play, ack: true});
        adapter.setState (adapter.namespace + '.' + 'NET_Repeat_Status', {val: nst_repeat, ack: true});
        adapter.setState (adapter.namespace + '.' + 'NET_Shuffle_Status', {val: nst_shuffle, ack: true});
                          }

    //Onkyo_Audio_Mute_Zone1
      if (chunk == 'AMT')  {
        string = parseInt(string);                  //convert string to integer
          if (string == '1') {
      adapter.setState (adapter.namespace + '.' + 'Audio_Mute_Zone1', {val: true, ack: true});
                        }
          if (string == '0') {
      adapter.setState (adapter.namespace + '.' + 'Audio_Mute_Zone1', {val: false, ack: true});
                        }
                      }                              
 
  //Onkyo_Audio_Mute_Zone2
      if (chunk == 'ZMT')  {
        string = parseInt(string);                  //convert string to integer  
          if (string == '1') {
      adapter.setState (adapter.namespace + '.' + 'Audio_Mute_Zone2', {val: true, ack: true});
                        }
          if (string == '0') {
      adapter.setState (adapter.namespace + '.' + 'Audio_Mute_Zone2', {val: false, ack: true});
                        } 
                    }

  //Onkyo_Input_Select_Zone1  (hex)
      if (chunk == 'SLI')  {
        string = string.substr(0,2)        
        adapter.setState (adapter.namespace + '.' + 'Input_Select_Zone1', {val: string, ack: true});
                    }
  //Onkyo_Input_Select_Zone2  (hex)
      if (chunk == 'SLZ')  {
        string = string.substr(0,2)  
        adapter.setState (adapter.namespace + '.' + 'Input_Select_Zone2', {val: string, ack: true});
                    }

  //Onkyo_Internet_Radio_Preset_Zone1 
      if (chunk == 'NPR')  {
        string = parseInt(string, 16);              //convert hex to decimal
        adapter.setState (adapter.namespace + '.' + 'Internet_Radio_Preset_Zone1', {val: string, ack: true});
                    }
  //Onkyo_Internet_Radio_Preset_Zone2
      if (chunk == 'NPZ')  {
        string = parseInt(string, 16);              //convert hex to decimal
        adapter.setState (adapter.namespace + '.' + 'Internet_Radio_Preset_Zone2', {val: string, ack: true});
                    }

  //Listening_Mode
      if (chunk == 'LMD')  {
        string = string.substr(0,2)  
        adapter.setState (adapter.namespace + '.' + 'Listening_Mode', {val: string, ack: true});
                    }                    
                        
  //Onkyo_NET/USB_Album_Name_Info
      if (chunk == 'NAL')  {
        adapter.setState (adapter.namespace + '.' + 'NET/USB_Album_Name_Info', {val: string, ack: true});
                    }

  //Onkyo_NET/USB_Artist_Name_Info
      if (chunk == 'NAT')  {
        adapter.setState (adapter.namespace + '.' + 'NET/USB_Artist_Name_Info', {val: string, ack: true});
                    }

  //Onkyo_NET/USB_Time_Info
      if (chunk == 'NTM')  {
        adapter.setState (adapter.namespace + '.' + 'NET/USB_Time_Info', {val: string, ack: true});
                    }

  //Onkyo_NET/USB_Title_Name
      if (chunk == 'NTI')  {
        adapter.setState (adapter.namespace + '.' + 'NET/USB_Title_Name', {val: string, ack: true});
                    }

  //Onkyo_NET/USB_Track_Info
      if (chunk == 'NTR')  {
        adapter.setState (adapter.namespace + '.' + 'NET/USB_Track_Info', {val: string, ack: true});
                    }

  //Onkyo_Tuner_Preset_Zone1
      if (chunk == 'PRS')  {
        string = parseInt(string, 16);              //convert hex to decimal
        adapter.setState (adapter.namespace + '.' + 'Tuner_Preset_Zone1', {val: string, ack: true});
                    }
  //Onkyo_Tuner_Preset_Zone2
      if (chunk == 'PRZ')  {
        string = parseInt(string, 16);              //convert hex to decimal
        adapter.setState (adapter.namespace + '.' + 'Tuner_Preset_Zone2', {val: string, ack: true});
                    }

  //Onkyo_Tuning_Zone1
      if (chunk == 'TUN')  {
        string = parseInt(string) / 100;            //set dot for decimal
        adapter.setState (adapter.namespace + '.' + 'Tuning_Zone1', {val: string, ack: true});
                    }
  //Onkyo_Tuning_Zone2                    
      if (chunk == 'TUZ')  {
        string = parseInt(string) / 100;            //set dot for decimal
        adapter.setState (adapter.namespace + '.' + 'Tuning_Zone2', {val: string, ack: true});
                    }

  //Video_information
      if (chunk == 'IFV')  {
        adapter.setState (adapter.namespace + '.' + 'Video_information', {val: string, ack: true});
                    }  

  //Onkyo_Volume_Zone1
      if (chunk == 'MVL')  {
        string = parseInt(string, 16);              //convert hex to decimal - backward: string = string.toString(16);
        adapter.setState (adapter.namespace + '.' + 'Volume_Zone1', {val: string, ack: true});
                    }
  //Onkyo_Volume_Zone2
      if (chunk == 'ZVL')  {
        string = parseInt(string, 16);              //convert hex to decimal
        adapter.setState (adapter.namespace + '.' + 'Volume_Zone2', {val: string, ack: true});
                    }                     
   }
        
        if (cmd.command instanceof Array) {
            for (var cmdix = 0; cmdix < cmd.command.length; cmdix++) {
                notifyCommand(cmd.command[cmdix], cmd.argument, cmd.zone);
            }
        } else {
            notifyCommand(cmd.command, cmd.argument, cmd.zone);
        }
        notifyCommand('command', cmd.iscp_command, cmd.zone);
    });

    eiscp.on("debug", function (message) {
        adapter.log.debug(message);
    });   
    
}


