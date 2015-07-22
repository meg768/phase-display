
var app = require('express')();
var sprintf = require('./sprintf');
var config = require('./config');
var display = require('./display');


function sendText(text, color) {
	console.log(text, color);
}


function enableWeather() {
	var Weather = require('./weather');
	var query = new Weather();
	
	query.on('forecast', function(item) {
		sendText(sprintf('%s -  %s %d°C(%d°C)', item.day, item.condition, item.high, item.low), 'blue');
	});
	
	query.fetch();
	query.schedule();
	
}

function enableFinance() {
	
	var Finance = require('./finance');
	var query = new Finance();
	
	query.on('quote', function(name, symbol, change) {
		if (change >= 0)
			sendText(sprintf('%s +%.2f', name, change), 'blue');
		else
			sendText(sprintf('%s %0.2f', name, change), 'red');
	});

	query.on('rate', function(name, symbol, value) {
		sendText(sprintf('%s %.2f', name, value), 'white');
	});
		
	query.schedule();
	query.fetch();
}


function enableRSS() {

	var RSS = require('./rss');
	var rss = new RSS();

	rss.subscribe('SvD', 'http://www.svd.se/?service=rss&type=latest');
	rss.subscribe('SDS', 'http://www.sydsvenskan.se/rss.xml');
	rss.subscribe('Di', 'http://www.di.se/rss');
	rss.subscribe('Google', 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss');
	
	rss.on('feed', function(name, date, category, text) {
		console.log('FEED', name, date, category, text);

		sendText(sprintf('%s - %s - %s', name, category, text));
	});
}


enableWeather();