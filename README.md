# homebridge-livebox-info

homebridge-livebox-info is homebridge plugin for Apple HomeKit, get and return somes Orange Livebox informations.

[![npm](https://img.shields.io/npm/v/homebridge-livebox-info.svg)](https://www.npmjs.com/package/homebridge-livebox-info) 
[![npm](https://img.shields.io/npm/dt/homebridge-livebox-info.svg)](https://www.npmjs.com/package/homebridge-livebox-info)
[![GitHub license](https://img.shields.io/github/license/ad5030/homebridge-macosx-info.svg)](https://github.com/ad5030/homebridge-livebox-info)
<!-- [![Donate](https://img.shields.io/badge/donate-paypal-yellowgreen.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9MC83TRGACQPJ&source=url) --> 

> **Note:** **/!\\** It's a **`beta`** version !

Such as : 
  * [x] Speed Downstream *(Mbit)*
  * [x] Speed Upstream *(Mbit)*
  * [ ] Uptime
  * [ ] SoftwareVersion
  * [ ] ExternalIPAddress
  * [ ] IPv4Address
  * [ ] IPv6Address
  * [ ] Phone Number
  * [x] Phone State
  * [x] TV State
  * [x] WifiState
<!--more-->


## Exemple of .json data response file

```json  
{  
   "updateTime":"Sat 28 Sep 2019 18:25:25 CEST",
   "Downstream":"5.74",
   "Upstream":"0.94",
   "LastChange":"Sat Sep 21 14:36:22 2019",
   "SoftwareVersion":"SR40_sip-fr-3.53.6.1_7.21.3.1",
   "UpTime":"22:17:37",
   "ExternalIPAddress":"***.***.***.***",
   "IPv4Address":"192.168.1.1",
   "IPv6Address":"****:****:****:****:****:****:****",
   "IPv6DelegatedPrefix":"****:****:**:****:****",
   "directoryNumber":"+33*********",
   "PhoneState":"Up",
   "TVState":"Available",
   "WifiState":"False"
}
```

## Prerequisites
* Install [Homebrew](https://brew.sh)<span style="color:gray"> *(Homebrew installs the stuff you need that Apple didn’t)*</span>
* Install [node.js](https://nodejs.org/en/download/package-manager/#macos) on macOS
* Install [Homebridge](https://github.com/nfarina/homebridge/wiki/Install-Homebridge-on-macOS) on macOS
* Install [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x#readme) on macOS <span style="color:gray">*(optional)*<span>
* Install [Eve.app](https://www.evehome.com/en/eve-app) on iOS (for all availables plugin function), or it's possible to used "Home" app on macOS (only avalable for macOS Majave) or iOS (all plugin function aren't availables on this app !)
* Install [Python 3 & pip3](https://docs.brew.sh/Homebrew-and-Python) on macOS

## Installation
Used [npm](https://www.npmjs.com/package/homebridge-livebox-info) tool to install homebridge-livebox-info, and execute the command line below

```console
npm i homebridge-livebox-info
```

## Configuration
### STEP 1 : homebridge config.json file
Add this lines in config.json
```json    
"accessories": [
        {
            "accessory": "OrangeLiveboxInfo",
            "name": "Orange Livebox Info",
            "file": "/tmp/_homebridge-livebox-info.json",
            "serial": "042-04-000",
            "updateInterval": 60000
        }
    ],
```

| Parameter       | Note | Optionnal | value | 
|-----------------|------|-----------|-------|
| `accessory`     | Name of accessory|No|`LiveboxInfo`|
| `name`          | a human-readable name for your plugin|No|`Livebox Info`|
| `file`          | .json respons file|yes|default : `/tmp/_homebridge-livebox-info.json`|
| `updateInterval`| is time in ms of data update|yes|default : `null`|

>**Note:**  
**1.** The `index.js` call *`<PATH of Node Module>/homebridge-macosx-info/sh/homebridge-livebox-info.sh`* shell script. You can find this script in the repository in `/src/sh` directory  
**2.** It's possible that you can change the path of `homebridge-livebox-info.sh` in `readUptime` function on `index.js` script

```js
async function readUptime() {
    const exec = require('child_process').exec;
    var script = await exec('/usr/local/lib/node_modules/homebridge-macosx-info/src/sh/homebridge-livebox-info.sh',
        (error, stdout, stderr) => {
            if (error !== null) {
                //this.log("exec error: " + ${error});
            }
        }); 
};
```

### STEP 2 : Adapte `homebridge-livebox-info.sh` file in `src/sh` directory
* You can change path of temporary .json files : `JSON_DATA_FILE` variable

```sh
#!/bin/sh
#-------------------------------------------------------------------
#~ @(#) Name : homebridge-livebox-info.sh
#~ @(#) Desc : Persist in file the livebox sys infrmation needed by "homebridge-livebox-info" Homebridge/HomeKit plugin
#~ @(#) version : 1.0
# Auteur : adm@di-marco.net
# Date : 2019-09-28
#-------------------------------------------------------------------
# Version history
#   v1.O - Initial version - Test and work on : mac mini (late 2014) 10.13.6 (High Sierra) & livebox v4
#-------------------------------------------------------------------
#~ Usage : homebridge-livebox-info.sh
#-------------------------------------------------------------------

DIR=$(dirname $0)
TMP_DIR=/tmp
TMP_DSLRATE=_homebridge-livebox-dslrate.tmp
TMP_PHONESTATE=_homebridge-livebox-phonestate.tmp
TMP_TVSTATE=_homebridge-livebox-tvstate.tmp
TMP_WIFISTATE=_homebridge-livebox-wifistate.tmp
JSON_DATA_FILE=$TMP_DIR/_homebridge-livebox-info.json # path of .json respons file 

function livebox_mon()
{
  $DIR/lbx_sysbus.py -dslrate > $TMP_DIR/$TMP_DSLRATE
  $DIR/lbx_sysbus.py -info >> $TMP_DIR/$TMP_DSLRATE
  $DIR/lbx_sysbus.py -phonestate > $TMP_DIR/$TMP_PHONESTATE
  $DIR/lbx_sysbus.py -tvstate > $TMP_DIR/$TMP_TVSTATE
  $DIR/lbx_sysbus.py -wifistate > $TMP_DIR/$TMP_WIFISTATE
  
  _time=`date`
  
  response=null
  key=null
  value=null
  response='{"updateTime":"'${_time}'",'

  while read line; do
    read -a fields <<< $line ;
    key=${line/%: *} ; key=$(echo "$key" | perl -pe 's/^ *| *$//g') 
    value=${line#*\:} ; value=${value:1} ; value=$(echo "$value" | perl -pe 's/^ *| *$//g') 
    if [[ "${key}" == "Upstream" || "${key}" == "Downstream" ]]
    then
      value=${value% *}
    fi
    if [ "${key}" == "UpTime" ]
    then
      value=${value% (*} ; value=${value// /}
    fi
    response=${response}\"${key}\":\"${value}\",
  done < $TMP_DIR/$TMP_DSLRATE

  response=${response%?}

  phonestate=`cat $TMP_DIR/$TMP_PHONESTATE | grep "'status'" | grep -v "{'status':"`
  phonestate=${phonestate#*\'status\':} ; phonestate=${phonestate// /} ; phonestate=${phonestate//\'/} ; phonestate=${phonestate/%,}

  tvstate=`cat $TMP_DIR/$TMP_TVSTATE | grep "'IPTVStatus'"`
  tvstate=${tvstate#*\'IPTVStatus\':} ; tvstate=${tvstate// /} ; tvstate=${tvstate%\},*} ; tvstate=${tvstate//\'/} 

  wifistate=`cat $TMP_DIR/$TMP_WIFISTATE | grep "'Status'"`
  wifistate=${wifistate#*\'Status\':} ; wifistate=${wifistate// /} ; wifistate=${wifistate//\'/} ; wifistate=${wifistate//\}/}

  response=${response%?}\",\"PhoneState\":\"$phonestate\",\"TVState\":\"$tvstate\",\"WifiState\":\"$wifistate\"}
  echo $response > $JSON_DATA_FILE
}

livebox_mon
```

### STEP 3 : Install & configure `lbx_sysbus.py` file in `src/sh` directory

`lbx_sysbus.py` is a `Python 3` script that allows you to programmatically control a Livebox and explore control possibilities and other hidden information. It is an "experimental" tool.

1. The script is written in `Python 3`. It also requires `requests` which greatly simplifies HTTP requests.

```sh
$  pip3 install requests 
```

2. Now you must change/adapt the variables to connect on Orange Livebox : `URL_LIVEBOX`, `USER_LIVEBOX`, `PASSWORD_LIVEBOX` and `VERSION_LIVEBOX` 

```sh
URL_LIVEBOX = '<url of livebox interface configuration>' #example http://192.168.1.1/
USER_LIVEBOX = '<user admin>' #example admin
PASSWORD_LIVEBOX = '<user admin pwd>' #example p@ssw0rd
VERSION_LIVEBOX = '<LiveBox version>' #example lb4
```

It will also install the Graphviz engine. On OSX we can use brew. On Linux, sudo apt-get install graphviz or equivalent depending on the distribution.

### STEP 4 : restart homebridge 
Combine the two commands in a terminal to restart homebridge background process

 - `launchctl unload ~/Library/LaunchAgents/com.homebridge.server.plist`
 - `launchctl load ~/Library/LaunchAgents/com.homebridge.server.plist`

>**Note:** This commands are only avalable for macOS 

## Todo

## Known bugs

## Credits
* The original HomeKit API work was done by [KhaosT](https://twitter.com/khaost) in his [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) project
* [simont77 - fakegato-history](https://github.com/simont77/fakegato-history)
* [Rene Devichi - sysbus Orange Livebox 2, 3 et 4](https://github.com/rene-d/sysbus)

## Disclaimer
I'm furnishing this software "as is". I do not provide any warranty of the item whatsoever, whether express, implied, or statutory, including, but not limited to, any warranty of merchantability or fitness for a particular purpose or any warranty that the contents of the item will be error-free. The development of this module is not supported by Apple Inc. or eve. These vendors and me are not responsible for direct, indirect, incidental or consequential damages resulting from any defect, error or failure to perform.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
