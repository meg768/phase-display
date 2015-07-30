
var app      = require('express')();
var server   = require('http').Server(app);
var schedule = require('node-schedule');

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
	
	var latestQuote = undefined;
	
	var config = {
	
		'rates' : [
			{ 'name':'USD/SEK', 'symbol':'USDSEK' },
			{ 'name':'EUR/SEK', 'symbol':'EURSEK' }
		],
		
		'quotes' : [
			{ 'name':'Phase',  'symbol':'PHI.ST' }
		]
	};
	
	var Finance = require('./modules/finance');
	var finance = new Finance(config);

	function scheduleQuotes() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(0, 59, 2);
		rule.hour   = new schedule.Range(7, 23);
	
		finance.fetchQuotes();
		
		var job = schedule.scheduleJob(rule, function() {
			finance.fetchQuotes();
		});
		
	}
	
	function scheduleRates() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(0, 59, 13);
		rule.hour   = new schedule.Range(7, 23);
	
		var job = schedule.scheduleJob(rule, function() {
			finance.fetchRates();
		});
		
	}

	function scheduleDisplayQuotes() {
		var rule    = new schedule.RecurrenceRule();
		rule.hour   = new schedule.Range(7, 23, 1);
		rule.second = new schedule.Range(0, 59, 10);
		
		schedule.scheduleJob(rule, function() {
			display.image('images/phiab-logo.png', {priority:'low'});
	
			if (latestQuote != undefined) {
				var options = {};
				options.color    = latestQuote.change >= 0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)';
				options.font     = 'Century-Gothic-Bold-Italic';
				options.priority = 'low';
				
				if (latestQuote.change >= 0)
					display.text(sprintf('%s %.2f (+%.2f) %d', latestQuote.name, latestQuote.price, latestQuote.change, latestQuote.volume), options);
				else
					display.text(sprintf('%s %.2f (%0.2f) %d', latestQuote.name, latestQuote.price, latestQuote.change, latestQuote.volume), options);
				
			}
			display.send();
		});			
		
	}	

	finance.on('quote', function(name, symbol, price, change, volume) {
		latestQuote = {
			name:name,
			symbol:symbol,
			price:price,
			volume:volume,
			change:change
		}
	});

	finance.on('rate', function(name, symbol, value) {
		display.text(sprintf('%s %.2f', name, value), {color:'rgb(0,0,255)'});
	});

	scheduleQuotes();
	scheduleRates();
	scheduleDisplayQuotes();

}

function enableMail() {
	
	var Mail = require('./modules/mail.js');
	
	new Mail('phaseholographic@gmail.com', 'P0tatismos');
	
}

function enableWeather() {
	var Weather = require('./modules/weather');
	var weather = new Weather();
	
	weather.on('forecast', function(item) {
		display.text(sprintf('%s -  %s %d°C(%d°C)', item.day, item.condition, item.high, item.low),{color:'blue'});
	});
	
}

function enableRSS() {

	var RSS = require('./modules/rss');
	var rss = new RSS();

	rss.on('feed', function(name, date, category, text) {
		display.text(sprintf('%s - %s - %s', name, category, text));
	});
}


function enableIdle() {
	var rule    = new schedule.RecurrenceRule();
	rule.hour   = new schedule.Range(7, 23, 1);
	rule.second = new schedule.Range(0, 59, 10);
	
	schedule.scheduleJob(rule, function() {
		display.image('images/phiab-logo.png', {priority:'low'});
	});	
}



//enableRSS();
enableFinance();
//enablePing();
//enableWeather();
//enableMail();
//enableIdle();

console.log('OK!');


