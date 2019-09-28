# homebridge-livebox-info

> **Note:** Coming soon...

homebridge-livebox-info is homebridge plugin for Apple HomeKit, get and return somes Orange Livebox informations.

<div>
    <div style="display: inline-block;">
        <a href="https://www.npmjs.com/package/homebridge-livebox-info"><img src="https://img.shields.io/npm/v/homebridge-livebox-info.svg" alt="npm version" /></a>
    </div>
    <div style="display: inline-block;">
        <a href="https://www.npmjs.com/package/homebridge-livebox-info"><img src="https://img.shields.io/npm/dt/homebridge-livebox-info.svg" alt="npm download" /></a>
    </div>
    <div style="display: inline-block;">
        <a href="https://github.com/ad5030/homebridge-livebox-info"><img src="https://img.shields.io/github/license/ad5030/homebridge-macosx-livebox.svg" alt="GitHub license" /></a>
    </div>
</div>

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

*See [changelog]({{ site.baseurl }}/assets/docs/homebridge-livebox-info_CHANGELOG)*

> **Note:** Screenshots are taken from iOS [Eve.app](https://www.evehome.com/en/eve-app)

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
# Date : 2019-09-22
#-------------------------------------------------------------------
# Version history
#   v1.O - Initial version - Test and work on : mac mini (late 2014) 10.13.6 (High Sierra) & livebox v4
#-------------------------------------------------------------------
#~ Usage : homebridge-livebox-info.sh
#-------------------------------------------------------------------

DIR=$(dirname $0)
TMP_DIR=/tmp
TMP_DSLRATE=$TMP_DIR/_homebridge-livebox-dslrate.tmp
TMP_PHONESTATE=$TMP_DIR/_homebridge-livebox-phonestate.tmp
TMP_TVSTATE=$TMP_DIR/_homebridge-livebox-tvstate.tmp
TMP_WIFISTATE=$TMP_DIR/_homebridge-livebox-wifistate.tmp
JSON_DATA_FILE=$TMP_DIR/_homebridge-livebox-info.json # path of .json respons file 

function livebox_mon()
{
  $DIR/lbx_sysbus.py -dslrate > $TMP_DSLRATE
  $DIR/lbx_sysbus.py -info >> $TMP_DSLRATE
  $DIR/lbx_sysbus.py -phonestate > $TMP_PHONESTATE
  $DIR/lbx_sysbus.py -tvstate > $TMP_TVSTATE
  $DIR/lbx_sysbus.py -wifistate > $TMP_WIFISTATE

  response=null
  key=null
  value=null
  response="{"

  while read line; do
    read -a fields <<< $line ;
    key=${line/%: *} ; key=$(echo "$key" | perl -pe 's/^ *| *$//g') 
    value=${line#*\:} ; value=${value:1} ; value=$(echo "$value" | perl -pe 's/^ *| *$//g') 
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
This project is licensed under the MIT License - see the [LICENSE]({{ site.baseurl }}/licenses/MIT/) file for details

  <div class="row">
    <div class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
      <div class="withLove">
  	<span class="alpha">I</span>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="92px" height="72px" viewBox="0 0 92 72" enable-background="new 0 0 92 72" xml:space="preserve" class="heart">
        <g>
          <path fill="#010101" d="M82.32,7.888c-8.359-7.671-21.91-7.671-30.271,0l-5.676,5.21l-5.678-5.21c-8.357-7.671-21.91-7.671-30.27,0 c-9.404,8.631-9.404,22.624,0,31.255l35.947,32.991L82.32,39.144C91.724,30.512,91.724,16.52,82.32,7.888z"></path>
        </g>
      </svg>
      <span class="omega"><br />macOS</span>