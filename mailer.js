var nodemailer = require('nodemailer');
var random     = require('./random.js');


console.log('Creatring transport');
 
var _counter = 0;
var _transport = null;

function getTransport() {

	if (_counter++ > 100) {
		_counter = 0;
		_transport = null;
	}	

	if (_transport == null) {
		_transport = nodemailer.createTransport({
		    service: 'gmail',
		    auth: {
		        user: 'phaseholographic@gmail.com',
		        pass: 'P0tatismos'
		    }
		});
	}

	return _transport;
}

module.exports = function() {

	var self = this;
	
	self.sendMail = function(subject, text) {
		var transport = getTransport();
		
		var options = {
		    from: 'phaseholographic@gmail.com',
		    to: 'phaseholographic@gmail.com',
		    subject: subject,
		    text: text
		};
		
		transport.sendMail(options, function(error, info){
		    if (error){
		        return console.log(error);
		    }
		    console.log('Message sent: ' + info.response);
		}); 

		
	}	

	self.sendJSON = function(json) {
		self.sendMail('JSON', JSON.stringify(json));
	}	

	self.sendText = function(text, color) {

		var json = {};
		json.command = 'python';
		json.args = ['run-text.py', '-t', text]
		json.options = {cwd: 'python'};
		
		if (color != undefined) {
			json.args.push('-c');
			json.args.push(color)
		}
		
		self.sendJSON(json);
		
	}	


}


