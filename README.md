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

## ChangeLog

### 0.0.2
* (owagner) support node-eiscp's Autodiscovery mechanism
* (owagner) updated README, notably removing bogus reference to singly threading

### 0.0.1
* (owagner) initial version

