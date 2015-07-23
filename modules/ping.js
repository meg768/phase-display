
module.exports = function(host, path) {


	if (path == undefined)
		path = '/';
		
	function init(url) {
		var http = require('http');
		var schedule = require('node-schedule');
		var display = require('../common/display.js');
	
		function ping() {
		
			console.log("Pinging...");
			
			var options = {};
			options.host = host;
			options.path = path;
			
			var request = http.request(options, function(response) {
				console.log('Ping OK.');
			});
			
			request.end();
		}
		
		var rule = new schedule.RecurrenceRule();
		rule.minute = [0,15,30,45];
		rule.minute = new schedule.Range(0, 59, 1);
		
		schedule.scheduleJob(rule, function() {
			ping();	
		});
	}
	

	init();

};


