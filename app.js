
var app      = require('express')();
var server   = require('http').Server(app);
var schedule = require('node-schedule');

var sprintf  = require('./common/sprintf.js');
var matrix   = require('./common/matrix.js');



//////////////////////////////////////////////////////////////////////////////////////////

// Make sure Heroku doesn't put our process to sleep...
function runPing(config) {

	if (config.enabled) {
		var Ping = require('./modules/ping.js');
		var ping = new Ping(config);
		
	}	
}


//////////////////////////////////////////////////////////////////////////////////////////

function runQuotes(config) {
	
	
	if (config.enabled) {
		var Quotes = require('./modules/quotes.js');
		var quotes = new Quotes(config);
	
		quotes.on('quotes', function(data) {
			var display = new matrix.Display();
	
			data.forEach(function(quote) {
				var options = {};
				options.font = config.font.name;
				options.size = config.font.size;
				
				if (quote.logo != undefined)
					display.image(quote.logo);
				else
					display.text(quote.name, options);
	
				options.color = config.colors.price;
				display.text(sprintf('%.2f', quote.price), options);
	
				options.color = quote.change >= 0 ? config.colors.plus : config.colors.minus;
				display.text(sprintf('%s%.1f%%', quote.change >= 0 ? '+' : '', quote.change), options)
	
				options.color = config.colors.volume;
				display.text(sprintf('%.1f MSEK', (quote.volume * quote.price) / 1000000.0), options);
				
			});
				
			display.send({priority:'low'});
			
			
		});
		
	}

}
//////////////////////////////////////////////////////////////////////////////////////////

function runRates(config) {
	

	if (config.enabled) {
		var Rates = require('./modules/rates.js');
		var rates = new Rates(config);
	
		rates.on('rates', function(data) {
			var display = new matrix.Display();
	
			var options = {};
			options.font     = config.font.name;
			options.size     = config.font.size;
			options.color    = config.font.color;
	
			data.forEach(function(rate) {
				display.text(sprintf('%s %.2f', rate.name, rate.value), options);			
			});
	
			display.send();
			
		});
		
	}


}


//////////////////////////////////////////////////////////////////////////////////////////

function runMail(config) {
	
	if (config.enabled) {
		var Mail = require('./modules/mail.js');	
		var mail = new Mail(config);
		
		mail.on('mail', function(mail) {
			if (mail.text == undefined)
				mail.text = '';
				
			if (mail.subject == undefined)
				mail.subject = '';
				
			if (mail.headers && mail.headers['x-priority'] == 'high')
				matrix.play('beep.mp3');
		
			matrix.text(mail.subject + '\n' + mail.text);		
		});
		
	}
}

//////////////////////////////////////////////////////////////////////////////////////////

function runWeather(config) {


	if (config.enabled) {
		var Weather = require('./modules/weather.js');
		var weather = new Weather(config);
		
		weather.on('forecast', function(item) {
			var display = new matrix.Display();
			display.text(item.day, {color:'white'});
			display.text(sprintf('%s %d° (%d°)', item.condition, item.high, item.low),{color:'blue'});
			display.send();
		});
		
	}	
	
}


//////////////////////////////////////////////////////////////////////////////////////////

function runClock(config) {

	if (config.enabled) {
		var Clock = require('./modules/clock.js');
		var clock = new Clock(config);
		
		clock.on('time', function(date) {
			var display = new matrix.Display();
			display.text(sprintf('%02d:%02d', date.getHours(), date.getMinutes()), {color:'random'});
			display.send({priority:'low'});
		});
		
	}
	
}

//////////////////////////////////////////////////////////////////////////////////////////

function runRSS(config) {

	if (config.enabled) {
		var RSS = require('./modules/rss.js');
		var rss = new RSS(config);
	
		rss.on('feed', function(rss) {
			matrix.text(sprintf('%s - %s - %s', rss.name, rss.category, rss.text));
		});
		
	}

}

//////////////////////////////////////////////////////////////////////////////////////////

function run() {
	var config = require('./config');
	
	// Set the time zone according to config settings
	process.env.TZ = config.timezone;
	
	// Listen on port 5000
	server.listen(process.env.PORT || 5000);
	
	// We need to initialize the display...
	matrix.init(server);
	
	// Any request at the root level will return OK
	app.get('/', function (req, response) {
		response.send("OK");
	});
	

	runClock(config.clock);
	runWeather(config.weather);
	runQuotes(config.quotes);
	runRates(config.rates);
	runMail(config.email);
	runPing(config.ping);
	runRSS(config.rss);

	console.log('Ready!');

}

run();


