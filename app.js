
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
	//new Mail('phaseholographic@gmail.com', 'P0tatismos');
	
}



function enableWeather() {
	var Weather = require('./modules/weather');
	var weather = new Weather();
	
	weather.on('forecast', function(item) {
		display.text(sprintf('%s -  %s %d°C(%d°C)', item.day, item.condition, item.high, item.low), 'blue');
	});
	
}
/*

function processMail(mail) {

	var command = undefined;
	var args    = [];
	var options = undefined;

	console.log(mail);
	
	if (mail.text == undefined)
		mail.text = '';
		
	if (mail.subject == undefined)
		mail.subject = '';
		
	if (mail.headers && mail.headers['x-priority'] == 'high')
		display.beep();

	var text = mail.subject + '\n' + mail.text;
	
	text = text.replace(/(\r\n|\n|\r)/gm, '\n');
	text = text.replace('\t',' ');
	
	var texts = text.split('\n');
	
	for (var i in texts) {
		var text = texts[i].trim();
		 
		if (text.length > 0)
			display.text(text, 'red');							
	}
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
*/

function enableRSS() {

	var RSS = require('./modules/rss');
	var rss = new RSS();

	rss.on('feed', function(name, date, category, text) {
		display.text(sprintf('%s - %s - %s', name, category, text));
	});
}


//enableRSS();
//enableFinance();
//enablePing();
//enableWeather();
enableMail();

console.log('OK!');


