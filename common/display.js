var sprintf = require('./sprintf');


var _io = null;
var _messages = [];

function translateColor(color) {
	
	
	var colors = [];
	
	if (color == undefined || color == 'random') {
		
	} 
	
	return color;
}


module.exports.send = function() {
	
	if (_messages.length > 0) {
		console.log('Sending!!', _messages);
		_io.sockets.emit('spawn', _messages);
		
	}
	
	
	_messages = [];
	
}

module.exports.text = function(text, options) {

	text = text.replace(/(\r\n|\n|\r)/gm, '\n');
	text = text.replace('\t',' ');
	
	var texts = text.split('\n');
	
	for (var i in texts) {
		var text = texts[i].trim();
		 
		if (text.length > 0) {
			var msg = {};
			
			msg.command   = 'python';
			msg.args      = ['run-text.py', '-t', text];
			msg.options   = {cwd: 'python'};

			if (typeof options == 'object') {
				if (typeof options.color == 'string') {
					msg.args.push('-c');
					msg.args.push(options.color);
				}
				
				if (typeof options.font == 'string') {
					msg.args.push('-f');
					msg.args.push(options.font);
				}

				if (typeof options.priority == 'string')
					msg.priority = options.priority;
			}
		
			_messages.push(msg);
			//console.log('Spawning', msg); 
			//_io.sockets.emit('spawn', msg);
			
			
		}
	}
	
}


module.exports.image = function(image, options) {
	
	var msg = {};
	
	msg.command   = 'python';
	msg.args      = ['run-image.py', '-i', image];
	msg.options   = {cwd: 'python'};

	if (typeof options == 'object') {
		if (typeof options.priority == 'string')
			msg.priority = options.priority;
		
	}
	
	_messages.push(msg);	
	//console.log('Spawning', msg); 
	//_io.sockets.emit('spawn', msg);
}

	
module.exports.beep = function() {
	
	var msg = {};
	
	msg.command   = 'omxplayer';
	msg.args      = ['--no-keys', '--no-osd', 'audio/beep3.mp3'];
	msg.options   = {cwd: 'python'};

	console.log('Spawning', msg); 
	_io.sockets.emit('spawn', msg);
}


module.exports.init = function(server) {

	_io = require('socket.io')(server);
	
	_io.on('connection', function (socket) {
	
		var now = new Date();
		
		module.exports.image('images/phiab-logo.png');
		module.exports.text(sprintf("%02d:%02d", now.getHours(), now.getMinutes()));
	});
	
}

