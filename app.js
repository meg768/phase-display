
var app      = require('express')();
var server   = require('http').Server(app);

var config   = require('./config');
var sprintf  = require('./common/sprintf');
var display  = require('./common/display.js');


// Set the time zone according to config settings
process.env.TZ = config.timezone;

// Listen on port 5000
server.listen(process.env.PORT || 5000);


// We need to initialize the display...
display.init(server);

// Any request at the root level will return OK
app.get('/', function (req, response) {
	response.send("OK");
});

// Make sure Heroku doesn't put our process to sleep...
function enablePing() {

	var Ping = require('./modules/ping.js');
	var ping = new Ping('phi-display.herokuapp.com');
}


function enableFinance() {
	
	var Finance = require('./modules/finance');
	var finance = new Finance();
	
	finance.on('quote', function(name, symbol, price, change, volume) {
		if (change >= 0)
			display.text(sprintf('%s %.2f (+%.2f) %d', name, price, change, volume), 'blue');
		else
			display.text(sprintf('%s %.2f (%0.2f) %d', name, price, change, volume), 'red');
	});

	finance.on('rate', function(name, symbol, value) {
		display.text(sprintf('%s %.2f', name, value), 'magenta');
	});
		
}

function enableMail() {
	
	var Mail = require('./modules/mail.js');
	
	new Mail('phaseholographic@gmail.com', 'P0tatismos');
//	new Mail('magnus.egelberg@gmail.com', 'P0tatismos');
	
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


enableRSS();
enableFinance();
enablePing();
enableWeather();
enableMail();

console.log('OK!');


