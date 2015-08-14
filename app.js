
var app      = require('express')();
var server   = require('http').Server(app);
var schedule = require('node-schedule');

var config   = require('./config');
var sprintf  = require('./common/sprintf.js');
var matrix   = require('./common/matrix.js');


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

//////////////////////////////////////////////////////////////////////////////////////////

// Make sure Heroku doesn't put our process to sleep...
function enablePing() {

	var config = {
		host: 'phi-display.herokuapp.com',
		path: '/',
		schedule: {
			hour   : new schedule.Range(10, 23),
			minute : new schedule.Range(0, 59, 15)
		}
	};
	
	var Ping = require('./modules/ping.js');
	var ping = new Ping(config);
}


//////////////////////////////////////////////////////////////////////////////////////////

function enableQuotes() {
	
	
	var config = {
		'schedule': {
			'hour'   : new schedule.Range(9, 23, 1),
			'minute' : new schedule.Range(0, 59, 1),
			'second' : new schedule.Range(0, 59, 15)
		},
		'quotes' : [
			{ 'name':'Phase', 'symbol':'PHI.ST', 'logo' : 'images/phiab-logo.png' }

		],
		
		'font' : {
			'name': 'Century-Gothic-Bold-Italic',
			'size': 26
		},
		
		'colors':  {
			'plus'    : 'rgb(0, 255, 0)',
			'minus'   : 'rgb(255, 0, 0)',
			'volume'  : 'rgb(0, 0, 255)'
		}
	};
	
	var Quotes = require('./modules/quotes.js');
	var quotes = new Quotes(config);

	quotes.on('quotes', function(data) {
		var display = new matrix.Display();

		data.forEach(function(quote) {
			var options = {};
			options.font     = config.font.name; //'Century-Gothic-Bold-Italic';
			options.size     = config.font.size; //26;
			
			if (quote.logo != undefined)
				display.image(quote.logo);
			else
				display.text(quote.name, options);

			options.color = config.colors.currency;
			display.text(sprintf('%.2f', quote.price), options);

			options.color = quote.change >= 0 ? config.colors.plus : config.colors.minus;
			display.text(sprintf('%s%.1f%%', quote.change >= 0 ? '+' : '', quote.change), options)

			options.color = config.colors.volume;
			display.text(sprintf('%.1f MSEK', (quote.volume * quote.price) / 1000000.0), options);
			
		});
			
		display.send({priority:'low'});
		
		
	});

}
//////////////////////////////////////////////////////////////////////////////////////////

function enableRates() {
	
	
	var config = {
		'schedule': {
			'hour'   : new schedule.Range(9, 23),
			'minute' : new schedule.Range(0, 59, 10),
		},
	
		'rates' : [
			{ 'name':'USD/SEK', 'symbol':'USDSEK' },
			{ 'name':'EUR/SEK', 'symbol':'EURSEK' }
		],
		
		'font' : {
			'name'  : 'Century-Gothic-Bold-Italic',
			'size'  : 26,
			'color' : 'white'
		}
	
	};
	
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


//////////////////////////////////////////////////////////////////////////////////////////

function enableMail() {
	
	var config = {
		email    : 'phiab.display@gmail.com',
		password : 'P0tatismos'
		
	};
	
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

//////////////////////////////////////////////////////////////////////////////////////////

function enableWeather() {

	var config = {
		schedule: {
			hour:   new schedule.Range(8, 21),
			minute: [0, 15, 30, 45]
		}
	};
	
	var Weather = require('./modules/weather');
	var weather = new Weather(config);
	
	weather.on('forecast', function(item) {
		var display = new matrix.Display();
		display.text(item.day, {color:'white'});
		display.text(sprintf('%s %d° (%d°)', item.condition, item.high, item.low),{color:'blue'});
		display.send();
	});
	
}

//////////////////////////////////////////////////////////////////////////////////////////

function enableRSS() {

	var config = {
		feeds: [
			{name: 'SvD',    url: 'http://www.svd.se/?service=rss&type=senastenytt'}, 
			{name: 'SDS',    url: 'http://www.sydsvenskan.se/rss.xml'}, 
			{name: 'Di',     url: 'http://www.di.se/rss'}, 
			{name: 'Google', url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss'}
		],
		schedule: {
			hour:   new schedule.Range(8, 21),
			minute: new schedule.Range(0, 59, 20)
		}

	};

	var RSS = require('./modules/rss');
	var rss = new RSS(config);

	rss.on('feed', function(rss) {
		matrix.text(sprintf('%s - %s - %s', rss.name, rss.category, rss.text));
	});
}

//////////////////////////////////////////////////////////////////////////////////////////



enableWeather();
enableQuotes();
enableRates();
enableMail();
enablePing();
enableRSS();


console.log('OK!');


