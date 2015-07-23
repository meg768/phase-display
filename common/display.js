

var _io = null;


module.exports.text = function(text, color) {
	
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
	_io.sockets.emit('spawn', msg);
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

