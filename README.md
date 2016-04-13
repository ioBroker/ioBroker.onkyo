![Logo](admin/onkyo.png)
# ioBroker.onkyo

This adapter allows control of Onkyo AVRs using the EISCP protocol.

It uses node-eiscp: https://github.com/tillbaks/node-eiscp

The node-eiscp module parses raw EISCP messages into high-level
structured names like "master-volume", and the states will have those
high level names, e.g. "onkyo.0.master-volume"

For sending commands, there is a special state "command". Writes to that state
trigger either an high-level EISCP command as described in the "Command syntax" section
of https://github.com/tillbaks/node-eiscp like

    system-power=on
    zone2.power=on
    main.balance=3

or a raw EISCP command in the form of "PWR01".

Another special state maintained by the adapter is "connected". It's a boolean
showing whether node-eiscp is currently connected to a receiver.

The adapter is also configurable to use with VIS. In this case the objects can be
set with VIS for e.g. power on|off , mute and the other objects available in iobroker.
Please check the box in settings to use with VIS. The adapter support 2 zones for VIS.

To DO:
- Auto-discovery like SONOS
- Using eiscp.get_commands

## ChangeLog
### 0.1.20 (2016.03.29)
* (Eisbaeeer) Add checkbox in settings for VIS objects. Volumes can be set in
  decimal. Power states, mute states, etc. are now usable with VIS buttons.

### 0.1.12 (2016.02.25)
* (instalator) Fix power state

### 0.1.11 (2016.01.13)
* (instalator) Fix regexp error

### 0.1.10
* (instalator) For command CTL sets Center Level -12 - 0 - +12

### 0.1.9
* (instalator) change power to system-power

### 0.1.8
* (instalator) fix values to control power and enable using of 1 and 0

### 0.1.7
* (bluefox) fix creation of specific states (twice)

### 0.1.6
* (bluefox) fix creation of specific states

### 0.1.5
* (bluefox) fix node-eiscp package

### 0.1.4
* (bluefox) add debug outputs

### 0.1.1
* (bluefox) replace git with tarball

### 0.1.0
* (bluefox) update adapter for new concept

### 0.0.4
* (owagner) use verify_commands=false, to be able to send high-level commands to unknown AVR models

### 0.0.3
* (owagner) allow setting of states other than "command". This will trigger a high level
  command with the state name being set to the new value. Note that this will fail for
  many newer models, as they are not yet properly represented in node-eiscp's
  command table. Use the raw command in that case
* send some initial queries upon connect to get basic state information from the AVR

### 0.0.2
* (owagner) support node-eiscp's Autodiscovery mechanism
* (owagner) updated README, notably removing bogus reference to single instancing

### 0.0.1
* (owagner) initial version

