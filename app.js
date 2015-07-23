
var app      = require('express')();
var server   = require('http').Server(app);
var schedule = require('node-schedule');

var config   = require('./config');
var random   = require('./common/random');
var sprintf  = require('./common/sprintf');
var display  = require('./common/display.js');

process.env.TZ = config.timezone;

server.listen(process.env.PORT || 5000);
display.init(server);

app.get('/', function (req, response) {
	response.send("OK");
});



function enablePing() {

	var Ping = require('./modules/ping.js');

	var ping = new Ping('phi-display.herokuapp.com');
	/*
	var http = require('http');
	var schedule = require('node-schedule');

	function ping() {
	
		console.log("Pinging...");
		
		var options = {};
		options.host = "phi-display.herokuapp.com";
		options.path = "/";
		
		var request = http.request(options, function(response) {
			console.log('Ping OK.');
		});
		
		request.end();
	}
	
	var rule = new schedule.RecurrenceRule();
	rule.minute = [0,15,30,45];
	
	schedule.scheduleJob(rule, function() {
		ping();	
	});
	*/
}


function enableFinance() {
	
	var Finance = require('./modules/finance');
	var finance = new Finance();
	
	finance.on('quote', function(name, symbol, change) {
		if (change >= 0)
			display.text(sprintf('%s +%.2f', name, change), 'blue');
		else
			display.text(sprintf('%s %0.2f', name, change), 'red');
	});

	finance.on('rate', function(name, symbol, value) {
		display.text(sprintf('%s %.2f', name, value), 'green');
	});
		
}


function enableMail() {
	
	var Mail = require('./modules/mail.js');
	
	new Mail('phaseholographic@gmail.com', 'P0tatismos');
	new Mail('magnus.egelberg@gmail.com', 'P0tatismos');
	//new Mail('magnus@egelberg.se', 'P0tatismos', 'pop3.egelberg.se', 110);
	
}



function enableWeather() {
	var Weather = require('./modules/weather');
	var weather = new Weather();
	
	weather.on('forecast', function(item) {
		display.text(sprintf('%s -  %s %d°C(%d°C)', item.day, item.condition, item.high, item.low), 'blue');
	});
	
}


function enableRSS() {

	var RSS = require('./modules/rss');
	var rss = new RSS();

	rss.on('feed', function(name, date, category, text) {
		display.text(sprintf('%s - %s - %s', name, category, text));
	});
}


//enableRSS();
//enableFinance();
enablePing();
//enableWeather();
//enableMail();

console.log('OK!');


