
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var schedule = require('node-schedule');
var config = require('./config');
var random = require('./random');
var sprintf = require('./sprintf');

process.env.TZ = config.timezone;

server.listen(port);


app.get('/', function (req, response) {
	response.send("OK");
});



function sendText(text, color) {
	
	if (color == undefined)
		color = 'red';
	
	var msg = {};
	
	msg.command   = 'python';
	msg.args      = ['run-text.py', '-t', text];
	msg.options   = {cwd: 'python'};
	msg.textcolor = color;

	console.log('Spawning', msg); 
	io.sockets.emit('spawn', msg);
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




function enablePing() {
	var http = require('http');
	var schedule = require('node-schedule');

	function ping() {
	
		console.log("Pinging...");
		
		var options = {};
		options.host = "akuru.herokuapp.com";
		options.path = "/";
		
		var request = http.request(options, function(response) {
			
		});
		
		request.end();
	}
	
	var rule = new schedule.RecurrenceRule();
	rule.minute = [0,15,30,45];
	
	schedule.scheduleJob(rule, function() {
		ping();	
	});
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


function enableRSS() {

	var RSS = require('./rss');
	var rss = new RSS();

	rss.subscribe('SvD', 'http://www.svd.se/?service=rss&type=senastenytt');
	rss.subscribe('SDS', 'http://www.sydsvenskan.se/rss.xml');
	rss.subscribe('Di', 'http://www.di.se/rss');
	rss.subscribe('Google', 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss');
	
	rss.on('feed', function(name, date, category, text) {
		console.log('FEED', name, date, category, text);

		sendText(sprintf('%s - %s - %s', name, category, text));
	});
}


io.on('connection', function (socket) {

	var now = new Date();
	sendText(sprintf("Klockan är %02d:%02d", now.getHours(), now.getMinutes()));
});






enableRSS();
enableFinance();
enablePing();
enableWeather();


