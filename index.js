



var sprintf = require('./sprintf.js');
var random   = require('./random.js');

var mailer = new (require('./mailer.js'))();
mailer.sendText(sprintf('Hej %s', 'X'), 'blue');

function enableRSS() {

	var RSS = require('./rss.js');
	var rss = new RSS();

	rss.on('feed', function(name, date, category, text) {
		console.log('FEED', name, date, category, text);

		mailer.sendText(sprintf('%s - %s - %s', name, category, text));
	});
}


function enableFinance() {
	
	var Finance = require('./finance.js');
	var finance = new Finance();
	
	
	finance.on('quote', function(name, symbol, change) {
		if (change >= 0)
			mailer.sendText(sprintf('%s +%.2f', name, change), 'rgb(0,255,0)');
		else
			mailer.sendText(sprintf('%s %0.2f', name, change), 'rgb(255,0,0)');
	});

	finance.on('rate', function(name, symbol, value) {
		mailer.sendText(sprintf('%s %.2f', name, value), 'blue');
	});
}


function enableWeather() {
	var Weather = require('./weather');
	var weather = new Weather();
	
	weather.on('forecast', function(item) {
		mailer.sendText(sprintf('%s -  %s %d°C(%d°C)', item.day, item.condition, item.high, item.low), 'blue');
	});
	
	
}



//enableRSS();
//enableFinance();
//enableWeather();


console.log(sprintf('Ready!'));
mailer.sendText('kalle', 'blue');

