
var matrix  = require('../common/matrix.js');
var sprintf = require('../common/sprintf.js');
var events  = require('events');
var util    = require('util');



var Mail = module.exports = function(config) {


	var self = this;
	
	if (config == undefined)
		config = {};

	if (config.host == undefined)
		config.host = 'imap.gmail.com';
	
	if (config.port == undefined)
		config.port = 993;	

	function processMail(mail) {
	
		var command = undefined;
		var args    = [];
		var options = undefined;
		var display = new matrix.Display();
		
		console.log(mail);
		
		if (mail.text == undefined)
			mail.text = '';
			
		if (mail.subject == undefined)
			mail.subject = '';
			
		if (mail.headers && mail.headers['x-priority'] == 'high')
			display.beep();
	
		display.text(mail.subject + '\n' + mail.text);
		display.send();
	}
	

	function init() {
		var MailListener = require("mail-listener2");

		var listener = new MailListener({
			username: config.email,
			password: config.password,
			host: config.host,
			port: config.port, 
			tls: true,
			tlsOptions: { rejectUnauthorized: false },
			mailbox: "INBOX", // mailbox to monitor 
			//searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved 
			markSeen: true, // all fetched email willbe marked as seen and not fetched next time 
			fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`, 
			mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib. 
			attachments: true, // download attachments as they are encountered to the project directory 
			attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments 
		});
		 
		listener.start();
		 
		listener.on("server:connected", function() {
			console.log('Mail connected...');
		});
		 
		listener.on("server:disconnected", function(){
			console.log('Mail disconnected...');
		});
		 
		listener.on("error", function(err){
			console.log('Mail error', err);
		});
		 
		listener.on("mail", function(mail, seqno, attributes){
			console.log('Incoming mail...');
			self.emit('mail', mail);
		});
		 
		listener.on("attachment", function(attachment) {
		});
		
	}

	init();

};


util.inherits(module.exports, events.EventEmitter);
