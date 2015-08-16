var schedule = require('node-schedule');
var util     = require('util');
var request  = require('request');
var events   = require('events');


module.exports = function(config) {

	var self = this;

	
	function init() {
		var rule = new schedule.RecurrenceRule();
	
		if (config.schedule.hour != undefined)
			rule.hour = config.schedule.hour;
		
		if (config.schedule.minute != undefined)
			rule.minute = config.schedule.minute;
		
		if (config.schedule.second != undefined)
			rule.second = config.schedule.second;
	
		schedule.scheduleJob(rule, function() {
			self.emit('time', new Date());
		});
	}
	
	init();
	
}


util.inherits(module.exports, events.EventEmitter);

