//-------------------------------------------------------------------
//~ @(#) Name : index.js
//~ @(#) Desc : 
//~ @(#) version : 1.0
// Auteur : adm@di-marco.net
// Date : 2019-09-28
//-------------------------------------------------------------------
// Version history
//   v1.O - Initial version
//   test and work on : mac mini (late 2014) & livebox v4 
//-------------------------------------------------------------------
var Accessory, Service, Characteristic, UUIDGen;
var inherits = require('util').inherits;
const fs = require('fs');
const packageFile = require("./package.json");
var os = require("os");
var hostname = os.hostname();

const UNIT_MBIT='Mbit'
const UNIT_MO='Mo'
const UNIT_PERCENT='%'
const UNIT_WATT='Watt'

module.exports = function(homebridge) {
    if(!isConfig(homebridge.user.configPath(), "accessories", "OrangeLiveboxInfo")) {
        return;
    }
    
    Accessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
//    FakeGatoHistoryService = require("fakegato-history")(homebridge);

    homebridge.registerAccessory('homebridge-livebox-info', 'OrangeLiveboxInfo', OrangeLiveboxInfo);
}

async function readUptime() {
    const exec = require('child_process').exec;
var script = await exec('/usr/local/lib/node_modules/homebridge-livebox-info/src/sh/homebridge-livebox-info.sh', 
(error, stdout, stderr) => {
            if (error !== null) {
                //this.log("exec error: " + ${error});
            }
        }); 
};

function isConfig(configFile, type, name) {
    var config = JSON.parse(fs.readFileSync(configFile));
    if("accessories" === type) {
        var accessories = config.accessories;
        for(var i in accessories) {
            if(accessories[i]['accessory'] === name) {
                return true;
            }
        }
    } else if("platforms" === type) {
        var platforms = config.platforms;
        for(var i in platforms) {
            if(platforms[i]['platform'] === name) {
                return true;
            }
        }
    } else {
    }
    return false;
};

function OrangeLiveboxInfo(log, config) {
    if(null == config) {
        return;
    }

    this.log = log;
	this.name = config["name"];
    if(config["file"]) {
		this.readFile = config["file"];
    } else {
		this.readFile = "/tmp/_homebridge-livebox-info.json";
	}
	if(config["updateInterval"] && config["updateInterval"] > 0) {
        this.updateInterval = config["updateInterval"];
    } else {
        this.updateInterval = null;
    }
  
	this.setUpServices();
};

OrangeLiveboxInfo.prototype.getDownstream = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var Downstream = (obj.Downstream);
	callback(null, Downstream);
};

OrangeLiveboxInfo.prototype.getUpstream = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var Upstream = obj.Upstream;
	callback(null, Upstream);
};

OrangeLiveboxInfo.prototype.getPhoneState = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var PhoneState = obj.PhoneState;
	callback(null, PhoneState);
};

OrangeLiveboxInfo.prototype.getTVState = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var TVState = obj.TVState;
	callback(null, TVState);
};

OrangeLiveboxInfo.prototype.getWifiState = function (callback) {
	var json = fs.readFileSync(this.readFile, "utf-8");
	var obj = JSON.parse(json);
	var WifiState = obj.WifiState;
	callback(null, WifiState);
};


OrangeLiveboxInfo.prototype.setUpServices = function () {

	var that = this;
	var temp;
	
	this.infoService = new Service.AccessoryInformation();
	this.infoService
		.setCharacteristic(Characteristic.Manufacturer, "@ad5030")
		.setCharacteristic(Characteristic.Model, this.name)
		.setCharacteristic(Characteristic.SerialNumber, "042-SN-20190928" + "_" + packageFile.version)
		.setCharacteristic(Characteristic.FirmwareRevision, packageFile.version);
	
//	this.fakeGatoHistoryService = new FakeGatoHistoryService("weather", this, { storage: 'fs' });
	
	let uuid1 = UUIDGen.generate(that.name + '-Downstream');
	downstream = function (displayName, subtype) {
		Characteristic.call(this, 'Downstream', uuid1);
		this.setProps({
			format: Characteristic.Formats.STRING,
			unit: UNIT_MBIT,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(downstream, Characteristic);
	downstream.UUID = uuid1;

	let uuid2 = UUIDGen.generate(that.name + '-Upstream');
	upstream = function () {
		Characteristic.call(this, 'Upstream', uuid2);
		this.setProps({
			format: Characteristic.Formats.STRING,
			unit: UNIT_MBIT,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(upstream, Characteristic);
	upstream.UUID = uuid2;
	
	let uuid3 = UUIDGen.generate(that.name + '-PhoneState');
	phonestate = function () {
		Characteristic.call(this, 'Phone State', uuid3);
		this.setProps({
			format: Characteristic.Formats.STRING,
			//unit: UNIT_MO,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(phonestate, Characteristic);
	phonestate.UUID = uuid3;

	let uuid4 = UUIDGen.generate(that.name + '-TVState');
	tvstate = function () {
		Characteristic.call(this, 'TV State', uuid4);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(tvstate, Characteristic);
	tvstate.UUID = uuid4;

	let uuid5 = UUIDGen.generate(that.name + '-WifiState');
	wifistate = function () {
		Characteristic.call(this, 'Wifi State', uuid5);
		this.setProps({
			format: Characteristic.Formats.STRING,
			//unit: UNIT_PERCENT,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(wifistate, Characteristic);
	wifistate.UUID = uuid5;


	this.liveboxService = new Service.TemperatureSensor(that.name);
	var currentTemperatureCharacteristic = this.liveboxService.getCharacteristic(Characteristic.CurrentTemperature);		
	this.liveboxService.getCharacteristic(downstream)
		.on('get', this.getDownstream.bind(this));
	this.liveboxService.getCharacteristic(upstream)
		.on('get', this.getUpstream.bind(this));
	this.liveboxService.getCharacteristic(phonestate)
		.on('get', this.getPhoneState.bind(this));
	this.liveboxService.getCharacteristic(tvstate)
		.on('get', this.getTVState.bind(this));
	this.liveboxService.getCharacteristic(wifistate)
		.on('get', this.getWifiState.bind(this));
//	function getCurrentTemperature() {
//		var data = fs.readFileSync(that.readFile, "utf-8");

//		var obj = JSON.parse(data);
//		var temperatureVal = (obj.temperature);

//		temp = temperatureVal;
//		that.log.debug("update currentTemperatureCharacteristic value: " + temperatureVal);
//		return temperatureVal;
//	}
	
	readUptime();
	
//	currentTemperatureCharacteristic.updateValue(getCurrentTemperature());
//	if(that.updateInterval) {
//		setInterval(() => {
//			currentTemperatureCharacteristic.updateValue(getCurrentTemperature());
			
//			that.log("Current Temp: " + temp);
//			this.fakeGatoHistoryService.addEntry({time: new Date().getTime() / 1000, temp: temp});
			//this.fakeGatoHistoryService.addEntry({time: new Date().getTime(), temp: temp});	

//			readUptime();
			
//		}, that.updateInterval);
//	}
	
//	currentTemperatureCharacteristic.on('get', (callback) => {
//		callback(null, getCurrentTemperature());
//	});
}

OrangeLiveboxInfo.prototype.getServices = function () {

	return [this.infoService, this.liveboxService];
};