
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

	if (typeof color == 'string') {
		msg.args.push('-c');
		msg.args.push(color);
	}

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
		options.host = "phi-display.herokuapp.com";
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


function processMail(mail) {

	var command = undefined;
	var args    = [];
	var options = undefined;

	if (mail.text == undefined)
		mail.text = '';
		
	if (mail.subject == undefined)
		mail.subject = '';
		
	{
		{
			var text = mail.subject;
			
			if (mail.text.length > 0) {
				if (text.length > 0)
					text += ' - ';

				text += mail.text;
			}

			text = text.replace(/(\r\n|\n|\r)/gm,' ').trim();	

			if (text.length > 0) {
				sendText(text, 'red');
			}
		}
		
	}
	
/*
	if (typeof mail.attachments == 'object') {
	
		for (var i in mail.attachments) {
			var attachment = mail.attachments[i];
			
			if (typeof attachment.path == 'string' && typeof attachment.contentType == 'string' && attachment.contentType == 'image/png') {
				command = 'python';
				args    = ['run-image.py', '-i', attachment.path];
				options = {cwd: 'python'};
				
				io.sockets.emit('spawn', {command:command, args:args, options:options});
				
			} 
		}
		
	}
*/
}


function enableListener() {
	var MailListener = require("mail-listener2");

	var listener = new MailListener({
	  username: "phaseholographic@gmail.com",
	  password: "P0tatismos",
	  host: "imap.gmail.com",
	  port: 993, // imap port 
	  tls: true,
	  tlsOptions: { rejectUnauthorized: false },
	  mailbox: "INBOX", // mailbox to monitor 
	  //searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved 
	  markSeen: true, // all fetched email willbe marked as seen and not fetched next time 
	  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`, 
	  mailParserOptions: {streamAttachments: false}, // options to be passed to mailParser lib. 
	  attachments: true, // download attachments as they are encountered to the project directory 
	  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments 
	});
	 
	listener.start();
	 
	listener.on("server:connected", function(){
		processMail({subject: 'phaseholographic@gmail.com connected', text: ''});
	});
	 
	listener.on("server:disconnected", function(){
	});
	 
	listener.on("error", function(err){
		console.log(err);
	});
	 
	listener.on("mail", function(mail, seqno, attributes){
		processMail(mail);
	});
	 
	listener.on("attachment", function(attachment) {
	});
	
	return listener;
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
enableListener();


