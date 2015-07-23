
var display = require('../common/display.js');
var sprintf = require('../common/sprintf.js');

module.exports = function(email, password, host, port) {

	if (host == undefined)
		host = 'imap.gmail.com';
	
	
	if (port == undefined)
		port = 993;	

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
	
		display.text(mail.subject + '\n' + mail.text);

	}
	

	function init() {
		var MailListener = require("mail-listener2");

		var listener = new MailListener({
			username: email,
			password: password,
			host: host,
			port: port, 
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
			display.text(sprintf('Listening for incoming mail for %s...', email), 'green');
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
		
	}

	init();

};


