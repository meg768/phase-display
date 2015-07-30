var sprintf = require('./sprintf');
var io = null;


var Display = module.exports = {};


Display.init = function(server) {

	io = require('socket.io')(server);
	
	io.on('connection', function (socket) {
	
		var now = new Date();
		
		Display.image('images/phiab-logo.png');
		Display.text(sprintf("%02d:%02d", now.getHours(), now.getMinutes()));
	});
	
}

Display.Batch = function() {

	var self = this;
	var messages = [];
	
	self.send = function() {
		
		if (messages.length > 0) {
			console.log('Sending!!', messages);
			io.sockets.emit('spawn', messages);
			
		}
		
		messages = [];
		
	}

	self.image = function(image, options) {
		
		var msg = {};
		
		msg.command   = 'python';
		msg.args      = ['run-image.py', '-i', image];
		msg.options   = {cwd: 'python'};
	
		if (typeof options == 'object') {
			if (typeof options.priority == 'string')
				msg.priority = options.priority;
			
		}
		
		messages.push(msg);	
	}
	

	self.text = function(text, options) {
	
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
	
					if (typeof options.size == 'number' || typeof options.size == 'string') {
						msg.args.push('-s');
						msg.args.push(sprintf('%s', parseInt(options.size)));
					}
	
					if (typeof options.priority == 'string')
						msg.priority = options.priority;
				}
			
				messages.push(msg);
			}
		}
		
	}
		
	self.play = function(sound, options) {
		
		var msg = {};
		
		msg.command   = 'omxplayer';
		msg.args      = ['--no-keys', '--no-osd', 'audio/' + sound];
		msg.options   = {cwd: 'python'};

		if (typeof options == 'object') {
			if (typeof options.priority == 'string')
				msg.priority = options.priority;
		}
		messages.push(msg);
	}
	
	
}





Display.play = function(sound, options) {

	var batch = new Display.Batch();
	batch.play(sound, options);
	batch.send();
}

Display.text = function(text, options) {

	var batch = new Display.Batch();
	batch.text(text, options);
	batch.send();
}


Display.image = function(image, options) {

	var batch = new Display.Batch();
	batch.image(image, options);
	batch.send();
}
