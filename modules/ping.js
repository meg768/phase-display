
module.exports = function(config) {


	if (config == undefined)
		config = {};
		
	if (config.path == undefined)
		config.path = '/';

	if (config.host == undefined)
		throw new Error('Host needed.');
		
	function init(url) {
		var http = require('http');
		var schedule = require('node-schedule');
	
		function ping() {
		
			console.log("Pinging...");
			
			var options = {};
			options.host = config.host;
			options.path = config.path;
			
			var request = http.request(options, function(response) {
				console.log('Ping OK.');
			});
			
			request.end();
		}

		if (typeof config.schedule == 'object') {
			var rule = new schedule.RecurrenceRule();
	
			if (config.schedule.hour != undefined)
				rule.hour = config.schedule.hour;

			if (config.schedule.minute != undefined)
				rule.minute = config.schedule.minute;

			schedule.scheduleJob(rule, function() {
				ping();	
			});

		}		
	}
	

	init();

};


