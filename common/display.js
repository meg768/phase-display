var sprintf = require('./sprintf');


var _io = null;


function translateColor(color) {
	
	
	var colors = [];
	
	if (color == undefined || color == 'random') {
		
	} 
	
	return color;
}


module.exports.text = function(text, color) {

	if (color == undefined)
		color = 'red';
	
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
		
			if (typeof color == 'string') {
				msg.args.push('-c');
				msg.args.push(color);
			}
		
			console.log('Spawning', msg); 
			_io.sockets.emit('spawn', msg);
			
			
		}
	}
	
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
		module.exports.text(sprintf("%02d:%02d", now.getHours(), now.getMinutes()));
	});
	
}

